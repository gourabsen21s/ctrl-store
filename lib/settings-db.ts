import { connectToDatabase } from "@/lib/db";
import SiteSettingsModel, {
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_GAMIFICATION_SETTINGS,
  DEFAULT_INVOICE_SETTINGS,
  type ISocialLink,
  type IGamificationSettings,
  type IInvoiceSettings,
} from "@/models/SiteSettings";

export type SiteSettingsData = {
  socialLinks: ISocialLink[];
  storeAddress: string;
  contactEmail: string;
  gamificationSettings: IGamificationSettings;
  invoiceSettings: IInvoiceSettings;
};

export const FALLBACK_SETTINGS: SiteSettingsData = {
  socialLinks: DEFAULT_SOCIAL_LINKS,
  storeAddress: "108 Brigade Road, Indiranagar, Bengaluru, KA 560038",
  contactEmail: "concierge@ctrlstyle.com",
  gamificationSettings: DEFAULT_GAMIFICATION_SETTINGS,
  invoiceSettings: DEFAULT_INVOICE_SETTINGS,
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const db = await connectToDatabase();
    if (!db) return FALLBACK_SETTINGS;

    let settings = await SiteSettingsModel.findOne().lean();
    if (!settings) {
      settings = await SiteSettingsModel.create({
        socialLinks: DEFAULT_SOCIAL_LINKS,
        storeAddress: FALLBACK_SETTINGS.storeAddress,
        contactEmail: FALLBACK_SETTINGS.contactEmail,
        gamificationSettings: DEFAULT_GAMIFICATION_SETTINGS,
        invoiceSettings: DEFAULT_INVOICE_SETTINGS,
      });
    }

    return {
      socialLinks: (settings.socialLinks || DEFAULT_SOCIAL_LINKS).map((s) => ({
        id: s.id,
        platform: s.platform,
        label: s.label,
        url: s.url,
        enabled: Boolean(s.enabled),
      })),
      storeAddress: settings.storeAddress || FALLBACK_SETTINGS.storeAddress,
      contactEmail: settings.contactEmail || FALLBACK_SETTINGS.contactEmail,
      gamificationSettings: settings.gamificationSettings || DEFAULT_GAMIFICATION_SETTINGS,
      invoiceSettings: settings.invoiceSettings || DEFAULT_INVOICE_SETTINGS,
    };
  } catch (error) {
    console.warn("Failed to fetch settings from DB, using fallback:", error);
    return FALLBACK_SETTINGS;
  }
}
