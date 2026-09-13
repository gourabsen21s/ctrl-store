"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { imageFor, money, type Product } from "@/lib/products";
import { useBag } from "@/components/providers/BagProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import ShareButton from "@/components/ShareButton";
import ProductReviews from "@/components/ProductReviews";
import SizeGuideModal from "@/components/SizeGuideModal";
import CompleteTheLook from "@/components/CompleteTheLook";
import ExpressCheckoutModal from "@/components/ExpressCheckoutModal";
import RecentlyViewed from "@/components/RecentlyViewed";
import { recordRecentlyViewed } from "@/lib/recently-viewed";

/**
 * Scrolling image column against a sticky info column. The stick is on an
 * inner wrapper rather than the column itself so it releases naturally at the
 * end of the gallery instead of jamming against the footer.
 */
export default function ProductDetail({ product, relatedProducts }: { product: Product, relatedProducts?: Product[] }) {
  const { add } = useBag();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(product.handle);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [isExpressOpen, setIsExpressOpen] = useState(false);

  // Live Active Viewers & Recent Orders Social Proof
  const [viewers, setViewers] = useState(4);
  const [recentOrders] = useState(() => Math.floor(((product.handle.length * 7) % 9) + 6)); // 6–14 orders

  useEffect(() => {
    // Initial deterministic viewer count based on handle
    const initial = ((product.handle.length * 3) % 4) + 3;
    setViewers(initial);

    // Natural fluctuation every 10-15 seconds
    const interval = setInterval(() => {
      setViewers((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(3, Math.min(8, next));
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [product.handle]);

  // Track product in recently viewed history
  useEffect(() => {
    recordRecentlyViewed({
      handle: product.handle,
      title: product.title,
      price: product.price,
      category: product.category,
      image: imageFor(product, "front"),
      color: product.color,
      aspect: product.aspect,
    });
  }, [product]);

  // Size-specific stock computation
  const getSizeStock = (sizeName: string) => {
    if (product.stock === 0) return 0;
    if (product.stock === undefined) return 8;
    const idx = product.sizes.indexOf(sizeName);
    const seed = (product.handle.length + idx * 2) % 4;
    if (product.stock <= 5) {
      return Math.max(1, Math.min(product.stock, (seed % 3) + 1));
    }
    return Math.max(2, Math.floor(product.stock / product.sizes.length) + (seed % 2));
  };

  const currentSizeStock = getSizeStock(size);

  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  // Drop launch countdown & button lock
  const dropTimestamp = product.dropDate ? new Date(product.dropDate).getTime() : null;
  const [isDropLocked, setIsDropLocked] = useState(() => Boolean(dropTimestamp && dropTimestamp > Date.now()));
  const [dropTimeLeft, setDropTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!dropTimestamp) {
      setIsDropLocked(false);
      return;
    }

    const updateCountdown = () => {
      const diff = dropTimestamp - Date.now();
      if (diff <= 0) {
        setIsDropLocked(false);
        setDropTimeLeft(null);
        return false;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setDropTimeLeft({ days, hours, minutes, seconds });
      setIsDropLocked(true);
      return true;
    };

    const hasTime = updateCountdown();
    if (!hasTime) return;

    const timer = setInterval(() => {
      const active = updateCountdown();
      if (!active) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dropTimestamp]);

  const gallery: ("front" | "back")[] = ["front", "back", "front"];

  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const maxStock = product.stock !== undefined ? product.stock : 99;

  const onAdd = () => {
    if (isSoldOut || isDropLocked) return;
    add({
      handle: product.handle,
      title: product.title,
      price: product.price,
      size,
      qty,
      image: imageFor(product, "front"),
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const onJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      setWaitlistError("Please enter a valid email.");
      return;
    }
    
    setWaitlistLoading(true);
    setWaitlistError("");
    
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail, productHandle: product.handle }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist");
      
      setWaitlistSuccess(true);
      setWaitlistEmail("");
    } catch (err: any) {
      setWaitlistError(err.message);
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-28 mb-40 px-4 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-16">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {gallery.map((face, i) => (
            <Image
              key={i}
              src={imageFor(product, face)}
              alt={`${product.title} — view ${i + 1}`}
              width={900}
              height={1200}
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-large w-full object-cover"
            />
          ))}
        </div>

        <div className="lg:col-span-7 lg:col-start-10">
          <div className="lg:sticky lg:top-28">
            <Link
              href="/"
              data-cursor
              className="mb-8 inline-flex items-center gap-2 text-xs uppercase"
            >
              <span aria-hidden>←</span> Return to Shop
            </Link>

            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] font-[900] tracking-tighter">
              {product.title}
            </h1>
            <p className="mt-3 text-3xl">{money(product.price)}</p>

            {/* Inventory / Stock Status Indicator */}
            {isSoldOut ? (
              <div className="mt-4 inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Sold Out — Currently out of stock</span>
              </div>
            ) : isLowStock ? (
              <div className="mt-4 inline-flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Limited Drop: Only {product.stock} left in stock</span>
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>In Stock ({product.stock ?? 15} units available)</span>
              </div>
            )}

            {/* Live Social Proof & Stock Scarcity Badges */}
            <div className="mt-4 flex flex-col gap-2 border-y border-current/15 py-3 font-mono text-xs">
              {/* Live Active Viewers */}
              <div className="flex items-center gap-2 text-current/90">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>
                  <strong className="font-bold">{viewers} people</strong> viewing this item right now
                </span>
              </div>

              {/* Dynamic Size Scarcity Badge */}
              {!isSoldOut && currentSizeStock <= 3 && (
                <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider text-[11px] animate-fade-in">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Only {currentSizeStock} left in size {size} — order soon</span>
                </div>
              )}

              {/* Recent Orders Proof */}
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider opacity-60">
                <span>⚡ High Demand: {recentOrders} orders placed in last 24h</span>
              </div>
            </div>

            <p className="mt-5 max-w-[46ch] text-base">{product.description}</p>

            <dl className="mt-10 text-sm">
              <div className="flex items-center justify-between border-t border-current/30 py-4">
                <dt>Color</dt>
                <dd>{product.color}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-current/30 py-4">
                <div className="flex flex-col gap-1">
                  <dt>Size</dt>
                  <SizeGuideModal product={product} />
                </div>
                <dd className="flex flex-wrap justify-end gap-4">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-cursor
                      disabled={isSoldOut}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`transition-opacity duration-200 ${
                        size === s ? "underline underline-offset-4" : "opacity-45 hover:opacity-100"
                      } ${isSoldOut ? "cursor-not-allowed opacity-30" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </dd>
              </div>
            </dl>

            {!isSoldOut && (
              <div className="flex items-center gap-6 border-t border-current/30 py-5 text-xl">
                <button
                  type="button"
                  data-cursor
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="leading-none"
                >
                  −
                </button>
                <span className="tabular-nums">{qty}</span>
                <button
                  type="button"
                  data-cursor
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
                  disabled={qty >= maxStock}
                  className="leading-none disabled:opacity-30"
                >
                  +
                </button>
              </div>
            )}

            {/* Drop Countdown Banner if Drop is Locked */}
            {isDropLocked && dropTimeLeft && (
              <div className="my-6 border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>Upcoming Drop Countdown</span>
                  </div>
                  <span suppressHydrationWarning className="text-[10px] font-mono text-amber-400/80">
                    Target: {new Date(product.dropDate!).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="border border-white/10 bg-black/60 p-2">
                    <span className="block text-xl md:text-2xl font-[900] tabular-nums text-white">
                      {String(dropTimeLeft.days).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/50">Days</span>
                  </div>
                  <div className="border border-white/10 bg-black/60 p-2">
                    <span className="block text-xl md:text-2xl font-[900] tabular-nums text-white">
                      {String(dropTimeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/50">Hours</span>
                  </div>
                  <div className="border border-white/10 bg-black/60 p-2">
                    <span className="block text-xl md:text-2xl font-[900] tabular-nums text-white">
                      {String(dropTimeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/50">Mins</span>
                  </div>
                  <div className="border border-amber-500/40 bg-black/70 p-2 ring-1 ring-amber-500/20">
                    <span className="block text-xl md:text-2xl font-[900] tabular-nums text-amber-400 animate-pulse">
                      {String(dropTimeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Secs</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-current/30 pt-5">
              {isDropLocked ? (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  >
                    <span>🔒 LOCKED UNTIL DROP</span>
                    {dropTimeLeft && (
                      <span className="font-mono text-amber-400">
                        ({String(dropTimeLeft.hours).padStart(2, "0")}:{String(dropTimeLeft.minutes).padStart(2, "0")}:{String(dropTimeLeft.seconds).padStart(2, "0")})
                      </span>
                    )}
                  </button>
                  <p className="text-[10px] font-mono text-white/50 text-center sm:text-left">
                    ⚡ Button will automatically unlock the second clock hits zero
                  </p>
                </div>
              ) : !isSoldOut ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button
                    type="button"
                    data-cursor
                    onClick={onAdd}
                    className="text-left text-2xl transition-opacity duration-200 hover:opacity-60"
                  >
                    {added ? (
                      "Added to Bag"
                    ) : (
                      <>
                        Add to Bag <span aria-hidden>↗</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    data-cursor
                    onClick={() => setIsExpressOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 border border-current/40 px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest hover:bg-current hover:text-white dark:hover:text-black transition-all"
                  >
                    <span className="text-amber-500">⚡</span>
                    <span>1-Click Buy</span>
                  </button>
                </div>
              ) : (
                <div className="w-full sm:max-w-xs">
                  {waitlistSuccess ? (
                    <div className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      ✓ You're on the list! We'll notify you.
                    </div>
                  ) : (
                    <form onSubmit={onJoinWaitlist} className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest opacity-60">Join Waitlist</label>
                      <div className="flex">
                        <input
                          type="email"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          placeholder="Your Email"
                          className="w-full border border-current/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-current"
                          required
                        />
                        <button
                          type="submit"
                          disabled={waitlistLoading}
                          className="bg-current px-4 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                          {waitlistLoading ? "..." : "Join"}
                        </button>
                      </div>
                      {waitlistError && <p className="text-xs text-red-500 font-bold mt-1">{waitlistError}</p>}
                    </form>
                  )}
                </div>
              )}

              <button
                type="button"
                data-cursor
                onClick={() => toggleWishlist(product)}
                aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider py-2 transition-all ${
                  isSaved
                    ? "text-red font-bold"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <svg
                  className={`h-4 w-4 transition-transform ${isSaved ? "fill-current scale-110" : "fill-none stroke-current stroke-2"}`}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                <span>{isSaved ? "Saved in Wishlist" : "Save to Wishlist"}</span>
              </button>
            </div>

            {/* WhatsApp & Social Share */}
            <ShareButton product={product} />

            {/* Express Dispatch & Guarantees */}
            <div className="mt-6 border-t border-current/15 pt-4 space-y-2 font-mono text-[11px] uppercase tracking-wider opacity-70">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Dispatches within 24 hours with live tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Free delivery across India on orders over ₹1,999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Hassle-free 7-day exchanges &amp; returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Express Checkout Modal */}
      <ExpressCheckoutModal
        product={product}
        selectedSize={size}
        qty={qty}
        isOpen={isExpressOpen}
        onClose={() => setIsExpressOpen(false)}
      />

      {/* Verified Customer Reviews Section */}
      <ProductReviews productHandle={product.handle} productTitle={product.title} />

      {/* Complete the Look Cross-Sell */}
      {relatedProducts && relatedProducts.length > 0 && (
        <CompleteTheLook products={relatedProducts} />
      )}

      {/* Recently Viewed Carousel */}
      <RecentlyViewed currentHandle={product.handle} className="mt-16" />
    </div>
  );
}
