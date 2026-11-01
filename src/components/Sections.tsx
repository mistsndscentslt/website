import Image from "next/image";
import Link from "next/link";
import { CONFIG } from "@/data/products";
import { OCCASIONS } from "@/data/occasions";
import { formatPrice, minPrice, whatsappLink } from "@/lib/shop";
import { FooterShopLinks } from "./FooterShopLinks";
import { WhatsappIcon } from "./Icons";
import { TrackedLink } from "./Tracking";

/** Trois portes d'entrée selon ce que le visiteur sait déjà. */
export function Guide() {
  const ways = [
    ["I", "Je sais ce que je veux", "Cherchez par nom, marque ou note : vanille, oud, rose…", "#collection"],
    ["II", "C'est pour une occasion", "Rendez-vous, cadeau, mariage, bureau : nos sélections expliquées.", "#occasions"],
    ["III", "Conseillez-moi", "Cinq questions : vos parfums et votre accord signature.", "#quiz"],
  ];
  return (
    <section className="guide" aria-label="Comment choisir">
      {ways.map(([n, title, text, href]) => (
        <a key={n} href={href} className="guide__item reveal">
          <span className="guide__n">{n}</span>
          <strong>{title}</strong>
          <span className="guide__text">{text}</span>
          <span className="guide__arrow" aria-hidden="true">
            →
          </span>
        </a>
      ))}
    </section>
  );
}

/** Le positionnement : luxe, prix doux — et pourquoi c'est possible. */
export function Perks() {
  return (
    <section className="section manifesto" id="maison">
      <div className="manifesto__head reveal">
        <p className="kicker">{CONFIG.maison}</p>
        <h2 className="section__title">
          Le luxe, <em>sans le prix du luxe.</em>
        </h2>
        <p className="section__lead">
          Un grand parfum, c&apos;est d&apos;abord un jus, un flacon et un sillage. Le reste — les égéries, les campagnes, les
          vitrines des grands boulevards — c&apos;est vous qui le payez. Pas ici.
        </p>
      </div>
      <div className="ledger reveal">
        <div className="ledger__col ledger__col--out">
          <h3>Ailleurs, vous payez</h3>
          <ul>
            <li>La campagne publicitaire</li>
            <li>L&apos;égérie de cinéma</li>
            <li>La boutique des beaux quartiers</li>
            <li>Trois intermédiaires</li>
          </ul>
        </div>
        <div className="ledger__col ledger__col--in">
          <h3>Chez Mists &amp; Scents, vous payez</h3>
          <ul>
            <li>Le parfum</li>
            <li>Le flacon</li>
            <li>Le conseil</li>
          </ul>
          <p className="ledger__price">
            À partir de <strong>{formatPrice(minPrice)}</strong>
          </p>
        </div>
      </div>
      <ol className="pillars">
        <li className="reveal">
          <span>01</span>
          <h3>Les maisons qui font sensation</h3>
          <p>
            Lattafa, Armaf, Afnan, French Avenue, Kayali : les parfumeurs de Dubaï et d&apos;ailleurs que tout le monde s&apos;arrache,
            aux sillages dignes des plus grandes signatures.
          </p>
        </li>
        <li className="reveal">
          <span>02</span>
          <h3>Senti, puis choisi</h3>
          <p>Aucun parfum n&apos;entre dans la collection sans avoir été porté. Moins de références, que des coups de cœur.</p>
        </li>
        <li className="reveal">
          <span>03</span>
          <h3>Payé à votre façon</h3>
          <p>{CONFIG.paiements.join(", ")}. Vous commandez en un message, vous payez et vous êtes livrés.</p>
        </li>
      </ol>
    </section>
  );
}

export const FAQ = [
  [
    "Comment passer commande ?",
    "Ajoutez vos parfums au panier puis touchez « Commander sur WhatsApp ». Votre commande s'écrit automatiquement : il suffit d'envoyer le message. On vous confirme la disponibilité, vous payez pour valider la commande, puis on vous livre.",
  ],
  ["Quels moyens de paiement acceptez-vous ?", `${CONFIG.paiements.join(", ")}. Le paiement confirme votre commande ; on vous envoie les coordonnées sur WhatsApp, puis on vous livre.`],
  [
    "Combien coûte la livraison ?",
    `À Lomé, la livraison est à partir de ${formatPrice(CONFIG.livraisonDes)} selon votre quartier. Le montant exact vous est confirmé sur WhatsApp avec votre commande.`,
  ],
  ["Livrez-vous en dehors de Lomé ?", "Écrivez-nous sur WhatsApp avec votre ville : on vous indique les possibilités et les frais d'envoi."],
  [
    "Pourquoi vos prix sont-ils si doux ?",
    "Nous travaillons avec des maisons de parfum qui misent sur la qualité du jus plutôt que sur la publicité, et nous vendons en direct, sans boutique de luxe ni intermédiaires. Vous ne payez que le parfum.",
  ],
  [
    "Comment faire tenir mon parfum plus longtemps ?",
    "Vaporisez sur une peau hydratée, sur les points de pulsation (cou, poignets, derrière les oreilles) et sans frotter. Une touche sur les vêtements prolonge aussi le sillage.",
  ],
  ["Je ne sais pas quoi choisir, vous pouvez m'aider ?", "Bien sûr ! Faites le quiz en 5 questions plus haut, ou écrivez-nous sur WhatsApp en décrivant ce que vous aimez."],
];

export function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="faq__grid">
        <div className="faq__head reveal">
          <p className="kicker">Questions fréquentes</p>
          <h2 className="section__title">
            Tout ce qu&apos;il faut <em>savoir.</em>
          </h2>
          <p className="section__lead">Une autre question ? On répond sur WhatsApp, généralement en quelques minutes.</p>
        </div>
        <div className="faq__list reveal">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const socials = [
    ["Instagram", CONFIG.instagram],
    ["TikTok", CONFIG.tiktok],
  ].filter(([, url]) => url);
  return (
    <footer className="footer">
      <div className="footer__cta">
        <div>
          <p className="kicker kicker--light">Conseil personnalisé</p>
          <h2>
            Un doute, une envie, un cadeau ?
            <em> Parlons parfum.</em>
          </h2>
        </div>
        <div className="footer__cta-actions">
          <TrackedLink
            className="btn btn--wa-solid"
            href={whatsappLink(`Bonjour ${CONFIG.boutique}, j'aimerais un conseil parfum.`)}
            target="_blank"
            rel="noopener"
            event={{ type: "whatsapp_contact", source: "footer-cta" }}
          >
            <WhatsappIcon />
            Écrire sur WhatsApp
          </TrackedLink>
          <a className="footer__phone" href={`tel:+${CONFIG.whatsapp}`}>
            {CONFIG.telephone}
          </a>
        </div>
      </div>

      <div className="footer__grid">
        <div className="footer__brand">
          <Image src="/brand/logo-line-light.png" alt="Mists & Scents" width={186} height={127} />
          <p>
            {CONFIG.boutique}, votre boutique de parfums en ligne et votre conseillère personnelle. Du gourmand au boisé, du plus
            léger au plus tenace, on vous aide à trouver la fragrance qui vous ressemble, pour vous ou pour offrir.
          </p>
          <Link href="/qui-sommes-nous" className="footer__about">
            Qui sommes-nous →
          </Link>
        </div>
        <nav aria-label="La boutique">
          <h3>La boutique</h3>
          <FooterShopLinks />
        </nav>
        <nav aria-label="Choisir">
          <h3>Choisir</h3>
          <ul>
            <li>
              <Link href="/#quiz">Le quiz en 5 questions</Link>
            </li>
            {OCCASIONS.slice(0, 4).map((o) => (
              <li key={o.slug}>
                <Link href={`/occasion/${o.slug}`}>{o.titre}</Link>
              </li>
            ))}
            <li>
              <Link href="/#faq">Questions fréquentes</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h3>Commander</h3>
          <ul className="footer__facts">
            <li>
              <span>WhatsApp</span>
              <TrackedLink
                href={whatsappLink("Bonjour !")}
                target="_blank"
                rel="noopener"
                event={{ type: "whatsapp_contact", source: "footer-numero" }}
              >
                {CONFIG.telephone}
              </TrackedLink>
            </li>
            <li>
              <span>Livraison</span>
              {CONFIG.ville} dès {formatPrice(CONFIG.livraisonDes)} · autres villes sur demande
            </li>
            <li>
              <span>Paiement</span>
              {CONFIG.paiements.join(" · ")}
            </li>
          </ul>
        </div>
      </div>

      <p className="footer__word" aria-hidden="true">
        Mists <em>&amp;</em> Scents
      </p>
      <div className="footer__bottom">
        <span>
          © <Year /> {CONFIG.boutique} · {CONFIG.ville}
        </span>
        {socials.length > 0 && (
          <span className="footer__socials">
            {socials.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noopener">
                {label}
              </a>
            ))}
          </span>
        )}
      </div>
    </footer>
  );
}

/** Année courante, figée au moment du build (mise en cache). */
async function Year() {
  "use cache";
  return new Date().getFullYear();
}
