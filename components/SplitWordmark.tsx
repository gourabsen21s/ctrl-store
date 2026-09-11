"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { BRAND, BRAND_LINES, BRAND_SUFFIX } from "@/lib/site";

/** Nominal type size; the viewBox scales the whole lockup to its container. */
const FONT = 420;
const CAP = Math.round(FONT * 0.73);
/** Baseline-to-baseline. Tight enough that the cap boxes nearly touch. */
const LEADING = Math.round(FONT * 0.8);

/**
 * Fraction of the box the widest line occupies. The box is deliberately wider
 * than any line so the three can sit left / centre / right with real slack
 * between them — that gap IS the lockup. Lower it to spread them further
 * apart (and shrink the type); raise it to tighten the diagonal.
 */
const SPREAD = 0.3;

export const WORDMARK_H = CAP + LEADING * (BRAND_LINES.length - 1);

const baselineFor = (i: number) => CAP + LEADING * i;

type Glyph = { ch: string; x: number; w: number };
type Measured = { boxW: number; lines: Glyph[][] };

/**
 * The wordmark as a three-line stacked lockup of individually animatable
 * glyphs: CTRL flush left, + centred, STYLE flush right.
 *
 * Nothing is stretched to fit. Every line is set at one size, measured, and
 * the widest line defines the box width — so the alignment does the work and
 * all three lines keep identical tracking.
 *
 * Measuring happens with the lines parked at x=0; each glyph's offset is
 * relative to its own line, and the line's alignment offset is added after
 * the box width is known. One pass, no layout thrash.
 *
 * Each line gets its OWN clip band rather than one rect over the block: the
 * leading is tight enough that a shared clip would let a glyph from the line
 * below show while travelling up through its neighbour's space.
 *
 * font-family goes through `style`, not the SVG presentation attribute —
 * var() does not resolve in presentation attributes and silently falls back.
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
  const measures = useRef<(SVGTextElement | null)[]>([]);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const [m, setM] = useState<Measured | null>(null);
  // Two instances can be mounted at once (loader + hero), so a constant id
  // would make them share — and fight over — one clip path.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const font = { fontFamily: "var(--font-display)" };

  useLayoutEffect(() => {
    try {
      const widths: number[] = [];
      const relative: Glyph[][] = [];

      BRAND_LINES.forEach((line, li) => {
        const node = measures.current[li];
        if (!node) throw new Error("missing line");
        widths.push(node.getComputedTextLength());
        const glyphs: Glyph[] = [];
        for (let i = 0; i < line.text.length; i++) {
          const start = node.getStartPositionOfChar(i).x;
          const end = node.getEndPositionOfChar(i).x;
          glyphs.push({ ch: line.text[i], x: start, w: Math.max(0, end - start) });
        }
        relative.push(glyphs);
      });

      // Widen past the longest line so alignment has somewhere to go.
      const boxW = Math.max(...widths) / SPREAD;
      // Shift each line into place now that the box width is known.
      const lines = relative.map((glyphs, li) => {
        const slack = boxW - widths[li];
        const offset =
          BRAND_LINES[li].align === "start" ? 0 : BRAND_LINES[li].align === "middle" ? slack / 2 : slack;
        return glyphs.map((g) => ({ ...g, x: g.x + offset }));
      });

      setM({ boxW, lines });
    } catch {
      setM(null); // keep the plain laid-out lines
    }
  }, []);

  // Runs after the glyphs commit, so callers always receive live nodes.
  useLayoutEffect(() => {
    if (!m || !onGlyphs) return;
    const all = groups.current.flatMap((g) => (g ? Array.from(g.querySelectorAll("text")) : []));
    if (all.length) onGlyphs(all);
  }, [m, onGlyphs]);

  // Before measuring, the box is provisional and the lines sit at x=0.
  const boxW = m?.boxW ?? (FONT * 4) / SPREAD;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${boxW} ${WORDMARK_H}`}
        className="block w-full overflow-visible"
        style={font}
        role="img"
        aria-label={`${BRAND}${showSuffix ? BRAND_SUFFIX : ""}`}
      >
        <defs>
          {BRAND_LINES.map((_, li) => (
            <clipPath key={li} id={`wm-${uid}-${li}`}>
              <rect x="0" y={baselineFor(li) - CAP} width={boxW} height={CAP} />
            </clipPath>
          ))}
        </defs>

        {BRAND_LINES.map((line, li) => {
          const y = baselineFor(li);
          return (
            <g key={line.text}>
              {/* Laid-out run, parked at x=0 for measuring. Hidden once split. */}
              <text
                ref={(el) => {
                  measures.current[li] = el;
                }}
                x={0}
                y={y}
                fontWeight={900}
                fontSize={FONT}
                fill="currentColor"
                style={font}
                opacity={m ? 0 : 1}
                aria-hidden={m ? true : undefined}
              >
                {line.text}
              </text>

              {m?.lines[li] && (
                <g
                  ref={(el) => {
                    groups.current[li] = el;
                  }}
                  clipPath={`url(#wm-${uid}-${li})`}
                >
                  {m.lines[li].map((g, i) => (
                    <text
                      key={`${g.ch}-${i}`}
                      data-glyph
                      x={g.x}
                      y={y}
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
            </g>
          );
        })}

        {showSuffix && m && (
          <text
            x={boxW}
            y={baselineFor(BRAND_LINES.length - 1) + Math.round(CAP * 0.22)}
            textAnchor="end"
            fontWeight={700}
            fontSize={Math.round(CAP * 0.17)}
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
