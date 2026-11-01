"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FAMILLES, PRODUCTS, type Famille } from "@/data/products";
import { track } from "@/lib/analytics";
import ProductCard from "./ProductCard";
import { useShop } from "./ShopProvider";

// parfums montrés avant « Voir tout » (même valeur que .grid--collapsed dans globals.css)
const FIRST = 12;

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Collection() {
  const { family, setFamily, genre, setGenre } = useShop();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [showAll, setShowAll] = useState(false);

  const list = useMemo(() => {
    const q = norm(query.trim());
    const out = PRODUCTS.filter(
      (p) =>
        (genre === "all" || p.genre === genre) &&
        (family === "all" || p.familles.includes(family)) &&
        (!q ||
          norm([p.nom, p.marque, ...p.accords, ...(p.notes ? Object.values(p.notes).flat() : [])].join(" ")).includes(q)),
    );
    if (sort === "price-asc") out.sort((a, b) => a.prix - b.prix);
    if (sort === "price-desc") out.sort((a, b) => b.prix - a.prix);
    if (sort === "name") out.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    return out;
  }, [genre, family, query, sort]);

  // Statistiques : recherche (après une pause de frappe) et filtres utilisés
  const resultCount = list.length;
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const t = setTimeout(() => track({ type: "search", q: q.toLowerCase(), results: resultCount }), 1200);
    return () => clearTimeout(t);
  }, [query, resultCount]);
  const firstFilter = useRef(true);
  useEffect(() => {
    if (firstFilter.current) {
      firstFilter.current = false;
      return;
    }
    track({ type: "filter", genre, family });
  }, [genre, family]);

  return (
    <section className="section collection" id="collection">
      <div className="section__head reveal">
        <p className="kicker">La collection</p>
        <h2 className="section__title">
          {PRODUCTS.length} flacons, <em>autant d&apos;histoires.</em>
        </h2>
        <p className="section__lead">Filtrez par envie, par famille ou par budget. Touchez un parfum pour découvrir ses notes et le commander.</p>
      </div>

      <div className="toolbar reveal">
        <div className="chips" aria-label="Pour qui">
          {(
            [
              ["all", "Tous"],
              ["femme", "Elle"],
              ["homme", "Lui"],
              ["mixte", "Mixte"],
            ] as const
          ).map(([v, l]) => (
            <button key={v} className={`chip${genre === v ? " is-active" : ""}`} onClick={() => setGenre(v)} aria-pressed={genre === v}>
              {l}
            </button>
          ))}
        </div>
        <div className="toolbar__right">
          <label className="search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un parfum, une marque, une note…"
              aria-label="Rechercher"
            />
          </label>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier">
            <option value="default">Sélection</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name">Nom A → Z</option>
          </select>
        </div>
      </div>
      <div className="chips chips--families reveal" aria-label="Familles olfactives">
        <button className={`chip${family === "all" ? " is-active" : ""}`} onClick={() => setFamily("all")}>
          Toutes les familles
        </button>
        {(Object.keys(FAMILLES) as Famille[]).map((f) => (
          <button key={f} className={`chip${family === f ? " is-active" : ""}`} onClick={() => setFamily(f)} aria-pressed={family === f}>
            {FAMILLES[f].label}
          </button>
        ))}
      </div>

      <div className={`grid${!showAll && list.length > FIRST ? " grid--collapsed" : ""}`} aria-live="polite">
        {list.map((p, i) => (
          <ProductCard key={`${p.id}-${genre}-${family}`} product={p} index={i} />
        ))}
      </div>
      {!showAll && list.length > FIRST && (
        <div className="collection__more">
          <button className="btn btn--ghost" onClick={() => setShowAll(true)}>
            Voir les {list.length} parfums
          </button>
        </div>
      )}
      {list.length === 0 && <p className="empty">Aucun parfum ne correspond… essayez une autre recherche, ou demandez-nous sur WhatsApp.</p>}
    </section>
  );
}
