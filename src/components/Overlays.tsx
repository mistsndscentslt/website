"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONFIG } from "@/data/products";
import { formatPrice, getProduct, whatsappLink } from "@/lib/shop";
import { track } from "@/lib/analytics";
import { WhatsappIcon } from "./Icons";
import ProductImage from "./ProductImage";
import ProductDetail from "./ProductDetail";
import { useShop } from "./ShopProvider";

/* ---------- Fiche produit en fenêtre ---------- */
export function ProductModal() {
  const { openProduct, showProduct } = useShop();
  const open = !!openProduct;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && showProduct(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, showProduct]);

  return (
    <div className={`modal${open ? " is-open" : ""}`} aria-hidden={!open} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal__backdrop" onClick={() => showProduct(null)} />
      <div className="modal__panel">
        <button className="icon-btn modal__close" onClick={() => showProduct(null)} aria-label="Fermer">
          <CloseIcon />
        </button>
        {openProduct && <ProductDetail key={openProduct.id} product={openProduct} variant="modal" />}
      </div>
    </div>
  );
}

/* ---------- Panier ---------- */
export function CartDrawer() {
  const { cart, cartTotal, cartOpen, setCartOpen, setQty, remove } = useShop();
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  const checkout = () => {
    const lines = cart
      .map((l) => {
        const p = getProduct(l.id)!;
        return `• ${l.qty} × ${p.nom}${p.marque ? ` (${p.marque})` : ""} — ${formatPrice(p.prix * l.qty)}`;
      })
      .join("\n");
    const text =
      `Bonjour ${CONFIG.boutique} ✨\nJe souhaite commander :\n${lines}\n\nTotal : ${formatPrice(cartTotal)}` +
      (name ? `\nNom : ${name}` : "") +
      (place ? `\nLivraison : ${place}` : "") +
      `\n\nMerci !`;
    track({ type: "whatsapp_order", ids: cart.flatMap((l) => Array(l.qty).fill(l.id)), total: cartTotal, source: "cart" });
    window.open(whatsappLink(text), "_blank", "noopener");
  };

  return (
    <aside className={`drawer${cartOpen ? " is-open" : ""}`} aria-hidden={!cartOpen} aria-label="Panier">
      <div className="drawer__backdrop" onClick={() => setCartOpen(false)} />
      <div className="drawer__panel">
        <div className="drawer__head">
          <h3>Votre panier</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Fermer le panier">
            <CloseIcon />
          </button>
        </div>
        <div className="drawer__items">
          {cart.length === 0 ? (
            <div className="drawer__empty">
              <span className="big">Votre panier est vide</span>
              Laissez-vous tenter par un parfum de la collection.
              <Link href="/#collection" className="btn btn--dark" onClick={() => setCartOpen(false)}>
                Voir la collection
              </Link>
            </div>
          ) : (
            cart.map((l) => {
              const p = getProduct(l.id)!;
              return (
                <div className="line" key={l.id}>
                  <ProductImage product={p} alt="" width={64} height={80} />
                  <div>
                    <h4>{p.nom}</h4>
                    <small>{p.marque}</small>
                    <div className="qty">
                      <button onClick={() => setQty(l.id, l.qty - 1)} aria-label="Moins">
                        −
                      </button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.id, l.qty + 1)} aria-label="Plus">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="line__price">
                    {formatPrice(p.prix * l.qty)}
                    <button className="line__rm" onClick={() => remove(l.id)}>
                      Retirer
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer__foot">
            <label className="field">
              <span>Votre nom</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Afi" autoComplete="name" />
            </label>
            <label className="field">
              <span>Quartier / ville de livraison</span>
              <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Ex : Bè, Lomé" />
            </label>
            <div className="drawer__total">
              <span>Total</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
            <button className="btn btn--wa-solid btn--block" onClick={checkout}>
              <WhatsappIcon />
              Commander sur WhatsApp
            </button>
            <p className="drawer__note">
              Paiement {CONFIG.paiements.join(", ")}. Livraison à Lomé dès {formatPrice(CONFIG.livraisonDes)}, montant exact confirmé sur WhatsApp.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ---------- Notification « ajouté au panier » ---------- */
export function Toast() {
  const { toast, setCartOpen } = useShop();
  return (
    <div className={`toast${toast ? " is-show" : ""}`} role="status" aria-live="polite">
      {toast && (
        <>
          <ProductImage product={toast.product} alt="" width={36} height={36} />
          <span>{toast.product.nom} ajouté au panier</span>
          <button onClick={() => setCartOpen(true)}>Voir</button>
        </>
      )}
    </div>
  );
}

/* ---------- Barre d'achat fixe (mobile) ---------- */
export function MobileBar() {
  const { cartCount, cartTotal, setCartOpen, openProduct, cartOpen } = useShop();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`mbar${show && !openProduct && !cartOpen ? " is-show" : ""}`}>
      <a
        className="mbar__wa"
        href={whatsappLink(`Bonjour ${CONFIG.boutique}, j'aimerais un conseil parfum.`)}
        target="_blank"
        rel="noopener"
        onClick={() => track({ type: "whatsapp_contact", source: "mobile-bar" })}
      >
        <WhatsappIcon />
        Conseil
      </a>
      <button className="mbar__cart" onClick={() => setCartOpen(true)}>
        {cartCount > 0 ? (
          <>
            Panier · {cartCount} <span>{formatPrice(cartTotal)}</span>
          </>
        ) : (
          <>Votre panier est vide</>
        )}
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/* ---------- Apparition au défilement ---------- */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    const observe = () => document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
