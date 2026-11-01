import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import OccasionPicks from "@/components/OccasionPicks";
import { TrackOnMount } from "@/components/Tracking";
import { OCCASIONS, getOccasion } from "@/data/occasions";
import { ogCard } from "@/lib/shop";
import { breadcrumbJsonLd, occasionJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/occasion/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const o = getOccasion(slug);
  if (!o) return {};
  return {
    title: o.seo.title,
    description: o.seo.description,
    alternates: { canonical: `/occasion/${o.slug}` },
    openGraph: { title: o.seo.title, description: o.seo.description, images: [{ ...ogCard(`occasion-${o.slug}`), alt: o.titre }] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function OccasionPage({ params }: PageProps<"/occasion/[slug]">) {
  const { slug } = await params;
  const o = getOccasion(slug);
  if (!o) notFound();
  const others = OCCASIONS.filter((x) => x.slug !== o.slug);

  return (
    <div className="page page--occasion">
      <JsonLd
        data={[
          occasionJsonLd(o),
          breadcrumbJsonLd([
            ["Accueil", "/"],
            ["Occasions", "/#occasions"],
            [o.titre, `/occasion/${o.slug}`],
          ]),
        ]}
      />
      <TrackOnMount event={{ type: "occasion_view", slug: o.slug }} />
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link> / <Link href="/#occasions">Occasions</Link> / <span>{o.titre}</span>
      </nav>

      <header className="occ-hero">
        <p className="kicker">{o.accroche}</p>
        <h1 className="section__title">
          Un parfum <em>{o.titre.toLowerCase()}</em>
        </h1>
        <p className="section__lead">{o.intro}</p>
      </header>

      <OccasionPicks slug={o.slug} />

      <aside className="occ-tip">
        <span className="occ-tip__label">Le conseil Mists &amp; Scents</span>
        <p>{o.conseil}</p>
      </aside>

      <section className="occ-others">
        <h2>Une autre occasion ?</h2>
        <div className="occ-others__list">
          {others.map((x) => (
            <Link key={x.slug} href={`/occasion/${x.slug}`} className="chip">
              {x.titre}
            </Link>
          ))}
          <Link href="/#quiz" className="chip">
            Faire le quiz
          </Link>
        </div>
      </section>
    </div>
  );
}
