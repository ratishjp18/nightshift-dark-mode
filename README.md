# 🌙 NightShift Dark Mode

A Chrome extension that toggles dark mode on any website.  
Per-site preferences are stored in a local **Python Flask** backend (SQLite).

---

## Requirements

### Python backend
| Requirement | Version |
|-------------|---------|
| Python      | 3.9 +   |
| Flask       | 3.0.3   |
| Flask-CORS  | 4.0.1   |
| Pillow *(icon generation only)* | any recent |

### Chrome extension
| Requirement | Notes |
|-------------|-------|
| Google Chrome | Manifest V3 support (Chrome 88+) |
| Developer mode | Enabled in `chrome://extensions` |

---

## Project structure

```
nightshift-dark-mode/
├── extension/               ← Load this folder in Chrome
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   └── icons/               ← created by generate_icons.py
├── backend/
│   ├── app.py               ← Flask REST API
│   └── requirements.txt
├── generate_icons.py        ← run once to create toolbar icons
└── README.md
```

---

## Setup

### 1 — Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2 — Generate toolbar icons (one-time)

```bash
pip install Pillow
python generate_icons.py
```

### 3 — Start the backend

```bash
python backend/app.py
```

API runs at `http://localhost:5000`.  
The extension works without it (falls back to `chrome.storage.local`), but preferences won't survive a browser data clear.

### 4 — Load the extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the **`extension/`** folder

The 🌙 icon appears in your toolbar. Click it to toggle dark mode on any site.

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/preferences` | All saved preferences |
| `GET` | `/api/preferences/<domain>` | Preference for one domain |
| `POST` | `/api/preferences` | Save / update `{ domain, enabled }` |
| `DELETE` | `/api/preferences/<domain>` | Remove a preference |

---

## How it works

| Component | Role |
|-----------|------|
| `content.js` | Injected into every page. Reads `chrome.storage.local` and applies `filter: invert + hue-rotate` CSS. Re-inverts images/videos so photos look natural. |
| `popup.js` | Reads the active tab's domain, toggles dark mode, syncs to both local storage and the Flask API. Shows a live online/offline indicator. |
| `background.js` | Service worker. On install, pulls all backend preferences into `chrome.storage.local` so dark mode applies before the popup is ever opened. |
| `backend/app.py` | Flask REST API backed by SQLite — CRUD for domain preferences. |

---

## Notes

- The backend only listens on `127.0.0.1` — it is not exposed to the network.
- The extension works fully **offline**; the backend is optional but recommended for durability.
