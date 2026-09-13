import mongoose, { Schema, Document, Model } from "mongoose";

export type WalletTransactionReason =
  | "referral_reward_referrer"
  | "referral_reward_referee"
  | "coupon_cashback"
  | "order_redemption"
  | "admin_credit"
  | "admin_debit"
  | "signup_bonus";

export type WalletTransactionReferenceType = "order" | "coupon" | "referral" | "manual" | "system";

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number; // positive number
  balanceBefore: number;
  balanceAfter: number;
  reason: WalletTransactionReason;
  referenceId: string;
  referenceType: WalletTransactionReferenceType;
  idempotencyKey: string;
  note?: string;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: [
        "referral_reward_referrer",
        "referral_reward_referee",
        "coupon_cashback",
        "order_redemption",
        "admin_credit",
        "admin_debit",
        "signup_bonus",
      ],
      required: true,
    },
    referenceId: { type: String, required: true },
    referenceType: {
      type: String,
      enum: ["order", "coupon", "referral", "manual", "system"],
      required: true,
    },
    idempotencyKey: { type: String, required: true, unique: true },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // immutable, no updatedAt
);

export const WalletTransactionModel: Model<IWalletTransaction> =
  (mongoose.models?.WalletTransaction as Model<IWalletTransaction>) ||
  mongoose.model<IWalletTransaction>("WalletTransaction", WalletTransactionSchema);

export default WalletTransactionModel;
