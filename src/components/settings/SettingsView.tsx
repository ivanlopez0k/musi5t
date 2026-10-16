"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [mutedUsers, setMutedUsers] = useState<ModeratedUserItem[]>(initialMutedUsers);
  const [blockedUsers, setBlockedUsers] = useState<ModeratedUserItem[]>(initialBlockedUsers);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const activePalette =
    PROFILE_PALETTES.find((p) => p.key === themeKey) || PROFILE_PALETTES[0];

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

  return (
    <div className="min-h-screen bg-[#11110F] text-[#E6E5DF] font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-30 bg-[#11110F]/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-medium tracking-tight text-sm hover:opacity-80 transition-opacity"
          >
            <span className="w-3 h-3 rounded-[2px] bg-[#FFE600]" />
            <span>musi5t</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/feed"
              className="text-xs font-mono opacity-70 hover:opacity-100 transition-opacity"
            >
              Feed
            </Link>
            <Link
              href={`/@${user.username}`}
              className="flex items-center gap-2 text-xs font-mono opacity-80 hover:opacity-100 transition-opacity border border-white/15 rounded-full px-3 py-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activePalette.accent }}
              />
              <span>@{user.username}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#FFE600]">
            [ Account & Preferences ]
          </span>
          <h1 className="text-3xl font-light tracking-tight mt-1">Settings</h1>
        </div>

        {/* Profile & Palette Settings */}
        <section className="border border-white/10 bg-[#161614] rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Profile & Theme</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                Username & Email
              </label>
              <p className="text-xs font-mono text-white/50">
                @{user.username} • {user.email}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                maxLength={60}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FFE600]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                Bio (max 250 characters)
              </label>
              <textarea
                rows={3}
                value={bio}
                maxLength={250}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FFE600] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                Avatar Image URL (optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#FFE600]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-2">
                Profile Color Palette
              </label>
              <PaletteSelector
                selectedTheme={themeKey}
                onSelect={(key) => setThemeKey(key)}
              />
            </div>

            {statusMessage && (
              <p className="text-xs font-mono text-[#FFE600]">{statusMessage}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg text-xs font-mono uppercase font-bold bg-[#FFE600] text-black hover:bg-[#F2DA00] transition-transform hover:scale-105 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>

        {/* Muted Users */}
        <section className="border border-white/10 bg-[#161614] rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-1">Muted Listeners</h2>
          <p className="text-xs text-white/50 mb-4">
            Posts and replies from muted listeners are hidden from your feeds.
          </p>

          {mutedUsers.length === 0 ? (
            <p className="text-xs font-mono opacity-40 py-2">
              You have not muted any users.
            </p>
          ) : (
            <div className="divide-y divide-white/10">
              {mutedUsers.map((m) => (
                <div
                  key={m.id}
                  className="py-3 flex items-center justify-between"
                >
                  <Link
                    href={`/@${m.username}`}
                    className="text-sm font-medium hover:text-[#FFE600] transition-colors"
                  >
                    {m.displayName}{" "}
                    <span className="text-xs font-mono opacity-50">
                      @{m.username}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleUnmute(m.id)}
                    className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 hover:border-white/50 cursor-pointer"
                  >
                    Unmute
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Blocked Users */}
        <section className="border border-white/10 bg-[#161614] rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-1">Blocked Listeners</h2>
          <p className="text-xs text-white/50 mb-4">
            Blocked listeners cannot view your profile, follow you, or interact with your posts.
          </p>

          {blockedUsers.length === 0 ? (
            <p className="text-xs font-mono opacity-40 py-2">
              You have not blocked any users.
            </p>
          ) : (
            <div className="divide-y divide-white/10">
              {blockedUsers.map((b) => (
                <div
                  key={b.id}
                  className="py-3 flex items-center justify-between"
                >
                  <Link
                    href={`/@${b.username}`}
                    className="text-sm font-medium hover:text-[#FFE600] transition-colors"
                  >
                    {b.displayName}{" "}
                    <span className="text-xs font-mono opacity-50">
                      @{b.username}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleUnblock(b.id)}
                    className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 hover:border-white/50 cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danger Zone (RNF-09 Account Deletion) */}
        <section className="border border-red-500/30 bg-red-950/15 rounded-2xl p-6">
          <h2 className="text-lg font-medium text-red-400 mb-1">Danger Zone</h2>
          <p className="text-xs text-white/60 mb-4">
            Permanently delete your account and all associated data (Top 5 albums, Top 5 songs, posts, replies, and ratings).
          </p>
          <button
            type="button"
            disabled={deletingAccount}
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-lg text-xs font-mono uppercase font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            {deletingAccount ? "Deleting Account..." : "Delete Account"}
          </button>
        </section>
      </main>
    </div>
  );
}
