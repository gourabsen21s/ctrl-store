"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/components/providers/SmoothScroll";

const LINKS = [
  { label: "Shop", href: "/" },
  { label: "Bag", href: "/bag" },
];

/**
 * Full-screen overlay with masked line reveals. Each item sits in its own
 * overflow-hidden row so the text can travel a full line height without
 * bleeding into its neighbour.
 */
export function MenuPanel({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Scroll stays locked while the panel is up, or the page drifts behind it.
  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      getLenis()?.start();
    };
  }, [open]);

  useGSAP(
    () => {
      const panel = root.current!;
      const lines = gsap.utils.toArray<HTMLElement>(panel.querySelectorAll("[data-line]"));
      const footer = panel.querySelector(".menu-footer");

      if (prefersReducedMotion()) {
        gsap.set(panel, { autoAlpha: open ? 1 : 0 });
        gsap.set([lines, footer], { yPercent: 0, autoAlpha: 1 });
        return;
      }
      registerGsap();

      // Nothing to play on mount: the panel starts closed and invisible.
      if (first.current) {
        first.current = false;
        if (!open) return;
      }

      if (open) {
        gsap
          .timeline()
          .set(panel, { autoAlpha: 1 })
          .fromTo(
            lines,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: T.menu.duration,
              ease: T.menu.ease,
              stagger: T.menu.stagger,
            }
          )
          .fromTo(footer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, "-=0.5");
      } else {
        gsap
          .timeline()
          .to(lines, {
            yPercent: -110,
            duration: 0.6,
            ease: "expo.inOut",
            stagger: T.menu.stagger,
          })
          .to(footer, { autoAlpha: 0, duration: 0.2 }, "<")
          .set(panel, { autoAlpha: 0 })
          .set(lines, { yPercent: 110 });
      }
    },
    { scope: root, dependencies: [open] }
  );

  return (
    <div
      ref={root}
      aria-hidden={!open}
      className="invisible fixed inset-0 z-[40] flex h-dvh w-full items-center justify-center bg-black text-cream dark:bg-cream dark:text-black red:bg-red red:text-cream"
    >
      <div className="flex h-dvh w-full flex-col justify-between px-4 py-9 lg:px-6">
        <ul className="mt-20 flex w-full flex-col text-6xl tracking-tight">
          {LINKS.map((l) => (
            <li key={l.label} className="overflow-hidden">
              <Link
                href={l.href}
                data-line
                data-cursor
                onClick={onNavigate}
                className="block py-1"
                tabIndex={open ? 0 : -1}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="menu-footer grid grid-cols-8 gap-2 text-sm">
          <a href="mailto:hello@example.com" className="col-span-8" tabIndex={open ? 0 : -1}>
            Let&apos;s talk
          </a>
          <p className="col-span-4">Placeholder Street 1</p>
          <p className="col-span-4 text-right">© 2026</p>
        </div>
      </div>
    </div>
  );
}

/**
 * The reference locks the toggle for 700ms after each press so the open and
 * close timelines can never be interrupted mid-flight.
 */
export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!locked) return;
    const id = window.setTimeout(() => setLocked(false), 700);
    return () => window.clearTimeout(id);
  }, [locked]);

  return (
    <button
      type="button"
      data-cursor
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={() => {
        if (locked) return;
        onToggle();
        setLocked(true);
      }}
      className="min-w-[2.625rem] md:hidden"
    >
      {open ? "Close" : "Menu"}
    </button>
  );
}
