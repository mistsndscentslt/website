import { CONFIG, PRODUCTS, type Product } from "@/data/products";

export const thumb = (img: string) => `/products/thumbs/${img}.webp`;
export const full = (img: string) => `/products/full/${img}.webp`;
/** Carte d'aperçu 1200x630 des liens partagés — générée par tools/share_cards.py */
export const ogCard = (name: string) => ({ url: `/og/${name}.jpg`, width: 1200, height: 630, type: "image/jpeg" });

export const formatPrice = (n: number) => `${n.toLocaleString("fr-FR").replace(/ | /g, " ")} ${CONFIG.devise}`;

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const minPrice = Math.min(...PRODUCTS.map((p) => p.prix));

/** Marque citable hors du site (Google, IA, aperçus de liens) : vide si elle doit rester discrète. */

export function whatsappLink(text: string) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Parfums proches : même famille ou même genre, triés par affinité. */
export function similar(p: Product, n = 4) {
  return PRODUCTS.filter((o) => o.id !== p.id)
    .map((o) => ({
      o,
      s: o.familles.filter((f) => p.familles.includes(f)).length * 2 + (o.genre === p.genre ? 1 : 0),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.o);
}
