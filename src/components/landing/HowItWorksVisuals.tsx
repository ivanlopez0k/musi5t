"use client";

import { useEffect, useRef, useState } from "react";

// Standard precision simulated OS cursor
function SimulatedCursor({ isClicking }: { isClicking?: boolean }) {
  return (
    <div
      className={`pointer-events-none transition-transform duration-150 ${
        isClicking ? "scale-75" : "scale-100"
      }`}
    >
      <svg
        className="w-[1.4vw] min-w-[16px] h-[1.4vw] min-h-[16px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] filter"
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

// STEP 1: Top 5 Albums Collage with Simulated Cursor
export function StepCurateCollage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const album1Ref = useRef<HTMLDivElement>(null);
  const album3Ref = useRef<HTMLDivElement>(null);

  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 80, y: 75 });
  const [isClicking, setIsClicking] = useState(false);

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

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      const container = containerRef.current;
      const a1 = album1Ref.current;
      const a3 = album3Ref.current;

      // 1. Move to album 1 with bounding rect calculation
      if (container && a1) {
        const cRect = container.getBoundingClientRect();
        const aRect = a1.getBoundingClientRect();
        const targetX = ((aRect.left + aRect.width * 0.4 - cRect.left) / cRect.width) * 100;
        const targetY = ((aRect.top + aRect.height * 0.4 - cRect.top) / cRect.height) * 100;
        setCursorPos({ x: targetX, y: targetY });

        timeouts.push(
          setTimeout(() => {
            setIsClicking(true);
            setActiveCard(1);
            timeouts.push(setTimeout(() => setIsClicking(false), 200));
          }, 1200)
        );
      }

      // 2. Move to album 3 with bounding rect calculation
      timeouts.push(
        setTimeout(() => {
          if (container && a3) {
            const cRect = container.getBoundingClientRect();
            const aRect = a3.getBoundingClientRect();
            const targetX = ((aRect.left + aRect.width * 0.4 - cRect.left) / cRect.width) * 100;
            const targetY = ((aRect.top + aRect.height * 0.4 - cRect.top) / cRect.height) * 100;
            setCursorPos({ x: targetX, y: targetY });

            timeouts.push(
              setTimeout(() => {
                setIsClicking(true);
                setActiveCard(3);
                timeouts.push(setTimeout(() => setIsClicking(false), 200));
              }, 1100)
            );
          }
        }, 2200)
      );

      // 3. Move away and reset
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 88, y: 80 });
          setActiveCard(null);
        }, 4800)
      );
    };

    // Small delay for initial render bounding rect
    const initTimer = setTimeout(runCycle, 300);
    const interval = setInterval(runCycle, 6000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[16/10] bg-[#141412] rounded-[0.5vw] p-[1.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/5 drop-shadow-soft relative overflow-hidden select-none pointer-events-none"
    >
      {/* Simulated Animated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

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

      {/* 5 Album Covers */}
      <div className="grid grid-cols-5 gap-[0.8vw] my-auto items-center z-10 pt-[0.5vw]">
        {albums.map((album) => {
          const isActive = activeCard === album.rank;
          return (
            <div
              key={album.rank}
              ref={album.rank === 1 ? album1Ref : album.rank === 3 ? album3Ref : undefined}
              className={`flex flex-col items-center transition-all duration-300 ${
                isActive ? "-translate-y-2 scale-105" : "translate-y-0 scale-100"
              }`}
            >
              <div
                className={`relative aspect-square w-full rounded-[0.3vw] overflow-hidden drop-shadow border transition-colors duration-300 bg-secondary ${
                  isActive ? "border-yellow" : "border-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={album.image}
                  alt={album.title}
                  className="w-full h-full object-cover select-none"
                />
                <span
                  className={`absolute top-[0.3vw] left-[0.3vw] text-[0.65vw] px-[0.3vw] py-[0.1vw] rounded-[0.15vw] font-mono font-bold transition-colors ${
                    isActive ? "bg-yellow text-secondary" : "bg-black/80 text-yellow"
                  }`}
                >
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
          );
        })}
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

// STEP 2: Follow & Music Taste Match with Simulated Cursor
export function StepConnectAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const followBtnRef = useRef<HTMLDivElement>(null);
  const trackBtnRef = useRef<HTMLButtonElement>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingAlbum, setIsFollowingAlbum] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 30, y: 80 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      const container = containerRef.current;
      const followBtn = followBtnRef.current;
      const trackBtn = trackBtnRef.current;

      // 1. Move exactly to "+ Follow" button using getBoundingClientRect
      if (container && followBtn) {
        const cRect = container.getBoundingClientRect();
        const fRect = followBtn.getBoundingClientRect();
        const targetX = ((fRect.left + fRect.width * 0.4 - cRect.left) / cRect.width) * 100;
        const targetY = ((fRect.top + fRect.height * 0.4 - cRect.top) / cRect.height) * 100;
        setCursorPos({ x: targetX, y: targetY });

        timeouts.push(
          setTimeout(() => {
            setIsClicking(true);
            setIsFollowing(true);
            timeouts.push(setTimeout(() => setIsClicking(false), 200));
          }, 1300)
        );
      }

      // 2. Move exactly to "+ Track record" button using getBoundingClientRect
      timeouts.push(
        setTimeout(() => {
          if (container && trackBtn) {
            const cRect = container.getBoundingClientRect();
            const tRect = trackBtn.getBoundingClientRect();
            const targetX = ((tRect.left + tRect.width * 0.5 - cRect.left) / cRect.width) * 100;
            const targetY = ((tRect.top + tRect.height * 0.5 - cRect.top) / cRect.height) * 100;
            setCursorPos({ x: targetX, y: targetY });

            timeouts.push(
              setTimeout(() => {
                setIsClicking(true);
                setIsFollowingAlbum(true);
                timeouts.push(setTimeout(() => setIsClicking(false), 200));
              }, 1100)
            );
          }
        }, 2600)
      );

      // 3. Move away and reset
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 25, y: 78 });
          setIsFollowing(false);
          setIsFollowingAlbum(false);
        }, 5200)
      );
    };

    const initTimer = setTimeout(runCycle, 300);
    const interval = setInterval(runCycle, 6200);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[16/10] bg-[#141412] rounded-[0.5vw] p-[1.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/5 drop-shadow-soft relative overflow-hidden select-none pointer-events-none"
    >
      {/* Simulated Animated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

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
        <div
          ref={followBtnRef}
          className={`px-[1.2vw] py-[0.4vw] rounded-[0.25vw] text-[0.85vw] font-medium transition-all duration-300 flex items-center gap-[0.3vw] ${
            isFollowing
              ? "bg-yellow text-secondary scale-105 shadow-sm"
              : "bg-white/10 text-primary"
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
        </div>
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
          ref={trackBtnRef}
          type="button"
          className={`text-[0.7vw] font-mono transition-colors duration-200 ${
            isFollowingAlbum ? "text-yellow font-bold" : "text-primary/70"
          }`}
        >
          {isFollowingAlbum ? "✓ Tracking record" : "+ Track record"}
        </button>
      </div>
    </div>
  );
}

// STEP 3: Live Post & Liking with Exact Measured Cursor Position
export function StepDiscussPost() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartBtnRef = useRef<HTMLDivElement>(null);
  const commentsBtnRef = useRef<HTMLDivElement>(null);

  const [likes, setLikes] = useState(48);
  const [hasLiked, setHasLiked] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 88 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      const container = containerRef.current;
      const heartBtn = heartBtnRef.current;
      const commentsBtn = commentsBtnRef.current;

      // 1. Move directly to Like Heart icon using exact DOM coordinates
      if (container && heartBtn) {
        const cRect = container.getBoundingClientRect();
        const hRect = heartBtn.getBoundingClientRect();
        // Position cursor tip directly on the heart SVG
        const targetX = ((hRect.left + 4 - cRect.left) / cRect.width) * 100;
        const targetY = ((hRect.top + 4 - cRect.top) / cRect.height) * 100;
        setCursorPos({ x: targetX, y: targetY });

        timeouts.push(
          setTimeout(() => {
            setIsClicking(true);
            setHasLiked(true);
            setLikes(49);
            timeouts.push(setTimeout(() => setIsClicking(false), 200));
          }, 1200)
        );
      }

      // 2. Move directly to Comments pill using exact DOM coordinates
      timeouts.push(
        setTimeout(() => {
          if (container && commentsBtn) {
            const cRect = container.getBoundingClientRect();
            const comRect = commentsBtn.getBoundingClientRect();
            const targetX = ((comRect.left + 4 - cRect.left) / cRect.width) * 100;
            const targetY = ((comRect.top + 4 - cRect.top) / cRect.height) * 100;
            setCursorPos({ x: targetX, y: targetY });
          }
        }, 2600)
      );

      // 3. Move away to bottom right and reset state
      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 75, y: 88 });
          setHasLiked(false);
          setLikes(48);
        }, 5000)
      );
    };

    const initTimer = setTimeout(runCycle, 300);
    const interval = setInterval(runCycle, 5800);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[16/10] bg-[#141412] rounded-[0.5vw] p-[1.5vw] sm:p-[2vw] flex flex-col justify-between border border-white/5 drop-shadow-soft relative overflow-hidden select-none pointer-events-none"
    >
      {/* Simulated Animated Cursor with exact bounding-box tracking */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

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
          <div
            ref={heartBtnRef}
            className={`flex items-center gap-[0.35vw] text-[0.8vw] font-mono transition-all duration-200 ${
              hasLiked ? "text-red-400 font-bold scale-105" : "text-primary/60"
            }`}
          >
            <svg
              width="0.9vw"
              height="0.9vw"
              viewBox="0 0 24 24"
              fill={hasLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              className={hasLiked ? "scale-125 transition-transform" : ""}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{likes}</span>
          </div>

          <div
            ref={commentsBtnRef}
            className="flex items-center gap-[0.35vw] text-primary/50 text-[0.8vw] font-mono"
          >
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
