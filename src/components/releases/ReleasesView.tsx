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
import type { ReleasesFeedData } from "@/lib/catalog/releases";

interface ReleasesViewProps {
  data: ReleasesFeedData;
  currentUser: CurrentUserSummary | null;
}

export function ReleasesView({ data, currentUser }: ReleasesViewProps) {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { groups, totalReleases, activeView, followedArtistsCount } = data;

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

                {/* Center Navigation Group (Feed • Rankings • Releases) */}
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
                    <Link href="/rankings" className="nav-btn cursor-pointer">
                      Rankings
                    </Link>
                    <span className="opacity-35">•</span>
                    <button
                      type="button"
                      onClick={() => scrollTo("#releases-top")}
                      className="nav-btn cursor-pointer font-medium"
                    >
                      Releases
                    </button>
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
                      <Link
                        href={`/@${currentUser.username}`}
                        className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full overflow-hidden border border-current/25 hover:border-current transition-all drop-shadow flex items-center justify-center shrink-0 group"
                        title={`@${currentUser.username}`}
                      >
                        <UserAvatar
                          avatarUrl={currentUser.avatarUrl}
                          displayName={
                            currentUser.displayName || currentUser.username
                          }
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
              <div
                ref={contentRef}
                className="layout-content bg-primary text-secondary"
              >
                <section
                  id="releases-top"
                  data-nav-color="secondary"
                  className="w-full min-h-lvh pt-[22vw] sm:pt-[9vw] pb-[10vw] sm:pb-[6vw]"
                >
                  <div className="layout-grid">
                    {/* Centered Releases Column */}
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
                          <h1 className="largeText lowercase">release radar</h1>
                        </div>
                        <p className="smallText text-secondary/60">
                          new music friday drops, announced albums, and releases from your taste network
                        </p>
                      </div>

                      {/* Radar Switcher Tabs */}
                      <div className="flex flex-wrap items-center gap-[4vw] sm:gap-[1.5vw] mb-[4vw] sm:mb-[2.5vw] border-b border-secondary/15 pb-[1.5vw] sm:pb-[0.8vw]">
                        <Link
                          href="/releases?view=this-week"
                          className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                            activeView === "this-week"
                              ? "text-secondary font-medium border-secondary"
                              : "text-secondary/40 hover:text-secondary/75 border-transparent"
                          }`}
                        >
                          {activeView === "this-week" && (
                            <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                          )}
                          <span>this week</span>
                        </Link>

                        <Link
                          href="/releases?view=upcoming"
                          className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                            activeView === "upcoming"
                              ? "text-secondary font-medium border-secondary"
                              : "text-secondary/40 hover:text-secondary/75 border-transparent"
                          }`}
                        >
                          {activeView === "upcoming" && (
                            <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                          )}
                          <span>upcoming</span>
                        </Link>

                        <Link
                          href="/releases?view=my-artists"
                          className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                            activeView === "my-artists"
                              ? "text-secondary font-medium border-secondary"
                              : "text-secondary/40 hover:text-secondary/75 border-transparent"
                          }`}
                        >
                          {activeView === "my-artists" && (
                            <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                          )}
                          <span>from my artists</span>
                          {currentUser && (
                            <span className="px-[1.2vw] py-[0.2vw] sm:px-[0.4vw] sm:py-[0.05vw] rounded-[0.2vw] bg-secondary/8 text-secondary/60 text-[2.4vw] sm:text-[0.65vw] font-mono">
                              {followedArtistsCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/releases?view=recent"
                          className={`smallText lowercase flex items-center gap-[1vw] sm:gap-[0.4vw] pb-[0.5vw] sm:pb-[0.2vw] border-b-2 transition-all cursor-pointer ${
                            activeView === "recent"
                              ? "text-secondary font-medium border-secondary"
                              : "text-secondary/40 hover:text-secondary/75 border-transparent"
                          }`}
                        >
                          {activeView === "recent" && (
                            <span className="w-[1.5vw] h-[1.5vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-yellow inline-block" />
                          )}
                          <span>past 30 days</span>
                        </Link>
                      </div>

                      {/* Content: Groups by Date */}
                      {totalReleases === 0 ? (
                        <div className="p-[6vw] sm:p-[3.5vw] border border-secondary/15 rounded-[0.5vw] bg-primary drop-shadow-soft flex flex-col items-start gap-[1.5vw] sm:gap-[0.8vw]">
                          <span className="smallText font-medium text-secondary">
                            {activeView === "my-artists"
                              ? followedArtistsCount === 0
                                ? "You haven't followed any artists yet."
                                : "No releases found from your followed artists."
                              : "No releases found in this timeframe."}
                          </span>
                          <p className="extraSmallText text-secondary/55">
                            {activeView === "my-artists"
                              ? followedArtistsCount === 0
                                ? "Follow your favorite artists on their discography pages to track their Friday drops and album announcements right here."
                                : "When your followed artists announce new albums or drop records on Friday, they will appear here automatically."
                              : "Check back on New Music Friday or browse all-time records in the community rankings."}
                          </p>
                          <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit mt-[0.5vw]">
                            <Link
                              href="/rankings"
                              className="main-btn smallText text-secondary"
                            >
                              <span
                                className="main-btn__icon"
                                aria-hidden="true"
                              />
                              <span className="main-btn__label">
                                <span className="main-btn__clip">
                                  <span className="main-btn__from">
                                    Explore rankings
                                  </span>
                                  <span
                                    className="main-btn__to"
                                    aria-hidden="true"
                                  >
                                    Explore rankings
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-[8vw] sm:gap-[4vw]">
                          {groups.map((group) => (
                            <div key={group.dateKey} className="flex flex-col">
                              {/* Date Group Header */}
                              <div className="flex items-center justify-between pb-[1.5vw] sm:pb-[0.8vw] mb-[3vw] sm:mb-[1.5vw] border-b border-secondary/10">
                                <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
                                  <span className="w-[1.8vw] h-[1.8vw] sm:w-[0.5vw] sm:h-[0.5vw] rounded-full bg-yellow" />
                                  <h2 className="mediumText lowercase font-medium">
                                    {group.dateLabel}
                                  </h2>
                                </div>
                                <span className="extraSmallText text-secondary/45 font-mono">
                                  [ {group.albums.length}{" "}
                                  {group.albums.length === 1
                                    ? "record"
                                    : "records"}{" "}
                                  ]
                                </span>
                              </div>

                              {/* Responsive Grid of Release Cards */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[3vw] sm:gap-[1.5vw]">
                                {group.albums.map((album) => (
                                  <div
                                    key={album.id}
                                    className="bg-primary border border-secondary/15 rounded-[0.4vw] drop-shadow-soft overflow-hidden flex flex-col group hover:border-secondary/40 transition-colors"
                                  >
                                    {/* Cover Image & Hover Trigger */}
                                    <Link
                                      href={`/album/${album.id}`}
                                      className="w-full aspect-square overflow-hidden bg-secondary relative block"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={album.coverUrl || "/images/musi5t/vinyl_player.webp"}
                                        alt={album.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />

                                      {/* Followed Artist Pill Badge */}
                                      {album.isFollowedArtist && (
                                        <div className="absolute top-[1vw] left-[1vw] sm:top-[0.4vw] sm:left-[0.4vw] bg-secondary/90 text-primary text-[2.2vw] sm:text-[0.6vw] px-[1.5vw] py-[0.4vw] sm:px-[0.45vw] sm:py-[0.12vw] rounded-[0.2vw] font-medium backdrop-blur-sm drop-shadow">
                                          from your artists
                                        </div>
                                      )}

                                      {/* Rating Pill Overlay if scored */}
                                      {album.averageScore !== null && (
                                        <div className="absolute bottom-[1vw] right-[1vw] sm:bottom-[0.4vw] sm:right-[0.4vw] bg-yellow text-secondary text-[2.2vw] sm:text-[0.65vw] px-[1.4vw] py-[0.3vw] sm:px-[0.4vw] sm:py-[0.1vw] rounded-[0.2vw] font-bold drop-shadow">
                                          {album.averageScore} ★
                                        </div>
                                      )}
                                    </Link>

                                    {/* Details */}
                                    <div className="p-[2.5vw] sm:p-[1vw] flex flex-col flex-1 justify-between gap-[1vw] sm:gap-[0.4vw]">
                                      <div className="flex flex-col">
                                        <Link
                                          href={`/album/${album.id}`}
                                          className="smallText font-medium text-secondary truncate group-hover:underline leading-tight"
                                          title={album.title}
                                        >
                                          {album.title}
                                        </Link>

                                        <Link
                                          href={`/artist/${encodeURIComponent(album.artistName)}`}
                                          className="extraSmallText text-secondary/60 hover:text-secondary hover:underline truncate mt-[0.5vw] sm:mt-[0.2vw]"
                                          title={album.artistName}
                                        >
                                          {album.artistName}
                                        </Link>
                                      </div>

                                      {/* Bottom meta stats */}
                                      <div className="flex items-center justify-between pt-[1.5vw] sm:pt-[0.6vw] border-t border-secondary/10 mt-[1.5vw] sm:mt-[0.6vw]">
                                        <span className="detailText text-secondary/45 font-mono">
                                          {album.releaseDate
                                            ? album.releaseDate.slice(5)
                                            : album.releaseYear || "2026"}
                                        </span>

                                        {album.curatorsCount > 0 ? (
                                          <span className="detailText text-secondary/60 font-medium">
                                            {album.curatorsCount} in top 5
                                          </span>
                                        ) : album.ratingsCount > 0 ? (
                                          <span className="detailText text-secondary/50">
                                            {album.ratingsCount}{" "}
                                            {album.ratingsCount === 1
                                              ? "rating"
                                              : "ratings"}
                                          </span>
                                        ) : (
                                          <span className="detailText text-secondary/35">
                                            new release
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Editorial Dark Footer (matching Home, Profile, Feed & Rankings) */}
                <footer
                  data-nav-color="primary"
                  className="bg-secondary text-primary layout-grid py-[6vw] px-[var(--margin)] mt-[8vw] border-t border-primary/10 select-none"
                >
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[8vw] sm:mb-0">
                    <span className="largeText lowercase tracking-tight">
                      musi5t
                    </span>
                    <p className="extraSmallText text-primary/60 max-w-[28vw] leading-relaxed">
                      album-first social space. rate, curate, and debate vinyl &
                      records with people who listen from front to back.
                    </p>
                  </div>

                  <div className="col-span-full sm:col-span-8 flex flex-wrap justify-between gap-[6vw] sm:gap-[3vw]">
                    <div className="flex flex-col gap-[0.8vw]">
                      <span className="extraSmallTextBold text-primary/40 uppercase tracking-widest">
                        explore
                      </span>
                      <Link
                        href="/feed"
                        className="smallText text-primary/80 hover:text-primary transition-colors"
                      >
                        feed
                      </Link>
                      <Link
                        href="/rankings"
                        className="smallText text-primary/80 hover:text-primary transition-colors"
                      >
                        rankings
                      </Link>
                      <Link
                        href="/releases"
                        className="smallText text-primary/80 hover:text-primary transition-colors font-medium text-yellow"
                      >
                        releases
                      </Link>
                    </div>

                    <div className="flex flex-col gap-[0.8vw]">
                      <span className="extraSmallTextBold text-primary/40 uppercase tracking-widest">
                        account
                      </span>
                      {currentUser ? (
                        <>
                          <Link
                            href={`/@${currentUser.username}`}
                            className="smallText text-primary/80 hover:text-primary transition-colors"
                          >
                            profile (@{currentUser.username})
                          </Link>
                          <Link
                            href="/settings"
                            className="smallText text-primary/80 hover:text-primary transition-colors"
                          >
                            settings
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="smallText text-primary/80 hover:text-primary transition-colors"
                          >
                            sign in
                          </Link>
                          <Link
                            href="/register"
                            className="smallText text-primary/80 hover:text-primary transition-colors"
                          >
                            join musi5t
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-[0.8vw]">
                      <span className="extraSmallTextBold text-primary/40 uppercase tracking-widest">
                        legal & build
                      </span>
                      <span className="extraSmallText text-primary/50">
                        musi5t v0.1.0 • 2026
                      </span>
                      <span className="extraSmallText text-primary/40">
                        album-first music curation
                      </span>
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
