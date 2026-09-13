import mongoose, { Schema, Document, Model } from "mongoose";
import {
  type ISocialLink,
  type IWalletSettings,
  type IGamificationSettings,
  type IInvoiceSettings,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_WALLET_SETTINGS,
  DEFAULT_GAMIFICATION_SETTINGS,
  DEFAULT_INVOICE_SETTINGS,
} from "@/lib/settings-types";

export type {
  ISocialLink,
  IWalletSettings,
  IGamificationSettings,
  IInvoiceSettings,
};

export {
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_WALLET_SETTINGS,
  DEFAULT_GAMIFICATION_SETTINGS,
  DEFAULT_INVOICE_SETTINGS,
};

export interface ISiteSettings extends Document {
  socialLinks: ISocialLink[];
  storeAddress: string;
  contactEmail: string;
  walletSettings: IWalletSettings;
  gamificationSettings: IGamificationSettings;
  invoiceSettings: IInvoiceSettings;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    id: { type: String, required: true },
    platform: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const WalletSettingsSchema = new Schema<IWalletSettings>(
  {
    referrerReward: { type: Number, default: 50 },
    refereeReward: { type: Number, default: 25 },
    signupBonus: { type: Number, default: 0 },
    maxRedemptionPercentage: { type: Number, default: 30 },
    rewardTrigger: { type: String, enum: ["order_placed", "order_delivered"], default: "order_placed" },
  },
  { _id: false }
);

const GamificationSettingsSchema = new Schema<IGamificationSettings>(
  {
    enabled: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 1999 },
    freeGiftThreshold: { type: Number, default: 3999 },
    freeGiftTitle: { type: String, default: "Webbing Keyfob (Exclusive Gift)" },
    freeGiftHandle: { type: String, default: "webbing-keyfob-gift" },
    freeGiftImage: {
      type: String,
      default:
        "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289473/ctrl-store/products/webbing-keyfob-front.jpg",
    },
  },
  { _id: false }
);

const InvoiceSettingsSchema = new Schema<IInvoiceSettings>(
  {
    companyName: { type: String, default: "CTRL + STYLE® Retail Pvt. Ltd." },
    companyTagline: { type: String, default: "Luxury Apparel & Tactical Goods" },
    companyAddress: { type: String, default: "108 Brigade Road, Indiranagar, Bengaluru, KA 560038" },
    gstin: { type: String, default: "29AABCU9603R1ZM" },
    state: { type: String, default: "Karnataka (29)" },
    invoicePrefix: { type: String, default: "INV-" },
    gstRate: { type: Number, default: 5 },
    supportEmail: { type: String, default: "billing@ctrlstyle.com" },
    supportPhone: { type: String, default: "+91 98765 43210" },
    footerNotes: { type: String, default: "This is a computer-generated tax invoice. No signature required." },
  },
  { _id: false }
);

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    socialLinks: {
      type: [SocialLinkSchema],
      default: DEFAULT_SOCIAL_LINKS,
    },
    storeAddress: {
      type: String,
      default: "108 Brigade Road, Indiranagar, Bengaluru, KA 560038",
    },
    contactEmail: {
      type: String,
      default: "concierge@ctrlstyle.com",
    },
    walletSettings: {
      type: WalletSettingsSchema,
      default: DEFAULT_WALLET_SETTINGS,
    },
    gamificationSettings: {
      type: GamificationSettingsSchema,
      default: DEFAULT_GAMIFICATION_SETTINGS,
    },
    invoiceSettings: {
      type: InvoiceSettingsSchema,
      default: DEFAULT_INVOICE_SETTINGS,
    },
  },
  { timestamps: true }
);

// Invalidate cached model if schema was updated
if (
  mongoose.models?.SiteSettings &&
  (!mongoose.models.SiteSettings.schema.path("gamificationSettings") ||
    !mongoose.models.SiteSettings.schema.path("invoiceSettings"))
) {
  delete (mongoose.models as Record<string, unknown>).SiteSettings;
}

export const SiteSettingsModel: Model<ISiteSettings> =
  (mongoose.models?.SiteSettings as Model<ISiteSettings>) ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettingsModel;
