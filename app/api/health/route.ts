import { NextResponse } from "next/server";
import { getD1 } from "@/db";

export async function GET() {
  try {
    await getD1().prepare("SELECT 1 AS ok").first();
    return NextResponse.json({ ok: true, service: "hotel-eco-antigua-api", database: "connected" });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json({ ok: false, error: "El servicio de reservas no está disponible." }, { status: 503 });
  }
}
