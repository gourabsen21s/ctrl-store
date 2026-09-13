"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/products";
import {
  type IInvoiceSettings,
  DEFAULT_INVOICE_SETTINGS,
} from "@/lib/settings-types";

interface InvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  invoiceSettings?: IInvoiceSettings;
}

export default function InvoiceModal({
  order,
  isOpen,
  onClose,
  invoiceSettings: initialSettings,
}: InvoiceModalProps) {
  const [settings, setSettings] = useState<IInvoiceSettings>(
    initialSettings || DEFAULT_INVOICE_SETTINGS
  );

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      return;
    }
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.invoiceSettings) {
          setSettings({ ...DEFAULT_INVOICE_SETTINGS, ...data.invoiceSettings });
        }
      })
      .catch(() => {});
  }, [initialSettings]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const prefix = settings.invoicePrefix || "INV-";
  const invoiceNumber = `${prefix}${order.orderId}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subtotal = order.pricing?.subtotal || 0;
  const discount = (order.pricing?.discount || 0) + (order.pricing?.coinsRedeemed || 0);
  const shipping = order.pricing?.shippingFee || 0;
  const total = order.pricing?.total || 0;

  // Dynamic GST computation breakdown based on admin GST rate %
  const gstRate = typeof settings.gstRate === "number" ? settings.gstRate : 5;
  const taxMultiplier = 1 + (gstRate > 0 ? gstRate / 100 : 0);
  const taxableAmount =
    gstRate > 0 ? Math.round((total / taxMultiplier) * 100) / 100 : total;
  const totalTax = Math.round((total - taxableAmount) * 100) / 100;
  const halfTax = Math.round((totalTax / 2) * 100) / 100;
  const halfRate = gstRate / 2;

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white text-black p-8 sm:p-10 shadow-2xl font-sans my-8 border border-neutral-300">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200 print:hidden">
          <span className="font-mono text-xs uppercase font-bold text-neutral-500">
            Official Tax Invoice Preview
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-black text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <span>🖨️ Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-neutral-300 px-3 py-2 text-xs font-mono hover:bg-neutral-100"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT (Printable) */}
        <div id="printable-invoice" className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-black pb-6">
            <div>
              <h1 className="text-2xl font-[900] tracking-tighter uppercase">
                {settings.companyName}
              </h1>
              {settings.companyTagline && (
                <p className="text-xs text-neutral-600 mt-1">{settings.companyTagline}</p>
              )}
              <p className="text-[11px] text-neutral-500">{settings.companyAddress}</p>
              <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                GSTIN: {settings.gstin} • State: {settings.state}
                {settings.supportEmail && ` • Email: ${settings.supportEmail}`}
              </p>
            </div>
            <div className="text-right font-mono">
              <div className="bg-black text-white px-2 py-1 text-xs font-bold uppercase inline-block">
                TAX INVOICE
              </div>
              <p className="text-xs font-bold mt-2">{invoiceNumber}</p>
              <p className="text-[11px] text-neutral-500">Date: {invoiceDate}</p>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b border-neutral-200 pb-6">
            <div>
              <p className="font-bold font-mono uppercase text-[10px] text-neutral-400 mb-1">
                Billed &amp; Shipped To:
              </p>
              <p className="font-bold text-sm">{order.customer?.name || "Customer"}</p>
              <p className="text-neutral-600">{order.customer?.email}</p>
              <p className="text-neutral-600">{order.customer?.phone}</p>
              {order.shippingAddress && (
                <p className="text-neutral-600 mt-1">
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
              )}
            </div>

            <div className="text-right font-mono space-y-1">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Order Reference</span>
                <span className="font-bold">{order.orderId}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Payment Method</span>
                <span className="uppercase font-semibold">{order.payment?.gateway || "Online"}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Fulfillment</span>
                <span className="uppercase font-semibold">{order.fulfillment?.status || "Confirmed"}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black font-mono uppercase text-[10px] text-neutral-600">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">HSN</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items?.map((item: any, i: number) => (
                  <tr key={i} className="py-2">
                    <td className="py-2.5">
                      <p className="font-bold">{item.productTitle}</p>
                      <p className="text-[10px] font-mono text-neutral-500">
                        Size: {item.size} • Color: {item.color || "Standard"}
                      </p>
                    </td>
                    <td className="py-2.5 text-center font-mono text-neutral-500">610910</td>
                    <td className="py-2.5 text-center font-mono font-bold">{item.qty}</td>
                    <td className="py-2.5 text-right font-mono">{money(item.price)}</td>
                    <td className="py-2.5 text-right font-mono font-bold">
                      {money(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="border-t-2 border-black pt-4 flex justify-between items-start">
            <div className="text-[11px] font-mono text-neutral-500 space-y-1">
              <p className="font-bold text-neutral-800">
                GST Breakdown ({gstRate}% Included in Price):
              </p>
              <p>Taxable Value: {money(taxableAmount)}</p>
              <p>CGST ({halfRate}%): {money(halfTax)}</p>
              <p>SGST ({halfRate}%): {money(halfTax)}</p>
              <p className="text-[10px] text-neutral-400 mt-2">
                {settings.footerNotes || "This is a computer-generated tax invoice. No signature required."}
              </p>
            </div>

            <div className="w-64 font-mono text-xs space-y-1.5 text-right">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal:</span>
                <span>{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discounts &amp; Coins:</span>
                  <span>−{money(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping Charges:</span>
                <span>{shipping === 0 ? "FREE" : money(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-black">
                <span>Total Paid:</span>
                <span className="tabular-nums">{money(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

