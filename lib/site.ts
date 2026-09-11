/**
 * Brand placeholders. Swap these and the rest of the build follows.
 */
export const BRAND = "CTRL + STYLE";
export const BRAND_SUFFIX = "®";

/**
 * The wordmark is a three-line stacked lockup rather than a single run:
 * CTRL flush left, + centred, STYLE flush right, so the block reads as a
 * diagonal down the page.
 *
 * No line is stretched to fit. Every line is set at one size and the widest
 * of them defines the box width — stretching a line to the full width would
 * both break the uniform size and stop it reading as "aligned right".
 */
export const BRAND_LINES = [
  { text: "CTRL", align: "start" as const },
  { text: "+", align: "middle" as const },
  { text: "STYLE", align: "end" as const },
];

export const TAGLINE_A = "Made to be worn.";
export const TAGLINE_B = "Or judged. Or both.";
export const YEAR_MARK = "26";
export const BLURB =
  "Built by the CTRL + STYLE team, this shop and signature collection celebrate our collective craft and our appetite for good apparel. Carefully designed.";
