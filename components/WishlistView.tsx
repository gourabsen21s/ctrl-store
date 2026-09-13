"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useBag } from "@/components/providers/BagProvider";
import { money } from "@/lib/products";

export default function WishlistView() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { add } = useBag();
  const empty = items.length === 0;

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
    <div className="mt-28 px-4 lg:px-6 mb-40">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-[clamp(3.5rem,14vw,12rem)] leading-[0.8] font-[900] tracking-tighter">
          Wishlist
        </h1>
        <p className="mt-4 sm:mt-0 text-xl font-mono opacity-60">
          [{items.length} {items.length === 1 ? "Item" : "Items"} Saved]
        </p>
      </div>
      <div className="mt-4 mb-8 h-[5px] w-full bg-current" />

      {empty ? (
        <div className="py-12">
          <p className="text-[clamp(2rem,6vw,5rem)] leading-[0.95] font-[900] tracking-tighter">
            Nothing saved yet.
            <br />
            <span className="opacity-40">Heart the items you love to build your drop list.</span>
          </p>
          <div className="mt-8">
            <Link
              href="/"
              data-cursor
              className="inline-block border border-current px-8 py-3 text-sm font-mono uppercase tracking-wider transition-colors hover:bg-current hover:text-[var(--color-bg)]"
            >
              Explore Collection ↗
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              data-cursor
              onClick={handleMoveAllToBag}
              className="border border-current px-5 py-2 text-xs font-mono uppercase tracking-wider transition-colors hover:bg-current hover:text-[var(--color-bg)]"
            >
              Move All Available to Bag ↗
            </button>
            <button
              type="button"
              data-cursor
              onClick={clearWishlist}
              className="text-xs font-mono uppercase opacity-50 transition-opacity hover:opacity-100 hover:text-red"
            >
              Clear All
            </button>
          </div>

          <ul className="mb-10 divide-y divide-current/25">
            {items.map((item) => {
              const isSoldOut = item.stock === 0;
              const isLowStock = item.stock !== undefined && item.stock > 0 && item.stock <= 5;

              return (
                <li
                  key={item.handle}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6"
                >
                  <div className="flex items-center gap-6">
                    <Link
                      href={`/product/${item.handle}`}
                      className="relative shrink-0 overflow-hidden bg-white/5 border border-current/20"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={900}
                        height={1200}
                        className="aspect-large w-24 object-cover"
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-red font-bold">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </Link>

                    <div>
                      <Link
                        href={`/product/${item.handle}`}
                        className="text-2xl font-bold tracking-tight hover:underline underline-offset-4"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs font-mono uppercase opacity-60 mt-1">
                        {item.category} · {item.color}
                      </p>
                      <div className="mt-2">
                        {isSoldOut ? (
                          <span className="text-xs font-mono text-red font-bold uppercase">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="text-xs font-mono text-amber-500 font-bold uppercase">
                            ⚡ Only {item.stock} left
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase">
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-8">
                    <p className="text-2xl tabular-nums font-bold">{money(item.price)}</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        data-cursor
                        disabled={isSoldOut}
                        onClick={() => handleMoveToBag(item)}
                        className={`border border-current px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                          isSoldOut
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-current hover:text-[var(--color-bg)]"
                        }`}
                      >
                        {isSoldOut ? "Out of Stock" : "Move to Bag ↗"}
                      </button>
                      <button
                        type="button"
                        data-cursor
                        onClick={() => removeItem(item.handle)}
                        aria-label={`Remove ${item.title}`}
                        className="text-xs uppercase opacity-50 transition-opacity hover:opacity-100 hover:text-red p-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
