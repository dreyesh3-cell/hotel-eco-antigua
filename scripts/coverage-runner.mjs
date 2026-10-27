import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { cancelReservationAction, lookupReservationAction, searchRoomsAction, submitReservationAction } from "../frontend/src/booking-actions.js";

const calls = {};
const state = (overrides = {}) => {
  const setters = Object.fromEntries(["SearchError", "Availability", "SelectedRoom", "Booking", "Busy", "BookingError", "LookupError", "FoundBooking", "LookupBusy"].map((key) => {
    calls[key] = [];
    return [`set${key}`, (value) => calls[key].push(value)];
  }));
  return {
    stay: { checkIn: "2026-11-01", checkOut: "2026-11-03", guests: 2 },
    lookup: { code: " abcd1234 ", email: " guest@example.com " },
    selectedRoom: { id: "patio" },
    foundBooking: { confirmationCode: "ABCD1234" },
    ...setters,
    ...overrides,
  };
};
const event = () => ({ currentTarget: {}, preventDefault() {} });
const response = (data, ok = true) => ({ ok, json: async () => data });
const formData = () => new Map([["guestName", "Ana Ejemplo"], ["guestEmail", "ana@example.com"], ["guestPhone", ""]]);

// Exercise each reservation action directly in this process. Keeping the
// coverage run independent of node:test workers makes the LCOV data portable
// across the Node versions used locally and in GitHub Actions.
const searchState = state();
await searchRoomsAction(event(), searchState, async () => response({ rooms: [{ id: "patio", available: 2 }] }));
assert.equal(calls.Availability.at(-1)[0].id, "patio");
await searchRoomsAction(event(), state({ stay: { checkIn: "invalid", checkOut: "invalid", guests: 2 } }), async () => { throw new Error("invalid search should not fetch"); });
await searchRoomsAction(event(), state(), async () => response({ rooms: [{ id: "patio", available: 0 }] }));
await searchRoomsAction(event(), state(), async () => response({ error: "No hay disponibilidad" }, false));
await searchRoomsAction(event(), state(), async () => response({}, false));
await searchRoomsAction(event(), state(), async () => { throw "network failure"; });

const submitState = state();
let scrolled = false;
await submitReservationAction(event(), submitState, async () => response({ reservation: { confirmationCode: "XYZ98765" } }), formData, () => { scrolled = true; });
assert.equal(calls.Booking.at(-1).confirmationCode, "XYZ98765");
assert.equal(scrolled, true);
await submitReservationAction(event(), state(), async () => response({ error: "No hay cupo" }, false), formData);
await submitReservationAction(event(), state(), async () => response({}, false), formData);
await submitReservationAction(event(), state(), async () => { throw "network failure"; }, formData);

const lookupState = state();
await lookupReservationAction(event(), lookupState, async () => response({ reservation: { confirmationCode: "ABCD1234" } }));
assert.equal(calls.FoundBooking.at(-1).confirmationCode, "ABCD1234");
await lookupReservationAction(event(), state(), async () => response({ error: "No existe" }, false));
await lookupReservationAction(event(), state(), async () => response({}, false));
await lookupReservationAction(event(), state(), async () => { throw "network failure"; });

await cancelReservationAction(state({ foundBooking: null }), async () => { throw new Error("missing booking should not fetch"); });
const cancelState = state();
await cancelReservationAction(cancelState, async () => response({ reservation: { status: "CANCELADA" } }));
assert.equal(calls.FoundBooking.at(-1).status, "CANCELADA");
await cancelReservationAction(state(), async () => response({ error: "No se pudo cancelar" }, false));
await cancelReservationAction(state(), async () => response({}, false));
await cancelReservationAction(state(), async () => { throw "network failure"; });

process.env.VITE_BUILD_REF = "qa";
process.env.VITE_BUILD_SHA = "abcdef1234567890";
const vite = await createServer({
  configFile: fileURLToPath(new URL("../frontend/vite.config.mjs", import.meta.url)),
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { default: Home } = await vite.ssrLoadModule("/src/App.tsx");
  const defaultMarkup = renderToStaticMarkup(createElement(Home));
  assert.match(defaultMarkup, /Versión qa · abcdef1/);

  const featuredRoom = { id: "patio", name: "Habitación Patio", description: "Patio tranquilo", nightlyRate: 685, capacity: 2, available: 1, features: ["Cama queen"] };
  const soldRoom = { id: "volcan", name: "Habitación Volcán", description: "Vista al volcán", nightlyRate: 845, capacity: 3, available: 0, features: [] };
  const reservation = { id: "test", confirmationCode: "ABCD1234", guestName: "Ana Ejemplo", roomType: "Habitación Patio", checkIn: "2026-11-01", checkOut: "2026-11-03", guests: 1, total: 1370, status: "CONFIRMADA" };
  const populatedMarkup = renderToStaticMarkup(createElement(Home, {
    initialState: {
      stay: { checkIn: "2026-11-01", checkOut: "2026-11-03", guests: 1, today: "2026-10-26" },
      availability: [featuredRoom, soldRoom],
      selectedRoom: featuredRoom,
      searchError: "No hay disponibilidad para otras fechas.",
      booking: reservation,
      bookingError: "No se pudo guardar la reserva.",
      lookup: { code: "ABCD1234", email: "ana@example.com" },
      foundBooking: reservation,
      lookupError: "No se encontró otra reserva.",
      busy: true,
      lookupBusy: true,
    },
  }));
  assert.match(populatedMarkup, /Habitación Patio/);
  assert.match(populatedMarkup, /Agotada/);
  assert.match(populatedMarkup, /Te esperamos, Ana/);
  assert.match(populatedMarkup, /Cancelar reserva/);

  const cancelledMarkup = renderToStaticMarkup(createElement(Home, {
    initialState: { foundBooking: { ...reservation, guests: 2, status: "CANCELADA" } },
  }));
  assert.match(cancelledMarkup, /Cancelada/);
  assert.doesNotMatch(cancelledMarkup, /Cancelar reserva/);

  const multipleGuestsMarkup = renderToStaticMarkup(createElement(Home, {
    initialState: {
      stay: { checkIn: "2026-11-01", checkOut: "2026-11-03", guests: 2, today: "2026-10-26" },
      availability: [{ ...featuredRoom, available: 2 }],
      selectedRoom: { ...featuredRoom, available: 2 },
    },
  }));
  assert.match(multipleGuestsMarkup, /2 huéspedes/);
  assert.match(multipleGuestsMarkup, /2 habitaciones disponibles/);

  const missingCheckInMarkup = renderToStaticMarkup(createElement(Home, {
    initialState: { stay: { checkIn: "", checkOut: "2026-11-03", guests: 1, today: "2026-10-26" } },
  }));
  assert.match(missingCheckInMarkup, /Fecha de salida/);
} finally {
  await vite.close();
}
