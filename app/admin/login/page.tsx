"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Mark from "@/components/Mark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-12">
      <div className="w-full max-w-md border border-white/10 bg-[#141414] p-8 md:p-10 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-4">
            <Mark className="h-7 w-14 text-white" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight uppercase">Admin Access</h1>
          <p className="mt-1 text-xs text-white/50 font-mono">
            CTRL + STYLE Inventory & Catalogue Control
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red/40 bg-red/10 p-3 text-xs text-red font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full border border-white/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-white/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white py-3.5 text-center text-xs font-mono uppercase tracking-widest text-black font-bold transition-all hover:bg-neutral-200 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Enter Admin Portal →"}
            </button>
          </div>
        </form>

        <div className="mt-8 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] font-mono text-white/40">
            Default dev login: <span className="text-white/80">admin</span> /{" "}
            <span className="text-white/80">admin123</span>
          </p>
          <div className="mt-3">
            <Link
              href="/"
              className="text-xs text-white/50 hover:text-white transition-colors font-mono underline underline-offset-4"
            >
              ← Return to storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
