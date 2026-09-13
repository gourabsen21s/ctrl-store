"use client";

import { useBag } from "@/components/providers/BagProvider";
import { money } from "@/lib/products";

export default function CartGamificationBar() {
  const { subtotal, freeShippingUnlocked, freeGiftUnlocked, gamificationSettings } = useBag();

  // If disabled by the admin in Admin Panel, do not render the bar
  if (!gamificationSettings || !gamificationSettings.enabled) {
    return null;
  }

  const shippingThreshold = gamificationSettings.freeShippingThreshold ?? 1999;
  const giftThreshold = gamificationSettings.freeGiftThreshold ?? 3999;
  const giftTitle = gamificationSettings.freeGiftTitle || "Gift";

  const maxThreshold = Math.max(shippingThreshold, giftThreshold, 1);
  const percent = Math.min(100, Math.round((subtotal / maxThreshold) * 100));

  // Determine current messaging
  let message = "";
  if (!freeShippingUnlocked) {
    const diff = shippingThreshold - subtotal;
    message = `Add ${money(diff)} more for FREE Express Shipping 🚚`;
  } else if (!freeGiftUnlocked) {
    const diff = giftThreshold - subtotal;
    message = `🎉 Free Shipping unlocked! Add ${money(diff)} for a FREE ${giftTitle} 🎁`;
  } else {
    message = `🔥 ALL REWARDS UNLOCKED! Free Shipping + Free ${giftTitle} in Bag!`;
  }

  return (
    <div className="border border-current/15 bg-current/[0.03] p-3.5 sm:p-4 rounded-none space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
        <span className="font-bold flex items-center gap-1.5 truncate mr-2">
          <span className="text-amber-500 flex-shrink-0">⚡</span>
          <span className="truncate">{message}</span>
        </span>
        <span className="opacity-60 tabular-nums flex-shrink-0">{percent}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-2 w-full bg-current/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            freeGiftUnlocked
              ? "bg-gradient-to-r from-amber-400 to-emerald-400"
              : freeShippingUnlocked
              ? "bg-amber-400"
              : "bg-current"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Milestone Badges */}
      <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
        <div
          className={`flex items-center gap-1 transition-colors ${
            freeShippingUnlocked ? "text-emerald-500 font-bold" : "opacity-60"
          }`}
        >
          <span>{freeShippingUnlocked ? "✓" : "○"}</span>
          <span>₹{shippingThreshold.toLocaleString("en-IN")}: Free Shipping</span>
        </div>

        <div
          className={`flex items-center gap-1 transition-colors ${
            freeGiftUnlocked ? "text-emerald-500 font-bold" : "opacity-60"
          }`}
        >
          <span>{freeGiftUnlocked ? "✓" : "○"}</span>
          <span>₹{giftThreshold.toLocaleString("en-IN")}: Free {giftTitle}</span>
        </div>
      </div>
    </div>
  );
}

