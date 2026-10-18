import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const instant = false;

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/feed");
  }

  return (
    <div className="site-frame text-secondary">
      <div className="site-layout">
        <div className="app">
          <div className="route-surface">
            {/* Unauthenticated Navbar matching Feed & Rankings */}
            <header className="header">
              <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
                {/* Brand Wordmark */}
                <div className="mediumText col-span-3 flex justify-start items-center">
                  <Link href="/" className="nav-btn cursor-pointer text-left nav-blend">
                    musi5t
                  </Link>
                </div>

                {/* Center Navigation Group (Feed • Rankings) */}
                <div className="smallText col-span-5 justify-center items-center hidden sm:flex">
                  <span className="nav-group flex items-center gap-[0.5vw] nav-blend">
                    <Link href="/feed" className="nav-btn cursor-pointer">
                      Feed
                    </Link>
                    <span className="opacity-35">•</span>
                    <Link href="/rankings" className="nav-btn cursor-pointer">
                      Rankings
                    </Link>
                  </span>
                </div>

                {/* Right Actions: Sign in + Join musi5t */}
                <div className="col-span-9 sm:col-span-4 flex justify-end items-center gap-[2.5vw] sm:gap-[1vw]">
                  <Link
                    href="/login"
                    className="nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
                  >
                    Sign in
                  </Link>
                  <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                    <Link
                      href="/register"
                      className="main-btn !px-[3vw] sm:!px-[1vw] !py-[1.2vw] sm:!py-[0.4vw] !gap-[1.5vw] sm:!gap-[0.5vw]"
                    >
                      <div className="main-btn__icon !w-[3vw] !h-[3vw] sm:!w-[0.9vw] sm:!h-[0.9vw] !rounded-[0.6vw] sm:!rounded-[0.2vw]" />
                      <span className="main-btn__label text-[3vw] sm:text-[0.8vw] font-medium text-secondary">
                        Join musi5t
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Main Area */}
            <main className="overflow-y-auto">
              {/* Subtle ambient lighting */}
              <div
                className="pointer-events-none fixed -top-[12vw] -right-[12vw] w-[40vw] h-[40vw] rounded-full bg-yellow/20 blur-[9vw]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none fixed -bottom-[12vw] -left-[12vw] w-[40vw] h-[40vw] rounded-full bg-yellow/15 blur-[9vw]"
                aria-hidden="true"
              />

              <div className="relative z-10 w-full min-h-screen flex flex-col justify-between pt-[18vw] sm:pt-[7.5vw] pb-[6vw] sm:pb-[2.5vw]">
                {/* Form Content */}
                <div className="flex-1 flex items-center justify-center my-auto">
                  {children}
                </div>

                {/* Editorial Footer */}
                <footer className="layout-grid pt-[6vw] sm:pt-[3vw] text-secondary/40 detailText text-center sm:text-left mt-auto">
                  <div className="col-span-full sm:col-span-6">
                    musi5t &copy; 2026 &mdash; Curate your essential 5. Connect through records.
                  </div>
                  <div className="col-span-full sm:col-span-6 flex justify-center sm:justify-end gap-[3vw] sm:gap-[1vw] mt-[2vw] sm:mt-0">
                    <Link href="/" className="hover:text-secondary transition-colors">
                      Home
                    </Link>
                    <span>&bull;</span>
                    <Link href="/feed" className="hover:text-secondary transition-colors">
                      Feed
                    </Link>
                    <span>&bull;</span>
                    <Link href="/rankings" className="hover:text-secondary transition-colors">
                      Rankings
                    </Link>
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
