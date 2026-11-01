import { appendEvent } from "@/lib/events-store";

const ALLOWED = new Set([
  "page_view",
  "view_product",
  "search",
  "filter",
  "add_to_cart",
  "whatsapp_order",
  "whatsapp_contact",
  "quiz_complete",
  "occasion_view",
  "intent",
  "spray",
]);

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(request: Request) {
  if (BOT.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof body.type !== "string" || !ALLOWED.has(body.type)) return new Response(null, { status: 400 });

  // On ne garde que des valeurs simples et courtes
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === "string") clean[k] = v.slice(0, 120);
    else if (typeof v === "number" || typeof v === "boolean") clean[k] = v;
    else if (Array.isArray(v)) clean[k] = v.slice(0, 30).map((x) => String(x).slice(0, 60));
  }
  try {
    await appendEvent({ ...clean, type: body.type, ts: Date.now() });
  } catch (err) {
    console.error("track: écriture impossible", err);
  }
  return new Response(null, { status: 204 });
}
