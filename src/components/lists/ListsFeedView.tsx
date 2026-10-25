"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { MobileMenuButton, MobileNavDrawer } from "@/components/ui/MobileNavDrawer";
import { ListCard } from "./ListCard";
import { CreateListModal } from "./CreateListModal";
import type { ListSummary } from "@/lib/lists/service";

export interface CurrentUserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  themeKey: string;
}

interface ListsFeedViewProps {
  initialLists: ListSummary[];
  currentUser: CurrentUserSummary | null;
}

export function ListsFeedView({ initialLists, currentUser }: ListsFeedViewProps) {
  const router = useRouter();
  const [lists, setLists] = useState<ListSummary[]>(initialLists);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (isMobileMenuOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isMobileMenuOpen]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const url = query.trim()
          ? `/api/v1/lists?q=${encodeURIComponent(query.trim())}`
          : "/api/v1/lists";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setLists(data.lists || []);
        }
      } catch (err) {
        console.error("Search lists error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleCreateSuccess = (newList: unknown) => {
    const created = newList as ListSummary;
    if (created?.id) {
      router.push(`/lists/${created.id}`);
    } else {
      router.refresh();
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
                    <span className="nav-btn cursor-pointer font-medium underline underline-offset-4">
                      Lists
                    </span>
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
                        className="hidden sm:inline-block nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
                      >
                        Settings
                      </Link>
                      <div className="hidden sm:inline-block">
                        <LogoutButton className="nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity cursor-pointer" />
                      </div>
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
                      <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="hidden sm:inline-block nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
                      >
                        Sign in
                      </Link>
                      <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
                    </>
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
                  id="lists-feed"
                  data-nav-color="secondary"
                  className="w-full min-h-lvh pt-[24vw] sm:pt-[9.5vw] pb-[10vw] sm:pb-[6vw]"
                >
                  <div className="layout-grid">
                    <div className="col-span-full sm:col-start-2 sm:col-span-10 flex flex-col gap-[6vw] sm:gap-[3vw]">
                      {/* Editorial Title & Top Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[4vw] sm:gap-[2vw] border-b border-secondary/15 pb-[5vw] sm:pb-[2vw]">
                        <div>
                          <div className="flex items-center gap-[2vw] sm:gap-[0.8vw] mb-[1.5vw] sm:mb-[0.5vw]">
                            <span className="w-[2vw] h-[2vw] sm:w-[0.7vw] sm:h-[0.7vw] rounded-full bg-secondary/80 inline-block" />
                            <span className="extraSmallText uppercase tracking-widest text-secondary/50 font-mono">
                              community collections
                            </span>
                          </div>
                          <h1 className="largeText font-bold text-secondary tracking-[-0.04em] lowercase">
                            curated lists
                          </h1>
                          <p className="extraSmallText text-secondary/60 max-w-[44ch] mt-[1.5vw] sm:mt-[0.5vw] leading-relaxed">
                            Thematic album selections, historical deep-dives, and seasonal rotations curated by the musi5t community.
                          </p>
                        </div>

                        {/* Search and Create Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[3vw] sm:gap-[1vw]">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              placeholder="Search lists by title or theme..."
                              className="w-full sm:w-[22vw] px-[3.5vw] py-[2vw] sm:px-[1vw] sm:py-[0.5vw] rounded-[0.3vw] bg-secondary/[0.04] border border-secondary/15 focus:border-secondary/40 text-secondary extraSmallText outline-none transition-colors"
                            />
                            {loading && (
                              <span className="absolute right-[3vw] sm:right-[0.8vw] top-1/2 -translate-y-1/2 extraSmallText text-secondary/40 animate-pulse">
                                ...
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!currentUser) {
                                router.push("/login");
                              } else {
                                setIsCreateModalOpen(true);
                              }
                            }}
                            className="extraSmallText font-medium px-[4vw] py-[2.2vw] sm:px-[1.2vw] sm:py-[0.55vw] rounded-[0.3vw] bg-secondary text-primary hover:bg-secondary/90 transition-colors cursor-pointer text-center whitespace-nowrap shadow"
                          >
                            + Create List
                          </button>
                        </div>
                      </div>

                      {/* Lists Grid */}
                      {lists.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[5vw] sm:gap-[1.8vw]">
                          {lists.map((list) => (
                            <ListCard key={list.id} list={list} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-[14vw] sm:py-[8vw] border border-dashed border-secondary/15 rounded-[0.5vw] flex flex-col items-center justify-center gap-[3vw] sm:gap-[1vw]">
                          <p className="mediumText text-secondary/60 font-light">
                            {searchQuery ? "No lists match your search." : "No curated lists created yet."}
                          </p>
                          <p className="extraSmallText text-secondary/40 max-w-[36ch]">
                            {searchQuery
                              ? "Try searching for a different keyword or album theme."
                              : "Be the first to create and publish a curated album list for the community."}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (!currentUser) {
                                router.push("/login");
                              } else {
                                setIsCreateModalOpen(true);
                              }
                            }}
                            className="extraSmallText font-medium px-[4vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.5vw] rounded-[0.3vw] bg-secondary text-primary hover:bg-secondary/90 transition-colors cursor-pointer mt-[2vw] sm:mt-[0.5vw]"
                          >
                            + Start a Curated List
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        currentPath="/lists"
      />

      {/* Create List Modal */}
      {isCreateModalOpen && (
        <CreateListModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
