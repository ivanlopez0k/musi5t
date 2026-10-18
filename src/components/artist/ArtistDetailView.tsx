"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import { ArtistFollowButton } from "./ArtistFollowButton";
import { ArtistRatingWidget } from "./ArtistRatingWidget";
import {
  InteractivePostList,
  type CurrentUserSummary,
} from "@/components/feed/FeedView";
import type { FeedPost } from "@/lib/feed/visibility";
import type { ArtistData } from "@/lib/catalog/artist";

interface ArtistDetailViewProps {
  artist: ArtistData;
  currentUser: CurrentUserSummary | null;
  artistPosts: FeedPost[];
}

export function ArtistDetailView({
  artist,
  currentUser,
  artistPosts,
}: ArtistDetailViewProps) {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [followersCount, setFollowersCount] = useState<number>(
    artist.followersCount
  );

  // Lenis smooth scroll initialization (matching Album, Profile, Feed)
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
                {/* Left: Brand Wordmark */}
                <div className="mediumText col-span-3 flex justify-start items-center">
                  <Link
                    href={currentUser ? "/feed" : "/"}
                    className="nav-btn nav-blend cursor-pointer text-left"
                  >
                    musi5t
                  </Link>
                </div>

                {/* Center Navigation Group */}
                <div className="smallText col-span-5 justify-center items-center hidden sm:flex">
                  <span className="nav-group nav-blend flex items-center gap-[0.5vw]">
                    <Link href="/feed" className="nav-btn cursor-pointer">
                      Feed
                    </Link>
                    <span className="opacity-35">•</span>
                    <Link href="/rankings" className="nav-btn cursor-pointer">
                      Rankings
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
                      <Link
                        href={`/@${currentUser.username}`}
                        className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full overflow-hidden border border-secondary/25 hover:border-secondary transition-all drop-shadow flex items-center justify-center shrink-0 group"
                        title={`@${currentUser.username}`}
                      >
                        {currentUser.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.displayName || currentUser.username}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-[3.2vw] sm:text-[0.9vw] font-semibold text-secondary">
                            {currentUser.displayName?.[0] ||
                              currentUser.username[0]?.toUpperCase()}
                          </span>
                        )}
                      </Link>
                    </>
                  ) : (
                    <div className="flex items-center gap-[1.5vw] sm:gap-[0.8vw]">
                      <Link
                        href="/login"
                        className="nav-blend opacity-70 hover:opacity-100 smallText transition-opacity"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className="main-btn smallText cursor-pointer"
                      >
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">Sign up</span>
                            <span className="main-btn__to" aria-hidden="true">
                              Sign up
                            </span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Scrollable Layout Content */}
            <main
              ref={mainRef}
              className="lenis-scroll-container overflow-y-auto max-h-screen"
            >
              <div
                ref={contentRef}
                className="layout-content bg-primary text-secondary"
              >
                {/* 1. HERO SECTION */}
                <section
                  id="artist-overview"
                  data-nav-color="secondary"
                  className="w-full pt-[22vw] sm:pt-[9vw] pb-[5vw] sm:pb-[3vw]"
                >
                  <div className="layout-grid mb-[2vw] sm:mb-[1vw]">
                    <div className="col-span-full">
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
                  </div>

                  <div className="layout-grid items-end pb-[5vw] sm:pb-[3vw] border-b border-secondary/15">
                    {/* Left: Artist Image Card */}
                    <div className="col-span-full sm:col-span-3 max-w-[55vw] sm:max-w-none aspect-square rounded-[0.5vw] overflow-hidden drop-shadow-soft bg-secondary mb-[3.5vw] sm:mb-0">
                      {artist.pictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={artist.pictureUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/10 text-secondary/40">
                          <span className="text-[12vw] sm:text-[4vw]">♪</span>
                          <span className="extraSmallText text-secondary/40 mt-[1vw] sm:mt-[0.3vw]">
                            artist profile
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Artist Metadata Column */}
                    <div className="col-span-full sm:col-span-9 flex flex-col justify-end gap-[1.5vw] sm:gap-[0.7vw] sm:pl-[2.5vw]">
                      <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
                        <div className="drop-shadow rounded-[0.2vw]">
                          <div className="w-[3.5vw] h-[3.5vw] sm:w-[1vw] sm:h-[1vw] rounded-[0.15vw] bg-yellow" />
                        </div>
                        <span className="extraSmallText text-secondary/60">
                          artist profile
                        </span>
                      </div>

                      <h1 className="text-[6.5vw] sm:text-[3vw] font-light text-secondary leading-tight tracking-tight">
                        {artist.name}
                      </h1>

                      {/* Stats Bar */}
                      <div className="flex flex-wrap items-center gap-[2.5vw] sm:gap-[1.2vw] pt-[0.5vw] text-secondary/70 smallText">
                        <span>
                          {artist.albums.length}{" "}
                          {artist.albums.length === 1 ? "record" : "records"}
                        </span>
                        <span className="text-secondary/35">•</span>
                        <span>
                          {followersCount}{" "}
                          {followersCount === 1 ? "follower" : "followers"}
                        </span>
                        {artist.careerSpan ? (
                          <>
                            <span className="text-secondary/35">•</span>
                            <span>{artist.careerSpan}</span>
                          </>
                        ) : null}
                      </div>

                      {/* Action Button */}
                      <div className="pt-[1.5vw] sm:pt-[0.8vw]">
                        <ArtistFollowButton
                          artistName={artist.name}
                          initialFollowing={artist.isFollowing}
                          isLoggedIn={!!currentUser}
                          onFollowChange={(_, count) => setFollowersCount(count)}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. COMMUNITY ARTIST RATING WIDGET */}
                <section
                  id="artist-rating"
                  className="w-full pb-[6vw] sm:pb-[3.5vw]"
                >
                  <div className="layout-grid">
                    <div className="col-span-full">
                      <ArtistRatingWidget
                        artistName={artist.name}
                        initialUserScore={artist.userScore}
                        initialAverageScore={artist.averageScore}
                        initialRatingsCount={artist.ratingsCount}
                        isLoggedIn={!!currentUser}
                      />
                    </div>
                  </div>
                </section>

                {/* 3. STUDIO DISCOGRAPHY SECTION */}
                <section
                  id="artist-discography"
                  className="w-full pb-[8vw] sm:pb-[4.5vw]"
                >
                  <div className="layout-grid mb-[3.5vw] sm:mb-[1.8vw]">
                    <div className="col-span-full flex items-baseline justify-between border-b border-secondary/15 pb-[1.8vw] sm:pb-[0.8vw]">
                      <div className="flex items-center gap-[2vw] sm:gap-[0.8vw]">
                        <h2 className="mediumText font-normal text-secondary">
                          studio discography
                        </h2>
                        <span className="extraSmallText text-secondary/50">
                          ({artist.albums.length}{" "}
                          {artist.albums.length === 1 ? "record" : "records"})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="layout-grid">
                    {artist.albums.length === 0 ? (
                      <div className="col-span-full p-[6vw] sm:p-[3vw] text-center border border-dashed border-secondary/20 rounded-[0.5vw] bg-secondary/[0.02]">
                        <p className="smallText text-secondary/60">
                          No albums found for this artist in the catalog.
                        </p>
                      </div>
                    ) : (
                      <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-[4vw] sm:gap-[1.5vw]">
                        {artist.albums.map((album) => (
                          <Link
                            key={album.id}
                            href={`/album/${album.id}`}
                            className="group flex flex-col gap-[1.5vw] sm:gap-[0.5vw] cursor-pointer"
                          >
                            <div className="aspect-square w-full rounded-[0.4vw] overflow-hidden drop-shadow-soft bg-secondary relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  album.defaultCoverUrl ||
                                  "/images/musi5t/vinyl_player.webp"
                                }
                                alt={album.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {album.averageScore !== null && (
                                <div className="absolute top-[1.5vw] right-[1.5vw] sm:top-[0.5vw] sm:right-[0.5vw] bg-yellow text-secondary font-medium extraSmallTextBold px-[1.5vw] py-[0.4vw] sm:px-[0.5vw] sm:py-[0.15vw] rounded-[0.2vw] drop-shadow">
                                  {album.averageScore.toFixed(1)}
                                </div>
                              )}
                            </div>

                            <span className="smallText font-medium text-secondary truncate group-hover:underline">
                              {album.title}
                            </span>

                            <div className="flex items-center justify-between text-secondary/50 extraSmallText">
                              <span>{album.releaseYear || "—"}</span>
                              {album.ratingsCount > 0 ? (
                                <span>
                                  {album.ratingsCount}{" "}
                                  {album.ratingsCount === 1 ? "rating" : "ratings"}
                                </span>
                              ) : null}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* 4. COMMUNITY DISCUSSIONS */}
                <section
                  id="artist-discussions"
                  data-nav-color="secondary"
                  className="w-full pt-[6vw] sm:pt-[4vw] pb-[10vw] sm:pb-[6vw] border-t border-secondary/15"
                >
                  <div className="layout-grid mb-[4vw] sm:mb-[2.5vw]">
                    <div className="col-span-full flex items-center justify-between">
                      <div className="flex items-center gap-[2vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                        </div>
                        <h2 className="mediumText lowercase">community discussions</h2>
                      </div>
                      <span className="extraSmallText text-secondary/50">
                        [ #{artist.name} thread • {artistPosts.length} ]
                      </span>
                    </div>
                  </div>

                  <div className="layout-grid items-start">
                    {/* Left Column: Editorial Context */}
                    <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] sm:gap-[0.8vw] mb-[5vw] sm:mb-0">
                      <span className="smallText font-medium text-secondary">
                        Listener reviews & conversation
                      </span>
                      <p className="extraSmallText text-secondary/60 leading-relaxed sm:pr-[2vw]">
                        Discussions and sleeve notes tagging records by {artist.name} across the musi5t network.
                      </p>
                      <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit mt-[1vw] sm:mt-[0.4vw]">
                        <Link href="/feed" className="main-btn smallText text-secondary">
                          <span className="main-btn__icon" aria-hidden="true" />
                          <span className="main-btn__label">
                            <span className="main-btn__clip">
                              <span className="main-btn__from">
                                Post about this artist
                              </span>
                              <span className="main-btn__to" aria-hidden="true">
                                Post about this artist
                              </span>
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: Interactive Post List */}
                    <div className="col-span-full sm:col-span-8">
                      {artistPosts.length === 0 ? (
                        <div className="p-[6vw] sm:p-[3vw] border border-secondary/15 rounded-[0.5vw] bg-primary drop-shadow-soft flex flex-col items-start gap-[1.5vw] sm:gap-[0.8vw]">
                          <span className="smallText font-medium text-secondary">
                            No discussions about {artist.name} yet.
                          </span>
                          <p className="extraSmallText text-secondary/55">
                            Tag an album by this artist in the feed to start a thread.
                          </p>
                          <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit mt-[0.5vw]">
                            <Link href="/feed" className="main-btn smallText text-secondary">
                              <span className="main-btn__icon" aria-hidden="true" />
                              <span className="main-btn__label">
                                <span className="main-btn__clip">
                                  <span className="main-btn__from">Go to feed</span>
                                  <span className="main-btn__to" aria-hidden="true">
                                    Go to feed
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <InteractivePostList
                          posts={artistPosts}
                          currentUser={currentUser}
                          variant="light"
                        />
                      )}
                    </div>
                  </div>
                </section>

                {/* 5. EDITORIAL DARK FOOTER */}
                <footer
                  data-nav-color="primary"
                  className="bg-secondary text-primary layout-grid py-[6vw] px-[var(--margin)] mt-[8vw] border-t border-primary/10 select-none"
                >
                  {/* Platform Links */}
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[8vw] sm:mb-0">
                    <span className="extraSmallText text-primary/40 font-mono">
                      artist catalog
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
                      onClick={() => scrollTo("#artist-overview")}
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
                      <span className="opacity-40 truncate max-w-[14vw]">
                        {artist.name}
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
