import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWallet extends Document {
  customerId: mongoose.Types.ObjectId;
  balance: number;
  lifetimeEarned: number;
  version: number; // for optimistic locking
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    lifetimeEarned: { type: Number, default: 0, min: 0 },
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WalletModel: Model<IWallet> =
  (mongoose.models?.Wallet as Model<IWallet>) || mongoose.model<IWallet>("Wallet", WalletSchema);

export default WalletModel;
