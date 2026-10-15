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

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggleFollow}
      className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-300 cursor-pointer shadow-sm ${
        following
          ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
          : "bg-[#FFE600] text-black hover:bg-[#F2DA00] hover:scale-105"
      }`}
    >
      {loading ? "..." : following ? "✓ Following Album" : "+ Follow Album"}
    </button>
  );
}
