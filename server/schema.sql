CREATE TABLE IF NOT EXISTS team_members (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chores (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT NOT NULL,
  description      TEXT,
  assignee_id      INTEGER NOT NULL REFERENCES team_members(id) ON DELETE RESTRICT,
  start_date       TEXT NOT NULL,
  end_date         TEXT,
  recurrence_type  TEXT NOT NULL DEFAULT 'none',
  recurrence_days  TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chore_completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  chore_id     INTEGER NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  date         TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(chore_id, date)
);

CREATE INDEX IF NOT EXISTS idx_completions_chore_date
  ON chore_completions(chore_id, date);
