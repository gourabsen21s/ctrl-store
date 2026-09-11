"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import SplitWordmark, { WORDMARK_H } from "@/components/SplitWordmark";

/** Fired by the preloader as its plate starts to clear. */
export const HERO_REVEAL_EVENT = "wordmark:reveal";

/** Safety net: never leave the mark parked below the clip if a cue is lost. */
const CUE_TIMEOUT_MS = 4000;

/**
 * The hero mark rises glyph by glyph in a random order, cued off the loader
 * plate clearing so the two read as one movement.
 */
export default function HeroWordmark({ className = "" }: { className?: string }) {
  const cleanup = useRef<(() => void) | null>(null);

  // Driven by a callback rather than an effect that queries for the glyphs:
  // the child commits them one render later, so an effect here would run too
  // early, find nothing, and silently never attach the reveal.
  const onGlyphs = useCallback((letters: SVGTextElement[]) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!letters.length) return;

    if (prefersReducedMotion()) {
      gsap.set(letters, { y: 0 });
      return;
    }
    registerGsap();
    gsap.set(letters, { y: WORDMARK_H });

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(letters, {
        y: 0,
        duration: T.heroMark.duration,
        ease: T.heroMark.ease,
        stagger: { each: T.heroMark.each, from: "random" },
        overwrite: "auto",
      });
    };

    // No preloader mounted (a repeat visit in the same tab) means no cue is
    // coming, so play straight away.
    if (!document.querySelector("[data-preloader]")) {
      play();
      return;
    }

    window.addEventListener(HERO_REVEAL_EVENT, play, { once: true });
    // If the loader errors or is torn down mid-flight the cue never fires, and
    // the mark would sit invisible under the clip forever. Always reveal.
    const timer = window.setTimeout(play, CUE_TIMEOUT_MS);

    cleanup.current = () => {
      window.removeEventListener(HERO_REVEAL_EVENT, play);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => () => cleanup.current?.(), []);

  return (
    <div className={className}>
      <SplitWordmark onGlyphs={onGlyphs} />
    </div>
  );
}
