import "server-only";
import { promises as fs } from "fs";
import path from "path";

/* Stockage des statistiques : un fichier par mois dans .data/ (une ligne JSON par événement).
   Fonctionne sur tout hébergement Node avec disque (VPS, Render, Railway, o2switch Node…).
   Sur Vercel (pas de disque persistant), remplacer ces deux fonctions par une base (ex : Upstash Redis). */

// DATA_DIR : à régler sur o2switch vers un dossier HORS de l'application (ex. /home/<compte>/mists-data)
// pour que les statistiques survivent quand on remplace le dossier de l'application à chaque mise en ligne.
// (le commentaire turbopackIgnore empêche le build d'embarquer tout le projet dans le serveur)
const DIR = process.env.DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), ".data");

export type StoredEvent = Record<string, unknown> & { type: string; ts: number; sid?: string; mobile?: boolean };

export async function appendEvent(e: StoredEvent) {
  await fs.mkdir(DIR, { recursive: true });
  const month = new Date(e.ts).toISOString().slice(0, 7);
  await fs.appendFile(path.join(DIR, `events-${month}.ndjson`), JSON.stringify(e) + "\n", "utf8");
}

export async function readEvents(sinceDays: number): Promise<StoredEvent[]> {
  const since = Date.now() - sinceDays * 86400000;
  let files: string[] = [];
  try {
    files = (await fs.readdir(DIR)).filter((f) => f.startsWith("events-") && f.endsWith(".ndjson"));
  } catch {
    return [];
  }
  const out: StoredEvent[] = [];
  for (const f of files.sort()) {
    const lines = (await fs.readFile(path.join(DIR, f), "utf8")).split("\n");
    for (const l of lines) {
      if (!l) continue;
      try {
        const e = JSON.parse(l) as StoredEvent;
        if (e.ts >= since) out.push(e);
      } catch {}
    }
  }
  return out;
}
