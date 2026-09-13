import Link from "next/link";

async function getRewards() {
  try {
    // Fetch at request time with Next.js extended fetch (server-side, no auth needed)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/rewards`,
      { next: { revalidate: 300 } } // ISR: revalidate every 5 min
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

  // Fallbacks if DB not available yet
  const signupBonus = rewards?.signupBonus ?? 50;
  const referrerReward = rewards?.referrerReward ?? 100;
  const refereeReward = rewards?.refereeReward ?? 75;
  const maxRedeem = rewards?.maxRedemptionPercentage ?? 20;

  return (
    <section className="relative overflow-hidden border-y border-current/10 bg-current/5 px-4 py-20 lg:px-6 lg:py-32">
      {/* Background graphic */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]"
      >
        <span className="text-[40vw] font-[900] tracking-tighter leading-none select-none">
          ₿
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Eyebrow */}
        <div className="mb-8 inline-flex items-center gap-3 border border-current/20 px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">
            CTRL+ Rewards Program — Active
          </span>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          {/* Left copy */}
          <div>
            <h2 className="text-[12vw] leading-[0.85] font-[900] tracking-tighter uppercase lg:text-7xl">
              Earn while<br />you shop.
            </h2>
            <p className="mt-8 max-w-md font-mono text-sm leading-relaxed opacity-60">
              Every purchase earns you CTRL+ Coins. Redeem them for discounts on future orders.
              Refer a friend and both of you get rewarded — instantly.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                data-cursor
                className="inline-block bg-black text-cream dark:bg-cream dark:text-black red:bg-red red:text-cream px-8 py-4 text-sm font-[900] uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-md"
              >
                Create Account →
              </Link>
              <Link
                href="/account"
                data-cursor
                className="inline-block border border-current/30 px-8 py-4 text-sm font-[900] uppercase tracking-widest transition-colors hover:bg-current/10"
              >
                My Wallet
              </Link>
            </div>
          </div>

          {/* Right — stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-current/20 bg-current/5 p-6 lg:p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-3">
                Signup Bonus
              </div>
              <div className="text-5xl font-[900] tracking-tighter">
                {signupBonus}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
                Free coins on registration
              </div>
            </div>

            <div className="border border-emerald-500/30 bg-emerald-500/5 p-6 lg:p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-3 text-emerald-600 dark:text-emerald-400">
                You Refer
              </div>
              <div className="text-5xl font-[900] tracking-tighter text-emerald-600 dark:text-emerald-400">
                +{referrerReward}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
                Coins per referral
              </div>
            </div>

            <div className="border border-blue-500/30 bg-blue-500/5 p-6 lg:p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-3 text-blue-600 dark:text-blue-400">
                Friend Gets
              </div>
              <div className="text-5xl font-[900] tracking-tighter text-blue-600 dark:text-blue-400">
                +{refereeReward}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
                Coins on first order
              </div>
            </div>

            <div className="border border-current/20 bg-current/5 p-6 lg:p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-3">
                Redeem Up To
              </div>
              <div className="text-5xl font-[900] tracking-tighter">
                {maxRedeem}%
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-widest opacity-40">
                Off any order total
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling ticker — how it works */}
        <div className="mt-20 border-t border-current/10 pt-10 overflow-hidden">
          <div className="flex gap-16 font-mono text-[10px] uppercase tracking-widest opacity-40 whitespace-nowrap animate-[ticker_20s_linear_infinite]">
            {[
              "1 CTRL+ Coin = ₹1 discount",
              "Sign up and get your free coins instantly",
              "Share your referral link from your account page",
              "Coins are credited after order delivery",
              "No expiry on earned coins",
              "1 CTRL+ Coin = ₹1 discount",
              "Sign up and get your free coins instantly",
              "Share your referral link from your account page",
              "Coins are credited after order delivery",
              "No expiry on earned coins",
            ].map((text, i) => (
              <span key={i}>
                <span className="mr-8 opacity-60">✦</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
