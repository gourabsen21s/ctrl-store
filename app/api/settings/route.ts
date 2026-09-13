import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import SiteSettingsModel, { type ISocialLink } from "@/models/SiteSettings";
import { getSiteSettings } from "@/lib/settings-db";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { socialLinks, storeAddress, contactEmail, gamificationSettings, invoiceSettings } = body;

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected. Check MONGODB_URI." },
        { status: 503 }
      );
    }

    // Format & validate social links
    const sanitizedLinks: ISocialLink[] = Array.isArray(socialLinks)
      ? socialLinks.map((link) => ({
          id: link.id || link.platform.toLowerCase().replace(/\s+/g, "-"),
          platform: link.platform.trim(),
          label: link.label?.trim() || link.platform.trim(),
          url: link.url?.trim() || "",
          enabled: Boolean(link.enabled),
        }))
      : [];

    const updateDoc: Record<string, unknown> = {
      socialLinks: sanitizedLinks,
      ...(storeAddress !== undefined && { storeAddress: storeAddress.trim() }),
      ...(contactEmail !== undefined && { contactEmail: contactEmail.trim() }),
    };

    if (gamificationSettings) {
      updateDoc.gamificationSettings = {
        enabled: Boolean(gamificationSettings.enabled),
        freeShippingThreshold: Math.max(0, Number(gamificationSettings.freeShippingThreshold || 1999)),
        freeGiftThreshold: Math.max(0, Number(gamificationSettings.freeGiftThreshold || 3999)),
        freeGiftTitle: String(gamificationSettings.freeGiftTitle || "Webbing Keyfob (Exclusive Gift)").trim(),
        freeGiftHandle: String(gamificationSettings.freeGiftHandle || "webbing-keyfob-gift").trim(),
        freeGiftImage: String(gamificationSettings.freeGiftImage || "").trim(),
      };
    }

    if (invoiceSettings) {
      updateDoc.invoiceSettings = {
        companyName: String(invoiceSettings.companyName || "CTRL + STYLE® Retail Pvt. Ltd.").trim(),
        companyTagline: String(invoiceSettings.companyTagline || "Luxury Apparel & Tactical Goods").trim(),
        companyAddress: String(invoiceSettings.companyAddress || "108 Brigade Road, Indiranagar, Bengaluru, KA 560038").trim(),
        gstin: String(invoiceSettings.gstin || "29AABCU9603R1ZM").trim(),
        state: String(invoiceSettings.state || "Karnataka (29)").trim(),
        invoicePrefix: String(invoiceSettings.invoicePrefix || "INV-").trim(),
        gstRate: Math.max(0, Number(invoiceSettings.gstRate || 5)),
        supportEmail: String(invoiceSettings.supportEmail || "billing@ctrlstyle.com").trim(),
        supportPhone: String(invoiceSettings.supportPhone || "+91 98765 43210").trim(),
        footerNotes: String(invoiceSettings.footerNotes || "This is a computer-generated tax invoice. No signature required.").trim(),
      };
    }

    const updated = await SiteSettingsModel.findOneAndUpdate(
      {},
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: unknown) {
    console.error("PUT /api/settings error:", error);
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
