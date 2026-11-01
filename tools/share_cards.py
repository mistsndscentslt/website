"""
Crée les cartes d'aperçu des liens partagés (WhatsApp, Facebook, Google…) :
une image 1200 x 630 par parfum, une pour l'accueil et une par occasion.
La photo d'origine est posée entière dans un cadre, sans retouche.

Usage :  python tools/share_cards.py
Résultat : public/og/<id>.jpg, accueil.jpg, occasion-<slug>.jpg, accord-<slug>.jpg

À relancer après chaque ajout de parfum ou changement de prix.
Polices : Bodoni MT et Segoe UI (Windows).
"""
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FULL = ROOT / "public" / "products" / "full"
OUT = ROOT / "public" / "og"
LOGO = ROOT / "public" / "brand" / "logo-mark-light.png"
FONTS = Path("C:/Windows/Fonts")

W, H = 1200, 630
INK, INK2 = (28, 21, 32), (38, 28, 43)
PAPER, ROSE, GOLD, MUTED = (244, 238, 230), (230, 184, 192), (217, 192, 150), (160, 150, 165)


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


SERIF, SERIF_I = "BOD_R.TTF", "BOD_I.TTF"
SANS, SANS_B = "segoeui.ttf", "segoeuib.ttf"


def load_products():
    src = (ROOT / "src" / "data" / "products.ts").read_text(encoding="utf-8")
    body = src[src.index("export const PRODUCTS") :]
    out = []
    for block in re.split(r"\n  \},?\n", body):
        m = re.search(r'id: "([^"]+)", nom: "([^"]+)", marque: "([^"]*)", prix: (\d+)', block)
        if not m:
            continue
        images = re.findall(r'"([^"]+)"', re.search(r"images: \[([^\]]*)\]", block).group(1))
        accords = re.findall(r'"([^"]+)"', re.search(r"accords: \[([^\]]*)\]", block).group(1))
        out.append({"id": m[1], "nom": m[2], "marque": m[3], "prix": int(m[4]), "images": images, "accords": accords})
    return out


def load_occasions():
    src = (ROOT / "src" / "data" / "occasions.ts").read_text(encoding="utf-8")
    out = []
    for block in src.split('    slug: "')[1:]:
        slug = block[: block.index('"')]
        titre = re.search(r'titre: "([^"]+)"', block)[1]
        accroche = re.search(r'accroche: "([^"]+)"', block)[1]
        picks = re.findall(r'\{ id: "([^"]+)"', block)
        out.append({"slug": slug, "titre": titre, "accroche": accroche, "picks": picks})
    return out


def load_list(file, fields):
    """Extrait les blocs { slug: "…", … } d'un fichier de données (ex : accords.ts)."""
    src = (ROOT / "src" / "data" / file).read_text(encoding="utf-8")
    out = []
    for block in src.split('    slug: "')[1:]:
        item = {"slug": block[: block.index('"')]}
        for f in fields:
            m = re.search(rf'{f}: "([^"]+)"', block)
            item[f] = m[1] if m else ""
        ids = re.search(r"ids: \[([^\]]*)\]", block)
        item["ids"] = re.findall(r'"([^"]+)"', ids[1]) if ids else []
        out.append(item)
    return out


def price(n):
    return f"{n:,}".replace(",", " ") + " FCFA"


def photo(name):
    return Image.open(FULL / f"{name}.webp").convert("RGB")


def framed(im, box_w, box_h, border=3):
    """La photo entière, réduite pour tenir dans la boîte, avec un liseré clair."""
    im = im.copy()
    im.thumbnail((box_w - border * 2, box_h - border * 2), Image.LANCZOS)
    f = Image.new("RGB", (im.width + border * 2, im.height + border * 2), PAPER)
    f.paste(im, (border, border))
    return f


def wrap(draw, text, fnt, max_w):
    lines, line = [], ""
    for word in text.split():
        test = f"{line} {word}".strip()
        if draw.textlength(test, font=fnt) <= max_w:
            line = test
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def spaced(draw, xy, text, fnt, fill, spacing=4):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + spacing
    return x


def base():
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    # halo chaud derrière la photo
    glow = Image.new("RGB", (W, H), INK)
    gd = ImageDraw.Draw(glow)
    for r in range(320, 0, -8):
        t = 1 - r / 320
        c = tuple(int(INK[i] + (INK2[i] + 10 - INK[i]) * t) for i in range(3))
        gd.ellipse((270 - r, 315 - r, 270 + r, 315 + r), fill=c)
    im.paste(glow)
    return im, ImageDraw.Draw(im)


def signature(im, d, x, y):
    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((34, 40))
    im.paste(logo, (x, y - 4), logo)
    d.text((x + 46, y), "Mists & Scents", font=font(SERIF, 30), fill=PAPER)


def product_card(p):
    im, d = base()
    f = framed(photo(p["images"][0]), 470, 560)
    im.paste(f, ((540 - f.width) // 2, (H - f.height) // 2))
    x, maxw = 600, 540
    spaced(d, (x, 70), "MISTS & SCENTS HOUSE  ·  LOMÉ", font(SANS, 17), GOLD, 3)
    y = 140
    if p["marque"]:
        spaced(d, (x, y), p["marque"].upper(), font(SANS_B, 19), ROSE, 3)
        y += 44
    size = 66 if len(p["nom"]) < 22 else 54
    for line in wrap(d, p["nom"], font(SERIF, size), maxw)[:3]:
        d.text((x, y), line, font=font(SERIF, size), fill=PAPER)
        y += int(size * 1.08)
    y += 14
    d.text((x, y), " · ".join(p["accords"][:4]), font=font(SANS, 24), fill=MUTED)
    d.text((x, 410), price(p["prix"]), font=font(SERIF, 58), fill=ROSE)
    d.line((x, 505, x + maxw, 505), fill=(70, 60, 75), width=1)
    d.text((x, 522), "Commande sur WhatsApp  ·  Livraison à Lomé", font=font(SANS, 21), fill=PAPER)
    signature(im, d, x, 562)
    return im


def collage_card(names, kicker, title, italic, sub):
    im, d = base()
    shots = [framed(photo(n), 250, 320, 4) for n in names[:3]]
    for i, (s, angle, dx, dy) in enumerate(zip(shots, (-7, 0, 7), (40, 170, 300), (170, 120, 175))):
        r = s.convert("RGBA").rotate(angle, expand=True, resample=Image.BICUBIC)
        im.paste(r, (dx, dy - 40), r)
    x = 640
    spaced(d, (x, 80), kicker, font(SANS, 17), GOLD, 3)
    y = 140
    size = 70
    while size > 40 and len(wrap(d, title, font(SERIF, size), 520)) + len(wrap(d, italic, font(SERIF_I, size), 520)) > 4:
        size -= 6
    for line in wrap(d, title, font(SERIF, size), 520):
        d.text((x, y), line, font=font(SERIF, size), fill=PAPER)
        y += size + 4
    for line in wrap(d, italic, font(SERIF_I, size), 520):
        d.text((x, y), line, font=font(SERIF_I, size), fill=ROSE)
        y += size + 4
    for line in wrap(d, sub, font(SANS, 24), 500):
        d.text((x, y + 20), line, font=font(SANS, 24), fill=MUTED)
        y += 34
    signature(im, d, x, 560)
    return im


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    products = {p["id"]: p for p in load_products()}
    for p in products.values():
        if p["images"]:
            product_card(p).save(OUT / f"{p['id']}.jpg", quality=84, optimize=True)
    cheapest = min(p["prix"] for p in products.values())
    collage_card(
        ["khamrah", "eclaire", "yara-elixir"],
        "MISTS & SCENTS HOUSE  ·  LOMÉ",
        "Parfums de luxe,",
        "à prix doux.",
        f"{len(products)} parfums dès {price(cheapest)}. Commande sur WhatsApp, livraison à Lomé.",
    ).save(OUT / "accueil.jpg", quality=84, optimize=True)
    for o in load_occasions():
        names = [products[i]["images"][0] for i in o["picks"] if i in products and products[i]["images"]]
        collage_card(names, "LE BON PARFUM POUR…", o["titre"], o["accroche"] + ".", f"{len(o['picks'])} parfums choisis pour vous, expliqués un à un.").save(
            OUT / f"occasion-{o['slug']}.jpg", quality=84, optimize=True
        )
    for a in load_list("accords.ts", ["nom"]):
        items = [products[i] for i in a["ids"] if i in products and products[i]["images"]]
        total = sum(products[i]["prix"] for i in a["ids"] if i in products)
        collage_card([p["images"][0] for p in items], "ACCORD SIGNATURE  ·  LAYERING", a["nom"], " + ".join(p["nom"] for p in items), f"L'accord complet : {price(total)}. Livré à Lomé.").save(
            OUT / f"accord-{a['slug']}.jpg", quality=84, optimize=True
        )
    print(len(products), "cartes parfum + accueil, occasions et accords ->", OUT)


if __name__ == "__main__":
    main()
