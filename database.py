"""
database.py – SQLite helper for Scam Shield.

Provides get_db_connection() that returns a sqlite3 connection
configured with row_factory so rows behave like dicts.
Also initialises the schema on first run.
"""

import sqlite3
import os

# Store the database file alongside this module
DB_PATH = os.path.join(os.path.dirname(__file__), "scam_shield.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")


def get_db_connection() -> sqlite3.Connection:
    """Return an open SQLite connection with dict-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables if they don't exist yet (safe to call on every startup)."""
    with get_db_connection() as conn:
        if os.path.exists(SCHEMA_PATH):
            with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
                conn.executescript(f.read())
        else:
            # Inline fallback schema
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS incident_reports (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    incident_type   TEXT    NOT NULL,
                    incident_date   TEXT    NOT NULL,
                    description     TEXT    NOT NULL,
                    submitted_at    TEXT    NOT NULL DEFAULT (datetime('now'))
                );
            """)
        conn.commit()
