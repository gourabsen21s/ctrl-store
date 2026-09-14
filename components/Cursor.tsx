"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";

/**
 * Trailing custom cursor matching the reference site:
 *  - Default: An 8px dot that smoothly trails pointer coordinates
 *  - On [data-cursor="view"] (Product Cards): Expands into an iconic red circular
 *    magnetic badge with "VIEW MORE" centered in bold monospaced typography.
 *  - On general [data-cursor] (Links, buttons): Scales up smoothly to 4x.
 */
export default function Cursor() {
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const [cursorMode, setCursorMode] = useState<"dot" | "hover" | "view">("dot");

  useEffect(() => {
    if (prefersReducedMotion()) return;
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

    const onOver = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.("[data-cursor]");
      const mode = hit?.getAttribute("data-cursor");

      if (mode === "view") {
        setCursorMode("view");
        gsap.to(dot.current, {
          scale: 0,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(badge.current, {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: "back.out(1.5)",
          overwrite: "auto",
        });
      } else if (hit) {
        setCursorMode("hover");
        gsap.to(badge.current, {
          scale: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(dot.current, {
          scale: 4,
          duration: 0.3,
          ease: "expo.out",
          overwrite: "auto",
        });
      } else {
        setCursorMode("dot");
        gsap.to(badge.current, {
          scale: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(dot.current, {
          scale: 1,
          duration: 0.3,
          ease: "expo.out",
          overwrite: "auto",
        });
      }
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
      {/* Standard trailing dot */}
      <div
        ref={dot}
        className="-mt-1 -ml-1 h-2 w-2 rounded-full bg-[var(--cursor-color)]"
      />

      {/* Signature Red 'VIEW MORE' Circle Badge */}
      <div
        ref={badge}
        className="-mt-11 -ml-11 flex h-22 w-22 scale-0 opacity-0 items-center justify-center rounded-full bg-red text-center font-mono text-[10px] font-bold tracking-widest text-[#ede4dd] shadow-xl select-none"
      >
        <span>VIEW MORE</span>
      </div>
    </div>
  );
}
