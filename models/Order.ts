import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productHandle: string;
  productTitle: string;
  color: string;
  size: string;
  price: number;
  qty: number;
  image?: string;
}

export interface IOrder extends Document {
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    landmark?: string;
  };
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
  };
  payment: {
    gateway: "razorpay" | "sandbox";
    status: "pending" | "paid" | "failed";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: Date;
  };
  fulfillment: {
    status: "processing" | "dispatched" | "delivered" | "cancelled";
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    dispatchedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productHandle: { type: String, required: true },
  productTitle: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    shippingAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: "IN" },
      landmark: { type: String, trim: true },
    },
    items: [OrderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, required: true, min: 0 },
      discount: { type: Number, required: true, min: 0, default: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    payment: {
      gateway: { type: String, enum: ["razorpay", "sandbox"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date },
    },
    fulfillment: {
      status: { type: String, enum: ["processing", "dispatched", "delivered", "cancelled"], default: "processing" },
      courierName: { type: String, trim: true },
      trackingNumber: { type: String, trim: true },
      trackingUrl: { type: String, trim: true },
      dispatchedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-registering model upon hot reloads in development
export const OrderModel: Model<IOrder> =
  (mongoose.models?.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
