"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { full, thumb } from "@/lib/shop";

type Props = Omit<ImageProps, "src" | "alt"> & {
  product: Product;
  /** photo précise à afficher (sinon : la photo principale du parfum) */
  img?: string;
  size?: "thumb" | "full";
  alt?: string;
};

/** Photo produit d'origine, avec une jaquette au nom du parfum si la photo manque. */
export default function ProductImage({ product, img = product.images[0], size = "thumb", alt = product.nom, className, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // une image déjà en échec avant l'hydratation ne déclenche pas onError : on le vérifie au montage
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, [img]);

  if (!img || failed) {
    return (
      <span className={`ph${rest.fill ? " ph--fill" : ""} ${className ?? ""}`} role="img" aria-label={product.nom}>
        <span className="ph__name">{product.nom}</span>
      </span>
    );
  }

  return (
    <Image
      src={size === "full" ? full(img) : thumb(img)}
      alt={alt}
      ref={ref}
      className={`is-photo ${className ?? ""}`}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
