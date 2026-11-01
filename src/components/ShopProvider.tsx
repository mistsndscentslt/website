"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Famille, Genre, Product } from "@/data/products";
import { track } from "@/lib/analytics";
import { getProduct } from "@/lib/shop";

type CartLine = { id: string; qty: number };
type Toast = { product: Product; key: number } | null;

interface ShopState {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  openProduct: Product | null;
  showProduct: (id: string | null, source?: string) => void;
  family: Famille | "all";
  setFamily: (f: Famille | "all") => void;
  genre: Genre | "all";
  setGenre: (g: Genre | "all") => void;
  toast: Toast;
}

const ShopContext = createContext<ShopState | null>(null);
const STORAGE_KEY = "ms-cart";

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [family, setFamily] = useState<Famille | "all">("all");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [toast, setToast] = useState<Toast>(null);
  const loaded = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Panier conservé dans le navigateur
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CartLine[];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local au montage
      setCart(saved.filter((l) => getProduct(l.id)));
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Bloque le défilement quand une fenêtre est ouverte
  useEffect(() => {
    document.body.style.overflow = cartOpen || openProduct ? "hidden" : "";
  }, [cartOpen, openProduct]);

  const add = useCallback((id: string, qty = 1) => {
    const product = getProduct(id);
    if (!product) return;
    track({ type: "add_to_cart", id, qty });
    setCart((c) => {
      const line = c.find((l) => l.id === id);
      return line ? c.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l)) : [...c, { id, qty }];
    });
    clearTimeout(toastTimer.current);
    setToast({ product, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty } : l))));
  }, []);
  const remove = useCallback((id: string) => setCart((c) => c.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setCart([]), []);
  const showProduct = useCallback((id: string | null, source = "grille") => {
    if (id) track({ type: "view_product", id, source });
    setOpenProduct(id ? getProduct(id) ?? null : null);
  }, []);

  const value = useMemo<ShopState>(() => {
    const cartCount = cart.reduce((s, l) => s + l.qty, 0);
    const cartTotal = cart.reduce((s, l) => s + (getProduct(l.id)?.prix ?? 0) * l.qty, 0);
    return { cart, cartCount, cartTotal, add, setQty, remove, clear, cartOpen, setCartOpen, openProduct, showProduct, family, setFamily, genre, setGenre, toast };
  }, [cart, add, setQty, remove, clear, cartOpen, openProduct, showProduct, family, genre, toast]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop doit être utilisé dans <ShopProvider>");
  return ctx;
}
