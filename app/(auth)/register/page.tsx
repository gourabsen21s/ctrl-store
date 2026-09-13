"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Reload so header updates and redirects to account
      window.location.href = "/account";
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
          <h1 className="text-xl font-bold uppercase tracking-widest text-center">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-red bg-red/10 p-3 text-center text-xs font-bold uppercase tracking-widest text-red">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="FULL NAME"
              required
              className="w-full border border-current/20 bg-transparent p-4 text-sm font-bold uppercase tracking-widest outline-none transition-colors focus:border-current"
            />
          </div>
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
              minLength={6}
              className="w-full border border-current/20 bg-transparent p-4 text-sm font-bold uppercase tracking-widest outline-none transition-colors focus:border-current"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-current py-4 text-sm font-[900] uppercase tracking-widest text-white dark:text-black transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "CREATING..." : "REGISTER"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest opacity-60">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-blue-500">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
