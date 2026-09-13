"use client";

import { useState } from "react";
import { type Product, money } from "@/lib/products";

export default function ShareButton({ product }: { product: Product }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const priceFormatted = money(product.price);
  const shareText = `Check out "${product.title}" (${priceFormatted}) on CTRL + STYLE`;

  const handleNativeOrToggle = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} — CTRL + STYLE`,
          text: `${shareText}\n`,
          url,
        });
        return;
      } catch {
        // Fall back to toggle menu if user cancels or share fails
      }
    }

    setOpen((prev) => !prev);
  };

  const copyToClipboard = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsAppUrl = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
  };

  const getTwitterUrl = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="relative mt-6 border-t border-current/20 pt-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-cursor
          onClick={handleNativeOrToggle}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono opacity-70 hover:opacity-100 transition-opacity"
        >
          <span>Share Product</span>
          <span aria-hidden>↗</span>
        </button>

        <button
          type="button"
          data-cursor
          onClick={copyToClipboard}
          className="text-xs uppercase tracking-wider font-mono opacity-60 hover:opacity-100 transition-opacity"
        >
          {copied ? "✓ Copied Link" : "Copy Link"}
        </button>
      </div>

      {/* Desktop Social Links Dropdown */}
      {open && (
        <div className="mt-3 flex items-center gap-3 border border-current/30 p-3 bg-cream/95 dark:bg-black/95 red:bg-red text-xs font-mono uppercase tracking-wider">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="hover:underline underline-offset-4"
          >
            WhatsApp
          </a>
          <span className="opacity-30">/</span>
          <a
            href={getTwitterUrl()}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="hover:underline underline-offset-4"
          >
            Twitter (X)
          </a>
          <span className="opacity-30">/</span>
          <button
            type="button"
            data-cursor
            onClick={copyToClipboard}
            className="hover:underline underline-offset-4 text-left"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
