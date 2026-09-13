"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { imageFor, money, type Product } from "@/lib/products";
import { useBag } from "@/components/providers/BagProvider";
import ShareButton from "@/components/ShareButton";

/**
 * Scrolling image column against a sticky info column. The stick is on an
 * inner wrapper rather than the column itself so it releases naturally at the
 * end of the gallery instead of jamming against the footer.
 */
export default function ProductDetail({ product }: { product: Product }) {
  const { add } = useBag();
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const gallery: ("front" | "back")[] = ["front", "back", "front"];

  const onAdd = () => {
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
            <p className="mt-5 max-w-[46ch] text-base">{product.description}</p>

            <dl className="mt-10 text-sm">
              <div className="flex items-center justify-between border-t border-current/30 py-4">
                <dt>Color</dt>
                <dd>{product.color}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-current/30 py-4">
                <dt>Size</dt>
                <dd className="flex flex-wrap justify-end gap-4">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-cursor
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`transition-opacity duration-200 ${
                        size === s ? "underline underline-offset-4" : "opacity-45 hover:opacity-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </dd>
              </div>
            </dl>

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
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="leading-none"
              >
                +
              </button>
            </div>

            <button
              type="button"
              data-cursor
              onClick={onAdd}
              className="mt-4 w-full border-t border-current/30 pt-5 text-left text-2xl transition-opacity duration-200 hover:opacity-60"
            >
              {added ? "Added to Bag" : "Add to Bag"} <span aria-hidden>↗</span>
            </button>

            {/* WhatsApp & Social Share */}
            <ShareButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
