"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al registrarse.");
      }

      // Successful registration -> redirect to user's profile to curate top 5
      router.push(`/@${data.user.username}`);
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
          <span>[ 01 / Registration ]</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#E6E5DF] mb-3">
          Create Account
        </h1>
        <p className="text-sm text-[#E6E5DF]/60 mb-8 leading-relaxed">
          Curate your essential Top 5 albums, discover kindred listeners, and talk records.
        </p>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#E6E5DF]/70 mb-2 font-mono">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#E6E5DF]/40 font-mono">
                @
              </span>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                }
                placeholder="radiohead_lover"
                className="w-full bg-[#1F1F1D] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-sm text-[#E6E5DF] placeholder:text-white/20 focus:outline-none focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#E6E5DF]/70 mb-2 font-mono">
              Display Name
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              placeholder="Thom Yorke"
              className="w-full bg-[#1F1F1D] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E6E5DF] placeholder:text-white/20 focus:outline-none focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#E6E5DF]/70 mb-2 font-mono">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@domain.com"
              className="w-full bg-[#1F1F1D] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E6E5DF] placeholder:text-white/20 focus:outline-none focus:border-[#FFE600] focus:ring-1 focus:ring-[#FFE600] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#E6E5DF]/70 mb-2 font-mono">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Min. 8 characters"
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
              <span>{loading ? "Creating account..." : "Join musi5t"}</span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-[#E6E5DF]/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#FFE600] hover:underline font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
