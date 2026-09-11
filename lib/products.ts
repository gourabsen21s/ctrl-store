/** Card crop. The reference varies this per product — it is what stops the
 *  editorial rows reading as a uniform catalogue grid. */
export type Aspect = "large" | "small" | "square" | "natural";

export type Product = {
  handle: string;
  title: string;
  price: number;
  category: string;
  color: string;
  sizes: string[];
  aspect: Aspect;
  description: string;
};

export const ASPECT_CLASS: Record<Aspect, string> = {
  large: "aspect-large",
  small: "aspect-small",
  square: "aspect-square",
  natural: "",
};

export const PRODUCTS: Product[] = [
  { handle: "heavy-tee-black", title: "Heavy Tee", price: 36.5, category: "Apparel", color: "Black", sizes: ["S", "M", "L", "XL", "2XL"], aspect: "large", description: "A 240gsm cotton tee cut boxy through the body, with a ribbed collar that holds its shape past the first wash." },
  { handle: "six-panel-cap", title: "Six Panel Cap", price: 25, category: "Headwear", color: "Black", sizes: ["One size"], aspect: "large", description: "Structured six-panel crown, brass slider, pre-curved brim. Broken in on arrival." },
  { handle: "crew-heavyweight", title: "Heavyweight Crew", price: 30, category: "Apparel", color: "Black", sizes: ["S", "M", "L", "XL", "2XL"], aspect: "large", description: "Brushed-back fleece with set-in sleeves and a flat, drawcord-free neck. Weighty without the bulk." },
  { handle: "roll-top-pack", title: "Roll Top Pack", price: 30, category: "Bags", color: "Black", sizes: ["24L"], aspect: "large", description: "Coated tarpaulin shell, welded seams, magnetic roll closure. Rain is a non-event." },
  { handle: "canvas-tote-black", title: "Canvas Tote", price: 30, category: "Bags", color: "Black", sizes: ["One size"], aspect: "natural", description: "16oz canvas, boxed base, seatbelt webbing handles long enough to shoulder." },
  { handle: "ribbed-beanie", title: "Ribbed Beanie", price: 20, category: "Headwear", color: "Red", sizes: ["One size"], aspect: "small", description: "Fine-gauge rib with a deep turn-back cuff. Sits above the ear or over it." },
  { handle: "coated-tote-silver", title: "Coated Tote", price: 25, category: "Bags", color: "Silver", sizes: ["One size"], aspect: "square", description: "Metallised film laminate over ripstop. Loud on purpose, light in practice." },
  { handle: "boxy-tee-natural", title: "Boxy Tee", price: 30, category: "Apparel", color: "Natural", sizes: ["S", "M", "L", "XL"], aspect: "small", description: "Undyed cotton, dropped shoulder, wide body. The colour shifts slightly batch to batch." },
  { handle: "boxy-tee-black", title: "Boxy Tee", price: 30, category: "Apparel", color: "Black", sizes: ["S", "M", "L", "XL"], aspect: "natural", description: "The same wide cut in a deep reactive black that stays black." },
  { handle: "market-tote", title: "Market Tote", price: 30, category: "Bags", color: "Black", sizes: ["One size"], aspect: "small", description: "Oversized carry with an internal slip pocket and a base panel that keeps its shape loaded." },
  { handle: "shopper-natural", title: "Shopper", price: 30, category: "Bags", color: "Natural", sizes: ["One size"], aspect: "natural", description: "Lightweight everyday carry in undyed canvas. Folds flat into its own pocket." },
  { handle: "crew-natural", title: "Crew", price: 33, category: "Apparel", color: "Natural", sizes: ["S", "M", "L", "XL"], aspect: "small", description: "Loopback cotton in its undyed state, with a relaxed body and clean-finished cuffs." },
  { handle: "webbing-keyfob", title: "Webbing Keyfob", price: 15, category: "Accessories", color: "Black", sizes: ["One size"], aspect: "natural", description: "Bar-tacked nylon webbing on a solid brass ring. Small, heavy, hard to lose." },
];

export const getProduct = (handle: string) => PRODUCTS.find((p) => p.handle === handle);

export const imageFor = (handle: string, face: "front" | "back" = "front") =>
  `/products/${handle}-${face}.jpg`;

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
