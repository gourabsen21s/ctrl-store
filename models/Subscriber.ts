import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  status: "active" | "unsubscribed";
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    source: {
      type: String,
      default: "storefront",
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriberModel: Model<ISubscriber> =
  (mongoose.models?.Subscriber as Model<ISubscriber>) ||
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);

export default SubscriberModel;
