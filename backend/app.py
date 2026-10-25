"""
NightShift Dark Mode — Python Flask Backend
Stores per-domain dark mode preferences in a local SQLite database.

Usage:
    pip install -r requirements.txt
    python app.py

Endpoints:
    GET    /api/health                  health check
    GET    /api/preferences             list all preferences
    GET    /api/preferences/<domain>    get one domain
    POST   /api/preferences             save / update  { domain, enabled }
    DELETE /api/preferences/<domain>    remove a preference
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)   # Allow the Chrome extension (any origin) to call this API

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preferences.db")


# ── Database helpers ──────────────────────────────────────────────────────────

def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS preferences (
                domain     TEXT PRIMARY KEY,
                enabled    INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()
    print(f"  Database ready: {DB_PATH}")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "NightShift Dark Mode API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


@app.route("/api/preferences", methods=["GET"])
def get_all():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT domain, enabled, updated_at FROM preferences ORDER BY updated_at DESC"
        ).fetchall()
    return jsonify([
        {"domain": r["domain"], "enabled": bool(r["enabled"]), "updated_at": r["updated_at"]}
        for r in rows
    ])


@app.route("/api/preferences/<path:domain>", methods=["GET"])
def get_one(domain: str):
    with get_db() as conn:
        row = conn.execute(
            "SELECT domain, enabled, updated_at FROM preferences WHERE domain = ?", (domain,)
        ).fetchone()
    if row:
        return jsonify({"domain": domain, "enabled": bool(row["enabled"]), "updated_at": row["updated_at"]})
    return jsonify({"domain": domain, "enabled": False, "updated_at": None})


@app.route("/api/preferences", methods=["POST"])
def save():
    data = request.get_json(silent=True)
    if not data or not data.get("domain"):
        return jsonify({"error": "'domain' is required"}), 400

    domain  = data["domain"].strip().lower()
    enabled = bool(data.get("enabled", False))

    with get_db() as conn:
        conn.execute("""
            INSERT INTO preferences (domain, enabled, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(domain) DO UPDATE SET
                enabled    = excluded.enabled,
                updated_at = excluded.updated_at
        """, (domain, int(enabled)))
        conn.commit()

    icon = "🌙" if enabled else "☀️ "
    print(f"  {icon}  {domain}: dark mode {'enabled' if enabled else 'disabled'}")
    return jsonify({"status": "ok", "domain": domain, "enabled": enabled})


@app.route("/api/preferences/<path:domain>", methods=["DELETE"])
def delete(domain: str):
    with get_db() as conn:
        conn.execute("DELETE FROM preferences WHERE domain = ?", (domain,))
        conn.commit()
    print(f"  🗑️   Deleted preference for: {domain}")
    return jsonify({"status": "ok", "domain": domain, "deleted": True})


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print()
    print("╔══════════════════════════════════════╗")
    print("║   🌙  NightShift Dark Mode API  🌙   ║")
    print("╠══════════════════════════════════════╣")
    print("║  http://localhost:5000               ║")
    print("║  Press Ctrl+C to stop                ║")
    print("╚══════════════════════════════════════╝")
    print()
    app.run(debug=False, port=5000, host="127.0.0.1")
