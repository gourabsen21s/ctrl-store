import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase);
  registered = true;

  // Dev only: lets the timeline be driven by hand when the page isn't being
  // painted (a background tab pauses rAF, so tweens simply never tick), which
  // is otherwise impossible to tell apart from an animation that never fired.
  if (process.env.NODE_ENV !== "production") {
    (globalThis as unknown as { gsap?: typeof gsap }).gsap = gsap;
  }

  return gsap;
}

/**
 * Timings lifted from the reference build. Every number here is a measured
 * value rather than a guess, so keep changes deliberate — the feel of the
 * whole site hangs off this table.
 */
export const T = {
  preloader: {
    /** deck dealt in: scale 0 -> 1 with a random tilt */
    cardIn: { duration: 0.6, ease: "power3.out", each: 0.2, from: "start" as const },
    /** wordmark letters rise into place, in random order */
    letterIn: { duration: 0.6, ease: "power3.out", each: 0.2, from: "random" as const },
    /** counter 000 -> 100 */
    count: { duration: 3, ease: "circ.inOut" },
    /** counter exits upward at 90% of the count */
    countOut: { duration: 1, ease: "circ.inOut", at: "<90%" },
    /** letters exit upward */
    letterOut: { duration: 1.2, ease: "expo.inOut", each: 0.08, from: "random" as const },
    /** deck collapses, last card first */
    cardOut: { duration: 0.6, ease: "expo.inOut", each: 0.1, from: "end" as const },
    /** black plate clip-wipes off the bottom */
    plateOut: { duration: 1.4, ease: "power2.inOut", at: "<30%" },
    /** scroll is handed back this long after the reveal fires */
    releaseScroll: 0.8,
  },
  heroMark: {
    /** per-glyph rise, random order, cued off the plate clearing */
    duration: 1.2,
    ease: "expo.out",
    each: 0.08,
    delay: 0.3,
  },
  hero: {
    rule: { duration: 1.4, ease: "expo.out" },
    content: { duration: 1.4, ease: "power4.out", stagger: 0.08 },
  },
  card: {
    reveal: { duration: 1.2, ease: "expo.out", stagger: 0.1 },
    trigger: "top 95%",
  },
  lines: {
    /** masked line reveals — menu items, headings */
    duration: 1,
    ease: "expo.out",
    stagger: 0.1,
    delay: 0.2,
  },
  transition: {
    in: { duration: 0.8, ease: "power3.inOut" },
    out: { duration: 0.6, ease: "power3.inOut" },
  },
  menu: {
    duration: 1,
    ease: "expo.out",
    stagger: 0.08,
  },
  cursor: { duration: 0.8, ease: "expo.out" },
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase };
