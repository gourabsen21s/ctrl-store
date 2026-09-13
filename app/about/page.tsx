import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us — EmulsionStack // CTRL + STYLE",
  description:
    "Learn about EmulsionStack and the design philosophy behind CTRL + STYLE. Heavyweight textiles, architectural silhouettes, and slow production.",
};

export default function AboutPage() {
  return (
    <main id="page" data-page="about" className="min-h-screen">
      <div className="mx-auto mt-28 mb-32 max-w-5xl px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-red font-bold">
            01 // ORIGIN & MANIFESTO
          </span>
          <h1 className="text-[clamp(3rem,9vw,7.5rem)] leading-[0.88] font-[900] tracking-tighter">
            About Us
          </h1>
          <p className="mt-2 font-mono text-xs uppercase opacity-50 tracking-wider">
            EmulsionStack Studio & Craft Laboratory · Est. 2026
          </p>
        </div>

        <div className="mt-6 mb-12 h-[5px] w-full bg-current" />

        {/* Narrative Section */}
        <div className="space-y-16 text-base leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight">
              Design at the intersection of tactile weight and brutalist utility.
            </h2>
            <p className="text-lg opacity-85 leading-relaxed">
              <strong className="text-current font-bold">EmulsionStack</strong> is an independent design house and technology laboratory founded on a single conviction: modern apparel and digital commerce have grown disposable. We engineer garments and technical carry with deliberate mass, architectural cuts, and high-gauge materiality designed to outlive trends.
            </p>
            <p className="text-base opacity-75 leading-relaxed">
              Every drop released under the <strong className="text-current font-bold">CTRL + STYLE</strong> moniker undergoes rigorous fabric formulation—from 240gsm combed cotton to water-repellent 1000D ballistic weaves. We do not design for seasons; we release disciplined, numbered batches that balance industrial precision with streetwear culture.
            </p>
          </section>

          {/* Core Pillars Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-current/20 py-12">
            <div className="space-y-2">
              <span className="font-mono text-xs text-red font-bold">[ 01 ]</span>
              <h3 className="text-xl font-bold uppercase tracking-tight">High-Gauge Materiality</h3>
              <p className="text-xs font-mono opacity-70 leading-normal">
                Sourced from certified ethical mills. Pre-shrunk, custom-dyed, and double-needle stitched for maximum longevity.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-red font-bold">[ 02 ]</span>
              <h3 className="text-xl font-bold uppercase tracking-tight">Limited Drop Model</h3>
              <p className="text-xs font-mono opacity-70 leading-normal">
                Zero deadstock. We craft products in small, controlled runs to prevent overproduction and ensure immaculate quality control.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-red font-bold">[ 03 ]</span>
              <h3 className="text-xl font-bold uppercase tracking-tight">Digital Transparency</h3>
              <p className="text-xs font-mono opacity-70 leading-normal">
                Engineered with modern web architecture, instant inventory sync, and direct-to-community waitlists without middlemen.
              </p>
            </div>
          </section>

          {/* Corporate Entity Details */}
          <section className="border border-current/20 p-6 sm:p-8 bg-current/[0.02] space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold">
              Corporate & Operating Entity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono opacity-80">
              <div>
                <p className="font-bold text-current">Legal Business Name</p>
                <p className="mt-1">EmulsionStack</p>
              </div>
              <div>
                <p className="font-bold text-current">Brand / Trade Name</p>
                <p className="mt-1">CTRL + STYLE®</p>
              </div>
              <div>
                <p className="font-bold text-current">Headquarters & Studio</p>
                <p className="mt-1">108 Brigade Road, Indiranagar, Bengaluru, Karnataka, 560038, India</p>
              </div>
              <div>
                <p className="font-bold text-current">Inquiries & Partnerships</p>
                <p className="mt-1">concierge@ctrlstyle.com / support@emulsionstack.com</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <Link
              href="/"
              data-cursor
              className="w-full sm:w-auto border border-current px-8 py-3 text-xs font-mono uppercase tracking-widest font-bold hover:bg-current hover:text-[var(--color-bg)] transition-colors text-center"
            >
              Explore Collection ↗
            </Link>
            <Link
              href="/privacy"
              data-cursor
              className="text-xs font-mono uppercase opacity-60 hover:opacity-100 hover:underline underline-offset-4"
            >
              Read Legal & Privacy Disclosures →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
