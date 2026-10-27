import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

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
