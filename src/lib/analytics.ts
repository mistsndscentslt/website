/* Statistiques maison : envoie des événements anonymes à /api/track.
   Aucun cookie, aucune donnée personnelle. */

export type TrackEvent =
  | { type: "page_view"; path: string; ref?: string }
  | { type: "view_product"; id: string; source: string }
  | { type: "search"; q: string; results: number }
  | { type: "filter"; genre?: string; family?: string }
  | { type: "add_to_cart"; id: string; qty: number }
  | { type: "whatsapp_order"; ids: string[]; total: number; source: "cart" | "product" | "accord" }
  | { type: "whatsapp_contact"; source: string }
  | { type: "quiz_complete"; genre: string; familles: string; budget: string; top: string }
  | { type: "occasion_view"; slug: string }
  | { type: "intent"; choice: string }
  | { type: "spray" };

function sessionId() {
  try {
    let id = sessionStorage.getItem("ms-sid");
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem("ms-sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function track(event: TrackEvent) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ ...event, sid: sessionId(), mobile: window.innerWidth < 768 });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
  } catch {}
}
