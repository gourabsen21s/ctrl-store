import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://iamgreatgs95s_db_user:lLjxgamgFkFPBKMz@cluster0.a3u9gyx.mongodb.net/ctrl-store?retryWrites=true&w=majority&appName=Cluster0";

const ProductSchema = new mongoose.Schema(
  {
    handle: String,
    title: String,
    price: Number,
    category: String,
    color: String,
    sizes: [String],
    aspect: String,
    description: String,
    stock: { type: Number, default: 15 },
    frontImage: String,
    backImage: String,
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!\n");

  // READ current stock
  const before = await Product.findOne({ handle: "heavy-tee-black" }).lean();
  console.log("Current stock in DB:", before?.stock);
  console.log("Current updatedAt:", before?.updatedAt);

  // WRITE - try to update stock to 99
  const result = await Product.findOneAndUpdate(
    { handle: "heavy-tee-black" },
    { $set: { stock: 99 } },
    { new: true }
  );
  console.log("\nAfter update - stock:", result?.stock);
  console.log("After update - updatedAt:", result?.updatedAt);

  if (result?.stock === 99) {
    console.log("\n✅ MongoDB write is WORKING. The problem is in the API or session auth.");
    // Restore
    await Product.findOneAndUpdate({ handle: "heavy-tee-black" }, { $set: { stock: 15 } });
    console.log("Restored stock to 15.");
  } else {
    console.log("\n❌ MongoDB write FAILED. Problem is at the database level.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
