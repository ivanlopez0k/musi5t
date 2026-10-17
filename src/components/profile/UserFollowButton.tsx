"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface UserFollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
  accentColor: string;
}

export function UserFollowButton({
  targetUserId,
  initialFollowing,
  isLoggedIn,
  accentColor,
}: UserFollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const method = following ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/v1/users/${targetUserId}/follow`, { method });
      if (res.ok) {
        setFollowing(!following);
        router.refresh();
      }
    } catch (err) {
      console.error("Toggle follow user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "..."
    : following
      ? "✓ Following"
      : "+ Follow";

  return (
    <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] w-fit">
      <button
        type="button"
        disabled={loading}
        onClick={handleToggle}
        className={`main-btn smallText cursor-pointer transition-colors duration-300 ${
          following ? "!bg-secondary !text-primary" : "text-secondary"
        }`}
        style={!following ? { backgroundColor: accentColor } : undefined}
      >
        <span
          className="main-btn__icon"
          style={following ? { backgroundColor: accentColor } : undefined}
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
