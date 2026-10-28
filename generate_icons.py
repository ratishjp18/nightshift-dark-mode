"""
generate_icons.py — NightShift Dark Mode
Generates PNG toolbar icons using the golden crescent moon design.

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
    """Draw a golden crescent moon, centered and fully within the canvas."""
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Scale so the crescent fills ~85% of the icon with even padding on all sides
    # Crescent visible bounding box ≈ 140 SVG units wide/tall
    scale = (size * 0.85) / 140

    r = int(70 * scale)   # outer moon radius

    # Center the moon in the canvas
    cx = size // 2
    cy = size // 2

    # Cutout offset relative to moon center
    # In SVG: cutout center (126,76) minus moon center (90,100) = (+36, -24)
    cx2 = cx + int(36  * scale)
    cy2 = cy + int(-24 * scale)
    r2  = int(58 * scale)   # cutout radius

    # Draw moon body
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(252, 216, 75, 255))

    # Carve out crescent by drawing transparent circle
    draw.ellipse([cx2 - r2, cy2 - r2, cx2 + r2, cy2 + r2], fill=(0, 0, 0, 0))

    return img


for sz in [16, 48, 128]:
    path = os.path.join(OUT_DIR, f"icon{sz}.png")
    make_icon(sz).save(path, "PNG")
    print(f"  ✅  Saved {path}")

print("\n🌙  Icons generated. Reload the extension in Chrome.\n")
