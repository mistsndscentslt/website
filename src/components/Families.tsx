"use client";

import { FAMILLES, PRODUCTS, type Famille } from "@/data/products";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";

export default function Families() {
  const { setFamily } = useShop();

  return (
    <section className="section families" id="familles">
      <div className="families__grid">
        <div className="section__head section__head--left reveal">
          <p className="kicker">L&apos;art du parfum</p>
          <h2 className="section__title">
            Un parfum se vit <em>en trois temps</em>
          </h2>
          <p className="section__lead">
            Les notes de tête séduisent, celles de cœur racontent, celles de fond restent. Survolez ou touchez la pyramide.
          </p>
        </div>
        <div className="pyramid reveal">
          {[
            ["tete", "Tête", "0 – 15 min", "Le premier éclat : agrumes, fruits, épices vives. C'est la première impression."],
            ["coeur", "Cœur", "15 min – 3 h", "L'âme du parfum : fleurs, fruits mûrs, épices douces. Il se révèle sur votre peau."],
            ["fond", "Fond", "3 h et plus", "Le sillage qui reste : vanille, oud, ambre, musc, bois. C'est ce qu'on retient de vous."],
          ].map(([k, label, time, text]) => (
            <div key={k} className="pyramid__layer" data-layer={k} tabIndex={0}>
              <span className="pyramid__label">{label}</span>
              <span className="pyramid__time">{time}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="family-cards">
        {(Object.keys(FAMILLES) as Famille[]).map((f, i) => {
          const list = PRODUCTS.filter((p) => p.familles[0] === f);
          return (
            <a
              key={f}
              href="#collection"
              className="family-card reveal"
              data-family={f}
              style={{ transitionDelay: `${i * 80}ms` }}
              onClick={() => setFamily(f)}
            >
              <span className="family-card__bottles" aria-hidden="true">
                {list.slice(0, 3).map((p) => (
                  <ProductImage key={p.id} product={p} alt="" width={120} height={170} />
                ))}
              </span>
              <span className="count">{PRODUCTS.filter((p) => p.familles.includes(f)).length} parfums</span>
              <h3>{FAMILLES[f].label}</h3>
              <p>{FAMILLES[f].desc}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
