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
On compile sur le PC et on envoie un dossier `dist/` autonome ; rien n'est compilé ni installé sur le serveur.

### 1. Préparer `dist/` (sur le PC)

1. Vérifier `NEXT_PUBLIC_SITE_URL` dans `.env.local` (elle est **figée au moment du build**).
2. `npm run build:dist` → crée `dist/` et `dist.zip` (même contenu).

`dist/` ne contient ni `.env.local`, ni `.data/` : les secrets se règlent dans cPanel.

### 2. Première mise en ligne (cPanel)

1. **Setup Node.js App** → *Create Application* :
   - Node.js version : la plus récente proposée (**20.9 minimum**, 22 conseillé)
   - Application mode : `Production`
   - Application root : `mistsandscents` (dossier dans `/home/<compte>/`, **hors** `public_html`)
   - Application URL : le domaine
   - Application startup file : `server.js`
   - Environment variables :
     `ADMIN_KEY` = la clé du tableau de bord, `DATA_DIR` = `/home/<compte>/mists-data`
   - *Create*.
2. **Gestionnaire de fichiers** → ouvrir `/home/<compte>/mistsandscents/`, supprimer ce que cPanel y a mis par défaut,
   envoyer `dist.zip`, faire *Extract*, puis supprimer le zip. On doit voir `server.js`, `package.json`,
   `node_modules/`, `public/` et `.next/` (dossier caché : *Paramètres* → *Afficher les fichiers cachés*).
3. Retour dans **Setup Node.js App** → *Restart*.
4. **SSL/TLS Status** : vérifier que le certificat (AutoSSL) couvre le domaine et `www`.

⚠️ Ne **pas** cliquer *Run NPM Install* : `node_modules/` est déjà fourni (et prévu pour tourner sans compilation).

### 3. Mises à jour suivantes

1. `npm run build:dist`
2. Dans `/home/<compte>/mistsandscents/` : supprimer `.next/`, `node_modules/`, `public/`, `server.js`, `package.json`
   (les statistiques ne sont pas touchées : elles sont dans `DATA_DIR`), envoyer et extraire `dist.zip`.
3. *Restart* dans **Setup Node.js App**.

### En cas de souci

- **Page d'erreur Passenger** : lire `stderr.log` dans le dossier de l'application.
- **Message « node_modules … virtual environment »** de cPanel : il vient du bouton NPM ou de la modification
  de l'application. Supprimer `node_modules/`, enregistrer le réglage, puis renvoyer `dist.zip` et *Restart*.
- **Tester `dist/` sur le PC avant d'envoyer** : `cd dist` puis `node server.js` → http://localhost:3000
