"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Product, imageFor, money } from "@/lib/products";

interface DropCountdownBannerProps {
  product: Product | null;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function getTimeRemaining(targetIso?: string | Date): TimeRemaining | null {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  if (isNaN(target)) return null;

  const total = target - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

export default function DropCountdownBanner({ product }: DropCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(() =>
    product?.dropDate ? getTimeRemaining(product.dropDate) : null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!product?.dropDate) return;

    setTimeLeft(getTimeRemaining(product.dropDate));

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(product.dropDate);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [product?.dropDate]);

  if (!product || !product.dropDate) {
    return null;
  }

  const isLive = timeLeft ? timeLeft.total <= 0 : false;

  return (
    <section className="border-b border-current/20 pb-8 mb-12 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Minimalist Drop Specs & Garment Plate */}
        <div className="flex items-center gap-5 sm:gap-6">
          <div className="relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden border border-current/20">
            <Image
              src={imageFor(product, "front")}
              alt={product.title}
              fill
              sizes="100px"
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono uppercase tracking-widest text-red">
              <span className="h-2 w-2 rounded-full bg-red animate-pulse" />
              <span>{isLive ? "DROP IS LIVE" : "SCHEDULED RELEASE"}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-[900] tracking-tighter uppercase leading-none">
              {product.title}
            </h3>

            <div className="flex items-center gap-3 text-xs font-mono opacity-60 mt-2">
              <span>{product.category}</span>
              <span>/</span>
              <span className="font-bold text-current">{money(product.price)}</span>
              <span>/</span>
              <span suppressHydrationWarning>
                {isLive
                  ? "AVAILABLE NOW"
                  : `LAUNCH: ${new Date(product.dropDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Pure Typographic Tabular Countdown */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between lg:justify-end">
          {!isLive ? (
            <div className="flex items-center gap-3 sm:gap-4 font-mono">
              {/* DAYS */}
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-[900] tabular-nums tracking-tight block">
                  {mounted && timeLeft ? String(timeLeft.days).padStart(2, "0") : "00"}
                </span>
                <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold block">
                  DAYS
                </span>
              </div>

              <span className="text-2xl font-bold opacity-30 select-none pb-3">:</span>

              {/* HOURS */}
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-[900] tabular-nums tracking-tight block">
                  {mounted && timeLeft ? String(timeLeft.hours).padStart(2, "0") : "00"}
                </span>
                <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold block">
                  HRS
                </span>
              </div>

              <span className="text-2xl font-bold opacity-30 select-none pb-3">:</span>

              {/* MINUTES */}
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-[900] tabular-nums tracking-tight block">
                  {mounted && timeLeft ? String(timeLeft.minutes).padStart(2, "0") : "00"}
                </span>
                <span className="text-[9px] uppercase tracking-widest opacity-50 font-bold block">
                  MIN
                </span>
              </div>

              <span className="text-2xl font-bold opacity-30 select-none pb-3">:</span>

              {/* SECONDS */}
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-[900] tabular-nums tracking-tight text-red block">
                  {mounted && timeLeft ? String(timeLeft.seconds).padStart(2, "0") : "00"}
                </span>
                <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold block text-red">
                  SEC
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 border border-current px-4 py-2 text-red font-mono text-xs uppercase font-bold tracking-widest">
              <span className="h-2 w-2 rounded-full bg-red animate-pulse" />
              <span>DROP LIVE NOW</span>
            </div>
          )}

          {/* Direct CTA Button */}
          <Link
            href={`/product/${product.handle}`}
            data-cursor
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap border border-current px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors hover:bg-current hover:text-cream dark:hover:text-black"
          >
            <span>{isLive ? "SHOP NOW" : "PREVIEW DROP"}</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
