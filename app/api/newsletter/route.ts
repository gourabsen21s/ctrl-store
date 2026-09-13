import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SubscriberModel from "@/models/Subscriber";
import { getAdminSession } from "@/lib/auth";
import { sendVipWelcomeEmail } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, source = "footer" } = await req.json();

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable. Please try again shortly." },
        { status: 503 }
      );
    }

    // Check if subscriber exists
    const existing = await SubscriberModel.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        await existing.save();
        return NextResponse.json({
          success: true,
          message: "Welcome back! Your VIP access has been re-activated.",
        });
      }
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You're already on the VIP Drop List. Keep an eye on your inbox.",
      });
    }

    await SubscriberModel.create({
      email: cleanEmail,
      status: "active",
      source,
    });

    // Send automated VIP welcome email via Resend
    sendVipWelcomeEmail(cleanEmail).catch((err) => {
      console.warn("Failed to dispatch VIP welcome email:", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Welcome to the VIP Drop List. You will receive private early access.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/newsletter error:", error);
    const message = error instanceof Error ? error.message : "Failed to join VIP list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    const subscribers = await SubscriberModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("GET /api/newsletter error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
