"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AlbumFollowButtonProps {
  albumId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
}

export function AlbumFollowButton({
  albumId,
  initialFollowing,
  isLoggedIn,
}: AlbumFollowButtonProps) {
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
      const res = await fetch(`/api/v1/albums/${albumId}/follow`, { method });
      if (res.ok) {
        setFollowing(!following);
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle follow album failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "..."
    : following
      ? "✓ Following album"
      : "+ Follow album";

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
