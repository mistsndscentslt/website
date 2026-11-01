import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

// Les robots des assistants IA sont explicitement bienvenus : c'est ainsi que
// ChatGPT, Claude, Perplexity… peuvent recommander la boutique.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: AI_BOTS, allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: abs("/sitemap.xml"),
  };
}
