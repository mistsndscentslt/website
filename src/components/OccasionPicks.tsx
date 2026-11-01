"use client";

import { getOccasion } from "@/data/occasions";
import { FAMILLES, GENRES, type Product } from "@/data/products";
import { formatPrice, getProduct } from "@/lib/shop";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";

/** Liste numérotée de parfums, chacun avec la raison de le choisir et l'achat en un geste. */
export function PickList({ items, source }: { items: { p: Product; why: string }[]; source: string }) {
  const { add, showProduct } = useShop();

  return (
    <ol className="picks">
      {items.map(({ p, why }, i) => (
        <li key={p.id} className="pick reveal">
          <button className="pick__media" onClick={() => showProduct(p.id, source)} aria-label={`Voir ${p.nom}`}>
            <ProductImage product={p} fill sizes="(max-width: 640px) 40vw, 220px" />
            <span className="pick__rank">{String(i + 1).padStart(2, "0")}</span>
          </button>
          <div className="pick__body">
            {p.marque && <span className="card__brand">{p.marque}</span>}
            <h3>{p.nom}</h3>
            <p className="pick__why">« {why} »</p>
            <p className="pick__meta">
              {GENRES[p.genre]} · {p.familles.map((f) => FAMILLES[f].label).join(", ")} · {p.accords.slice(0, 3).join(", ")}
            </p>
            <div className="pick__buy">
              <span className="price">{formatPrice(p.prix)}</span>
              <button className="btn btn--primary btn--sm" onClick={() => add(p.id)}>
                Ajouter au panier
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => showProduct(p.id, source)}>
                Découvrir
              </button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function OccasionPicks({ slug }: { slug: string }) {
  const o = getOccasion(slug)!;
  const items = o.picks.flatMap((pk) => {
    const p = getProduct(pk.id);
    return p ? [{ p, why: pk.why }] : [];
  });
  return <PickList items={items} source={`occasion-${slug}`} />;
}
