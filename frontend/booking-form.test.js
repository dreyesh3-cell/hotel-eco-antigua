import test from "node:test";
import assert from "node:assert/strict";
import { defaultStay, formatQuetzales, validateSearch } from "./booking-form.js";

test("la estancia inicial propone llegada mañana y salida tres noches después", () => {
  assert.deepEqual(defaultStay(new Date("2026-04-10T12:00:00Z")), { today: "2026-04-10", checkIn: "2026-04-11", checkOut: "2026-04-14", guests: 2 });
});
test("la primera noche es válida", () => assert.equal(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-04-12", guests: 1 }, "2026-04-10"), ""));
test("se acepta una llegada en la fecha actual", () => assert.equal(validateSearch({ checkIn: "2026-04-10", checkOut: "2026-04-11", guests: 2 }, "2026-04-10"), ""));
test("se rechaza la llegada del día anterior", () => assert.match(validateSearch({ checkIn: "2026-04-09", checkOut: "2026-04-11", guests: 2 }, "2026-04-10"), /pasado/));
test("se rechaza salida antes de llegada", () => assert.match(validateSearch({ checkIn: "2026-04-12", checkOut: "2026-04-11", guests: 2 }, "2026-04-10"), /después/));
test("se rechaza salida igual a llegada", () => assert.match(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-04-11", guests: 2 }, "2026-04-10"), /después/));
test("se acepta exactamente la estancia máxima de 30 noches", () => assert.equal(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-05-11", guests: 2 }, "2026-04-10"), ""));
test("se rechazan 31 noches", () => assert.match(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-05-12", guests: 2 }, "2026-04-10"), /30 noches/));
test("se rechaza una fecha de calendario imposible", () => assert.match(validateSearch({ checkIn: "2026-02-30", checkOut: "2026-03-02", guests: 2 }, "2026-02-01"), /válidas/));
test("se rechaza un formato de fecha incompleto", () => assert.match(validateSearch({ checkIn: "10/04/2026", checkOut: "2026-04-13", guests: 2 }, "2026-04-01"), /válidas/));
test("se acepta un huésped", () => assert.equal(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-04-12", guests: 1 }, "2026-04-10"), ""));
test("se acepta el máximo de huéspedes del catálogo", () => assert.equal(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-04-12", guests: 5 }, "2026-04-10"), ""));
test("se rechaza un grupo vacío", () => assert.match(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-04-12", guests: 0 }, "2026-04-10"), /1 y 5/));
test("se rechazan más de cinco huéspedes", () => assert.match(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-04-12", guests: 6 }, "2026-04-10"), /1 y 5/));
test("se rechazan huéspedes fraccionarios", () => assert.match(validateSearch({ checkIn: "2026-04-11", checkOut: "2026-04-12", guests: 1.5 }, "2026-04-10"), /1 y 5/));
test("se detectan campos de fecha faltantes", () => assert.match(validateSearch({ guests: 2 }, "2026-04-10"), /fechas válidas/));
test("la moneda se presenta en quetzales", () => assert.match(formatQuetzales(685), /Q/));
