"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import { AlbumFollowButton } from "./AlbumFollowButton";
import { AlbumRatingWidget } from "./AlbumRatingWidget";
import {
  InteractivePostList,
  type CurrentUserSummary,
} from "@/components/feed/FeedView";
import type { FeedPost } from "@/lib/feed/visibility";
import type { AlbumTracklist } from "@/lib/catalog/tracks";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";

export interface TopListenerItem {
  position: number;
  coverUrl: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  themeKey: string;
}

interface AlbumDetailViewProps {
  album: {
    id: string;
    title: string;
    artistName: string;
    releaseYear: number | null;
    defaultCoverUrl: string | null;
  };
  currentUser: CurrentUserSummary | null;
  isFollowingAlbum: boolean;
  userRatingScore: number | null;
  averageScore: number | null;
  ratingsCount: number;
  topListeners: TopListenerItem[];
  albumPosts: FeedPost[];
  tracklist: AlbumTracklist;
}

export function AlbumDetailView({
  album,
  currentUser,
  isFollowingAlbum,
  userRatingScore,
  averageScore,
  ratingsCount,
  topListeners,
  albumPosts,
  tracklist,
}: AlbumDetailViewProps) {
  const router = useRouter();
  const { currentTrack, isPlaying, isLoading, playTrack, pause, resume } = useAudioPlayer();
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
                        className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full overflow-hidden border border-secondary/25 hover:border-secondary transition-all drop-shadow flex items-center justify-center shrink-0 group"
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
                {/* 1. HERO SECTION */}
                <section
                  id="album-overview"
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
                    {/* Left: Album Sleeve Cover Card (balanced size) */}
                    <div className="col-span-full sm:col-span-3 max-w-[55vw] sm:max-w-none aspect-square rounded-[0.4vw] overflow-hidden drop-shadow-soft bg-secondary mb-[3.5vw] sm:mb-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={album.defaultCoverUrl || "/images/musi5t/vinyl_player.webp"}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Right: Metadata Column */}
                    <div className="col-span-full sm:col-span-9 flex flex-col justify-end gap-[1.5vw] sm:gap-[0.7vw] sm:pl-[2.5vw]">
                      <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
                        <div className="drop-shadow rounded-[0.2vw]">
                          <div className="w-[3.5vw] h-[3.5vw] sm:w-[1vw] sm:h-[1vw] rounded-[0.15vw] bg-yellow" />
                        </div>
                        <span className="extraSmallText text-secondary/60">
                          record detail
                        </span>
                      </div>

                      {/* Preserving official album title casing (no lowercase class) */}
                      <h1 className="text-[6.5vw] sm:text-[2.6vw] font-light text-secondary leading-tight tracking-tight">
                        {album.title}
                      </h1>

                      <p className="smallText sm:text-[1.25vw] text-secondary/70">
                        <Link
                          href={`/artist/${encodeURIComponent(album.artistName)}`}
                          className="hover:underline transition-colors hover:text-secondary"
                        >
                          {album.artistName}
                        </Link>
                        {album.releaseYear ? (
                          <span className="text-secondary/45">
                            {" "}
                            • {album.releaseYear}
                          </span>
                        ) : null}
                      </p>

                      <div className="pt-[1.2vw] sm:pt-[0.5vw]">
                        <AlbumFollowButton
                          albumId={album.id}
                          initialFollowing={isFollowingAlbum}
                          isLoggedIn={Boolean(currentUser)}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. COMMUNITY RATING WIDGET */}
                <section className="w-full pb-[6vw] sm:pb-[4vw]">
                  <div className="layout-grid">
                    <div className="col-span-full">
                      <AlbumRatingWidget
                        albumId={album.id}
                        initialUserScore={userRatingScore}
                        initialAverageScore={averageScore}
                        initialRatingsCount={ratingsCount}
                        isLoggedIn={Boolean(currentUser)}
                      />
                    </div>
                  </div>
                </section>

                {/* TRACKLIST SECTION */}
                <section
                  id="tracklist"
                  data-nav-color="secondary"
                  className="w-full py-[6vw] sm:py-[4vw] border-t border-secondary/15"
                >
                  <div className="layout-grid mb-[4vw] sm:mb-[2.2vw]">
                    <div className="col-span-full flex items-center justify-between">
                      <div className="flex items-center gap-[2vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow drop-shadow" />
                        </div>
                        <h2 className="mediumText lowercase">tracklist</h2>
                      </div>
                      <span className="extraSmallText text-secondary/50">
                        [ {tracklist.totalTracks} tracks
                        {tracklist.totalDurationFormatted
                          ? ` • ${tracklist.totalDurationFormatted}`
                          : ""} ]
                      </span>
                    </div>
                  </div>

                  <div className="layout-grid">
                    <div className="col-span-full">
                      {tracklist.tracks.length === 0 ? (
                        <div className="p-[6vw] sm:p-[3vw] border border-secondary/15 rounded-[0.5vw] bg-primary drop-shadow-soft flex flex-col items-start gap-[0.8vw]">
                          <span className="smallText font-medium text-secondary">
                            Tracklist details are not yet indexed for this release.
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`grid grid-cols-1 ${
                            tracklist.tracks.length >= 8
                              ? "sm:grid-cols-2 gap-x-[4vw]"
                              : "sm:max-w-[50%]"
                          } gap-y-0`}
                        >
                          {tracklist.tracks.map((track, idx) => {
                            const isThisTrackActive =
                              currentTrack !== null &&
                              currentTrack.title.toLowerCase() === track.title.toLowerCase() &&
                              currentTrack.artistName.toLowerCase() === album.artistName.toLowerCase();
                            const isThisTrackPlaying = isThisTrackActive && isPlaying;
                            const isThisTrackLoading = isThisTrackActive && isLoading;

                            const handleTrackPlayback = () => {
                              if (isThisTrackPlaying) {
                                pause();
                              } else if (isThisTrackActive) {
                                resume();
                              } else {
                                playTrack({
                                  title: track.title,
                                  artistName: album.artistName,
                                  coverUrl: album.defaultCoverUrl,
                                  previewUrl: track.previewUrl,
                                });
                              }
                            };

                            return (
                              <div
                                key={`${track.position}-${track.title}-${idx}`}
                                onClick={handleTrackPlayback}
                                className={`flex items-center justify-between py-[2.2vw] sm:py-[0.85vw] border-b border-secondary/10 hover:bg-secondary/[0.04] px-[1vw] rounded-[0.2vw] transition-colors group cursor-pointer ${
                                  isThisTrackActive ? "bg-secondary/[0.06]" : ""
                                }`}
                              >
                                <div className="flex items-center min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTrackPlayback();
                                    }}
                                    aria-label={
                                      isThisTrackPlaying
                                        ? `Pause ${track.title}`
                                        : `Play ${track.title}`
                                    }
                                    className={`w-6 h-6 sm:w-5 sm:h-5 rounded-[0.2vw] flex items-center justify-center detailText font-mono mr-[2vw] sm:mr-[1vw] transition-colors shrink-0 cursor-pointer ${
                                      isThisTrackActive
                                        ? "bg-yellow text-secondary"
                                        : "bg-secondary/5 text-secondary/50 group-hover:bg-yellow group-hover:text-secondary"
                                    }`}
                                  >
                                    {isThisTrackLoading ? (
                                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                      </svg>
                                    ) : isThisTrackPlaying ? (
                                      <span className="flex items-end gap-[1.5px] h-2.5">
                                        <span className="w-[2px] h-2.5 bg-secondary animate-pulse" />
                                        <span className="w-[2px] h-1.5 bg-secondary animate-pulse [animation-delay:150ms]" />
                                        <span className="w-[2px] h-2.5 bg-secondary animate-pulse [animation-delay:300ms]" />
                                      </span>
                                    ) : isThisTrackActive ? (
                                      <svg className="w-2.5 h-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                      </svg>
                                    ) : (
                                      <>
                                        <span className="group-hover:hidden">
                                          {String(track.position).padStart(2, "0")}
                                        </span>
                                        <svg className="w-2.5 h-2.5 fill-current ml-0.5 hidden group-hover:block" viewBox="0 0 24 24">
                                          <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                  <span
                                    className={`smallText font-medium truncate max-w-[55vw] sm:max-w-[28vw] group-hover:underline transition-colors ${
                                      isThisTrackActive ? "text-yellow font-semibold" : "text-secondary"
                                    }`}
                                  >
                                    {track.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-[2vw] sm:ml-[1vw]">
                                  {isThisTrackPlaying && (
                                    <span className="extraSmallText text-yellow font-mono text-[11px] hidden sm:inline-block">
                                      previewing
                                    </span>
                                  )}
                                  <span className="extraSmallText text-secondary/45 font-mono">
                                    {track.durationFormatted}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 3. CURATED IN TOP 5 SECTION */}
                <section
                  id="curated"
                  data-nav-color="secondary"
                  className="w-full py-[6vw] sm:py-[4vw] border-t border-secondary/15"
                >
                  <div className="layout-grid mb-[4vw] sm:mb-[2.2vw]">
                    <div className="col-span-full flex items-center justify-between">
                      <div className="flex items-center gap-[2vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                        </div>
                        <h2 className="mediumText lowercase">curated in top 5</h2>
                      </div>
                      <span className="extraSmallText text-secondary/50">
                        {topListeners.length}{" "}
                        {topListeners.length === 1 ? "listener" : "listeners"}
                      </span>
                    </div>
                  </div>

                  <div className="layout-grid">
                    <div className="col-span-full">
                      {topListeners.length === 0 ? (
                        <div className="p-[6vw] sm:p-[3vw] border border-secondary/15 rounded-[0.5vw] bg-primary drop-shadow-soft flex flex-col items-start gap-[0.8vw]">
                          <span className="smallText font-medium text-secondary">
                            No listeners have curated this record in their Top 5 yet.
                          </span>
                          <p className="extraSmallText text-secondary/55">
                            Add {album.title} to your Top 5 records on your profile to be featured here.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-[2vw] sm:gap-[1vw]">
                          {topListeners.map((listener) => (
                            <Link
                              key={`${listener.userId}-${listener.position}`}
                              href={`/@${listener.username}`}
                              className="bg-primary border border-secondary/15 rounded-[0.4vw] drop-shadow-soft p-[2.5vw] sm:p-[1.2vw] flex flex-col items-center text-center hover:border-secondary/40 transition-colors group"
                            >
                              <div className="w-full flex justify-between items-center mb-[2vw] sm:mb-[0.8vw]">
                                <span className="detailText text-secondary/45">
                                  rank
                                </span>
                                <span className="px-[1.4vw] py-[0.3vw] sm:px-[0.45vw] sm:py-[0.1vw] rounded-[0.2vw] bg-yellow text-secondary detailText font-medium drop-shadow">
                                  0{listener.position}
                                </span>
                              </div>

                              <div className="w-[14vw] sm:w-[3.8vw] aspect-square rounded-[0.35vw] overflow-hidden flex items-center justify-center mb-[2vw] sm:mb-[0.8vw] drop-shadow group-hover:scale-105 transition-transform">
                                <UserAvatar
                                  avatarUrl={listener.avatarUrl}
                                  displayName={listener.displayName}
                                  themeKey={listener.themeKey}
                                  textClassName="smallText font-medium leading-none"
                                />
                              </div>

                              <span className="smallText font-medium text-secondary truncate w-full group-hover:underline">
                                {listener.displayName}
                              </span>
                              <span className="extraSmallText text-secondary/50 truncate w-full">
                                @{listener.username}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 4. DISCUSSIONS SECTION */}
                <section
                  id="discussions"
                  data-nav-color="secondary"
                  className="w-full pt-[6vw] sm:pt-[4vw] pb-[10vw] sm:pb-[6vw] border-t border-secondary/15"
                >
                  <div className="layout-grid mb-[4vw] sm:mb-[2.5vw]">
                    <div className="col-span-full flex items-center justify-between">
                      <div className="flex items-center gap-[2vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                        </div>
                        <h2 className="mediumText lowercase">discussions</h2>
                      </div>
                      <span className="extraSmallText text-secondary/50">
                        [ #album thread • {albumPosts.length} ]
                      </span>
                    </div>
                  </div>

                  <div className="layout-grid items-start">
                    {/* Left Column: Editorial Context */}
                    <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] sm:gap-[0.8vw] mb-[5vw] sm:mb-0">
                      <span className="smallText font-medium text-secondary">
                        Sleeve notes & listener thoughts
                      </span>
                      <p className="extraSmallText text-secondary/60 leading-relaxed sm:pr-[2vw]">
                        Discussions and reviews tagged with #{album.title} by the musi5t community.
                      </p>
                      <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit mt-[1vw] sm:mt-[0.4vw]">
                        <Link href="/feed" className="main-btn smallText text-secondary">
                          <span className="main-btn__icon" aria-hidden="true" />
                          <span className="main-btn__label">
                            <span className="main-btn__clip">
                              <span className="main-btn__from">
                                Post about this record
                              </span>
                              <span className="main-btn__to" aria-hidden="true">
                                Post about this record
                              </span>
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: Interactive Post List */}
                    <div className="col-span-full sm:col-span-8">
                      {albumPosts.length === 0 ? (
                        <div className="p-[6vw] sm:p-[3vw] border border-secondary/15 rounded-[0.5vw] bg-primary drop-shadow-soft flex flex-col items-start gap-[1.5vw] sm:gap-[0.8vw]">
                          <span className="smallText font-medium text-secondary">
                            No discussions about {album.title} yet.
                          </span>
                          <p className="extraSmallText text-secondary/55">
                            Tag this album in the community feed to start the thread.
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
                          posts={albumPosts}
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
                      record archive
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
                      onClick={() => scrollTo("#album-overview")}
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
                      <a
                        href="#tracklist"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollTo("#tracklist");
                        }}
                        className="hover:text-primary transition-colors cursor-pointer"
                      >
                        tracklist
                      </a>
                      <span>,</span>
                      <Link href="/feed" className="hover:text-primary transition-colors">
                        discussions
                      </Link>
                      <span>,</span>
                      <span className="opacity-40 truncate max-w-[14vw]">
                        {album.title}
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
