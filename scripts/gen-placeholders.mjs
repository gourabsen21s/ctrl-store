import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/products";
mkdirSync(OUT, { recursive: true });

// Flat garment silhouettes. Enough form to read as apparel at grid scale
// without pretending to be photography.
const SHAPES = {
  tee: "M150 190 L235 150 L265 130 Q300 175 300 175 L268 205 L258 196 L258 420 Q225 432 200 432 Q175 432 142 420 L142 196 L132 205 L100 175 Q100 175 135 130 L165 150 Z",
  hoodie:
    "M150 185 L232 148 L262 128 Q302 172 302 172 L272 206 L262 197 L262 440 Q226 452 200 452 Q174 452 138 440 L138 197 L128 206 L98 172 Q98 172 138 128 L168 148 Z",
  cap: "M108 300 Q108 196 200 196 Q292 196 292 300 L292 312 Q292 320 284 320 L116 320 Q108 320 108 312 Z M292 300 L346 300 Q356 300 356 312 Q356 324 346 324 L292 324 Z",
  tote: "M120 210 L280 210 L296 430 L104 430 Z M156 210 Q156 148 200 148 Q244 148 244 210",
  beanie:
    "M112 320 Q112 194 200 194 Q288 194 288 320 Z M104 320 L296 320 L296 364 L104 364 Z",
  pack: "M126 228 Q126 176 200 176 Q274 176 274 228 L274 438 L126 438 Z M164 176 Q164 140 200 140 Q236 140 236 176",
  tag: "M172 150 L228 150 L228 182 L242 182 L242 430 L158 430 L158 182 L172 182 Z",
};

const svg = ({ shape, ground, garment, accent, label }) => `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 400 533">
  <rect width="400" height="533" fill="${ground}"/>
  <path d="${SHAPES[shape]}" fill="${garment}"/>
  <rect x="182" y="246" width="36" height="18" fill="${accent}"/>
  <text x="200" y="504" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="11" letter-spacing="2" fill="${accent}" opacity="0.55">${label}</text>
</svg>`;

const CREAM = "#ede4dd";
const GREY = "#d2cac3";
const BLACK = "#141414";
const RED = "#ff0001";
const SILVER = "#c9c9cf";

const items = [
  ["heavy-tee-black", "tee", BLACK],
  ["six-panel-cap", "cap", BLACK],
  ["crew-heavyweight", "hoodie", BLACK],
  ["roll-top-pack", "pack", BLACK],
  ["canvas-tote-black", "tote", BLACK],
  ["ribbed-beanie", "beanie", RED],
  ["coated-tote-silver", "tote", SILVER],
  ["boxy-tee-natural", "tee", CREAM],
  ["boxy-tee-black", "tee", BLACK],
  ["market-tote", "tote", BLACK],
  ["shopper-natural", "tote", CREAM],
  ["crew-natural", "hoodie", CREAM],
  ["webbing-keyfob", "tag", BLACK],
];

for (const [handle, shape, garment] of items) {
  const onLight = garment === CREAM || garment === SILVER;
  writeFileSync(
    `${OUT}/${handle}-front.svg`,
    svg({ shape, ground: GREY, garment, accent: onLight ? BLACK : CREAM, label: "FRONT" })
  );
  writeFileSync(
    `${OUT}/${handle}-back.svg`,
    svg({ shape, ground: onLight ? BLACK : RED, garment, accent: CREAM, label: "BACK" })
  );
}

console.log(`wrote ${items.length * 2} placeholder images`);
