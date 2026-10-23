"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import type { CurrentUserSummary } from "@/components/feed/FeedView";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LogoutButton } from "@/components/ui/LogoutButton";

export interface RankedAlbumItem {
  id: string;
  title: string;
  artistName: string;
  releaseYear: number | null;
  defaultCoverUrl: string | null;
  averageScore: string | null;
  ratingsCount: number;
  curatorsCount: number;
}

interface RankingsViewProps {
  rankedAlbums: RankedAlbumItem[];
  currentUser: CurrentUserSummary | null;
  timeframe?: "all" | "year" | "month";
  currentYear?: number;
}

export function RankingsView({
  rankedAlbums,
  currentUser,
  timeframe = "all",
  currentYear = new Date().getFullYear(),
}: RankingsViewProps) {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Lenis smooth scroll initialization (matching Home, Profile, Feed & Settings)
  useEffect(() => {
    const mainEl = mainRef.current;
    const contentEl = contentRef.current;
    if (!mainEl || !contentEl) return;

    const lenis = new Lenis({
      wrapper: mainEl,
      content: contentEl,
      lerp: 0.18,
      wheelMultiplier: 1.05,
      smoothWheel: true,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const cleanupNav = setupNavColorTriggers(mainEl);

    const rafHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cleanupNav();
      gsap.ticker.remove(rafHandler);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  const scrollTo = (hash: string) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(hash, { duration: 1.2 });
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="site-frame text-secondary">
      <div className="site-layout">
        <div className="app">
          <div className="route-surface">
            {/* Editorial Fixed Header */}
            <header className="header">
              <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
                {/* Brand Wordmark */}
                <div className="mediumText col-span-3 flex justify-start items-center">
                  <Link
                    href={currentUser ? "/feed" : "/"}
                    className="nav-btn cursor-pointer text-left nav-blend"
                  >
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
                    <Link href="/lists" className="nav-btn cursor-pointer">
                      Lists
                    </Link>
                    <span className="opacity-35">•</span>
                    <button
                      type="button"
                      onClick={() => scrollTo("#rankings-top")}
                      className="nav-btn cursor-pointer font-medium"
                    >
                      Rankings
                    </button>
                    <span className="opacity-35">•</span>
                    <Link href="/releases" className="nav-btn cursor-pointer">
                      Releases
                    </Link>
                  </span>
                </div>

                {/* Right Actions */}
                <div className="col-span-4 flex justify-end items-center gap-[2vw] sm:gap-[1vw]">
                  {currentUser ? (
                    <>
                      <Link
                        href="/settings"
                        className="nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
                      >
                        Settings
                      </Link>
                      <LogoutButton className="nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity cursor-pointer" />
                      <Link
                        href={`/@${currentUser.username}`}
                        className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full overflow-hidden border border-current/25 hover:border-current transition-all drop-shadow flex items-center justify-center shrink-0 group"
                        title={`@${currentUser.username}`}
                      >
                        <UserAvatar
                          avatarUrl={currentUser.avatarUrl}
                          displayName={currentUser.displayName || currentUser.username}
                          themeKey={currentUser.themeKey}
                          textClassName="text-[3.2vw] sm:text-[0.8vw] font-bold leading-none"
                        />
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
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
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Scrollable Container managed by Lenis */}
            <main
              id="swup"
              ref={mainRef}
              className="transition-swup hide-scrollbar bg-primary text-secondary"
              tabIndex={-1}
            >
              <div ref={contentRef} className="layout-content bg-primary text-secondary">
                <section
                  id="rankings-top"
                  data-nav-color="secondary"
                  className="w-full min-h-lvh pt-[22vw] sm:pt-[9vw] pb-[10vw] sm:pb-[6vw]"
                >
                  <div className="layout-grid">
                    {/* Centered Rankings Column */}
                    <div className="col-span-full sm:col-start-2 sm:col-span-10">
                      {/* Back Navigation */}
                      <div className="mb-[2.5vw] sm:mb-[1.2vw]">
                        <button
                          type="button"
                          onClick={() => router.back()}
                          className="inline-flex items-center gap-[1.2vw] sm:gap-[0.45vw] extraSmallText text-secondary/60 hover:text-secondary bg-primary hover:bg-secondary/[0.04] border border-secondary/15 hover:border-secondary/35 rounded-[0.3vw] px-[2.4vw] py-[1vw] sm:px-[0.85vw] sm:py-[0.35vw] drop-shadow-soft transition-all cursor-pointer group"
                        >
                          <span className="transition-transform group-hover:-translate-x-0.5">
                            ←
                          </span>
                          <span>back</span>
                        </button>
                      </div>

                      {/* Hero Section */}
                      <div className="flex flex-col gap-[1.5vw] sm:gap-[0.7vw] pb-[3.5vw] sm:pb-[1.8vw] mb-[3vw] sm:mb-[1.8vw] border-b border-secondary/15">
                        <div className="flex items-center gap-[2vw] sm:gap-[1vw]">
                          <div className="drop-shadow rounded-[0.25vw]">
                            <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                          </div>
                          <h1 className="largeText lowercase">community rankings</h1>
                        </div>
                        <p className="smallText text-secondary/60">
                          the highest rated and most curated records across musi5t
                        </p>
                      </div>

                      {/* Timeframe Filter Tabs */}
                      <div className="flex items-center gap-[4vw] sm:gap-[1.5vw] mb-[4vw] sm:mb-[2.5vw] border-b border-secondary/15 pb-[1.5vw] sm:pb-[0.8vw]">
                        <Link
                          href="/rankings?timeframe=all"
                          className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                            timeframe === "all"
                              ? "text-secondary font-medium border-secondary"
                              : "text-secondary/40 hover:text-secondary/75 border-transparent"
                          }`}
                        >
                          {timeframe === "all" && (
                            <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                          )}
                          <span>all time</span>
                        </Link>

                        <Link
                          href="/rankings?timeframe=year"
                          className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                            timeframe === "year"
                              ? "text-secondary font-medium border-secondary"
                              : "text-secondary/40 hover:text-secondary/75 border-transparent"
                          }`}
                        >
                          {timeframe === "year" && (
                            <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                          )}
                          <span>this year ({currentYear})</span>
                        </Link>

                        <Link
                          href="/rankings?timeframe=month"
                          className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                            timeframe === "month"
                              ? "text-secondary font-medium border-secondary"
                              : "text-secondary/40 hover:text-secondary/75 border-transparent"
                          }`}
                        >
                          {timeframe === "month" && (
                            <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                          )}
                          <span>this month</span>
                        </Link>
                      </div>

                      {/* Ranked Records List */}
                      {rankedAlbums.length === 0 ? (
                        <div className="p-[6vw] sm:p-[3.5vw] border border-secondary/15 rounded-[0.5vw] bg-primary drop-shadow-soft flex flex-col items-start gap-[1.5vw] sm:gap-[0.8vw]">
                          <span className="smallText font-medium text-secondary">
                            No ranked records yet.
                          </span>
                          <p className="extraSmallText text-secondary/55">
                            Rate records or curate your Top 5 albums on your profile to build the community rankings.
                          </p>
                          <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit mt-[0.5vw]">
                            <Link
                              href={currentUser ? `/@${currentUser.username}` : "/feed"}
                              className="main-btn smallText text-secondary"
                            >
                              <span className="main-btn__icon" aria-hidden="true" />
                              <span className="main-btn__label">
                                <span className="main-btn__clip">
                                  <span className="main-btn__from">
                                    {currentUser ? "Curate your Top 5" : "Explore feed"}
                                  </span>
                                  <span className="main-btn__to" aria-hidden="true">
                                    {currentUser ? "Curate your Top 5" : "Explore feed"}
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-[0.5vw] overflow-hidden bg-primary drop-shadow-soft">
                          {rankedAlbums.map((alb, index) => {
                            const rankNumber = String(index + 1).padStart(2, "0");
                            return (
                              <Link
                                key={alb.id}
                                href={`/album/${alb.id}`}
                                className="flex items-center justify-between gap-[3vw] sm:gap-[1.5vw] p-[3vw] sm:p-[1.3vw] hover:bg-secondary/[0.03] transition-colors group"
                              >
                                <div className="flex items-center gap-[3vw] sm:gap-[1.4vw] overflow-hidden flex-1">
                                  {/* Rank Badge */}
                                  <span className="mediumText font-light text-secondary/50 min-w-[7vw] sm:min-w-[3vw] select-none">
                                    {rankNumber}
                                  </span>

                                  {/* Album Sleeve Jacket */}
                                  <div className="w-[14vw] sm:w-[4.2vw] aspect-square rounded-[0.3vw] overflow-hidden drop-shadow-soft bg-secondary flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={
                                        alb.defaultCoverUrl ||
                                        "/images/musi5t/vinyl_player.webp"
                                      }
                                      alt={alb.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  </div>

                                  {/* Album Title & Artist */}
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="mediumText font-normal text-secondary truncate group-hover:underline">
                                      {alb.title}
                                    </span>
                                    <span className="extraSmallText text-secondary/65 truncate">
                                      {alb.artistName}
                                      {alb.releaseYear ? ` • ${alb.releaseYear}` : ""}
                                    </span>
                                  </div>
                                </div>

                                {/* Right Stats */}
                                <div className="flex flex-col items-end gap-[1vw] sm:gap-[0.35vw] flex-shrink-0">
                                  <span className="bg-yellow text-secondary extraSmallTextBold px-[1.5vw] py-[0.5vw] sm:px-[0.6vw] sm:py-[0.2vw] rounded-[0.25vw] drop-shadow whitespace-nowrap">
                                    ★ {alb.averageScore || "—"} / 10
                                  </span>
                                  <span className="detailText text-secondary/45 whitespace-nowrap">
                                    {alb.ratingsCount}{" "}
                                    {alb.ratingsCount === 1 ? "rating" : "ratings"} •{" "}
                                    {alb.curatorsCount} in Top 5
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Editorial Dark Footer */}
                <footer
                  data-nav-color="primary"
                  className="bg-secondary text-primary layout-grid py-[6vw] px-[var(--margin)] mt-[8vw] border-t border-primary/10 select-none"
                >
                  {/* Platform Links */}
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[8vw] sm:mb-0">
                    <span className="extraSmallText text-primary/40 font-mono">
                      listener archive
                    </span>
                    <div className="flex flex-col gap-[0.5vw]">
                      <Link
                        href="/"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                      >
                        musi5t home
                      </Link>
                      <Link
                        href="/feed"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                      >
                        community feed
                      </Link>
                    </div>
                  </div>

                  {/* Back to top button */}
                  <div className="col-span-full sm:col-span-4 flex items-center justify-center mb-[8vw] sm:mb-0">
                    <button
                      type="button"
                      onClick={() => scrollTo("#rankings-top")}
                      className="back-to-top extraSmallText text-primary/60 hover:text-primary cursor-pointer hover:scale-105 transition-transform"
                    >
                      <span className="back-to-top__clip">
                        <span className="back-to-top__from">
                          <span className="back-to-top__arrow mr-1">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                        <span className="back-to-top__to" aria-hidden="true">
                          <span className="back-to-top__arrow mr-1">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* Copyright & Legal */}
                  <div className="col-span-full sm:col-span-4 flex flex-col sm:items-end justify-between gap-[1vw]">
                    <span className="detailText text-primary/40">
                      © 2026 musi5t. The album-centric social network.
                    </span>
                    <div className="flex gap-[1vw] detailText text-primary/50">
                      <Link href="/" className="hover:text-primary transition-colors">
                        overview
                      </Link>
                      <span>,</span>
                      <Link href="/feed" className="hover:text-primary transition-colors">
                        discussions
                      </Link>
                      <span>,</span>
                      <span className="opacity-40">rankings</span>
                    </div>
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
