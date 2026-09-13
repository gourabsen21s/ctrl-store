"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      router.push("/account");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        <Link href="/" className="text-2xl font-[900] tracking-tighter hover:opacity-70 transition-opacity z-10">
          CTRL + STYLE
        </Link>
        <div className="z-10">
          <div className="mb-6 text-[80px] leading-[0.85] font-[900] tracking-tighter uppercase text-white/10 select-none">
            GOOD<br />TO<br />SEE<br />YOU.
          </div>
          <p className="font-mono text-sm text-white/40 max-w-xs">
            Sign in to access your orders, wallet, and exclusive member perks.
          </p>
        </div>
        <div className="font-mono text-[10px] text-white/20 z-10">
          © 2025 CTRL + STYLE. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden mb-12 block text-2xl font-[900] tracking-tighter hover:opacity-70 transition-opacity text-center">
            CTRL + STYLE
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-[900] tracking-tighter uppercase">Welcome Back</h1>
            <p className="mt-2 font-mono text-xs text-white/40 uppercase tracking-widest">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="border border-red-500/50 bg-red-500/10 p-4 text-xs font-bold uppercase tracking-widest text-red-400">
                ⚠ {error}
              </div>
            )}

            {/* Email */}
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2 group-focus-within:text-white transition-colors">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-white/20 bg-white/5 p-4 text-sm font-bold uppercase tracking-widest outline-none transition-all focus:border-white focus:bg-white/10 placeholder:font-normal placeholder:tracking-normal placeholder:text-white/20"
              />
            </div>

            {/* Password */}
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2 group-focus-within:text-white transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full border border-white/20 bg-white/5 p-4 pr-14 text-sm font-bold uppercase tracking-widest outline-none transition-all focus:border-white focus:bg-white/10 placeholder:font-normal placeholder:tracking-normal placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white py-4 text-sm font-[900] uppercase tracking-widest text-black transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center font-mono text-xs text-white/40 uppercase tracking-widest">
            Don't have an account?{" "}
            <Link href="/register" className="text-white underline underline-offset-4 hover:opacity-70 transition-opacity">
              Create One
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
