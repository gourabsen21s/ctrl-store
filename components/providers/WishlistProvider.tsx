"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type Product, imageFor } from "@/lib/products";

export type WishlistItem = {
  handle: string;
  title: string;
  price: number;
  category: string;
  color: string;
  sizes: string[];
  image: string;
  stock?: number;
};

type WishlistContextType = {
  items: WishlistItem[];
  count: number;
  isInWishlist: (handle: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeItem: (handle: string) => void;
  clearWishlist: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toast: string | null;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}

const STORAGE_KEY = "ctrl-wishlist";

export default function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // LocalStorage unavailable or corrupt
    }
    setReady(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Quota exceeded
    }
  }, [items, ready]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const isInWishlist = (handle: string) => {
    return items.some((item) => item.handle === handle);
  };

  const toggleWishlist = (product: Product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.handle === product.handle);
      if (exists) {
        showToast(`Removed "${product.title}" from Wishlist`);
        return prev.filter((i) => i.handle !== product.handle);
      } else {
        showToast(`Saved "${product.title}" to Wishlist`);
        const newItem: WishlistItem = {
          handle: product.handle,
          title: product.title,
          price: product.price,
          category: product.category,
          color: product.color,
          sizes: product.sizes || ["One size"],
          image: imageFor(product, "front"),
          stock: product.stock,
        };
        return [newItem, ...prev];
      }
    });
  };

  const removeItem = (handle: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.handle === handle);
      if (found) {
        showToast(`Removed "${found.title}" from Wishlist`);
      }
      return prev.filter((i) => i.handle !== handle);
    });
  };

  const clearWishlist = () => {
    setItems([]);
    showToast("Cleared all items from Wishlist");
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const value = useMemo<WishlistContextType>(
    () => ({
      items,
      count: items.length,
      isInWishlist,
      toggleWishlist,
      removeItem,
      clearWishlist,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toast,
    }),
    [items, isDrawerOpen, toast]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 border border-white/20 bg-black/90 px-4 py-3 text-xs font-mono text-white shadow-2xl backdrop-blur-md animate-fade-in"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
          <span>{toast}</span>
        </div>
      )}
    </WishlistContext.Provider>
  );
}
