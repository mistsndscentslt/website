import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Déploiement o2switch : `npm run build:dist` produit un dossier dist/ autonome
  // (serveur Node minimal + uniquement les node_modules utiles), sans npm install sur le serveur.
  output: "standalone",

  experimental: {
    // Sur o2switch, le dossier de l'application est un clone git de la branche `deploy`.
    // Par défaut, Next réécrit dans .next/ les pages régénérées (toutes les 15 min) : il modifierait
    // les fichiers suivis par git (le « Update from Remote » de cPanel échouerait) et, juste après
    // une mise à jour, l'ancien processus pourrait y remettre des pages de l'ancien build.
    // Les pages régénérées restent donc en mémoire ; le disque ne contient que le build.
    isrFlushToDisk: false,
  },

  images: {
    // Les photos sont déjà optimisées en webp (full + thumbs) par tools/prepare_images.py.
    // Pas d'optimisation à la volée : évite le binaire natif `sharp` (compilé ici pour Windows,
    // inutilisable sur le Linux d'o2switch) et la charge CPU/RAM sur l'hébergement mutualisé.
    unoptimized: true,
  },

  outputFileTracingExcludes: {
    "/*": [
      "node_modules/sharp/**/*",
      "node_modules/@img/**/*",
      "node_modules/@next/swc-*/**/*",
      ".data/**/*",
      "images_a_traiter/**/*",
      "tools/**/*",
    ],
  },
};

export default nextConfig;
