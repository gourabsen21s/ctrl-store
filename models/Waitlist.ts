import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWaitlist extends Document {
  email: string;
  productHandle: string;
  productTitle: string;
  notified: boolean;
  createdAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    productHandle: { type: String, required: true, trim: true },
    productTitle: { type: String, required: true },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate entries for the same product and email
WaitlistSchema.index({ email: 1, productHandle: 1 }, { unique: true });

export const WaitlistModel: Model<IWaitlist> =
  (mongoose.models?.Waitlist as Model<IWaitlist>) ||
  mongoose.model<IWaitlist>("Waitlist", WaitlistSchema);

export default WaitlistModel;
