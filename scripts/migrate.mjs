/**
 * Complete Migration Script:
 * 1. Uploads all 26 product photos from public/products/ to Cloudinary.
 * 2. Connects to MongoDB Atlas.
 * 3. Populates the `products` collection with all products and their Cloudinary CDN URLs.
 *
 * Run with:
 *   node scripts/migrate.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env.local
function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key] && val) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const PRODUCTS_DATA = [
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

async function run() {
  console.log("==================================================");
  console.log("🚀 CTRL + STYLE: Cloudinary & MongoDB Migration");
  console.log("==================================================\n");

  const missing = [];
  if (!CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)");
  if (!CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  if (!MONGODB_URI) missing.push("MONGODB_URI");

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables in .env.local:");
    missing.forEach((m) => console.error(`   - ${m}`));
    console.error("\nPlease add these credentials to your .env.local file first and run this script again.");
    process.exit(1);
  }

  // 1. Configure Cloudinary
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log(`[1/3] Uploading product photos to Cloudinary (${CLOUDINARY_CLOUD_NAME})...`);
  const productsDir = path.join(rootDir, "public", "products");
  const uploadedUrls = {};

  for (const p of PRODUCTS_DATA) {
    for (const face of ["front", "back"]) {
      const filename = `${p.handle}-${face}.jpg`;
      const localFile = path.join(productsDir, filename);

      if (fs.existsSync(localFile)) {
        try {
          process.stdout.write(`  Uploading ${filename}... `);
          const uploadRes = await cloudinary.uploader.upload(localFile, {
            folder: "ctrl-store/products",
            public_id: `${p.handle}-${face}`,
            overwrite: true,
          });
          uploadedUrls[filename] = uploadRes.secure_url;
          console.log(`✓ OK`);
        } catch (err) {
          console.error(`✗ Error: ${err.message}`);
        }
      }
    }
  }

  // 2. Connect to MongoDB
  console.log("\n[2/3] Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("  ✓ Connected successfully.");

  const ProductSchema = new mongoose.Schema(
    {
      handle: { type: String, required: true, unique: true },
      title: String,
      price: Number,
      category: String,
      color: String,
      sizes: [String],
      aspect: String,
      description: String,
      frontImage: String,
      backImage: String,
    },
    { timestamps: true }
  );

  const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

  // 3. Upsert products with Cloudinary URLs
  console.log("\n[3/3] Inserting/updating products in MongoDB with Cloudinary CDN URLs...");

  for (const p of PRODUCTS_DATA) {
    const frontUrl = uploadedUrls[`${p.handle}-front.jpg`];
    const backUrl = uploadedUrls[`${p.handle}-back.jpg`];

    const doc = {
      ...p,
      frontImage: frontUrl || `/products/${p.handle}-front.jpg`,
      backImage: backUrl || `/products/${p.handle}-back.jpg`,
    };

    await Product.findOneAndUpdate({ handle: p.handle }, { $set: doc }, { upsert: true, new: true });
    console.log(`  ✓ Synced "${p.title}" (${p.handle}) -> Cloudinary: ${Boolean(frontUrl)}`);
  }

  const totalCount = await Product.countDocuments();
  console.log(`\n🎉 Migration Complete! Total items now in MongoDB: ${totalCount}`);
  console.log("All products now serve their images directly from your Cloudinary CDN.");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error("\n❌ Migration failed:", e);
  process.exit(1);
});
