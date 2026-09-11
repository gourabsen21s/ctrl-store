"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import HeroWordmark from "@/components/HeroWordmark";
import { BLURB, BRAND } from "@/lib/site";

/**
 * The hero is laid out underneath the preloader plate and revealed when that
 * plate clip-wipes away — there is no handoff between the two wordmarks, so
 * this one is simply always visible.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mark = root.current!.querySelector("[data-hero-mark]");
      const rule = root.current!.querySelector("#hero-line");
      const meta = gsap.utils.toArray<HTMLElement>("#hero-content > *");

      if (prefersReducedMotion()) {
        gsap.set([mark, rule, ...meta], { autoAlpha: 1, clearProps: "transform" });
        gsap.set(rule, { scaleX: 1 });
        return;
      }

      registerGsap();

      gsap
        .timeline({ delay: 0.1 })
        .to(rule, { scaleX: 1, ...T.hero.rule })
        .from(meta, { yPercent: 110, autoAlpha: 0, ...T.hero.content }, "-=1.0");
    },
    { scope: root }
  );

  return (
    <div ref={root} className="px-4 lg:px-6">
      <div className="mt-26 mb-6">
        <div className="relative">
          <div data-hero-mark>
            <HeroWordmark className="w-full text-red dark:text-cream" />
          </div>
        </div>

        <div
          id="hero-line"
          className="mb-6 h-[5px] w-full origin-left scale-x-0 bg-current"
        />

        <div
          id="hero-content"
          className="mb-10 grid grid-cols-8 gap-x-6 gap-y-10 text-xs font-bold md:grid-cols-16 md:gap-6"
        >
          <div className="col-span-3 md:col-span-4">
            <p className="uppercase">{BRAND}</p>
          </div>
          <div className="col-span-5 md:col-span-8">
            <p className="mb-2 uppercase">Why</p>
            <p className="max-w-[46ch] font-bold">{BLURB}</p>
          </div>
          <div className="col-span-3 flex h-full flex-col justify-between md:col-span-3">
            <p className="uppercase">Visit the studio</p>
            <p className="uppercase">Shipping &amp; Returns</p>
          </div>
          <div className="col-span-5 flex justify-end md:col-span-1">
            <p className="uppercase">© 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
