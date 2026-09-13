"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralLocked, setReferralLocked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-fill referral code from URL param ?ref=CODE
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setReferralLocked(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode: referralCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      window.location.href = "/account";
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
            JOIN<br />THE<br />DROP.
          </div>
          {referralCode && (
            <div className="border border-white/20 bg-white/5 backdrop-blur-sm p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">You were referred by</div>
              <div className="text-2xl font-[900] tracking-tighter">{referralCode}</div>
              <div className="mt-3 font-mono text-xs text-emerald-400">
                🎉 You'll receive CTRL+ Coins on your first order!
              </div>
            </div>
          )}
          {!referralCode && (
            <p className="font-mono text-sm text-white/40 max-w-xs">
              Create an account to start earning CTRL+ Coins, track your orders, and unlock exclusive perks.
            </p>
          )}
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
            <h1 className="text-4xl font-[900] tracking-tighter uppercase">Create Account</h1>
            <p className="mt-2 font-mono text-xs text-white/40 uppercase tracking-widest">
              {referralCode ? `Referred with code: ${referralCode}` : "Join the community"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="border border-red-500/50 bg-red-500/10 p-4 text-xs font-bold uppercase tracking-widest text-red-400">
                ⚠ {error}
              </div>
            )}

            {/* Name */}
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2 group-focus-within:text-white transition-colors">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full border border-white/20 bg-white/5 p-4 text-sm font-bold uppercase tracking-widest outline-none transition-all focus:border-white focus:bg-white/10 placeholder:font-normal placeholder:tracking-normal placeholder:text-white/20"
              />
            </div>

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
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
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

            {/* Referral Code */}
            <div className="group">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2 group-focus-within:text-white transition-colors">
                Referral Code
                {referralLocked && (
                  <span className="ml-2 text-emerald-400">✓ Applied</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => !referralLocked && setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  readOnly={referralLocked}
                  className={`w-full border p-4 text-sm font-bold uppercase tracking-widest outline-none transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-white/20 ${
                    referralLocked
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-default"
                      : "border-white/20 bg-white/5 focus:border-white focus:bg-white/10"
                  }`}
                />
                {referralLocked && (
                  <button
                    type="button"
                    onClick={() => { setReferralCode(""); setReferralLocked(false); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/80 transition-colors"
                  >
                    REMOVE
                  </button>
                )}
              </div>
              {referralLocked && (
                <p className="mt-2 font-mono text-[10px] text-emerald-400/80">
                  🎉 You'll earn bonus CTRL+ Coins on your first order!
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden bg-white py-4 text-sm font-[900] uppercase tracking-widest text-black transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:hover:bg-white disabled:active:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account →"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center font-mono text-xs text-white/40 uppercase tracking-widest">
            Already have an account?{" "}
            <Link href="/login" className="text-white underline underline-offset-4 hover:opacity-70 transition-opacity">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
