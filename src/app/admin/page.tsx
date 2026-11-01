import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OCCASIONS } from "@/data/occasions";
import { FAMILLES, PRODUCTS, type Famille } from "@/data/products";
import { readEvents, type StoredEvent } from "@/lib/events-store";
import { formatPrice, getProduct } from "@/lib/shop";
import "./admin.css";

export const metadata: Metadata = { title: "Tableau de bord", robots: { index: false, follow: false } };

const COOKIE = "ms-admin";

async function login(formData: FormData) {
  "use server";
  const key = String(formData.get("cle") ?? "");
  if (process.env.ADMIN_KEY && key === process.env.ADMIN_KEY) {
    (await cookies()).set(COOKIE, key, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/admin" });
  }
  redirect("/admin");
}

/* ---------- petits outils de calcul ---------- */
const countBy = (items: string[]) => {
  const m = new Map<string, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
const of = <T extends string>(evs: StoredEvent[], type: T) => evs.filter((e) => e.type === type);
const uniq = (evs: StoredEvent[]) => new Set(evs.map((e) => e.sid)).size;
const name = (id: string) => getProduct(id)?.nom ?? id;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "—");

/** Visiteurs uniques par jour sur les `n` derniers jours. */
function dailyVisitors(evs: StoredEvent[], n: number) {
  const byDay = new Map<string, Set<string>>();
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) byDay.set(new Date(now - i * 86400000).toISOString().slice(0, 10), new Set());
  for (const e of evs) byDay.get(new Date(e.ts).toISOString().slice(0, 10))?.add(String(e.sid));
  return [...byDay.entries()].map(([d, s]) => [d, s.size] as const);
}

function Bars({ rows, empty = "Pas encore de données", fmt = String }: { rows: [string, number][]; empty?: string; fmt?: (n: number) => string }) {
  if (!rows.length) return <p className="a-empty">{empty}</p>;
  const max = rows[0][1];
  return (
    <ul className="a-bars">
      {rows.map(([label, n]) => (
        <li key={label}>
          <span className="a-bars__label">{label}</span>
          <span className="a-bars__track">
            <i style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <b>{fmt(n)}</b>
        </li>
      ))}
    </ul>
  );
}

export default function Admin(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="a-empty" style={{ padding: 40, textAlign: "center" }}>Chargement…</p>}>
      <Dashboard {...props} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const adminKey = process.env.ADMIN_KEY;
  const cookieKey = (await cookies()).get(COOKIE)?.value;
  const devOpen = !adminKey && process.env.NODE_ENV !== "production";
  const allowed = devOpen || (!!adminKey && cookieKey === adminKey);

  if (!allowed) {
    return (
      <div className="a-login">
        <form action={login}>
          <h1>Mists &amp; Scents</h1>
          <p>Tableau de bord privé</p>
          {adminKey ? (
            <>
              <input type="password" name="cle" placeholder="Clé d'accès" autoFocus required />
              <button>Entrer</button>
            </>
          ) : (
            <p className="a-warn">Définissez la variable ADMIN_KEY sur le serveur pour activer l&apos;accès.</p>
          )}
        </form>
      </div>
    );
  }

  const sp = await searchParams;
  const days = [7, 30, 90, 365].includes(Number(sp.j)) ? Number(sp.j) : 30;
  const evs = await readEvents(days);

  const views = of(evs, "page_view");
  const pv = of(evs, "view_product");
  const carts = of(evs, "add_to_cart");
  const orders = of(evs, "whatsapp_order");
  const searches = of(evs, "search");
  const quiz = of(evs, "quiz_complete");
  const sessions = uniq(evs);

  // Entonnoir (visiteurs uniques à chaque étape)
  const funnel: [string, number][] = [
    ["Visiteurs", sessions],
    ["Ont regardé un parfum", uniq(pv)],
    ["Ont ajouté au panier", uniq(carts)],
    ["Ont lancé une commande WhatsApp", uniq(orders)],
  ];

  const orderedIds = orders.flatMap((e) => (Array.isArray(e.ids) ? (e.ids as string[]) : []));
  const orderValue = orders.reduce((s, e) => s + (Number(e.total) || 0), 0);
  const viewedIds = new Set(pv.map((e) => String(e.id)));
  const neverViewed = PRODUCTS.filter((p) => !viewedIds.has(p.id));

  // Recherches : on garde la dernière saisie de chaque visiteur pour éviter les doublons de frappe
  const searchTerms = countBy(searches.map((e) => String(e.q)));
  const noResult = countBy(searches.filter((e) => e.results === 0).map((e) => String(e.q)));

  const daily = dailyVisitors(evs, Math.min(days, 30));
  const dailyMax = Math.max(1, ...daily.map(([, n]) => n));

  const familyLabel = (f: string) => FAMILLES[f as Famille]?.label ?? f;
  const occLabel = (s: string) => OCCASIONS.find((o) => o.slug === s)?.titre ?? s;

  return (
    <div className="a">
      <header className="a-head">
        <div>
          <h1>Tableau de bord</h1>
          <p>Ce que vos visiteurs regardent, cherchent et commandent.</p>
        </div>
        <nav className="a-period">
          {[7, 30, 90, 365].map((d) => (
            <a key={d} href={`/admin?j=${d}`} className={d === days ? "is-on" : ""}>
              {d === 365 ? "1 an" : `${d} j`}
            </a>
          ))}
        </nav>
      </header>

      <section className="a-kpis">
        <div><span>Visiteurs</span><b>{sessions}</b><small>{pct(evs.filter((e) => e.type === "page_view" && e.mobile).length, views.length)} sur mobile</small></div>
        <div><span>Parfums consultés</span><b>{pv.length}</b><small>{viewedIds.size} parfums différents</small></div>
        <div><span>Ajouts au panier</span><b>{carts.length}</b><small>{pct(uniq(carts), sessions)} des visiteurs</small></div>
        <div><span>Commandes WhatsApp lancées</span><b>{orders.length}</b><small>≈ {formatPrice(orderValue)}</small></div>
      </section>

      <section className="a-card a-card--wide">
        <h2>Visiteurs par jour {days > 30 ? "(30 derniers jours)" : ""}</h2>
        <div className="a-daily">
          {daily.map(([d, n]) => (
            <span key={d} title={`${d} : ${n} visiteur(s)`}>
              <i style={{ height: `${(n / dailyMax) * 100}%` }} />
            </span>
          ))}
        </div>
      </section>

      <div className="a-grid">
        <section className="a-card">
          <h2>Parcours d&apos;achat</h2>
          <Bars rows={funnel} />
          <p className="a-hint">Si beaucoup ajoutent au panier mais peu commandent : relancez avec une promo ou la livraison offerte.</p>
        </section>
        <section className="a-card">
          <h2>🔥 Parfums les plus regardés</h2>
          <Bars rows={countBy(pv.map((e) => name(String(e.id)))).slice(0, 10)} />
        </section>
        <section className="a-card">
          <h2>🛒 Les plus ajoutés au panier</h2>
          <Bars rows={countBy(carts.map((e) => name(String(e.id)))).slice(0, 10)} />
        </section>
        <section className="a-card">
          <h2>💬 Les plus commandés (WhatsApp)</h2>
          <Bars rows={countBy(orderedIds.map(name)).slice(0, 10)} />
        </section>
        <section className="a-card">
          <h2>🔍 Ce que les gens recherchent</h2>
          <Bars rows={searchTerms.slice(0, 12)} />
        </section>
        <section className="a-card a-card--alert">
          <h2>💡 Recherches sans résultat</h2>
          <Bars rows={noResult.slice(0, 12)} empty="Aucune pour l'instant : tout ce qu'on cherche est en stock 👌" />
          <p className="a-hint">Ce sont des parfums demandés que vous n&apos;avez pas : de bonnes idées pour le prochain réassort.</p>
        </section>
        <section className="a-card">
          <h2>🎁 Occasions consultées</h2>
          <Bars rows={countBy(of(evs, "occasion_view").map((e) => occLabel(String(e.slug))))} />
        </section>
        <section className="a-card">
          <h2>🧭 Pourquoi ils viennent</h2>
          <Bars
            rows={countBy(
              of(evs, "intent")
                .filter((e) => !String(e.choice).startsWith("vitrine-"))
                .map((e) => ({ "parfum-precis": "Un parfum précis", occasion: "Une occasion", conseil: "Être conseillé" })[String(e.choice)] ?? String(e.choice)),
            )}
          />
        </section>
        <section className="a-card">
          <h2>✨ Quiz : ambiances préférées</h2>
          <Bars rows={countBy(quiz.flatMap((e) => String(e.familles).split("+").filter(Boolean).map(familyLabel)))} />
          <h3>Pour qui</h3>
          <Bars rows={countBy(quiz.map((e) => ({ femme: "Elle", homme: "Lui", any: "Peu importe" })[String(e.genre)] ?? String(e.genre)))} />
          <h3>Budget</h3>
          <Bars rows={countBy(quiz.map((e) => (e.budget === "illimité" ? "Sans limite" : `≤ ${Number(e.budget).toLocaleString("fr-FR")} FCFA`)))} />
        </section>
        <section className="a-card">
          <h2>Familles filtrées dans la collection</h2>
          <Bars rows={countBy(of(evs, "filter").map((e) => String(e.family)).filter((f) => f !== "all").map(familyLabel))} />
        </section>
        <section className="a-card">
          <h2>D&apos;où viennent les visiteurs</h2>
          <Bars rows={countBy(views.map((e) => String(e.ref ?? "Accès direct / WhatsApp")))} />
          <h3>Comment ils trouvent les parfums</h3>
          <Bars rows={countBy(pv.map((e) => String(e.source)))} />
        </section>
        <section className="a-card">
          <h2>😴 Jamais consultés</h2>
          {neverViewed.length ? (
            <p className="a-tags">{neverViewed.map((p) => <span key={p.id}>{p.nom}</span>)}</p>
          ) : (
            <p className="a-empty">Tous les parfums ont été vus au moins une fois.</p>
          )}
          <p className="a-hint">Mettez-les en avant sur vos réseaux ou ajoutez un badge « Coup de cœur ».</p>
        </section>
        <section className="a-card">
          <h2>🪞 Vitrine : flacons cliqués</h2>
          <Bars
            rows={countBy(
              of(evs, "intent")
                .filter((e) => String(e.choice).startsWith("vitrine-"))
                .map((e) => getProduct(String(e.choice).slice(8))?.nom ?? String(e.choice)),
            )}
          />
          <p className="a-hint">Les parfums du haut de page qui attirent le plus de clics.</p>
        </section>
      </div>
      <p className="a-foot">Données anonymes, sans cookie de suivi. {evs.length} événements sur la période.</p>
    </div>
  );
}
