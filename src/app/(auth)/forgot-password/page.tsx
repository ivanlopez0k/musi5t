"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process recovery request.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-grid items-center min-h-[calc(100svh-12vw)] sm:min-h-[calc(100svh-6vw)] py-[8vw] sm:py-[4vw]">
      {/* Left Column: Context & Vinyl Branding */}
      <div className="col-span-full sm:col-span-6 flex flex-col justify-center mb-[8vw] sm:mb-0">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.8vw] mb-[3vw] sm:mb-[1.5vw]">
          <div className="drop-shadow rounded-[0.25vw]">
            <div className="w-[5vw] h-[5vw] sm:w-[1.6vw] sm:h-[1.6vw] rounded-[1vw] sm:rounded-[0.2vw] bg-[#FF5A3C]" />
          </div>
          <span className="smallText font-mono uppercase tracking-wider text-secondary/60">
            account recovery
          </span>
        </div>

        <h1 className="largeText text-secondary leading-tight mb-[3vw] sm:mb-[1.5vw]">
          Recover your musi5t credentials.
        </h1>

        <p className="smallText text-secondary/70 leading-relaxed max-w-[90vw] sm:max-w-[34vw] mb-[4vw] sm:mb-[2.5vw]">
          Enter the email address registered with your account. We will dispatch a secure, single-use link to reset your password and restore access to your rotation.
        </p>

        {/* Vinyl Card Graphic */}
        <div className="hidden sm:flex items-center gap-[1.5vw] p-[1.4vw] rounded-[0.5vw] bg-secondary/[0.03] border border-secondary/10 max-w-[34vw] drop-shadow-soft">
          <div className="w-[5vw] h-[5vw] rounded-full bg-secondary flex items-center justify-center shrink-0 drop-shadow relative overflow-hidden">
            <div className="absolute inset-[0.4vw] rounded-full border border-primary/10" />
            <div className="absolute inset-[0.8vw] rounded-full border border-primary/10" />
            <div className="absolute inset-[1.2vw] rounded-full border border-primary/10" />
            <div className="w-[2vw] h-[2vw] rounded-full bg-[#FF5A3C] flex items-center justify-center text-[0.6vw] font-bold text-primary z-10 drop-shadow">
              KEY
            </div>
          </div>
          <div className="flex flex-col">
            <span className="extraSmallTextBold text-secondary leading-tight">
              Cryptographically protected.
            </span>
            <span className="detailText text-secondary/55 leading-tight mt-[0.2vw]">
              Expiring SHA-256 tokens ensure your listening history stays secure.
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Editorial Form Card */}
      <div className="col-span-full sm:col-span-6 flex justify-center sm:justify-end items-center">
        <div className="w-full max-w-[460px] bg-primary text-secondary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.5vw] p-[6vw] sm:p-[2.5vw] drop-shadow-soft">
          {submitted ? (
            <div className="py-[1vw]">
              <div className="w-[12vw] h-[12vw] sm:w-[3.5vw] sm:h-[3.5vw] rounded-full bg-secondary/[0.05] border border-secondary/10 flex items-center justify-center mx-auto mb-[4vw] sm:mb-[1.5vw]">
                <svg
                  className="w-[6vw] h-[6vw] sm:w-[1.8vw] sm:h-[1.8vw] text-secondary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              <h2 className="mediumText text-secondary text-center mb-[1vw]">
                Check your inbox
              </h2>
              <p className="extraSmallText text-secondary/70 leading-relaxed text-center mb-[6vw] sm:mb-[2vw]">
                If an account exists for <strong>{email}</strong>, we have dispatched a secure link with instructions to reset your password.
              </p>

              <div className="p-[3.5vw] sm:p-[1.2vw] rounded-[0.4vw] bg-secondary/[0.03] border border-secondary/10 mb-[6vw] sm:mb-[2vw]">
                <p className="detailText text-secondary/60 leading-normal">
                  • The reset link is valid for 1 hour.<br />
                  • If you do not see the email, check your spam folder or verify that the address is registered.<br />
                  • In local development, the reset link is also printed in your server terminal.
                </p>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/login"
                  className="main-btn !px-[5vw] sm:!px-[1.6vw] !py-[2.5vw] sm:!py-[0.7vw] justify-center text-center"
                >
                  <span className="main-btn__label text-secondary font-medium">
                    Return to Sign In →
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="mb-[5vw] sm:mb-[2vw]">
                <h2 className="mediumText text-secondary mb-[0.4vw]">
                  Reset password
                </h2>
                <p className="extraSmallText text-secondary/55">
                  Enter your email to receive recovery instructions.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-[4vw] sm:mb-[1.5vw] p-[3vw] sm:p-[1vw] rounded-[0.8vw] sm:rounded-[0.35vw] bg-red-500/10 border border-red-500/20 text-red-600 extraSmallText leading-relaxed">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-[4vw] sm:gap-[1.5vw]">
                <div>
                  <label
                    htmlFor="email"
                    className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 font-mono mb-[1.5vw] sm:mb-[0.5vw]"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
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
                      <div className="main-btn__icon !w-[5vw] !h-[5vw] sm:!w-[1.1vw] sm:!h-[1.1vw] !rounded-[1vw] sm:!rounded-[0.25vw] bg-[#FF5A3C]" />
                      <span className="main-btn__label text-[3.2vw] sm:text-[0.85vw] font-medium text-secondary">
                        {loading ? "Sending link..." : "Send recovery link"}
                      </span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Back to Login */}
              <div className="mt-[6vw] sm:mt-[2vw] pt-[4vw] sm:pt-[1.5vw] border-t border-secondary/10 flex justify-center items-center">
                <Link
                  href="/login"
                  className="extraSmallText text-secondary/60 hover:text-secondary transition-colors"
                >
                  Remembered your password? <span className="underline font-medium">Sign in</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
