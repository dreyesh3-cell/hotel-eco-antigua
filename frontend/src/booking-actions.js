import { validateSearch } from "../booking-form.js";

export async function searchRoomsAction(event, state, fetchImpl = fetch) {
  const { stay, setSearchError, setAvailability, setSelectedRoom, setBooking, setBusy } = state;
  event.preventDefault();
  setSearchError("");
  setAvailability(null);
  setSelectedRoom(null);
  setBooking(null);
  const invalid = validateSearch(stay);
  if (invalid) {
    setSearchError(invalid);
    return;
  }
  setBusy(true);
  try {
    const query = new URLSearchParams({ checkIn: stay.checkIn, checkOut: stay.checkOut, guests: String(stay.guests) });
    const response = await fetchImpl(`/api/availability?${query}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No fue posible consultar disponibilidad.");
    setAvailability(data.rooms);
    if (data.rooms.every((room) => room.available < 1)) setSearchError("No encontramos habitaciones para esas fechas. Prueba con otros días.");
  } catch (error) {
    setSearchError(error instanceof Error ? error.message : "No fue posible consultar disponibilidad.");
  } finally {
    setBusy(false);
  }
}
export async function submitReservationAction(event, state, fetchImpl = fetch, formData = (form) => new FormData(form), scrollToBooking = () => {}) {
  const { selectedRoom, stay, setBookingError, setBusy, setBooking, setSelectedRoom, setAvailability } = state;
  event.preventDefault();
  setBookingError("");
  setBusy(true);
  const form = formData(event.currentTarget);
  try {
    const response = await fetchImpl("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestName: form.get("guestName"), guestEmail: form.get("guestEmail"), guestPhone: form.get("guestPhone"), roomType: selectedRoom?.id, checkIn: stay.checkIn, checkOut: stay.checkOut, guests: stay.guests }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo completar la reserva.");
    setBooking(data.reservation);
    setSelectedRoom(null);
    setAvailability(null);
    scrollToBooking();
  } catch (error) {
    setBookingError(error instanceof Error ? error.message : "No se pudo completar la reserva.");
  } finally {
    setBusy(false);
  }
}

export async function lookupReservationAction(event, state, fetchImpl = fetch) {
  const { lookup, setLookupError, setFoundBooking, setLookupBusy } = state;
  event.preventDefault();
  setLookupError("");
  setFoundBooking(null);
  setLookupBusy(true);
  try {
    const query = new URLSearchParams({ code: lookup.code.trim().toUpperCase(), email: lookup.email.trim() });
    const response = await fetchImpl(`/api/reservations?${query}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No encontramos la reserva con esos datos.");
    setFoundBooking(data.reservation);
  } catch (error) {
    setLookupError(error instanceof Error ? error.message : "No encontramos la reserva con esos datos.");
  } finally {
    setLookupBusy(false);
  }
}

export async function cancelReservationAction(state, fetchImpl = fetch) {
  const { foundBooking, lookup, setLookupError, setFoundBooking, setLookupBusy } = state;
  if (!foundBooking) return;
  setLookupError("");
  setLookupBusy(true);
  try {
    const response = await fetchImpl("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: lookup.code.trim().toUpperCase(), email: lookup.email.trim() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No fue posible cancelar la reserva.");
    setFoundBooking(data.reservation);
  } catch (error) {
    setLookupError(error instanceof Error ? error.message : "No fue posible cancelar la reserva.");
  } finally {
    setLookupBusy(false);
  }
}
