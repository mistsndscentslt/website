import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "@/components/ProductDetail";
import { TrackOnMount } from "@/components/Tracking";
import { GENRES, PRODUCTS } from "@/data/products";
import { formatPrice, getProduct, ogCard } from "@/lib/shop";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/parfum/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return {};
  const title = `${p.nom}${p.marque ? ` ${p.marque}` : ""} — ${formatPrice(p.prix)} à Lomé`;
  const description = `${p.description.split(/(?<=[.!?])\s/)[0]} Parfum ${GENRES[p.genre].toLowerCase()}, ${formatPrice(p.prix)}. Commande sur WhatsApp, livraison à Lomé.`;
  return {
    title,
    description,
    alternates: { canonical: `/parfum/${p.id}` },
    openGraph: {
      title: `${p.nom}${p.marque ? ` · ${p.marque}` : ""} — ${formatPrice(p.prix)}`,
      description: `${p.description.split(/(?<=[.!?])\s/)[0]} Commande sur WhatsApp, livraison à Lomé.`,
      type: "website",
      images: p.images[0] ? [{ ...ogCard(p.id), alt: `${p.nom} — ${formatPrice(p.prix)}` }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProductPage({ params }: PageProps<"/parfum/[id]">) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  return (
    <div className="page page--product">
      <JsonLd
        data={[
          productJsonLd(p),
          breadcrumbJsonLd([
            ["Accueil", "/"],
            ["Collection", "/#collection"],
            [p.nom, `/parfum/${p.id}`],
          ]),
        ]}
      />
      <TrackOnMount event={{ type: "view_product", id: p.id, source: "page" }} />
      <nav className="crumbs" aria-label="Fil d'Ariane">
        <Link href="/">Accueil</Link> / <Link href="/#collection">Collection</Link> / <span>{p.nom}</span>
      </nav>
      <div className="page__card">
        <ProductDetail product={p} variant="page" />
      </div>
    </div>
  );
}
