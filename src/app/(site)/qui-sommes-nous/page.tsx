import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { WhatsappIcon } from "@/components/Icons";
import { TrackedLink } from "@/components/Tracking";
import { CONFIG } from "@/data/products";
import { whatsappLink } from "@/lib/shop";
import { breadcrumbJsonLd } from "@/lib/seo";

const TITLE = "Qui sommes-nous";
const DESCRIPTION =
  "Mists & Scents, votre boutique de parfums en ligne et votre conseillère personnelle : on vous aide à trouver la fragrance qui vous ressemble, pour vous ou pour offrir.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/qui-sommes-nous" },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

const FAMILLES = [
  ["Gourmand", "et réconfortant"],
  ["Épicé", "et audacieux"],
  ["Boisé", "et élégant"],
  ["Frais", "et léger"],
];

export default function AboutPage() {
  return (
    <div className="page page--about">
      <JsonLd
        data={breadcrumbJsonLd([
          ["Accueil", "/"],
          [TITLE, "/qui-sommes-nous"],
        ])}
      />
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link> / <span>{TITLE}</span>
      </nav>

      <header className="occ-hero">
        <p className="kicker">{TITLE}</p>
        <h1 className="section__title">
          L&apos;art de trouver <em>votre parfum.</em>
        </h1>
        <p className="section__lead about__lead">
          Un parfum, c&apos;est bien plus qu&apos;une odeur : c&apos;est une signature, un souvenir, une émotion qu&apos;on laisse
          derrière soi.
        </p>
      </header>

      <div className="about__body">
        <p>
          Chez <strong>{CONFIG.boutique}</strong>, on sait combien il est difficile de choisir une fragrance sans pouvoir la sentir.
          C&apos;est pour ça que nous ne nous contentons pas de vendre des parfums : <strong>nous vous guidons</strong>. On écoute vos
          envies, on apprend à connaître vos goûts (ou ceux de la personne à qui vous voulez faire plaisir), puis on vous propose les
          senteurs qui vous ressemblent vraiment.
        </p>

        <ul className="about__families">
          {FAMILLES.map(([nom, ton]) => (
            <li key={nom}>
              <strong>{nom}</strong> <em>{ton}</em>
            </li>
          ))}
        </ul>

        <p>
          Qu&apos;il soit discret pour tous les jours ou très tenace pour vos soirées, il existe un parfum fait pour vous. Notre
          mission, c&apos;est de vous aider à le trouver.
        </p>
      </div>

      <aside className="occ-tip about__cta">
        <span className="occ-tip__label">Pour vous, pour ceux que vous aimez</span>
        <p>Laissez-vous guider.</p>
        <div className="about__ctas">
          <Link className="btn btn--light" href="/#collection">
            Découvrir nos parfums
          </Link>
          <TrackedLink
            className="btn btn--wa-solid"
            href={whatsappLink(`Bonjour ${CONFIG.boutique}, j'aimerais un conseil parfum.`)}
            target="_blank"
            rel="noopener"
            event={{ type: "whatsapp_contact", source: "qui-sommes-nous" }}
          >
            <WhatsappIcon />
            Demander un conseil
          </TrackedLink>
        </div>
      </aside>
    </div>
  );
}
