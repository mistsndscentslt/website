"""
Prépare les photos produits pour le site.

Usage :
  1. Déposez vos captures (PNG/JPG) dans le dossier  images_a_traiter/
     en les nommant comme l'id du parfum :  asad-bourbon.png, khamrah.png ...
     (une 2e photo du même parfum : asad-bourbon-2.png, puis ajoutez "asad-bourbon-2" dans "images")
  2. Lancez :  python tools/prepare_images.py
     Option --brut si l'image n'est PAS une capture Telegram (pas de barre de prix à retirer).

Résultat : public/products/full/<nom>.webp (grande image)
           public/products/thumbs/<nom>.webp (miniature 400x500)
Les originaux traités sont déplacés dans images_a_traiter/traitees/.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / "images_a_traiter"
DONE = INBOX / "traitees"
FULL = ROOT / "public" / "products" / "full"
THUMBS = ROOT / "public" / "products" / "thumbs"
BAR = 56  # hauteur de la barre « prix / heure » des captures Telegram
TELEGRAM_BG = (36, 38, 38)


def is_telegram_dark(px):
    return sum(abs(a - b) for a, b in zip(px, TELEGRAM_BG)) < 40


def crop_telegram(im):
    w, h = im.size
    c = im.crop((0, 0, w, h - BAR))
    # retire les marges sombres du fond de discussion (gauche / droite / haut)
    px = c.load()
    mid = c.height // 2
    x0, x1, y0 = 0, c.width - 1, 0
    while x0 < c.width * 0.25 and is_telegram_dark(px[x0, mid]):
        x0 += 1
    while x1 > c.width * 0.75 and is_telegram_dark(px[x1, mid]):
        x1 -= 1
    while y0 < c.height * 0.1 and is_telegram_dark(px[(x0 + x1) // 2, y0]):
        y0 += 1
    inset = 10  # coins arrondis
    return c.crop((x0 + inset, y0 + inset, x1 - inset, c.height))


def main():
    raw = "--brut" in sys.argv
    for d in (FULL, THUMBS, DONE):
        d.mkdir(parents=True, exist_ok=True)
    files = [f for f in INBOX.iterdir() if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")]
    if not files:
        print("Aucune image dans", INBOX)
        return
    for f in files:
        im = Image.open(f).convert("RGB")
        if not raw:
            im = crop_telegram(im)
        name = f.stem.lower().replace(" ", "-")
        im.save(FULL / f"{name}.webp", quality=88)
        ImageOps.fit(im, (400, 500), Image.LANCZOS, centering=(0.5, 0.45)).save(THUMBS / f"{name}.webp", quality=82)
        f.rename(DONE / f.name)
        print("OK", name)


if __name__ == "__main__":
    main()
