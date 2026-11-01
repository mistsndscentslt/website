"use client";

import { useEffect, useState } from "react";
import { ACCORDS, type Accord, type Age, type Moment } from "@/data/accords";
import { PRODUCTS, type Famille, type Genre, type Product } from "@/data/products";
import { formatPrice, getProduct } from "@/lib/shop";
import { track } from "@/lib/analytics";
import { AccordCard } from "./Accords";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";

type Answers = { genre?: Genre | "any"; age?: Age; moment?: Moment; familles?: Famille[]; budget?: number };

const STEPS = [
  {
    key: "genre",
    q: "Pour qui est ce parfum ?",
    opts: [
      { label: "Pour elle", sub: "Féminin, doux ou affirmé", value: "femme" },
      { label: "Pour lui", sub: "Masculin, élégant", value: "homme" },
      { label: "Peu importe", sub: "J'aime les mixtes", value: "any" },
    ],
  },
  {
    key: "age",
    q: "Quel âge a la personne qui le portera ?",
    opts: [
      { label: "Moins de 25 ans", sub: "Pétillant, sucré, tendance", value: "jeune" },
      { label: "25 à 40 ans", sub: "Affirmé, moderne", value: "adulte" },
      { label: "40 ans et plus", sub: "Raffiné, profond", value: "mature" },
    ],
  },
  {
    key: "moment",
    q: "Quand le portera-t-on le plus ?",
    opts: [
      { label: "La journée", sub: "Bureau, école, sorties au soleil", value: "jour" },
      { label: "Le soir", sub: "Dîners, rendez-vous, sorties", value: "soir" },
      { label: "Les cérémonies", sub: "Mariages, fêtes, grandes occasions", value: "ceremonie" },
    ],
  },
  {
    key: "familles",
    q: "Quelle ambiance vous fait vibrer ?",
    opts: [
      { label: "Douceur gourmande", sub: "Vanille, caramel, praliné", value: ["gourmand"] },
      { label: "Fleurs & fruits", sub: "Rose, pêche, fruits rouges", value: ["floral", "fruite"] },
      { label: "Bois & oud", sub: "Intense, oriental, épicé", value: ["boise"] },
      { label: "Fraîcheur", sub: "Agrumes, marin, propre", value: ["frais"] },
    ],
  },
  {
    key: "budget",
    q: "Quel budget par parfum ?",
    opts: [
      { label: "Jusqu'à 15 000", sub: "FCFA", value: 15000 },
      { label: "Jusqu'à 25 000", sub: "FCFA", value: 25000 },
      { label: "Peu importe", sub: "Je veux le meilleur", value: Infinity },
    ],
  },
] as const;

/* Affinités : ce que chaque âge et chaque moment aime, famille par famille */
const AGE_FIT: Record<Age, Partial<Record<Famille, number>>> = {
  jeune: { fruite: 2, gourmand: 2, frais: 1 },
  adulte: { gourmand: 1, boise: 1, floral: 1, fruite: 1 },
  mature: { boise: 2, floral: 2 },
};
const MOMENT_FIT: Record<Moment, Partial<Record<Famille, number>>> = {
  jour: { frais: 2, fruite: 1, floral: 1, boise: -1 },
  soir: { gourmand: 2, boise: 2 },
  ceremonie: { boise: 2, floral: 2, gourmand: 1 },
};
const fit = (table: Partial<Record<Famille, number>>, p: Product) => Math.max(...p.familles.map((f) => table[f] ?? 0));

function score(p: Product, a: Answers) {
  let s = 0;
  if (a.genre === "any") s += p.genre === "mixte" ? 3 : 1;
  else if (a.genre) s += p.genre === a.genre ? 3 : p.genre === "mixte" ? 2 : -6;
  if (a.familles) s += p.familles.filter((f) => a.familles!.includes(f)).length * 3 + (p.familles[0] && a.familles.includes(p.familles[0]) ? 1 : 0);
  if (a.age) s += fit(AGE_FIT[a.age], p);
  if (a.moment) s += fit(MOMENT_FIT[a.moment], p) + (a.moment === "ceremonie" && p.badge && p.badge !== "Petit prix" ? 1 : 0);
  if (a.budget !== undefined) s += p.prix <= a.budget ? 2 : -5;
  if (p.dispo === false) s -= 10;
  return s;
}

function accordScore(acc: Accord, a: Answers) {
  const items = acc.ids.map(getProduct).filter((p) => !!p);
  let s = 0;
  if (a.genre === "any") s += acc.genre === "mixte" ? 3 : 1;
  else if (a.genre) s += acc.genre === a.genre ? 4 : acc.genre === "mixte" ? 2 : -10;
  if (a.age) s += acc.ages.includes(a.age) ? 3 : -1;
  if (a.moment) s += acc.moments.includes(a.moment) ? 3 : -1;
  if (a.familles) s += items.filter((p) => p.familles.some((f) => a.familles!.includes(f))).length * 2;
  if (a.budget !== undefined && a.budget !== Infinity) s += items.every((p) => p.prix <= a.budget! + 5000) ? 1 : -3;
  return s;
}

export default function Quiz() {
  const { showProduct } = useShop();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step >= STEPS.length;

  const ranked = done ? PRODUCTS.map((p) => ({ p, s: score(p, answers) })).sort((a, b) => b.s - a.s || a.p.prix - b.p.prix) : [];
  const results = ranked.slice(0, 3);
  const best = ranked[0]?.s || 1;
  const topId = results[0]?.p.id;
  const accord = done ? [...ACCORDS].sort((x, y) => accordScore(y, answers) - accordScore(x, answers))[0] : undefined;

  useEffect(() => {
    if (!done || !topId) return;
    track({
      type: "quiz_complete",
      genre: String(answers.genre),
      familles: (answers.familles ?? []).join("+"),
      budget: answers.budget === Infinity ? "illimité" : String(answers.budget),
      top: topId,
    });
  }, [done, topId, answers]);

  return (
    <section className="section quiz" id="quiz">
      <div className="quiz__bg" aria-hidden="true" />
      <div className="quiz__inner">
        <div className="section__head reveal">
          <p className="kicker kicker--light">Votre signature</p>
          <h2 className="section__title section__title--light">
            Trouvez <em>votre</em> parfum en {STEPS.length} questions
          </h2>
          <p className="section__lead quiz__lead">Et découvrez l&apos;accord de deux ou trois parfums à superposer, rien que pour vous.</p>
        </div>
        <div className="quiz__card reveal">
          <div className="quiz__progress">
            <span style={{ width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%` }} />
          </div>
          {!done ? (
            <div className="quiz__step" key={step}>
              <div className="quiz__step-n">
                Question {step + 1} / {STEPS.length}
              </div>
              <h3 className="quiz__q">{STEPS[step].q}</h3>
              <div className="quiz__opts">
                {STEPS[step].opts.map((o, i) => (
                  <button
                    key={o.label}
                    className="quiz__opt"
                    onClick={() => {
                      setAnswers((a) => ({ ...a, [STEPS[step].key]: o.value }));
                      setStep((s) => s + 1);
                    }}
                  >
                    <span className="quiz__opt-n">{String.fromCharCode(65 + i)}</span>
                    <strong>{o.label}</strong>
                    <span>{o.sub}</span>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button className="quiz__back" onClick={() => setStep((s) => s - 1)}>
                  ← Question précédente
                </button>
              )}
            </div>
          ) : (
            <div className="quiz__step" key="results">
              <div className="quiz__step-n">Vos résultats</div>
              <h3 className="quiz__q">Ces parfums sont faits pour vous</h3>
              <div className="quiz__results">
                {results.map(({ p, s }) => (
                  <button key={p.id} className="match" data-family={p.familles[0]} onClick={() => showProduct(p.id, "quiz")}>
                    <ProductImage product={p} alt={p.nom} width={300} height={300} />
                    <div>
                      <span className="score">{Math.max(62, Math.min(98, Math.round((s / best) * 97)))}% compatible</span>
                      <h4>{p.nom}</h4>
                      <span>{formatPrice(p.prix)}</span>
                    </div>
                  </button>
                ))}
              </div>
              {accord && (
                <div className="quiz__accord">
                  <div className="quiz__step-n">Votre accord signature</div>
                  <p className="quiz__accord-intro">
                    Pour aller plus loin : superposez ces parfums et portez une odeur que personne d&apos;autre n&apos;a.
                  </p>
                  <AccordCard accord={accord} source="quiz" dark />
                </div>
              )}
              <div className="quiz__actions">
                <button
                  className="btn btn--line-light"
                  onClick={() => {
                    setAnswers({});
                    setStep(0);
                  }}
                >
                  Recommencer
                </button>
                <a href="#collection" className="btn btn--light">
                  Voir toute la collection
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
