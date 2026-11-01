import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccordCard } from "@/components/Accords";
import JsonLd from "@/components/JsonLd";
import { PickList } from "@/components/OccasionPicks";
import { ACCORDS, AGES, MOMENTS } from "@/data/accords";
import { formatPrice, getProduct, ogCard } from "@/lib/shop";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

const getAccord = (slug: string) => ACCORDS.find((a) => a.slug === slug);
const itemsOf = (ids: string[]) => ids.map(getProduct).filter((p) => !!p);

export function generateStaticParams() {
  return ACCORDS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/accord/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getAccord(slug);
  if (!a) return {};
  const items = itemsOf(a.ids);
  const total = items.reduce((t, p) => t + p.prix, 0);
  const title = `${a.nom} : accord de parfums ${items.map((p) => p.nom.split(" — ").pop()).join(" + ")}`;
  const description = `${a.idee.split(/(?<=[.!?])\s/)[0]} L'accord complet : ${formatPrice(total)}, livré à Lomé.`;
  return {
    title,
    description,
    alternates: { canonical: `/accord/${a.slug}` },
    openGraph: { title, description, images: [{ ...ogCard(`accord-${a.slug}`), alt: a.nom }] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function AccordPage({ params }: PageProps<"/accord/[slug]">) {
  const { slug } = await params;
  const a = getAccord(slug);
  if (!a) notFound();
  const items = itemsOf(a.ids);
  const others = ACCORDS.filter((x) => x.slug !== a.slug);
  const roles = items.length === 3 ? ["La base", "Le cœur", "La touche finale"] : ["La base", "Par-dessus"];

  return (
    <div className="page page--accord">
      <JsonLd
        data={[
          itemListJsonLd(`Accord ${a.nom}`, a.ids),
          breadcrumbJsonLd([
            ["Accueil", "/"],
            ["Accords", "/#accords"],
            [a.nom, `/accord/${a.slug}`],
          ]),
        ]}
      />
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link> / <Link href="/#accords">Accords</Link> / <span>{a.nom}</span>
      </nav>

      <header className="occ-hero">
        <p className="kicker">
          Accord signature · {items.length === 3 ? "trio" : "duo"} de parfums
        </p>
        <h1 className="section__title">
          <em>{a.nom}</em>
        </h1>
        <p className="section__lead">{a.idee}</p>
        <p className="brand-facts">
          {a.ages.map((x) => AGES[x]).join(", ")} · {a.moments.map((x) => MOMENTS[x]).join(", ")}
        </p>
      </header>

      <div className="accord-page__card">
        <AccordCard accord={a} source={`page-${a.slug}`} />
      </div>

      <h2 className="accord-page__h2">Les parfums de l&apos;accord</h2>
      <PickList items={items.map((p, i) => ({ p, why: `${roles[i] ?? "En touche"} : ${p.description.split(/(?<=[.!?])\s/)[0]}` }))} source={`accord-${a.slug}`} />

      <aside className="occ-tip">
        <span className="occ-tip__label">Le layering, c&apos;est quoi ?</span>
        <p>
          Superposer deux ou trois parfums pour créer une odeur unique. On commence par le plus profond (boisé, vanillé), on
          termine par le plus léger (fruité, floral). Vaporisez sans frotter, en laissant quelques secondes entre chaque couche.
        </p>
      </aside>

      <section className="occ-others">
        <h2>D&apos;autres accords</h2>
        <div className="occ-others__list">
          {others.map((x) => (
            <Link key={x.slug} href={`/accord/${x.slug}`} className="chip">
              {x.nom}
            </Link>
          ))}
          <Link href="/#quiz" className="chip">
            Trouver mon accord (quiz)
          </Link>
        </div>
      </section>
    </div>
  );
}
