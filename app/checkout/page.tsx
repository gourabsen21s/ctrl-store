"use client";

import { useState } from "react";
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

  const shippingFee = subtotal >= 1999 ? 0 : 150;
  const total = subtotal + shippingFee;

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
            
            <div className="space-y-4 text-sm font-bold uppercase tracking-widest">
              <div className="flex justify-between">
                <span className="opacity-60">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Shipping</span>
                <span>{shippingFee === 0 ? "Free" : money(shippingFee)}</span>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between border-t border-current/20 pt-8 text-2xl font-[900] tracking-tighter">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
