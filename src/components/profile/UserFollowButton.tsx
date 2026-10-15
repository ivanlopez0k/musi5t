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

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggle}
      className={`text-xs uppercase tracking-wider font-mono px-4 py-1.5 rounded-full text-black font-medium transition-transform duration-300 hover:scale-105 cursor-pointer shadow-sm ${
        following ? "bg-black/15 text-black border border-black/20" : ""
      }`}
      style={!following ? { backgroundColor: accentColor } : undefined}
    >
      {loading ? "..." : following ? "✓ Following" : "+ Follow"}
    </button>
  );
}
