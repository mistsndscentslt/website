import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Déploiement o2switch : `npm run build:dist` produit un dossier dist/ autonome
  // (serveur Node minimal + uniquement les node_modules utiles), sans npm install sur le serveur.
  output: "standalone",

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
