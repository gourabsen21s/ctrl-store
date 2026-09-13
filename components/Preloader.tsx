"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/components/providers/SmoothScroll";
import { HERO_REVEAL_EVENT } from "@/components/HeroWordmark";
import SplitWordmark from "@/components/SplitWordmark";

const LOADER_KEY = "outfit-seen-loader";

/**
 * Decides before first paint whether the intro should run, so the plate is
 * either painted immediately or never painted at all. Anything that defers
 * this to an effect shows the page first and drops the loader over it.
 */
export const loaderScript = `
(function(){
  var d = document.documentElement;
  try {
    if (sessionStorage.getItem(${JSON.stringify(LOADER_KEY)}) === "1") {
      d.dataset.loader = "seen";
      d.classList.add("ready", "loaded");
    } else {
      d.dataset.loader = "pending";
    }
  } catch (e) {
    d.dataset.loader = "pending";
  }
})();
`;

/** Six dedicated loader plates, independent of the catalogue. */
const DECK = [1, 2, 3, 4, 5, 6].map((n) => `/preloader/image-0${n}.jpg`);

/**
 * Two timelines, mirroring the reference build.
 *
 * The intro is authored paused and started by the master timeline, so the
 * counter and the deal share one clock. Nothing here is a shared-element
 * transition: the letters simply exit upward and the black plate clip-wipes
 * off the bottom, revealing the hero that was already laid out underneath.
 */
export default function Preloader({ onDone }: { onDone?: () => void }) {
  const plate = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const glyphs = useRef<SVGTextElement[]>([]);
  const [gone, setGone] = useState(false);
  // The wordmark commits its glyphs a render after this mounts, so the
  // timeline has to wait for them rather than querying an empty DOM.
  const [glyphsReady, setGlyphsReady] = useState(false);

  const onGlyphs = useCallback((els: SVGTextElement[]) => {
    glyphs.current = els;
    setGlyphsReady(els.length > 0);
  }, []);

  useGSAP(
    () => {
      const root = document.documentElement;
      const finish = () => {
        root.classList.add("ready", "loaded");
        root.dataset.loader = "seen";
        try {
          sessionStorage.setItem(LOADER_KEY, "1");
        } catch {
          /* private mode — the intro will simply run again next load */
        }
        setGone(true);
        onDone?.();
      };

      // Already seen this tab, or motion is reduced: the plate is present in
      // the markup but CSS keeps it unpainted, so tear it down without playing.
      if (root.dataset.loader !== "pending" || prefersReducedMotion()) {
        finish();
        return;
      }
      if (!glyphsReady || !deck.current || !plate.current) return;
      registerGsap();

      const lenis = getLenis();
      lenis?.stop();

      const cards = gsap.utils.toArray<HTMLElement>(deck.current.children);
      const letters = glyphs.current;

      gsap.set([cards, letters], { willChange: "transform" });

      // Intro — held paused so the master below owns the timing.
      const intro = gsap
        .timeline({
          paused: true,
          defaults: { duration: 0.6, ease: "power3.out", force3D: true },
        })
        .fromTo(
          cards,
          { scale: 0, rotate: 0 },
          { scale: 1, rotate: () => gsap.utils.random(-20, 20), stagger: { each: 0.2, from: "start" } }
        )
        .fromTo(
          letters,
          { yPercent: 110 },
          { yPercent: 0, stagger: { each: 0.2, from: "random" } },
          "<"
        );

      const count = { v: 0 };

      const master = gsap
        .timeline({
          delay: 0.4,
          defaults: { force3D: true },
          onComplete: () => gsap.set([cards, letters], { willChange: "none" }),
        })
        .call(() => intro.play())
        .to(count, {
          v: 100,
          duration: 3,
          ease: "circ.inOut",
          onUpdate: () => {
            if (counter.current) {
              counter.current.textContent = String(Math.round(count.v)).padStart(3, "0");
            }
          },
        })
        .to(counter.current, { yPercent: -100, autoAlpha: 0, duration: 1, ease: "circ.inOut" }, "<90%")
        .to(
          letters,
          { yPercent: -120, duration: 1.2, ease: "expo.inOut", stagger: { each: 0.08, from: "random" } },
          "<"
        )
        .to(
          cards,
          {
            scale: 0,
            rotate: () => gsap.utils.random(-20, 20),
            duration: 0.6,
            ease: "expo.inOut",
            stagger: { each: 0.1, from: "end" },
          },
          "<"
        )
        .to(
          plate.current,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 1.4,
            ease: "power2.inOut",
            // The hero's glyphs ride the tail of this wipe rather than waiting
            // for it, which is what makes the two read as one movement.
            onStart: () => window.dispatchEvent(new Event(HERO_REVEAL_EVENT)),
          },
          "<30%"
        )
        .call(
          () => {
            finish();
            // The page is revealed before the plate finishes clearing, so scroll
            // is handed back slightly after rather than on completion.
            gsap.delayedCall(0.8, () => getLenis()?.start());
          },
          undefined,
          "<50%"
        );

      return () => {
        master.kill();
        intro.kill();
        getLenis()?.start();
      };
    },
    { scope: plate, dependencies: [glyphsReady] }
  );

  if (gone) return null;

  return (
    <div
      ref={plate}
      data-preloader
      className="fixed inset-0 z-[80] flex items-center justify-center gap-8 bg-black text-cream dark:bg-cream dark:text-black"
      style={{ clipPath: "inset(0% 0% 0% 0%)", contain: "layout paint style" }}
    >
      <div ref={deck} className="fixed inset-0 z-0 flex items-center justify-center">
        {DECK.map((src) => (
          <Image
            key={src}
            src={src}
            alt=""
            aria-hidden
            width={900}
            height={1200}
            priority
            className="aspect-large absolute w-[30vw] object-cover md:w-[12vw]"
          />
        ))}
      </div>

      {/* difference blend is what makes the mark read dark over the light
          plates and cream over the black ground, exactly as the reference
          does — it is not z-order. */}
      <div className="relative z-10 mix-blend-difference">
        <SplitWordmark className="w-[72vw] text-cream md:w-[33.6vw]" onGlyphs={onGlyphs} />
        <div className="absolute top-[200%] left-[80%] overflow-hidden text-2xl md:top-[-40%] md:left-[105%]">
          <span ref={counter} className="block text-right tabular-nums text-cream">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
