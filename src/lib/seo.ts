import { CONFIG, FAMILLES, GENRES, PRODUCTS, type Product } from "@/data/products";
import type { Occasion } from "@/data/occasions";
import { full, getProduct } from "./shop";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || CONFIG.siteUrl).replace(/\/$/, "");
export const abs = (p: string) => `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`;

const prices = PRODUCTS.map((p) => p.prix);

export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": abs("/#store"),
    name: CONFIG.boutique,
    url: SITE_URL,
    image: abs(full(PRODUCTS[0].images[0])),
    description:
      "Parfums de luxe à prix doux à Lomé (Togo) : parfums orientaux (Lattafa, Paris Corner, French Avenue, Fragrance World, Armaf, Afnan, Kayali). Commande sur WhatsApp, livraison dès 1 000 FCFA.",
    address: { "@type": "PostalAddress", addressLocality: "Lomé", addressCountry: "TG" },
    areaServed: { "@type": "Country", name: "Togo" },
    currenciesAccepted: "XOF",
    paymentAccepted: CONFIG.paiements.join(", "),
    priceRange: `${Math.min(...prices)} - ${Math.max(...prices)} XOF`,
    telephone: `+${CONFIG.whatsapp}`,
    sameAs: [CONFIG.instagram, CONFIG.tiktok].filter(Boolean),
  };
}

export function productJsonLd(p: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nom,
    image: p.images.map((i) => abs(full(i))),
    description: p.description,
    category: `Parfum ${GENRES[p.genre].toLowerCase()} · ${p.familles.map((f) => FAMILLES[f].label).join(", ")}`,
    ...(p.marque ? { brand: { "@type": "Brand", name: p.marque } } : {}),
    offers: {
      "@type": "Offer",
      url: abs(`/parfum/${p.id}`),
      price: p.prix,
      priceCurrency: "XOF",
      availability: p.dispo === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@id": abs("/#store") },
      areaServed: "TG",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", minValue: CONFIG.livraisonDes, currency: "XOF" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "TG" },
      },
    },
  };
}

export function itemListJsonLd(name: string, ids: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: ids.map((id, i) => {
      const p = getProduct(id)!;
      return { "@type": "ListItem", position: i + 1, url: abs(`/parfum/${p.id}`), name: p.nom };
    }),
  };
}

export function faqJsonLd(faq: string[][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function breadcrumbJsonLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

export const occasionJsonLd = (o: Occasion) => itemListJsonLd(o.titre, o.picks.map((p) => p.id).filter((id) => getProduct(id)));
