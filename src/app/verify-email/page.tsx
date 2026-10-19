"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<VerifyEmailLoadingFallback />}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

function VerifyEmailLoadingFallback() {
  return (
    <div className="site-frame text-secondary min-h-screen flex items-center justify-center p-[4vw]">
      <div className="w-full max-w-[480px] bg-primary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.5vw] p-[6vw] sm:p-[2.5vw] drop-shadow-soft text-center">
        <div className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] border-2 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto mb-[2vw]" />
        <h2 className="mediumText text-secondary">Verifying your email...</h2>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    token
      ? ""
      : "No verification token provided. Please check the link from your email."
  );
  const [resending, startResendTransition] = useTransition();
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function verify() {
      try {
        const res = await fetch(
          `/api/v1/auth/verify-email?token=${encodeURIComponent(token!)}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(
            data.error || "The verification link is invalid or has expired."
          );
        }
      } catch {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(
          "An unexpected network error occurred while verifying your email."
        );
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = () => {
    startResendTransition(async () => {
      try {
        setResendStatus(null);
        const res = await fetch("/api/v1/auth/verify-email/resend", {
          method: "POST",
        });
        const data = await res.json();
        if (res.ok) {
          setResendStatus("A fresh verification email has been dispatched to your inbox.");
        } else {
          setResendStatus(data.error || "Failed to resend. Please sign in first.");
        }
      } catch {
        setResendStatus("Network error occurred while requesting resend.");
      }
    });
  };

  return (
    <div className="site-frame text-secondary min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="header p-[4vw] sm:p-[2vw] flex justify-between items-center select-none">
        <Link href="/" className="mediumText font-medium text-secondary">
          musi5t
        </Link>
        <Link
          href="/feed"
          className="extraSmallText text-secondary/60 hover:text-secondary transition-colors"
        >
          Explore Feed →
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-[4vw]">
        <div className="w-full max-w-[500px] bg-primary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.5vw] p-[6vw] sm:p-[3vw] drop-shadow-soft">
          {status === "loading" && (
            <div className="text-center py-[2vw]">
              <div className="w-[10vw] h-[10vw] sm:w-[2.5vw] sm:h-[2.5vw] border-2 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto mb-[4vw] sm:mb-[1.5vw]" />
              <h2 className="mediumText text-secondary mb-[0.8vw]">
                Verifying your account
              </h2>
              <p className="extraSmallText text-secondary/60 leading-relaxed">
                Confirming your email signature with the musi5t taste network...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-[1vw]">
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
                Account Verified
              </h2>
              <p className="extraSmallText text-secondary/70 leading-relaxed mb-[6vw] sm:mb-[2vw]">
                Your email has been confirmed. You now have full access to curate your Top 5 rotation, post sleeve notes, rate records, and follow curators.
              </p>

              <div className="flex flex-col sm:flex-row gap-[2.5vw] sm:gap-[1vw] justify-center">
                <Link
                  href="/feed"
                  className="main-btn !px-[5vw] sm:!px-[1.6vw] !py-[2.5vw] sm:!py-[0.7vw] justify-center text-center"
                >
                  <span className="main-btn__label text-secondary font-medium">
                    Go to Feed →
                  </span>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-[1vw]">
              <div className="w-[12vw] h-[12vw] sm:w-[3.5vw] sm:h-[3.5vw] rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-[4vw] sm:mb-[1.5vw]">
                <svg
                  className="w-[6vw] h-[6vw] sm:w-[1.8vw] sm:h-[1.8vw]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              <h2 className="mediumText text-secondary mb-[0.8vw]">
                Verification Failed
              </h2>
              <p className="extraSmallText text-secondary/70 leading-relaxed mb-[6vw] sm:mb-[2vw]">
                {errorMessage}
              </p>

              {resendStatus && (
                <div className="p-[3vw] sm:p-[1vw] rounded-[0.35vw] bg-secondary/[0.04] border border-secondary/10 mb-[4vw] sm:mb-[1.5vw] text-left">
                  <p className="detailText text-secondary/80">{resendStatus}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-[2.5vw] sm:gap-[1vw] justify-center">
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResend}
                  className="px-[4vw] py-[2.2vw] sm:px-[1.4vw] sm:py-[0.65vw] rounded-[0.35vw] border border-secondary/20 hover:border-secondary/40 text-secondary extraSmallText font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend Verification Link"}
                </button>
                <Link
                  href="/login"
                  className="px-[4vw] py-[2.2vw] sm:px-[1.4vw] sm:py-[0.65vw] rounded-[0.35vw] bg-secondary text-primary extraSmallText font-medium hover:opacity-90 transition-opacity"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-[4vw] sm:p-[2vw] text-center detailText text-secondary/40">
        © 2026 musi5t. The album-centric social network.
      </footer>
    </div>
  );
}
