"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import Mark from "@/components/Mark";

/**
 * Route curtain. Wipes up from the bottom edge to cover, then clears upward
 * once the new route has painted — a clip-path inset rather than a transform
 * so the mark stays put while the plate grows around it.
 */
export default function TransitionLayer() {
  const layer = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    registerGsap();

    // The preloader already covers the first paint.
    if (first.current) {
      first.current = false;
      gsap.set(layer.current, { clipPath: "inset(0% 0% 100% 0%)", autoAlpha: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.set(layer.current, { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" })
      .to(layer.current, { clipPath: "inset(0% 0% 0% 0%)", ...T.transition.in })
      .to(layer.current, { clipPath: "inset(0% 0% 100% 0%)", ...T.transition.out }, ">0.1")
      .set(layer.current, { autoAlpha: 0 });

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={layer}
      aria-hidden
      className="pointer-events-none invisible fixed inset-0 z-[60] flex items-center justify-center bg-black text-cream dark:bg-cream dark:text-black red:bg-red red:text-cream"
      style={{ clipPath: "inset(0% 0% 100% 0%)" }}
    >
      <Mark className="w-40" />
    </div>
  );
}
