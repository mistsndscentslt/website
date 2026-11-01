"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/analytics";

/** Enregistre chaque page vue (et d'où vient le visiteur). */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    let ref: string | undefined;
    try {
      const r = document.referrer ? new URL(document.referrer).hostname : "";
      ref = r && r !== window.location.hostname ? r : undefined;
    } catch {}
    track({ type: "page_view", path: pathname, ref });
  }, [pathname]);
  return null;
}

/** Envoie un événement au montage (ex : consultation d'une page occasion). */
export function TrackOnMount({ event }: { event: TrackEvent }) {
  const key = JSON.stringify(event);
  useEffect(() => {
    track(JSON.parse(key));
  }, [key]);
  return null;
}

/** Lien qui enregistre un clic avant de partir (ex : bouton WhatsApp). */
export function TrackedLink({ event, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { event: TrackEvent }) {
  return <a {...props} onClick={() => track(event)} />;
}
