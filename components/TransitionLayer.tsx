"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/components/providers/SmoothScroll";
import Mark from "@/components/Mark";

/**
 * Route curtain.
 *
 * Navigation is intercepted so the cover runs BEFORE the route changes. Keying
 * this off usePathname alone cannot work: the pathname only updates once Next
 * has already rendered the destination, so the new page would flash in first
 * and the curtain would then wipe over a page the viewer had already seen.
 *
 * So: click -> cover -> push -> (pathname commits) -> reveal.
 */
export default function TransitionLayer() {
  const layer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  // Set when we drove the navigation ourselves, so a first paint or a back
  // button press doesn't trigger a reveal of a curtain that never covered.
  const covered = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    registerGsap();

    const onClick = (e: MouseEvent) => {
      // Leave modified clicks alone — they open tabs/windows.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return; // external, hash or mailto
      if (anchor.target && anchor.target !== "_self") return;
      if (href === pathname) return;

      e.preventDefault();
      covered.current = true;
      getLenis()?.stop();

      // Navigation must not depend on the animation finishing. GSAP is driven
      // by rAF, which a browser suspends in a background tab — if the push only
      // lived in the timeline callback, a click could animate nothing and go
      // nowhere. Whichever fires first wins; the other is a no-op.
      let navigated = false;
      const go = () => {
        if (navigated) return;
        navigated = true;
        router.push(href);
      };

      gsap
        .timeline()
        .set(layer.current, { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" })
        .to(layer.current, { clipPath: "inset(0% 0% 0% 0%)", ...T.transition.in })
        .call(go);

      window.setTimeout(go, (T.transition.in.duration + 0.25) * 1000);
    };

    // Capture phase, not bubble. Next's <Link> attaches its own handler to the
    // anchor, which in the bubble phase runs BEFORE a document-level listener —
    // so it would navigate before this ever called preventDefault, and the
    // curtain would never play. Link bails when defaultPrevented is set.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  // Reveal once the destination has committed.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!covered.current) return;
    covered.current = false;

    window.scrollTo(0, 0);
    getLenis()?.scrollTo(0, { immediate: true });

    const node = layer.current;
    let cleared = false;
    const clear = () => {
      if (cleared) return;
      cleared = true;
      gsap.set(node, { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" });
      getLenis()?.start();
    };

    const tl = gsap
      .timeline()
      .to(node, { clipPath: "inset(0% 0% 100% 0%)", ...T.transition.out })
      .call(clear);

    // Mirror of the cover safety: a stalled ticker here would leave the curtain
    // over the page permanently, with scroll still locked.
    const timer = window.setTimeout(clear, (T.transition.out.duration + 0.25) * 1000);

    return () => {
      tl.kill();
      window.clearTimeout(timer);
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
