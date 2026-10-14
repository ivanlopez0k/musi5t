"use client";

import { useEffect, useState } from "react";

// STEP 1: Top 5 Albums Interactive Collage
export function StepCurateCollage() {
  const albums = [
    {
      rank: 1,
      title: "Currents",
      artist: "Tame Impala",
      image: "/images/musi5t/hero_center.webp",
    },
    {
      rank: 2,
      title: "In Rainbows",
      artist: "Radiohead",
      image: "/images/musi5t/feature_top5_1.webp",
    },
    {
      rank: 3,
      title: "GKMC",
      artist: "Kendrick Lamar",
      image: "/images/musi5t/hero_left.webp",
    },
    {
      rank: 4,
      title: "RAM",
      artist: "Daft Punk",
      image: "/images/musi5t/hero_right.webp",
    },
    {
      rank: 5,
      title: "Rumours",
      artist: "Fleetwood Mac",
      image: "/images/musi5t/feature_feed_1.webp",
    },
  ];

  return (
    <div className="w-full aspect-[16/10] bg-[#141412] rounded-[0.5vw] p-[1.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/5 drop-shadow-soft relative overflow-hidden select-none group">
      {/* Header bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-[0.6vw]">
          <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-yellow" />
          <span className="detailText font-mono text-primary/70">
            @mateo&apos;s Top 5
          </span>
        </div>
        <span className="detailText text-primary/40 font-mono">
          edition: 1st vinyl press
        </span>
      </div>

      {/* 5 Stacked Album Covers Fan/Grid */}
      <div className="grid grid-cols-5 gap-[0.8vw] my-auto items-center z-10 pt-[0.5vw]">
        {albums.map((album, idx) => (
          <div
            key={album.rank}
            className="flex flex-col items-center group/card transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <div className="relative aspect-square w-full rounded-[0.3vw] overflow-hidden drop-shadow border border-white/10 bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.image}
                alt={album.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105 select-none"
              />
              <span className="absolute top-[0.3vw] left-[0.3vw] bg-black/80 text-yellow text-[0.65vw] px-[0.3vw] py-[0.1vw] rounded-[0.15vw] font-mono font-bold">
                0{album.rank}
              </span>
            </div>
            <div className="mt-[0.5vw] text-center w-full overflow-hidden">
              <span className="detailText font-medium text-primary block truncate">
                {album.title}
              </span>
              <span className="detailText text-primary/50 text-[0.65vw] block truncate">
                {album.artist}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="flex justify-between items-center z-10 pt-[0.2vw] border-t border-white/5">
        <span className="detailText text-yellow/80 font-mono text-[0.7vw]">
          ★ Drag &amp; reorder enabled
        </span>
        <span className="detailText text-primary/40 text-[0.7vw]">
          5 / 5 slots filled
        </span>
      </div>
    </div>
  );
}

// STEP 2: Follow & Music Taste Match Animation
export function StepConnectAnimation() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingAlbum, setIsFollowingAlbum] = useState(true);

  // Auto-pulse demonstration every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsFollowing((prev) => !prev);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full aspect-[16/10] bg-[#141412] rounded-[0.5vw] p-[1.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/5 drop-shadow-soft relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-[0.6vw]">
          <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-yellow" />
          <span className="detailText font-mono text-primary/70">
            Taste Match Network
          </span>
        </div>
        <span className="detailText text-yellow font-mono text-[0.7vw]">
          ● Live connection
        </span>
      </div>

      {/* User Match Card */}
      <div className="bg-white/5 rounded-[0.4vw] p-[1vw] flex items-center justify-between border border-white/10 my-auto">
        <div className="flex items-center gap-[1vw]">
          <div className="w-[3.2vw] h-[3.2vw] rounded-full bg-gradient-to-tr from-yellow to-amber-500 flex items-center justify-center font-bold text-secondary text-[1.2vw]">
            J
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-[0.5vw]">
              <span className="smallText font-medium text-primary">
                @julian.wav
              </span>
              <span className="bg-yellow/15 text-yellow text-[0.65vw] px-[0.4vw] py-[0.1vw] rounded-[0.15vw] font-mono">
                94% match
              </span>
            </div>
            <span className="detailText text-primary/50 text-[0.75vw] mt-[0.1vw]">
              Shared in Top 5: Currents &amp; In Rainbows
            </span>
          </div>
        </div>

        {/* Animated Follow Button */}
        <button
          type="button"
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-[1.2vw] py-[0.4vw] rounded-[0.25vw] text-[0.85vw] font-medium transition-all duration-300 cursor-pointer flex items-center gap-[0.3vw] ${
            isFollowing
              ? "bg-yellow text-secondary scale-105 shadow-sm"
              : "bg-white/10 text-primary hover:bg-white/20"
          }`}
        >
          {isFollowing ? (
            <>
              <svg width="0.8vw" height="0.8vw" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Following</span>
            </>
          ) : (
            <span>+ Follow</span>
          )}
        </button>
      </div>

      {/* Album Follow Pill */}
      <div className="bg-white/5 rounded-[0.4vw] px-[1vw] py-[0.6vw] flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-[0.8vw]">
          <div className="w-[1.8vw] h-[1.8vw] rounded-[0.2vw] overflow-hidden bg-secondary shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/musi5t/hero_center.webp"
              alt="Currents"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="detailText font-medium text-primary leading-tight">
              Tame Impala · Currents
            </span>
            <span className="detailText text-primary/40 text-[0.65vw] font-mono">
              1,420 listeners follow this record
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFollowingAlbum(!isFollowingAlbum)}
          className="text-primary/70 hover:text-yellow text-[0.7vw] font-mono cursor-pointer"
        >
          {isFollowingAlbum ? "✓ Tracking record" : "+ Track record"}
        </button>
      </div>
    </div>
  );
}

// STEP 3: Live Post & Liking Animation
export function StepDiscussPost() {
  const [likes, setLikes] = useState(48);
  const [hasLiked, setHasLiked] = useState(false);

  // Auto-pulse like counter to show live engagement
  useEffect(() => {
    const timer = setInterval(() => {
      setHasLiked((prev) => {
        const next = !prev;
        setLikes((l) => (next ? l + 1 : l - 1));
        return next;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleLike = () => {
    setHasLiked((prev) => !prev);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="w-full aspect-[16/10] bg-[#141412] rounded-[0.5vw] p-[1.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/5 drop-shadow-soft relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-[0.6vw]">
          <span className="w-[0.5vw] h-[0.5vw] rounded-full bg-yellow" />
          <span className="detailText font-mono text-primary/70">
            Feed Discussion
          </span>
        </div>
        <span className="detailText text-primary/40 font-mono text-[0.7vw]">
          audience: #Currents
        </span>
      </div>

      {/* Main Post Card */}
      <div className="bg-white/5 rounded-[0.4vw] p-[1.2vw] border border-white/10 my-auto flex flex-col gap-[0.8vw]">
        {/* Post Author Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.8vw]">
            <div className="w-[2.2vw] h-[2.2vw] rounded-full bg-yellow/20 text-yellow flex items-center justify-center font-bold text-[0.9vw]">
              S
            </div>
            <div className="flex flex-col">
              <span className="detailText font-medium text-primary leading-tight">
                @sofia.music
              </span>
              <span className="detailText text-primary/40 text-[0.65vw]">
                12m ago
              </span>
            </div>
          </div>
          <span className="bg-yellow text-secondary font-mono text-[0.65vw] px-[0.4vw] py-[0.1vw] rounded-[0.15vw] font-bold">
            #Currents
          </span>
        </div>

        {/* Post Content */}
        <p className="extraSmallText text-primary/90 leading-snug">
          &ldquo;The synth bassline on &apos;The Less I Know The Better&apos; into &apos;Past Life&apos; is unmatched. Still one of the best A-sides of the decade.&rdquo;
        </p>

        {/* Actions bar (Like & Comments) */}
        <div className="flex items-center gap-[1.5vw] pt-[0.4vw] border-t border-white/5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-[0.35vw] text-[0.8vw] font-mono cursor-pointer transition-all duration-200 ${
              hasLiked ? "text-red-400 font-bold scale-105" : "text-primary/60 hover:text-red-400"
            }`}
          >
            <svg
              width="0.9vw"
              height="0.9vw"
              viewBox="0 0 24 24"
              fill={hasLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{likes}</span>
          </button>

          <div className="flex items-center gap-[0.35vw] text-primary/50 text-[0.8vw] font-mono">
            <svg
              width="0.9vw"
              height="0.9vw"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span>18 replies</span>
          </div>
        </div>
      </div>

      {/* Mini live reply ticker */}
      <div className="flex items-center gap-[0.5vw] text-primary/50 detailText text-[0.7vw] truncate">
        <span className="text-yellow font-bold">@nico:</span>
        <span className="truncate">&ldquo;Agreed, the analog warmth on vinyl hits completely different.&rdquo;</span>
      </div>
    </div>
  );
}
