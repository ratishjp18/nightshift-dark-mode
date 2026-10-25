# How to Run NightShift Dark Mode

---

## First Time Setup

**Terminal 1 — Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**Terminal 1 — Install Pillow and generate icons (one-time only)**
```bash
cd ..
pip install Pillow
python generate_icons.py
```

---

## Every Time You Use It

**Terminal 1 — Start the Python backend**
```bash
cd backend
python app.py
```
> Keep this terminal open. Do not close it.

---

## Load the Extension in Chrome (one-time only)

1. Open Chrome
2. Go to `chrome://extensions`
3. Turn on **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select this folder: `nightshift-dark-mode\extension`
6. Click the puzzle 🧩 icon in Chrome toolbar → pin **NightShift**

---

## Test It

1. Go to any website e.g. `https://google.com`
2. Click the 🌙 icon in the toolbar
3. Toggle **Dark Mode** on
4. Open a new terminal to verify it saved:

**Terminal 2 — Check saved preferences**
```bash
curl http://localhost:5000/api/preferences
```

---

## Stop the Backend

Go to **Terminal 1** and press:
```
Ctrl + C
```
