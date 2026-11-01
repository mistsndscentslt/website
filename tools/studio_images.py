"""
Transforme les photos produits en « packshots » studio : le flacon est détouré
(fond, mains, décor retirés) et enregistré sur fond transparent. Le site
l'affiche ensuite sur un fond studio uniforme.

Prérequis (une seule fois) :  python -m pip install "rembg[cpu]" opencv-python-headless

Usage :
  python tools/studio_images.py                 → traite tous les parfums
  python tools/studio_images.py khamrah eclaire → seulement ceux-là

Source  : images_a_traiter/originaux/<id>.webp  (copie des photos d'origine)
          (à défaut : public/products/full/<id>.webp)
Résultat: public/products/cut/<id>.webp     (flacon sur fond transparent, ~1000 px de haut)
          public/products/studio/<id>.jpg   (flacon sur fond studio, pour les aperçus WhatsApp / Google)

  python tools/studio_images.py --studio      → régénère seulement les JPG studio depuis cut/
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
ORIG = ROOT / "images_a_traiter" / "originaux"
FULL = ROOT / "public" / "products" / "full"
CUT = ROOT / "public" / "products" / "cut"
STUDIO = ROOT / "public" / "products" / "studio"
TARGET_H = 1000

# Réglages au cas par cas quand le détourage automatique garde du décor ou une main :
#   crop   : (gauche, haut, droite, bas) en fractions de la photo, appliqué avant le détourage
#   single : ne garder que le plus grand élément (le flacon), pas la boîte ni le décor
#   src    : utiliser une autre photo du même parfum (ex : "khair-fusion-2")
#   post   : (gauche, haut, droite, bas) recadrage APRÈS détourage (pour couper une main sur le côté)
#   fade   : à partir de quelle hauteur (0-1) le bas du flacon se fond dans le fond (main en bas)
#   model  : autre modèle de détourage rembg (ex : "u2net" pour le verre translucide)
TWEAKS: dict[str, dict] = {
    "cafe-n-cream": {"single": True},
    "diwani-beirut": {"single": True},
    "marshmallow-blush": {"single": True},
    "khair-peach-delulu": {"src": "khair-peach-delulu-2"},
    "hayaati-rose": {"crop": (0, 0, 1, 0.86), "single": True},
    "hayaati-royale": {"crop": (0.05, 0, 0.82, 1), "single": True},
    "asad-bourbon": {"crop": (0.3, 0, 1, 1), "single": True},
    "9pm-rebel": {"model": "u2net", "post": (0, 0, 0.8, 1), "fade": 0.62},
    "ophylia": {"crop": (0, 0, 0.82, 1)},
    "khair-fusion": {"src": "khair-fusion-2", "post": (0.515, 0, 1, 1), "fade": 0.5},
}


def clean_alpha(rgba: Image.Image, single=False) -> Image.Image:
    a = np.array(rgba.getchannel("A"))
    a[a < 40] = 0
    # garde le flacon (et sa boîte / pochette), jette les petits restes (doigts, texte, reflets)
    n, labels, stats, _ = cv2.connectedComponentsWithStats((a > 128).astype(np.uint8), connectivity=8)
    if n > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        keep = [i + 1 for i, s in enumerate(areas) if s >= areas.max() * (0.999 if single else 0.12)]
        mask = np.isin(labels, keep).astype(np.uint8)
        mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))  # conserve le bord adouci
        a = a * mask
    out = rgba.copy()
    out.putalpha(Image.fromarray(a))
    return out


def process(src: Path, session, crop=None, single=False, post=None, fade=None, model=None) -> Image.Image:
    if model:
        session = new_session(model)
    im = Image.open(src).convert("RGB")
    if crop:
        l, t, r, b = crop
        im = im.crop((round(im.width * l), round(im.height * t), round(im.width * r), round(im.height * b)))
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    cut = clean_alpha(remove(im, session=session), single)
    box = cut.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    cut = cut.crop(box)
    if post:
        l, t, r, b = post
        cut = cut.crop((round(cut.width * l), round(cut.height * t), round(cut.width * r), round(cut.height * b)))
    if fade:
        a = np.array(cut.getchannel("A")).astype(np.float32)
        y0 = int(cut.height * fade)
        ramp = np.linspace(1, 0, cut.height - y0, dtype=np.float32) ** 1.6
        a[y0:] *= ramp[:, None]
        cut.putalpha(Image.fromarray(a.astype(np.uint8)))
        cut = cut.crop(cut.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox())
    pad = int(max(cut.size) * 0.03)
    canvas = Image.new("RGBA", (cut.width + pad * 2, cut.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(cut, (pad, pad))
    scale = TARGET_H / canvas.height
    canvas = canvas.resize((round(canvas.width * scale), TARGET_H), Image.LANCZOS)
    rgb = canvas.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=3))
    # bords plus doux : supprime le liseré et les crans laissés par le détourage
    alpha = canvas.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    rgb.putalpha(alpha)
    return rgb


def studio_jpg(cut: Image.Image, size=1200) -> Image.Image:
    """Pose le flacon sur un fond ivoire éclairé, avec une ombre au sol."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    d = np.sqrt(((x - size / 2) / (size * 0.75)) ** 2 + ((y - size * 0.2) / (size * 0.85)) ** 2).clip(0, 1)[..., None]
    light, dark = np.array([246, 239, 229], np.float32), np.array([226, 212, 194], np.float32)
    bg = Image.fromarray((light * (1 - d) + dark * d).astype(np.uint8)).convert("RGBA")
    h = int(size * 0.74)
    w = round(cut.width * h / cut.height)
    if w > size * 0.8:
        w = int(size * 0.8)
        h = round(cut.height * w / cut.width)
    bottle = cut.resize((w, h), Image.LANCZOS)
    floor = int(size * 0.88)
    shadow = Image.new("L", (size, size), 0)
    sw = int(w * 0.9)
    cv = np.array(shadow)
    cv2.ellipse(cv, (size // 2, floor), (sw // 2, max(8, sw // 12)), 0, 0, 360, 110, -1)
    shadow = Image.fromarray(cv).filter(ImageFilter.GaussianBlur(size // 50))
    bg.paste(Image.new("RGBA", (size, size), (70, 45, 30, 255)), (0, 0), shadow)
    bg.alpha_composite(bottle, ((size - w) // 2, floor - h))
    return bg.convert("RGB")


def build_studio(names):
    STUDIO.mkdir(parents=True, exist_ok=True)
    for name in names:
        src = CUT / f"{name}.webp"
        if src.exists():
            studio_jpg(Image.open(src).convert("RGBA")).save(STUDIO / f"{name}.jpg", quality=86, optimize=True)


def main():
    if "--studio" in sys.argv:
        build_studio(sorted(f.stem for f in CUT.glob("*.webp")))
        print("Studio OK")
        return
    CUT.mkdir(parents=True, exist_ok=True)
    session = new_session("isnet-general-use")
    # les photos secondaires (« -2 ») ne sont pas des parfums à part entière
    names = sys.argv[1:] or sorted({f.stem for f in [*ORIG.glob("*.webp"), *FULL.glob("*.webp")] if not f.stem.endswith("-2")})
    for name in names:
        tweak = dict(TWEAKS.get(name, {}))
        src = ORIG / f"{tweak.pop('src', name)}.webp"
        if not src.exists():
            src = FULL / f"{name}.webp"
        if not src.exists():
            print("introuvable :", name)
            continue
        process(src, session, **tweak).save(CUT / f"{name}.webp", quality=90, method=6)
        build_studio([name])
        print("OK", name)


if __name__ == "__main__":
    main()
