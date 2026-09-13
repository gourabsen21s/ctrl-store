import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Razorpay from "razorpay";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { PromoModel } from "@/models/Promo";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { items, customer, shippingAddress, gateway, promoCode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customer || !shippingAddress || !gateway) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify pricing securely from the database
    let subtotal = 0;
    const validatedItems = [];
    for (const item of items) {
      const product = await ProductModel.findOne({ handle: item.handle });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.title}` }, { status: 400 });
      }
      if (product.stock !== undefined && product.stock < item.qty) {
        return NextResponse.json({ error: `Insufficient stock for ${item.title}` }, { status: 400 });
      }

      subtotal += product.price * item.qty;
      validatedItems.push({
        productHandle: product.handle,
        productTitle: product.title,
        color: product.color,
        size: item.size,
        price: product.price,
        qty: item.qty,
        image: item.image,
      });
    }

    const { getCustomerSession } = await import("@/lib/auth");
    const session = await getCustomerSession();

    let discountAmount = 0;
    let appliedPromoCode = undefined;
    let coinsRedeemed = 0;
    const { coinsToRedeem } = body;

    if (promoCode) {
      const promo = await PromoModel.findOne({ code: promoCode.toUpperCase().trim() });
      if (promo && promo.active) {
        if (promo.usageLimit === 0 || promo.usageCount < promo.usageLimit) {
          appliedPromoCode = promo.code;
          if (promo.discountType === "percentage") {
            discountAmount = (subtotal * promo.discountValue) / 100;
          } else {
            discountAmount = promo.discountValue;
          }
          // Ensure discount doesn't exceed subtotal
          discountAmount = Math.min(discountAmount, subtotal);
        }
      }
    }

    let subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
    const shippingFee = subtotal >= 1999 ? 0 : 150; // Free shipping > 1999, else 150

    // Handle CTRL+ Coins redemption
    if (coinsToRedeem && coinsToRedeem > 0 && session?.customerId) {
      const { SiteSettingsModel, DEFAULT_WALLET_SETTINGS } = await import("@/models/SiteSettings");
      const { getWallet, debitWallet } = await import("@/lib/wallet");
      
      const settingsDoc = await SiteSettingsModel.findOne();
      const settings = settingsDoc?.walletSettings || DEFAULT_WALLET_SETTINGS;
      const maxRedeemAmount = Math.floor(subtotalAfterDiscount * (settings.maxRedemptionPercentage / 100));
      
      const toRedeem = Math.min(coinsToRedeem, maxRedeemAmount);

      if (toRedeem > 0) {
        // Idempotency key per user per checkout attempt
        const idempotencyKey = `checkout_${session.customerId}_${Date.now()}`;
        try {
          await debitWallet({
            customerId: session.customerId,
            amount: toRedeem,
            reason: "order_redemption",
            referenceId: "pending_order", // Will link orderId later
            referenceType: "order",
            idempotencyKey,
          });
          coinsRedeemed = toRedeem;
        } catch (error) {
          console.error("Wallet debit failed during checkout:", error);
          return NextResponse.json({ error: "Failed to redeem coins or insufficient balance" }, { status: 400 });
        }
      }
    }

    const total = Math.max(0, subtotalAfterDiscount - coinsRedeemed) + shippingFee;

    // Generate unique order ID
    const orderId = `CTRL-${uuidv4().substring(0, 8).toUpperCase()}`;

    let razorpayOrderId = undefined;

    // Handle payment gateway logic
    if (gateway === "razorpay") {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return NextResponse.json(
          { error: "Razorpay is not configured on this server." },
          { status: 500 }
        );
      }

      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(total * 100), // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: orderId,
      };

      try {
        const rzpOrder = await rzp.orders.create(options);
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.error("Razorpay order creation failed", err);
        return NextResponse.json(
          { error: "Payment gateway error. Please try again." },
          { status: 500 }
        );
      }
    }

    // Create Order Document
    const order = await OrderModel.create({
      orderId,
      customerId: session?.customerId || undefined,
      customer,
      shippingAddress,
      items: validatedItems,
      pricing: {
        subtotal,
        shippingFee,
        discount: discountAmount,
        promoCode: appliedPromoCode,
        coinsRedeemed,
        total,
      },
      payment: {
        gateway,
        status: "pending",
        razorpayOrderId,
      },
      fulfillment: {
        status: "processing",
      },
    });

    // Update WalletTransaction with the real orderId
    if (coinsRedeemed > 0 && session?.customerId) {
      const { WalletTransactionModel } = await import("@/models/WalletTransaction");
      await WalletTransactionModel.findOneAndUpdate(
        { 
          customerId: session.customerId, 
          reason: "order_redemption",
          referenceId: "pending_order" 
        },
        { $set: { referenceId: orderId } },
        { sort: { createdAt: -1 } }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      razorpayOrderId,
      amount: total,
      currency: "INR",
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
