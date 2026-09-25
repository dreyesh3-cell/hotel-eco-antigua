CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`confirmation_code` text NOT NULL,
	`guest_name` text NOT NULL,
	`guest_email` text NOT NULL,
	`guest_phone` text,
	`room_type` text NOT NULL,
	`check_in` text NOT NULL,
	`check_out` text NOT NULL,
	`guests` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'CONFIRMADA' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reservations_confirmation_code_unique` ON `reservations` (`confirmation_code`);
--> statement-breakpoint
CREATE INDEX `idx_reservations_room_status_dates` ON `reservations` (`room_type`,`status`,`check_in`,`check_out`);
--> statement-breakpoint
CREATE INDEX `idx_reservations_lookup` ON `reservations` (`confirmation_code`,`guest_email`);
