"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join VIP list");
      }

      setStatus({
        type: "success",
        message: data.message || "You are on the VIP Drop List.",
      });
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setStatus({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-current/20 pt-16 pb-16 my-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        {/* Editorial Heading */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-red">
            <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
            <span>EXCLUSIVE ACCESS // DISPATCH ALERTS</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-[900] tracking-tighter leading-[0.9] uppercase">
            VIP Drop List
          </h2>
          <p className="mt-4 text-xs sm:text-sm font-mono opacity-60 leading-relaxed max-w-md">
            Archival releases, limited capsule drops, and private access codes 24 hours before public launch.
          </p>
        </div>

        {/* Minimalist Underline Form */}
        <div className="w-full lg:w-auto lg:min-w-[420px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center border-b-2 border-current focus-within:border-red transition-colors pb-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL FOR NOTIFICATIONS"
                disabled={loading}
                data-cursor
                className="w-full bg-transparent py-3 text-xs uppercase font-mono tracking-widest placeholder:text-current/30 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                data-cursor
                className="border border-current px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest hover:bg-current hover:text-cream dark:hover:text-black transition-colors shrink-0 disabled:opacity-50"
              >
                {loading ? "..." : "JOIN →"}
              </button>
            </div>

            {/* Status Message */}
            {status && (
              <div
                className={`text-xs font-mono py-2 px-3 border ${
                  status.type === "success"
                    ? "border-current/40 bg-current/5 text-current font-bold"
                    : "border-red/50 bg-red/10 text-red"
                }`}
              >
                {status.type === "success" ? "✓ " : "✗ "}
                {status.message}
              </div>
            )}

            <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">
              No spam. Strictly secret drops &amp; dispatch alerts.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
