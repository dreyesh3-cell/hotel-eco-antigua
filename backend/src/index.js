import { getDb } from "../db.js";
import { canCancelReservation, calculateAvailability, isIsoDate, makeConfirmationCode, nightsBetween, normalizeEmail, ROOM_TYPES, validateBooking } from "../domain.js";

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

function reservationView(row) {
  const room = ROOM_TYPES.find((item) => item.id === row.room_type);
  return {
    id: row.id,
    confirmationCode: row.confirmation_code,
    guestName: row.guest_name,
    roomType: room?.name ?? row.room_type,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    total: row.total,
    status: row.status,
  };
}

async function availability(request, env) {
  const url = new URL(request.url);
  const checkIn = url.searchParams.get("checkIn") ?? "";
  const checkOut = url.searchParams.get("checkOut") ?? "";
  const guests = Number(url.searchParams.get("guests") ?? "2");
  const nights = nightsBetween(checkIn, checkOut);
  const today = new Date().toISOString().slice(0, 10);
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return json({ error: "Elige fechas válidas." }, 400);
  if (checkIn < today) return json({ error: "La llegada no puede estar en el pasado." }, 400);
  if (!Number.isInteger(nights) || nights < 1 || nights > 30) return json({ error: "La estancia debe ser de 1 a 30 noches." }, 400);
  if (!Number.isInteger(guests) || guests < 1 || guests > 5) return json({ error: "El grupo debe tener de 1 a 5 huéspedes." }, 400);

  const database = getDb(env);
  const { results = [] } = await database.prepare(`
    SELECT room_type, check_in, check_out, status FROM reservations
    WHERE status IN ('PENDIENTE', 'CONFIRMADA') AND check_in < ? AND check_out > ?
  `).bind(checkOut, checkIn).all();
  const rooms = ROOM_TYPES.filter((room) => room.capacity >= guests).map((room) => {
    const rows = results.filter((item) => item.room_type === room.id).map((item) => ({ status: item.status, checkIn: item.check_in, checkOut: item.check_out }));
    return calculateAvailability(room, rows, checkIn, checkOut, guests);
  });
  return json({ rooms, checkIn, checkOut, guests, nights });
}

async function createReservation(request, env) {
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") return json({ error: "Revisa los datos de la reserva." }, 400);
  const result = validateBooking(input);
  if (!result.valid) return json({ error: "Revisa los datos marcados.", fields: result.errors }, 400);

  const { clean } = result;
  const confirmationCode = makeConfirmationCode();
  const reservationId = crypto.randomUUID();
  const created = await getDb(env).prepare(`
    INSERT INTO reservations (id, confirmation_code, guest_name, guest_email, guest_phone, room_type, check_in, check_out, guests, total, status, created_at)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMADA', CURRENT_TIMESTAMP
    WHERE (SELECT COUNT(*) FROM reservations
      WHERE room_type = ? AND status IN ('PENDIENTE', 'CONFIRMADA') AND check_in < ? AND check_out > ?) < ?
  `).bind(reservationId, confirmationCode, clean.guestName, clean.guestEmail, clean.guestPhone, clean.roomType, clean.checkIn, clean.checkOut, clean.guests, clean.total, clean.roomType, clean.checkOut, clean.checkIn, clean.room.inventory).run();
  if (created.meta.changes !== 1) return json({ error: "Esa habitación acaba de agotarse para tus fechas. Vuelve a consultar disponibilidad." }, 409);
  return json({ reservation: { id: reservationId, confirmationCode, guestName: clean.guestName, roomType: clean.room.name, checkIn: clean.checkIn, checkOut: clean.checkOut, guests: clean.guests, total: clean.total, status: "CONFIRMADA" } }, 201);
}

function lookupParameters(url) {
  const code = (url.searchParams.get("code") ?? "").trim().toUpperCase();
  const email = normalizeEmail(url.searchParams.get("email"));
  return { code, email, valid: /^[A-HJ-NP-Z2-9]{8}$/.test(code) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) };
}

async function getReservation(request, env) {
  const { code, email, valid } = lookupParameters(new URL(request.url));
  if (!valid) return json({ error: "Escribe el código de ocho caracteres y el correo de la reserva." }, 400);
  const row = await getDb(env).prepare("SELECT * FROM reservations WHERE confirmation_code = ? AND guest_email = ? LIMIT 1").bind(code, email).first();
  if (!row) return json({ error: "No encontramos una reserva con esos datos." }, 404);
  return json({ reservation: reservationView(row) });
}

async function cancelReservation(request, env) {
  const input = await request.json().catch(() => null);
  const code = typeof input?.code === "string" ? input.code.trim().toUpperCase() : "";
  const email = normalizeEmail(input?.email);
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Escribe el código y el correo de la reserva." }, 400);
  const database = getDb(env);
  const row = await database.prepare("SELECT * FROM reservations WHERE confirmation_code = ? AND guest_email = ? LIMIT 1").bind(code, email).first();
  if (!row) return json({ error: "No encontramos una reserva con esos datos." }, 404);
  if (!canCancelReservation({ status: row.status, checkIn: row.check_in })) {
    return json({ error: row.status === "CANCELADA" ? "Esta reserva ya está cancelada." : "La cancelación sin costo debe solicitarse al menos 48 horas antes de la llegada." }, 409);
  }
  const updated = await database.prepare("UPDATE reservations SET status = 'CANCELADA' WHERE id = ? AND status = 'CONFIRMADA'").bind(row.id).run();
  if (updated.meta.changes !== 1) return json({ error: "La reserva cambió mientras la consultabas. Vuelve a buscarla." }, 409);
  return getReservation(new Request(`https://local/api/reservations?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`), env);
}

async function handleApi(request, env) {
  const { pathname } = new URL(request.url);
  try {
    if (pathname === "/api/health" && request.method === "GET") {
      await getDb(env).prepare("SELECT 1 AS ok").first();
      return json({ ok: true, service: "hotel-eco-antigua-api", database: "connected" });
    }
    if (pathname === "/api/availability" && request.method === "GET") return await availability(request, env);
    if (pathname === "/api/reservations" && request.method === "POST") return await createReservation(request, env);
    if (pathname === "/api/reservations" && request.method === "GET") return await getReservation(request, env);
    if (pathname === "/api/reservations" && request.method === "PATCH") return await cancelReservation(request, env);
    if (pathname.startsWith("/api/")) return json({ error: "No se encontró la ruta o el método de API." }, 404);
    return null;
  } catch (error) {
    console.error("Fallo en la API de Hotel Eco Antigua", error);
    return json({ error: "El servicio de reservas no está disponible. Intenta de nuevo." }, 503);
  }
}

async function fetchStatic(request, env) {
  if (!env?.ASSETS) return new Response("Frontend no disponible.", { status: 503 });
  const direct = await env.ASSETS.fetch(request);
  if (direct.status !== 404 || request.method !== "GET") return direct;
  const url = new URL(request.url);
  if (pathHasExtension(url.pathname)) return direct;
  return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
}

function pathHasExtension(pathname) {
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return await handleApi(request, env);
    return await fetchStatic(request, env);
  },
};
