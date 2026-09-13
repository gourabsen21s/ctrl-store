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

    // Immediately compute initial state
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

  // If not mounted yet (SSR), render placeholder or initial time to avoid hydration mismatch
  const isLive = timeLeft ? timeLeft.total <= 0 : false;

  return (
    <section className="relative overflow-hidden border-y border-amber-500/30 bg-gradient-to-b from-[#110e08] via-[#0a0805] to-[#050505] text-white my-8">
      {/* Subtle background glow effect */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-3/4 max-w-4xl bg-amber-500/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column: Drop Badges & Product Teaser */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left w-full lg:w-auto">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-amber-500/40 bg-black/60 shadow-xl group">
              <Image
                src={imageFor(product, "front")}
                alt={product.title}
                fill
                sizes="100px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-amber-300">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full ${
                      isLive ? "bg-emerald-400 animate-ping" : "bg-amber-400 animate-ping"
                    } opacity-75`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      isLive ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </span>
                <span>{isLive ? "DROP IS LIVE NOW" : "LIMITED EDITION DROP"}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-[900] tracking-tight uppercase">
                {product.title}
              </h3>

              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs font-mono text-white/70">
                <span>{product.category}</span>
                <span>•</span>
                <span className="font-bold text-white">{money(product.price)}</span>
                <span>•</span>
                <span className="text-amber-400/90">
                  {isLive ? "Unlocked" : `Launch: ${new Date(product.dropDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Countdown Display or Live CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center lg:justify-end">
            {!isLive ? (
              <div className="flex items-center gap-2 sm:gap-3 text-center font-mono">
                {/* DAYS */}
                <div className="flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] rounded border border-amber-500/30 bg-black/60 px-2.5 py-2 backdrop-blur-sm shadow-inner">
                  <span className="text-2xl sm:text-3xl font-[900] tabular-nums tracking-tight text-white">
                    {mounted && timeLeft ? String(timeLeft.days).padStart(2, "0") : "00"}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-400/70 font-semibold">
                    Days
                  </span>
                </div>

                <span className="text-xl font-bold text-amber-500/60 pb-3 select-none">:</span>

                {/* HOURS */}
                <div className="flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] rounded border border-amber-500/30 bg-black/60 px-2.5 py-2 backdrop-blur-sm shadow-inner">
                  <span className="text-2xl sm:text-3xl font-[900] tabular-nums tracking-tight text-white">
                    {mounted && timeLeft ? String(timeLeft.hours).padStart(2, "0") : "00"}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-400/70 font-semibold">
                    Hours
                  </span>
                </div>

                <span className="text-xl font-bold text-amber-500/60 pb-3 select-none">:</span>

                {/* MINUTES */}
                <div className="flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] rounded border border-amber-500/30 bg-black/60 px-2.5 py-2 backdrop-blur-sm shadow-inner">
                  <span className="text-2xl sm:text-3xl font-[900] tabular-nums tracking-tight text-white">
                    {mounted && timeLeft ? String(timeLeft.minutes).padStart(2, "0") : "00"}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-400/70 font-semibold">
                    Mins
                  </span>
                </div>

                <span className="text-xl font-bold text-amber-500/60 pb-3 select-none">:</span>

                {/* SECONDS */}
                <div className="flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] rounded border border-amber-500/50 bg-black/70 px-2.5 py-2 backdrop-blur-sm shadow-inner ring-1 ring-amber-500/20">
                  <span className="text-2xl sm:text-3xl font-[900] tabular-nums tracking-tight text-amber-400 animate-pulse">
                    {mounted && timeLeft ? String(timeLeft.seconds).padStart(2, "0") : "00"}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                    Secs
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono text-xs uppercase font-bold tracking-widest animate-bounce">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                BAG UNLOCKED • READY TO ORDER
              </div>
            )}

            {/* Direct CTA Button */}
            <Link
              href={`/product/${product.handle}`}
              data-cursor
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 ${
                isLive
                  ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                  : "border border-amber-400 bg-amber-500/10 text-amber-300 hover:bg-amber-400 hover:text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              }`}
            >
              <span>{isLive ? "SHOP THE DROP NOW" : "PREVIEW DROP"}</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
