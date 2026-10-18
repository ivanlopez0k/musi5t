"use client";

import { useEffect, useState } from "react";

// Standard precision simulated OS cursor
function SimulatedCursor({ isClicking }: { isClicking?: boolean }) {
  return (
    <div
      className={`pointer-events-none transition-transform duration-150 ${
        isClicking ? "scale-75" : "scale-100"
      }`}
    >
      <svg
        className="w-[4.2vw] sm:w-[1.4vw] min-w-[14px] h-[4.2vw] sm:h-[1.4vw] min-h-[14px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] filter"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 2L19 13.5L11.5 14.5L8 21.5L5 20.5L8 14.5L4 11V2Z"
          fill="#FFFFFF"
          stroke="#11110F"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// STEP 1: Real Top 5 Curation Flow (Showcase + Modal Search & Selection)
export function StepCurateCollage() {
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 75 });
  const [isClicking, setIsClicking] = useState(false);
  const [isSlot1Filled, setIsSlot1Filled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [typedQuery, setTypedQuery] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const filledAlbums = [
    {
      rank: "02",
      title: "In Rainbows",
      artist: "Radiohead",
      image: "/images/musi5t/feature_top5_1.webp",
    },
    {
      rank: "03",
      title: "GKMC",
      artist: "Kendrick Lamar",
      image: "/images/musi5t/hero_left.webp",
    },
    {
      rank: "04",
      title: "RAM",
      artist: "Daft Punk",
      image: "/images/musi5t/hero_right.webp",
    },
    {
      rank: "05",
      title: "Rumours",
      artist: "Fleetwood Mac",
      image: "/images/musi5t/feature_feed_1.webp",
    },
  ];

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      // 0. Initial state
      setIsSlot1Filled(false);
      setModalOpen(false);
      setTypedQuery("");
      setShowResult(false);
      setIsSaved(false);
      setCursorPos({ x: 80, y: 75 });

      // 1. Move cursor to empty slot 01
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 10, y: 46 });
        }, 500)
      );

      // 2. Click empty slot 01 -> Open Search Modal
      timeouts.push(
        setTimeout(() => {
          setIsClicking(true);
          timeouts.push(setTimeout(() => setIsClicking(false), 180));
          timeouts.push(
            setTimeout(() => {
              setModalOpen(true);
              setCursorPos({ x: 48, y: 38 });
            }, 250)
          );
        }, 1200)
      );

      // 3. Typing query in search input
      timeouts.push(
        setTimeout(() => setTypedQuery("C"), 1650),
        setTimeout(() => setTypedQuery("Cur"), 1800),
        setTimeout(() => setTypedQuery("Curren"), 1950),
        setTimeout(() => {
          setTypedQuery("Currents");
          setShowResult(true);
        }, 2150)
      );

      // 4. Move cursor to "Select" button on Currents result
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 82, y: 65 });
        }, 2600)
      );

      // 5. Click "Select" -> close modal and fill slot 01
      timeouts.push(
        setTimeout(() => {
          setIsClicking(true);
          timeouts.push(setTimeout(() => setIsClicking(false), 180));
          timeouts.push(
            setTimeout(() => {
              setModalOpen(false);
              setIsSlot1Filled(true);
              setIsSaved(true);
              setCursorPos({ x: 86, y: 82 });
            }, 260)
          );
        }, 3300)
      );
    };

    const initTimer = setTimeout(runCycle, 200);
    const interval = setInterval(runCycle, 7200);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full aspect-auto min-h-[240px] sm:aspect-[16/10] bg-[#141412] rounded-[2vw] sm:rounded-[0.5vw] p-[3.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/10 drop-shadow-soft relative overflow-hidden select-none pointer-events-none">
      {/* Simulated Animated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 border-b border-white/5 pb-[1.5vw] sm:pb-[0.6vw]">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
          <span className="w-[2vw] h-[2vw] sm:w-[0.55vw] sm:h-[0.55vw] rounded-full bg-yellow" />
          <span className="font-mono text-primary/80 text-[2.8vw] sm:text-[0.75vw]">
            @mateo · profile / curate top 5
          </span>
        </div>
        <span className="text-yellow font-mono text-[2.6vw] sm:text-[0.7vw] font-medium">
          {isSaved ? "✓ 5 / 5 curated" : "4 / 5 curated"}
        </span>
      </div>

      {/* 5 Album Slots Showcase */}
      <div className="grid grid-cols-5 gap-[1.8vw] sm:gap-[0.8vw] my-auto items-center z-10 pt-[0.8vw]">
        {/* Slot 01: Either Empty or Filled with Currents */}
        <div className="flex flex-col items-center transition-all duration-300">
          {!isSlot1Filled ? (
            <>
              <div className="relative aspect-square w-full rounded-[1vw] sm:rounded-[0.35vw] border-2 border-dashed border-yellow/70 bg-yellow/[0.06] flex flex-col items-center justify-center animate-pulse">
                <span className="text-yellow text-[4vw] sm:text-[1.2vw] leading-none mb-[0.4vw] font-light">
                  +
                </span>
                <span className="text-yellow text-[2vw] sm:text-[0.55vw] font-mono font-medium tracking-tight uppercase">
                  curate 01
                </span>
              </div>
              <div className="mt-[1vw] sm:mt-[0.5vw] text-center w-full">
                <span className="font-mono text-yellow/70 block text-[2.2vw] sm:text-[0.6vw] truncate">
                  empty slot
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="relative aspect-square w-full rounded-[1vw] sm:rounded-[0.35vw] overflow-hidden drop-shadow border border-yellow bg-secondary ring-2 ring-yellow/30 animate-fadeIn">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/musi5t/hero_center.webp"
                  alt="Currents"
                  className="w-full h-full object-cover select-none"
                />
                <span className="absolute top-[0.6vw] left-[0.6vw] sm:top-[0.3vw] sm:left-[0.3vw] text-[2.4vw] sm:text-[0.65vw] px-[1.2vw] py-[0.4vw] sm:px-[0.35vw] sm:py-[0.1vw] rounded-[0.4vw] sm:rounded-[0.15vw] font-mono font-bold bg-yellow text-secondary">
                  01
                </span>
              </div>
              <div className="mt-[1vw] sm:mt-[0.5vw] text-center w-full overflow-hidden">
                <span className="font-medium text-primary block truncate text-[2.6vw] sm:text-[0.7vw]">
                  Currents
                </span>
                <span className="text-primary/50 text-[2.2vw] sm:text-[0.6vw] block truncate">
                  Tame Impala
                </span>
              </div>
            </>
          )}
        </div>

        {/* Slots 02..05: Pre-filled Essential Albums */}
        {filledAlbums.map((album) => (
          <div key={album.rank} className="flex flex-col items-center">
            <div className="relative aspect-square w-full rounded-[1vw] sm:rounded-[0.35vw] overflow-hidden drop-shadow border border-white/10 bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.image}
                alt={album.title}
                className="w-full h-full object-cover select-none"
              />
              <span className="absolute top-[0.6vw] left-[0.6vw] sm:top-[0.3vw] sm:left-[0.3vw] text-[2.4vw] sm:text-[0.65vw] px-[1.2vw] py-[0.4vw] sm:px-[0.35vw] sm:py-[0.1vw] rounded-[0.4vw] sm:rounded-[0.15vw] font-mono font-bold bg-black/80 text-yellow">
                {album.rank}
              </span>
            </div>
            <div className="mt-[1vw] sm:mt-[0.5vw] text-center w-full overflow-hidden">
              <span className="font-medium text-primary block truncate text-[2.6vw] sm:text-[0.7vw]">
                {album.title}
              </span>
              <span className="text-primary/50 text-[2.2vw] sm:text-[0.6vw] block truncate">
                {album.artist}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Minimalist Catalog Search Modal Overlay */}
      <div
        className={`absolute inset-[2.5vw] sm:inset-[1.2vw] bg-[#181816]/95 backdrop-blur-md rounded-[1.5vw] sm:rounded-[0.4vw] border border-white/15 p-[3vw] sm:p-[1.4vw] flex flex-col justify-between z-20 transition-all duration-300 ${
          modalOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-[1.5vw] sm:pb-[0.5vw]">
          <div className="flex items-center gap-[1.5vw] sm:gap-[0.5vw]">
            <span className="w-[1.8vw] h-[1.8vw] sm:w-[0.5vw] sm:h-[0.5vw] rounded-full bg-yellow" />
            <span className="font-mono text-primary/80 text-[2.6vw] sm:text-[0.7vw]">
              curate slot 01 / catalog search
            </span>
          </div>
          <span className="text-primary/40 font-mono text-[2.6vw] sm:text-[0.7vw]">✕</span>
        </div>

        <div className="w-full bg-white/5 border border-white/15 rounded-[1vw] sm:rounded-[0.3vw] px-[2.5vw] py-[1.8vw] sm:px-[1vw] sm:py-[0.6vw] flex items-center justify-between">
          <div className="flex items-center gap-[2vw] sm:gap-[0.6vw]">
            <span className="text-primary/40 text-[3vw] sm:text-[0.8vw]">🔍</span>
            <span className="font-mono text-primary text-[3vw] sm:text-[0.8vw]">
              {typedQuery}
              <span className="animate-pulse text-yellow">|</span>
            </span>
          </div>
          <span className="text-primary/40 text-[2.4vw] sm:text-[0.65vw] font-mono">
            MusicBrainz
          </span>
        </div>

        {showResult && (
          <div className="bg-white/5 border border-white/10 rounded-[1vw] sm:rounded-[0.35vw] p-[2vw] sm:p-[0.8vw] flex items-center justify-between">
            <div className="flex items-center gap-[2vw] sm:gap-[0.8vw]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/musi5t/hero_center.webp"
                alt="Currents"
                className="w-[8vw] h-[8vw] sm:w-[2.8vw] sm:h-[2.8vw] rounded-[0.5vw] sm:rounded-[0.2vw] object-cover"
              />
              <div className="flex flex-col">
                <span className="font-medium text-primary text-[3vw] sm:text-[0.8vw] leading-tight">
                  Currents
                </span>
                <span className="text-primary/60 text-[2.4vw] sm:text-[0.65vw] leading-tight">
                  Tame Impala · 2015 · LP
                </span>
              </div>
            </div>
            <div className="px-[2.5vw] py-[1vw] sm:px-[1vw] sm:py-[0.35vw] bg-yellow text-secondary font-mono font-bold text-[2.6vw] sm:text-[0.7vw] rounded-[0.6vw] sm:rounded-[0.2vw]">
              Select
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-primary/40 text-[2.4vw] sm:text-[0.65vw] font-mono">
          <span>canonical cover art verified</span>
          <span>position 01</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center z-10 pt-[1.5vw] sm:pt-[0.5vw] border-t border-white/5">
        <span className="text-yellow/80 font-mono text-[2.6vw] sm:text-[0.7vw]">
          ★ drag &amp; reorder positions anytime
        </span>
        <span className="text-primary/40 font-mono text-[2.6vw] sm:text-[0.7vw]">
          definitive musical DNA
        </span>
      </div>
    </div>
  );
}

// STEP 2: Real Album Follow & 1-10 Rating Flow (Album Detail View + Rating Widget)
export function StepConnectAnimation() {
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 75 });
  const [isClicking, setIsClicking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      // 0. Initial state
      setIsFollowing(false);
      setSelectedScore(null);
      setShowNotification(false);
      setCursorPos({ x: 80, y: 75 });

      // 1. Move cursor to "+ Follow album" button
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 82, y: 26 });
        }, 500)
      );

      // 2. Click "+ Follow album"
      timeouts.push(
        setTimeout(() => {
          setIsClicking(true);
          timeouts.push(setTimeout(() => setIsClicking(false), 180));
          timeouts.push(
            setTimeout(() => {
              setIsFollowing(true);
              setShowNotification(true);
            }, 180)
          );
        }, 1250)
      );

      // 3. Move cursor to score 9 on the rating bar
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 82, y: 72 });
        }, 2200)
      );

      // 4. Click score 9
      timeouts.push(
        setTimeout(() => {
          setIsClicking(true);
          timeouts.push(setTimeout(() => setIsClicking(false), 180));
          timeouts.push(
            setTimeout(() => {
              setSelectedScore(9);
              setCursorPos({ x: 86, y: 82 });
            }, 180)
          );
        }, 3000)
      );
    };

    const initTimer = setTimeout(runCycle, 200);
    const interval = setInterval(runCycle, 7200);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full aspect-auto min-h-[240px] sm:aspect-[16/10] bg-[#141412] rounded-[2vw] sm:rounded-[0.5vw] p-[3.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/10 drop-shadow-soft relative overflow-hidden select-none pointer-events-none">
      {/* Simulated Animated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 border-b border-white/5 pb-[1.5vw] sm:pb-[0.6vw]">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
          <span className="w-[2vw] h-[2vw] sm:w-[0.55vw] sm:h-[0.55vw] rounded-full bg-yellow" />
          <span className="font-mono text-primary/80 text-[2.8vw] sm:text-[0.75vw]">
            record detail / Tame Impala · Currents (2015)
          </span>
        </div>
        <span className="text-primary/40 font-mono text-[2.6vw] sm:text-[0.7vw]">
          edition: 2015 LP
        </span>
      </div>

      {/* Album Detail Card with Action Button */}
      <div className="bg-white/5 rounded-[1.5vw] sm:rounded-[0.4vw] p-[2.5vw] sm:p-[1vw] flex items-center justify-between border border-white/10 z-10">
        <div className="flex items-center gap-[2.5vw] sm:gap-[1vw]">
          <div className="w-[10vw] h-[10vw] sm:w-[3.4vw] sm:h-[3.4vw] rounded-[0.8vw] sm:rounded-[0.25vw] overflow-hidden bg-secondary flex-shrink-0 drop-shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/musi5t/hero_center.webp"
              alt="Currents"
              className="w-full h-full object-cover select-none"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-[1.5vw] sm:gap-[0.5vw]">
              <span className="font-medium text-primary text-[3.4vw] sm:text-[0.9vw] leading-tight">
                Currents
              </span>
              <span className="bg-yellow/20 text-yellow text-[2.2vw] sm:text-[0.6vw] px-[1.2vw] py-[0.3vw] sm:px-[0.35vw] sm:py-[0.1vw] rounded font-mono">
                LP
              </span>
            </div>
            <span className="text-primary/60 text-[2.6vw] sm:text-[0.7vw] mt-[0.2vw]">
              Tame Impala · Modular Recordings (2015)
            </span>
            <span className="text-primary/40 text-[2.4vw] sm:text-[0.62vw] font-mono mt-[0.1vw]">
              1,420 listeners tracking
            </span>
          </div>
        </div>

        {/* Follow Action Button */}
        <div
          className={`px-[3vw] py-[1.2vw] sm:px-[1.2vw] sm:py-[0.45vw] rounded-[1vw] sm:rounded-[0.25vw] text-[3vw] sm:text-[0.8vw] font-medium transition-all duration-300 flex items-center gap-[1.2vw] sm:gap-[0.4vw] ${
            isFollowing
              ? "bg-yellow text-secondary scale-105 shadow-sm font-semibold"
              : "bg-white/10 text-primary border border-white/15"
          }`}
        >
          {isFollowing ? (
            <>
              <svg
                className="w-[3.2vw] h-[3.2vw] sm:w-[0.85vw] sm:h-[0.85vw]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>✓ Following</span>
            </>
          ) : (
            <span>+ Follow album</span>
          )}
        </div>
      </div>

      {/* Interactive 1-10 Rating Bar (Recreating AlbumRatingWidget) */}
      <div className="bg-white/5 border border-white/10 rounded-[1.5vw] sm:rounded-[0.4vw] p-[2.5vw] sm:p-[1vw] flex flex-col sm:flex-row sm:items-center justify-between gap-[2vw] sm:gap-[1vw] z-10">
        <div className="flex items-center gap-[2.5vw] sm:gap-[0.8vw]">
          <div className="w-[10vw] h-[10vw] sm:w-[3vw] sm:h-[3vw] rounded-[0.6vw] sm:rounded-[0.2vw] bg-yellow text-secondary flex flex-col items-center justify-center flex-shrink-0 font-bold">
            <span className="text-[3.6vw] sm:text-[1vw] leading-none">8.8</span>
            <span className="text-[1.8vw] sm:text-[0.5vw] leading-none text-secondary/70 mt-[0.2vw]">
              ★ 142
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-primary/60 text-[2.2vw] sm:text-[0.6vw] uppercase tracking-wider">
              community rating
            </span>
            <span className="text-primary text-[2.8vw] sm:text-[0.75vw] font-medium leading-tight">
              {selectedScore
                ? `Your score: ${selectedScore} / 10`
                : "Select 1–10 to rate record"}
            </span>
            <span className="text-yellow text-[2.2vw] sm:text-[0.6vw] font-mono mt-[0.1vw]">
              {selectedScore
                ? "★ Added to your taste network"
                : "Calibrates your recommendations"}
            </span>
          </div>
        </div>

        {/* 1..10 Selector Buttons */}
        <div className="flex items-center gap-[1vw] sm:gap-[0.35vw] flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
            const isSelected = selectedScore === score;
            const isHighlighted = selectedScore !== null && score <= selectedScore;

            return (
              <div
                key={score}
                className={`w-[6.5vw] h-[7vw] sm:w-[1.8vw] sm:h-[1.9vw] rounded-[0.5vw] sm:rounded-[0.2vw] flex items-center justify-center text-[2.6vw] sm:text-[0.75vw] font-mono font-bold transition-all duration-300 border ${
                  isSelected
                    ? "bg-yellow text-secondary border-yellow scale-110 shadow-md ring-1 ring-yellow/50"
                    : isHighlighted
                    ? "bg-yellow/30 text-yellow border-yellow/50"
                    : "bg-white/5 text-primary/60 border-white/10"
                }`}
              >
                {score}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle notification footer */}
      <div className="flex justify-between items-center z-10 pt-[1.5vw] sm:pt-[0.5vw] border-t border-white/5">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.5vw]">
          <span
            className={`w-[1.8vw] h-[1.8vw] sm:w-[0.45vw] sm:h-[0.45vw] rounded-full transition-colors ${
              showNotification ? "bg-yellow animate-ping" : "bg-primary/20"
            }`}
          />
          <span className="text-[2.6vw] sm:text-[0.7vw] font-mono transition-colors text-yellow/90">
            {showNotification
              ? "✓ Album added to your taste network"
              : "Taste network syncing active"}
          </span>
        </div>
        <span className="text-primary/40 font-mono text-[2.4vw] sm:text-[0.65vw]">
          taste match: 94%
        </span>
      </div>
    </div>
  );
}

// STEP 3: Real Feed Post with Like & Replies Thread (FeedView + Inline Replies)
export function StepDiscussPost() {
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 75 });
  const [isClicking, setIsClicking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(48);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      // 0. Initial state
      setHasLiked(false);
      setLikes(48);
      setIsRepliesOpen(false);
      setCursorPos({ x: 80, y: 75 });

      // 1. Move cursor to Heart Like icon
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 14, y: 72 });
        }, 500)
      );

      // 2. Click Heart -> Increments like count to 49
      timeouts.push(
        setTimeout(() => {
          setIsClicking(true);
          timeouts.push(setTimeout(() => setIsClicking(false), 180));
          timeouts.push(
            setTimeout(() => {
              setHasLiked(true);
              setLikes(49);
            }, 180)
          );
        }, 1250)
      );

      // 3. Move cursor to "18 replies" button
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 38, y: 72 });
        }, 2100)
      );

      // 4. Click "18 replies" -> Expand reply thread
      timeouts.push(
        setTimeout(() => {
          setIsClicking(true);
          timeouts.push(setTimeout(() => setIsClicking(false), 180));
          timeouts.push(
            setTimeout(() => {
              setIsRepliesOpen(true);
              setCursorPos({ x: 86, y: 82 });
            }, 180)
          );
        }, 2900)
      );
    };

    const initTimer = setTimeout(runCycle, 200);
    const interval = setInterval(runCycle, 7200);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full aspect-auto min-h-[240px] sm:aspect-[16/10] bg-[#141412] rounded-[2vw] sm:rounded-[0.5vw] p-[3.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/10 drop-shadow-soft relative overflow-hidden select-none pointer-events-none">
      {/* Simulated Animated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 border-b border-white/5 pb-[1.5vw] sm:pb-[0.6vw]">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
          <span className="w-[2vw] h-[2vw] sm:w-[0.55vw] sm:h-[0.55vw] rounded-full bg-yellow" />
          <span className="font-mono text-primary/80 text-[2.8vw] sm:text-[0.75vw]">
            feed / discussion on #Currents
          </span>
        </div>
        <span className="text-primary/40 font-mono text-[2.6vw] sm:text-[0.7vw]">
          audience: #Currents
        </span>
      </div>

      {/* Main Post Card */}
      <div className="bg-white/5 rounded-[1.5vw] sm:rounded-[0.4vw] p-[3vw] sm:p-[1.1vw] border border-white/10 z-10 flex flex-col gap-[2vw] sm:gap-[0.7vw] my-auto">
        {/* Post Author Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[2vw] sm:gap-[0.8vw]">
            <div className="w-[7vw] h-[7vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-[0.4vw] bg-yellow text-secondary flex items-center justify-center font-bold text-[3.6vw] sm:text-[0.9vw] drop-shadow">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-primary text-[3vw] sm:text-[0.85vw] leading-tight">
                Sofia Valenzuela
              </span>
              <span className="text-primary/50 text-[2.4vw] sm:text-[0.65vw] leading-tight">
                @sofia.music · 12m ago
              </span>
            </div>
          </div>
          <span className="bg-yellow text-secondary font-mono text-[2.4vw] sm:text-[0.65vw] px-[1.5vw] py-[0.4vw] sm:px-[0.4vw] sm:py-[0.1vw] rounded-[0.4vw] sm:rounded-[0.15vw] font-bold">
            #Currents
          </span>
        </div>

        {/* Post Content */}
        <p className="text-primary/90 text-[3.2vw] sm:text-[0.8vw] leading-relaxed">
          &ldquo;The synth bassline on &apos;The Less I Know The Better&apos; into &apos;Past
          Life&apos; is unmatched. Still one of the best A-sides of the decade.&rdquo;
        </p>

        {/* Tagged Album Pill */}
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.5vw] bg-white/[0.04] border border-white/10 rounded-[0.6vw] sm:rounded-[0.25vw] p-[1.5vw] sm:p-[0.4vw] w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/musi5t/hero_center.webp"
            alt="Currents"
            className="w-[5vw] h-[5vw] sm:w-[1.6vw] sm:h-[1.6vw] rounded-[0.3vw] sm:rounded-[0.15vw] object-cover"
          />
          <div className="flex flex-col pr-[1vw]">
            <span className="font-medium text-primary text-[2.6vw] sm:text-[0.7vw] leading-tight">
              Currents
            </span>
            <span className="text-primary/50 text-[2.2vw] sm:text-[0.58vw] leading-tight">
              Tame Impala (2015)
            </span>
          </div>
        </div>

        {/* Actions bar (Like & Replies) */}
        <div className="flex items-center justify-between pt-[1.5vw] sm:pt-[0.5vw] border-t border-white/5">
          <div className="flex items-center gap-[4vw] sm:gap-[1.5vw]">
            {/* Heart Button */}
            <div
              className={`flex items-center gap-[1.2vw] sm:gap-[0.35vw] text-[3vw] sm:text-[0.75vw] font-mono transition-all duration-200 ${
                hasLiked ? "text-red-400 font-bold scale-105" : "text-primary/60"
              }`}
            >
              <span className="text-[3.6vw] sm:text-[0.9vw]">{hasLiked ? "♥" : "♡"}</span>
              <span>{likes}</span>
            </div>

            {/* Replies Button */}
            <div
              className={`flex items-center gap-[1.2vw] sm:gap-[0.35vw] text-[3vw] sm:text-[0.75vw] font-mono transition-colors ${
                isRepliesOpen ? "text-yellow font-medium" : "text-primary/60"
              }`}
            >
              <span>💬</span>
              <span>18 replies</span>
            </div>
          </div>

          <span className="text-primary/35 text-[2.4vw] sm:text-[0.65vw] font-mono">
            listener note
          </span>
        </div>

        {/* Inline Replies Thread */}
        <div
          className={`transition-all duration-500 ease-out overflow-hidden ${
            isRepliesOpen
              ? "max-h-[25vw] opacity-100 pt-[1.5vw] sm:pt-[0.5vw]"
              : "max-h-0 opacity-0 pt-0"
          }`}
        >
          <div className="bg-white/[0.04] border border-white/10 rounded-[0.8vw] sm:rounded-[0.25vw] p-[2vw] sm:p-[0.6vw] flex flex-col gap-[0.5vw]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[1.5vw] sm:gap-[0.4vw]">
                <div className="w-[4.5vw] h-[4.5vw] sm:w-[1.4vw] sm:h-[1.4vw] rounded-full bg-amber-500/20 text-yellow flex items-center justify-center font-bold text-[2.4vw] sm:text-[0.65vw]">
                  N
                </div>
                <span className="font-semibold text-primary text-[2.6vw] sm:text-[0.7vw]">
                  @nico
                </span>
              </div>
              <span className="text-primary/40 text-[2.2vw] sm:text-[0.6vw] font-mono">2m ago</span>
            </div>
            <p className="text-primary/80 text-[2.6vw] sm:text-[0.7vw] pl-[6vw] sm:pl-[1.8vw] leading-tight">
              &ldquo;Agreed, the analog warmth on vinyl hits completely different.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center z-10 pt-[1.5vw] sm:pt-[0.5vw] border-t border-white/5">
        <span className="text-yellow/80 font-mono text-[2.6vw] sm:text-[0.7vw]">
          ★ direct discussion around sound
        </span>
        <span className="text-primary/40 font-mono text-[2.6vw] sm:text-[0.7vw]">
          {isRepliesOpen ? "thread expanded" : "click to expand thread"}
        </span>
      </div>
    </div>
  );
}
