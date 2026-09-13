import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms & Conditions — EmulsionStack // CTRL + STYLE",
  description:
    "Terms and Conditions governing purchases, website access, and order fulfillment with EmulsionStack and CTRL + STYLE.",
};

export default function TermsPage() {
  const lastUpdated = "September 13, 2026";

  return (
    <main id="page" data-page="terms" className="min-h-screen">
      <div className="mx-auto mt-28 mb-32 max-w-4xl px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-red font-bold">
            USER AGREEMENT // LEGAL TERMS
          </span>
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-[900] tracking-tighter">
            Terms & Conditions
          </h1>
          <p className="mt-2 font-mono text-xs uppercase opacity-50 tracking-wider">
            Operating Entity: EmulsionStack · Effective Date: {lastUpdated}
          </p>
        </div>

        <div className="mt-6 mb-12 h-[5px] w-full bg-current" />

        {/* Content */}
        <div className="space-y-12 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              1. Acceptance of Terms
            </h2>
            <p className="opacity-80">
              Welcome to <strong className="text-current font-bold">CTRL + STYLE®</strong>, a digital commerce platform owned and operated by <strong className="text-current font-bold">EmulsionStack</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;). By browsing our website, registering for waitlists, or placing an order, you agree to be bound by these Terms and Conditions (&quot;Terms&quot;) and all applicable laws and regulations of India. If you do not agree with any part of these terms, you must refrain from using the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              2. Product Offerings & Pricing Structure
            </h2>
            <div className="space-y-3 opacity-80">
              <p>
                <strong>A. Currency & Taxes:</strong> All product prices displayed on the store are denominated in Indian Rupees (INR ₹) and are inclusive of Goods and Services Tax (GST) unless explicitly noted otherwise.
              </p>
              <p>
                <strong>B. Fabric & Color Accuracy:</strong> We photograph garments in calibrated studio environments. However, variations in display monitors, ambient lighting, and organic natural dyes may cause slight perceptual differences in physical color tones.
              </p>
              <p>
                <strong>C. Limited Editions & Availability:</strong> All pieces are manufactured in limited drop batches. Placing an item in your bag or wishlist does not reserve inventory until full payment is authorized and confirmed.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              3. Orders & Payment Processing
            </h2>
            <p className="opacity-80">
              When placing an order, you represent that you are at least 18 years of age and authorized to use the designated payment method (Credit/Debit Card, Net Banking, UPI, or Mobile Wallets). All transactions are processed through certified and PCI-DSS compliant third-party payment gateways. EmulsionStack reserves the right to cancel or reject any order suspected of credit fraud, unauthorized reselling, or inventory exploitation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              4. Shipping, Transit & Pan-India Delivery
            </h2>
            <div className="space-y-3 opacity-80">
              <p>
                <strong>A. Processing Timeline:</strong> Standard catalogue orders are packed and dispatched within 24 to 48 business hours from our Bengaluru fulfillment facility.
              </p>
              <p>
                <strong>B. Delivery Schedules:</strong> Typical transit times range between 3 to 7 business days depending on delivery pincodes across metro and non-metro locations in India.
              </p>
              <p>
                <strong>C. Tracking Updates:</strong> Once your consignment is generated, an automated notification containing tracking credentials will be dispatched to your registered email and phone number.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              5. Intellectual Property Rights
            </h2>
            <p className="opacity-80">
              All visual assets, bespoke typography, graphic layouts, brand insignia, product names, photography, codebases, and editorial designs published on this platform are the exclusive intellectual property of <strong className="text-current font-bold">EmulsionStack</strong>. No portion of this site may be duplicated, modified, harvested, or commercially redistributed without prior written consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              6. Limitation of Liability & Indemnity
            </h2>
            <p className="opacity-80">
              In no event shall EmulsionStack, its directors, or associates be liable for indirect, incidental, or consequential damages resulting from platform downtime, courier transit delays, or improper garment maintenance. Our maximum aggregate liability arising out of any order shall be limited strictly to the total purchase price paid for the relevant item.
            </p>
          </section>

          <section className="border border-current/20 p-6 bg-current/[0.02] space-y-3">
            <h2 className="text-base font-bold font-mono uppercase tracking-tight">
              7. Governing Law & Dispute Resolution
            </h2>
            <p className="opacity-80 text-xs">
              These Terms shall be interpreted and governed by the laws of India. Any disputes arising out of or in connection with purchases, platform usage, or brand interactions shall be subject to the exclusive jurisdiction of the competent courts located in <strong className="text-current font-bold">Bengaluru, Karnataka, India</strong>.
            </p>
            <div className="font-mono text-xs opacity-90 pt-2">
              <p>Direct Inquiries: legal@emulsionstack.com / concierge@ctrlstyle.com</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-current/20 pt-6 text-xs font-mono uppercase">
          <Link href="/privacy" className="hover:underline underline-offset-4">
            Privacy Policy →
          </Link>
          <Link href="/refunds" className="hover:underline underline-offset-4">
            Refund & Cancellation Policy →
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
