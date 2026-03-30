-- Create game_events table
CREATE TABLE game_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  game        text not null,
  event_type  text not null,
  x           float,
  y           float,
  target      text,
  session_id  uuid not null,
  duration_ms int
);

-- Enable RLS
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only
CREATE POLICY "Allow anonymous inserts" ON game_events
  FOR INSERT
  TO anon
  WITH CHECK (true);
