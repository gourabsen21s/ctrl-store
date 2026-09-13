import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  productHandle: string;
  productTitle: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: "approved" | "pending" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productHandle: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    productTitle: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      default: "Verified Customer",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    verifiedPurchase: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ReviewModel: Model<IReview> =
  (mongoose.models?.Review as Model<IReview>) ||
  mongoose.model<IReview>("Review", ReviewSchema);

export default ReviewModel;
