"use client";

import { useEffect, useRef, useState } from "react";

export interface Track {
  title: string;
  author: string;
  cover: string;
  audioUrl?: string;
  duration?: string;
}

export const TRACKS: Track[] = [
  {
    title: "93 'Til Infinity",
    author: "Souls of Mischief",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music/22/6e/b6/mzi.xyhsjlep.jpg/600x600bb.jpg",
    duration: "4:46",
  },
  {
    title: "Purple",
    author: "Wunderhorse",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7b/7b/4a/7b7b4a32-f2ff-fdb1-cb05-7f7332c812cc/cover.jpg/600x600bb.jpg",
    duration: "3:42",
  },
  {
    title: "Stonecutters",
    author: "Dope Lemon",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/55/73/dd55738b-8df2-44cf-e6e0-59c49b4acea7/4050538506631.jpg/600x600bb.jpg",
    duration: "3:18",
  },
  {
    title: "Do You",
    author: "Ghostwoman",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/bf/2c/55bf2cb5-be73-772d-38c5-4c5c713f67b6/5060626464315_cover.jpg/600x600bb.jpg",
    duration: "2:54",
  },
  {
    title: "Easy Way Out",
    author: "Broncho",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d1/64/20/d1642078-a808-9502-0263-fe618e319da5/3615933818133_cover.jpg/600x600bb.jpg",
    duration: "3:01",
  },
  {
    title: "The End of a Gun",
    author: "Ghostwoman",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cb/ef/c1/cbefc198-984d-5d2b-4ff2-344ca522d5fd/5060626466333_cover.jpg/600x600bb.jpg",
    duration: "3:12",
  },
  {
    title: "Geneva Strangemod",
    author: "Glyders",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/78/70/93/787093d2-3e80-81ff-76d9-1c224eb2b5d0/781484310228.png/600x600bb.jpg",
    duration: "4:05",
  },
  {
    title: "I Can Talk",
    author: "Two Door Cinema Club",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/f0/89/c7/f089c71b-9e94-522f-c1cf-f9f3d766daa2/5414939448577_cover.jpg/600x600bb.jpg",
    duration: "2:57",
  },
  {
    title: "Leader of the Pack",
    author: "Wunderhorse",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7b/7b/4a/7b7b4a32-f2ff-fdb1-cb05-7f7332c812cc/cover.jpg/600x600bb.jpg",
    duration: "3:24",
  },
  {
    title: "Lost My Mind",
    author: "Froth",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/88/a3/e2/88a3e291-f742-bdbb-9ec2-05a912e7ba97/859742233067_cover.jpg/600x600bb.jpg",
    duration: "3:50",
  },
  {
    title: "Marinade",
    author: "Dope Lemon",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/55/73/dd55738b-8df2-44cf-e6e0-59c49b4acea7/4050538506631.jpg/600x600bb.jpg",
    duration: "3:48",
  },
];

interface SidePlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidePlayer({ isOpen, onClose }: SidePlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeTrack = TRACKS[activeIndex];

  // Esc key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Simulated progress timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TRACKS.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TRACKS.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  return (
    <section
      className="side-panel mediaplayer-grid z-50 select-none"
      aria-label="Side player"
      style={{
        display: "grid",
        gridTemplateRows: "auto auto auto minmax(0, 1fr)",
      }}
    >
      {/* Top Close bar */}
      <div className="col-span-full h-fit mt-[1vw] mb-[2vw] flex justify-between extraSmallText">
        <div className="flex items-center gap-[0.25vw]">
          <span className="w-[0.6vw] h-[0.6vw] rounded-full bg-yellow inline-block animate-pulse" />
          <span className="text-secondary/60 text-[0.9vw]">musi5t player</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-hover cursor-pointer w-fit text-secondary/40 hover:text-secondary duration-300 text-[0.9vw]"
        >
          &apos;esc&apos; to close
        </button>
      </div>

      {/* Now Playing Artwork + Info */}
      <div className="now-playing col-span-full h-fit mb-[1.5vw]">
        <div className="now-playing-track flex items-center">
          <div className="w-[35%] aspect-square bg-secondary rounded-[0.8vw] overflow-hidden shadow-md shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeTrack.cover}
              alt={activeTrack.title}
              className="now-playing-artwork w-full h-full object-cover select-none transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col ml-[1.25vw] smallText overflow-hidden">
            <span className="now-playing-title font-medium truncate text-secondary">
              {activeTrack.title}
            </span>
            <span className="now-playing-author text-secondary/50 truncate text-[1.1vw] mt-[0.2vw]">
              {activeTrack.author}
            </span>
          </div>
        </div>
      </div>

      {/* Player Controls & Timeline */}
      <div className="player-main col-span-full mb-[1.5vw]">
        {/* Timeline Times */}
        <div className="w-full h-fit flex justify-between mb-[0.6vw] text-[0.9vw] text-secondary/50 font-mono">
          <div className="timeline-time">
            <span>
              {Math.floor((progress * 2.2) / 60)}:
              {String(Math.floor((progress * 2.2) % 60)).padStart(2, "0")}
            </span>
          </div>
          <div className="timeline-time timeline-duration">
            <span>{activeTrack.duration || "3:30"}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            setProgress(Math.max(0, Math.min(100, pos * 100)));
          }}
          className="w-full h-[0.35vw] bg-secondary/10 hover:bg-secondary/15 rounded-full cursor-pointer overflow-hidden transition-colors"
        >
          <div
            className="timeline-progress h-full bg-yellow rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-evenly mt-[1.8vw] pb-[1.5vw] border-b border-secondary/10">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous track"
            className="cursor-pointer opacity-70 hover:opacity-100 hover:scale-110 transition-all p-[0.5vw]"
          >
            <svg width="1.3vw" height="1.5vw" viewBox="0 0 22 26" fill="none">
              <rect width="4" height="26" rx="1" fill="currentColor" />
              <path d="M1 13L22 0.875645V25.1244L1 13Z" fill="currentColor" />
            </svg>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause track" : "Play track"}
            className="cursor-pointer opacity-90 hover:opacity-100 hover:scale-110 transition-all p-[0.5vw]"
          >
            {isPlaying ? (
              <svg width="1.5vw" height="2.2vw" viewBox="0 0 24 32" fill="none">
                <rect x="2" width="6" height="32" rx="2" fill="currentColor" />
                <rect x="16" width="6" height="32" rx="2" fill="currentColor" />
              </svg>
            ) : (
              <svg width="1.5vw" height="2.2vw" viewBox="0 0 28 45" fill="none">
                <path d="M3 2.5L25 22.5L3 42.5V2.5Z" fill="currentColor" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next track"
            className="cursor-pointer opacity-70 hover:opacity-100 hover:scale-110 transition-all p-[0.5vw]"
          >
            <svg width="1.3vw" height="1.5vw" viewBox="0 0 22 26" fill="none">
              <path
                d="M22 25C22 25.5523 21.5523 26 21 26H19C18.4477 26 18 25.5523 18 25V1C18 0.447715 18.4477 0 19 0H21C21.5523 0 22 0.447715 22 1V25Z"
                fill="currentColor"
              />
              <path d="M21 13.0001L0 25.1245V0.875732L21 13.0001Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Track List */}
      <div className="track-list flex-1 overflow-y-auto">
        <div className="track-content flex flex-col gap-[0.4vw] pb-[2vw]">
          {TRACKS.map((t, i) => (
            <div
              key={i}
              onClick={() => {
                setActiveIndex(i);
                setProgress(0);
                setIsPlaying(true);
              }}
              className="flex items-center cursor-pointer group"
            >
              <div
                className={`flex items-center w-full p-[0.35vw] text-secondary h-[3.8vw] shrink-0 rounded-[0.3vw] transition-all duration-200 ${
                  i === activeIndex
                    ? "bg-yellow shadow-xs"
                    : "bg-[#EBEBEC] hover:bg-[#E2E2E4]"
                }`}
              >
                <div className="w-[3.1vw] h-[3.1vw] rounded-[0.2vw] aspect-square overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.cover}
                    alt={t.title}
                    className="w-full h-full object-cover select-none"
                  />
                </div>
                <div className="flex flex-col extraSmallText ml-[1vw] gap-[0.2vw] min-w-0 pr-2">
                  <span className="font-medium truncate text-[1vw] leading-tight">
                    {t.title}
                  </span>
                  <span className="opacity-60 truncate text-[0.85vw] leading-tight">
                    {t.author}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
