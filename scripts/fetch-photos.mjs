import { mkdirSync, writeFileSync, existsSync } from "node:fs";

/**
 * Product imagery from Unsplash (free licence, commercial use permitted).
 * These are stand-ins so the layout can be judged with real photography —
 * swap in your own shoot and this script becomes unnecessary.
 */
const OUT = "public/products";
mkdirSync(OUT, { recursive: true });

// [handle, frontPhotoId, backPhotoId]
const MAP = [
  ["heavy-tee-black",     "photo-1622445272461-c6580cab8755", "photo-1622445275463-afa2ab738c34"],
  ["six-panel-cap",       "photo-1609868656710-4f299e957ec5", "photo-1546498424-54b9e153a64e"],
  ["crew-heavyweight",    "photo-1620799140188-3b2a02fd9a77", "photo-1620799140408-edc6dcb6d633"],
  ["roll-top-pack",       "photo-1642375352724-8b523c67b8be", "photo-1680039211156-66c721b87625"],
  ["canvas-tote-black",   "photo-1578237493287-8d4d2b03591a", "photo-1511405946472-a37e3b5ccd47"],
  ["ribbed-beanie",       "photo-1704253801154-e7da0cafd28b", "photo-1648114359508-8596f8f2f3fc"],
  ["coated-tote-silver",  "photo-1632942480766-9cee148c4ee8", "photo-1610282081854-9c311350beb9"],
  ["boxy-tee-natural",    "photo-1620799139652-715e4d5b232d", "photo-1620799139507-2a76f79a2f4d"],
  ["boxy-tee-black",      "photo-1789110854086-fd55cb767e94", "photo-1778671394516-8270eac13c42"],
  ["market-tote",         "photo-1574365569389-a10d488ca3fb", "photo-1630381260512-e3fe55c11973"],
  ["shopper-natural",     "photo-1544816155-12df9643f363",    "photo-1621466550398-ac8062907657"],
  ["crew-natural",        "photo-1620799139834-6b8f844fbe61", "photo-1579664531470-ac357f8f8e2b"],
  ["webbing-keyfob",      "photo-1541267732407-8f72c182cf11", "photo-1505308144658-03c69861061a"],
];

const url = (id) => `https://images.unsplash.com/${id}?w=1200&q=80&fm=jpg&fit=max`;

let ok = 0, skipped = 0, failed = [];
for (const [handle, front, back] of MAP) {
  for (const [face, id] of [["front", front], ["back", back]]) {
    const dest = `${OUT}/${handle}-${face}.jpg`;
    if (existsSync(dest)) { skipped++; continue; }
    try {
      const res = await fetch(url(id));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      ok++;
    } catch (err) {
      failed.push(`${handle}-${face}: ${err.message}`);
    }
  }
}
console.log(`downloaded ${ok}, skipped ${skipped}, failed ${failed.length}`);
if (failed.length) console.log(failed.join("\n"));
