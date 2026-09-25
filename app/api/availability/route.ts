import { and, gt, lt, or, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { reservations } from "@/db/schema";
import { ROOM_TYPES, calculateAvailability, isIsoDate, nightsBetween } from "@/backend/domain";

export async function GET(request: NextRequest) {
  const checkIn = request.nextUrl.searchParams.get("checkIn") ?? "";
  const checkOut = request.nextUrl.searchParams.get("checkOut") ?? "";
  const guests = Number(request.nextUrl.searchParams.get("guests") ?? "2");
  const nights = nightsBetween(checkIn, checkOut);
  const today = new Date().toISOString().slice(0, 10);
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return NextResponse.json({ error: "Elige fechas válidas." }, { status: 400 });
  if (checkIn < today) return NextResponse.json({ error: "La llegada no puede estar en el pasado." }, { status: 400 });
  if (nights < 1 || nights > 30) return NextResponse.json({ error: "La estancia debe ser de 1 a 30 noches." }, { status: 400 });
  if (!Number.isInteger(guests) || guests < 1 || guests > 5) return NextResponse.json({ error: "El grupo debe tener de 1 a 5 huéspedes." }, { status: 400 });

  try {
    const db = getDb();
    const overlaps = await db.select({ roomType: reservations.roomType, checkIn: reservations.checkIn, checkOut: reservations.checkOut, status: reservations.status })
      .from(reservations)
      .where(and(or(eq(reservations.status, "PENDIENTE"), eq(reservations.status, "CONFIRMADA")), lt(reservations.checkIn, checkOut), gt(reservations.checkOut, checkIn)));
    const rooms = ROOM_TYPES.filter((room) => room.capacity >= guests).map((room) => ({ ...calculateAvailability(room, overlaps.filter((reservation) => reservation.roomType === room.id), checkIn, checkOut, guests) }));
    return NextResponse.json({ rooms, checkIn, checkOut, guests, nights });
  } catch (error) {
    console.error("Availability lookup failed", error);
    return NextResponse.json({ error: "No fue posible consultar disponibilidad. Intenta de nuevo." }, { status: 503 });
  }
}
