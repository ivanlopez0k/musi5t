"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import { PaletteSelector, PROFILE_PALETTES } from "@/components/profile/PaletteSelector";

export interface ModeratedUserItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface SettingsViewProps {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    themeKey: string;
  };
  initialMutedUsers: ModeratedUserItem[];
  initialBlockedUsers: ModeratedUserItem[];
}

export function SettingsView({
  user,
  initialMutedUsers,
  initialBlockedUsers,
}: SettingsViewProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [themeKey, setThemeKey] = useState(user.themeKey || "lima");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [mutedUsers, setMutedUsers] = useState<ModeratedUserItem[]>(initialMutedUsers);
  const [blockedUsers, setBlockedUsers] = useState<ModeratedUserItem[]>(initialBlockedUsers);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePalette =
    PROFILE_PALETTES.find((p) => p.key === themeKey) || PROFILE_PALETTES[0];

  // Lenis smooth scroll initialization (matching Home, Profile & Feed)
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

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setStatusMessage(null);

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
        setStatusMessage("Profile photo uploaded.");
        router.refresh();
      } else {
        setStatusMessage(data.error || "Failed to upload photo.");
      }
    } catch {
      setStatusMessage("Failed to upload photo.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/v1/users/avatar", {
        method: "DELETE",
      });
      if (res.ok) {
        setAvatarUrl("");
        setStatusMessage("Profile photo removed.");
        router.refresh();
      } else {
        const data = await res.json();
        setStatusMessage(data.error || "Failed to remove photo.");
      }
    } catch {
      setStatusMessage("Failed to remove photo.");
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl: avatarUrl.trim() || null,
          themeKey,
        }),
      });
      if (res.ok) {
        setStatusMessage("Profile settings saved.");
        router.refresh();
      } else {
        const data = await res.json();
        setStatusMessage(data.error || "Failed to save settings.");
      }
    } catch {
      setStatusMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnmute = async (targetId: string) => {
    try {
      const res = await fetch(`/api/v1/users/${targetId}/mute`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMutedUsers((prev) => prev.filter((u) => u.id !== targetId));
      }
    } catch (err) {
      console.error("Failed to unmute user:", err);
    }
  };

  const handleUnblock = async (targetId: string) => {
    try {
      const res = await fetch(`/api/v1/users/${targetId}/block`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBlockedUsers((prev) => prev.filter((u) => u.id !== targetId));
      }
    } catch (err) {
      console.error("Failed to unblock user:", err);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to permanently delete your account? All your Top 5 lists, posts, replies, and ratings will be permanently removed."
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      setDeletingAccount(false);
    }
  };

  const saveLabel = saving ? "Saving..." : "Save settings";

  return (
    <div className="site-frame text-secondary">
      <div className="site-layout">
        <div
          className="app transition-colors duration-700"
          style={{ backgroundColor: activePalette.accent }}
        >
          <div className="route-surface">
            {/* Editorial Fixed Header (matching Home, Profile & Feed) */}
            <header className="header">
              <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto select-none">
                {/* Brand Wordmark */}
                <div className="mediumText col-span-3 flex justify-start items-center">
                  <Link href="/feed" className="nav-btn cursor-pointer text-left nav-blend">
                    musi5t
                  </Link>
                </div>

                {/* Center Navigation Group */}
                <div className="smallText col-span-5 justify-center items-center hidden sm:flex">
                  <span className="nav-group flex items-center gap-[0.5vw] nav-blend">
                    <Link href="/feed" className="nav-btn cursor-pointer">
                      Feed
                    </Link>
                    <span className="opacity-35">•</span>
                    <Link href="/rankings" className="nav-btn cursor-pointer">
                      Rankings
                    </Link>
                  </span>
                </div>

                {/* Right Actions: User Profile Badge */}
                <div className="col-span-4 flex justify-end items-center gap-[2vw] sm:gap-[1vw]">
                  <Link
                    href={`/@${user.username}`}
                    className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full overflow-hidden border border-current/25 hover:border-current transition-all drop-shadow flex items-center justify-center shrink-0 group"
                    title={`@${user.username}`}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={displayName || user.displayName || user.username}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="w-full h-full bg-yellow text-secondary flex items-center justify-center text-[3.2vw] sm:text-[0.8vw] font-bold">
                        {(displayName || user.displayName || user.username).slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </Link>
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
                  id="settings-top"
                  data-nav-color="secondary"
                  className="w-full min-h-lvh pt-[22vw] sm:pt-[9vw] pb-[10vw] sm:pb-[6vw]"
                >
                  <div className="layout-grid">
                    {/* Centered Settings Column */}
                    <div className="col-span-full sm:col-start-3 sm:col-span-8">
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

                      {/* Hero / Title Section */}
                      <div className="flex flex-col gap-[1.5vw] sm:gap-[0.7vw] pb-[3.5vw] sm:pb-[1.8vw] mb-[4vw] sm:mb-[2.5vw] border-b border-secondary/15">
                        <div className="flex items-center gap-[2vw] sm:gap-[1vw]">
                          <div className="drop-shadow rounded-[0.25vw]">
                            <div
                              className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] transition-colors duration-500"
                              style={{ backgroundColor: activePalette.accent }}
                            />
                          </div>
                          <h1 className="largeText lowercase">settings</h1>
                        </div>
                        <p className="smallText text-secondary/60">
                          account preferences, curated theme & privacy moderation
                        </p>
                      </div>

                      {/* 1. Profile & Theme Section */}
                      <section className="bg-primary border border-secondary/15 rounded-[0.5vw] drop-shadow-soft p-[3.5vw] sm:p-[2vw] mb-[3vw] sm:mb-[2vw]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[1vw] pb-[2.5vw] sm:pb-[1.2vw] mb-[3vw] sm:mb-[1.5vw] border-b border-secondary/10">
                          <h2 className="mediumText lowercase">profile & palette</h2>
                          <span className="extraSmallText text-secondary/50">
                            @{user.username} • {user.email}
                          </span>
                        </div>

                        <form
                          onSubmit={handleSaveProfile}
                          className="space-y-[3vw] sm:space-y-[1.4vw]"
                        >
                          <div>
                            <label className="block extraSmallTextBold text-secondary/70 lowercase mb-[1vw] sm:mb-[0.4vw]">
                              display name
                            </label>
                            <input
                              type="text"
                              value={displayName}
                              maxLength={60}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[2.5vw] py-[1.8vw] sm:px-[1vw] sm:py-[0.65vw] smallText text-secondary focus:outline-none focus:border-secondary transition-colors"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-[1vw] sm:mb-[0.4vw]">
                              <label className="block extraSmallTextBold text-secondary/70 lowercase">
                                bio
                              </label>
                              <span className="detailText text-secondary/40">
                                {bio.length}/250
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={bio}
                              maxLength={250}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Share a note about your record collection or favorite genres..."
                              className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[2.5vw] py-[1.8vw] sm:px-[1vw] sm:py-[0.65vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors resize-none"
                            />
                          </div>

                          <div>
                            <label className="block extraSmallTextBold text-secondary/70 lowercase mb-[1.5vw] sm:mb-[0.6vw]">
                              profile photo
                            </label>
                            <div className="flex flex-wrap items-center gap-[3vw] sm:gap-[1.2vw] p-[2.5vw] sm:p-[1vw] rounded-[0.4vw] border border-secondary/15 bg-secondary/[0.02]">
                              <div
                                className="aspect-square rounded-[0.4vw] w-[14vw] sm:w-[4.5vw] drop-shadow-soft overflow-hidden flex items-center justify-center flex-shrink-0 transition-colors duration-500"
                                style={{ backgroundColor: activePalette.accent }}
                              >
                                {avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={avatarUrl}
                                    alt={displayName || user.displayName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="mediumText font-medium text-secondary select-none">
                                    {(displayName || user.displayName || "U")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>

                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={handleAvatarFileChange}
                                className="hidden"
                              />

                              <div className="flex flex-col gap-[1vw] sm:gap-[0.4vw]">
                                <div className="flex flex-wrap items-center gap-[2vw] sm:gap-[0.8vw]">
                                  <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                                    <button
                                      type="button"
                                      disabled={uploadingAvatar || removingAvatar}
                                      onClick={() => fileInputRef.current?.click()}
                                      className="main-btn smallText text-secondary disabled:opacity-50 cursor-pointer transition-colors duration-500"
                                      style={{ backgroundColor: activePalette.accent }}
                                    >
                                      <span className="main-btn__icon" aria-hidden="true" />
                                      <span className="main-btn__label">
                                        <span className="main-btn__clip">
                                          <span className="main-btn__from">
                                            {uploadingAvatar
                                              ? "Uploading..."
                                              : avatarUrl
                                                ? "Change photo"
                                                : "Upload image"}
                                          </span>
                                          <span className="main-btn__to" aria-hidden="true">
                                            {uploadingAvatar
                                              ? "Uploading..."
                                              : avatarUrl
                                                ? "Change photo"
                                                : "Upload image"}
                                          </span>
                                        </span>
                                      </span>
                                    </button>
                                  </div>

                                  {avatarUrl && (
                                    <button
                                      type="button"
                                      disabled={removingAvatar || uploadingAvatar}
                                      onClick={handleRemoveAvatar}
                                      className="extraSmallText text-red-600/80 hover:text-red-600 underline transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {removingAvatar ? "Removing..." : "Remove photo"}
                                    </button>
                                  )}
                                </div>

                                <span className="detailText text-secondary/45">
                                  PNG, JPG, WEBP or GIF • Max 5MB
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-[1vw] sm:pt-[0.4vw]">
                            <label className="block extraSmallTextBold text-secondary/70 lowercase mb-[1.5vw] sm:mb-[0.6vw]">
                              curated profile color palette
                            </label>
                            <div className="flex items-center justify-between p-[2.5vw] sm:p-[1vw] rounded-[0.4vw] border border-secondary/15 bg-secondary/[0.02]">
                              <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
                                <span
                                  className="w-[3.5vw] h-[3.5vw] sm:w-[1vw] sm:h-[1vw] rounded-[0.2vw] drop-shadow transition-colors duration-500"
                                  style={{ backgroundColor: activePalette.accent }}
                                />
                                <span className="extraSmallText text-secondary/70">
                                  Active theme:{" "}
                                  <strong className="text-secondary font-medium">
                                    {activePalette.label}
                                  </strong>
                                </span>
                              </div>
                              <PaletteSelector
                                selectedTheme={themeKey}
                                onSelect={(key) => setThemeKey(key)}
                              />
                            </div>
                          </div>

                          {statusMessage && (
                            <div className="p-[2vw] sm:p-[0.8vw] rounded-[0.35vw] border border-secondary/15 bg-secondary/[0.04] extraSmallText text-secondary">
                              {statusMessage}
                            </div>
                          )}

                          <div className="pt-[1.5vw] sm:pt-[0.6vw] flex justify-end">
                            <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                              <button
                                type="submit"
                                disabled={saving}
                                className="main-btn smallText text-secondary disabled:opacity-50 cursor-pointer transition-colors duration-500"
                                style={{ backgroundColor: activePalette.accent }}
                              >
                                <span className="main-btn__icon" aria-hidden="true" />
                                <span className="main-btn__label">
                                  <span className="main-btn__clip">
                                    <span className="main-btn__from">{saveLabel}</span>
                                    <span className="main-btn__to" aria-hidden="true">
                                      {saveLabel}
                                    </span>
                                  </span>
                                </span>
                              </button>
                            </div>
                          </div>
                        </form>
                      </section>

                      {/* 2. Muted Listeners Section */}
                      <section className="bg-primary border border-secondary/15 rounded-[0.5vw] drop-shadow-soft p-[3.5vw] sm:p-[2vw] mb-[3vw] sm:mb-[2vw]">
                        <div className="mb-[2.5vw] sm:mb-[1.2vw]">
                          <h2 className="mediumText lowercase mb-[0.5vw] sm:mb-[0.25vw]">
                            muted listeners
                          </h2>
                          <p className="extraSmallText text-secondary/50">
                            posts and replies from muted listeners are hidden from your feeds.
                          </p>
                        </div>

                        {mutedUsers.length === 0 ? (
                          <div className="p-[3vw] sm:p-[1.2vw] rounded-[0.4vw] border border-secondary/10 bg-secondary/[0.02] extraSmallText text-secondary/45">
                            You have not muted any listeners.
                          </div>
                        ) : (
                          <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-[0.4vw] overflow-hidden bg-primary">
                            {mutedUsers.map((m) => (
                              <div
                                key={m.id}
                                className="p-[2.5vw] sm:p-[1vw] flex items-center justify-between hover:bg-secondary/[0.02] transition-colors"
                              >
                                <Link
                                  href={`/@${m.username}`}
                                  className="flex items-center gap-[1.5vw] sm:gap-[0.6vw] group"
                                >
                                  <span className="smallText font-medium text-secondary group-hover:underline">
                                    {m.displayName}
                                  </span>
                                  <span className="extraSmallText text-secondary/50">
                                    @{m.username}
                                  </span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleUnmute(m.id)}
                                  className="px-[2.5vw] py-[0.8vw] sm:px-[0.9vw] sm:py-[0.35vw] rounded-[0.3vw] extraSmallText text-secondary border border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-colors cursor-pointer"
                                >
                                  Unmute
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      {/* 3. Blocked Listeners Section */}
                      <section className="bg-primary border border-secondary/15 rounded-[0.5vw] drop-shadow-soft p-[3.5vw] sm:p-[2vw] mb-[3vw] sm:mb-[2vw]">
                        <div className="mb-[2.5vw] sm:mb-[1.2vw]">
                          <h2 className="mediumText lowercase mb-[0.5vw] sm:mb-[0.25vw]">
                            blocked listeners
                          </h2>
                          <p className="extraSmallText text-secondary/50">
                            blocked listeners cannot view your profile, follow you, or interact with your posts.
                          </p>
                        </div>

                        {blockedUsers.length === 0 ? (
                          <div className="p-[3vw] sm:p-[1.2vw] rounded-[0.4vw] border border-secondary/10 bg-secondary/[0.02] extraSmallText text-secondary/45">
                            You have not blocked any listeners.
                          </div>
                        ) : (
                          <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-[0.4vw] overflow-hidden bg-primary">
                            {blockedUsers.map((b) => (
                              <div
                                key={b.id}
                                className="p-[2.5vw] sm:p-[1vw] flex items-center justify-between hover:bg-secondary/[0.02] transition-colors"
                              >
                                <Link
                                  href={`/@${b.username}`}
                                  className="flex items-center gap-[1.5vw] sm:gap-[0.6vw] group"
                                >
                                  <span className="smallText font-medium text-secondary group-hover:underline">
                                    {b.displayName}
                                  </span>
                                  <span className="extraSmallText text-secondary/50">
                                    @{b.username}
                                  </span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleUnblock(b.id)}
                                  className="px-[2.5vw] py-[0.8vw] sm:px-[0.9vw] sm:py-[0.35vw] rounded-[0.3vw] extraSmallText text-secondary border border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-colors cursor-pointer"
                                >
                                  Unblock
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      {/* 4. Danger Zone */}
                      <section className="bg-primary border border-red-600/30 rounded-[0.5vw] drop-shadow-soft p-[3.5vw] sm:p-[2vw] mb-[3vw] sm:mb-[2vw]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[3vw] sm:gap-[1.5vw]">
                          <div>
                            <h2 className="mediumText lowercase text-red-600 mb-[0.5vw] sm:mb-[0.25vw]">
                              danger zone
                            </h2>
                            <p className="extraSmallText text-secondary/60">
                              permanently delete your account and all associated data.
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={deletingAccount}
                            onClick={handleDeleteAccount}
                            className="px-[3vw] py-[1.5vw] sm:px-[1.2vw] sm:py-[0.55vw] rounded-[0.3vw] smallText text-primary bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer drop-shadow w-fit flex-shrink-0"
                          >
                            {deletingAccount ? "Deleting..." : "Delete account"}
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </section>

                {/* Editorial Dark Footer (matching Home, Profile & Feed) */}
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
                        href="/feed"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                      >
                        community feed
                      </Link>
                      <Link
                        href={`/@${user.username}`}
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                      >
                        @{user.username}
                      </Link>
                    </div>
                  </div>

                  {/* Back to top button */}
                  <div className="col-span-full sm:col-span-4 flex items-center justify-center mb-[8vw] sm:mb-0">
                    <button
                      type="button"
                      onClick={() => scrollTo("#settings-top")}
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
                      <span className="opacity-40">@{user.username}</span>
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
