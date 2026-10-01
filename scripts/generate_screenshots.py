import os
from PIL import Image, ImageDraw

os.makedirs('screenshots', exist_ok=True)

def create_card(title, subtitle, accent_color, filename):
    img = Image.new('RGB', (1280, 720), color='#060913')
    draw = ImageDraw.Draw(img)

    for y in range(720):
        if y < 450:
            r = int(6 + (24 - 6) * (y / 450.0))
            g = int(9 + (36 - 9) * (y / 450.0))
            b = int(19 + (68 - 19) * (y / 450.0))
        elif y < 580:
            t = (y - 450) / 130.0
            r = int(24 + (160 - 24) * t)
            g = int(36 + (60 - 36) * t)
            b = int(68 + (30 - 68) * t)
        else:
            t = (y - 580) / 140.0
            r = int(160 + (8 - 160) * t)
            g = int(60 + (10 - 60) * t)
            b = int(30 + (16 - 30) * t)
        draw.line([(0, y), (1280, y)], fill=(r, g, b))

    # Pylon silhouette
    draw.polygon([(180, 280), (160, 640), (200, 640)], fill='#04060c')
    draw.polygon([(1100, 220), (1075, 640), (1125, 640)], fill='#03050a')

    # Navigation header
    draw.rectangle([0, 0, 1280, 64], fill='#060913d0')
    draw.text((40, 22), "VOLTX // AETHER-01 PRO", fill='#ffffff')
    draw.text((280, 24), "• GRID ACTIVE 99.8%", fill=accent_color)

    # Title
    draw.text((60, 140), title, fill='#ffffff')
    draw.text((60, 180), subtitle, fill='#94a3b8')

    out_path = os.path.join('screenshots', filename)
    img.save(out_path)
    print(f"Created {out_path}")

cards = [
    ("VOLTX AETHER-01 PRO SHOWCASE", "Hero Layout, Atmospheric Sunset Backdrop & 3D Stage", "#ff7e29", "01-hero-showcase.png"),
    ("DYNAMIC PRODUCT VARIANTS", "Multi-State Morphing across Obsidian, Solar, & Aurora", "#00f2fe", "02-variant-selection.png"),
    ("INTERACTIVE FEATURE HOTSPOTS", "Expandable Micro-Engineered Diagnostics & Specs", "#00ffa3", "03-interactive-hotspots.png"),
    ("EXPLODED ENGINEERING MODE", "Layered 3D Deconstruction with Live Waveform", "#ff7e29", "04-exploded-view.png"),
    ("SPECIFICATION COMPARISON MATRIX", "Side-by-side Flagship Comparison Modal", "#38bdf8", "05-comparison-matrix.png")
]

for title, sub, color, fname in cards:
    create_card(title, sub, color, fname)