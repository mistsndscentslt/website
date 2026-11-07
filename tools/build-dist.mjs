/* Assemble le dossier dist/ à envoyer sur o2switch (après `next build`, voir `npm run build:dist`).

   dist/
     server.js        ← « Application startup file » dans cPanel > Setup Node.js App
     package.json
     node_modules/    ← déjà prêt : NE PAS cliquer « Run NPM Install » dans cPanel
     .next/           ← code serveur + fichiers statiques (_next/static)
     public/          ← photos, logos, images d'aperçu

   + dist.zip (le même contenu), pratique à envoyer puis extraire avec le Gestionnaire de fichiers cPanel. */

import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const dist = path.join(root, "dist");
const zip = path.join(root, "dist.zip");

if (!existsSync(path.join(standalone, "server.js"))) {
  console.error("✗ .next/standalone/server.js introuvable : lancer `npm run build:dist` (et non ce script seul).");
  process.exit(1);
}

rmSync(dist, { recursive: true, force: true });
rmSync(zip, { force: true });

// dereference : copie le contenu réel des liens symboliques (Windows) pour un dossier transportable
cpSync(standalone, dist, { recursive: true, dereference: true });
cpSync(path.join(root, "public"), path.join(dist, "public"), { recursive: true });
cpSync(path.join(root, ".next", "static"), path.join(dist, ".next", "static"), { recursive: true });

// sharp est compilé pour la machine qui fait le build (Windows) : inutilisable sur le Linux d'o2switch,
// et inutile puisque next.config.ts désactive l'optimisation d'images.
for (const dir of ["node_modules/sharp", "node_modules/@img"]) {
  rmSync(path.join(dist, dir), { recursive: true, force: true });
}

// Pas de secrets ni de statistiques locales dans ce qui part en ligne :
// ADMIN_KEY et DATA_DIR se règlent dans cPanel (variables d'environnement de l'application).
for (const f of readdirSync(dist)) {
  if (f.startsWith(".env")) rmSync(path.join(dist, f), { force: true });
}
rmSync(path.join(dist, ".data"), { recursive: true, force: true });

console.log("✓ dist/ prêt");

// Archive zip : le tar de Windows 10+ (bsdtar) sait écrire du zip ; ailleurs on utilise `zip`.
try {
  if (process.platform === "win32") {
    const tar = path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe");
    execFileSync(tar, ["-a", "-c", "-f", zip, "-C", dist, "."], { stdio: "inherit" });
  } else {
    execFileSync("zip", ["-qr", zip, "."], { cwd: dist, stdio: "inherit" });
  }
  console.log("✓ dist.zip prêt");
} catch {
  console.warn("! dist.zip non créé : compresser le contenu de dist/ à la main (dossier .next compris).");
}
