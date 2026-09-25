import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = (__ENV.TARGET_URL || "").replace(/\/$/, "");
const bookingCode = __ENV.BOOKING_CODE || "";
const bookingEmail = __ENV.BOOKING_EMAIL || "";

export const options = {
  scenarios: {
    reservations_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 50 },
        { duration: "5m", target: 50 },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "10s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  if (!baseUrl || !bookingCode || !bookingEmail) {
    throw new Error("Define TARGET_URL, BOOKING_CODE y BOOKING_EMAIL antes de ejecutar la carga.");
  }
  const start = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  const end = new Date(Date.now() + 13 * 86400000).toISOString().slice(0, 10);
  const availability = http.get(`${baseUrl}/api/availability?checkIn=${start}&checkOut=${end}&guests=2`, { tags: { endpoint: "availability" } });
  check(availability, { "availability HTTP 200": (res) => res.status === 200, "availability has room list": (res) => Array.isArray(res.json("rooms")) });

  const params = `code=${encodeURIComponent(bookingCode)}&email=${encodeURIComponent(bookingEmail)}`;
  const reservation = http.get(`${baseUrl}/api/reservations?${params}`, { tags: { endpoint: "reservation-lookup" } });
  check(reservation, { "reservation lookup HTTP 200": (res) => res.status === 200, "lookup has confirmation code": (res) => res.json("reservation.confirmationCode") === bookingCode });
  sleep(1);
}
