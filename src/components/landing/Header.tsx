"use client";

import Link from "next/link";
import { getLenis } from "@/lib/lenis-store";

export function Header() {
  const scrollTo = (hash: string) => {
    const target = document.querySelector(hash) as HTMLElement | null;
    if (!target) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2, offset: 0 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 1. Difference Blended Typography Header */}
      <header className="header header-blend">
        <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
          {/* Brand Wordmark */}
          <div className="mediumText col-span-3 sm:col-span-3 flex justify-start items-center">
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
                Feed,
              </Link>
              <Link href="/lists" className="nav-btn cursor-pointer">
                Lists,
              </Link>
              <Link href="/rankings" className="nav-btn cursor-pointer">
                Rankings,
              </Link>
              <Link href="/releases" className="nav-btn cursor-pointer">
                Releases
              </Link>
            </span>
          </div>

          {/* CTA Links */}
          <div className="col-span-3 sm:col-span-3 flex justify-end items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-[3.5vw] sm:text-[0.85vw] font-medium opacity-70 hover:opacity-100 transition-opacity"
            >
              Sign in
            </Link>
            {/* Structural spacer matching Join button dimensions */}
            <div
              className="invisible pointer-events-none select-none main-btn smallText !opacity-0 !px-[3vw] sm:!px-[0.6vw] !py-[1.5vw] sm:!py-[0.25vw] !gap-[1.5vw] sm:!gap-[0.5vw]"
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
          <div className="col-span-3 sm:col-span-9" />
          <div className="col-span-3 sm:col-span-3 flex justify-end items-center pointer-events-auto">
            <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
              <Link
                href="/register"
                className="main-btn smallText !px-[3vw] sm:!px-[0.6vw] !py-[1.5vw] sm:!py-[0.25vw] !gap-[1.5vw] sm:!gap-[0.5vw]"
              >
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

