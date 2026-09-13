import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Razorpay from "razorpay";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { items, customer, shippingAddress, gateway } = body;

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

    const shippingFee = subtotal >= 1999 ? 0 : 150; // Free shipping > 1999, else 150
    const total = subtotal + shippingFee;

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
      customer,
      shippingAddress,
      items: validatedItems,
      pricing: {
        subtotal,
        shippingFee,
        discount: 0,
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
