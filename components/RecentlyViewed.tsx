"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";
import { money } from "@/lib/products";

interface RecentlyViewedProps {
  currentHandle?: string;
  title?: string;
  className?: string;
}

export default function RecentlyViewed({
  currentHandle,
  title = "Recently Viewed",
  className = "",
}: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getRecentlyViewed();
      const filtered = currentHandle ? all.filter((i) => i.handle !== currentHandle) : all;
      setItems(filtered);
    };

    load();

    window.addEventListener("recently_viewed_updated", load);
    return () => window.removeEventListener("recently_viewed_updated", load);
  }, [currentHandle]);

  if (items.length === 0) return null;

  return (
    <section className={`border-t border-current/20 py-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <h2 className="text-xs font-mono uppercase tracking-widest opacity-80">{title}</h2>
        </div>
        <span className="text-[10px] font-mono opacity-50">{items.length} items</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.handle}
            href={`/product/${item.handle}`}
            data-cursor
            className="group block border border-current/10 bg-current/[0.02] p-3 transition-all hover:border-current/30 hover:bg-current/[0.04]"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-current/5 mb-3">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold truncate group-hover:underline underline-offset-4">
                {item.title}
              </p>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="opacity-60">{item.category}</span>
                <span className="font-bold">{money(item.price)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
