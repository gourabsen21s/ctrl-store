"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { BRAND, BRAND_SUFFIX } from "@/lib/site";

export const WORDMARK_W = 1391;
export const WORDMARK_H = 296;
const FONT = Math.round(WORDMARK_H / 0.73);

/** Per-character position and advance, taken from the fitted run. */
type Glyph = { ch: string; x: number; w: number };

/**
 * The wordmark as individually animatable glyphs.
 *
 * The word is laid out once as a single fitted <text> (textLength pins it flush
 * to the container at any width, in any font), then each character's start and
 * advance are measured off that run and re-applied to standalone glyphs. Both
 * the offset AND the per-glyph textLength have to carry over — position alone
 * would place stretched glyphs at natural widths and the spacing would drift.
 *
 * font-family is set through `style`, not the SVG presentation attribute:
 * var() does not resolve in presentation attributes, so the attribute form
 * silently falls back to the default serif.
 *
 * One clip rect over the group masks entrances — glyphs park below the
 * baseline, outside the box. Callers animate the nodes handed to `onGlyphs`.
 */
export default function SplitWordmark({
  className = "",
  showSuffix = true,
  onGlyphs,
}: {
  className?: string;
  showSuffix?: boolean;
  onGlyphs?: (glyphs: SVGTextElement[]) => void;
}) {
  const measure = useRef<SVGTextElement>(null);
  const group = useRef<SVGGElement>(null);
  const [glyphs, setGlyphs] = useState<Glyph[] | null>(null);
  // Two instances can be mounted at once (loader + hero), so a constant id
  // would make them share — and fight over — one clip path.
  const clipId = `wm-clip-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const font = { fontFamily: "var(--font-display)" };
  const wordWidth = showSuffix ? WORDMARK_W * 0.962 : WORDMARK_W;

  useLayoutEffect(() => {
    const node = measure.current;
    if (!node) return;
    try {
      const next: Glyph[] = [];
      for (let i = 0; i < BRAND.length; i++) {
        const start = node.getStartPositionOfChar(i).x;
        const end = node.getEndPositionOfChar(i).x;
        next.push({ ch: BRAND[i], x: start, w: Math.max(0, end - start) });
      }
      setGlyphs(next);
    } catch {
      setGlyphs(null); // keep the single fitted run as-is
    }
  }, []);

  // Runs after the glyphs commit, so callers always receive live nodes.
  useLayoutEffect(() => {
    if (!glyphs || !group.current || !onGlyphs) return;
    onGlyphs(Array.from(group.current.querySelectorAll("text")));
  }, [glyphs, onGlyphs]);

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`}
        className="block w-full overflow-visible"
        style={font}
        role="img"
        aria-label={`${BRAND}${showSuffix ? BRAND_SUFFIX : ""}`}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={WORDMARK_W} height={WORDMARK_H} />
          </clipPath>
        </defs>

        <text
          ref={measure}
          x="0"
          y={WORDMARK_H}
          textLength={wordWidth}
          lengthAdjust="spacingAndGlyphs"
          fontWeight={900}
          fontSize={FONT}
          fill="currentColor"
          style={font}
          opacity={glyphs ? 0 : 1}
          aria-hidden={glyphs ? true : undefined}
        >
          {BRAND}
        </text>

        {glyphs && (
          <g ref={group} clipPath={`url(#${clipId})`}>
            {glyphs.map((g, i) => (
              <text
                key={`${g.ch}-${i}`}
                data-glyph
                x={g.x}
                y={WORDMARK_H}
                // Whitespace has no advance to preserve; forcing textLength on
                // it collapses the glyph.
                {...(g.w > 0 && g.ch.trim()
                  ? { textLength: g.w, lengthAdjust: "spacingAndGlyphs" as const }
                  : {})}
                fontWeight={900}
                fontSize={FONT}
                fill="currentColor"
                style={font}
                xmlSpace="preserve"
              >
                {g.ch}
              </text>
            ))}
          </g>
        )}

        {showSuffix && (
          <text
            x={WORDMARK_W}
            y={WORDMARK_H}
            textAnchor="end"
            fontWeight={700}
            fontSize={Math.round(WORDMARK_H * 0.17)}
            fill="currentColor"
            style={font}
          >
            {BRAND_SUFFIX}
          </text>
        )}
      </svg>
    </div>
  );
}
