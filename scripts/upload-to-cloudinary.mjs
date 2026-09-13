/**
 * Batch upload existing local product photos to Cloudinary.
 *
 * Usage:
 *   node scripts/upload-to-cloudinary.mjs
 *
 * Prerequisites:
 *   Make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and
 *   CLOUDINARY_API_SECRET are set in your .env.local file.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Simple .env.local reader
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
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
  console.error("Error: Missing Cloudinary credentials in .env.local");
  console.error("Required:");
  console.error("  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  console.error("  CLOUDINARY_API_KEY");
  console.error("  CLOUDINARY_API_SECRET");
  process.exit(1);
}

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

const productsDir = path.join(rootDir, "public", "products");

async function main() {
  if (!fs.existsSync(productsDir)) {
    console.error(`Directory not found: ${productsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(productsDir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
  console.log(`Found ${files.length} product images in ${productsDir}`);
  console.log(`Uploading to Cloudinary account: ${cloud_name} (folder: ctrl-store/products)...\n`);

  const results = {};

  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const publicId = path.parse(file).name;

    try {
      console.log(`Uploading ${file}...`);
      const res = await cloudinary.uploader.upload(filePath, {
        folder: "ctrl-store/products",
        public_id: publicId,
        overwrite: true,
      });
      console.log(`  ✓ Uploaded: ${res.secure_url}`);
      results[file] = res.secure_url;
    } catch (err) {
      console.error(`  ✗ Failed to upload ${file}:`, err.message);
    }
  }

  const outputPath = path.join(rootDir, "scripts", "cloudinary-manifest.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nAll done! Manifest written to ${outputPath}`);
}

main().catch(console.error);
