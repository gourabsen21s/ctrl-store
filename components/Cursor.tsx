"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";

/**
 * An 8px dot that trails the pointer on an expo.out ease. Elements opt into a
 * larger state with data-cursor; the dot scales up rather than swapping nodes
 * so the position tween is never interrupted.
 */
export default function Cursor() {
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    // Coarse pointers have no cursor to replace.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    registerGsap();
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const moveX = gsap.quickTo(wrap.current, "x", T.cursor);
    const moveY = gsap.quickTo(wrap.current, "y", T.cursor);

    const onMove = (e: PointerEvent) => {
      moveX(e.clientX);
      moveY(e.clientY);
      gsap.to(wrap.current, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
    };
    const onLeave = () => gsap.to(wrap.current, { autoAlpha: 0, duration: 0.2 });

    // Delegated, so cards added by a route change are covered without rebinding.
    const onOver = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.("[data-cursor]");
      gsap.to(dot.current, {
        scale: hit ? 5 : 1,
        duration: 0.4,
        ease: "expo.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] invisible opacity-0 will-change-transform"
    >
      <div
        ref={dot}
        className="-mt-1 -ml-1 h-2 w-2 rounded-full bg-[var(--cursor-color)]"
      />
    </div>
  );
}
