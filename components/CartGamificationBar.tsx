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
  const giftTitle = gamificationSettings.freeGiftTitle || "Studio Gift";

  const maxThreshold = Math.max(shippingThreshold, giftThreshold, 1);
  const percent = Math.min(100, Math.round((subtotal / maxThreshold) * 100));

  // Clean, high-fashion editorial messaging
  let message = "";
  if (!freeShippingUnlocked) {
    const diff = shippingThreshold - subtotal;
    message = `ADD ${money(diff)} FOR COMPLIMENTARY EXPRESS DISPATCH`;
  } else if (!freeGiftUnlocked) {
    const diff = giftThreshold - subtotal;
    message = `COMPLIMENTARY SHIPPING ACTIVE — ADD ${money(diff)} FOR ${giftTitle.toUpperCase()}`;
  } else {
    message = `ALL PRIVILEGES ACTIVE — EXPRESS DISPATCH + ${giftTitle.toUpperCase()} INCLUDED`;
  }

  return (
    <div className="border border-current/20 bg-current/[0.03] p-3 sm:p-4 space-y-2.5 font-mono">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider">
        <span className="font-bold truncate mr-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
          <span className="truncate">{message}</span>
        </span>
        <span className="opacity-60 tabular-nums shrink-0">{percent}%</span>
      </div>

      {/* Sleek Hairline Progress Bar */}
      <div className="relative h-1.5 w-full bg-current/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            freeGiftUnlocked ? "bg-red" : freeShippingUnlocked ? "bg-red" : "bg-current"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Milestone Markers */}
      <div className="flex items-center justify-between pt-1 text-[10px] uppercase tracking-widest">
        <div
          className={`flex items-center gap-1.5 ${
            freeShippingUnlocked ? "text-red font-bold" : "opacity-50"
          }`}
        >
          <span>{freeShippingUnlocked ? "●" : "○"}</span>
          <span>₹{shippingThreshold.toLocaleString("en-IN")}: FREE DISPATCH</span>
        </div>

        <div
          className={`flex items-center gap-1.5 ${
            freeGiftUnlocked ? "text-red font-bold" : "opacity-50"
          }`}
        >
          <span>{freeGiftUnlocked ? "●" : "○"}</span>
          <span>₹{giftThreshold.toLocaleString("en-IN")}: {giftTitle.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
