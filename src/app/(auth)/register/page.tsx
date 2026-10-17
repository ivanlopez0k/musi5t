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
      {/* Left Column: Editorial Identity & Platform Pillars */}
      <div className="col-span-full sm:col-span-6 flex flex-col justify-center mb-[8vw] sm:mb-0 sm:pr-[3vw]">
        {/* Section Badge */}
        <div className="inline-flex items-center gap-[1.5vw] sm:gap-[0.5vw] mb-[3vw] sm:mb-[1.2vw]">
          <div className="drop-shadow rounded-[0.25vw]">
            <div className="w-[3.5vw] h-[3.5vw] sm:w-[1.2vw] sm:h-[1.2vw] rounded-[0.5vw] sm:rounded-[0.2vw] bg-yellow" />
          </div>
          <span className="extraSmallText uppercase tracking-wider text-secondary/60 font-mono">
            [ 02 / create account ]
          </span>
        </div>

        {/* Editorial Heading */}
        <h1 className="largeText text-secondary mb-[1.5vw] sm:mb-[0.8vw] leading-none">
          curate your 5.
        </h1>
        <p className="mediumText text-secondary/60 mb-[3vw] sm:mb-[1.5vw] leading-tight">
          join the listeners.
        </p>

        <p className="smallText text-secondary/70 leading-relaxed max-w-[90vw] sm:max-w-[34vw] mb-[4vw] sm:mb-[2.5vw]">
          Build your personal vinyl shelf. Pick your 5 essential albums and songs, select your favorite
          international pressings, and discover listeners with genuine taste-affinity.
        </p>

        {/* 3 Editorial Pillars */}
        <div className="hidden sm:flex flex-col gap-[1.2vw] max-w-[35vw]">
          <div className="flex items-start gap-[1.2vw] p-[1.2vw] rounded-[0.4vw] bg-secondary/[0.03] border border-secondary/10 drop-shadow-soft">
            <span className="extraSmallTextBold font-mono text-secondary/40 shrink-0 mt-[0.1vw]">
              01
            </span>
            <div className="flex flex-col">
              <span className="extraSmallTextBold text-secondary leading-tight">
                Curate Essential Records & Pressings
              </span>
              <span className="detailText text-secondary/55 leading-tight mt-[0.2vw]">
                Pick your definitive 5 albums and choose from Japanese, UK, and international editions.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-[1.2vw] p-[1.2vw] rounded-[0.4vw] bg-secondary/[0.03] border border-secondary/10 drop-shadow-soft">
            <span className="extraSmallTextBold font-mono text-secondary/40 shrink-0 mt-[0.1vw]">
              02
            </span>
            <div className="flex flex-col">
              <span className="extraSmallTextBold text-secondary leading-tight">
                Organic Taste-Matched Feed
              </span>
              <span className="detailText text-secondary/55 leading-tight mt-[0.2vw]">
                Your &apos;For You&apos; timeline is tuned automatically by the records in your Top 5. No clickbait.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-[1.2vw] p-[1.2vw] rounded-[0.4vw] bg-secondary/[0.03] border border-secondary/10 drop-shadow-soft">
            <span className="extraSmallTextBold font-mono text-secondary/40 shrink-0 mt-[0.1vw]">
              03
            </span>
            <div className="flex flex-col">
              <span className="extraSmallTextBold text-secondary leading-tight">
                Community Rankings & Reviews
              </span>
              <span className="detailText text-secondary/55 leading-tight mt-[0.2vw]">
                Rate albums on a 1&ndash;10 scale, contribute to public rankings, and exchange listener notes.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Editorial Registration Form Card */}
      <div className="col-span-full sm:col-span-6 flex justify-center sm:justify-end items-center">
        <div className="w-full max-w-[460px] bg-primary text-secondary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.5vw] p-[6vw] sm:p-[2.5vw] drop-shadow-soft">
          {/* Card Header */}
          <div className="mb-[5vw] sm:mb-[2vw]">
            <h2 className="mediumText text-secondary mb-[0.4vw]">Create Account</h2>
            <p className="extraSmallText text-secondary/55">
              Set up your handle and profile to start curating.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-[4vw] sm:mb-[1.5vw] p-[3vw] sm:p-[0.9vw] bg-red-500/10 border border-red-500/25 rounded-[0.8vw] sm:rounded-[0.35vw] text-red-700 extraSmallText flex items-center gap-[2vw] sm:gap-[0.6vw]">
              <span className="w-[2vw] h-[2vw] sm:w-[0.5vw] sm:h-[0.5vw] rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[3.5vw] sm:space-y-[1.2vw]">
            <div>
              <label className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 mb-[1.5vw] sm:mb-[0.4vw] font-mono">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-[3.5vw] sm:left-[1.2vw] top-1/2 -translate-y-1/2 smallText text-secondary/40 font-mono select-none">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                  placeholder="radiohead_lover"
                  className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] pl-[8vw] sm:pl-[2.6vw] pr-[3.5vw] sm:pr-[1.2vw] py-[2.8vw] sm:py-[0.75vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 mb-[1.5vw] sm:mb-[0.4vw] font-mono">
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
                className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] px-[3.5vw] py-[2.8vw] sm:px-[1.2vw] sm:py-[0.75vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText"
              />
            </div>

            <div>
              <label className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 mb-[1.5vw] sm:mb-[0.4vw] font-mono">
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
                className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] px-[3.5vw] py-[2.8vw] sm:px-[1.2vw] sm:py-[0.75vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText"
              />
            </div>

            <div>
              <label className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 mb-[1.5vw] sm:mb-[0.4vw] font-mono">
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
                className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] px-[3.5vw] py-[2.8vw] sm:px-[1.2vw] sm:py-[0.75vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText"
              />
            </div>

            <div className="pt-[2vw] sm:pt-[0.6vw]">
              <div className="drop-shadow rounded-[1vw] sm:rounded-[0.35vw]">
                <button
                  type="submit"
                  disabled={loading}
                  className="main-btn w-full justify-center !py-[3.2vw] sm:!py-[0.85vw] !gap-[2.5vw] sm:!gap-[0.8vw] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="main-btn__icon !w-[5vw] !h-[5vw] sm:!w-[1.1vw] sm:!h-[1.1vw] !rounded-[1vw] sm:!rounded-[0.25vw]" />
                  <span className="main-btn__label smallText font-medium text-secondary">
                    {loading ? "Creating account..." : "Join musi5t"}
                  </span>
                </button>
              </div>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-[6vw] sm:mt-[2vw] pt-[4vw] sm:pt-[1.2vw] border-t border-secondary/10 text-center">
            <p className="extraSmallText text-secondary/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-secondary underline hover:opacity-80 transition-opacity"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
