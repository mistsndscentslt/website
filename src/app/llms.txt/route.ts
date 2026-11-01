import { ACCORDS } from "@/data/accords";
import { OCCASIONS } from "@/data/occasions";
import { CONFIG, FAMILLES, GENRES, PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/shop";
import { abs } from "@/lib/seo";

/* /llms.txt — résumé du site pensé pour les assistants IA (ChatGPT, Claude, Perplexity…).
   Format : https://llmstxt.org */
export function GET() {
  const lines: string[] = [];
  lines.push(`# ${CONFIG.boutique}`);
  lines.push("");
  lines.push(
    `> ${CONFIG.maison} : parfums de luxe à prix doux, à ${CONFIG.ville}. ${PRODUCTS.length} parfums des maisons orientales (Lattafa, Armaf, Afnan, French Avenue, Fragrance World, Paris Corner, Kayali…), de ${formatPrice(Math.min(...PRODUCTS.map((p) => p.prix)))} à ${formatPrice(Math.max(...PRODUCTS.map((p) => p.prix)))}. Commande sur WhatsApp (${CONFIG.telephone}), paiement ${CONFIG.paiements.join(", ")}.`,
  );
  lines.push("");
  lines.push("## Le positionnement");
  lines.push("- Des parfums au sillage digne des grandes signatures, sans payer la publicité, les égéries ni les boutiques de luxe.");
  lines.push("- Une sélection courte : chaque parfum est porté avant d'entrer dans la collection.");
  lines.push("- Conseil personnalisé sur WhatsApp, quiz en 5 questions (genre, âge, moment, ambiance, budget) et accords de parfums à superposer.");
  lines.push("");
  lines.push("## Pages utiles");
  lines.push(`- [Collection complète](${abs("/#collection")})`);
  lines.push(`- [Quiz : trouver son parfum](${abs("/#quiz")})`);
  lines.push(`- [Accords signature (layering)](${abs("/#accords")})`);
  lines.push(`- [Questions fréquentes](${abs("/#faq")})`);
  lines.push("");
  lines.push("## Comment commander");
  lines.push(`- Ajouter les parfums au panier sur ${abs("/")} puis « Commander sur WhatsApp » : le message de commande est pré-rempli.`);
  lines.push(`- Ou écrire directement sur WhatsApp : https://wa.me/${CONFIG.whatsapp}`);
  lines.push(`- Paiement : ${CONFIG.paiements.join(", ")}. Prix en francs CFA (XOF).`);
  lines.push(`- Livraison à Lomé à partir de ${formatPrice(CONFIG.livraisonDes)} (montant exact confirmé sur WhatsApp) ; autres villes : à confirmer sur WhatsApp.`);
  lines.push("");
  lines.push("## Trouver un parfum selon l'occasion");
  for (const o of OCCASIONS) {
    lines.push(`- [${o.titre}](${abs(`/occasion/${o.slug}`)}) : ${o.accroche}. Recommandés : ${o.picks.map((p) => PRODUCTS.find((x) => x.id === p.id)?.nom).filter(Boolean).join(", ")}.`);
  }
  lines.push("");
  lines.push("## Accords signature : superposer 2 ou 3 parfums");
  for (const a of ACCORDS) {
    const items = a.ids.map((id) => PRODUCTS.find((x) => x.id === id)).filter((x) => !!x);
    lines.push(`- [${a.nom}](${abs(`/accord/${a.slug}`)}) : ${items.map((x) => x.nom).join(" + ")} (${formatPrice(items.reduce((t, x) => t + x.prix, 0))}). ${a.idee} Comment le porter : ${a.recette}`);
  }
  lines.push("");
  lines.push("## Catalogue complet (prix en FCFA)");
  for (const p of PRODUCTS) {
    const notes = p.notes ? ` Notes — tête : ${p.notes.tete.join(", ")} ; cœur : ${p.notes.coeur.join(", ")} ; fond : ${p.notes.fond.join(", ")}.` : "";
    lines.push(
      `- [${p.nom}${p.marque ? ` — ${p.marque}` : ""}](${abs(`/parfum/${p.id}`)}) : ${formatPrice(p.prix)}${p.volume ? `, ${p.volume}` : ""}. ${GENRES[p.genre]} · ${p.familles.map((f) => FAMILLES[f].label).join(", ")}. Accords : ${p.accords.join(", ")}.${notes} ${p.description}${p.dispo === false ? " (actuellement indisponible)" : ""}`,
    );
  }
  lines.push("");
  lines.push("## Familles olfactives");
  for (const f of Object.values(FAMILLES)) lines.push(`- ${f.label} : ${f.desc}`);

  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
