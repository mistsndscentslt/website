"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CONFIG } from "@/data/products";
import { track } from "@/lib/analytics";
import { formatPrice, full, getProduct, minPrice, thumb, whatsappLink } from "@/lib/shop";
import { WhatsappIcon } from "./Icons";
import { useShop } from "./ShopProvider";
import { TrackedLink } from "./Tracking";

/** Flacons mis en vitrine (ids du catalogue) : les 5 premiers défilent sur ordinateur, tous sont dans la bande mobile. */
const FEATURED = ["khamrah", "eclaire", "club-de-nuit-intense-man", "diwani-beirut", "yara-elixir", "9pm-elixir", "kayali-burning-cherry-48", "asad-elixir"];
const DELAY = 4800;

export default function Hero() {
  const { showProduct } = useShop();
  const all = FEATURED.map(getProduct).filter((p) => !!p);
  const picks = all.slice(0, 5);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const p = picks[active];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % picks.length), DELAY);
    return () => clearTimeout(t);
  }, [active, paused, picks.length]);

  const open = (id = p.id) => {
    track({ type: "intent", choice: `vitrine-${id}` });
    showProduct(id, "vitrine");
  };

  return (
    <section className="hero" id="hero">
      <div className="hero__text">
        <p className="kicker kicker--light">{CONFIG.maison} · {CONFIG.ville}</p>
        <h1 className="hero__title">
          Parfums de luxe,
          <em> à prix doux.</em>
        </h1>
        <p className="hero__lead">
          Les flacons qui font tourner les têtes de Dubaï à Paris — Lattafa, Armaf, Afnan, Kayali — sentis et choisis un à un,
          livrés chez vous dès <strong>{formatPrice(minPrice)}</strong>.
        </p>
        <div className="hero-rail" aria-label="Quelques flacons de la collection">
          {all.map((o) => (
            <button key={o.id} className="hero-rail__item" onClick={() => open(o.id)}>
              <span className="hero-rail__img">
                <Image src={thumb(o.images[0])} alt={o.nom} fill sizes="46vw" />
              </span>
              <span className="hero-rail__brand">{o.marque}</span>
              <strong>{o.nom}</strong>
              <span className="hero-rail__price">{formatPrice(o.prix)}</span>
            </button>
          ))}
        </div>
        <div className="hero__ctas">
          <a href="#collection" className="btn btn--light">
            Découvrir la collection
          </a>
          <TrackedLink
            className="btn btn--line-light"
            href={whatsappLink(`Bonjour ${CONFIG.boutique}, j'aimerais un conseil parfum.`)}
            target="_blank"
            rel="noopener"
            event={{ type: "whatsapp_contact", source: "hero" }}
          >
            <WhatsappIcon />
            Un conseil ? WhatsApp
          </TrackedLink>
        </div>
        <ul className="hero__proof">
          <li>Livraison dès {formatPrice(CONFIG.livraisonDes)}</li>
          <li>{CONFIG.paiements.join(" · ")}</li>
          <li>Réponse rapide</li>
        </ul>
      </div>

      <div className="vitrine" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="vitrine__light" aria-hidden="true" />
        <div className="vitrine__stage">
          {picks.map((o, i) => (
            <button
              key={o.id}
              className={`vitrine__bottle${i === active ? " is-active" : ""}`}
              onClick={() => open()}
              tabIndex={i === active ? 0 : -1}
              aria-hidden={i !== active}
              aria-label={`Découvrir ${o.nom}`}
            >
              <Image src={full(o.images[0])} alt={o.nom} fill sizes="(max-width: 900px) 70vw, 30vw" priority={i === 0} />
            </button>
          ))}
          <div className="vitrine__plinth" aria-hidden="true" />
        </div>
        <div className="vitrine__caption" key={p.id}>
          <span className="vitrine__n">N° {String(active + 1).padStart(2, "0")}</span>
          <span className="vitrine__brand">{p.marque}</span>
          <strong className="vitrine__name">{p.nom}</strong>
          <span className="vitrine__price">{formatPrice(p.prix)}</span>
          <button className="vitrine__more" onClick={() => open()}>
            Découvrir <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="vitrine__nav" role="tablist" aria-label="Flacons en vitrine">
          {picks.map((o, i) => (
            <button
              key={o.id}
              role="tab"
              aria-selected={i === active}
              aria-label={o.nom}
              className={i === active ? "is-active" : ""}
              onClick={() => {
                setActive(i);
                setPaused(true);
              }}
            >
              <Image src={thumb(o.images[0])} alt="" width={48} height={62} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
