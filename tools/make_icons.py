"""
Crée les icônes du site à partir du flacon du logo (public/brand/logo-mark.png) :
  src/app/favicon.ico   onglet du navigateur (16, 32, 48 px)
  src/app/icon.png      icône 512 px (Android, Google)
  src/app/apple-icon.png  écran d'accueil iPhone (180 px)

Usage :  python tools/make_icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
MARK = ROOT / "public" / "brand" / "logo-mark.png"
APP = ROOT / "src" / "app"
PAPER = (244, 238, 230, 255)


def badge(size, round_=True, bold=0):
    """Le flacon centré sur un fond crème (rond ou carré plein)."""
    s = size * 4  # dessin en grand puis réduction : bords nets
    bg = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(bg)
    (d.ellipse if round_ else d.rectangle)((0, 0, s - 1, s - 1), fill=PAPER)
    mark = Image.open(MARK).convert("RGBA")
    if bold:  # petites tailles : traits épaissis pour rester lisibles
        # seuls les traits sombres sont épaissis, pas la tache rose
        a = Image.eval(mark.convert("L"), lambda v: 255 if v < 110 else 0)
        a = Image.composite(a, Image.new("L", mark.size, 0), mark.getchannel("A")).filter(ImageFilter.MaxFilter(bold))
        dark = Image.new("RGBA", mark.size, (28, 21, 32, 255))
        lines = Image.composite(dark, Image.new("RGBA", mark.size, (0, 0, 0, 0)), a)
        mark = Image.alpha_composite(lines, mark)
    k = min(s * 0.62 / mark.width, s * 0.66 / mark.height)  # agrandit ou réduit pour remplir le rond
    mark = mark.resize((round(mark.width * k), round(mark.height * k)), Image.LANCZOS)
    bg.alpha_composite(mark, ((s - mark.width) // 2, (s - mark.height) // 2))
    return bg.resize((size, size), Image.LANCZOS)


def main():
    badge(512).save(APP / "icon.png")
    badge(180, round_=False).convert("RGB").save(APP / "apple-icon.png")
    small = [badge(n, bold=5) for n in (16, 32, 48)]
    small[2].save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=small[:2])
    print("icônes créées dans", APP)


if __name__ == "__main__":
    main()
