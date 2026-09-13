"use client";

import { useEffect, useState } from "react";

export function WalletWidget() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const [walletRes, refRes] = await Promise.all([
          fetch("/api/wallet"),
          fetch("/api/referral"),
        ]);

        if (walletRes.ok) {
          const wData = await walletRes.json();
          setWallet(wData.wallet);
          setTransactions(wData.transactions || []);
        }

        if (refRes.ok) {
          const rData = await refRes.json();
          setReferral(rData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const referralLink = referral?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referral.referralCode}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 border border-current/10 bg-current/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Wallet Balance Card */}
      <div className="relative overflow-hidden border border-current/20 bg-current/5 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-current/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-1">CTRL+ Coins Balance</div>
          <div className="flex items-end gap-3">
            <div className="text-5xl font-[900] tracking-tighter">{wallet?.balance ?? 0}</div>
            <div className="font-mono text-xs opacity-40 mb-1 pb-1">≈ ₹{wallet?.balance ?? 0}</div>
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-widest opacity-40">
            Lifetime Earned: {wallet?.lifetimeEarned ?? 0} Coins
          </div>
        </div>
      </div>

      {/* Referral Section */}
      {referral?.referralCode && (
        <div className="border border-current/20 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-mono text-[10px] uppercase tracking-widest opacity-60">Referral Program</h3>
            <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest">
              <span className="opacity-50">Referred: <span className="font-bold text-current">{referral.stats?.total ?? 0}</span></span>
              <span className="text-emerald-500">Rewarded: <span className="font-bold">{referral.stats?.rewarded ?? 0}</span></span>
            </div>
          </div>

          {/* Referral link block */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-2">Your referral link</div>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 border border-current/20 bg-current/5 px-3 py-2 font-mono text-xs truncate opacity-70 select-all">
                {referralLink}
              </div>
              <button
                onClick={handleCopyLink}
                className={`shrink-0 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  copied
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                    : "border-current/30 bg-current/10 hover:bg-current/20"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Referral code pill */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-2">Or share the code</div>
            <div className="inline-block bg-current text-white dark:text-black px-5 py-2 font-[900] text-lg tracking-widest select-all">
              {referral.referralCode}
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="border border-current/20">
        <div className="border-b border-current/10 px-5 py-3 font-mono text-[10px] uppercase tracking-widest opacity-50">
          Transaction History
        </div>
        {transactions.length === 0 ? (
          <div className="px-5 py-8 text-center font-mono text-[10px] uppercase tracking-widest opacity-30">
            No transactions yet
          </div>
        ) : (
          <div className="max-h-56 overflow-y-auto divide-y divide-current/5">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between px-5 py-3 hover:bg-current/5 transition-colors">
                <div>
                  <div className={`font-bold text-sm ${tx.type === "credit" ? "text-emerald-500" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : "-"}{tx.amount} Coins
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wide opacity-50 mt-0.5">
                    {tx.reason.replace(/_/g, " ")}
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] opacity-40">
                  <div>{new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  <div>Bal: {tx.balanceAfter}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
