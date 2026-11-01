"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONFIG } from "@/data/products";
import { formatPrice, whatsappLink } from "@/lib/shop";
import { useShop } from "./ShopProvider";
import { TrackedLink } from "./Tracking";

const LINKS = [
  ["#collection", "Collection"],
  ["#quiz", "Trouver mon parfum"],
  ["#accords", "Accords"],
  ["#occasions", "Occasions"],
  ["#maison", CONFIG.maison],
  ["#faq", "FAQ"],
];

export default function Header() {
  const { cartCount, setCartOpen } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 500);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <>
      <div className="topbar">
        <span>Livraison à Lomé dès {formatPrice(CONFIG.livraisonDes)}</span>
        <span className="topbar__sep" aria-hidden="true" />
        <span>Paiement {CONFIG.paiements.join(", ")}</span>
        <span className="topbar__sep" aria-hidden="true" />
        <TrackedLink href={whatsappLink("Bonjour !")} target="_blank" rel="noopener" event={{ type: "whatsapp_contact", source: "topbar" }}>
          WhatsApp {CONFIG.telephone}
        </TrackedLink>
      </div>
      <header className={`header${scrolled ? " is-scrolled" : ""}`}>
        <nav className={`nav${menu ? " is-open" : ""}`} aria-label="Navigation principale">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={`/${href}`} onClick={() => setMenu(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="logo" aria-label="Mists & Scents — accueil">
          <Image src="/brand/logo-mark.png" alt="" width={34} height={39} className="logo__mark" priority />
          <span className="logo__text">
            Mists <em>&amp;</em> Scents
          </span>
        </Link>
        <div className="header__actions">
          <TrackedLink
            className="header__wa"
            href={whatsappLink(`Bonjour ${CONFIG.boutique}, j'aimerais un conseil parfum.`)}
            target="_blank"
            rel="noopener"
            event={{ type: "whatsapp_contact", source: "header" }}
          >
            Conseil WhatsApp
          </TrackedLink>
          <button className="icon-btn cart-btn" onClick={() => setCartOpen(true)} aria-label={`Ouvrir le panier (${cartCount})`}>
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M5.5 8h13l-1 12.5h-11L5.5 8Z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            {cartCount > 0 && <span className={`cart-count${bump ? " bump" : ""}`}>{cartCount}</span>}
          </button>
          <button className="icon-btn burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <span />
            <span />
          </button>
        </div>
      </header>
    </>
  );
}
