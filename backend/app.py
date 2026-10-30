"""
backend/app.py – Scam Shield Flask API
Uses SQLite via ../database.py (no external DB server required).
"""

import sys
import os

# Allow importing database.py from the parent directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db

app = Flask(__name__)
CORS(app)  # Allow requests from the frontend (file:// or localhost)


# ──────────────────────────────────────────────
# Initialise database on startup
# ──────────────────────────────────────────────
init_db()


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return "Scam Shield Backend is Running!"


@app.route("/api/report", methods=["POST"])
def report():
    data = request.get_json(silent=True) or {}

    incident_type = data.get("incident_type", "").strip()
    incident_date = data.get("incident_date", "").strip()
    description   = data.get("description",   "").strip()

    if not incident_type or not incident_date or not description:
        return jsonify({"error": "All fields are required"}), 400

    try:
        with get_db_connection() as conn:
            conn.execute(
                """
                INSERT INTO incident_reports (incident_type, incident_date, description)
                VALUES (?, ?, ?)
                """,
                (incident_type, incident_date, description),
            )
            conn.commit()

        return jsonify({"message": "Report saved successfully!"}), 201

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/reports", methods=["GET"])
def get_reports():
    """Optional: return all saved reports (useful for testing)."""
    try:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT * FROM incident_reports ORDER BY submitted_at DESC"
            ).fetchall()
        return jsonify([dict(row) for row in rows]), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)