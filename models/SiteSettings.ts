import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface ISiteSettings extends Document {
  socialLinks: ISocialLink[];
  storeAddress: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SOCIAL_LINKS: ISocialLink[] = [
  {
    id: "instagram",
    platform: "Instagram",
    label: "Instagram",
    url: "https://instagram.com/ctrlstyle",
    enabled: true,
  },
  {
    id: "twitter",
    platform: "Twitter (X)",
    label: "Twitter (X)",
    url: "https://x.com/ctrlstyle",
    enabled: true,
  },
  {
    id: "whatsapp",
    platform: "WhatsApp",
    label: "WhatsApp",
    url: "https://wa.me/919876543210",
    enabled: true,
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    label: "LinkedIn",
    url: "https://linkedin.com/company/ctrlstyle",
    enabled: true,
  },
  {
    id: "youtube",
    platform: "YouTube",
    label: "YouTube",
    url: "https://youtube.com/@ctrlstyle",
    enabled: false,
  },
];

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
  },
  { timestamps: true }
);

export const SiteSettingsModel: Model<ISiteSettings> =
  (mongoose.models?.SiteSettings as Model<ISiteSettings>) ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettingsModel;
