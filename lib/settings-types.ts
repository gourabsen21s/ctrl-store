export interface ISocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface IWalletSettings {
  referrerReward: number;
  refereeReward: number;
  signupBonus: number;
  maxRedemptionPercentage: number;
  rewardTrigger: "order_placed" | "order_delivered";
}

export interface IGamificationSettings {
  enabled: boolean;
  freeShippingThreshold: number;
  freeGiftThreshold: number;
  freeGiftTitle: string;
  freeGiftHandle: string;
  freeGiftImage: string;
}

export interface IInvoiceSettings {
  companyName: string;
  companyTagline: string;
  companyAddress: string;
  gstin: string;
  state: string;
  invoicePrefix: string;
  gstRate: number;
  supportEmail: string;
  supportPhone: string;
  footerNotes: string;
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

export const DEFAULT_WALLET_SETTINGS: IWalletSettings = {
  referrerReward: 50,
  refereeReward: 25,
  signupBonus: 0,
  maxRedemptionPercentage: 30,
  rewardTrigger: "order_placed",
};

export const DEFAULT_GAMIFICATION_SETTINGS: IGamificationSettings = {
  enabled: true,
  freeShippingThreshold: 1999,
  freeGiftThreshold: 3999,
  freeGiftTitle: "Webbing Keyfob (Exclusive Gift)",
  freeGiftHandle: "webbing-keyfob-gift",
  freeGiftImage:
    "https://res.cloudinary.com/gnjuglvy/image/upload/v1789289473/ctrl-store/products/webbing-keyfob-front.jpg",
};

export const DEFAULT_INVOICE_SETTINGS: IInvoiceSettings = {
  companyName: "CTRL + STYLE® Retail Pvt. Ltd.",
  companyTagline: "Luxury Apparel & Tactical Goods",
  companyAddress: "108 Brigade Road, Indiranagar, Bengaluru, KA 560038",
  gstin: "29AABCU9603R1ZM",
  state: "Karnataka (29)",
  invoicePrefix: "INV-",
  gstRate: 5,
  supportEmail: "billing@ctrlstyle.com",
  supportPhone: "+91 98765 43210",
  footerNotes: "This is a computer-generated tax invoice. No signature required.",
};
