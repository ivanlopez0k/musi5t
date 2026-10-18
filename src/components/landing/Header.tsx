"use client";

import Link from "next/link";
import { getLenis } from "@/lib/lenis-store";

export function Header() {
  const scrollTo = (hash: string) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(hash, { duration: 1.2 });
    } else {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 1. Difference Blended Typography Header */}
      <header className="header header-blend">
        <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
          {/* Brand Wordmark */}
          <div className="mediumText col-span-3 flex justify-start items-center">
            <button
              type="button"
              onClick={() => scrollTo("#hero")}
              className="nav-btn cursor-pointer text-left"
            >
              musi5t
            </button>
          </div>

          {/* Navigation Group */}
          <div className="smallText col-span-6 justify-center items-center hidden sm:flex">
            <span className="nav-group flex gap-[0.25vw]">
              <button
                type="button"
                onClick={() => scrollTo("#about")}
                className="nav-btn cursor-pointer"
              >
                About,
              </button>
              <button
                type="button"
                onClick={() => scrollTo("#features")}
                className="nav-btn cursor-pointer"
              >
                Features,
              </button>
              <button
                type="button"
                onClick={() => scrollTo("#records")}
                className="nav-btn cursor-pointer"
              >
                Records,
              </button>
              <button
                type="button"
                onClick={() => scrollTo("#how-it-works")}
                className="nav-btn cursor-pointer"
              >
                How it works,
              </button>
              <Link href="/feed" className="nav-btn cursor-pointer">
                Feed
              </Link>
            </span>
          </div>

          {/* CTA Links */}
          <div className="col-span-3 flex justify-end items-center gap-4">
            <Link
              href="/login"
              className="opacity-70 hover:opacity-100 text-[1.1vw] sm:text-[0.85vw] font-medium transition-opacity"
            >
              Sign in
            </Link>
            {/* Structural spacer matching Join button dimensions */}
            <div
              className="invisible pointer-events-none select-none main-btn smallText !opacity-0"
              aria-hidden="true"
            >
              <span className="main-btn__icon" />
              <span className="main-btn__label">Join musi5t</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Normal Stacking UI Header (keeps yellow button un-blended) */}
      <header className="header header-actions">
        <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-none select-none">
          <div className="col-span-9" />
          <div className="col-span-3 flex justify-end items-center pointer-events-auto">
            <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
              <Link href="/register" className="main-btn smallText">
                <span className="main-btn__icon" aria-hidden="true" />
                <span className="main-btn__label">
                  <span className="main-btn__clip">
                    <span className="main-btn__from">Join musi5t</span>
                    <span className="main-btn__to" aria-hidden="true">
                      Join musi5t
                    </span>
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

