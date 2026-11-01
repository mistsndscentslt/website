import type { MetadataRoute } from "next";
import { ACCORDS } from "@/data/accords";
import { OCCASIONS } from "@/data/occasions";
import { PRODUCTS } from "@/data/products";
import { full } from "@/lib/shop";
import { abs } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    { url: abs("/qui-sommes-nous"), changeFrequency: "yearly", priority: 0.5 },
    ...OCCASIONS.map((o) => ({ url: abs(`/occasion/${o.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...ACCORDS.map((a) => ({ url: abs(`/accord/${a.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...PRODUCTS.map((p) => ({
      url: abs(`/parfum/${p.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.map((i) => abs(full(i))),
    })),
  ];
}
