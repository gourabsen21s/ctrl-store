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

      // Use router.push for client-side navigation and refresh for header state
      router.push("/account");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md border border-current/20 p-8 sm:p-12">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-8 text-2xl font-[900] tracking-tighter hover:opacity-70 transition-opacity">
            CTRL + STYLE
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-widest text-center">Customer Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-red bg-red/10 p-3 text-center text-xs font-bold uppercase tracking-widest text-red">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL"
              required
              className="w-full border border-current/20 bg-transparent p-4 text-sm font-bold uppercase tracking-widest outline-none transition-colors focus:border-current"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              required
              className="w-full border border-current/20 bg-transparent p-4 text-sm font-bold uppercase tracking-widest outline-none transition-colors focus:border-current"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-current py-4 text-sm font-[900] uppercase tracking-widest text-white dark:text-black transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest opacity-60">
          Don't have an account?{" "}
          <Link href="/register" className="underline hover:text-blue-500">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
