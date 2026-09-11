import { BRAND, BRAND_SUFFIX } from "@/lib/site";

/**
 * SVG rather than a vw-tuned font-size: textLength forces the word to span the
 * viewBox exactly, so the mark sits flush to its container at any width and in
 * any font, and the rendered height is fully deterministic. That last part
 * matters because the preloader Flips onto this element's measured box.
 *
 * The viewBox ratio is taken from the reference mark (1391 x 296) so the hero
 * block occupies the same height as the original at the same width.
 *
 * The ® lives inside the SVG rather than as an absolutely-positioned span:
 * as HTML it would size in em against the 18px body text (~2px) instead of
 * against the mark.
 */
export default function Wordmark({
  className = "",
  showSuffix = true,
}: {
  className?: string;
  showSuffix?: boolean;
}) {
  const W = 1391;
  const H = 296;
  // Cap height runs ~0.73em in this grotesque, so this fills the box vertically.
  const FONT = Math.round(H / 0.73);
  const WORD_W = showSuffix ? W * 0.962 : W;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full overflow-visible"
        role="img"
        aria-label={`${BRAND}${showSuffix ? BRAND_SUFFIX : ""}`}
      >
        <text
          x="0"
          y={H}
          textLength={WORD_W}
          lengthAdjust="spacingAndGlyphs"
          fill="currentColor"
          fontWeight={900}
          fontSize={FONT}
          fontFamily="var(--font-display)"
        >
          {BRAND}
        </text>
        {showSuffix && (
          <text
            x={W}
            y={H}
            textAnchor="end"
            fill="currentColor"
            fontWeight={700}
            fontSize={Math.round(H * 0.17)}
            fontFamily="var(--font-display)"
          >
            {BRAND_SUFFIX}
          </text>
        )}
      </svg>
    </div>
  );
}
