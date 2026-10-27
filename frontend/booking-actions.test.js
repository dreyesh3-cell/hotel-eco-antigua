import test from "node:test";
import assert from "node:assert/strict";
import { cancelReservationAction, lookupReservationAction, searchRoomsAction, submitReservationAction } from "./src/booking-actions.js";

function state(overrides = {}) {
  const calls = {};
  const tracked = ["SearchError", "Availability", "SelectedRoom", "Booking", "Busy", "BookingError", "LookupError", "FoundBooking", "LookupBusy"];
  const setters = Object.fromEntries(tracked.map((name) => {
    calls[name] = [];
    return [`set${name}`, (value) => calls[name].push(value)];
  }));
  return {
    calls,
    value: {
      stay: { checkIn: "2026-11-01", checkOut: "2026-11-03", guests: 2 },
      lookup: { code: " abcd1234 ", email: " guest@example.com " },
      selectedRoom: { id: "patio" },
      foundBooking: { confirmationCode: "ABCD1234" },
      ...setters,
      ...overrides,
    },
  };
}

function event() {
  return { prevented: false, currentTarget: {}, preventDefault() { this.prevented = true; } };
}

function jsonResponse(data, ok = true) {
  return { ok, json: async () => data };
}

test("consulta habitaciones disponibles y actualiza el estado", async () => {
  const s = state();
  const formEvent = event();
  let requestedUrl = "";
  await searchRoomsAction(formEvent, s.value, async (url) => {
    requestedUrl = url;
    return jsonResponse({ rooms: [{ id: "patio", available: 2 }] });
  });
  assert.equal(formEvent.prevented, true);
  assert.match(requestedUrl, /checkIn=2026-11-01/);
  assert.deepEqual(s.calls.Availability.at(-1), [{ id: "patio", available: 2 }]);
  assert.deepEqual(s.calls.Busy, [true, false]);
});

test("rechaza fechas inválidas antes de consultar la API", async () => {
  const s = state({ stay: { checkIn: "inválida", checkOut: "inválida", guests: 2 } });
  let fetched = false;
  await searchRoomsAction(event(), s.value, async () => { fetched = true; });
  assert.equal(fetched, false);
  assert.match(s.calls.SearchError.at(-1), /fechas válidas/);
  assert.deepEqual(s.calls.Busy, []);
});

test("informa cuando no hay habitaciones disponibles", async () => {
  const s = state();
  await searchRoomsAction(event(), s.value, async () => jsonResponse({ rooms: [{ id: "patio", available: 0 }] }));
  assert.match(s.calls.SearchError.at(-1), /No encontramos habitaciones/);
});

test("muestra el error del servidor al consultar disponibilidad", async () => {
  const s = state();
  await searchRoomsAction(event(), s.value, async () => jsonResponse({ error: "Error de disponibilidad" }, false));
  assert.deepEqual(s.calls.SearchError, ["", "Error de disponibilidad"]);
  assert.equal(s.calls.Busy.at(-1), false);
});

test("envía una reserva y limpia la selección al confirmarse", async () => {
  const s = state();
  let payload;
  let scrolled = false;
  await submitReservationAction(event(), s.value, async (_url, options) => {
    payload = JSON.parse(options.body);
    return jsonResponse({ reservation: { confirmationCode: "XYZ98765" } });
  }, () => new Map([["guestName", "Ana Ejemplo"], ["guestEmail", "ana@example.com"], ["guestPhone", ""]]), () => { scrolled = true; });
  assert.equal(payload.guestName, "Ana Ejemplo");
  assert.equal(payload.roomType, "patio");
  assert.equal(s.calls.Booking.at(-1).confirmationCode, "XYZ98765");
  assert.equal(s.calls.SelectedRoom.at(-1), null);
  assert.equal(s.calls.Availability.at(-1), null);
  assert.equal(scrolled, true);
});

test("muestra un error al guardar una reserva", async () => {
  const s = state();
  await submitReservationAction(event(), s.value, async () => jsonResponse({ error: "No hay cupo" }, false), () => new Map());
  assert.equal(s.calls.BookingError.at(-1), "No hay cupo");
  assert.equal(s.calls.Busy.at(-1), false);
});

test("busca una reserva normalizando código y correo", async () => {
  const s = state();
  let requestedUrl = "";
  await lookupReservationAction(event(), s.value, async (url) => {
    requestedUrl = url;
    return jsonResponse({ reservation: { confirmationCode: "ABCD1234" } });
  });
  assert.match(requestedUrl, /code=ABCD1234/);
  assert.match(requestedUrl, /email=guest%40example.com/);
  assert.equal(s.calls.FoundBooking.at(-1).confirmationCode, "ABCD1234");
});

test("muestra el error cuando no se encuentra una reserva", async () => {
  const s = state();
  await lookupReservationAction(event(), s.value, async () => jsonResponse({ error: "No existe" }, false));
  assert.deepEqual(s.calls.LookupError, ["", "No existe"]);
  assert.equal(s.calls.LookupBusy.at(-1), false);
});

test("no intenta cancelar cuando no se encontró una reserva", async () => {
  const s = state({ foundBooking: null });
  let fetched = false;
  await cancelReservationAction(s.value, async () => { fetched = true; });
  assert.equal(fetched, false);
});

test("cancela una reserva encontrada", async () => {
  const s = state();
  let options;
  await cancelReservationAction(s.value, async (_url, init) => {
    options = init;
    return jsonResponse({ reservation: { status: "CANCELADA" } });
  });
  assert.equal(options.method, "PATCH");
  assert.equal(JSON.parse(options.body).code, "ABCD1234");
  assert.equal(s.calls.FoundBooking.at(-1).status, "CANCELADA");
});

test("muestra el error cuando falla la cancelación", async () => {
  const s = state();
  await cancelReservationAction(s.value, async () => jsonResponse({ error: "No se pudo cancelar" }, false));
  assert.equal(s.calls.LookupError.at(-1), "No se pudo cancelar");
  assert.equal(s.calls.LookupBusy.at(-1), false);
});
