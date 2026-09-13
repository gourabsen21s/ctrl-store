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
  stock?: number;
  frontImage?: string;
  backImage?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export const ASPECT_CLASS: Record<Aspect, string> = {
  large: "aspect-large",
  small: "aspect-small",
  square: "aspect-square",
  natural: "",
};

export const CATEGORIES = [
  "All",
  "Apparel",
  "Bags",
  "Headwear",
  "Accessories",
] as const;

export const PRODUCTS: Product[] = [
  {
    handle: "heavy-tee-black",
    title: "Heavy Tee",
    price: 2499,
    category: "Apparel",
    color: "Black",
    sizes: ["S", "M", "L", "XL", "2XL"],
    aspect: "large",
    description: "A 240gsm cotton tee cut boxy through the body, with a ribbed collar that holds its shape past the first wash.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289451/ctrl-store/products/heavy-tee-black-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289452/ctrl-store/products/heavy-tee-black-back.jpg",
  },
  {
    handle: "six-panel-cap",
    title: "Six Panel Cap",
    price: 1899,
    category: "Headwear",
    color: "Black",
    sizes: ["One size"],
    aspect: "large",
    description: "Structured six-panel crown, brass slider, pre-curved brim. Broken in on arrival.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289453/ctrl-store/products/six-panel-cap-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289454/ctrl-store/products/six-panel-cap-back.jpg",
  },
  {
    handle: "crew-heavyweight",
    title: "Heavyweight Crew",
    price: 2999,
    category: "Apparel",
    color: "Black",
    sizes: ["S", "M", "L", "XL", "2XL"],
    aspect: "large",
    description: "Brushed-back fleece with set-in sleeves and a flat, drawcord-free neck. Weighty without the bulk.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289456/ctrl-store/products/crew-heavyweight-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289456/ctrl-store/products/crew-heavyweight-back.jpg",
  },
  {
    handle: "roll-top-pack",
    title: "Roll Top Pack",
    price: 3499,
    category: "Bags",
    color: "Black",
    sizes: ["24L"],
    aspect: "large",
    description: "Coated tarpaulin shell, welded seams, magnetic roll closure. Rain is a non-event.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289457/ctrl-store/products/roll-top-pack-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289458/ctrl-store/products/roll-top-pack-back.jpg",
  },
  {
    handle: "canvas-tote-black",
    title: "Canvas Tote",
    price: 1999,
    category: "Bags",
    color: "Black",
    sizes: ["One size"],
    aspect: "natural",
    description: "16oz canvas, boxed base, seatbelt webbing handles long enough to shoulder.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289459/ctrl-store/products/canvas-tote-black-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289460/ctrl-store/products/canvas-tote-black-back.jpg",
  },
  {
    handle: "ribbed-beanie",
    title: "Ribbed Beanie",
    price: 1299,
    category: "Headwear",
    color: "Red",
    sizes: ["One size"],
    aspect: "small",
    description: "Fine-gauge rib with a deep turn-back cuff. Sits above the ear or over it.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289461/ctrl-store/products/ribbed-beanie-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289462/ctrl-store/products/ribbed-beanie-back.jpg",
  },
  {
    handle: "coated-tote-silver",
    title: "Coated Tote",
    price: 2199,
    category: "Bags",
    color: "Silver",
    sizes: ["One size"],
    aspect: "square",
    description: "Metallised film laminate over ripstop. Loud on purpose, light in practice.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289463/ctrl-store/products/coated-tote-silver-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289463/ctrl-store/products/coated-tote-silver-back.jpg",
  },
  {
    handle: "boxy-tee-natural",
    title: "Boxy Tee",
    price: 2299,
    category: "Apparel",
    color: "Natural",
    sizes: ["S", "M", "L", "XL"],
    aspect: "small",
    description: "Undyed cotton, dropped shoulder, wide body. The colour shifts slightly batch to batch.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289464/ctrl-store/products/boxy-tee-natural-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289465/ctrl-store/products/boxy-tee-natural-back.jpg",
  },
  {
    handle: "boxy-tee-black",
    title: "Boxy Tee",
    price: 2299,
    category: "Apparel",
    color: "Black",
    sizes: ["S", "M", "L", "XL"],
    aspect: "natural",
    description: "The same wide cut in a deep reactive black that stays black.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289466/ctrl-store/products/boxy-tee-black-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289467/ctrl-store/products/boxy-tee-black-back.jpg",
  },
  {
    handle: "market-tote",
    title: "Market Tote",
    price: 2499,
    category: "Bags",
    color: "Black",
    sizes: ["One size"],
    aspect: "small",
    description: "Oversized carry with an internal slip pocket and a base panel that keeps its shape loaded.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289468/ctrl-store/products/market-tote-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289468/ctrl-store/products/market-tote-back.jpg",
  },
  {
    handle: "shopper-natural",
    title: "Shopper",
    price: 1799,
    category: "Bags",
    color: "Natural",
    sizes: ["One size"],
    aspect: "natural",
    description: "Lightweight everyday carry in undyed canvas. Folds flat into its own pocket.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289469/ctrl-store/products/shopper-natural-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289470/ctrl-store/products/shopper-natural-back.jpg",
  },
  {
    handle: "crew-natural",
    title: "Crew",
    price: 2699,
    category: "Apparel",
    color: "Natural",
    sizes: ["S", "M", "L", "XL"],
    aspect: "small",
    description: "Loopback cotton in its undyed state, with a relaxed body and clean-finished cuffs.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289471/ctrl-store/products/crew-natural-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289472/ctrl-store/products/crew-natural-back.jpg",
  },
  {
    handle: "webbing-keyfob",
    title: "Webbing Keyfob",
    price: 899,
    category: "Accessories",
    color: "Black",
    sizes: ["One size"],
    aspect: "natural",
    description: "Bar-tacked nylon webbing on a solid brass ring. Small, heavy, hard to lose.",
    frontImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289473/ctrl-store/products/webbing-keyfob-front.jpg",
    backImage: "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289473/ctrl-store/products/webbing-keyfob-back.jpg",
  },
];

export const getProduct = (handle: string): Product | undefined =>
  PRODUCTS.find((p) => p.handle === handle);

export const imageFor = (
  target: string | Product,
  face: "front" | "back" = "front"
): string => {
  if (typeof target === "object" && target !== null) {
    if (face === "front" && target.frontImage) return target.frontImage;
    if (face === "back" && target.backImage) return target.backImage;
    // Fallback if product object has no image
    const fallback = PRODUCTS.find((p) => p.handle === target.handle);
    if (fallback) {
      return (face === "front" ? fallback.frontImage : fallback.backImage) || "";
    }
    return "";
  }
  const p = PRODUCTS.find((item) => item.handle === target);
  if (p) {
    if (face === "front" && p.frontImage) return p.frontImage;
    if (face === "back" && p.backImage) return p.backImage;
  }
  return "";
};

export const money = (n: number): string =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
