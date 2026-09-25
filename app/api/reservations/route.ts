import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getD1, getDb } from "@/db";
import { reservations } from "@/db/schema";
import { canCancelReservation, makeConfirmationCode, normalizeEmail, ROOM_TYPES, validateBooking } from "@/backend/domain";

function safeFailure(error: unknown) {
  console.error("Reservation request failed", error);
  return NextResponse.json({ error: "El servicio de reservas no está disponible. Intenta de nuevo." }, { status: 503 });
}

function shapeReservation(row: typeof reservations.$inferSelect) {
  const room = ROOM_TYPES.find((item) => item.id === row.roomType);
  return { id: row.id, confirmationCode: row.confirmationCode, guestName: row.guestName, roomType: room?.name ?? row.roomType, checkIn: row.checkIn, checkOut: row.checkOut, guests: row.guests, total: row.total, status: row.status };
}

export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") return NextResponse.json({ error: "Revisa los datos de la reserva." }, { status: 400 });
  const result = validateBooking(input);
  if (!result.valid) return NextResponse.json({ error: "Revisa los datos marcados.", fields: result.errors }, { status: 400 });

  try {
    const d1 = getD1();
    const { clean } = result;
    const reservationId = crypto.randomUUID();
    const confirmationCode = makeConfirmationCode();
    // Inventory check and insert share one SQLite statement, so simultaneous requests cannot oversell a room type.
    const inserted = await d1.prepare(`
      INSERT INTO reservations (id, confirmation_code, guest_name, guest_email, guest_phone, room_type, check_in, check_out, guests, total, status, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMADA', CURRENT_TIMESTAMP
      WHERE (SELECT COUNT(*) FROM reservations
        WHERE room_type = ? AND status IN ('PENDIENTE', 'CONFIRMADA') AND check_in < ? AND check_out > ?) < ?
    `).bind(reservationId, confirmationCode, clean.guestName, clean.guestEmail, clean.guestPhone, clean.roomType, clean.checkIn, clean.checkOut, clean.guests, clean.total, clean.roomType, clean.checkOut, clean.checkIn, clean.room.inventory).run();
    if (inserted.meta.changes !== 1) return NextResponse.json({ error: "Esa habitación acaba de agotarse para tus fechas. Vuelve a consultar disponibilidad." }, { status: 409 });
    return NextResponse.json({ reservation: { id: reservationId, confirmationCode, guestName: clean.guestName, roomType: clean.room.name, checkIn: clean.checkIn, checkOut: clean.checkOut, guests: clean.guests, total: clean.total, status: "CONFIRMADA" } }, { status: 201 });
  } catch (error) { return safeFailure(error); }
}

export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  const email = normalizeEmail(request.nextUrl.searchParams.get("email"));
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Escribe el código de ocho caracteres y el correo de la reserva." }, { status: 400 });
  try {
    const db = getDb();
    const row = await db.select().from(reservations).where(and(eq(reservations.confirmationCode, code), eq(reservations.guestEmail, email))).get();
    if (!row) return NextResponse.json({ error: "No encontramos una reserva con esos datos." }, { status: 404 });
    return NextResponse.json({ reservation: shapeReservation(row) });
  } catch (error) { return safeFailure(error); }
}

export async function PATCH(request: NextRequest) {
  const input = await request.json().catch(() => null);
  const code = typeof input?.code === "string" ? input.code.trim().toUpperCase() : "";
  const email = normalizeEmail(input?.email);
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Escribe el código y el correo de la reserva." }, { status: 400 });
  try {
    const db = getDb();
    const row = await db.select().from(reservations).where(and(eq(reservations.confirmationCode, code), eq(reservations.guestEmail, email))).get();
    if (!row) return NextResponse.json({ error: "No encontramos una reserva con esos datos." }, { status: 404 });
    if (!canCancelReservation(row)) return NextResponse.json({ error: row.status === "CANCELADA" ? "Esta reserva ya está cancelada." : "La cancelación sin costo debe solicitarse al menos 48 horas antes de la llegada." }, { status: 409 });
    const [updated] = await db.update(reservations).set({ status: "CANCELADA" }).where(and(eq(reservations.id, row.id), eq(reservations.status, "CONFIRMADA"))).returning();
    if (!updated) return NextResponse.json({ error: "La reserva cambió mientras la consultabas. Vuelve a buscarla." }, { status: 409 });
    return NextResponse.json({ reservation: shapeReservation(updated) });
  } catch (error) { return safeFailure(error); }
}
