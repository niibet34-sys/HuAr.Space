CREATE TABLE IF NOT EXISTS thoughts (
  id TEXT PRIMARY KEY,
  thought TEXT NOT NULL CHECK(length(thought) <= 280),
  display_name TEXT NOT NULL CHECK(length(display_name) <= 60),
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  source_referral TEXT,
  source_channel TEXT,
  optional_email TEXT,
  consent_public INTEGER NOT NULL DEFAULT 0,
  share_token TEXT NOT NULL UNIQUE,
  epoch INTEGER NOT NULL DEFAULT 2030
);
CREATE INDEX IF NOT EXISTS idx_thoughts_status_created ON thoughts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thoughts_referral ON thoughts(source_referral);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  thought_id TEXT,
  referral_token TEXT,
  session_id TEXT,
  metadata_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_name_created ON analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_referral ON analytics_events(referral_token);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_hash TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);