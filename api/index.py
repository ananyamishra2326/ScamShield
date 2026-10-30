"""
api/index.py  –  Scam Shield serverless API for Vercel
-------------------------------------------------------
Database strategy:
  • If DATABASE_URL env var is set  →  PostgreSQL  (persistent, recommended for prod)
  • Otherwise                       →  SQLite in /tmp  (ephemeral, fine for demos)

To add a free persistent database:
  1. Create a free Neon DB at https://neon.tech
  2. Copy the connection string
  3. Add it as DATABASE_URL in Vercel Project Settings → Environment Variables
"""

import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL", "")

# ─────────────────────────────────────────────
# Database helpers
# ─────────────────────────────────────────────

def _sqlite_path() -> str:
    """SQLite path: /tmp on Vercel (writable), project root locally."""
    if os.environ.get("VERCEL"):
        return "/tmp/scam_shield.db"
    # Local dev fallback: same folder as this file's parent
    return os.path.join(os.path.dirname(__file__), "..", "scam_shield.db")


def init_db() -> None:
    """Create the incidents table if it doesn't exist."""
    if DATABASE_URL:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS incident_reports (
                id            SERIAL PRIMARY KEY,
                incident_type TEXT        NOT NULL,
                incident_date TEXT        NOT NULL,
                description   TEXT        NOT NULL,
                submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
    else:
        conn = sqlite3.connect(_sqlite_path())
        conn.execute("""
            CREATE TABLE IF NOT EXISTS incident_reports (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_type TEXT NOT NULL,
                incident_date TEXT NOT NULL,
                description   TEXT NOT NULL,
                submitted_at  TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()
        conn.close()


# Initialise on cold-start
init_db()


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    db_type = "postgresql" if DATABASE_URL else "sqlite"
    return jsonify({"status": "ok", "db": db_type}), 200


@app.route("/api/report", methods=["POST"])
def report():
    data = request.get_json(silent=True) or {}

    incident_type = data.get("incident_type", "").strip()
    incident_date = data.get("incident_date", "").strip()
    description   = data.get("description",   "").strip()

    if not incident_type or not incident_date or not description:
        return jsonify({"error": "All fields are required"}), 400

    try:
        if DATABASE_URL:
            import psycopg2
            conn = psycopg2.connect(DATABASE_URL)
            cur  = conn.cursor()
            cur.execute(
                """
                INSERT INTO incident_reports (incident_type, incident_date, description)
                VALUES (%s, %s, %s)
                """,
                (incident_type, incident_date, description),
            )
            conn.commit()
            cur.close()
            conn.close()
        else:
            conn = sqlite3.connect(_sqlite_path())
            conn.execute(
                """
                INSERT INTO incident_reports (incident_type, incident_date, description)
                VALUES (?, ?, ?)
                """,
                (incident_type, incident_date, description),
            )
            conn.commit()
            conn.close()

        return jsonify({"message": "Report saved successfully!"}), 201

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/reports", methods=["GET"])
def get_reports():
    """Return all saved reports (for testing / admin use)."""
    try:
        if DATABASE_URL:
            import psycopg2
            import psycopg2.extras
            conn = psycopg2.connect(DATABASE_URL)
            cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(
                "SELECT * FROM incident_reports ORDER BY submitted_at DESC"
            )
            rows = [dict(r) for r in cur.fetchall()]
            # Make timestamps JSON-serialisable
            for row in rows:
                if hasattr(row.get("submitted_at"), "isoformat"):
                    row["submitted_at"] = row["submitted_at"].isoformat()
            cur.close()
            conn.close()
        else:
            conn = sqlite3.connect(_sqlite_path())
            conn.row_factory = sqlite3.Row
            rows = [
                dict(r)
                for r in conn.execute(
                    "SELECT * FROM incident_reports ORDER BY submitted_at DESC"
                ).fetchall()
            ]
            conn.close()

        return jsonify(rows), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ─────────────────────────────────────────────
# Local dev entry-point (not used by Vercel)
# ─────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
