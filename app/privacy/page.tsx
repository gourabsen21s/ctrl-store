import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — EmulsionStack // CTRL + STYLE",
  description:
    "Privacy Policy for EmulsionStack and CTRL + STYLE. Learn how your data is collected, stored, and protected in accordance with IT rules.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 13, 2026";

  return (
    <main id="page" data-page="privacy" className="min-h-screen">
      <div className="mx-auto mt-28 mb-32 max-w-4xl px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-red font-bold">
            LEGAL COMPLIANCE // PRIVACY NOTICE
          </span>
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] font-[900] tracking-tighter">
            Privacy Policy
          </h1>
          <p className="mt-2 font-mono text-xs uppercase opacity-50 tracking-wider">
            Operating Entity: EmulsionStack · Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="mt-6 mb-12 h-[5px] w-full bg-current" />

        {/* Content */}
        <div className="space-y-12 text-sm leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              1. Overview & Commitment
            </h2>
            <p className="opacity-80">
              This Privacy Policy applies to the website, applications, and services operated by{" "}
              <strong className="text-current font-bold">EmulsionStack</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), including our direct-to-consumer storefront <strong className="text-current font-bold">CTRL + STYLE®</strong>. We respect your personal privacy and are committed to maintaining data handling standards compliant with the Information Technology Act, 2000, and relevant digital personal data protection norms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              2. Information We Collect
            </h2>
            <div className="space-y-3 opacity-80">
              <p>
                <strong>A. Directly Provided Data:</strong> When you subscribe to our VIP Drop waitlist, contact customer concierge, or place an order, we collect information including your name, email address, shipping destination, phone number, and preferences.
              </p>
              <p>
                <strong>B. Automated & Device Data:</strong> When you browse our catalogue, our servers automatically log technical metadata such as browser version, IP address, device viewport, referral URL, and operating system.
              </p>
              <p>
                <strong>C. Client Storage:</strong> We use localized browser storage (<code className="px-1 py-0.5 border border-current/20 font-mono text-xs">localStorage</code> and <code className="px-1 py-0.5 border border-current/20 font-mono text-xs">sessionStorage</code>) strictly to preserve your cart items, theme preferences, and saved wishlist without tracking your browsing outside of our domain.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              3. Purpose & Legal Basis of Processing
            </h2>
            <ul className="list-disc pl-5 space-y-2 opacity-80">
              <li>To fulfill purchase transactions, verify payments, and dispatch physical orders to your delivery address.</li>
              <li>To send VIP drop notifications, private catalogue links, and order tracking confirmations via verified communication channels (including Resend and WhatsApp APIs).</li>
              <li>To detect fraudulent activities, prevent duplicate bot spam on waitlists, and secure our administrative endpoints.</li>
              <li>To improve web performance, maintain zero-latency asset caching through Cloudinary CDNs, and analyze storefront navigation paths.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              4. Third-Party Service Providers & Data Sharing
            </h2>
            <p className="opacity-80">
              EmulsionStack will never sell, rent, or trade your personal information to third-party advertisers. We disclose data solely to vetted infrastructure and fulfillment partners under strict confidentiality obligations:
            </p>
            <div className="border border-current/20 p-4 font-mono text-xs space-y-2 opacity-80">
              <p>• <strong>Cloud Infrastructure:</strong> MongoDB Atlas (Database), Cloudinary (Media CDN).</p>
              <p>• <strong>Communications:</strong> Resend Technologies Inc. (Automated transactional dispatch).</p>
              <p>• <strong>Payment Gateways:</strong> RBI-licensed payment aggregators (Razorpay / Cashfree / Stripe). Card data is tokenized and never stored on our servers.</p>
              <p>• <strong>Logistics Partners:</strong> Domestic courier partners (Delhivery, Blue Dart) for physical parcel fulfillment.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              5. Data Security & Storage Protocols
            </h2>
            <p className="opacity-80">
              All data transmitted between your browser and our servers is secured using 256-bit Transport Layer Security (TLS/HTTPS). Administrative authentication utilizes tamper-proof JSON Web Tokens (JWT) stored in HTTP-only, secure, SameSite cookies. Database records are safeguarded with strict network IP whitelisting and encryption at rest.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
              6. Your Privacy Rights
            </h2>
            <p className="opacity-80">
              You retain full control over your data. At any time, you may request:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 opacity-80">
              <li>Access to or a copy of all personal records stored in our database.</li>
              <li>Immediate correction or rectification of outdated contact details.</li>
              <li>Complete removal or deletion of your email from the VIP waitlist and subscriber directories.</li>
            </ul>
          </section>

          <section className="border border-current/20 p-6 bg-current/[0.02] space-y-3">
            <h2 className="text-base font-bold font-mono uppercase tracking-tight">
              7. Grievance Officer & Contact Information
            </h2>
            <p className="opacity-80 text-xs">
              In accordance with the Information Technology Act 2000 and rules made thereunder, questions or grievances regarding this policy may be addressed to our designated officer:
            </p>
            <div className="font-mono text-xs opacity-90 space-y-1">
              <p><strong>Entity:</strong> EmulsionStack (Trade Name: CTRL + STYLE)</p>
              <p><strong>Grievance Officer:</strong> Legal & Compliance Desk</p>
              <p><strong>Email:</strong> privacy@emulsionstack.com / concierge@ctrlstyle.com</p>
              <p><strong>Registered Address:</strong> 108 Brigade Road, Indiranagar, Bengaluru, KA 560038, India</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-current/20 pt-6 text-xs font-mono uppercase">
          <Link href="/terms" className="hover:underline underline-offset-4">
            Terms & Conditions →
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
