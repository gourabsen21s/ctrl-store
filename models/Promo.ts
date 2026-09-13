import mongoose from "mongoose";

const PromoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g. "LAUNCH20"
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true }, // 20 (for 20%) or 500 (for ₹500 off)
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 0 }, // 0 means unlimited
  usageCount: { type: Number, default: 0 },
  cashbackCoins: { type: Number, default: 0 }, // 0 means no cashback
}, { timestamps: true });

export const PromoModel = mongoose.models.Promo || mongoose.model("Promo", PromoSchema);
