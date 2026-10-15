"use client";

import Link from "next/link";
import { getLenis } from "@/lib/lenis-store";

interface HeaderProps {
  onOpenPlayer: () => void;
}

export function Header({ onOpenPlayer }: HeaderProps) {
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
    <header className="header">
      <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
        {/* Brand Wordmark */}
        <div className="text-secondary mediumText col-span-3 flex justify-start items-center">
          <button
            type="button"
            onClick={() => scrollTo("#hero")}
            className="nav-btn cursor-pointer text-left"
          >
            musi5t
          </button>
        </div>

        {/* Navigation Group */}
        <div className="text-secondary smallText col-span-6 justify-center items-center hidden sm:flex">
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
              How it works
            </button>
          </span>
        </div>

        {/* CTA Button */}
        <div className="col-span-3 flex justify-end items-center gap-4">
          <Link
            href="/login"
            className="text-secondary/60 hover:text-secondary text-[1.1vw] sm:text-[0.85vw] font-medium transition-colors"
          >
            Sign in
          </Link>
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

        {/* Press 'm' trigger */}
        <span
          onClick={onOpenPlayer}
          className="text-[1vw] font-normal text-secondary/30 hover:text-secondary/70 duration-300 absolute bottom-[-1.75vw] sm:block hidden cursor-pointer"
        >
          <span className="text-hover cursor-pointer w-fit">
            press &apos;m&apos; for player
          </span>
        </span>
      </div>
    </header>
  );
}
