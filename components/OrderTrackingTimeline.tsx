"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/products";

interface OrderTrackingTimelineProps {
  order: any;
}

export default function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { customer, shippingAddress, items, pricing, payment, fulfillment } = order;
  const status = fulfillment?.status || "processing";
  const isCancelled = status === "cancelled";

  // Stages configuration
  // 0: Confirmed, 1: Packed, 2: Dispatched, 3: Delivered
  const getStageIndex = () => {
    switch (status) {
      case "delivered":
        return 3;
      case "dispatched":
        return 2;
      case "packed":
        return 1;
      case "processing":
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex();

  const stages = [
    {
      id: "confirmed",
      title: "Order Confirmed",
      subtitle: "Payment verified & registered",
      time: order.createdAt
        ? new Date(order.createdAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      icon: "✓",
    },
    {
      id: "packed",
      title: "Packed & Quality Checked",
      subtitle: "Inspected & sealed in signature CTRL+ box",
      time: fulfillment.packedAt
        ? new Date(fulfillment.packedAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      icon: "📦",
    },
    {
      id: "dispatched",
      title: "Dispatched / In Transit",
      subtitle: fulfillment.courierName
        ? `Handed to ${fulfillment.courierName}`
        : "Dispatched with express courier",
      time: fulfillment.dispatchedAt
        ? new Date(fulfillment.dispatchedAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      icon: "🚚",
    },
    {
      id: "delivered",
      title: "Delivered",
      subtitle: "Package delivered to shipping address",
      time: fulfillment.deliveredAt
        ? new Date(fulfillment.deliveredAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      icon: "✨",
    },
  ];

  const handleCopyTracking = () => {
    if (!fulfillment.trackingNumber) return;
    navigator.clipboard.writeText(fulfillment.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="mx-auto mt-28 mb-32 max-w-5xl px-4 lg:px-6">
      {/* Header Banner */}
      <div className="mb-10 border-b border-current/20 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest opacity-60">
              <span
                className={`h-2 w-2 rounded-full ${
                  isCancelled
                    ? "bg-red"
                    : status === "delivered"
                    ? "bg-emerald-500"
                    : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>Live Order Tracking</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-[900] tracking-tighter uppercase leading-tight">
              Order #{order.orderId}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-cursor
              onClick={handleCopyLink}
              className="border border-current/30 px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-current/10 transition-colors"
            >
              {copiedLink ? "✓ Link Copied" : "Copy Tracking Link"}
            </button>
            <Link
              href="/store"
              data-cursor
              className="border border-current/30 px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-current/10 transition-colors"
            >
              Shop More →
            </Link>
          </div>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled ? (
        <div className="mb-12 border border-red/40 bg-red/10 p-6 text-red font-mono">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-1">
            <span>✕ Order Cancelled</span>
          </div>
          <p className="text-xs opacity-80">
            This order has been cancelled. If payment was deducted, a refund has been initiated to your original payment method.
          </p>
        </div>
      ) : (
        /* Visual Progress Timeline */
        <div className="mb-16 border border-current/15 bg-current/5 p-6 md:p-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-current/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-50 block mb-0.5">
                Current Status
              </span>
              <span className="text-lg sm:text-xl font-[900] tracking-tight uppercase">
                {status === "processing" && "Order Confirmed — Being Prepared"}
                {status === "packed" && "Packed & Ready for Dispatch"}
                {status === "dispatched" && "In Transit with Courier Partner"}
                {status === "delivered" && "Delivered Successfully"}
              </span>
            </div>
            <span
              className={`px-3 py-1 font-mono text-xs uppercase tracking-wider font-bold ${
                status === "delivered"
                  ? "bg-emerald-500/20 text-emerald-500"
                  : status === "dispatched"
                  ? "bg-purple-500/20 text-purple-400"
                  : status === "packed"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-amber-500/20 text-amber-500"
              }`}
            >
              {status}
            </span>
          </div>

          {/* Desktop & Mobile Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {stages.map((stage, idx) => {
              const isPassed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.id} className="relative flex flex-row md:flex-col items-start gap-4">
                  {/* Connecting Line (Desktop) */}
                  {idx < stages.length - 1 && (
                    <div
                      aria-hidden
                      className={`hidden md:block absolute top-5 left-10 right-[-50%] h-[2px] z-0 transition-colors ${
                        idx < currentStageIndex ? "bg-emerald-500" : "bg-current/15"
                      }`}
                    />
                  )}

                  {/* Icon Node */}
                  <div
                    className={`relative z-10 h-10 w-10 shrink-0 flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                      isPassed
                        ? isCurrent && status !== "delivered"
                          ? "border-emerald-500 bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                          : "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                        : "border-current/20 bg-current/5 opacity-40 text-current"
                    }`}
                  >
                    {isPassed ? (idx === 0 ? "✓" : stage.icon) : idx + 1}
                  </div>

                  {/* Stage Text */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-[900] uppercase tracking-wider ${
                          isPassed ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        {stage.title}
                      </span>
                      {isCurrent && status !== "delivered" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono opacity-60 leading-tight mt-0.5">
                      {stage.subtitle}
                    </span>
                    {stage.time && (
                      <span className="text-[10px] font-mono opacity-40 mt-1 uppercase tracking-wide">
                        {stage.time}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Courier Details Card (When Dispatched or Delivered) */}
          {(status === "dispatched" || status === "delivered") && (
            <div className="mt-10 pt-6 border-t border-current/15">
              <div className="bg-current/5 border border-current/20 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest opacity-50">
                      Courier Partner:
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {fulfillment.courierName || "Express Air Logistics"}
                    </span>
                  </div>
                  {fulfillment.trackingNumber && (
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="opacity-50 uppercase tracking-widest">Tracking #:</span>
                      <span className="font-bold underline tracking-wider">
                        {fulfillment.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyTracking}
                        className="ml-2 border border-current/30 px-2 py-0.5 text-[10px] uppercase hover:bg-current/10"
                      >
                        {copiedTracking ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>

                {fulfillment.trackingUrl && (
                  <a
                    href={fulfillment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor
                    className="inline-flex items-center justify-center gap-2 bg-black text-cream dark:bg-cream dark:text-black red:bg-red red:text-cream px-5 py-2.5 text-xs font-[900] uppercase tracking-widest hover:opacity-90 transition-opacity shrink-0"
                  >
                    <span>Track on Courier Site</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Info & Receipt Grid */}
      <div className="grid gap-12 lg:grid-cols-16">
        {/* Left: Customer & Address Information */}
        <div className="lg:col-span-7 space-y-10">
          <div>
            <h2 className="text-lg font-[900] tracking-tighter uppercase mb-4 pb-2 border-b border-current/20">
              Delivery Destination
            </h2>
            <div className="font-mono text-xs uppercase tracking-wider space-y-1.5 opacity-80 leading-relaxed">
              <p className="font-bold text-sm text-current">{customer.name}</p>
              <p>{shippingAddress.street}</p>
              {shippingAddress.landmark && <p>Near {shippingAddress.landmark}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
              <div className="pt-2 text-[11px] opacity-60">
                <p>Contact: {customer.phone}</p>
                <p className="lowercase">{customer.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-[900] tracking-tighter uppercase mb-4 pb-2 border-b border-current/20">
              Payment Information
            </h2>
            <div className="font-mono text-xs uppercase tracking-wider space-y-2 opacity-80">
              <div className="flex items-center justify-between">
                <span>Method:</span>
                <span className="font-bold">{payment.gateway === "razorpay" ? "Razorpay Secure" : "Prepaid"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span
                  className={`px-2 py-0.5 font-bold ${
                    payment.status === "paid"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-amber-500/20 text-amber-500"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
              {payment.paidAt && (
                <div className="flex items-center justify-between text-[10px] opacity-60">
                  <span>Paid At:</span>
                  <span>{new Date(payment.paidAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Items Receipt */}
        <div className="lg:col-span-9 bg-current/5 border border-current/15 p-6 md:p-8">
          <h2 className="text-lg font-[900] tracking-tighter uppercase mb-6 pb-2 border-b border-current/20">
            Package Receipt ({items.length} {items.length === 1 ? "Item" : "Items"})
          </h2>

          <ul className="divide-y divide-current/10 mb-6">
            {items.map((item: any, idx: number) => (
              <li key={`${item.productHandle}-${item.size}-${idx}`} className="py-4 flex gap-4">
                <div className="relative h-20 w-16 shrink-0 bg-current/10 border border-current/15 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs opacity-40">
                      IMG
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between font-mono text-xs">
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">{item.productTitle}</h3>
                    <div className="opacity-60 text-[11px] uppercase tracking-wider mt-0.5">
                      <span>Size: {item.size}</span>
                      <span className="mx-2">•</span>
                      <span>Color: {item.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="opacity-50">QTY: {item.qty}</span>
                    <span className="font-bold">{money(item.price * item.qty)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pricing Totals */}
          <div className="border-t border-current/20 pt-4 font-mono text-xs uppercase tracking-wider space-y-2">
            <div className="flex justify-between opacity-70">
              <span>Subtotal</span>
              <span>{money(pricing.subtotal)}</span>
            </div>

            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-500 font-bold">
                <span>Promo Discount {pricing.promoCode ? `(${pricing.promoCode})` : ""}</span>
                <span>−{money(pricing.discount)}</span>
              </div>
            )}

            {pricing.coinsRedeemed > 0 && (
              <div className="flex justify-between text-emerald-500 font-bold">
                <span>CTRL+ Coins Redeemed</span>
                <span>−{money(pricing.coinsRedeemed)}</span>
              </div>
            )}

            <div className="flex justify-between opacity-70">
              <span>Shipping</span>
              <span>{pricing.shippingFee === 0 ? "FREE" : money(pricing.shippingFee)}</span>
            </div>

            <div className="flex justify-between text-base font-[900] tracking-tight border-t border-current/20 pt-3 text-current">
              <span>Total Paid</span>
              <span>{money(pricing.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
