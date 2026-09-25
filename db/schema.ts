import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reservations = sqliteTable("reservations", {
  id: text("id").primaryKey(),
  confirmationCode: text("confirmation_code").notNull().unique(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  roomType: text("room_type").notNull(),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  guests: integer("guests").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("CONFIRMADA"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_reservations_room_status_dates").on(table.roomType, table.status, table.checkIn, table.checkOut),
  index("idx_reservations_lookup").on(table.confirmationCode, table.guestEmail),
]);
