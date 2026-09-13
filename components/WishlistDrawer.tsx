"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useBag } from "@/components/providers/BagProvider";
import { money } from "@/lib/products";

export default function WishlistDrawer() {
  const pathname = usePathname();
  const { items, count, isDrawerOpen, closeDrawer, removeItem, clearWishlist } = useWishlist();
  const { add } = useBag();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  if (pathname?.startsWith("/admin") || !isDrawerOpen) return null;

  const handleMoveToBag = (item: (typeof items)[0]) => {
    if (item.stock === 0) return;
    add({
      handle: item.handle,
      title: item.title,
      price: item.price,
      size: item.sizes?.[0] || "One size",
      qty: 1,
      image: item.image,
    });
    removeItem(item.handle);
  };

  const handleMoveAllToBag = () => {
    const available = items.filter((i) => i.stock !== 0);
    available.forEach((item) => {
      add({
        handle: item.handle,
        title: item.title,
        price: item.price,
        size: item.sizes?.[0] || "One size",
        qty: 1,
        image: item.image,
      });
      removeItem(item.handle);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist Drawer"
        className="relative z-10 flex h-full w-full max-w-md flex-col justify-between border-l border-white/10 bg-[#0e0e0e] text-cream shadow-2xl transition-transform duration-300 ease-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red animate-pulse" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-white">
              Wishlist // Saved ({count})
            </h2>
          </div>
          <button
            type="button"
            data-cursor
            onClick={closeDrawer}
            className="text-xs font-mono uppercase tracking-wider text-white/60 hover:text-white transition-colors"
          >
            [ Close ✕ ]
          </button>
        </div>

        {/* Items list or empty state */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-white/10">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl text-white/40">
                ♡
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Your wishlist is empty</h3>
              <p className="max-w-xs text-xs text-white/50 mb-6 font-mono">
                Tap the heart icon on any piece across the catalog to save it for later.
              </p>
              <button
                type="button"
                data-cursor
                onClick={closeDrawer}
                className="px-6 py-2.5 border border-white bg-white text-black text-xs font-mono uppercase tracking-wider font-bold hover:bg-transparent hover:text-white transition-colors"
              >
                Explore Catalogue
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isSoldOut = item.stock === 0;
              const isLowStock = item.stock !== undefined && item.stock > 0 && item.stock <= 5;

              return (
                <div key={item.handle} className="flex gap-4 py-4 group">
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${item.handle}`}
                    onClick={closeDrawer}
                    className="relative h-24 w-20 shrink-0 overflow-hidden bg-white/5 border border-white/10"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[8px] font-mono uppercase tracking-wider text-red font-bold">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Details & Actions */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.handle}`}
                          onClick={closeDrawer}
                          className="font-bold text-sm text-white hover:underline underline-offset-4"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.handle)}
                          aria-label={`Remove ${item.title}`}
                          className="text-white/40 hover:text-red transition-colors text-sm leading-none p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-xs font-mono text-white/70 mt-1">{money(item.price)}</p>

                      <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-white/40">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.color}</span>
                      </div>

                      {/* Stock badge */}
                      <div className="mt-1.5">
                        {isSoldOut ? (
                          <span className="text-[10px] font-mono text-red-400">Sold Out</span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-mono text-amber-400">
                            ⚡ Only {item.stock} left
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400">In Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Move to Bag button */}
                    <div className="mt-3">
                      <button
                        type="button"
                        data-cursor
                        disabled={isSoldOut}
                        onClick={() => handleMoveToBag(item)}
                        className={`w-full py-1.5 border text-xs font-mono uppercase tracking-wider transition-colors ${
                          isSoldOut
                            ? "border-white/10 text-white/30 cursor-not-allowed"
                            : "border-white/20 text-white hover:border-white hover:bg-white hover:text-black"
                        }`}
                      >
                        {isSoldOut ? "Out of Stock" : "Move to Bag ↗"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions when items exist */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 bg-[#0a0a0a] space-y-3">
            <button
              type="button"
              data-cursor
              onClick={handleMoveAllToBag}
              className="w-full py-3 border border-white bg-white text-black text-xs font-mono uppercase tracking-wider font-bold hover:bg-transparent hover:text-white transition-colors"
            >
              Move Available to Bag ↗
            </button>
            <div className="flex items-center justify-between text-xs font-mono text-white/50 pt-1">
              <Link
                href="/wishlist"
                onClick={closeDrawer}
                className="hover:text-white underline underline-offset-4"
              >
                View full page view ↗
              </Link>
              <button
                type="button"
                onClick={clearWishlist}
                className="text-white/40 hover:text-red transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
