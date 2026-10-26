// Import the node:test suites in one process so c8 records coverage reliably
// for all exercised application modules in CI.
import "../backend/domain.test.js";
import "../frontend/booking-form.test.js";
import "../frontend/app.test.js";
import "../frontend/booking-actions.test.js";
