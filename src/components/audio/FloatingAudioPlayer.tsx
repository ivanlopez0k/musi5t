"use client";

import React from "react";
import { useAudioPlayer } from "@/lib/audio/AudioPlayerContext";

export function FloatingAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    pause,
    resume,
    stop,
  } = useAudioPlayer();

  if (!currentTrack) {
    return null;
  }

  const remainingSeconds = Math.max(0, Math.floor(25 - currentTime));
  const progressPercent = Math.min(100, Math.max(0, (currentTime / 25) * 100));

  const handleTogglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <div
      role="region"
      aria-label="Audio preview player"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md bg-secondary text-primary rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-3 backdrop-blur-md border border-primary/10 select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {/* Vinyl / Cover Thumbnail */}
      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-primary/20 bg-primary/10 flex items-center justify-center">
        {currentTrack.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes("vinyl_player.webp")) {
                target.src = "/images/musi5t/vinyl_player.webp";
              }
            }}
            className={`w-full h-full object-cover rounded-full ${
              isPlaying ? "animate-spin" : ""
            }`}
            style={{ animationDuration: "6s" }}
          />
        ) : (
          <div
            className={`w-full h-full rounded-full bg-secondary flex items-center justify-center ${
              isPlaying ? "animate-spin" : ""
            }`}
            style={{ animationDuration: "6s" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-yellow" />
          </div>
        )}
        {/* Tiny vinyl center spindle hole */}
        <div className="absolute w-2 h-2 rounded-full bg-secondary border border-primary/30 z-10 pointer-events-none" />
      </div>

      {/* Track Title & Artist */}
      <div className="flex flex-col min-w-0 pr-1 max-w-[120px] sm:max-w-[180px]">
        <span className="smallText font-medium text-primary truncate leading-tight">
          {currentTrack.title}
        </span>
        <span className="extraSmallText text-primary/60 truncate leading-tight mt-[1px]">
          {currentTrack.artistName}
        </span>
      </div>

      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={isLoading}
        aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
        className="w-7 h-7 rounded-full bg-primary text-secondary flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        {isLoading ? (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* 25s Progress Countdown & Bar */}
      <div className="flex flex-col items-end shrink-0 gap-1">
        <span className="extraSmallText text-primary/80 font-mono text-[11px] leading-none">
          0:{String(remainingSeconds).padStart(2, "0")}
        </span>
        <div className="w-10 sm:w-12 h-1 bg-primary/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-150 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={stop}
        aria-label="Close audio player"
        className="text-primary/50 hover:text-primary transition-colors p-1 rounded-full shrink-0 cursor-pointer ml-0.5"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
