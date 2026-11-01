import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { CONFIG, PRODUCTS } from "@/data/products";
import { minPrice, ogCard } from "@/lib/shop";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const display = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const body = Jost({
  variable: "--font-body",
  subsets: ["latin"],
});

const description = `${PRODUCTS.length} parfums orientaux dès ${minPrice.toLocaleString("fr-FR")} FCFA à Lomé : Lattafa, Armaf, Afnan, French Avenue… Commande sur WhatsApp, paiement ${CONFIG.paiements.join(", ")}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${CONFIG.boutique} — Parfums de luxe à prix doux, Lomé`,
    template: `%s | ${CONFIG.boutique}`,
  },
  description,
  keywords: [
    "parfum Lomé",
    "parfumerie Togo",
    "Lattafa Lomé",
    "parfum oriental Togo",
    "acheter parfum Lomé",
    "Khamrah Lomé",
    "Yara Lattafa Togo",
    "idée cadeau parfum Lomé",
    "parfum pas cher Lomé",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_TG",
    siteName: CONFIG.boutique,
    title: `${CONFIG.boutique} — Parfums de luxe à prix doux, Lomé`,
    description,
    images: [{ ...ogCard("accueil"), alt: "Mists & Scents — parfums de luxe à prix doux, Lomé" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F4EEE6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Active les animations d'apparition uniquement quand le JavaScript tourne */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
