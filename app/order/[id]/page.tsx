import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Track Order #${id} — CTRL+®`,
    description: `Real-time tracking and delivery status for Order #${id}.`,
  };
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();
  const order = await OrderModel.findOne({ orderId: id }).lean();

  if (!order) {
    notFound();
  }

  // Convert MongoDB ObjectId and Dates to plain JSON-safe format
  const serializedOrder = JSON.parse(JSON.stringify(order));

  return (
    <main id="page" data-page="order-tracking">
      <OrderTrackingTimeline order={serializedOrder} />
      <Footer />
    </main>
  );
}
