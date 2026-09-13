import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReferral extends Document {
  referralCode: string;
  referrerId: mongoose.Types.ObjectId;
  refereeId: mongoose.Types.ObjectId;
  status: "pending" | "rewarded";
  rewardedOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referralCode: { type: String, required: true },
    referrerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    refereeId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    status: { type: String, enum: ["pending", "rewarded"], default: "pending" },
    rewardedOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

// Ensure a user can only be referred once
ReferralSchema.index({ refereeId: 1 }, { unique: true });

export const ReferralModel: Model<IReferral> =
  (mongoose.models?.Referral as Model<IReferral>) || mongoose.model<IReferral>("Referral", ReferralSchema);

export default ReferralModel;
