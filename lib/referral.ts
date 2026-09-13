import { CustomerModel } from "@/models/Customer";
import { ReferralModel } from "@/models/Referral";
import { SiteSettingsModel, DEFAULT_WALLET_SETTINGS } from "@/models/SiteSettings";
import { creditWallet } from "./wallet";
import mongoose from "mongoose";

export function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 5);
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CTRL-${cleanName}${randomSuffix}`;
}

export async function processReferralSignup(newCustomerId: string, referralCode: string) {
  const referrer = await CustomerModel.findOne({ referralCode: referralCode.toUpperCase() });
  if (!referrer) return false;

  if (referrer._id.toString() === newCustomerId.toString()) {
    return false; // Can't refer yourself
  }

  // Check if they are already referred
  const existingReferral = await ReferralModel.findOne({ refereeId: newCustomerId });
  if (existingReferral) return false;

  await ReferralModel.create({
    referralCode: referralCode.toUpperCase(),
    referrerId: referrer._id,
    refereeId: newCustomerId,
    status: "pending",
  });

  // Also update the customer record
  await CustomerModel.findByIdAndUpdate(newCustomerId, { referredBy: referrer._id });
  return true;
}

export async function triggerReferralReward(refereeId: string, orderId: string) {
  const referral = await ReferralModel.findOne({ refereeId, status: "pending" });
  if (!referral) return false;

  const settingsDoc = await SiteSettingsModel.findOne();
  const settings = settingsDoc?.walletSettings || DEFAULT_WALLET_SETTINGS;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedReferral = await ReferralModel.findOneAndUpdate(
      { _id: referral._id, status: "pending" },
      { $set: { status: "rewarded", rewardedOrderId: orderId } },
      { new: true, session }
    );

    if (!updatedReferral) {
      throw new Error("Referral already rewarded or not found");
    }

    if (settings.referrerReward > 0) {
      await creditWallet({
        customerId: referral.referrerId.toString(),
        amount: settings.referrerReward,
        reason: "referral_reward_referrer",
        referenceId: orderId.toString(),
        referenceType: "order",
        idempotencyKey: `ref_reward_referrer_${referral._id}_order_${orderId}`,
      });
    }

    if (settings.refereeReward > 0) {
      await creditWallet({
        customerId: referral.refereeId.toString(),
        amount: settings.refereeReward,
        reason: "referral_reward_referee",
        referenceId: orderId.toString(),
        referenceType: "order",
        idempotencyKey: `ref_reward_referee_${referral._id}_order_${orderId}`,
      });
    }

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    console.error("Failed to trigger referral reward:", error);
    return false;
  } finally {
    session.endSession();
  }
}
