/** Données structurées schema.org (lues par Google, ChatGPT, Claude, Perplexity…). */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Échappe « < » pour qu'aucun texte ne puisse fermer la balise script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
