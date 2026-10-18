"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ArtistFollowButtonProps {
  artistName: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
  onFollowChange?: (following: boolean, count: number) => void;
}

export function ArtistFollowButton({
  artistName,
  initialFollowing,
  isLoggedIn,
  onFollowChange,
}: ArtistFollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const method = following ? "DELETE" : "POST";
    try {
      const res = await fetch(
        `/api/v1/artists/${encodeURIComponent(artistName)}/follow`,
        { method }
      );
      if (res.ok) {
        const data = await res.json();
        const nextFollowing = !following;
        setFollowing(nextFollowing);
        if (onFollowChange && typeof data.followersCount === "number") {
          onFollowChange(nextFollowing, data.followersCount);
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle follow artist failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "..."
    : following
      ? "✓ Following Artist"
      : "+ Follow Artist";

  return (
    <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit">
      <button
        type="button"
        disabled={loading}
        onClick={handleToggleFollow}
        className={`main-btn smallText cursor-pointer transition-colors duration-300 ${
          following
            ? "!bg-secondary !text-primary"
            : "text-secondary"
        }`}
      >
        <span
          className={`main-btn__icon ${following ? "!bg-yellow" : ""}`}
          aria-hidden="true"
        />
        <span className="main-btn__label">
          <span className="main-btn__clip">
            <span className="main-btn__from">{label}</span>
            <span className="main-btn__to" aria-hidden="true">
              {label}
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
