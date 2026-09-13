"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBag } from "@/components/providers/BagProvider";
import CartGamificationBar from "@/components/CartGamificationBar";
import { money } from "@/lib/products";
import { getRecentlyViewed } from "@/lib/recently-viewed";

export default function BagDrawer() {
  const pathname = usePathname();
  const {
    lines,
    count,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    remove,
    updateQty,
    clearBag,
    freeShippingUnlocked,
  } = useBag();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll when open
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

  const empty = lines.length === 0;
  const recentItems = getRecentlyViewed().slice(0, 4);

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div
        ref={drawerRef}
        className="relative flex h-full w-full max-w-lg flex-col border-l border-current/20 bg-[#0d0d0d] text-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red animate-pulse" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-white">
              Your Bag ({count})
            </h2>
          </div>
          <button
            type="button"
            data-cursor
            onClick={closeDrawer}
            aria-label="Close Bag Drawer"
            className="flex h-8 w-8 items-center justify-center border border-white/20 text-xs font-mono text-white/70 hover:border-white hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tiered Gamification Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-black/40">
          <CartGamificationBar />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {empty ? (
            <div className="py-16 text-center space-y-4">
              <p className="text-4xl font-[900] tracking-tight uppercase">Your bag is empty</p>
              <p className="text-xs font-mono text-white/50">
                Explore our signature catalog and exclusive drops.
              </p>
              <Link
                href="/store"
                onClick={closeDrawer}
                className="inline-block border border-white px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
              >
                Browse Store Catalog →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {lines.map((item) => (
                <li key={`${item.handle}-${item.size}`} className="flex gap-4 py-4 group">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-white/10 bg-white/5">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                    {item.isFreeGift && (
                      <div className="absolute top-1 left-1 bg-amber-500 text-black px-1 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider">
                        FREE
                      </div>
                    )}
                  </div>

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
                        {!item.isFreeGift && (
                          <button
                            type="button"
                            onClick={() => remove(item.handle, item.size)}
                            className="text-[10px] font-mono text-white/40 hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="text-xs font-mono text-white/50 mt-0.5">
                        Size: {item.size}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {item.isFreeGift ? (
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                          🎁 Free Reward
                        </span>
                      ) : (
                        <div className="flex items-center border border-white/20 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => updateQty(item.handle, item.size, item.qty - 1)}
                            className="px-2 py-1 hover:bg-white/10"
                          >
                            −
                          </button>
                          <span className="px-2.5 py-1 tabular-nums">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.handle, item.size, item.qty + 1)}
                            className="px-2 py-1 hover:bg-white/10"
                          >
                            +
                          </button>
                        </div>
                      )}

                      <div className="text-right">
                        {item.isFreeGift ? (
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                            ₹0 (Gift)
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-white tabular-nums">
                            {money(item.price * item.qty)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Mini Recently Viewed inside Drawer */}
          {recentItems.length > 0 && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-wider text-white/50">
                <span>Recently Viewed</span>
                <Link href="/store" onClick={closeDrawer} className="hover:text-white">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {recentItems.map((r) => (
                  <Link
                    key={r.handle}
                    href={`/product/${r.handle}`}
                    onClick={closeDrawer}
                    className="group border border-white/10 bg-white/5 p-1 hover:border-white/40 transition-colors block text-center"
                  >
                    <div className="relative aspect-square w-full mb-1">
                      <Image src={r.image} alt={r.title} fill className="object-cover" />
                    </div>
                    <p className="text-[9px] font-mono truncate text-white/70">{r.title}</p>
                    <p className="text-[9px] font-bold text-white">{money(r.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Checkout Action */}
        {!empty && (
          <div className="border-t border-white/10 bg-black/80 p-6 space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-white/60">
                <span>Shipping</span>
                <span>{freeShippingUnlocked ? "FREE (Express)" : "Calculated at checkout"}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-white pt-1">
                <span>Subtotal</span>
                <span className="tabular-nums text-xl">{money(subtotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/bag"
                onClick={closeDrawer}
                className="border border-white/30 py-3 text-center text-xs font-mono uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
              >
                View Full Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="bg-white py-3 text-center text-xs font-mono font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-colors shadow-lg"
              >
                Checkout ↗
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
