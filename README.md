# Editorial commerce study

A front-end study of an editorial commerce layout: a sixteen-column grid, three
inverted themes, and a GSAP motion system. Built as a design/UX reference, not a
storefront — there is no checkout and no payment path.

## Stack

| | |
|---|---|
| Framework | Next.js (App Router, Turbopack) |
| Styling | Tailwind v4, CSS-first `@theme` config |
| Motion | GSAP + ScrollTrigger, SplitText, Flip, CustomEase |
| Scroll | Lenis, driven off the GSAP ticker |

## Run

```bash
npm run dev
```

## Motion

Every timing lives in one table, `lib/motion.ts`. Change it there rather than in
components — the feel of the whole site hangs off that file.

| Piece | Behaviour |
|---|---|
| Preloader | Counter 000→100, six cards dealt onto a stack, wordmark letters revealed by SplitText, then **Flip** morphs the loader wordmark onto the hero's box |
| Hero | Rule scales from `origin-left`; meta row rises `yPercent 110 → 0`, staggered |
| Card reveal | ScrollTrigger at `top 75%`; a curtain slides off while the image counter-moves behind it |
| Card hover | Pure CSS: clip-path wipe, `scale 1.2 → 1`, and an exposure correction from blown-out to normal, all on one 500ms transition |
| Route change | Clip-path curtain wipes up from the bottom edge and clears upward |
| Cursor | 8px dot lerped on `expo.out`; scales up over `[data-cursor]` targets |

`prefers-reduced-motion` is honoured throughout: the preloader is skipped, Lenis
and the custom cursor never initialise, and animated elements render at their
final state.

## Themes

Three, not two — `light` (cream/black), `dark` (black/cream) and `red`
(cream/red, the default). Implemented as Tailwind custom variants keyed off
`data-theme`, with an inline script setting it before first paint so the stored
choice never flashes. The nav sits in `mix-blend-difference`, so one set of
colours reads correctly over all three.

## Placeholder content

The brand name, identity mark, product names, copy and imagery here are all
generic stand-ins, and the product images are generated locally by
`scripts/gen-placeholders.mjs`. Swap them for your own:

- `lib/site.ts` — brand name, taglines, blurb
- `components/Mark.tsx` — identity mark
- `lib/products.ts` — catalogue
- `scripts/gen-placeholders.mjs` — or just drop real images into `public/products/`

The display face is Archivo, a free grotesque standing in for a licensed one.

## Known limits

- The bag is `sessionStorage`-backed, not a real cart. No checkout exists.
- Product data is static; there is no CMS or commerce backend.
