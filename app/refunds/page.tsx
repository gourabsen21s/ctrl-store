import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Refund & Cancellation Policy — EmulsionStack // CTRL + STYLE",
  description:
    "Refund, return, and cancellation policies for EmulsionStack and CTRL + STYLE. Clear timelines, exchange process, and gateway refund details.",
};

export default function RefundsPage() {
  const lastUpdated = "September 13, 2026";

  return (
    <main id="page" data-page="refunds" className="min-h-screen">
      <div className="mx-auto mt-28 mb-32 max-w-4xl px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-red font-bold">
            FULFILLMENT ASSURANCE // RETURNS & REFUNDS
          </span>
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-[900] tracking-tighter">
            Refund Policy
          </h1>
          <p className="mt-2 font-mono text-xs uppercase opacity-50 tracking-wider">
            Operating Entity: EmulsionStack · Policy Effective: {lastUpdated}
          </p>
        </div>

        <div className="mt-6 mb-12 h-[5px] w-full bg-current" />

        {/* Content */}
        <div className="space-y-12 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              1. 7-Day Hassle-Free Returns & Exchanges
            </h2>
            <p className="opacity-80">
              At <strong className="text-current font-bold">EmulsionStack</strong>, we hold our apparel and technical goods to the highest standards of craftsmanship. If an item does not meet your expectations in sizing, fit, or finish, you may request an exchange or return within <strong className="text-current font-bold">7 calendar days</strong> of parcel delivery.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              2. Return Eligibility Criteria
            </h2>
            <p className="opacity-80">
              To qualify for a full refund or direct size exchange, products must satisfy the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2 opacity-80">
              <li>Garments must be entirely unworn, unwashed, unaltered, and free of stains, perfumes, or deodorant marks.</li>
              <li>All original brutalist product tags, woven labels, and custom dust bags/packaging must remain attached and intact.</li>
              <li>Proof of purchase (Order ID or confirmation receipt dispatched from our system) must accompany the request.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              3. Damaged or Defective Items
            </h2>
            <p className="opacity-80">
              Every parcel dispatched from our warehouse undergoes two-tier inspection. If you receive an item that is defective or transit-damaged:
            </p>
            <div className="border border-current/20 p-4 font-mono text-xs space-y-2 opacity-85">
              <p>• Notify our team within <strong>48 hours</strong> of package delivery.</p>
              <p>• Send photographs or unboxing video footage highlighting the defect to <strong>concierge@ctrlstyle.com</strong>.</p>
              <p>• We will arrange a free reverse pickup and immediately dispatch a replacement or issue a 100% full refund.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              4. Non-Returnable Items
            </h2>
            <p className="opacity-80">
              For hygiene and limited-run collector integrity, the following products cannot be returned once delivered:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 opacity-80">
              <li>Headwear and beanies (for direct scalp contact reasons).</li>
              <li>Items marked as &quot;Final Sale&quot; or &quot;Archive Drop&quot;.</li>
              <li>Customized or personalized orders.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              5. Refund Processing Timelines
            </h2>
            <div className="space-y-3 opacity-80">
              <p>
                Once our warehouse receives and inspects your returned piece (typically within 2 business days of physical receipt), an automated email notification will be dispatched confirming approval or rejection.
              </p>
              <p>
                Approved refunds are processed back to the original source account (UPI, Credit/Debit Card, Net Banking) within <strong className="text-current font-bold">5 to 7 business days</strong>. Time to credit reflects banking cycle norms governed by RBI settlement timelines.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              6. Order Cancellations
            </h2>
            <p className="opacity-80">
              Orders may be cancelled at zero penalty prior to warehouse dispatch (usually within 12 hours of placement). Once an order has been handed to our courier partner and tracking is assigned, cancellations cannot be processed mid-transit; you may simply request a return upon delivery.
            </p>
          </section>

          <section className="border border-current/20 p-6 bg-current/[0.02] space-y-3">
            <h2 className="text-base font-bold font-mono uppercase tracking-tight">
              7. How to Initiate a Return or Exchange
            </h2>
            <p className="opacity-80 text-xs">
              To start a return, simply contact our concierge team with your Order ID:
            </p>
            <div className="font-mono text-xs opacity-90 space-y-1">
              <p>• <strong>Email Concierge:</strong> concierge@ctrlstyle.com</p>
              <p>• <strong>WhatsApp Support:</strong> +91 98765 43210</p>
              <p>• <strong>Fulfillment Studio:</strong> EmulsionStack Logistics, 108 Brigade Road, Bengaluru, KA 560038</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-current/20 pt-6 text-xs font-mono uppercase">
          <Link href="/privacy" className="hover:underline underline-offset-4">
            Privacy Policy →
          </Link>
          <Link href="/terms" className="hover:underline underline-offset-4">
            Terms & Conditions →
          </Link>
          <Link href="/about" className="hover:underline underline-offset-4">
            About EmulsionStack →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
