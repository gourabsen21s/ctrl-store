"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useBag } from "@/components/providers/BagProvider";
import { money } from "@/lib/products";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clearBag } = useBag();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gateway, setGateway] = useState<"razorpay" | "sandbox">("sandbox");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discountAmount: number} | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Wallet state
  const [wallet, setWallet] = useState<any>(null);
  const [coinsInput, setCoinsInput] = useState("");
  const [appliedCoins, setAppliedCoins] = useState(0);
  const [coinsError, setCoinsError] = useState("");
  const [coinsLoading, setCoinsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setForm(prev => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            street: data.user.defaultAddress?.street || "",
            landmark: data.user.defaultAddress?.landmark || "",
            city: data.user.defaultAddress?.city || "",
            state: data.user.defaultAddress?.state || "",
            postalCode: data.user.defaultAddress?.postalCode || "",
          }));

          // Fetch wallet if logged in
          fetch("/api/wallet")
            .then(res => res.json())
            .then(wData => {
              if (wData.success) {
                setWallet(wData.wallet);
              }
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  const discount = appliedPromo?.discountAmount || 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const shippingFee = subtotal >= 1999 ? 0 : 150;
  const total = Math.max(0, subtotalAfterDiscount - appliedCoins) + shippingFee;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/checkout/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid promo code");
      setAppliedPromo({ code: data.promo.code, discountAmount: data.promo.discountAmount });
      setPromoInput("");
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    setAppliedCoins(0); // Removing promo might change max redeem, so reset coins
  };

  const handleApplyCoins = async () => {
    if (!coinsInput.trim()) return;
    const coinsToRedeem = parseInt(coinsInput, 10);
    if (isNaN(coinsToRedeem) || coinsToRedeem <= 0) return;

    setCoinsLoading(true);
    setCoinsError("");
    try {
      const res = await fetch("/api/wallet/validate-redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtotalAfterDiscount, coinsToRedeem }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to validate coins");
      
      if (data.validAmount > 0) {
        setAppliedCoins(data.validAmount);
        setCoinsInput("");
      } else {
        throw new Error(`Max allowed coins: ${data.maxAllowed}`);
      }
    } catch (err: any) {
      setCoinsError(err.message);
    } finally {
      setCoinsLoading(false);
    }
  };

  const removeCoins = () => {
    setAppliedCoins(0);
    setCoinsError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) return setError("Your bag is empty");
    
    setLoading(true);
    setError("");

    try {
      const payload = {
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: "IN",
          landmark: form.landmark,
        },
        items: lines.map((l) => ({ ...l })),
        gateway,
        promoCode: appliedPromo?.code,
        coinsToRedeem: appliedCoins,
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (gateway === "sandbox") {
        // Auto-verify for sandbox
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderId,
            gateway: "sandbox",
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || "Failed to verify order");
        
        clearBag();
        router.push(`/order/${data.orderId}`);
      } else {
        // Razorpay Checkout
        if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
          amount: data.amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency: data.currency,
          name: "CTRL + STYLE",
          description: "Purchase Order",
          order_id: data.razorpayOrderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: data.orderId,
                  gateway: "razorpay",
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");
              
              clearBag();
              router.push(`/order/${data.orderId}`);
            } catch (err: any) {
              setError(err.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: "#000000",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          setError(response.error.description || "Payment failed");
        });
        rzp1.open();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="mt-28 px-4 lg:px-6">
        <h1 className="text-[10vw] leading-none font-[900] tracking-tighter">Your bag is empty.</h1>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="mx-auto mt-28 mb-32 max-w-7xl px-4 lg:px-6">
        <h1 className="mb-12 text-[10vw] leading-[0.8] font-[900] tracking-tighter md:text-8xl">Checkout</h1>
        
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Form Section */}
          <form onSubmit={handleCheckout} className="space-y-10">
            {error && (
              <div className="border border-red-500 bg-red-500/10 p-4 text-red-500 font-bold uppercase text-sm tracking-wider">
                {error}
              </div>
            )}
            
            <section>
              <h2 className="mb-6 border-b border-current/20 pb-2 text-2xl font-bold uppercase tracking-tight">Contact</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="col-span-full w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
                <input required type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
                <input required type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b border-current/20 pb-2 text-2xl font-bold uppercase tracking-tight">Shipping</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required type="text" name="street" value={form.street} onChange={handleChange} placeholder="Street Address" className="col-span-full w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
                <input type="text" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Landmark (Optional)" className="col-span-full w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
                <input required type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" className="w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
                <input required type="text" name="state" value={form.state} onChange={handleChange} placeholder="State" className="w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
                <input required type="text" name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="PIN Code" className="w-full border border-current/20 bg-transparent p-4 uppercase outline-none focus:border-current" />
                <input disabled type="text" value="India" className="w-full border border-current/20 bg-transparent p-4 uppercase opacity-50 outline-none" />
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b border-current/20 pb-2 text-2xl font-bold uppercase tracking-tight">Payment Method</h2>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-3 border border-current/20 p-4 transition-colors hover:bg-current/5 has-[:checked]:border-current">
                  <input type="radio" name="gateway" value="razorpay" checked={gateway === "razorpay"} onChange={() => setGateway("razorpay")} className="accent-black dark:accent-white" />
                  <span className="font-bold uppercase tracking-wider">Razorpay (Cards, UPI, Netbanking)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 border border-current/20 p-4 transition-colors hover:bg-current/5 has-[:checked]:border-current">
                  <input type="radio" name="gateway" value="sandbox" checked={gateway === "sandbox"} onChange={() => setGateway("sandbox")} className="accent-black dark:accent-white" />
                  <span className="font-bold uppercase tracking-wider">Sandbox Test</span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="block w-full bg-black py-6 text-center text-3xl font-[900] tracking-tighter text-white uppercase transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 dark:bg-white dark:text-black"
            >
              {loading ? "Processing..." : `Pay ${money(total)} & Place Order`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-current/5 p-8 lg:p-12 h-fit sticky top-28">
            <h2 className="mb-8 text-3xl font-[900] tracking-tighter uppercase">Order Summary</h2>
            <ul className="mb-8 space-y-6 border-b border-current/20 pb-8">
              {lines.map((l) => (
                <li key={`${l.handle}-${l.size}`} className="flex gap-4">
                  <div className="relative h-24 w-20 shrink-0">
                    <Image src={l.image} alt={l.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex justify-between font-bold">
                      <span className="text-lg">{l.title}</span>
                      <span>{money(l.price * l.qty)}</span>
                    </div>
                    <div className="text-xs uppercase tracking-widest opacity-60">
                      {l.size} · Qty {l.qty}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="space-y-4 text-sm font-bold uppercase tracking-widest border-b border-current/20 pb-8">
              <div className="flex justify-between">
                <span className="opacity-60">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-500">
                  <span>Promo ({appliedPromo.code})</span>
                  <span>-{money(appliedPromo.discountAmount)}</span>
                </div>
              )}
              {appliedCoins > 0 && (
                <div className="flex justify-between text-blue-500">
                  <span>CTRL+ Coins</span>
                  <span>-{money(appliedCoins)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="opacity-60">Shipping</span>
                <span>{shippingFee === 0 ? "Free" : money(shippingFee)}</span>
              </div>
            </div>

            {/* Wallet Coins Input */}
            {wallet && wallet.balance > 0 && !appliedCoins && (
              <div className="mt-8 mb-4 border border-blue-500/30 bg-blue-500/10 p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
                  Wallet Balance: {wallet.balance} Coins
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={coinsInput}
                    onChange={(e) => setCoinsInput(e.target.value)}
                    placeholder="AMOUNT TO REDEEM"
                    min="1"
                    max={wallet.balance}
                    className="flex-1 border border-current/20 bg-transparent px-4 py-3 uppercase outline-none focus:border-current text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoins}
                    disabled={coinsLoading || !coinsInput.trim()}
                    className="bg-current px-6 py-3 text-sm font-bold text-white dark:text-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {coinsLoading ? "..." : "Redeem"}
                  </button>
                </div>
                {coinsError && <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-red-500">{coinsError}</div>}
              </div>
            )}
            {appliedCoins > 0 && (
              <div className="mt-8 mb-4 flex items-center justify-between border border-blue-500/30 bg-blue-500/10 p-4 text-blue-600 dark:text-blue-400">
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-widest">Coins Redeemed</span>
                  <span className="text-xs font-mono opacity-80">{appliedCoins} Coins = {money(appliedCoins)}</span>
                </div>
                <button type="button" onClick={removeCoins} className="text-xs uppercase font-bold tracking-wider hover:underline">
                  Remove
                </button>
              </div>
            )}

            {/* Promo Code Input */}
            {!appliedPromo ? (
              <div className="mt-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    className="flex-1 border border-current/20 bg-transparent px-4 py-3 uppercase outline-none focus:border-current text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="bg-current px-6 py-3 text-sm font-bold text-white dark:text-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {promoLoading ? "..." : "Apply"}
                  </button>
                </div>
                {promoError && <div className="mt-2 text-xs font-bold uppercase tracking-wider text-red-500">{promoError}</div>}
              </div>
            ) : (
              <div className="mt-8 flex items-center justify-between border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-widest">Promo Code Applied</span>
                  <span className="text-xs font-mono opacity-80">{appliedPromo.code}</span>
                </div>
                <button type="button" onClick={removePromo} className="text-xs uppercase font-bold tracking-wider hover:underline">
                  Remove
                </button>
              </div>
            )}
            
            <div className="mt-8 flex justify-between pt-4 text-2xl font-[900] tracking-tighter">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
