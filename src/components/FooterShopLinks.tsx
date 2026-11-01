"use client";

import Link from "next/link";
import type { Famille, Genre } from "@/data/products";
import { useShop } from "./ShopProvider";

const LINKS: [string, Genre | "all", Famille | "all"][] = [
  ["Toute la collection", "all", "all"],
  ["Pour elle", "femme", "all"],
  ["Pour lui", "homme", "all"],
  ["Les mixtes", "mixte", "all"],
  ["Gourmands", "all", "gourmand"],
  ["Boisés & oud", "all", "boise"],
];

/** Liens du pied de page qui ouvrent la collection déjà filtrée. */
export function FooterShopLinks() {
  const { setGenre, setFamily } = useShop();
  return (
    <ul>
      {LINKS.map(([label, genre, family]) => (
        <li key={label}>
          <Link
            href="/#collection"
            onClick={() => {
              setGenre(genre);
              setFamily(family);
            }}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
