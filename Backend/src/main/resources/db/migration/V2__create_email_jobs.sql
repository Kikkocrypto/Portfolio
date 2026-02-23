CREATE TABLE IF NOT EXISTS email_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  contact_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at_ms BIGINT NOT NULL,
  locked_at_ms BIGINT,
  last_error TEXT,
  created_at_ms BIGINT NOT NULL,
  updated_at_ms BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_status_next_attempt
  ON email_jobs(status, next_attempt_at_ms);

CREATE INDEX IF NOT EXISTS idx_email_jobs_locked_at
  ON email_jobs(status, locked_at_ms);
