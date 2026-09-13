"use client";

import Image from "next/image";
import Link from "next/link";
import { useBag } from "@/components/providers/BagProvider";
import CartGamificationBar from "@/components/CartGamificationBar";
import RecentlyViewed from "@/components/RecentlyViewed";
import { money } from "@/lib/products";

export default function BagView() {
  const { lines, subtotal, remove } = useBag();
  const empty = lines.length === 0;

  return (
    <div className="mt-28 px-4 lg:px-6">
      <h1 className="text-[19vw] leading-[0.78] font-[900] tracking-tighter">Your Bag</h1>
      <div className="mt-4 mb-8 h-[5px] w-full bg-current" />

      {/* Cart Gamification Progress Bar */}
      <div className="mb-8 max-w-xl">
        <CartGamificationBar />
      </div>

      {empty ? (
        <p className="text-[8vw] leading-[0.95] font-[900] tracking-tighter">
          Not even one thing?
          <br />
          <span className="opacity-40">That&apos;s sad.</span>
        </p>
      ) : (
        <>
          <ul className="mb-10">
            {lines.map((l) => (
              <li
                key={`${l.handle}-${l.size}`}
                className="flex items-center gap-6 border-b border-current/25 py-5"
              >
                <Image
                  src={l.image}
                  alt=""
                  aria-hidden
                  width={900}
                  height={1200}
                  className="aspect-large w-20 object-cover"
                />
                <div className="flex-1">
                  <p className="text-xl">{l.title}</p>
                  <p className="text-xs uppercase opacity-60">
                    {l.size} · Qty {l.qty}
                  </p>
                </div>
                <p className="text-xl tabular-nums">{money(l.price * l.qty)}</p>
                <button
                  type="button"
                  data-cursor
                  onClick={() => remove(l.handle, l.size)}
                  aria-label={`Remove ${l.title}`}
                  className="text-xs uppercase opacity-60 transition-opacity hover:opacity-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-8 flex items-center justify-between text-3xl">
            <span>Subtotal</span>
            <span className="tabular-nums">{money(subtotal)}</span>
          </div>

          <div className="mb-16">
            <Link
              href="/checkout"
              data-cursor
              className="block w-full bg-black py-6 text-center text-3xl font-[900] tracking-tighter text-white uppercase transition-transform hover:scale-[1.02] dark:bg-white dark:text-black"
            >
              Proceed to Checkout →
            </Link>
            <p className="mt-4 text-center text-sm font-bold uppercase tracking-widest opacity-60">
              Free standard express shipping on orders above ₹1,999
            </p>
          </div>
        </>
      )}

      {/* Recently Viewed Carousel */}
      <RecentlyViewed className="mt-8 mb-16" />

      <Link
        href="/"
        data-cursor
        className="mt-8 mb-40 inline-block text-2xl underline underline-offset-8"
      >
        Continue shopping <span aria-hidden>↗</span>
      </Link>
    </div>
  );
}
