"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaletteSelector, PROFILE_PALETTES } from "./PaletteSelector";
import { AlbumSearchModal } from "./AlbumSearchModal";
import { SongSearchModal } from "./SongSearchModal";

export interface ProfileUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  themeKey: string;
  createdAt: Date;
}

export interface TopAlbumItem {
  id: string;
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

import { UserFollowButton } from "./UserFollowButton";

interface ProfileViewProps {
  user: ProfileUser;
  isOwner: boolean;
  isFollowing?: boolean;
  isLoggedIn?: boolean;
  topAlbums: TopAlbumItem[];
  topSongs: TopSongItem[];
}

export function ProfileView({
  user,
  isOwner,
  isFollowing = false,
  isLoggedIn = false,
  topAlbums: initialAlbums,
  topSongs: initialSongs,
}: ProfileViewProps) {
  const router = useRouter();
  const [currentThemeKey, setCurrentThemeKey] = useState(user.themeKey || "lima");
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Modals state
  const [albumModalPos, setAlbumModalPos] = useState<number | null>(null);
  const [songModalPos, setSongModalPos] = useState<number | null>(null);

  // Active palette
  const activePalette =
    PROFILE_PALETTES.find((p) => p.key === currentThemeKey) || PROFILE_PALETTES[0];

  const handlePaletteChange = async (newKey: string) => {
    setCurrentThemeKey(newKey);
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

  return (
    <div
      className="min-h-screen transition-colors duration-500 ease-in-out font-sans"
      style={{
        backgroundColor: activePalette.bg,
        color: activePalette.text,
      }}
    >
      {/* Profile Header Navigation */}
      <header className="w-full border-b border-black/10 backdrop-blur-md sticky top-0 z-30 bg-inherit/90">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-medium tracking-tight text-sm hover:opacity-75 transition-opacity"
          >
            <span
              className="w-3 h-3 rounded-[3px] transition-transform duration-300 hover:rotate-45"
              style={{ backgroundColor: activePalette.accent }}
            />
            <span>musi5t</span>
          </Link>

          <div className="flex items-center gap-3">
            {isOwner ? (
              <>
                <PaletteSelector
                  selectedTheme={currentThemeKey}
                  onSelect={handlePaletteChange}
                />
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs uppercase tracking-wider font-mono border border-black/15 hover:border-black/40 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-xs uppercase tracking-wider font-mono text-black/50 hover:text-black transition-colors cursor-pointer"
                >
                  {isLoggingOut ? "..." : "Logout"}
                </button>
              </>
            ) : (
              <UserFollowButton
                targetUserId={user.id}
                initialFollowing={Boolean(isFollowing)}
                isLoggedIn={Boolean(isLoggedIn)}
                accentColor={activePalette.accent}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* User Identity Banner */}
        <section className="mb-14 pb-10 border-b border-black/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Avatar circle */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-bold text-2xl sm:text-3xl text-black shadow-inner flex-shrink-0"
                style={{ backgroundColor: activePalette.accent }}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-normal tracking-tight">
                    {displayName}
                  </h1>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs opacity-60 mb-3">
                  <span>@{user.username}</span>
                  <span>•</span>
                  <span>
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm sm:text-base max-w-xl opacity-80 leading-relaxed font-light">
                  {bio ||
                    (isOwner
                      ? "No bio yet. Click 'Edit Profile' to write something about your taste."
                      : "No bio provided.")}
                </p>
              </div>
            </div>

            {/* Quick taste stats badge */}
            <div className="flex items-center gap-3 font-mono text-xs opacity-75">
              <div className="border border-black/10 rounded-lg px-3 py-2 bg-black/5">
                <span className="block text-base font-bold">{initialAlbums.length}/5</span>
                <span className="opacity-60 text-[10px] uppercase">Top Albums</span>
              </div>
              <div className="border border-black/10 rounded-lg px-3 py-2 bg-black/5">
                <span className="block text-base font-bold">{initialSongs.length}/5</span>
                <span className="opacity-60 text-[10px] uppercase">Top Songs</span>
              </div>
            </div>
          </div>

          {/* Inline Edit Form */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-8 pt-6 border-t border-black/10 max-w-lg space-y-4"
            >
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/60 border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  Bio (max 250 characters)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={250}
                  className="w-full bg-white/60 border border-black/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold text-black shadow-sm transition-transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: activePalette.accent }}
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-xs font-mono opacity-60 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            </form>
          )}
        </section>

        {/* TOP 5 ALBUMS SECTION */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activePalette.accent }}
              />
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
                TOP 5 ALBUMS
              </h2>
            </div>
            <span className="text-xs font-mono opacity-50 uppercase tracking-widest">
              [ curated records ]
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5].map((pos) => {
              const album = initialAlbums.find((a) => a.position === pos);

              if (album) {
                return (
                  <div
                    key={pos}
                    className="group relative flex flex-col transition-transform duration-300 hover:-translate-y-1.5"
                  >
                    {/* Record Artwork Box */}
                    <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg border border-black/10 bg-black/5 mb-3">
                      {/* Position pill */}
                      <span
                        className="absolute top-2.5 left-2.5 z-10 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md text-black shadow-sm"
                        style={{ backgroundColor: activePalette.accent }}
                      >
                        0{pos}
                      </span>

                      {/* Cover image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Owner hover actions */}
                      {isOwner && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => setAlbumModalPos(pos)}
                            className="px-3 py-1 rounded-md text-[11px] font-mono font-medium bg-white text-black hover:scale-105 transition-transform cursor-pointer shadow"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAlbum(pos)}
                            className="px-3 py-1 rounded-md text-[11px] font-mono font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Album metadata */}
                    <div className="px-0.5">
                      <h3 className="font-medium text-sm truncate" title={album.title}>
                        {album.title}
                      </h3>
                      <p
                        className="text-xs opacity-70 truncate font-light"
                        title={album.artistName}
                      >
                        {album.artistName}{" "}
                        {album.releaseYear ? `• ${album.releaseYear}` : ""}
                      </p>
                    </div>
                  </div>
                );
              }

              // Empty slot
              return (
                <div
                  key={pos}
                  onClick={() => isOwner && setAlbumModalPos(pos)}
                  className={`aspect-square rounded-xl border border-dashed border-black/20 flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ${
                    isOwner
                      ? "hover:border-black/50 hover:bg-black/[0.04] cursor-pointer"
                      : "opacity-40"
                  }`}
                >
                  <span className="font-mono text-xs opacity-40 mb-1">0{pos}</span>
                  <span className="text-xs opacity-60 font-medium">
                    {isOwner ? "+ Add Album" : "Empty Slot"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* TOP 5 SONGS SECTION */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activePalette.accent }}
              />
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
                TOP 5 TRACKS
              </h2>
            </div>
            <span className="text-xs font-mono opacity-50 uppercase tracking-widest">
              [ essential tracks ]
            </span>
          </div>

          <div className="border border-black/10 rounded-2xl divide-y divide-black/10 overflow-hidden bg-black/[0.02]">
            {[1, 2, 3, 4, 5].map((pos) => {
              const song = initialSongs.find((s) => s.position === pos);

              if (song) {
                return (
                  <div
                    key={pos}
                    className="group flex items-center justify-between px-6 py-4 hover:bg-black/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold text-black"
                        style={{ backgroundColor: activePalette.accent }}
                      >
                        0{pos}
                      </span>
                      {song.coverUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-9 h-9 rounded object-cover shadow-sm hidden sm:block"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{song.title}</h4>
                        <p className="text-xs opacity-70">{song.artistName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isOwner && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSongModalPos(pos)}
                            className="text-xs font-mono px-2.5 py-1 rounded bg-black/10 hover:bg-black/20 transition-colors"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSong(pos)}
                            className="text-xs font-mono px-2 py-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <span className="text-xs font-mono opacity-40">TRACK</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={pos}
                  onClick={() => isOwner && setSongModalPos(pos)}
                  className={`flex items-center justify-between px-6 py-4 transition-colors ${
                    isOwner
                      ? "hover:bg-black/[0.03] cursor-pointer opacity-60 hover:opacity-100"
                      : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs w-7 text-center">0{pos}</span>
                    <span className="text-xs font-light">
                      {isOwner ? "+ Add track to position" : "Empty slot"}
                    </span>
                  </div>
                  <span className="text-xs font-mono opacity-40">—</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Album Search & Edition Modal */}
      {albumModalPos && (
        <AlbumSearchModal
          isOpen={true}
          position={albumModalPos}
          onClose={() => setAlbumModalPos(null)}
          onSelectAlbum={handleSelectAlbum}
          accentColor={activePalette.accent}
        />
      )}

      {/* Song Search Modal */}
      {songModalPos && (
        <SongSearchModal
          isOpen={true}
          position={songModalPos}
          onClose={() => setSongModalPos(null)}
          onSelectSong={handleSelectSong}
          accentColor={activePalette.accent}
        />
      )}
    </div>
  );
}
