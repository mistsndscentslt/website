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

Les données sont écrites dans `.data/` (ou dans `DATA_DIR`), un fichier par mois : il faut un hébergement Node avec disque
(o2switch, VPS…). Sur Vercel, remplacer les deux fonctions de [src/lib/events-store.ts](src/lib/events-store.ts) par une base (ex. Upstash Redis).

## Mise en ligne sur o2switch

Le site a besoin de Node (tableau de bord, statistiques) : ce n'est **pas** un site statique à poser dans `public_html`.
Rien n'est compilé ni installé sur le serveur : on y envoie le site déjà compilé.

### Comment ça marche

À chaque push sur `main`, GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) compile le site
sous Linux (`npm run build:dist`) et ajoute le résultat sur la branche **`deploy`** du dépôt.
Sur o2switch, le dossier de l'application est un clone de cette branche : on le met à jour depuis cPanel.

`NEXT_PUBLIC_SITE_URL` est figée au moment du build : la régler dans GitHub
(*Settings → Secrets and variables → Actions → Variables*). Sans elle, le site utilise `CONFIG.siteUrl`.

### Première mise en ligne (cPanel)

1. **Setup Node.js App** → *Create Application* :
   Node.js **22**, mode `Production`, racine `mistsandscents`, l'URL du domaine, fichier de démarrage `server.js`.
   Dans *Variables d'environnement* : `ADMIN_KEY` (clé du tableau de bord) et, tant que les statistiques
   sont en fichiers, `DATA_DIR` = `/home/<compte>/mists-data`. *Enregistrer*, puis **Arrêter l'application**.
2. **Gestionnaire de fichiers** → `/home/<compte>/mistsandscents/` : supprimer `public/`, `tmp/` et `server.js`
   que cPanel a créés (le dossier doit être **vide** pour pouvoir y cloner).
3. **Git™ Version Control** → *Create* :
   URL `https://github.com/mistsndscentslt/website.git`, chemin `mistsandscents`, nom `mistsandscents` → *Create*.
4. Toujours dans Git Version Control → *Manage* sur ce dépôt → *Checked-Out Branch* : **`deploy`** → *Update*.
   Le dossier contient alors `server.js`, `package.json`, `node_modules/`, `public/`, `.next/`.
5. **Setup Node.js App** → *Démarrer* / *Redémarrer*.
6. **SSL/TLS Status** : vérifier le certificat (AutoSSL) du domaine.

⚠️ Ne **pas** cliquer *Run NPM Install* : `node_modules/` est déjà fourni (compilé sous Linux par GitHub).

### Mettre le site à jour

1. Pousser sur `main`, attendre que l'action *Build pour o2switch* soit verte (onglet *Actions* sur GitHub, 2 à 3 min).
2. cPanel → **Git™ Version Control** → *Manage* → *Pull or Deploy* → **Update from Remote**.
3. **Setup Node.js App** → **Redémarrer**.

Les variables d'environnement (clé admin, accès MySQL…) restent dans cPanel : ni Git ni les mises à jour n'y touchent.
Le dépôt est **public** : ne jamais y mettre de mot de passe ni de fichier `.env`.

### En cas de souci

- **Page d'erreur Passenger** : lire `stderr.log` dans le dossier de l'application.
- **Message « node_modules … virtual environment »** de cPanel : il vient du bouton NPM ; ne pas l'utiliser.
- **Sans GitHub** : `npm run build:dist` sur le PC produit `dist.zip`, à extraire dans le dossier de l'application.
- **Tester le build sur le PC** : `cd dist` puis `node server.js` → http://localhost:3000
