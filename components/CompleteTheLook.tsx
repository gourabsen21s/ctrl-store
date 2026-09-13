"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, imageFor, money } from "@/lib/products";
import { useBag } from "@/components/providers/BagProvider";

export default function CompleteTheLook({ products }: { products: Product[] }) {
  const { add } = useBag();

  if (!products || products.length === 0) return null;

  const handleAddBundle = () => {
    products.forEach((p) => {
      add({
        handle: p.handle,
        title: p.title,
        price: p.price,
        size: p.sizes[0], // Add default size
        qty: 1,
        image: imageFor(p, "front"),
      });
    });
  };

  const bundleTotal = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="mt-32 border-t border-current/20 pt-16">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-[900] uppercase tracking-tighter mb-4">Complete The Look</h2>
        <p className="font-mono text-sm opacity-60">Curated pieces to finish the silhouette.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
        {products.map((p) => (
          <Link key={p.handle} href={`/product/${p.handle}`} className="group block col-span-1 md:col-span-2">
            <div className="relative aspect-large overflow-hidden mb-4 bg-current/5">
              <Image
                src={imageFor(p, "front")}
                alt={p.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex justify-between font-mono text-sm uppercase tracking-widest font-bold">
              <span>{p.title}</span>
              <span>{money(p.price)}</span>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-60 mt-1">
              {p.color}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center">
        <button
          onClick={handleAddBundle}
          className="bg-current text-white dark:text-black px-12 py-5 font-bold uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95"
        >
          Add Bundle to Bag — {money(bundleTotal)}
        </button>
      </div>
    </div>
  );
}
