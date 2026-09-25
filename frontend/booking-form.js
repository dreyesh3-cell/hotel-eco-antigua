export function defaultStay(now = new Date()) {
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const addDays = (date, n) => { const next = new Date(date); next.setDate(next.getDate() + n); return next.toISOString().slice(0, 10); };
  return { today: addDays(todayDate, 0), checkIn: addDays(todayDate, 1), checkOut: addDays(todayDate, 4), guests: 2 };
}

export function validateSearch(stay, today = defaultStay().today) {
  if (!stay || !/^\d{4}-\d{2}-\d{2}$/.test(stay.checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(stay.checkOut)) return "Elige fechas válidas para tu estancia.";
  const start = Date.parse(`${stay.checkIn}T12:00:00Z`);
  const end = Date.parse(`${stay.checkOut}T12:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || new Date(start).toISOString().slice(0, 10) !== stay.checkIn || new Date(end).toISOString().slice(0, 10) !== stay.checkOut) return "Elige fechas válidas para tu estancia.";
  if (stay.checkIn < today) return "La fecha de llegada no puede estar en el pasado.";
  if (end <= start) return "La salida debe ser después de la llegada.";
  const nights = (end - start) / 86_400_000;
  if (nights > 30) return "La estancia máxima es de 30 noches.";
  if (!Number.isInteger(Number(stay.guests)) || Number(stay.guests) < 1 || Number(stay.guests) > 5) return "Elige entre 1 y 5 huéspedes.";
  return "";
}

export function formatQuetzales(value) {
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 0 }).format(value);
}
