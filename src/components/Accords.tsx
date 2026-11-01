"use client";

import Link from "next/link";
import { ACCORDS, type Accord } from "@/data/accords";
import { CONFIG } from "@/data/products";
import { track } from "@/lib/analytics";
import { formatPrice, getProduct, whatsappLink } from "@/lib/shop";
import { WhatsappIcon } from "./Icons";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";

const LABEL = ["", "", "Duo", "Trio"];

/** Un accord : 2 ou 3 parfums à superposer, avec la recette et l'achat en un geste. */
export function AccordCard({ accord: a, source, dark = false, compact = false }: { accord: Accord; source: string; dark?: boolean; compact?: boolean }) {
  const { add, showProduct, openProduct } = useShop();
  const items = a.ids.map(getProduct).filter((p) => !!p);
  const total = items.reduce((s, p) => s + p.prix, 0);

  const order = whatsappLink(
    `Bonjour ${CONFIG.boutique},\nJe souhaite commander l'accord « ${a.nom} » :\n${items.map((p) => `• ${p.nom} — ${formatPrice(p.prix)}`).join("\n")}\n\nTotal : ${formatPrice(total)}\nEst-il disponible ?`,
  );

  return (
    <article className={`accord-card${dark ? " accord-card--dark" : ""}${compact ? " accord-card--compact" : ""}`}>
      <div className="accord-card__stage" data-family={items[0]?.familles[0]}>
        <span className="accord-card__kind">
          {LABEL[items.length]} · {items.length} parfums
        </span>
        <div className="accord-card__bottles">
          {items.map((p) => (
            <button key={p.id} onClick={() => showProduct(p.id, `accord-${source}`)} aria-label={`Voir ${p.nom}`}>
              <ProductImage product={p} alt={p.nom} width={180} height={240} />
            </button>
          ))}
        </div>
      </div>
      <div className="accord-card__body">
        <h3>
          <Link href={`/accord/${a.slug}`} onClick={() => openProduct && showProduct(null)}>
            {a.nom}
          </Link>
        </h3>
        <p className="accord-card__list">{items.map((p) => p.nom).join(" + ")}</p>
        <p className="accord-card__idea">{a.idee}</p>
        {!compact && (
          <p className="accord-card__recipe">
            <span>Comment le porter</span>
            {a.recette}
          </p>
        )}
        <div className="accord-card__buy">
          <span className="price">{formatPrice(total)}</span>
          <button
            className={`btn btn--sm ${dark ? "btn--light" : "btn--dark"}`}
            onClick={() => {
              items.forEach((p) => add(p.id));
              track({ type: "intent", choice: `accord-${a.slug}` });
            }}
          >
            Ajouter l&apos;accord
          </button>
          <a
            className="btn btn--sm btn--whatsapp"
            href={order}
            target="_blank"
            rel="noopener"
            onClick={() => track({ type: "whatsapp_order", ids: items.map((p) => p.id), total, source: "accord" })}
          >
            <WhatsappIcon />
            Commander
          </a>
        </div>
      </div>
    </article>
  );
}

/** Section d'accueil : les accords signature de la maison. */
export function AccordsSection() {
  return (
    <section className="section accords" id="accords">
      <div className="section__head reveal">
        <p className="kicker">L&apos;art du layering</p>
        <h2 className="section__title">
          Deux parfums, <em>une signature.</em>
        </h2>
        <p className="section__lead">
          Superposer deux ou trois parfums, c&apos;est créer une odeur que personne d&apos;autre ne porte. Voici nos accords préférés,
          avec la recette pour les porter.
        </p>
      </div>
      <div className="accords__rail">
        {ACCORDS.map((a) => (
          <AccordCard key={a.slug} accord={a} source="accueil" compact />
        ))}
      </div>
    </section>
  );
}
