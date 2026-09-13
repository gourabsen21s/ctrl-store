"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import HeroWordmark from "@/components/HeroWordmark";

/**
 * The hero wordmark is laid out cleanly with an animated divider bar,
 * leading directly into the catalog controls without redundant sub-links.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mark = root.current!.querySelector("[data-hero-mark]");
      const rule = root.current!.querySelector("#hero-line");

      if (prefersReducedMotion()) {
        gsap.set([mark, rule], { autoAlpha: 1, clearProps: "transform" });
        gsap.set(rule, { scaleX: 1 });
        return;
      }

      registerGsap();

      gsap
        .timeline({ delay: 0.1 })
        .to(rule, { scaleX: 1, ...T.hero.rule });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="px-4 lg:px-6">
      <div className="mt-24 mb-6 sm:mt-26">
        <div className="relative">
          <div data-hero-mark>
            <HeroWordmark className="w-full text-red dark:text-cream" />
          </div>
        </div>

        <div
          id="hero-line"
          className="mt-6 mb-8 h-[5px] w-full origin-left scale-x-0 bg-current"
        />
      </div>
    </div>
  );
}
