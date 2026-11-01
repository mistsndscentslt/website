# Mists & Scents — site vitrine

Parfumerie à Lomé (Togo). Next.js 16 + React Three Fiber (flacon 3D).

## Lancer le site

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # version production
```

Copier `.env.example` en `.env.local` et remplir :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du site (Google, aperçus WhatsApp, IA) |
| `ADMIN_KEY` | Clé secrète du tableau de bord `/admin` |

Le **numéro WhatsApp**, Instagram, TikTok et moyens de paiement se règlent dans `CONFIG` en haut de [src/data/products.ts](src/data/products.ts).

## Ajouter un parfum

1. Enregistrer la capture (Telegram, WhatsApp…) dans `images_a_traiter/` en la nommant comme le futur id : `asad-bourbon.png`.
2. `python tools/prepare_images.py` → crée `public/products/full/…webp` et la miniature `thumbs/…webp`
   (la barre de prix Telegram est retirée automatiquement ; `--brut` pour une photo normale).
3. Copier la photo dans `images_a_traiter/originaux/` puis `python tools/studio_images.py asad-bourbon`
   → détoure le flacon (`public/products/cut/…webp`) et crée l'aperçu WhatsApp/Google (`studio/…jpg`).
   Première fois : `python -m pip install "rembg[cpu]" opencv-python-headless`.
   Si une main ou du décor reste visible, ajouter un réglage dans `TWEAKS` en haut du script.
4. Copier un bloc dans `PRODUCTS` de [src/data/products.ts](src/data/products.ts) et changer les valeurs.
   `images` = photos d'ambiance montrées après le flacon ; laisser `[]` si la photo montre des mains.

Meilleur rendu : un flacon posé sur une table, photographié de face à la lumière du jour, sans main.
Tant qu'un flacon n'est pas détouré, le site affiche sa photo, puis à défaut une jaquette avec son nom.

## Accords signature (layering)

[src/data/accords.ts](src/data/accords.ts) : duos et trios de parfums à superposer, avec la recette.
Ils apparaissent sur l'accueil, dans les fiches produit et en résultat du quiz (choisis selon genre, âge et moment).

## Occasions (« Je cherche un parfum pour… »)

[src/data/occasions.ts](src/data/occasions.ts) : rendez-vous, cadeau, cérémonie, soirée, bureau, chaleur.
Chaque occasion a sa page `/occasion/<slug>` et, pour chaque parfum, la **raison** pour laquelle il convient.

## SEO & assistants IA

- Une page par parfum (`/parfum/<id>`) et par occasion, avec titre, description et image d'aperçu.
- Données structurées schema.org : boutique, produits (prix en XOF), FAQ, fil d'Ariane.
- `/sitemap.xml`, `/robots.txt` (robots de ChatGPT, Claude, Perplexity… autorisés).
- `/llms.txt` : résumé du catalogue pour les IA, généré automatiquement depuis le catalogue.

## Statistiques — `/admin`

Sans service externe ni cookie de suivi. Le tableau de bord montre : visiteurs, parcours d'achat,
parfums les plus regardés / ajoutés / commandés, **recherches** (et celles **sans résultat** = demande à saisir),
occasions consultées, réponses au quiz, provenance des visiteurs, parfums jamais vus.

Les données sont écrites dans `.data/` (un fichier par mois) : il faut un hébergement Node avec disque
(VPS, Render, Railway…). Sur Vercel, remplacer les deux fonctions de [src/lib/events-store.ts](src/lib/events-store.ts) par une base (ex. Upstash Redis).
