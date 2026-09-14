import Link from "next/link";

async function getRewards() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/rewards`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.rewards : null;
  } catch {
    return null;
  }
}

export default async function ReferralBanner() {
  const rewards = await getRewards();

  const signupBonus = rewards?.signupBonus ?? 50;
  const referrerReward = rewards?.referrerReward ?? 100;
  const refereeReward = rewards?.refereeReward ?? 75;
  const maxRedeem = rewards?.maxRedemptionPercentage ?? 20;

  return (
    <section className="border-t border-current/20 pt-16 pb-16 my-12 overflow-hidden">
      {/* Eyebrow */}
      <div className="mb-8 inline-flex items-center gap-2 border border-current/20 px-3 py-1 text-xs font-mono uppercase tracking-widest text-red">
        <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
        <span>STUDIO PRIVILEGE // CLIENT ARCHIVE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-16 gap-12 lg:gap-8 items-start">
        {/* Left copy */}
        <div className="lg:col-span-7">
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-[900] tracking-tighter uppercase leading-[0.9]">
            Earn while<br />you collect.
          </h2>
          <p className="mt-6 font-mono text-xs sm:text-sm leading-relaxed opacity-60 max-w-md">
            Every garment acquired credits your studio balance with CTRL Credits. Redeemable on limited archival drops and bespoke runs.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              data-cursor
              className="inline-flex items-center justify-center border border-current px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest hover:bg-current hover:text-cream dark:hover:text-black transition-colors"
            >
              <span>Create Account</span>
              <span className="ml-2">→</span>
            </Link>
            <Link
              href="/account"
              data-cursor
              className="inline-flex items-center justify-center border border-current/30 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest hover:border-current transition-colors"
            >
              Client Wallet
            </Link>
          </div>
        </div>

        {/* Right — Architectural hairline metric grid */}
        <div className="lg:col-span-9 grid grid-cols-2 border-t border-l border-current/20 font-mono">
          <div className="border-b border-r border-current/20 p-6 sm:p-8">
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2">
              WELCOME CREDIT
            </div>
            <div className="text-4xl sm:text-6xl font-[900] tracking-tighter">
              ₹{signupBonus}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest opacity-40">
              CREDITED ON SIGNUP
            </div>
          </div>

          <div className="border-b border-r border-current/20 p-6 sm:p-8">
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2">
              COLLECTOR REFERRAL
            </div>
            <div className="text-4xl sm:text-6xl font-[900] tracking-tighter text-red">
              +₹{referrerReward}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest opacity-40">
              PER INVITATION
            </div>
          </div>

          <div className="border-b border-r border-current/20 p-6 sm:p-8">
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2">
              INVITEE CREDIT
            </div>
            <div className="text-4xl sm:text-6xl font-[900] tracking-tighter">
              +₹{refereeReward}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest opacity-40">
              FIRST ORDER REDUCTION
            </div>
          </div>

          <div className="border-b border-r border-current/20 p-6 sm:p-8">
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2">
              MAX REDEMPTION
            </div>
            <div className="text-4xl sm:text-6xl font-[900] tracking-tighter">
              {maxRedeem}%
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest opacity-40">
              ORDER VALUE CAP
            </div>
          </div>
        </div>
      </div>

      {/* Minimal scrolling ticker */}
      <div className="mt-12 border-t border-current/20 pt-6 overflow-hidden">
        <div className="flex gap-12 font-mono text-[10px] uppercase tracking-widest opacity-40 whitespace-nowrap">
          {[
            "1 CTRL Credit = ₹1 reduction",
            "Instant allocation upon registration",
            "Exclusive archival privileges",
            "Non-expiring credit allocation",
            "1 CTRL Credit = ₹1 reduction",
            "Instant allocation upon registration",
            "Exclusive archival privileges",
            "Non-expiring credit allocation",
          ].map((text, i) => (
            <span key={i} className="inline-flex items-center gap-4">
              <span>✦</span>
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
