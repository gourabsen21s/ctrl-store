"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap, T, prefersReducedMotion } from "@/lib/motion";
import { ASPECT_CLASS, imageFor, money, type Product } from "@/lib/products";

/**
 * Two motions, deliberately split by cost:
 *
 *  - Reveal (JS): a solid curtain slides off while the image counter-moves
 *    behind it, so the photo appears to be uncovered rather than pushed in.
 *  - Hover (CSS): clip-path wipe + scale settle + exposure correction, all on
 *    one transition. No JS on pointer move, so a grid of these stays cheap.
 */
export default function ProductCard({ product }: { product: Product }) {
  const root = useRef<HTMLAnchorElement>(null);
  const crop = ASPECT_CLASS[product.aspect];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      registerGsap();

      const curtain = root.current!.querySelector("[data-curtain]");
      const front = root.current!.querySelector("[data-image='front']");

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: T.card.trigger, once: true },
        })
        .fromTo(
          curtain,
          { xPercent: 0 },
          { xPercent: 100, duration: T.card.reveal.duration, ease: T.card.reveal.ease }
        )
        .fromTo(
          front,
          { xPercent: -60 },
          { xPercent: 0, duration: T.card.reveal.duration, ease: T.card.reveal.ease },
          "<"
        );
    },
    { scope: root }
  );

  return (
    <Link
      ref={root}
      href={`/product/${product.handle}`}
      data-product
      data-cursor="text"
      className="group block"
    >
      <div className="relative overflow-hidden">
        <Image
          data-image="front"
          src={imageFor(product, "front")}
          alt={product.title}
          width={900}
          height={1200}
          draggable={false}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className={`${crop} h-full w-full object-cover will-change-transform`}
        />

        {/* Hover face. Wipes in left-to-right while settling out of an
            over-exposed 1.2x state — the exposure move is what sells it. */}
        <Image
          data-image="back"
          src={imageFor(product, "back")}
          alt=""
          width={900}
          height={1200}
          draggable={false}
          sizes="(min-width: 1024px) 25vw, 50vw"
          aria-hidden
          className="absolute inset-0 h-full w-full scale-[1.2] object-cover brightness-[4] contrast-150 transition-all duration-500 ease-[var(--ease-card)] [clip-path:polygon(0%_0%,0%_0%,0%_100%,0%_100%)] group-hover:scale-100 group-hover:brightness-100 group-hover:contrast-100 group-hover:[clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]"
        />

        <div
          data-curtain
          aria-hidden
          className="absolute inset-0 h-full w-full bg-curtain dark:bg-neutral-800"
        />
      </div>

      <div className="mt-3 flex flex-col justify-between gap-2 text-lg leading-5 md:flex-row">
        <p>{product.title}</p>
        <p>{money(product.price)}</p>
      </div>
      <div className="mt-[6px] flex items-center gap-1 text-[11px] uppercase">
        <span className="h-2 w-2 rounded-full bg-current" />
        <span>{product.category}</span>
      </div>
    </Link>
  );
}
