"use client";

import { useEffect, useState } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: "1",
    title: "15 Step",
    artist: "Radiohead",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/2/2e/In_Rainbows_official_cover.png",
    duration: "3:57",
  },
  {
    id: "2",
    title: "Nights",
    artist: "Frank Ocean",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg",
    duration: "5:07",
  },
  {
    id: "3",
    title: "Come Together",
    artist: "The Beatles",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
    duration: "4:19",
  },
  {
    id: "4",
    title: "Let It Happen",
    artist: "Tame Impala",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png",
    duration: "7:48",
  },
  {
    id: "5",
    title: "One More Time",
    artist: "Daft Punk",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/ae/Daft_Punk_-_Discovery.jpg",
    duration: "5:20",
  },
];

interface SidePlayerProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function SidePlayer({ isOpen, onClose }: SidePlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(32); // percentage

  const currentTrack = SAMPLE_TRACKS[currentTrackIndex];

  // Keyboard shortcut listener ('m' to toggle, 'esc' to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <aside
      aria-label="Side music player"
      className="fixed top-0 right-0 h-screen w-full sm:w-[380px] lg:w-[25vw] bg-[#EFEFEF] border-l border-black/10 z-0 flex flex-col justify-between p-6 sm:p-8 select-none overflow-y-auto"
    >
      {/* Top Header: 'esc' to close */}
      <div className="flex items-center justify-between pb-6 border-b border-black/5">
        <span className="text-[10px] uppercase tracking-widest text-[#0E0E0E]/40 font-mono">
          side player
        </span>
        <button
          onClick={onClose}
          className="text-xs tracking-tight text-[#0E0E0E]/50 hover:text-[#0E0E0E] transition-colors cursor-pointer"
        >
          &apos;esc&apos; to close
        </button>
      </div>

      {/* Now Playing Section */}
      <div className="py-6 flex flex-col gap-5">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md bg-black/5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate lowercase">
              {currentTrack.title}
            </span>
            <span className="text-xs text-[#0E0E0E]/50 truncate lowercase">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-[#0E0E0E]/40">
            <span>1:14</span>
            <span>{currentTrack.duration}</span>
          </div>
          <div
            className="w-full h-1 bg-black/10 rounded-full cursor-pointer relative overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              setProgress(Math.round(clickPos * 100));
            }}
          >
            <div
              className="h-full bg-[#FFE600] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 py-2">
          <button
            onClick={() =>
              setCurrentTrackIndex((prev) =>
                prev === 0 ? SAMPLE_TRACKS.length - 1 : prev - 1
              )
            }
            className="opacity-60 hover:opacity-100 transition-opacity p-2"
            title="Previous track"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="w-10 h-10 rounded-full bg-[#0E0E0E] text-[#F7F7F7] flex items-center justify-center hover:scale-105 transition-transform"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() =>
              setCurrentTrackIndex((prev) =>
                prev === SAMPLE_TRACKS.length - 1 ? 0 : prev + 1
              )
            }
            className="opacity-60 hover:opacity-100 transition-opacity p-2"
            title="Next track"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Track List Queue */}
      <div className="flex-1 overflow-y-auto pt-4 border-t border-black/5">
        <span className="text-[10px] uppercase tracking-wider text-[#0E0E0E]/40 font-mono block mb-3">
          queue
        </span>
        <div className="flex flex-col gap-2">
          {SAMPLE_TRACKS.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => setCurrentTrackIndex(idx)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                idx === currentTrackIndex
                  ? "bg-[#FFE600] text-[#0E0E0E]"
                  : "hover:bg-black/5 text-[#0E0E0E]/80"
              }`}
            >
              <div className="w-8 h-8 rounded-md overflow-hidden bg-black/10 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium truncate lowercase leading-tight">
                  {track.title}
                </span>
                <span className="text-[11px] opacity-60 truncate lowercase">
                  {track.artist}
                </span>
              </div>
              <span className="text-[10px] font-mono opacity-50">{track.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer attribution */}
      <div className="pt-4 border-t border-black/5 text-[10px] text-[#0E0E0E]/40 lowercase">
        press <kbd className="px-1 py-0.5 rounded bg-black/10 font-mono text-[9px]">m</kbd> anytime to toggle
      </div>
    </aside>
  );
}
