"use client";

import Link from "next/link";
import { GENRES, type Product } from "@/data/products";
import { formatPrice } from "@/lib/shop";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";

export default function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  const { add, showProduct } = useShop();
  const out = p.dispo === false;

  return (
    <article
      className={`card${out ? " is-out" : ""}`}
      data-family={p.familles[0]}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      onClick={() => showProduct(p.id)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && showProduct(p.id)}
      aria-label={`${p.nom}, ${formatPrice(p.prix)}`}
    >
      <div className="card__media">
        {p.badge && <span className="card__badge">{p.badge}</span>}
        <span className="card__genre">{GENRES[p.genre]}</span>
        <ProductImage product={p} fill sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 300px" />
        {p.images[1] && (
          <ProductImage product={p} img={p.images[1]} className="alt" alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 300px" />
        )}
      </div>
      <div className="card__body">
        <div className="card__brand">{p.marque || "Sélection Mists & Scents"}</div>
        <h3 className="card__name">
          {/* lien pour les moteurs et le clic molette ; un clic simple ouvre la fiche rapide */}
          <Link
            href={`/parfum/${p.id}`}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) e.stopPropagation();
              else e.preventDefault();
            }}
          >
            {p.nom}
          </Link>
        </h3>
        <p className="card__accords">{p.accords.slice(0, 3).join(" · ")}</p>
        <div className="card__foot">
          <span className="price">{out ? "Bientôt de retour" : formatPrice(p.prix)}</span>
          {!out && (
            <button
              className="add-btn"
              aria-label={`Ajouter ${p.nom} au panier`}
              onClick={(e) => {
                e.stopPropagation();
                add(p.id);
              }}
            >
              <span>Ajouter</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M5.5 8h13l-1 12.5h-11L5.5 8Z" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
