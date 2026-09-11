"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";

let instance: Lenis | null = null;

/** Imperative access for anything that needs to stop/start or jump the page. */
export const getLenis = () => instance;

/**
 * Lenis drives scroll; GSAP's ticker drives Lenis. Sharing one rAF loop keeps
 * ScrollTrigger's reads in the same frame as the scroll write, which is what
 * stops triggered elements from lagging a frame behind the content.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    registerGsap();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
