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
    const { socialLinks, storeAddress, contactEmail } = body;

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

    const updated = await SiteSettingsModel.findOneAndUpdate(
      {},
      {
        $set: {
          socialLinks: sanitizedLinks,
          ...(storeAddress !== undefined && { storeAddress: storeAddress.trim() }),
          ...(contactEmail !== undefined && { contactEmail: contactEmail.trim() }),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      settings: {
        socialLinks: updated.socialLinks,
        storeAddress: updated.storeAddress,
        contactEmail: updated.contactEmail,
      },
    });
  } catch (error: unknown) {
    console.error("PUT /api/settings error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
