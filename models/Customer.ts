import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  defaultAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    landmark?: string;
  };
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  walletId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // Optional, in case we add OAuth later
    phone: { type: String, trim: true },
    defaultAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "IN" },
      landmark: { type: String, trim: true },
    },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "Customer" },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
  },
  {
    timestamps: true,
  }
);

export const CustomerModel: Model<ICustomer> =
  (mongoose.models?.Customer as Model<ICustomer>) ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default CustomerModel;
