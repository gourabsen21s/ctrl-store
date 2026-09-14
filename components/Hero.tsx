"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import SplitFlapText from "@/components/SplitFlapText";
import { BLURB } from "@/lib/site";

/**
 * The hero wordmark with animated divider rule and 3-column Swiss editorial sub-bar,
 * featuring mechanical Split-Flap board animation cycling through CTRL -> + -> STYLE.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mark = root.current!.querySelector("[data-hero-mark]");
      const rule = root.current!.querySelector("#hero-line");
      const sub = root.current!.querySelector("#hero-content");

      if (prefersReducedMotion()) {
        gsap.set([mark, rule, sub], { autoAlpha: 1, clearProps: "transform" });
        gsap.set(rule, { scaleX: 1 });
        return;
      }

      registerGsap();

      gsap
        .timeline({ delay: 0.1 })
        .to(rule, { scaleX: 1, ...T.hero.rule })
        .fromTo(
          sub,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );
    },
    { scope: root }
  );

  return (
    <div ref={root} className="px-4 lg:px-6">
      <div className="mt-26 mb-6">
        <div className="relative">
          <div data-hero-mark className="w-full flex items-center justify-start overflow-hidden py-2 md:py-3">
            <SplitFlapText
              words={["CTRL", "+", "STYLE"]}
              flipsPerChar={5}
              flipDuration={0.08}
              stagger={0.03}
              cycleDelay={2400}
              fontSize="clamp(4.25rem, 18vw, 17rem)"
              charset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+ "
              className="text-red dark:text-cream red:text-red"
            />
          </div>
        </div>

        <div
          id="hero-line"
          className="mb-6 h-[5px] w-full origin-left scale-x-0 bg-current"
        />

        <div
          id="hero-content"
          className="mb-10 grid grid-cols-8 gap-x-6 gap-y-10 text-xs font-bold md:grid-cols-16 md:gap-6 opacity-0"
        >
          <div className="col-span-3 md:col-span-4">
            <h1 className="uppercase" id="hero-title">
              CTRL
            </h1>
          </div>

          <div className="col-span-5 md:col-span-8">
            <h2 className="mb-4 uppercase" id="hero-subtitle">
              Why
            </h2>
            <p id="hero-paragraph" className="text-sm leading-4 tracking-tight md:max-w-[60%]">
              {BLURB}
            </p>
          </div>

          <div className="col-span-3 flex h-full flex-col justify-between md:col-span-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="link-hover max-w-fit uppercase"
              id="hero-link"
              href="https://github.com/gourabsen21s/ctrl-store"
            >
              Visit ++ website
            </a>
            <Link
              className="link-hover max-w-fit uppercase hidden md:inline-block"
              id="hero-shipping-returns-link"
              href="/refunds"
            >
              Shipping &amp; Returns
            </Link>
          </div>

          <div className="col-span-5 flex justify-end md:col-span-1" id="hero-copyright">
            ©&nbsp;2026
          </div>

          <div className="col-span-8 inline-block md:hidden" id="hero-shipping-returns-link-mobile">
            <Link className="link-hover max-w-fit uppercase" href="/refunds">
              Shipping &amp; Returns
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
