import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { PromoModel } from "@/models/Promo";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, gateway } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment.status === "paid") {
      return NextResponse.json({ success: true, message: "Order is already paid" });
    }

    if (gateway === "razorpay") {
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return NextResponse.json({ error: "Missing Razorpay verification details" }, { status: 400 });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
      }

      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        order.payment.status = "failed";
        await order.save();
        return NextResponse.json({ error: "Payment verification failed: Invalid signature" }, { status: 400 });
      }

      order.payment.razorpayPaymentId = razorpayPaymentId;
      order.payment.razorpaySignature = razorpaySignature;
    } else if (gateway === "sandbox") {
      // For sandbox mode, just approve it
      if (order.payment.gateway !== "sandbox") {
         return NextResponse.json({ error: "Order was not created for sandbox" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });
    }

    // Update Order Status
    order.payment.status = "paid";
    order.payment.paidAt = new Date();
    await order.save();

    // Decrement inventory securely
    for (const item of order.items) {
      await ProductModel.findOneAndUpdate(
        { handle: item.productHandle },
        { $inc: { stock: -item.qty } }
      );
    }

    // Increment promo usage and give cashback if applicable
    if (order.pricing?.promoCode) {
      const promo = await PromoModel.findOneAndUpdate(
        { code: order.pricing.promoCode },
        { $inc: { usageCount: 1 } },
        { new: true } // get the updated doc
      );

      // Trigger coupon cashback
      if (promo && promo.cashbackCoins > 0 && order.customerId) {
        const { creditWallet } = await import("@/lib/wallet");
        try {
          await creditWallet({
            customerId: order.customerId.toString(),
            amount: promo.cashbackCoins,
            reason: "coupon_cashback",
            referenceId: promo.code,
            referenceType: "coupon",
            idempotencyKey: `cashback_${order.orderId}`,
          });
        } catch (err) {
          console.error("Failed to credit cashback for order:", order.orderId, err);
        }
      }
    }

    // Trigger referral reward
    if (order.customerId) {
      const { triggerReferralReward } = await import("@/lib/referral");
      try {
        await triggerReferralReward(order.customerId.toString(), order.orderId);
      } catch (err) {
        console.error("Failed to trigger referral reward for order:", order.orderId, err);
      }
    }

    // Send confirmation email asynchronously (do not await to speed up response)
    try {
      sendOrderConfirmationEmail(order).catch(console.error);
    } catch (e) {
      console.error("Failed to trigger order confirmation email", e);
    }

    return NextResponse.json({ success: true, orderId: order.orderId });
  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
