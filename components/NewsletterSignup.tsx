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
    <div className="border-y border-current/20 py-12 md:py-16 my-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        {/* Editorial Heading */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest opacity-60">
            <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
            <span>Exclusive Access</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] tracking-tighter leading-none uppercase">
            VIP Drop List
          </h2>
          <p className="mt-3 text-sm md:text-base opacity-70 tracking-tight">
            Archival releases, limited capsule drops, and private access codes 24 hours before
            public launch.
          </p>
        </div>

        {/* Minimalist Form */}
        <div className="w-full md:w-auto md:min-w-[360px] lg:min-w-[420px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex border border-current/40 focus-within:border-current transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                disabled={loading}
                data-cursor
                className="w-full bg-transparent px-4 py-3.5 text-xs uppercase font-mono tracking-wider placeholder:text-current/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                data-cursor
                className="bg-current text-cream dark:text-black font-mono font-bold text-xs uppercase tracking-widest px-6 py-3.5 shrink-0 transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {loading ? "..." : "Join →"}
              </button>
            </div>

            {/* Status Message */}
            {status && (
              <div
                className={`text-xs font-mono py-2 px-3 border ${
                  status.type === "success"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-red/50 bg-red/10 text-red"
                }`}
              >
                {status.type === "success" ? "✓ " : "✗ "}
                {status.message}
              </div>
            )}

            <p className="text-[10px] font-mono opacity-50 uppercase tracking-wide">
              No spam. Strictly secret drops &amp; dispatch alerts.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
