"use client";

import Link from "next/link";
import { useState } from "react";
import { CONFIG, FAMILLES, GENRES, type Product } from "@/data/products";
import { accordsFor } from "@/data/accords";
import { occasionsFor } from "@/data/occasions";
import { track } from "@/lib/analytics";
import { formatPrice, similar, whatsappLink } from "@/lib/shop";
import { AccordCard } from "./Accords";
import { WhatsappIcon } from "./Icons";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";

const ACCORD_WIDTHS = [100, 84, 70, 58];

export default function ProductDetail({ product: p, variant }: { product: Product; variant: "modal" | "page" }) {
  const { add, setCartOpen, showProduct } = useShop();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const out = p.dispo === false;
  const occasions = occasionsFor(p.id);
  const views = p.images;
  const H = variant === "page" ? "h2" : "h3";

  const orderNow = whatsappLink(
    `Bonjour ${CONFIG.boutique} ✨\nJe souhaite commander :\n• ${qty} × ${p.nom}${p.marque ? ` (${p.marque})` : ""} — ${formatPrice(p.prix * qty)}\n\nEst-il disponible ?`,
  );

  const share = async () => {
    const url = `${window.location.origin}/parfum/${p.id}`;
    try {
      const text = `${p.nom}${p.marque ? ` de ${p.marque}` : ""}\n${p.accords.slice(0, 3).join(", ")} · ${formatPrice(p.prix)}\nÀ découvrir chez ${CONFIG.boutique} :`;
      if (navigator.share) await navigator.share({ title: p.nom, text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <div className="pd">
      <div className="pd__gallery">
        <div className="pd__main is-photo" data-family={p.familles[0]}>
          <ProductImage key={views[img]} product={p} img={views[img]} size="full" fill sizes="(max-width: 900px) 100vw, 520px" priority={variant === "page"} />
        </div>
        {views.length > 1 && (
          <div className="pd__thumbs">
            {views.map((im, i) => (
              <button key={im} className={i === img ? "is-active" : ""} data-family={p.familles[0]} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`}>
                <ProductImage product={p} img={im} alt="" width={64} height={80} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pd__info">
        {p.marque && <div className="pd__brand">{p.marque}</div>}
        {variant === "page" ? <h1 className="pd__name">{p.nom}</h1> : <h2 className="pd__name" id="modalTitle">{p.nom}</h2>}
        <div className="pd__meta">
          <span className="tag">{GENRES[p.genre]}</span>
          {p.familles.map((f) => (
            <span key={f} className="tag tag--line">
              {FAMILLES[f].label}
            </span>
          ))}
          {p.volume && <span className="tag tag--line">{p.volume}</span>}
        </div>
        <p className="pd__desc">{p.description}</p>

        {occasions.length > 0 && (
          <div className="pd__why">
            <H className="pd__why-title">Idéal pour</H>
            {occasions.map(({ occasion: o, why }) => (
              <Link key={o.slug} href={`/occasion/${o.slug}`} className="why-row" onClick={() => showProduct(null)}>
                <span>
                  <b>{o.titre}</b>
                  {why}
                </span>
              </Link>
            ))}
          </div>
        )}

        {p.notes ? (
          <div className="pd__notes">
            {(
              [
                ["Tête", p.notes.tete],
                ["Cœur", p.notes.coeur],
                ["Fond", p.notes.fond],
              ] as const
            ).map(([label, notes]) => (
              <div className="note-row" key={label}>
                <b>{label}</b>
                <span>{notes.join(", ")}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="accord-bars">
            {p.accords.map((a, i) => (
              <div className="accord" key={a}>
                <span>{a}</span>
                <i style={{ width: `${ACCORD_WIDTHS[i] ?? 50}%`, animationDelay: `${i * 120}ms` }} />
              </div>
            ))}
          </div>
        )}

        <div className="pd__buy">
          <div className="pd__price">
            {formatPrice(p.prix).replace(` ${CONFIG.devise}`, "")} <small>{CONFIG.devise}</small>
          </div>
          {!out && (
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Moins">
                −
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Plus">
                +
              </button>
            </div>
          )}
          <div className="pd__actions">
            {out ? (
              <a className="btn btn--ghost" href={whatsappLink(`Bonjour ! Prévenez-moi quand ${p.nom} sera de retour 🙏`)} target="_blank" rel="noopener">
                Me prévenir du retour
              </a>
            ) : (
              <>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    add(p.id, qty);
                    if (variant === "modal") showProduct(null);
                  }}
                >
                  Ajouter au panier
                </button>
                <a className="btn btn--whatsapp" href={orderNow} target="_blank" rel="noopener" onClick={() => track({ type: "whatsapp_order", ids: Array(qty).fill(p.id), total: p.prix * qty, source: "product" })}>
                  <WhatsappIcon />
                  Commander sur WhatsApp
                </a>
              </>
            )}
          </div>
          <p className="pd__reassure">Paiement {CONFIG.paiements.join(", ")} · Livraison à Lomé dès {formatPrice(CONFIG.livraisonDes)} · Réponse rapide sur WhatsApp</p>
          <div className="pd__links">
            <button className="link-btn" onClick={share}>
              {copied ? "Lien copié" : "Partager ce parfum"}
            </button>
            {variant === "page" && (
              <button className="link-btn" onClick={() => setCartOpen(true)}>
                Voir le panier
              </button>
            )}
          </div>
        </div>
      </div>

      {accordsFor(p.id).length > 0 && (
        <div className="pd__accords">
          <H className="pd__h">À superposer pour une signature unique</H>
          <div className="pd__accords-list">
            {accordsFor(p.id).map((a) => (
              <AccordCard key={a.slug} accord={a} source={p.id} compact />
            ))}
          </div>
        </div>
      )}

      <div className="pd__similar">
        <H className="pd__h">Vous aimerez aussi</H>
        <div className="pd__similar-list">
          {similar(p).map((o) =>
            variant === "modal" ? (
              <button key={o.id} className="mini" data-family={o.familles[0]} onClick={() => showProduct(o.id, "similaire")}>
                <ProductImage product={o} alt="" width={200} height={250} />
                <span>
                  {o.nom}
                  <small>{formatPrice(o.prix)}</small>
                </span>
              </button>
            ) : (
              <Link key={o.id} className="mini" data-family={o.familles[0]} href={`/parfum/${o.id}`}>
                <ProductImage product={o} alt="" width={200} height={250} />
                <span>
                  {o.nom}
                  <small>{formatPrice(o.prix)}</small>
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
