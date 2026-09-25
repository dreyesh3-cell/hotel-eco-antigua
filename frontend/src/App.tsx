"use client";

import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Compass, Leaf, MapPin, Minus, ShieldCheck, Users, X } from "lucide-react";
import { attractions } from "./attractions";
import { defaultStay, formatQuetzales, validateSearch } from "../booking-form.js";
import AntiguaIllustration from "./AntiguaIllustration";

type AvailabilityRoom = { id: string; name: string; description: string; nightlyRate: number; capacity: number; available: number; features: string[] };
type Reservation = { id: string; confirmationCode: string; guestName: string; roomType: string; checkIn: string; checkOut: string; guests: number; total: number; status: string };

const rooms = [
  { id: "patio", name: "Habitación Patio", description: "Un espacio tranquilo para dos, con detalles de madera y textiles locales.", nightlyRate: 685, capacity: 2, features: ["1–2 huéspedes", "Cama queen", "Desayuno incluido"] },
  { id: "volcan", name: "Habitación Volcán", description: "Más amplitud para descansar después de caminar por la ciudad.", nightlyRate: 845, capacity: 3, features: ["1–3 huéspedes", "Cama king", "Balcón privado"] },
  { id: "familia", name: "Suite Familiar", description: "Dos ambientes para viajar juntos con más comodidad.", nightlyRate: 1195, capacity: 5, features: ["1–5 huéspedes", "Dos camas", "Sala pequeña"] },
];

export default function Home() {
  const [stay, setStay] = useState(() => defaultStay());
  const [availability, setAvailability] = useState<AvailabilityRoom[] | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<AvailabilityRoom | null>(null);
  const [searchError, setSearchError] = useState("");
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState<Reservation | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [lookup, setLookup] = useState({ code: "", email: "" });
  const [foundBooking, setFoundBooking] = useState<Reservation | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);

  async function searchRooms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError(""); setAvailability(null); setSelectedRoom(null); setBooking(null);
    const invalid = validateSearch(stay);
    if (invalid) { setSearchError(invalid); return; }
    setBusy(true);
    try {
      const query = new URLSearchParams({ checkIn: stay.checkIn, checkOut: stay.checkOut, guests: String(stay.guests) });
      const response = await fetch(`/api/availability?${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible consultar disponibilidad.");
      setAvailability(data.rooms);
      if (data.rooms.every((room: AvailabilityRoom) => room.available < 1)) setSearchError("No encontramos habitaciones para esas fechas. Prueba con otros días.");
    } catch (error) { setSearchError(error instanceof Error ? error.message : "No fue posible consultar disponibilidad."); }
    finally { setBusy(false); }
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBookingError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestName: form.get("guestName"), guestEmail: form.get("guestEmail"), guestPhone: form.get("guestPhone"), roomType: selectedRoom?.id, checkIn: stay.checkIn, checkOut: stay.checkOut, guests: stay.guests }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo completar la reserva.");
      setBooking(data.reservation); setSelectedRoom(null); setAvailability(null);
      document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) { setBookingError(error instanceof Error ? error.message : "No se pudo completar la reserva."); }
    finally { setBusy(false); }
  }

  async function findBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLookupError(""); setFoundBooking(null); setLookupBusy(true);
    try {
      const query = new URLSearchParams({ code: lookup.code.trim().toUpperCase(), email: lookup.email.trim() });
      const response = await fetch(`/api/reservations?${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No encontramos la reserva con esos datos.");
      setFoundBooking(data.reservation);
    } catch (error) { setLookupError(error instanceof Error ? error.message : "No encontramos la reserva con esos datos."); }
    finally { setLookupBusy(false); }
  }

  async function cancelBooking() {
    if (!foundBooking) return;
    setLookupError(""); setLookupBusy(true);
    try {
      const response = await fetch("/api/reservations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: lookup.code.trim().toUpperCase(), email: lookup.email.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible cancelar la reserva.");
      setFoundBooking(data.reservation);
    } catch (error) { setLookupError(error instanceof Error ? error.message : "No fue posible cancelar la reserva."); }
    finally { setLookupBusy(false); }
  }

  return (
    <main>
      <div className="announcement"><Leaf size={14} aria-hidden="true" /> Una estancia serena, a tu propio ritmo <span>·</span> Antigua Guatemala</div>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Hotel Eco Antigua, inicio"><span className="brand-mark"><Leaf size={20} /></span><span>Hotel Eco <b>Antigua</b></span></a>
        <nav className="main-nav" aria-label="Navegación principal"><a href="#habitaciones">Habitaciones</a><a href="#explorar">Qué hacer</a><a href="#mi-reserva">Mi reserva</a></nav>
        <a className="nav-cta" href="#reservar">Reservar <ArrowRight size={15} /></a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> TU CASA EN ANTIGUA</div>
          <h1>El tiempo se<br />siente <em>distinto</em><br />aquí.</h1>
          <p className="hero-text">Despierta entre calles de piedra, patios tranquilos y volcanes en el horizonte. Encuentra tu habitación y empieza a planear.</p>
          <a className="text-link" href="#explorar">Descubre Antigua <ArrowDown size={16} /></a>
          <div className="hero-note"><span className="note-icon"><MapPin size={15} /></span><span>Un punto de partida para explorar a pie<br /><small>Antigua Guatemala · Sacatepéquez</small></span></div>
        </div>
        <div className="hero-art" aria-label="Ilustración de Antigua Guatemala al pie de los volcanes" role="img"><AntiguaIllustration /><div className="art-caption"><span>14° 33′ N &nbsp;·&nbsp; 90° 44′ O</span><span>Ciudad Patrimonio de la Humanidad</span></div></div>
        <div className="hero-index">01 <span /> 04</div>
      </section>

      <section className="booking-section" id="reservar">
        <span id="habitaciones" className="anchor-target" />
        <div className="section-intro"><span className="eyebrow">ENCUENTRA TU ESTANCIA</span><h2>Una fecha para empezar.</h2><p>Consulta disponibilidad en pocos pasos.</p></div>
        <form className="search-bar" onSubmit={searchRooms}>
          <label className="search-field"><span><CalendarDays size={17} /> Llegada</span><input aria-label="Fecha de llegada" type="date" min={defaultStay().today} value={stay.checkIn} onChange={(e) => setStay({ ...stay, checkIn: e.target.value })} required /></label>
          <label className="search-field"><span><CalendarDays size={17} /> Salida</span><input aria-label="Fecha de salida" type="date" min={stay.checkIn || defaultStay().today} value={stay.checkOut} onChange={(e) => setStay({ ...stay, checkOut: e.target.value })} required /></label>
          <label className="search-field guests-field"><span><Users size={17} /> Huéspedes</span><select aria-label="Cantidad de huéspedes" value={stay.guests} onChange={(e) => setStay({ ...stay, guests: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "huésped" : "huéspedes"}</option>)}</select><ChevronDown size={14} className="select-chevron" /></label>
          <button className="search-button" disabled={busy}>{busy ? "Consultando…" : <>Buscar habitación <ArrowRight size={16} /></>}</button>
        </form>
        {searchError && <p className="form-feedback error" role="alert">{searchError}</p>}
        {availability && <div className="room-results"><div className="results-heading"><div><span className="eyebrow">DISPONIBILIDAD</span><h3>Elige dónde descansar.</h3></div><span className="date-summary"><CalendarDays size={15} /> {stay.checkIn} — {stay.checkOut}</span></div><div className="room-grid">{availability.map((room) => <article className={`room-card ${room.available < 1 ? "room-sold" : ""}`} key={room.id}><div className={`room-art room-art-${room.id}`} aria-hidden="true"><span className="room-sun" /><span className="room-window" /><span className="room-leaf">✳</span></div><div className="room-content"><div className="room-title"><h4>{room.name}</h4><span className="room-capacity"><Users size={13} /> {room.capacity}</span></div><p>{room.description}</p><ul>{room.features.map((feature) => <li key={feature}><Check size={13} /> {feature}</li>)}</ul><div className="room-price"><span><b>{formatQuetzales(room.nightlyRate)}</b> <small>/ noche</small></span><button disabled={room.available < 1} onClick={() => { setSelectedRoom(room); setBookingError(""); document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>{room.available > 0 ? "Elegir" : "Agotada"} {room.available > 0 && <ArrowRight size={14} />}</button></div>{room.available > 0 && <small className="availability-note">{room.available} {room.available === 1 ? "habitación disponible" : "habitaciones disponibles"}</small>}</div></article>)}</div><p className="rate-note">Tarifas de demostración en quetzales. El hotel debe confirmar precios y servicios antes de recibir reservas reales.</p></div>}
        {selectedRoom && <form className="guest-form" id="booking-form" onSubmit={submitBooking}><div className="guest-form-heading"><div><span className="eyebrow">CASI LISTO</span><h3>Completa tu reserva</h3></div><button type="button" className="icon-button" aria-label="Cerrar formulario" onClick={() => setSelectedRoom(null)}><X size={18} /></button></div><div className="selected-summary"><span>{selectedRoom.name}</span><span>{stay.checkIn} — {stay.checkOut}</span><span>{stay.guests} {stay.guests === 1 ? "huésped" : "huéspedes"}</span></div><div className="guest-fields"><label>Nombre completo<input name="guestName" autoComplete="name" minLength={2} maxLength={100} required placeholder="Como aparece en tu identificación" /></label><label>Correo electrónico<input name="guestEmail" type="email" autoComplete="email" maxLength={160} required placeholder="tu@correo.com" /></label><label>Teléfono <small>(opcional)</small><input name="guestPhone" type="tel" autoComplete="tel" maxLength={25} placeholder="+502 0000 0000" /></label></div>{bookingError && <p className="form-feedback error" role="alert">{bookingError}</p>}<div className="guest-form-bottom"><p><ShieldCheck size={15} /> Tus datos se usan para gestionar esta reserva. No procesamos pagos en línea.</p><button className="search-button" disabled={busy}>{busy ? "Guardando…" : <>Confirmar reserva <ArrowRight size={16} /></>}</button></div></form>}
        {booking && <div className="confirmation-card" role="status"><div className="confirmation-icon"><Check size={21} /></div><div><span className="eyebrow">RESERVA CONFIRMADA</span><h3>Te esperamos, {booking.guestName.split(" ")[0]}.</h3><p>Guarda este código para consultar o cancelar tu reserva.</p><strong className="confirmation-code">{booking.confirmationCode}</strong><div className="confirmation-details"><span>{booking.roomType}</span><span>{booking.checkIn} — {booking.checkOut}</span><span>{formatQuetzales(booking.total)}</span></div></div></div>}
      </section>

      <section className="promise-strip"><div><span className="promise-icon"><Leaf size={18} /></span><p><b>Viaja con cuidado.</b><br /><small>Camina la ciudad, lleva tu botella reutilizable y apoya los comercios locales.</small></p></div><div><span className="promise-icon"><Clock3 size={18} /></span><p><b>Sin prisa.</b><br /><small>La mejor forma de conocer el centro histórico es a pie.</small></p></div><div><span className="promise-icon"><Compass size={18} /></span><p><b>Más allá del arco.</b><br /><small>Los pueblos de Sacatepéquez guardan historias propias.</small></p></div></section>

      <section className="explore-section" id="explorar"><div className="explore-top"><div><span className="eyebrow">A TU ALREDEDOR</span><h2>Antigua y sus caminos.</h2><p>Empieza por sus calles y reserva un día para los pueblos cercanos.</p></div><a className="text-link" href="https://inguat.gob.gt/es/descargas-inguat-guatemala/46-guias-turisticas.html?download=1148%3Aguia-turistica-de-sacatepequez-2026" target="_blank" rel="noreferrer">Guía turística de Sacatepéquez <ArrowRight size={15} /></a></div><div className="attraction-grid">{attractions.map((place, i) => <article className={`place-card place-${i + 1}`} key={place.name}><div className="place-art" aria-hidden="true"><span className="place-sun" /><span className="place-shape" /><span className="place-letter">{String(i + 1).padStart(2, "0")}</span></div><div className="place-body"><div className="place-meta"><span>{place.area}</span><span>·</span><span>{place.type}</span></div><h3>{place.name}</h3><p>{place.description}</p><a href={place.mapsUrl} target="_blank" rel="noreferrer" aria-label={`Ver ${place.name} en Google Maps`}>Cómo llegar <ArrowRight size={14} /></a></div></article>)}</div><p className="tourism-note">Los horarios, accesos y condiciones pueden cambiar. Confírmalos con cada sitio antes de salir.</p></section>

      <section className="manage-section" id="mi-reserva"><div className="manage-copy"><span className="eyebrow">YA TIENES UNA RESERVA</span><h2>La tienes a mano.</h2><p>Consulta los detalles o cancela con tu código de confirmación y el correo usado al reservar.</p><p className="cancel-policy"><Clock3 size={15} /> Puedes cancelar sin costo hasta 48 horas antes de la llegada.</p></div><div className="manage-panel"><form onSubmit={findBooking}><label>Código de confirmación<input value={lookup.code} onChange={(e) => setLookup({ ...lookup, code: e.target.value.toUpperCase() })} minLength={8} maxLength={8} required placeholder="Ej. ECO8K2PM" /></label><label>Correo de la reserva<input value={lookup.email} onChange={(e) => setLookup({ ...lookup, email: e.target.value })} type="email" required placeholder="tu@correo.com" /></label><button className="search-button" disabled={lookupBusy}>{lookupBusy ? "Buscando…" : <>Buscar mi reserva <ArrowRight size={16} /></>}</button></form>{lookupError && <p className="form-feedback error" role="alert">{lookupError}</p>}{foundBooking && <div className="lookup-result"><div className="lookup-title"><span>{foundBooking.roomType}</span><span className={foundBooking.status === "CANCELADA" ? "status-cancelled" : "status-confirmed"}>{foundBooking.status === "CANCELADA" ? "Cancelada" : "Confirmada"}</span></div><p>{foundBooking.checkIn} — {foundBooking.checkOut} · {foundBooking.guests} huéspedes</p><p>Total {formatQuetzales(foundBooking.total)}</p>{foundBooking.status === "CONFIRMADA" && <button className="cancel-link" type="button" disabled={lookupBusy} onClick={cancelBooking}><Minus size={14} /> Cancelar reserva</button>}</div>}</div></section>

      <footer className="site-footer"><a className="brand footer-brand" href="#inicio"><span className="brand-mark"><Leaf size={18} /></span><span>Hotel Eco <b>Antigua</b></span></a><p>Un lugar para estar presente.</p><div className="footer-links"><a href="#habitaciones">Habitaciones</a><a href="#explorar">Guía local</a><a href="#mi-reserva">Mi reserva</a></div><small>Prototipo académico · Tarifas e inventario de demostración</small></footer>
    </main>
  );
}
