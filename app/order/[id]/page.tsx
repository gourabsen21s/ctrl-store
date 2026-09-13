import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { money } from "@/lib/products";

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

  const { customer, shippingAddress, items, pricing, fulfillment } = order;

  return (
    <div className="mx-auto mt-28 mb-32 max-w-4xl px-4 lg:px-6">
      <div className="mb-12 border-b border-current/20 pb-12 text-center">
        <h1 className="mb-4 text-4xl font-[900] tracking-tighter uppercase md:text-6xl">
          Order Confirmed
        </h1>
        <p className="font-bold uppercase tracking-widest opacity-60">
          Order #{order.orderId}
        </p>
      </div>

      <div className="grid gap-16 md:grid-cols-2">
        {/* Order Details */}
        <div>
          <h2 className="mb-6 text-2xl font-[900] tracking-tighter uppercase">Order Status</h2>
          <div className="mb-12 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">✓</div>
              <div className="font-bold uppercase tracking-wider text-sm">Order Placed</div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${fulfillment.status === "processing" ? "bg-current/10" : "bg-green-500 text-white"}`}>
                {fulfillment.status !== "processing" ? "✓" : "2"}
              </div>
              <div className={`font-bold uppercase tracking-wider text-sm ${fulfillment.status === "processing" ? "opacity-60" : ""}`}>Processing</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-current/10 opacity-30">
                3
              </div>
              <div className="font-bold uppercase tracking-wider text-sm opacity-30">Dispatched</div>
            </div>
          </div>

          <h2 className="mb-6 text-2xl font-[900] tracking-tighter uppercase">Customer Details</h2>
          <div className="mb-8 space-y-2 text-sm font-bold uppercase tracking-widest opacity-80">
            <p>{customer.name}</p>
            <p className="lowercase normal-case">{customer.email}</p>
            <p>{customer.phone}</p>
          </div>

          <h2 className="mb-6 text-2xl font-[900] tracking-tighter uppercase">Shipping Address</h2>
          <div className="space-y-1 text-sm font-bold uppercase tracking-widest opacity-80">
            <p>{shippingAddress.street}</p>
            {shippingAddress.landmark && <p>{shippingAddress.landmark}</p>}
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
            <p>{shippingAddress.country}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-current/5 p-8">
          <h2 className="mb-8 text-2xl font-[900] tracking-tighter uppercase">Receipt</h2>
          <ul className="mb-8 space-y-6 border-b border-current/20 pb-8">
            {items.map((item: any) => (
              <li key={`${item.productHandle}-${item.size}`} className="flex gap-4">
                <div className="relative h-20 w-16 shrink-0">
                  <Image src={item.image || ""} alt={item.productTitle} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <div className="flex justify-between font-bold text-sm">
                    <span>{item.productTitle}</span>
                    <span>{money(item.price * item.qty)}</span>
                  </div>
                  <div className="text-xs uppercase tracking-widest opacity-60">
                    {item.size} · {item.color} · Qty {item.qty}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-4 text-sm font-bold uppercase tracking-widest">
            <div className="flex justify-between">
              <span className="opacity-60">Subtotal</span>
              <span>{money(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Shipping</span>
              <span>{pricing.shippingFee === 0 ? "Free" : money(pricing.shippingFee)}</span>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between border-t border-current/20 pt-8 text-xl font-[900] tracking-tighter">
            <span>Total Paid</span>
            <span>{money(pricing.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center">
        <Link
          href="/"
          data-cursor
          className="inline-block text-xl font-bold uppercase tracking-widest underline underline-offset-8"
        >
          Continue Shopping <span aria-hidden>↗</span>
        </Link>
      </div>
    </div>
  );
}
