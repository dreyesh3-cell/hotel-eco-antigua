CREATE TABLE IF NOT EXISTS reservations (
  id text PRIMARY KEY,
  confirmation_code text NOT NULL UNIQUE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  room_type text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL,
  total integer NOT NULL,
  status text NOT NULL DEFAULT 'CONFIRMADA',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_room_status_dates
  ON reservations (room_type, status, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_lookup
  ON reservations (confirmation_code, guest_email);
