import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";

const browser = new Window({ url: "http://localhost/" });
globalThis.window = browser;
globalThis.document = browser.document;
globalThis.HTMLElement = browser.HTMLElement;
globalThis.Node = browser.Node;
globalThis.FormData = browser.FormData;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(globalThis, "navigator", { configurable: true, value: browser.navigator });
browser.HTMLElement.prototype.scrollIntoView = function () {};

const React = await import("react");
const { act } = React;
const { createRoot } = await import("react-dom/client");
const { default: Home } = await import("./src/App.tsx");

test("al elegir una habitación, el foco pasa al primer campo de reserva", async () => {
  let completeReservation;
  let reservationAttempts = 0;
  globalThis.fetch = async (_url, options = {}) => {
    if (options.method === "POST") {
      reservationAttempts += 1;
      if (reservationAttempts > 1) {
        return {
          ok: true,
          json: async () => ({
            reservation: {
              id: "reserva-prueba",
              confirmationCode: "ECO12345",
              guestName: "Huésped de prueba",
              roomType: "Habitación Patio",
              checkIn: "2026-11-01",
              checkOut: "2026-11-04",
              guests: 2,
              total: 2055,
              status: "CONFIRMADA",
            },
          }),
        };
      }
      return new Promise((resolve) => {
        completeReservation = () => resolve({ ok: false, json: async () => ({ error: "Reserva rechazada para la prueba" }) });
      });
    }
    return {
      ok: true,
      json: async () => ({
        rooms: [
          { id: "patio", name: "Habitación Patio", description: "Habitación de prueba", nightlyRate: 685, capacity: 2, available: 1, features: [] },
          { id: "volcan", name: "Habitación Volcán", description: "Habitación de prueba", nightlyRate: 845, capacity: 3, available: 2, features: [] },
          { id: "familia", name: "Suite Familiar", description: "Habitación de prueba", nightlyRate: 1195, capacity: 5, available: 0, features: [] },
        ],
      }),
    };
  };

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    await act(async () => root.render(React.createElement(Home)));

    const searchRooms = async () => act(async () => {
      const searchButton = [...container.querySelectorAll("button")]
        .find((button) => button.textContent.includes("Buscar habitación"));
      assert.ok(searchButton, "debe mostrarse el botón de búsqueda");
      searchButton.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const chooseRoom = async (name) => act(async () => {
      const room = [...container.querySelectorAll("article")]
        .find((article) => article.querySelector("h4")?.textContent === name);
      const button = room?.querySelector("button");
      assert.ok(button && !button.disabled, `debe poder elegirse ${name}`);
      button.click();
    });

    await searchRooms();
    await chooseRoom("Habitación Patio");
    assert.equal(document.activeElement?.getAttribute("name"), "guestName");
    assert.match(container.textContent, /2 huéspedes/);

    const guestForm = container.querySelector("#booking-form");
    guestForm.elements.namedItem("guestName").value = "Huésped de prueba";
    guestForm.elements.namedItem("guestEmail").value = "prueba@example.com";
    await act(async () => {
      guestForm.dispatchEvent(new browser.Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });
    assert.match(container.textContent, /Guardando…/);
    await act(async () => {
      completeReservation();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assert.match(container.textContent, /Reserva rechazada para la prueba/);

    await act(async () => container.querySelector('[aria-label="Cerrar formulario"]').click());
    await chooseRoom("Habitación Patio");
    const retryForm = container.querySelector("#booking-form");
    retryForm.elements.namedItem("guestName").value = "Huésped de prueba";
    retryForm.elements.namedItem("guestEmail").value = "prueba@example.com";
    await act(async () => {
      retryForm.dispatchEvent(new browser.Event("submit", { bubbles: true, cancelable: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assert.match(container.textContent, /RESERVA CONFIRMADA/);
    assert.match(container.textContent, /ECO12345/);

    await searchRooms();
    await chooseRoom("Habitación Volcán");
    assert.equal(document.activeElement?.getAttribute("name"), "guestName");
    await act(async () => container.querySelector('[aria-label="Cerrar formulario"]').click());

    await act(async () => {
      const guestSelect = container.querySelector('[aria-label="Cantidad de huéspedes"]');
      guestSelect.value = "1";
      guestSelect.dispatchEvent(new browser.Event("change", { bubbles: true }));
    });
    await searchRooms();
    await chooseRoom("Habitación Patio");
    assert.equal(document.activeElement?.getAttribute("name"), "guestName");
    assert.match(container.textContent, /1 huésped/);
  } finally {
    await act(async () => root.unmount());
    browser.happyDOM.abort();
  }
});
