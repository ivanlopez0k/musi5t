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
    <div className="layout-grid w-full items-center my-auto py-[4vw] sm:py-[2vw]">
      {/* Left Column: Editorial Identity & Vinyl Motif */}
      <div className="col-span-full sm:col-span-6 flex flex-col justify-center mb-[8vw] sm:mb-0 sm:pr-[3vw]">
        {/* Section Badge */}
        <div className="inline-flex items-center gap-[1.5vw] sm:gap-[0.5vw] mb-[3vw] sm:mb-[1.2vw]">
          <div className="drop-shadow rounded-[0.25vw]">
            <div className="w-[3.5vw] h-[3.5vw] sm:w-[1.2vw] sm:h-[1.2vw] rounded-[0.5vw] sm:rounded-[0.2vw] bg-yellow" />
          </div>
          <span className="extraSmallText uppercase tracking-wider text-secondary/60 font-mono">
            [ 01 / sign in ]
          </span>
        </div>

        {/* Editorial Heading */}
        <h1 className="largeText text-secondary mb-[1.5vw] sm:mb-[0.8vw] leading-none">
          welcome back.
        </h1>
        <p className="mediumText text-secondary/60 mb-[3vw] sm:mb-[1.5vw] leading-tight">
          put the needle on the record.
        </p>

        <p className="smallText text-secondary/70 leading-relaxed max-w-[90vw] sm:max-w-[34vw] mb-[4vw] sm:mb-[2.5vw]">
          Enter your credentials to manage your Top 5 essential albums, follow international
          pressings, and join authentic discussions with kindred listeners.
        </p>

        {/* Vinyl Card Graphic */}
        <div className="hidden sm:flex items-center gap-[1.5vw] p-[1.4vw] rounded-[0.5vw] bg-secondary/[0.03] border border-secondary/10 max-w-[34vw] drop-shadow-soft">
          <div className="w-[5vw] h-[5vw] rounded-full bg-secondary flex items-center justify-center shrink-0 drop-shadow relative overflow-hidden group">
            {/* Vinyl grooves */}
            <div className="absolute inset-[0.4vw] rounded-full border border-primary/10" />
            <div className="absolute inset-[0.8vw] rounded-full border border-primary/10" />
            <div className="absolute inset-[1.2vw] rounded-full border border-primary/10" />
            {/* Center label */}
            <div className="w-[2vw] h-[2vw] rounded-full bg-yellow flex items-center justify-center text-[0.6vw] font-bold text-secondary z-10 drop-shadow">
              33 RPM
            </div>
          </div>
          <div className="flex flex-col">
            <span className="extraSmallTextBold text-secondary leading-tight">
              5 albums. Infinite connection.
            </span>
            <span className="detailText text-secondary/55 leading-tight mt-[0.2vw]">
              Organic taste-matching based entirely on shared vinyl and records.
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Editorial Form Card */}
      <div className="col-span-full sm:col-span-6 flex justify-center sm:justify-end items-center">
        <div className="w-full max-w-[460px] bg-primary text-secondary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.5vw] p-[6vw] sm:p-[2.5vw] drop-shadow-soft">
          {/* Card Header */}
          <div className="mb-[5vw] sm:mb-[2vw]">
            <h2 className="mediumText text-secondary mb-[0.4vw]">Sign In</h2>
            <p className="extraSmallText text-secondary/55">
              Enter your username or email address to continue.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-[4vw] sm:mb-[1.5vw] p-[3vw] sm:p-[0.9vw] bg-red-500/10 border border-red-500/25 rounded-[0.8vw] sm:rounded-[0.35vw] text-red-700 extraSmallText flex items-center gap-[2vw] sm:gap-[0.6vw]">
              <span className="w-[2vw] h-[2vw] sm:w-[0.5vw] sm:h-[0.5vw] rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[4vw] sm:space-y-[1.4vw]">
            <div>
              <label className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 mb-[1.5vw] sm:mb-[0.5vw] font-mono">
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
                className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] px-[3.5vw] py-[2.8vw] sm:px-[1.2vw] sm:py-[0.8vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-[1.5vw] sm:mb-[0.5vw]">
                <label className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 font-mono">
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
                className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] px-[3.5vw] py-[2.8vw] sm:px-[1.2vw] sm:py-[0.8vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText"
              />
            </div>

            <div className="pt-[2vw] sm:pt-[0.8vw]">
              <div className="drop-shadow rounded-[1vw] sm:rounded-[0.35vw]">
                <button
                  type="submit"
                  disabled={loading}
                  className="main-btn w-full justify-center !py-[3.2vw] sm:!py-[0.85vw] !gap-[2.5vw] sm:!gap-[0.8vw] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="main-btn__icon !w-[5vw] !h-[5vw] sm:!w-[1.1vw] sm:!h-[1.1vw] !rounded-[1vw] sm:!rounded-[0.25vw]" />
                  <span className="main-btn__label smallText font-medium text-secondary">
                    {loading ? "Signing in..." : "Enter musi5t"}
                  </span>
                </button>
              </div>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-[6vw] sm:mt-[2vw] pt-[4vw] sm:pt-[1.2vw] border-t border-secondary/10 text-center">
            <p className="extraSmallText text-secondary/60">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="font-medium text-secondary underline hover:opacity-80 transition-opacity"
              >
                Join musi5t
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
