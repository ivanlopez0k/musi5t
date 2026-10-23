"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import { getProfilePalette } from "@/lib/profile/palettes";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CreateListModal } from "./CreateListModal";
import type { DetailedList } from "@/lib/lists/service";

export interface CurrentUserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  themeKey: string;
}

interface ListViewProps {
  initialList: DetailedList;
  currentUser: CurrentUserSummary | null;
}

export function ListView({ initialList, currentUser }: ListViewProps) {
  const router = useRouter();
  const [list, setList] = useState<DetailedList>(initialList);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUser?.id === list.author.id;
  const palette = getProfilePalette(list.author.themeKey);

  // Initialize Lenis smooth scroll
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

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: `${list.title} by @${list.author.username} on musi5t`,
          text: list.description || `Curated album list by @${list.author.username}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this list? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/lists/${list.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push(`/@${currentUser?.username || ""}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete list");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete list");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateSuccess = (updatedData: DetailedList | unknown) => {
    setList(updatedData as DetailedList);
  };

  const formattedDate = new Date(list.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="site-frame text-secondary">
      <div className="site-layout">
        <div className="app">
          <div className="route-surface">
            {/* Fixed Editorial Header */}
            <header className="header">
              <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
                <div className="mediumText col-span-3 flex justify-start items-center">
                  <Link
                    href={currentUser ? "/feed" : "/"}
                    className="nav-btn cursor-pointer text-left nav-blend"
                  >
                    musi5t
                  </Link>
                </div>

                <div className="smallText col-span-5 justify-center items-center hidden sm:flex">
                  <span className="nav-group flex items-center gap-[0.5vw] nav-blend">
                    <Link href="/feed" className="nav-btn cursor-pointer">
                      Feed
                    </Link>
                    <span className="opacity-35">•</span>
                    <Link href="/lists" className="nav-btn cursor-pointer font-medium">
                      Lists
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
                          displayName={currentUser.displayName || currentUser.username}
                          themeKey={currentUser.themeKey}
                          textClassName="text-[3.2vw] sm:text-[0.8vw] font-bold leading-none"
                        />
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </header>

            {/* Scrollable Container */}
            <main
              id="swup"
              ref={mainRef}
              className="transition-swup hide-scrollbar bg-primary text-secondary"
              tabIndex={-1}
            >
              <div ref={contentRef} className="layout-content bg-primary text-secondary">
                <section
                  id="list-detail"
                  data-nav-color="secondary"
                  className="w-full min-h-lvh pt-[24vw] sm:pt-[10vw] pb-[10vw] sm:pb-[6vw]"
                >
                  <div className="layout-grid">
                    <div className="col-span-full sm:col-start-2 sm:col-span-10 flex flex-col gap-[6vw] sm:gap-[3vw]">
                      {/* Back Link */}
                      <div>
                        <Link
                          href="/lists"
                          className="extraSmallText text-secondary/60 hover:text-secondary transition-colors inline-flex items-center gap-[1vw] sm:gap-[0.4vw]"
                        >
                          <span>←</span>
                          <span>Back to Community Lists</span>
                        </Link>
                      </div>

                      {/* List Header Hero */}
                      <div className="flex flex-col gap-[3.5vw] sm:gap-[1.5vw] border-b border-secondary/15 pb-[6vw] sm:pb-[2.5vw]">
                        {/* Author row & Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-[3vw]">
                          <Link
                            href={`/@${list.author.username}`}
                            className="flex items-center gap-[2.5vw] sm:gap-[0.8vw] group"
                          >
                            <div className="w-[8vw] h-[8vw] sm:w-[2.4vw] sm:h-[2.4vw] rounded-full overflow-hidden border border-secondary/20 shrink-0">
                              <UserAvatar
                                avatarUrl={list.author.avatarUrl}
                                displayName={list.author.displayName}
                                themeKey={list.author.themeKey}
                                textClassName="text-[3.2vw] sm:text-[0.85vw] font-bold"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="smallText font-medium text-secondary group-hover:underline">
                                {list.author.displayName}
                              </span>
                              <span className="extraSmallText text-secondary/50">
                                @{list.author.username}
                              </span>
                            </div>
                          </Link>

                          <div className="flex items-center gap-[2vw] sm:gap-[0.8vw]">
                            {!list.isPublic && (
                              <span className="extraSmallText px-[2.5vw] py-[0.8vw] sm:px-[0.7vw] sm:py-[0.25vw] rounded-[0.2vw] bg-secondary/10 text-secondary border border-secondary/20">
                                Private List
                              </span>
                            )}
                            <span className="extraSmallText px-[2.5vw] py-[0.8vw] sm:px-[0.7vw] sm:py-[0.25vw] rounded-[0.2vw] bg-secondary/10 text-secondary border border-secondary/20">
                              {list.items.length} {list.items.length === 1 ? "album" : "albums"}
                            </span>
                            <span className="extraSmallText text-secondary/40">
                              Curated on {formattedDate}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h1 className="largeText font-bold text-secondary tracking-[-0.04em]">
                          {list.title}
                        </h1>

                        {/* Description */}
                        {list.description && (
                          <p className="mediumText text-secondary/80 font-light leading-relaxed max-w-[48ch]">
                            {list.description}
                          </p>
                        )}

                        {/* Actions Row */}
                        <div className="flex flex-wrap items-center gap-[3vw] sm:gap-[1vw] pt-[2vw]">
                          <button
                            type="button"
                            onClick={handleShare}
                            className="extraSmallText font-medium px-[3.5vw] py-[1.8vw] sm:px-[1.2vw] sm:py-[0.5vw] rounded-[0.3vw] bg-secondary/10 hover:bg-secondary/20 text-secondary transition-colors cursor-pointer flex items-center gap-[1.5vw] sm:gap-[0.4vw]"
                          >
                            <svg className="w-[3.5vw] h-[3.5vw] sm:w-[1vw] sm:h-[1vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>{copied ? "Link Copied!" : "Share List"}</span>
                          </button>

                          {isOwner && (
                            <>
                              <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="extraSmallText font-medium px-[3.5vw] py-[1.8vw] sm:px-[1.2vw] sm:py-[0.5vw] rounded-[0.3vw] transition-colors cursor-pointer"
                                style={{
                                  backgroundColor: palette.accent,
                                  color: palette.textOnAccent || "#0E0E0E",
                                }}
                              >
                                Edit List
                              </button>
                              <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="extraSmallText font-medium px-[3.5vw] py-[1.8vw] sm:px-[1.2vw] sm:py-[0.5vw] rounded-[0.3vw] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                              >
                                {deleting ? "Deleting..." : "Delete List"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* List Items */}
                      <div className="flex flex-col gap-[5vw] sm:gap-[2.5vw]">
                        {list.items.map((item) => (
                          <div
                            key={item.id}
                            className="group grid grid-cols-12 gap-[3.5vw] sm:gap-[1.5vw] items-start p-[4vw] sm:p-[1.6vw] rounded-[0.5vw] bg-secondary/[0.02] hover:bg-secondary/[0.04] border border-secondary/10 transition-colors"
                          >
                            {/* Position Number */}
                            <div className="col-span-2 sm:col-span-1 flex items-start pt-[1vw]">
                              <span className="font-mono text-[6vw] sm:text-[2.2vw] font-bold text-secondary/35 group-hover:text-secondary/70 transition-colors">
                                {String(item.position).padStart(2, "0")}
                              </span>
                            </div>

                            {/* Cover Artwork */}
                            <div className="col-span-10 sm:col-span-3">
                              <Link
                                href={`/album/${item.albumId}`}
                                className="block aspect-square w-full rounded-[0.3vw] overflow-hidden bg-primary shadow-lg border border-secondary/15 relative"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.coverUrl || item.album.defaultCoverUrl || "/images/musi5t/vinyl_player.webp"}
                                  alt={item.album.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                              </Link>
                            </div>

                            {/* Details & Notes */}
                            <div className="col-span-12 sm:col-span-8 flex flex-col gap-[2.5vw] sm:gap-[1vw] pt-[1vw] sm:pt-0">
                              <div>
                                <Link
                                  href={`/album/${item.albumId}`}
                                  className="mediumText font-medium text-secondary hover:underline line-clamp-2"
                                >
                                  {item.album.title}
                                </Link>
                                <div className="flex items-center gap-[2vw] sm:gap-[0.6vw] mt-[1vw] sm:mt-[0.2vw]">
                                  <Link
                                    href={`/artist/${encodeURIComponent(item.album.artistName)}`}
                                    className="smallText text-secondary/70 hover:text-secondary hover:underline transition-colors"
                                  >
                                    {item.album.artistName}
                                  </Link>
                                  {item.album.releaseYear && (
                                    <>
                                      <span className="text-secondary/30">•</span>
                                      <span className="extraSmallText text-secondary/40 font-mono">
                                        {item.album.releaseYear}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Commentary / Liner Note */}
                              {item.notes ? (
                                <div className="p-[3.5vw] sm:p-[1.2vw] rounded-[0.35vw] bg-secondary/[0.03] border-l-2 border-secondary/30 mt-[1vw]">
                                  <span className="extraSmallText uppercase tracking-wider text-secondary/40 font-semibold block mb-[0.8vw] sm:mb-[0.3vw]">
                                    Curator&apos;s note
                                  </span>
                                  <p className="extraSmallText text-secondary/80 font-light italic leading-relaxed whitespace-pre-line">
                                    &ldquo;{item.notes}&rdquo;
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Edit List Modal */}
      {isEditModalOpen && (
        <CreateListModal
          isOpen={isEditModalOpen}
          initialData={{
            id: list.id,
            title: list.title,
            description: list.description,
            isPublic: list.isPublic,
            items: list.items.map((it) => ({
              albumId: it.albumId,
              position: it.position,
              notes: it.notes,
              coverUrl: it.coverUrl,
              album: {
                title: it.album.title,
                artistName: it.album.artistName,
                defaultCoverUrl: it.album.defaultCoverUrl,
              },
            })),
          }}
          accentColor={palette.accent}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
