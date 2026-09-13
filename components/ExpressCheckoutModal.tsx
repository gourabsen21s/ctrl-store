"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type Product, money, imageFor } from "@/lib/products";

interface ExpressCheckoutModalProps {
  product: Product;
  selectedSize: string;
  qty: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpressCheckoutModal({
  product,
  selectedSize,
  qty,
  isOpen,
  onClose,
}: ExpressCheckoutModalProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [gateway, setGateway] = useState<"upi" | "cod" | "card">("upi");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coin redemption
  const [availableCoins, setAvailableCoins] = useState(0);
  const [redeemCoins, setRedeemCoins] = useState(false);

  // Load customer details & coins if logged in or from localStorage
  useEffect(() => {
    if (!isOpen) return;

    // Check localStorage cached address
    try {
      const cached = localStorage.getItem("ctrl_saved_shipping");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.street) setStreet(parsed.street);
        if (parsed.city) setCity(parsed.city);
        if (parsed.state) setState(parsed.state);
        if (parsed.postalCode) setPostalCode(parsed.postalCode);
      }
    } catch {
      /* ignore */
    }

    // Fetch user details & wallet if logged in
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.name) setName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
          if (data.user.defaultAddress) {
            setStreet(data.user.defaultAddress.street || "");
            setCity(data.user.defaultAddress.city || "");
            setState(data.user.defaultAddress.state || "");
            setPostalCode(data.user.defaultAddress.postalCode || "");
          }
        }
      })
      .catch(() => {});

    fetch("/api/wallet/balance")
      .then((res) => res.json())
      .then((data) => {
        if (data.balance) setAvailableCoins(data.balance);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = product.price * qty;
  const shippingFee = subtotal >= 1999 ? 0 : 150;
  const coinDiscount = redeemCoins ? Math.min(availableCoins, subtotal) : 0;
  const total = Math.max(0, subtotal + shippingFee - coinDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Cache shipping address for future 1-click purchases
    try {
      localStorage.setItem(
        "ctrl_saved_shipping",
        JSON.stringify({ name, email, phone, street, city, state, postalCode })
      );
    } catch {
      /* ignore */
    }

    try {
      const payload = {
        items: [
          {
            handle: product.handle,
            title: product.title,
            size: selectedSize,
            qty,
            image: imageFor(product, "front"),
            price: product.price,
          },
        ],
        customer: {
          name,
          email,
          phone,
        },
        shippingAddress: {
          street,
          city,
          state,
          postalCode,
          country: "India",
        },
        gateway,
        coinsToRedeem: redeemCoins ? coinDiscount : 0,
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order creation failed");
      }

      onClose();
      // Redirect to the live tracking page immediately
      router.push(`/order/${data.orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg border border-white/20 bg-[#121212] p-6 sm:p-8 text-white shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">⚡</span>
            <h2 className="text-base font-mono font-bold uppercase tracking-wider text-white">
              1-Click Express Checkout
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white font-mono text-base"
          >
            ✕
          </button>
        </div>

        {/* Product preview line */}
        <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-3 mb-6">
          <div className="relative h-14 w-12 shrink-0 bg-white/5 border border-white/10 overflow-hidden">
            <Image
              src={imageFor(product, "front")}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{product.title}</p>
            <p className="text-[11px] font-mono text-white/60">
              Size: {selectedSize} • Qty: {qty}
            </p>
          </div>
          <div className="text-right font-mono font-bold text-sm tabular-nums">
            {money(product.price * qty)}
          </div>
        </div>

        {error && (
          <div className="mb-5 border border-red-500/40 bg-red-500/10 p-3 text-xs font-mono text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gourab Sen"
                className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
              Email Address (for Receipt &amp; Tracking) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gourab@example.com"
              className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
              Delivery Address (Street &amp; House No.) *
            </label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="108 Brigade Road, Apt 4B"
              className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full border border-white/20 bg-black/60 px-2.5 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="KA"
                className="w-full border border-white/20 bg-black/60 px-2.5 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/60 mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="560038"
                className="w-full border border-white/20 bg-black/60 px-2.5 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Coin redemption option */}
          {availableCoins > 0 && (
            <div className="flex items-center justify-between border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">🪙</span>
                <span className="text-xs font-mono text-amber-200">
                  Use {Math.min(availableCoins, subtotal)} CTRL+ Coins (Save {money(Math.min(availableCoins, subtotal))})
                </span>
              </div>
              <input
                type="checkbox"
                checked={redeemCoins}
                onChange={(e) => setRedeemCoins(e.target.checked)}
                className="h-4 w-4 accent-amber-400 cursor-pointer"
              />
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGateway("upi")}
                className={`border py-2 text-xs font-mono uppercase text-center transition-all ${
                  gateway === "upi"
                    ? "border-white bg-white text-black font-bold"
                    : "border-white/20 bg-black/40 text-white/70 hover:border-white/40"
                }`}
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setGateway("card")}
                className={`border py-2 text-xs font-mono uppercase text-center transition-all ${
                  gateway === "card"
                    ? "border-white bg-white text-black font-bold"
                    : "border-white/20 bg-black/40 text-white/70 hover:border-white/40"
                }`}
              >
                Card / NetBanking
              </button>
              <button
                type="button"
                onClick={() => setGateway("cod")}
                className={`border py-2 text-xs font-mono uppercase text-center transition-all ${
                  gateway === "cod"
                    ? "border-white bg-white text-black font-bold"
                    : "border-white/20 bg-black/40 text-white/70 hover:border-white/40"
                }`}
              >
                Cash on Delivery
              </button>
            </div>
          </div>

          {/* Order pricing summary */}
          <div className="border-t border-white/10 pt-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "FREE" : money(shippingFee)}</span>
            </div>
            {coinDiscount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Coin Discount</span>
                <span>−{money(coinDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/10">
              <span>Total Payable</span>
              <span className="tabular-nums text-base">{money(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 shadow-xl mt-4"
          >
            {loading ? "Authorizing Order..." : `Confirm & Place Order (${money(total)}) →`}
          </button>
        </form>
      </div>
    </div>
  );
}
