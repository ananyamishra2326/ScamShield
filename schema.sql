-- Scam Shield Database Schema (SQLite compatible)

CREATE TABLE IF NOT EXISTS incident_reports (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_type   TEXT    NOT NULL,
    incident_date   TEXT    NOT NULL,
    description     TEXT    NOT NULL,
    submitted_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
