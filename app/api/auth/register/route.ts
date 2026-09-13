import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { CustomerModel } from "@/models/Customer";
import { signCustomerToken, setCustomerSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, referralCode: usedReferralCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existingCustomer = await CustomerModel.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { generateReferralCode, processReferralSignup } = await import("@/lib/referral");
    const { getWallet, creditWallet } = await import("@/lib/wallet");
    const { SiteSettingsModel, DEFAULT_WALLET_SETTINGS } = await import("@/models/SiteSettings");

    const newReferralCode = generateReferralCode(name);

    const customer = await CustomerModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      referralCode: newReferralCode,
    });

    const wallet = await getWallet(customer._id.toString());
    
    // Update customer with walletId
    customer.walletId = wallet._id;
    await customer.save();

    if (usedReferralCode) {
      await processReferralSignup(customer._id.toString(), usedReferralCode);
    }

    // Check for signup bonus
    const settingsDoc = await SiteSettingsModel.findOne();
    const settings = settingsDoc?.walletSettings || DEFAULT_WALLET_SETTINGS;
    if (settings.signupBonus > 0) {
      await creditWallet({
        customerId: customer._id.toString(),
        amount: settings.signupBonus,
        reason: "signup_bonus",
        referenceId: customer._id.toString(),
        referenceType: "system",
        idempotencyKey: `signup_bonus_${customer._id}`,
      });
    }

    const token = await signCustomerToken({
      customerId: customer._id.toString(),
      email: customer.email,
      name: customer.name,
    });
    
    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      customer: { id: customer._id, name: customer.name, email: customer.email, referralCode: customer.referralCode },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
