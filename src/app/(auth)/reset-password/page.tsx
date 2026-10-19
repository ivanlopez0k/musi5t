"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="layout-grid items-center min-h-[calc(100svh-12vw)] sm:min-h-[calc(100svh-6vw)] py-[8vw] sm:py-[4vw]">
      <div className="col-span-full flex justify-center items-center">
        <div className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "Missing recovery token. Please open the link from your email."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Recovery token missing. Please request a new recovery link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-grid items-center min-h-[calc(100svh-12vw)] sm:min-h-[calc(100svh-6vw)] py-[8vw] sm:py-[4vw]">
      {/* Left Column: Context */}
      <div className="col-span-full sm:col-span-6 flex flex-col justify-center mb-[8vw] sm:mb-0">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.8vw] mb-[3vw] sm:mb-[1.5vw]">
          <div className="drop-shadow rounded-[0.25vw]">
            <div className="w-[5vw] h-[5vw] sm:w-[1.6vw] sm:h-[1.6vw] rounded-[1vw] sm:rounded-[0.2vw] bg-[#FF5A3C]" />
          </div>
          <span className="smallText font-mono uppercase tracking-wider text-secondary/60">
            password update
          </span>
        </div>

        <h1 className="largeText text-secondary leading-tight mb-[3vw] sm:mb-[1.5vw]">
          Choose a new password.
        </h1>

        <p className="smallText text-secondary/70 leading-relaxed max-w-[90vw] sm:max-w-[34vw] mb-[4vw] sm:mb-[2.5vw]">
          Your new password will replace your previous credentials across all devices. We recommend a passphrase with at least 8 characters.
        </p>

        {/* Security checklist card */}
        <div className="hidden sm:flex flex-col gap-[0.8vw] p-[1.4vw] rounded-[0.5vw] bg-secondary/[0.03] border border-secondary/10 max-w-[34vw] drop-shadow-soft">
          <span className="extraSmallTextBold text-secondary font-mono uppercase tracking-wider">
            credential standards
          </span>
          <div className="flex flex-col gap-[0.4vw]">
            <span className="detailText text-secondary/70">• Minimum 8 characters in length</span>
            <span className="detailText text-secondary/70">• Stored as salted bcrypt hash</span>
            <span className="detailText text-secondary/70">• Single-use recovery token invalidation</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Card */}
      <div className="col-span-full sm:col-span-6 flex justify-center sm:justify-end items-center">
        <div className="w-full max-w-[460px] bg-primary text-secondary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.5vw] p-[6vw] sm:p-[2.5vw] drop-shadow-soft">
          {success ? (
            <div className="py-[1vw] text-center">
              <div className="w-[12vw] h-[12vw] sm:w-[3.5vw] sm:h-[3.5vw] rounded-full bg-yellow/20 text-secondary flex items-center justify-center mx-auto mb-[4vw] sm:mb-[1.5vw]">
                <svg
                  className="w-[6vw] h-[6vw] sm:w-[1.8vw] sm:h-[1.8vw]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="mediumText text-secondary mb-[0.8vw]">
                Password Updated
              </h2>
              <p className="extraSmallText text-secondary/70 leading-relaxed mb-[6vw] sm:mb-[2vw]">
                Your password has been securely reset. You can now sign in with your new credentials.
              </p>

              <div className="flex justify-center">
                <Link
                  href="/login"
                  className="main-btn !px-[5vw] sm:!px-[1.6vw] !py-[2.5vw] sm:!py-[0.7vw] justify-center text-center"
                >
                  <span className="main-btn__label text-secondary font-medium">
                    Sign in now →
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="mb-[5vw] sm:mb-[2vw]">
                <h2 className="mediumText text-secondary mb-[0.4vw]">
                  Update password
                </h2>
                <p className="extraSmallText text-secondary/55">
                  Set a secure new password for your account.
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
                    htmlFor="password"
                    className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 font-mono mb-[1.5vw] sm:mb-[0.5vw]"
                  >
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] px-[3.5vw] py-[2.8vw] sm:px-[1.2vw] sm:py-[0.8vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block extraSmallTextBold uppercase tracking-wider text-secondary/70 font-mono mb-[1.5vw] sm:mb-[0.5vw]"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-secondary/[0.03] border border-secondary/15 rounded-[0.8vw] sm:rounded-[0.35vw] px-[3.5vw] py-[2.8vw] sm:px-[1.2vw] sm:py-[0.8vw] text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary focus:bg-primary transition-all smallText"
                  />
                </div>

                <div className="pt-[2vw] sm:pt-[0.8vw]">
                  <div className="drop-shadow rounded-[1vw] sm:rounded-[0.35vw]">
                    <button
                      type="submit"
                      disabled={loading || !token}
                      className="main-btn w-full justify-center !py-[3.2vw] sm:!py-[0.85vw] !gap-[2.5vw] sm:!gap-[0.8vw] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="main-btn__icon !w-[5vw] !h-[5vw] sm:!w-[1.1vw] sm:!h-[1.1vw] !rounded-[1vw] sm:!rounded-[0.25vw] bg-[#FF5A3C]" />
                      <span className="main-btn__label text-[3.2vw] sm:text-[0.85vw] font-medium text-secondary">
                        {loading ? "Updating password..." : "Set new password"}
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
                  Return to <span className="underline font-medium">Sign in</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
