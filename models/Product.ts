import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  handle: string;
  title: string;
  price: number;
  category: string;
  color: string;
  sizes: string[];
  aspect: "large" | "small" | "square" | "natural";
  description: string;
  stock?: number;
  frontImage?: string;
  backImage?: string;
  dropDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    sizes: {
      type: [String],
      default: ["One size"],
    },
    aspect: {
      type: String,
      enum: ["large", "small", "square", "natural"],
      default: "large",
    },
    description: {
      type: String,
      default: "",
    },
    frontImage: {
      type: String,
      trim: true,
    },
    backImage: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 15,
      min: 0,
    },
    dropDate: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// In development, invalidate cached model if schema was updated with dropDate
if (mongoose.models?.Product && !mongoose.models.Product.schema.path("dropDate")) {
  delete (mongoose.models as Record<string, unknown>).Product;
}

export const ProductModel: Model<IProduct> =
  (mongoose.models?.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;
