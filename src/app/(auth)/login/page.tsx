"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales inválidas.");
      }

      // Redirect to feed
      router.push("/feed");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="border border-white/10 bg-[#161614]/80 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-2xl">
        {/* Header tag */}
        <div className="flex items-center gap-2 mb-6 text-xs text-[#FFE600] font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-pulse" />
          <span>[ 02 / Authentication ]</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#E6E5DF] mb-3">
          Sign In
        </h1>
        <p className="text-sm text-[#E6E5DF]/60 mb-8 leading-relaxed">
          Welcome back. Enter your credentials to manage your Top 5 and connect with listeners.
        </p>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#E6E5DF]/70 mb-2 font-mono">
              Email or Username
            </label>
            <input
              type="text"
              required
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
              placeholder="you@domain.com or username"
              className="w-full bg-[#1F1F1D] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E6E5DF] placeholder:text-white/20 focus:outline-none focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase tracking-wider text-[#E6E5DF]/70 font-mono">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Your password"
              className="w-full bg-[#1F1F1D] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E6E5DF] placeholder:text-white/20 focus:outline-none focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 bg-[#FFE600] text-[#0E0E0E] hover:bg-[#F2DA00] py-3.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="w-3.5 h-3.5 rounded-[2px] bg-[#0E0E0E] transition-all duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:rotate-45 group-hover:scale-75 group-hover:rounded-full"
              />
              <span>{loading ? "Signing in..." : "Enter musi5t"}</span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-[#E6E5DF]/60">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="text-[#FFE600] hover:underline font-medium transition-colors"
            >
              Join musi5t
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
