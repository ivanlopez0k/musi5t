"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import { PaletteSelector, PROFILE_PALETTES } from "./PaletteSelector";
import { AlbumSearchModal } from "./AlbumSearchModal";
import { SongSearchModal } from "./SongSearchModal";
import { ShareTop5Modal } from "./ShareTop5Modal";
import { UserFollowButton } from "./UserFollowButton";
import type { FeedPost } from "@/lib/feed/visibility";
import { InteractivePostList, type CurrentUserSummary } from "@/components/feed/FeedView";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ListCard } from "@/components/lists/ListCard";
import { CreateListModal } from "@/components/lists/CreateListModal";
import type { ListSummary } from "@/lib/lists/service";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";

const PALETTE_NAMES: Record<string, string> = {
  lima: "Lima",
  coral: "Coral",
  cobalto: "Cobalto",
  violeta: "Violeta",
  mandarina: "Mandarina",
  obsidiana: "Obsidiana",
  bosque: "Bosque",
};

export interface ProfileUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  themeKey: string;
  createdAt: Date;
  emailVerifiedAt?: Date | string | null;
}

export interface TopAlbumItem {
  id: string;
  albumId: string;
  position: number;
  coverUrl: string;
  title: string;
  artistName: string;
  releaseYear: number | null;
}

export interface TopSongItem {
  id: string;
  position: number;
  title: string;
  artistName: string;
  coverUrl: string | null;
}

interface ApiUserPost extends Omit<FeedPost, "createdAt"> {
  createdAt: string;
}

interface ProfileViewProps {
  user: ProfileUser;
  isOwner: boolean;
  isFollowing?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
  isLoggedIn?: boolean;
  currentUser?: CurrentUserSummary | null;
  topAlbums: TopAlbumItem[];
  topSongs: TopSongItem[];
  userPosts?: FeedPost[];
  totalPostsCount?: number;
  initialLists?: ListSummary[];
}

export function ProfileView({
  user,
  isOwner,
  isFollowing = false,
  isMuted: initialMuted = false,
  isBlocked: initialBlocked = false,
  isLoggedIn = false,
  currentUser = null,
  topAlbums: initialAlbums,
  topSongs: initialSongs,
  userPosts = [],
  totalPostsCount = userPosts.length,
  initialLists = [],
}: ProfileViewProps) {
  const router = useRouter();
  const { currentTrack, isPlaying, isLoading, playTrack, pause, resume } = useAudioPlayer();
  const [currentThemeKey, setCurrentThemeKey] = useState(user.themeKey || "lima");
  const [lists, setLists] = useState<ListSummary[]>(initialLists);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Email verification state
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [emailVerified] = useState(Boolean(user.emailVerifiedAt));

  // Moderation state for non-owners
  const [muted, setMuted] = useState(initialMuted);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [moderationLoading, setModerationLoading] = useState(false);

  // Reorder state
  const [reordering, setReordering] = useState(false);

  // Modals state
  const [albumModalPos, setAlbumModalPos] = useState<number | null>(null);
  const [songModalPos, setSongModalPos] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // User profile visible posts pagination
  const [profilePosts, setProfilePosts] = useState<FeedPost[]>(userPosts);
  const [postsCursor, setPostsCursor] = useState<string | null>(
    userPosts.length >= 10 ? userPosts[userPosts.length - 1].createdAt.toISOString() : null
  );
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  // Carousel hover & GSAP refs
  const [hoveredAlbumIndex, setHoveredAlbumIndex] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const recordsContainerRef = useRef<HTMLDivElement>(null);
  const albumCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lateralOrbsRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Active palette
  const activePalette =
    PROFILE_PALETTES.find((p) => p.key === currentThemeKey) || PROFILE_PALETTES[0];

  // Lenis smooth scroll initialization (matching src/app/page.tsx)
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

  // Stop Lenis background scroll when search modals are open
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (albumModalPos !== null || songModalPos !== null) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [albumModalPos, songModalPos]);

  // Hero entrance & Lateral Orbs floating GSAP animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".profile-hero-reveal", {
        y: 36,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.to(".profile-orb-float-slow", {
        y: -22,
        x: 8,
        rotate: 6,
        duration: 4.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(".profile-orb-float-reverse", {
        y: 20,
        x: -10,
        rotate: -8,
        duration: 3.6,
        delay: 0.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(".profile-orb-pulse", {
        scale: 1.08,
        duration: 3.1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, contentRef);

    return () => ctx.revert();
  }, []);

  // Hover scale & peer dim effect on Top 5 Records (matching WorkCarousel.tsx)
  useEffect(() => {
    albumCardRefs.current.forEach((card, i) => {
      if (!card) return;
      if (hoveredAlbumIndex === null) {
        gsap.to(card, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
      } else if (hoveredAlbumIndex === i) {
        gsap.to(card, {
          scale: 1.05,
          opacity: 1,
          zIndex: 10,
          duration: 0.4,
          ease: "power3.out",
        });
      } else {
        gsap.to(card, {
          scale: 0.98,
          opacity: 0.85,
          zIndex: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });
  }, [hoveredAlbumIndex]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const scrollTo = (hash: string) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(hash, { duration: 1.2 });
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePaletteChange = async (newKey: string) => {
    setCurrentThemeKey(newKey);
    if (!isOwner) return;
    try {
      await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeKey: newKey }),
      });
    } catch (err) {
      console.error("Failed to save palette preference:", err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/users/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio }),
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update profile info:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Failed to logout:", err);
      setIsLoggingOut(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendingVerification) return;
    setResendingVerification(true);
    setVerificationNotice(null);
    try {
      const res = await fetch("/api/v1/auth/verify-email/resend", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationNotice(data.message || "Verification link sent! Check your inbox.");
      } else {
        setVerificationNotice(data.error || "Failed to send verification link.");
      }
    } catch (err) {
      console.error("Failed to resend verification:", err);
      setVerificationNotice("An error occurred. Please try again.");
    } finally {
      setResendingVerification(false);
    }
  };

  // Top 5 Album Actions
  const handleSelectAlbum = async (
    albumId: string,
    coverUrl: string,
    coverReleaseMbid: string | null
  ) => {
    if (!albumModalPos) return;
    try {
      const res = await fetch(`/api/v1/me/top/albums/${albumModalPos}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId, coverUrl, coverReleaseMbid }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update top album:", err);
    }
  };

  const handleRemoveAlbum = async (pos: number) => {
    try {
      const res = await fetch(`/api/v1/me/top/albums/${pos}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to remove album:", err);
    }
  };

  const handleSwapAlbumPosition = async (fromPosition: number, toPosition: number) => {
    if (reordering || toPosition < 1 || toPosition > 5) return;
    setReordering(true);
    try {
      const res = await fetch("/api/v1/me/top/albums/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPosition, toPosition }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to reorder albums:", err);
    } finally {
      setReordering(false);
    }
  };

  // Top 5 Song Actions
  const handleSelectSong = async (songId: string) => {
    if (!songModalPos) return;
    try {
      const res = await fetch(`/api/v1/me/top/songs/${songModalPos}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to set top song:", err);
    }
  };

  const handleRemoveSong = async (pos: number) => {
    try {
      const res = await fetch(`/api/v1/me/top/songs/${pos}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to remove song:", err);
    }
  };

  const handleSwapSongPosition = async (fromPosition: number, toPosition: number) => {
    if (reordering || toPosition < 1 || toPosition > 5) return;
    setReordering(true);
    try {
      const res = await fetch("/api/v1/me/top/songs/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPosition, toPosition }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to reorder songs:", err);
    } finally {
      setReordering(false);
    }
  };

  // Mute / Block Actions
  const handleToggleMute = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setModerationLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${user.id}/mute`, {
        method: muted ? "DELETE" : "POST",
      });
      if (res.ok) {
        setMuted(!muted);
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle mute error:", err);
    } finally {
      setModerationLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (
      !blocked &&
      !confirm(`Block @${user.username}? This will also remove any follow relationship.`)
    ) {
      return;
    }
    setModerationLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${user.id}/block`, {
        method: blocked ? "DELETE" : "POST",
      });
      if (res.ok) {
        setBlocked(!blocked);
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle block error:", err);
    } finally {
      setModerationLoading(false);
    }
  };

  const handleLoadMorePosts = async () => {
    if (!postsCursor || loadingMorePosts) return;
    setLoadingMorePosts(true);
    try {
      const res = await fetch(
        `/api/v1/users/${user.id}/posts?cursor=${encodeURIComponent(postsCursor)}&limit=10`
      );
      if (res.ok) {
        const data = await res.json();
        const rawPosts = (data.posts || []) as ApiUserPost[];
        const loaded: FeedPost[] = rawPosts.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
        setProfilePosts((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewPosts = loaded.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewPosts];
        });
        setPostsCursor(loaded.length >= 10 ? data.nextCursor : null);
      }
    } catch (err) {
      console.error("Failed to load more profile posts:", err);
    } finally {
      setLoadingMorePosts(false);
    }
  };

  const joinedLabel = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="site-frame text-secondary">
      {/* Main Foreground Layout */}
      <div className="site-layout">
        <div
          className="app transition-colors duration-700"
          style={{ backgroundColor: activePalette.accent }}
        >
          <div className="route-surface">
            {/* Editorial Fixed Header (matching src/components/landing/Header.tsx) */}
            <header className="header">
              <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
                {/* Brand Wordmark */}
                <div className="mediumText col-span-2 flex justify-start items-center gap-[0.8vw]">
                  <Link
                    href={isLoggedIn ? "/feed" : "/"}
                    className="nav-btn nav-blend cursor-pointer text-left"
                  >
                    musi5t
                  </Link>
                </div>

                {/* Center Navigation Group (Overview • Records • Tracks • Lists • Discussions) */}
                <div className="smallText col-span-5 justify-center items-center hidden sm:flex">
                  <span className="nav-group nav-blend flex items-center gap-[0.6vw]">
                    <button
                      type="button"
                      onClick={() => scrollTo("#overview")}
                      className="nav-btn cursor-pointer"
                    >
                      Overview
                    </button>
                    <span className="opacity-35">•</span>
                    <button
                      type="button"
                      onClick={() => scrollTo("#records")}
                      className="nav-btn cursor-pointer"
                    >
                      Records
                    </button>
                    <span className="opacity-35">•</span>
                    <button
                      type="button"
                      onClick={() => scrollTo("#tracks")}
                      className="nav-btn cursor-pointer"
                    >
                      Tracks
                    </button>
                    <span className="opacity-35">•</span>
                    <button
                      type="button"
                      onClick={() => scrollTo("#lists")}
                      className="nav-btn cursor-pointer"
                    >
                      Lists
                    </button>
                    <span className="opacity-35">•</span>
                    <button
                      type="button"
                      onClick={() => scrollTo("#discussions")}
                      className="nav-btn cursor-pointer"
                    >
                      Discussions
                    </button>
                  </span>
                </div>

                {/* Right Navbar Actions */}
                <div className="col-span-4 sm:col-span-5 flex justify-end items-center gap-[2.5vw] sm:gap-[0.75vw]">
                  {isOwner ? (
                    <>
                      {/* Palette selector only visible for the owner of this profile on desktop */}
                      <div className="hidden sm:inline-flex">
                        <PaletteSelector
                          selectedTheme={currentThemeKey}
                          onSelect={handlePaletteChange}
                          isEmailVerified={Boolean(emailVerified)}
                          onLockedClick={(label) => {
                            setVerificationNotice(
                              `The "${label}" palette is exclusive to members with a verified email.`
                            );
                          }}
                        />
                      </div>
                      <Link
                        href="/settings"
                        className="hidden sm:inline-block nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity"
                      >
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="hidden sm:inline-block nav-blend opacity-70 hover:opacity-100 text-[3.2vw] sm:text-[0.85vw] font-medium transition-opacity cursor-pointer"
                      >
                        {isLoggingOut ? "..." : "Logout"}
                      </button>
                      <div className="hidden sm:block drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                        <button
                          type="button"
                          onClick={() => setIsEditing(!isEditing)}
                          className="main-btn smallText transition-colors duration-500"
                          style={{
                            backgroundColor: activePalette.accent,
                            color: activePalette.textOnAccent || "#0E0E0E",
                          }}
                        >
                          <span
                            className="main-btn__icon"
                            aria-hidden="true"
                            style={{
                              backgroundColor:
                                activePalette.textOnAccent === "#FFFFFF"
                                  ? "#FFFFFF"
                                  : undefined,
                            }}
                          />
                          <span className="main-btn__label">
                            <span className="main-btn__clip">
                              <span className="main-btn__from">
                                {isEditing ? "Close edit" : "Edit profile"}
                              </span>
                              <span className="main-btn__to" aria-hidden="true">
                                {isEditing ? "Close edit" : "Edit profile"}
                              </span>
                            </span>
                          </span>
                        </button>
                      </div>
                      <Link
                        href={`/@${user.username}`}
                        className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full overflow-hidden border border-secondary/25 hover:border-secondary transition-all drop-shadow flex items-center justify-center shrink-0 group"
                        title={`@${user.username}`}
                      >
                        <UserAvatar
                          avatarUrl={avatarUrl}
                          displayName={displayName || user.username}
                          themeKey={activePalette.key}
                          textClassName="text-[3.2vw] sm:text-[0.8vw] font-bold leading-none"
                        />
                      </Link>
                    </>
                  ) : currentUser ? (
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
                  ) : (
                    <div className="hidden sm:block drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                      <Link
                        href="/login"
                        className="main-btn smallText transition-colors duration-500"
                        style={{
                          backgroundColor: activePalette.accent,
                          color: activePalette.textOnAccent || "#0E0E0E",
                        }}
                      >
                        <span
                          className="main-btn__icon"
                          aria-hidden="true"
                          style={{
                            backgroundColor:
                              activePalette.textOnAccent === "#FFFFFF"
                                ? "#FFFFFF"
                                : undefined,
                          }}
                        />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">Sign in</span>
                            <span className="main-btn__to" aria-hidden="true">
                              Sign in
                            </span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  )}

                  {/* Mobile Hamburger Button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open mobile menu"
                    className="sm:hidden flex items-center justify-center w-[8.5vw] h-[8.5vw] rounded-full bg-secondary/[0.08] hover:bg-secondary/[0.15] text-secondary transition-colors cursor-pointer shrink-0"
                  >
                    <svg
                      className="w-[4.8vw] h-[4.8vw]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="4" y1="7" x2="20" y2="7" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="17" x2="20" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            {/* Scrollable Container managed by Lenis */}
            <main
              ref={mainRef}
              id="swup"
              className="transition-swup hide-scrollbar relative bg-primary text-secondary"
              tabIndex={-1}
            >
              <div ref={contentRef} className="relative overflow-x-clip bg-primary text-secondary">
                {/* DECORATIVE VISUAL LATERAL CIRCLES (Left & Right Sides, Palette-Driven) */}
                <div
                  ref={lateralOrbsRef}
                  aria-hidden="true"
                  className="pointer-events-none select-none inset-0 overflow-hidden z-0"
                >
                  {/* Left Edge Upper Concentric Vinyl Orb */}
                  <div
                    className="profile-orb-float-slow absolute top-[11vh] left-[-15vw] sm:left-[-8.5vw] w-[32vw] h-[32vw] sm:w-[17vw] sm:h-[17vw] rounded-full drop-shadow-soft transition-colors duration-700 flex items-center justify-center"
                    style={{ backgroundColor: activePalette.accent }}
                  >
                    <div
                      className="w-[68%] h-[68%] rounded-full border border-secondary/15 transition-colors duration-700 flex items-center justify-center"
                      style={{ backgroundColor: activePalette.secondaryOrb }}
                    >
                      <div
                        className="w-[34%] h-[34%] rounded-full transition-colors duration-700"
                        style={{ backgroundColor: activePalette.softGlow }}
                      />
                    </div>
                  </div>

                  {/* Left Edge Satellite Circle */}
                  <div
                    className="profile-orb-float-reverse absolute top-[44vh] left-[-6vw] sm:left-[-2.8vw] w-[13vw] h-[13vw] sm:w-[6.5vw] sm:h-[6.5vw] rounded-full border border-secondary/10 drop-shadow transition-colors duration-700"
                    style={{ backgroundColor: activePalette.secondaryOrb }}
                  />

                  {/* Left Edge Lower Radial Sphere */}
                  <div
                    className="profile-orb-pulse absolute top-[118vh] left-[-12vw] sm:left-[-6.5vw] w-[26vw] h-[26vw] sm:w-[13.5vw] sm:h-[13.5vw] rounded-full drop-shadow-soft transition-all duration-700 flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${activePalette.secondaryOrb}, ${activePalette.accent} 68%, ${activePalette.softGlow})`,
                    }}
                  >
                    <div className="w-[22%] h-[22%] rounded-full bg-primary/90 border border-secondary/15" />
                  </div>

                  {/* Right Edge Upper Layered Graphic Circle */}
                  <div
                    className="profile-orb-float-reverse absolute top-[18vh] right-[-14vw] sm:right-[-7.8vw] w-[30vw] h-[30vw] sm:w-[16vw] sm:h-[16vw] rounded-full drop-shadow-soft transition-colors duration-700 flex items-center justify-center"
                    style={{ backgroundColor: activePalette.secondaryOrb }}
                  >
                    <div
                      className="w-[62%] h-[62%] rounded-full transition-colors duration-700 flex items-center justify-center"
                      style={{ backgroundColor: activePalette.accent }}
                    >
                      <div className="w-[28%] h-[28%] rounded-full bg-secondary" />
                    </div>
                  </div>

                  {/* Right Edge Mid Accent Dot */}
                  <div
                    className="profile-orb-float-slow absolute top-[56vh] right-[-5vw] sm:right-[-2.2vw] w-[12vw] h-[12vw] sm:w-[5.8vw] sm:h-[5.8vw] rounded-full drop-shadow transition-colors duration-700"
                    style={{ backgroundColor: activePalette.softGlow }}
                  />

                  {/* Right Edge Lower Concentric Disc */}
                  <div
                    className="profile-orb-pulse absolute top-[134vh] right-[-13vw] sm:right-[-7.2vw] w-[28vw] h-[28vw] sm:w-[15vw] sm:h-[15vw] rounded-full drop-shadow-soft transition-colors duration-700 flex items-center justify-center"
                    style={{ backgroundColor: activePalette.accent }}
                  >
                    <div
                      className="w-[54%] h-[54%] rounded-full border border-secondary/15 transition-colors duration-700"
                      style={{ backgroundColor: activePalette.softGlow }}
                    />
                  </div>
                </div>

                {/* 1. HERO / IDENTITY SECTION (#overview) */}
                <section
                  id="overview"
                  data-nav-color="secondary"
                  className="w-full bg-transparent text-secondary pt-[24vw] sm:pt-[9.5vw] pb-[6vw] sm:pb-[4vw] relative z-10"
                >
                  <div className="layout-grid w-full items-start">
                    {/* Unverified Email Warning Banner for Owner */}
                    {isOwner && !emailVerified && (
                      <div className="col-span-full mb-[4vw] sm:mb-[2.5vw] p-[3.5vw] sm:p-[1.4vw] rounded-[0.5vw] border border-yellow/40 bg-yellow/10 flex flex-col sm:flex-row sm:items-center justify-between gap-[2.5vw] sm:gap-[1.5vw] drop-shadow-soft">
                        <div className="flex items-center gap-[2.5vw] sm:gap-[1vw]">
                          <span className="w-[2.5vw] h-[2.5vw] sm:w-[0.75vw] sm:h-[0.75vw] rounded-full bg-yellow shrink-0 animate-pulse" />
                          <div>
                            <p className="extraSmallTextBold text-secondary">
                              Your email is unverified
                            </p>
                            <p className="extraSmallText text-secondary/70">
                              Verify your email address to secure your account and enable password recovery.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-[2vw] sm:gap-[1vw]">
                          {verificationNotice && (
                            <span className="extraSmallText text-secondary/80 font-medium">
                              {verificationNotice}
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={resendingVerification}
                            onClick={handleResendVerification}
                            className="extraSmallText px-[3.5vw] py-[1.5vw] sm:px-[1.1vw] sm:py-[0.45vw] rounded-[0.3vw] bg-secondary text-primary font-medium hover:bg-secondary/85 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            {resendingVerification ? "Sending..." : "Resend verification email"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Left 8 Columns: Giant Editorial Name (+ member since), Bio & Visitor Actions */}
                    <div className="col-span-full sm:col-span-8 flex flex-col justify-between profile-hero-reveal">
                      <div className="flex flex-wrap items-baseline gap-x-[2vw] sm:gap-x-[1vw] gap-y-[1vw]">
                        <h1 className="largeText font-medium text-secondary tracking-[-0.05em] break-words">
                          {displayName}
                        </h1>
                        <span className="extraSmallText text-secondary/45 whitespace-nowrap">
                          member since {joinedLabel.toLowerCase()}
                        </span>
                      </div>

                      {bio.trim() && (
                        <p className="mediumText font-light leading-snug text-secondary/80 max-w-[38ch] mt-[3.5vw] sm:mt-[1.8vw]">
                          {bio}
                        </p>
                      )}

                      {!isOwner && (
                        <div className="flex flex-wrap items-center gap-[2vw] sm:gap-[0.75vw] mt-[4vw] sm:mt-[1.8vw]">
                          {!blocked && (
                            <UserFollowButton
                              targetUserId={user.id}
                              initialFollowing={Boolean(isFollowing)}
                              isLoggedIn={Boolean(isLoggedIn)}
                              accentColor={activePalette.accent}
                            />
                          )}

                          {isLoggedIn && (
                            <>
                              <button
                                type="button"
                                disabled={moderationLoading}
                                onClick={handleToggleMute}
                                className={`extraSmallText px-[2.5vw] py-[1.1vw] sm:px-[0.9vw] sm:py-[0.45vw] rounded-[0.3vw] border transition-colors cursor-pointer ${
                                  muted
                                    ? "bg-secondary text-primary border-secondary"
                                    : "bg-primary/90 hover:bg-primary border-secondary/20 hover:border-secondary/60 text-secondary/75 hover:text-secondary drop-shadow"
                                }`}
                              >
                                {muted ? "muted" : "mute"}
                              </button>
                              <button
                                type="button"
                                disabled={moderationLoading}
                                onClick={handleToggleBlock}
                                className={`extraSmallText px-[2.5vw] py-[1.1vw] sm:px-[0.9vw] sm:py-[0.45vw] rounded-[0.3vw] border transition-colors cursor-pointer ${
                                  blocked
                                    ? "bg-red-600 text-white border-red-600"
                                    : "bg-primary/90 hover:bg-red-600/10 border-red-600/30 text-red-700 drop-shadow"
                                }`}
                              >
                                {blocked ? "blocked" : "block"}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right 4 Columns: Refined Compact Avatar Card */}
                    <div className="col-span-full sm:col-span-4 flex flex-col sm:items-end justify-between gap-[2vw] sm:gap-[1vw] mt-[6vw] sm:mt-0 profile-hero-reveal">
                      <div className="w-[28vw] sm:w-[9.5vw] aspect-square rounded-[0.4vw] overflow-hidden drop-shadow-soft bg-secondary relative flex items-center justify-center group">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center relative transition-colors duration-700"
                            style={{
                              background: `radial-gradient(circle at 30% 30%, ${activePalette.secondaryOrb}, ${activePalette.accent} 65%, ${activePalette.softGlow})`,
                            }}
                          >
                            <div
                              className="w-[70%] h-[70%] rounded-full border border-secondary/15 flex items-center justify-center transition-colors duration-700"
                              style={{ backgroundColor: activePalette.secondaryOrb }}
                            >
                              <span
                                className="mediumText font-medium select-none"
                                style={{ color: activePalette.textOnAccent || "#0E0E0E" }}
                              >
                                {displayName.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}

                        {isOwner && isEditing && (
                          <button
                            type="button"
                            disabled={uploadingAvatar}
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute inset-0 bg-black/55 hover:bg-black/65 text-primary flex flex-col items-center justify-center gap-[0.4vw] transition-colors cursor-pointer z-10"
                          >
                            <span className="extraSmallTextBold text-primary">
                              {uploadingAvatar
                                ? "Uploading..."
                                : avatarUrl
                                  ? "Change avatar"
                                  : "Upload new photo"}
                            </span>
                          </button>
                        )}

                        <div className="absolute bottom-0 left-0 w-full px-[1.5vw] py-[1vw] sm:px-[0.55vw] sm:py-[0.35vw] bg-gradient-to-t from-black/75 via-black/30 to-transparent text-primary flex items-center justify-between">
                          <span className="detailText text-primary/90 truncate">
                            @{user.username}
                          </span>
                          <span
                            className="w-[1.5vw] h-[1.5vw] sm:w-[0.45vw] sm:h-[0.45vw] rounded-full transition-colors duration-500 shrink-0"
                            style={{ backgroundColor: activePalette.accent }}
                          />
                        </div>
                      </div>

                      {isOwner && (
                        <>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          {isEditing && (
                            <button
                              type="button"
                              disabled={uploadingAvatar}
                              onClick={() => avatarInputRef.current?.click()}
                              className="detailText px-[2.2vw] py-[0.8vw] sm:px-[0.75vw] sm:py-[0.3vw] rounded-[0.25vw] border border-secondary/20 hover:border-secondary/60 bg-primary/90 hover:bg-primary text-secondary transition-colors cursor-pointer drop-shadow"
                            >
                              {uploadingAvatar
                                ? "Uploading..."
                                : avatarUrl
                                  ? "Change avatar"
                                  : "Upload new photo"}
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Inline Profile Edit Drawer (Owner) */}
                    {isEditing && (
                      <form
                        onSubmit={handleSaveProfile}
                        className="col-span-full mt-[6vw] sm:mt-[3vw] pt-[5vw] sm:pt-[2.5vw] border-t border-secondary/15 grid grid-cols-1 sm:grid-cols-12 gap-[3vw] sm:gap-[1.5vw] items-end"
                      >
                        <div className="sm:col-span-4 flex flex-col gap-[0.6vw]">
                          <label className="extraSmallTextBold text-secondary/70">
                            display name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-primary border border-secondary/25 rounded-[0.3vw] px-[2.5vw] py-[1.8vw] sm:px-[0.9vw] sm:py-[0.65vw] smallText text-secondary focus:outline-none focus:border-secondary"
                          />
                        </div>

                        <div className="sm:col-span-5 flex flex-col gap-[0.6vw]">
                          <label className="extraSmallTextBold text-secondary/70">
                            listener bio (max 250 chars)
                          </label>
                          <textarea
                            rows={2}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={250}
                            className="w-full bg-primary border border-secondary/25 rounded-[0.3vw] px-[2.5vw] py-[1.8vw] sm:px-[0.9vw] sm:py-[0.65vw] extraSmallText text-secondary focus:outline-none focus:border-secondary resize-none"
                          />
                        </div>

                        <div className="sm:col-span-3 flex items-center sm:justify-end gap-[2vw] sm:gap-[0.8vw]">
                          <div className="drop-shadow rounded-[0.25vw]">
                            <button
                              type="submit"
                              disabled={savingProfile}
                              className="main-btn smallText text-secondary transition-colors duration-500"
                              style={{ backgroundColor: activePalette.accent }}
                            >
                              <span className="main-btn__icon" aria-hidden="true" />
                              <span className="main-btn__label">
                                <span className="main-btn__clip">
                                  <span className="main-btn__from">
                                    {savingProfile ? "Saving..." : "Save changes"}
                                  </span>
                                  <span className="main-btn__to" aria-hidden="true">
                                    {savingProfile ? "Saving..." : "Save changes"}
                                  </span>
                                </span>
                              </span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="extraSmallText text-secondary/60 hover:text-secondary transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="w-full border-t border-secondary/15 col-span-full mt-[6vw] sm:mt-[3.5vw]" />
                  </div>
                </section>

                {/* 2. TOP 5 RECORDS SECTION (Static 5-Slot Editorial Showcase with Labels Below) */}
                <section
                  ref={recordsContainerRef}
                  id="records"
                  data-nav-color="secondary"
                  className="w-full relative select-none pt-[2vw] pb-[8vw] sm:pb-[6vw] bg-transparent text-secondary z-10"
                >
                  <div className="layout-grid mb-[2vw]">
                    <div className="col-span-full flex justify-between items-center">
                      <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div
                            className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] transition-colors duration-500"
                            style={{ backgroundColor: activePalette.accent }}
                          />
                        </div>
                        <span className="mediumText">top 5 records</span>
                      </div>
                      <div className="flex items-center gap-[2.5vw] sm:gap-[1vw]">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setIsShareModalOpen(true)}
                            className="inline-flex items-center gap-[1.2vw] sm:gap-[0.45vw] extraSmallText text-secondary/80 hover:text-secondary bg-primary hover:bg-secondary/[0.04] border border-secondary/15 hover:border-secondary/35 rounded-[0.3vw] px-[2.4vw] py-[1vw] sm:px-[0.85vw] sm:py-[0.35vw] drop-shadow-soft transition-all cursor-pointer group"
                            title="Generate shareable Top 5 poster for Instagram, Twitter or download"
                          >
                            <svg
                              className="w-[3.5vw] h-[3.5vw] sm:w-[0.9vw] sm:h-[0.9vw] transition-transform group-hover:scale-110"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="18" cy="5" r="3" />
                              <circle cx="6" cy="12" r="3" />
                              <circle cx="18" cy="19" r="3" />
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            <span>share poster</span>
                          </button>
                        )}
                        <h2 className="mediumText">curated ({initialAlbums.length}/5)</h2>
                      </div>
                    </div>
                  </div>

                  {/* 5-Column Record Grid */}
                  <div className="w-full py-[2.5vw] px-[var(--margin)]">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-[3.5vw] sm:gap-[1.5vw] w-full items-start">
                      {[1, 2, 3, 4, 5].map((pos, i) => {
                        const album = initialAlbums.find((a) => a.position === pos);

                        if (album) {
                          return (
                            <div
                              key={pos}
                              ref={(el) => {
                                albumCardRefs.current[i] = el;
                              }}
                              onMouseEnter={() => setHoveredAlbumIndex(i)}
                              onMouseLeave={() => setHoveredAlbumIndex(null)}
                              className={`shrink-0 min-w-0 flex flex-col gap-[1.5vw] sm:gap-[0.65vw] will-change-transform group ${
                                pos === 5
                                  ? "col-span-2 sm:col-span-1 max-w-[calc(50%-1.75vw)] mx-auto sm:max-w-none w-full sm:w-full"
                                  : "col-span-1 w-full"
                              }`}
                            >
                              {/* Square Record Cover */}
                              <div className="w-full aspect-square rounded-[0.5vw] overflow-hidden drop-shadow-soft bg-secondary relative">
                                {/* Top-left rank badge */}
                                <div
                                  className="absolute top-[2.5vw] left-[2.5vw] sm:top-[0.85vw] sm:left-[0.85vw] z-20 px-[1.8vw] py-[0.6vw] sm:px-[0.5vw] sm:py-[0.18vw] rounded-[0.2vw] detailText font-medium drop-shadow transition-colors duration-500 pointer-events-none"
                                  style={{
                                    backgroundColor: activePalette.accent,
                                    color: activePalette.textOnAccent || "#0E0E0E",
                                  }}
                                >
                                  0{pos}
                                </div>

                                {/* Owner Hover Controls (Top-Right) */}
                                {isOwner && (
                                  <div className="absolute top-[2.5vw] right-[2.5vw] sm:top-[0.85vw] sm:right-[0.85vw] z-20 flex items-center gap-[1vw] sm:gap-[0.3vw] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {pos > 1 && (
                                      <button
                                        type="button"
                                        disabled={reordering}
                                        onClick={() => handleSwapAlbumPosition(pos, pos - 1)}
                                        className="px-[1.6vw] py-[0.6vw] sm:px-[0.4vw] sm:py-[0.18vw] rounded-[0.2vw] bg-primary/95 text-secondary detailText font-medium hover:bg-primary cursor-pointer drop-shadow"
                                        title="Move left"
                                      >
                                        ←
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setAlbumModalPos(pos)}
                                      className="px-[2vw] py-[0.6vw] sm:px-[0.5vw] sm:py-[0.18vw] rounded-[0.2vw] bg-primary/95 text-secondary detailText font-medium hover:bg-primary cursor-pointer drop-shadow"
                                    >
                                      Replace
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAlbum(pos)}
                                      className="px-[2vw] py-[0.6vw] sm:px-[0.5vw] sm:py-[0.18vw] rounded-[0.2vw] bg-secondary/90 text-primary detailText font-medium hover:bg-red-600 cursor-pointer drop-shadow transition-colors"
                                    >
                                      Remove
                                    </button>
                                    {pos < 5 && (
                                      <button
                                        type="button"
                                        disabled={reordering}
                                        onClick={() => handleSwapAlbumPosition(pos, pos + 1)}
                                        className="px-[1.6vw] py-[0.6vw] sm:px-[0.4vw] sm:py-[0.18vw] rounded-[0.2vw] bg-primary/95 text-secondary detailText font-medium hover:bg-primary cursor-pointer drop-shadow"
                                        title="Move right"
                                      >
                                        →
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Full-bleed Album Cover */}
                                <Link
                                  href={`/album/${album.albumId}`}
                                  className="block w-full h-full"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={album.coverUrl || "/images/musi5t/vinyl_player.webp"}
                                    alt={`${album.artistName} - ${album.title}`}
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      if (!target.src.includes("vinyl_player.webp")) {
                                        target.src = "/images/musi5t/vinyl_player.webp";
                                      }
                                    }}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                                  />
                                </Link>
                              </div>

                              {/* Album Title & Artist Below Cover in Small Text */}
                              <Link
                                href={`/album/${album.albumId}`}
                                className="flex flex-col gap-[0.3vw] sm:gap-[0.15vw] px-[0.2vw] min-w-0 hover:opacity-75 transition-opacity"
                              >
                                <span
                                  className="extraSmallText font-medium text-secondary block truncate"
                                  title={album.title}
                                >
                                  {album.title}
                                </span>
                                <span
                                  className="detailText text-secondary/60 block truncate"
                                  title={album.artistName}
                                >
                                  {album.artistName}
                                  {album.releaseYear ? ` · ${album.releaseYear}` : ""}
                                </span>
                              </Link>
                            </div>
                          );
                        }

                        // Empty Slot Card (Dark Editorial Vinyl Placeholder + Label Below)
                        return (
                          <div
                            key={pos}
                            ref={(el) => {
                              albumCardRefs.current[i] = el;
                            }}
                            onMouseEnter={() => setHoveredAlbumIndex(i)}
                            onMouseLeave={() => setHoveredAlbumIndex(null)}
                            onClick={() => isOwner && setAlbumModalPos(pos)}
                            className={`shrink-0 min-w-0 flex flex-col gap-[1.5vw] sm:gap-[0.65vw] will-change-transform group ${
                              pos === 5
                                ? "col-span-2 sm:col-span-1 max-w-[calc(50%-1.75vw)] mx-auto sm:max-w-none w-full sm:w-full"
                                : "col-span-1 w-full"
                            } ${isOwner ? "cursor-pointer" : "opacity-80"}`}
                          >
                            <div className="w-full aspect-square rounded-[0.5vw] overflow-hidden drop-shadow-soft bg-secondary text-primary relative flex flex-col justify-between p-[3.5vw] sm:p-[1.2vw]">
                              {/* Top Rank Badge */}
                              <div className="flex items-center justify-between z-10">
                                <span
                                  className="px-[1.8vw] py-[0.6vw] sm:px-[0.5vw] sm:py-[0.18vw] rounded-[0.2vw] detailText font-medium transition-colors duration-500"
                                  style={{
                                    backgroundColor: activePalette.accent,
                                    color: activePalette.textOnAccent || "#0E0E0E",
                                  }}
                                >
                                  0{pos}
                                </span>
                                <span className="detailText text-primary/40">vinyl slot</span>
                              </div>

                              {/* Decorative Concentric Vinyl Grooves */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[68%] h-[68%] rounded-full border border-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                  <div className="w-[62%] h-[62%] rounded-full border border-primary/15 flex items-center justify-center">
                                    <div
                                      className="w-[34%] h-[34%] rounded-full opacity-80 transition-colors duration-500"
                                      style={{ backgroundColor: activePalette.accent }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Small Text Below Empty Cover */}
                            <div className="flex flex-col gap-[0.3vw] sm:gap-[0.15vw] px-[0.2vw] min-w-0">
                              <span className="extraSmallText font-medium text-secondary/55 block truncate">
                                {isOwner ? `+ curate record 0${pos}` : `empty record 0${pos}`}
                              </span>
                              <span className="detailText text-secondary/40 block truncate">
                                {isOwner
                                  ? "select pressing & sleeve"
                                  : "no edition selected"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* 3. TOP 5 TRACKS SECTION (Editorial Numbered Rows) */}
                <section
                  id="tracks"
                  data-nav-color="secondary"
                  className="w-full bg-transparent text-secondary py-[6vw] sm:py-[4vw] relative z-10 select-none"
                >
                  <div className="layout-grid mb-[4vw] sm:mb-[2.5vw]">
                    <div className="col-span-full flex justify-between items-center">
                      <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div
                            className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] transition-colors duration-500"
                            style={{ backgroundColor: activePalette.accent }}
                          />
                        </div>
                        <span className="mediumText">top 5 tracks</span>
                      </div>
                      <h2 className="mediumText">essential ({initialSongs.length}/5)</h2>
                    </div>
                  </div>

                  <div className="layout-grid">
                    {[1, 2, 3, 4, 5].map((pos, idx) => {
                      const song = initialSongs.find((s) => s.position === pos);
                      const isLast = idx === 4;

                      if (song) {
                        const isThisSongActive =
                          currentTrack !== null &&
                          currentTrack.title.toLowerCase() === song.title.toLowerCase() &&
                          currentTrack.artistName.toLowerCase() === song.artistName.toLowerCase();
                        const isThisSongPlaying = isThisSongActive && isPlaying;
                        const isThisSongLoading = isThisSongActive && isLoading;

                        const handleSongPlayback = () => {
                          if (isThisSongPlaying) {
                            pause();
                          } else if (isThisSongActive) {
                            resume();
                          } else {
                            playTrack({
                              title: song.title,
                              artistName: song.artistName,
                              coverUrl: song.coverUrl,
                            });
                          }
                        };

                        return (
                          <div
                            key={pos}
                            className={`col-span-full grid grid-cols-6 sm:grid-cols-12 gap-[var(--gutter)] items-center py-[3.8vw] sm:py-[1.8vw] border-t border-secondary/15 group hover:bg-secondary/[0.03] transition-colors rounded-[0.25vw] px-[1vw] ${
                              isLast ? "border-b" : ""
                            } ${isThisSongActive ? "bg-secondary/[0.04]" : ""}`}
                          >
                            {/* Index Number */}
                            <div className="col-span-1 flex items-center">
                              <span
                                className="px-[1.8vw] py-[0.6vw] sm:px-[0.65vw] sm:py-[0.25vw] rounded-[0.2vw] extraSmallTextBold drop-shadow transition-colors duration-500"
                                style={{
                                  backgroundColor: activePalette.accent,
                                  color: activePalette.textOnAccent || "#0E0E0E",
                                }}
                              >
                                0{pos}
                              </span>
                            </div>

                            {/* Track Cover & Title/Artist */}
                            <div className="col-span-3 sm:col-span-7 flex items-center gap-[2.5vw] sm:gap-[1.5vw] min-w-0 group-hover:translate-x-[0.4vw] transition-transform duration-300">
                              <div
                                onClick={handleSongPlayback}
                                className="relative w-[11vw] h-[11vw] sm:w-[3.8vw] sm:h-[3.8vw] rounded-[0.3vw] overflow-hidden shrink-0 group/cover cursor-pointer drop-shadow-soft"
                              >
                                {song.coverUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={song.coverUrl}
                                    alt={song.title}
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      if (!target.src.includes("vinyl_player.webp")) {
                                        target.src = "/images/musi5t/vinyl_player.webp";
                                      }
                                    }}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center bg-secondary text-primary detailText"
                                  >
                                    0{pos}
                                  </div>
                                )}

                                {/* Play/Pause Overlay Button */}
                                <div
                                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                                    isThisSongActive
                                      ? "bg-black/50 opacity-100"
                                      : "bg-black/40 opacity-0 group-hover/cover:opacity-100"
                                  }`}
                                >
                                  <div
                                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white drop-shadow transition-transform hover:scale-110"
                                    style={{
                                      backgroundColor: activePalette.accent,
                                      color: activePalette.textOnAccent || "#0E0E0E",
                                    }}
                                  >
                                    {isThisSongLoading ? (
                                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                      </svg>
                                    ) : isThisSongPlaying ? (
                                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                        <rect x="6" y="4" width="4" height="16" rx="1" />
                                        <rect x="14" y="4" width="4" height="16" rx="1" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div
                                className="min-w-0 cursor-pointer"
                                onClick={handleSongPlayback}
                              >
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`mediumText font-medium truncate transition-colors ${
                                      isThisSongActive ? "font-semibold" : ""
                                    }`}
                                    style={isThisSongActive ? { color: activePalette.accent } : undefined}
                                  >
                                    {song.title}
                                  </h3>
                                  {isThisSongPlaying && (
                                    <span className="flex items-end gap-[1.5px] h-3 shrink-0">
                                      <span
                                        className="w-[2px] h-3 rounded-full animate-bounce [animation-duration:800ms]"
                                        style={{ backgroundColor: activePalette.accent }}
                                      />
                                      <span
                                        className="w-[2px] h-2 rounded-full animate-bounce [animation-delay:200ms] [animation-duration:600ms]"
                                        style={{ backgroundColor: activePalette.accent }}
                                      />
                                      <span
                                        className="w-[2px] h-3 rounded-full animate-bounce [animation-delay:400ms] [animation-duration:900ms]"
                                        style={{ backgroundColor: activePalette.accent }}
                                      />
                                    </span>
                                  )}
                                </div>
                                <p className="extraSmallText text-secondary/60 truncate mt-[0.2vw]">
                                  {song.artistName}
                                </p>
                              </div>
                            </div>

                            {/* Owner Controls / Track Tag */}
                            <div className="col-span-2 sm:col-span-4 flex items-center justify-end gap-[1.2vw] sm:gap-[0.5vw]">
                              {isOwner && (
                                <div className="flex items-center gap-[1vw] sm:gap-[0.4vw] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  {pos > 1 && (
                                    <button
                                      type="button"
                                      disabled={reordering}
                                      onClick={() => handleSwapSongPosition(pos, pos - 1)}
                                      className="detailText px-[1.8vw] py-[0.8vw] sm:px-[0.55vw] sm:py-[0.25vw] rounded-[0.2vw] border border-secondary/20 hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
                                      title="Move up"
                                    >
                                      ↑
                                    </button>
                                  )}
                                  {pos < 5 && (
                                    <button
                                      type="button"
                                      disabled={reordering}
                                      onClick={() => handleSwapSongPosition(pos, pos + 1)}
                                      className="detailText px-[1.8vw] py-[0.8vw] sm:px-[0.55vw] sm:py-[0.25vw] rounded-[0.2vw] border border-secondary/20 hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
                                      title="Move down"
                                    >
                                      ↓
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSongModalPos(pos)}
                                    className="detailText px-[2vw] py-[0.8vw] sm:px-[0.65vw] sm:py-[0.25vw] rounded-[0.2vw] border border-secondary/20 hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
                                  >
                                    Replace
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSong(pos)}
                                    className="detailText px-[1.8vw] py-[0.8vw] sm:px-[0.55vw] sm:py-[0.25vw] rounded-[0.2vw] border border-red-600/30 text-red-700 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              <span className="detailText text-secondary/40 hidden sm:inline">
                                track 0{pos}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // Empty Track Row
                      return (
                        <div
                          key={pos}
                          onClick={() => isOwner && setSongModalPos(pos)}
                          className={`col-span-full grid grid-cols-6 sm:grid-cols-12 gap-[var(--gutter)] items-center py-[3.8vw] sm:py-[1.8vw] border-t border-secondary/15 px-[1vw] transition-colors ${
                            isLast ? "border-b" : ""
                          } ${
                            isOwner
                              ? "hover:bg-secondary/[0.03] cursor-pointer group"
                              : "opacity-50"
                          }`}
                        >
                          <div className="col-span-1">
                            <span className="extraSmallTextBold text-secondary/40">
                              0{pos}
                            </span>
                          </div>
                          <div className="col-span-4 sm:col-span-8">
                            <span className="mediumText text-secondary/45 group-hover:text-secondary transition-colors">
                              {isOwner ? `+ curate track 0${pos}` : "unassigned track slot"}
                            </span>
                          </div>
                          <div className="col-span-1 sm:col-span-3 text-right">
                            <span className="detailText text-secondary/35">—</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 4. CURATED LISTS SECTION (#lists) */}
                <section
                  id="lists"
                  data-nav-color="secondary"
                  className="w-full bg-transparent text-secondary py-[6vw] sm:py-[4vw] relative z-10 select-none"
                >
                  <div className="layout-grid mb-[4vw] sm:mb-[2.5vw]">
                    <div className="col-span-full flex justify-between items-center">
                      <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div
                            className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] transition-colors duration-500"
                            style={{ backgroundColor: activePalette.accent }}
                          />
                        </div>
                        <span className="mediumText">curated lists</span>
                      </div>
                      <div className="flex items-center gap-[2.5vw] sm:gap-[1vw]">
                        <h2 className="mediumText">lists ({lists.length})</h2>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setIsCreateListModalOpen(true)}
                            className="extraSmallText font-medium px-[3vw] py-[1.2vw] sm:px-[1vw] sm:py-[0.4vw] rounded-[0.3vw] transition-colors cursor-pointer"
                            style={{
                              backgroundColor: activePalette.accent,
                              color: activePalette.textOnAccent || "#0E0E0E",
                            }}
                          >
                            + Create List
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="layout-grid">
                    {lists.length > 0 ? (
                      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[5vw] sm:gap-[1.8vw]">
                        {lists.map((l) => (
                          <ListCard key={l.id} list={l} accentColor={activePalette.accent} />
                        ))}
                      </div>
                    ) : (
                      <div className="col-span-full border border-dashed border-secondary/15 rounded-[0.4vw] py-[10vw] sm:py-[4.5vw] px-[4vw] text-center flex flex-col items-center justify-center gap-[2vw] sm:gap-[0.8vw]">
                        <p className="smallText text-secondary/60 font-light">
                          No curated lists yet.
                        </p>
                        <p className="extraSmallText text-secondary/40 max-w-[36ch]">
                          {isOwner
                            ? "Organize your favorite albums by theme, decade, genre, or mood."
                            : `@${user.username} hasn't published any curated lists yet.`}
                        </p>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setIsCreateListModalOpen(true)}
                            className="extraSmallText font-medium px-[4vw] py-[1.5vw] sm:px-[1.2vw] sm:py-[0.45vw] rounded-[0.3vw] transition-colors cursor-pointer mt-[1.5vw] sm:mt-[0.5vw]"
                            style={{
                              backgroundColor: activePalette.accent,
                              color: activePalette.textOnAccent || "#0E0E0E",
                            }}
                          >
                            + Create your first list
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* 5. LISTENER DISCUSSIONS SECTION (#discussions) */}
                <section
                  id="discussions"
                  data-nav-color="secondary"
                  className="w-full bg-transparent text-secondary pt-[6vw] sm:pt-[4vw] pb-[12vw] sm:pb-[8vw] relative z-10"
                >
                  <div className="layout-grid mb-[4vw] sm:mb-[3vw]">
                    <div className="col-span-full flex justify-between items-center">
                      <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div
                            className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] transition-colors duration-500"
                            style={{ backgroundColor: activePalette.accent }}
                          />
                        </div>
                        <span className="mediumText">listener notes</span>
                      </div>
                      <h2 className="mediumText">discussions ({totalPostsCount})</h2>
                    </div>
                  </div>

                  <div className="layout-grid items-start">
                    {/* Left Column: Editorial Context */}
                    <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[6vw] sm:mb-0">
                      <span className="smallText font-medium">
                        Record-driven conversations
                      </span>
                      <p className="extraSmallText text-secondary/60 leading-relaxed pr-[2vw]">
                        Thoughts, sleeve notes, and ratings published by @{user.username} across album communities and the global feed.
                      </p>
                      {isOwner && (
                        <div className="w-fit mt-[1vw]">
                          <div className="drop-shadow rounded-[0.25vw]">
                            <Link
                              href="/feed"
                              className="main-btn smallText text-secondary transition-colors duration-500"
                              style={{ backgroundColor: activePalette.accent }}
                            >
                              <span className="main-btn__icon" aria-hidden="true" />
                              <span className="main-btn__label">
                                <span className="main-btn__clip">
                                  <span className="main-btn__from">Publish a note</span>
                                  <span className="main-btn__to" aria-hidden="true">
                                    Publish a note
                                  </span>
                                </span>
                              </span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Feed Posts */}
                    <div className="col-span-full sm:col-span-8">
                      {profilePosts.length === 0 ? (
                        <div className="p-[6vw] sm:p-[3vw] border border-secondary/15 rounded-[0.5vw] bg-primary/80 backdrop-blur-sm flex flex-col items-start justify-between gap-[1.5vw]">
                          <span className="smallText font-medium text-secondary">
                            No visible notes from @{user.username} yet.
                          </span>
                          <p className="extraSmallText text-secondary/55">
                            When @{user.username} shares thoughts on an album or posts to the feed, they will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-[3vw] sm:gap-[1.5vw]">
                          <InteractivePostList
                            posts={profilePosts}
                            currentUser={currentUser}
                            onPostsChange={setProfilePosts}
                            variant="light"
                          />
                          {postsCursor && (
                            <div className="w-full flex justify-center pt-[4vw] sm:pt-[2vw]">
                              <button
                                type="button"
                                disabled={loadingMorePosts}
                                onClick={handleLoadMorePosts}
                                className="inline-flex items-center gap-[1.2vw] sm:gap-[0.45vw] px-[4vw] py-[2vw] sm:px-[1.4vw] sm:py-[0.6vw] rounded-[0.35vw] border border-secondary/20 hover:border-secondary/40 bg-primary hover:bg-secondary/[0.04] text-secondary font-medium extraSmallText drop-shadow-soft transition-all cursor-pointer disabled:opacity-50"
                              >
                                {loadingMorePosts ? (
                                  <>
                                    <div className="w-[3vw] h-[3vw] sm:w-[0.8vw] sm:h-[0.8vw] border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                                    <span>Loading notes...</span>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className="w-[1.6vw] h-[1.6vw] sm:w-[0.45vw] sm:h-[0.45vw] rounded-full"
                                      style={{ backgroundColor: activePalette.accent }}
                                    />
                                    <span>+ Load more notes</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 5. DARK EDITORIAL FOOTER (matching src/app/page.tsx) */}
                <footer
                  data-nav-color="primary"
                  className="w-full bg-secondary text-primary layout-grid pt-[6vw] pb-[4vw] border-t border-primary/10 select-none relative z-10"
                >
                  {/* Profile & Platform Links */}
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[8vw] sm:mb-0">
                    <span className="extraSmallText text-primary/40 font-mono">
                      listener archive
                    </span>
                    <div className="flex flex-col gap-[0.5vw]">
                      <Link
                        href="/"
                        className="footer-link-clip w-fit mediumText hover:opacity-75 transition-opacity duration-300"
                      >
                        musi5t home
                      </Link>
                      <Link
                        href="/feed"
                        className="footer-link-clip w-fit mediumText hover:opacity-75 transition-opacity duration-300"
                      >
                        community feed
                      </Link>
                    </div>
                  </div>

                  {/* Back to top button */}
                  <div className="col-span-full sm:col-span-4 flex items-center justify-center mb-[8vw] sm:mb-0">
                    <button
                      type="button"
                      onClick={() => scrollTo("#overview")}
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
                        feed
                      </Link>
                      <span>,</span>
                      <Link href="/lists" className="hover:text-primary transition-colors">
                        lists
                      </Link>
                      <span>,</span>
                      <span className="opacity-40">@{user.username}</span>
                    </div>
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Album Search & Edition Modal (Rendered outside clip-path main) */}
      {albumModalPos && (
        <div data-lenis-prevent>
          <AlbumSearchModal
            isOpen={true}
            position={albumModalPos}
            onClose={() => setAlbumModalPos(null)}
            onSelectAlbum={handleSelectAlbum}
            accentColor={activePalette.accent}
          />
        </div>
      )}

      {/* Song Search Modal (Rendered outside clip-path main) */}
      {songModalPos && (
        <div data-lenis-prevent>
          <SongSearchModal
            isOpen={true}
            position={songModalPos}
            onClose={() => setSongModalPos(null)}
            onSelectSong={handleSelectSong}
            accentColor={activePalette.accent}
          />
        </div>
      )}

      {/* Share Top 5 Poster Modal */}
      <div data-lenis-prevent>
        <ShareTop5Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          user={{
            username: user.username,
            displayName: user.displayName,
          }}
          albums={initialAlbums}
          activePalette={activePalette}
        />
      </div>

      {/* Create List Modal */}
      {isCreateListModalOpen && (
        <div data-lenis-prevent>
          <CreateListModal
            isOpen={isCreateListModalOpen}
            accentColor={activePalette.accent}
            onClose={() => setIsCreateListModalOpen(false)}
            onSuccess={(created) => {
              const createdList = created as ListSummary;
              setLists((prev) => [createdList, ...prev.filter((l) => l.id !== createdList.id)]);
            }}
          />
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            className="fixed inset-y-0 right-0 w-[86vw] max-w-[360px] bg-primary text-secondary border-l border-secondary/15 drop-shadow-soft flex flex-col justify-between overflow-hidden z-10 animate-in slide-in-from-right duration-200"
          >
            {/* Top Bar with user info and close button */}
            <div className="p-5 border-b border-secondary/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-secondary/25 shrink-0 flex items-center justify-center">
                  <UserAvatar
                    avatarUrl={isOwner ? avatarUrl : (currentUser?.avatarUrl || user.avatarUrl)}
                    displayName={isOwner ? displayName : (currentUser?.displayName || user.displayName)}
                    themeKey={isOwner ? activePalette.key : (currentUser?.themeKey || user.themeKey)}
                    textClassName="text-sm font-bold leading-none"
                  />
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-sm font-semibold text-secondary truncate">
                    {isOwner
                      ? displayName || user.username
                      : currentUser
                      ? currentUser.displayName || currentUser.username
                      : user.displayName || user.username}
                  </span>
                  <span className="text-xs text-secondary/60 truncate">
                    @{isOwner ? user.username : (currentUser ? currentUser.username : user.username)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary/60 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Prominent Feed Button */}
              <Link
                href={isLoggedIn ? "/feed" : "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium shadow-sm transition-transform active:scale-98 cursor-pointer text-sm"
                style={{
                  backgroundColor: activePalette.accent,
                  color: activePalette.textOnAccent || "#0E0E0E",
                }}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>{isLoggedIn ? "Feed" : "Home"}</span>
              </Link>

              {/* Anchor Shortcuts for Profile Sections */}
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-secondary/40 font-semibold px-1">
                  Sections
                </span>
                <div className="flex flex-col gap-1">
                  {[
                    { id: "#overview", label: "Overview" },
                    { id: "#records", label: "Top 5 Records" },
                    { id: "#tracks", label: "Top 5 Tracks" },
                    { id: "#lists", label: "Custom Lists" },
                    { id: "#discussions", label: "Discussions" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollTo(sec.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-secondary/80 hover:text-secondary hover:bg-secondary/[0.06] transition-colors text-left text-sm font-medium cursor-pointer"
                    >
                      <span>{sec.label}</span>
                      <span className="text-secondary/30 text-xs">↓</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Owner Palette Selector */}
              {isOwner && (
                <div className="space-y-2 pt-3 border-t border-secondary/10">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] uppercase tracking-wider text-secondary/40 font-semibold">
                      Color Palette
                    </span>
                    <span className="text-xs text-secondary/50 font-medium">
                      {PALETTE_NAMES[activePalette.key] || activePalette.label}
                    </span>
                  </div>

                  {verificationNotice && (
                    <div className="p-2.5 rounded-lg bg-secondary/[0.05] border border-secondary/15 text-secondary text-xs flex flex-col gap-1.5">
                      <span>{verificationNotice}</span>
                      <button
                        type="button"
                        disabled={resendingVerification}
                        onClick={handleResendVerification}
                        className="text-left underline font-medium text-xs text-secondary/80 hover:text-secondary cursor-pointer"
                      >
                        {resendingVerification ? "Sending..." : "Resend verification link"}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {PROFILE_PALETTES.map((p) => {
                      const isSelected = currentThemeKey === p.key;
                      const isLocked = Boolean(p.requiresVerification && !emailVerified);
                      const name =
                        PALETTE_NAMES[p.key] || (p.label.charAt(0).toUpperCase() + p.label.slice(1));

                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              setVerificationNotice(
                                `The "${p.label}" palette is exclusive to members with a verified email.`
                              );
                            } else {
                              handlePaletteChange(p.key);
                            }
                          }}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                            isSelected
                              ? "border-secondary bg-secondary/[0.08]"
                              : "border-secondary/15 hover:border-secondary/30 bg-secondary/[0.02]"
                          } ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div
                            className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center relative shadow-sm"
                            style={{
                              background: `radial-gradient(circle at 35% 35%, ${p.secondaryOrb}, ${p.accent} 65%, ${p.softGlow})`,
                            }}
                          >
                            {isLocked ? (
                              <svg
                                className="w-3 h-3 text-white drop-shadow"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            ) : isSelected ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-white shadow" />
                            ) : null}
                          </div>
                          <span className="text-xs font-medium text-secondary truncate">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Profile Controls (Edit Profile & Share Top 5 Poster) */}
              {isOwner && (
                <div className="space-y-2 pt-3 border-t border-secondary/10">
                  <span className="text-[11px] uppercase tracking-wider text-secondary/40 font-semibold px-1">
                    Actions
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(!isEditing);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-secondary/20 hover:bg-secondary/[0.06] transition-colors text-left text-sm font-medium cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-secondary/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>{isEditing ? "Close edit" : "Edit Profile"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsShareModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-secondary/20 hover:bg-secondary/[0.06] transition-colors text-left text-sm font-medium cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-secondary/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      <span>Share Top 5 Poster</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Settings & Logout / Sign In */}
              <div className="space-y-1.5 pt-3 border-t border-secondary/10">
                {isOwner || isLoggedIn || currentUser ? (
                  <>
                    <Link
                      href="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary/80 hover:text-secondary hover:bg-secondary/[0.06] transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4 text-secondary/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      <span>Settings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-left text-sm font-medium cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-secondary text-primary font-medium text-sm transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
