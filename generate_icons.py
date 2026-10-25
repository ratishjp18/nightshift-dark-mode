"""
generate_icons.py — NightShift Dark Mode
Generates the three PNG toolbar icons the Chrome extension needs.

Run once before loading the extension:
    pip install Pillow
    python generate_icons.py
"""

import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Pillow is required.  Install it with:  pip install Pillow")
    sys.exit(1)

OUT_DIR = os.path.join(os.path.dirname(__file__), "extension", "icons")
os.makedirs(OUT_DIR, exist_ok=True)


def make_icon(size: int) -> Image.Image:
    """Draw a crescent moon on a dark-blue circle."""
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad  = max(1, size // 10)

    # Background circle — deep navy
    draw.ellipse([pad, pad, size - pad, size - pad], fill=(15, 25, 60, 255))

    # Moon body — warm cream/yellow
    cx, cy = size // 2, size // 2
    r = max(3, int(size * 0.30))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 232, 140, 255))

    # Overlay circle offset to carve out a crescent
    sr = max(2, int(r * 0.82))
    dx = max(1, int(r * 0.48))
    dy = max(1, int(r * 0.08))
    draw.ellipse([cx - sr + dx, cy - sr - dy, cx + sr + dx, cy + sr - dy],
                 fill=(15, 25, 60, 255))

    # Stars (only visible at 48 px and above)
    if size >= 48:
        sc = (200, 220, 255, 180)
        sr2 = max(1, size // 28)
        for sx, sy in [(0.70, 0.22), (0.80, 0.44), (0.68, 0.64), (0.58, 0.18)]:
            x, y = int(sx * size), int(sy * size)
            draw.ellipse([x - sr2, y - sr2, x + sr2, y + sr2], fill=sc)

    return img


for sz in [16, 48, 128]:
    path = os.path.join(OUT_DIR, f"icon{sz}.png")
    make_icon(sz).save(path, "PNG")
    print(f"  ✅  {path}")

print("\n🌙  Icons ready. Load the extension/ folder in Chrome.\n")
