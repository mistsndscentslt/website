import Link from "next/link";
import { OCCASIONS } from "@/data/occasions";
import { getProduct } from "@/lib/shop";
import ProductImage from "./ProductImage";

export default function Occasions() {
  return (
    <section className="section occasions" id="occasions">
      <div className="section__head reveal">
        <p className="kicker">Pour chaque moment</p>
        <h2 className="section__title">
          Quelle est <em>l&apos;occasion</em> ?
        </h2>
        <p className="section__lead">Dites-nous pour quoi, on vous dit lequel et pourquoi.</p>
      </div>
      <div className="occ-grid">
        {OCCASIONS.map((o, i) => {
          const picks = o.picks.slice(0, 3).map((p) => getProduct(p.id)).filter((p) => !!p);
          return (
            <Link key={o.slug} href={`/occasion/${o.slug}`} className="occ-card reveal" style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
              <div className="occ-card__stack" aria-hidden="true">
                {picks.map((p) => (
                  <span key={p.id} className="occ-card__img">
                    <ProductImage product={p} alt="" width={160} height={220} />
                  </span>
                ))}
              </div>
              <span className="occ-card__n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{o.titre}</h3>
              <p>{o.accroche}</p>
              <span className="occ-card__more">
                {o.picks.length} parfums recommandés <span aria-hidden="true">→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
