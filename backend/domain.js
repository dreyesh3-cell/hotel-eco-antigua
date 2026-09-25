export const ROOM_TYPES = Object.freeze([
  { id: "patio", name: "Habitación Patio", description: "Un espacio tranquilo para dos, con detalles de madera y textiles locales.", nightlyRate: 685, capacity: 2, inventory: 5, features: ["1–2 huéspedes", "Cama queen", "Desayuno incluido"] },
  { id: "volcan", name: "Habitación Volcán", description: "Más amplitud para descansar después de caminar por la ciudad.", nightlyRate: 845, capacity: 3, inventory: 4, features: ["1–3 huéspedes", "Cama king", "Balcón privado"] },
  { id: "familia", name: "Suite Familiar", description: "Dos ambientes para viajar juntos con más comodidad.", nightlyRate: 1195, capacity: 5, inventory: 2, features: ["1–5 huéspedes", "Dos camas", "Sala pequeña"] },
]);

const ACTIVE_STATUSES = new Set(["PENDIENTE", "CONFIRMADA"]);

export function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function nightsBetween(checkIn, checkOut) {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return NaN;
  return (Date.parse(`${checkOut}T12:00:00Z`) - Date.parse(`${checkIn}T12:00:00Z`)) / 86_400_000;
}

export function validateBooking(input, now = new Date()) {
  const errors = {};
  const room = ROOM_TYPES.find((item) => item.id === input?.roomType);
  const name = typeof input?.guestName === "string" ? input.guestName.trim().replace(/\s+/g, " ") : "";
  const email = normalizeEmail(input?.guestEmail);
  const phone = typeof input?.guestPhone === "string" ? input.guestPhone.trim() : "";
  const checkIn = input?.checkIn;
  const checkOut = input?.checkOut;
  const guests = Number(input?.guests);
  const nights = nightsBetween(checkIn, checkOut);

  if (name.length < 2 || name.length > 100 || /[<>\u0000-\u001f]/.test(name)) errors.guestName = "Escribe un nombre de 2 a 100 caracteres.";
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.guestEmail = "Escribe un correo electrónico válido.";
  if (phone.length > 25 || (phone && !/^\+?[0-9 ()-]{7,25}$/.test(phone))) errors.guestPhone = "Revisa el número de teléfono.";
  if (!room) errors.roomType = "Elige una habitación válida.";
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) errors.dates = "Las fechas deben tener el formato AAAA-MM-DD.";
  else {
    const today = now.toISOString().slice(0, 10);
    if (checkIn < today) errors.checkIn = "La llegada no puede estar en el pasado.";
    if (nights < 1) errors.checkOut = "La salida debe ser después de la llegada.";
    if (nights > 30) errors.nights = "La estancia máxima es de 30 noches.";
    if (checkIn > new Date(now.valueOf() + 365 * 86_400_000).toISOString().slice(0, 10)) errors.checkIn = "Las reservas pueden hacerse hasta con 365 días de anticipación.";
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 5) errors.guests = "El grupo debe tener entre 1 y 5 huéspedes.";
  else if (room && guests > room.capacity) errors.guests = `Esta habitación admite hasta ${room.capacity} huéspedes.`;
  return { valid: Object.keys(errors).length === 0, errors, clean: { guestName: name, guestEmail: email, guestPhone: phone || null, roomType: room?.id, checkIn, checkOut, guests, nights, total: room ? room.nightlyRate * nights : 0, room } };
}

export function calculateAvailability(room, reservationsForRoom, checkIn, checkOut, guests = 1) {
  const occupied = reservationsForRoom.filter((reservation) =>
    ACTIVE_STATUSES.has(reservation.status) && reservation.checkIn < checkOut && reservation.checkOut > checkIn,
  ).length;
  return { ...room, available: Math.max(0, room.inventory - occupied), suitable: Number(guests) <= room.capacity };
}

export function makeReservation(input, { now = () => new Date(), id = () => crypto.randomUUID(), code = makeConfirmationCode } = {}) {
  const result = validateBooking(input, now());
  if (!result.valid) return { ok: false, errors: result.errors };
  return { ok: true, reservation: { id: id(), confirmationCode: code(), ...result.clean, status: "CONFIRMADA" } };
}

export function makeConfirmationCode(randomBytes = crypto.getRandomValues(new Uint8Array(8))) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes, (byte) => alphabet[byte % alphabet.length]).join("").slice(0, 8);
}

export function canTransition(current, next) {
  return current === "CONFIRMADA" && next === "CANCELADA";
}

export function canCancelReservation(reservation, now = new Date()) {
  if (!reservation || !canTransition(reservation.status, "CANCELADA") || !isIsoDate(reservation.checkIn)) return false;
  const arrival = Date.parse(`${reservation.checkIn}T15:00:00.000Z`);
  return arrival - now.valueOf() >= 48 * 60 * 60 * 1000;
}
