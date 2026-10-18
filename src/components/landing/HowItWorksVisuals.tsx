"use client";

import { useEffect, useRef, useState } from "react";

// Standard precision simulated OS cursor matching musi5t ink theme
function SimulatedCursor({ isClicking }: { isClicking?: boolean }) {
  return (
    <div
      className={`pointer-events-none transition-transform duration-150 ${
        isClicking ? "scale-75" : "scale-100"
      }`}
    >
      <svg
        className="w-[3.6vw] sm:w-[1.2vw] min-w-[14px] h-[3.6vw] sm:h-[1.2vw] min-h-[14px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] filter"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 2L19 13.5L11.5 14.5L8 21.5L5 20.5L8 14.5L4 11V2Z"
          fill="#FFFFFF"
          stroke="#0E0E0E"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// STEP 1: Real Top 5 Records Showcase matching ProfileView.tsx
export function StepCurateCollage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const slot1Ref = useRef<HTMLDivElement>(null);

  const [activeSlot, setActiveSlot] = useState<number | null>(null);
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
      const s1 = slot1Ref.current;

      if (container && s1) {
        const cRect = container.getBoundingClientRect();
        const sRect = s1.getBoundingClientRect();
        const targetX = ((sRect.left + sRect.width * 0.5 - cRect.left) / cRect.width) * 100;
        const targetY = ((sRect.top + sRect.height * 0.5 - cRect.top) / cRect.height) * 100;
        setCursorPos({ x: targetX, y: targetY });

        timeouts.push(
          setTimeout(() => {
            setIsClicking(true);
            setActiveSlot(1);
            timeouts.push(setTimeout(() => setIsClicking(false), 200));
          }, 1200)
        );
      }

      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 85, y: 80 });
          setActiveSlot(null);
        }, 4500)
      );
    };

    const initTimer = setTimeout(runCycle, 400);
    const interval = setInterval(runCycle, 5500);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-auto min-h-[220px] sm:aspect-[16/10] bg-primary text-secondary rounded-[1.5vw] sm:rounded-[0.5vw] p-[3.5vw] sm:p-[1.8vw] flex flex-col justify-between border border-secondary/15 drop-shadow-soft relative overflow-hidden select-none pointer-events-none"
    >
      {/* Simulated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

      {/* Header matching real musi5t */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
          <div className="drop-shadow rounded-[0.2vw]">
            <div className="w-[3.5vw] h-[3.5vw] sm:w-[1vw] sm:h-[1vw] rounded-[0.15vw] bg-yellow" />
          </div>
          <span className="extraSmallText text-secondary/70">top 5 records</span>
        </div>
        <span className="detailText text-secondary/50">curated (5/5)</span>
      </div>

      {/* 5 Slots Row */}
      <div className="grid grid-cols-5 gap-[1.5vw] sm:gap-[0.8vw] my-auto items-start z-10 pt-[0.5vw]">
        {albums.map((album) => {
          const isActive = activeSlot === album.rank;
          return (
            <div
              key={album.rank}
              ref={album.rank === 1 ? slot1Ref : undefined}
              className={`flex flex-col transition-all duration-300 ${
                isActive ? "-translate-y-2 scale-105" : "translate-y-0 scale-100"
              }`}
            >
              <div
                className={`relative aspect-square w-full rounded-[0.8vw] sm:rounded-[0.3vw] overflow-hidden drop-shadow-soft bg-secondary transition-all duration-300 ${
                  isActive ? "ring-2 ring-yellow shadow-md" : "border border-secondary/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={album.image}
                  alt={album.title}
                  className="w-full h-full object-cover select-none"
                />
                <span
                  className={`absolute top-[0.8vw] left-[0.8vw] sm:top-[0.3vw] sm:left-[0.3vw] text-[2.4vw] sm:text-[0.6vw] px-[1.2vw] py-[0.3vw] sm:px-[0.35vw] sm:py-[0.1vw] rounded-[0.15vw] font-medium transition-colors ${
                    isActive ? "bg-yellow text-secondary" : "bg-black/75 text-primary"
                  }`}
                >
                  0{album.rank}
                </span>
              </div>
              <div className="mt-[1vw] sm:mt-[0.4vw] w-full overflow-hidden">
                <span className="detailText font-medium text-secondary block truncate text-[2.6vw] sm:text-inherit">
                  {album.title}
                </span>
                <span className="detailText text-secondary/50 block truncate text-[2.4vw] sm:text-[0.65vw]">
                  {album.artist}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer matching real musi5t */}
      <div className="flex justify-between items-center z-10 pt-[1vw] border-t border-secondary/10 text-secondary/60 detailText text-[2.6vw] sm:text-[0.7vw]">
        <span>
          {activeSlot ? "Selected · #01 Currents by Tame Impala" : "Click to curate or reorder"}
        </span>
        <span className="text-secondary/40">5 slots filled</span>
      </div>
    </div>
  );
}

// STEP 2: Real Album Detail & Follow matching AlbumDetailView.tsx
export function StepConnectAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const followBtnRef = useRef<HTMLDivElement>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 25, y: 75 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      const container = containerRef.current;
      const followBtn = followBtnRef.current;

      if (container && followBtn) {
        const cRect = container.getBoundingClientRect();
        const fRect = followBtn.getBoundingClientRect();
        const targetX = ((fRect.left + fRect.width * 0.5 - cRect.left) / cRect.width) * 100;
        const targetY = ((fRect.top + fRect.height * 0.5 - cRect.top) / cRect.height) * 100;
        setCursorPos({ x: targetX, y: targetY });

        timeouts.push(
          setTimeout(() => {
            setIsClicking(true);
            setIsFollowing(true);
            timeouts.push(setTimeout(() => setIsClicking(false), 200));
          }, 1200)
        );
      }

      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 25, y: 75 });
          setIsFollowing(false);
        }, 4500)
      );
    };

    const initTimer = setTimeout(runCycle, 400);
    const interval = setInterval(runCycle, 5500);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-auto min-h-[220px] sm:aspect-[16/10] bg-primary text-secondary rounded-[1.5vw] sm:rounded-[0.5vw] p-[3.5vw] sm:p-[1.8vw] flex flex-col justify-between border border-secondary/15 drop-shadow-soft relative overflow-hidden select-none pointer-events-none"
    >
      {/* Simulated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

      {/* Header matching AlbumDetailView */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
          <div className="drop-shadow rounded-[0.2vw]">
            <div className="w-[3.5vw] h-[3.5vw] sm:w-[1vw] sm:h-[1vw] rounded-[0.15vw] bg-yellow" />
          </div>
          <span className="extraSmallText text-secondary/70">record detail</span>
        </div>
        <span className="detailText text-secondary/50">community rating</span>
      </div>

      {/* Album Card */}
      <div className="bg-secondary/[0.03] border border-secondary/10 rounded-[1vw] sm:rounded-[0.4vw] p-[3vw] sm:p-[1.2vw] flex items-center justify-between my-auto">
        <div className="flex items-center gap-[2.5vw] sm:gap-[1.2vw]">
          <div className="w-[14vw] h-[14vw] sm:w-[4.8vw] sm:h-[4.8vw] rounded-[0.3vw] overflow-hidden drop-shadow-soft bg-secondary shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/musi5t/hero_center.webp"
              alt="Currents"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-[0.5vw] sm:gap-[0.2vw]">
            <span className="smallText font-medium text-secondary leading-tight text-[3.6vw] sm:text-inherit">
              Currents
            </span>
            <span className="extraSmallText text-secondary/60 leading-tight text-[2.8vw] sm:text-inherit">
              Tame Impala · 2015
            </span>
            <div className="flex items-center gap-[1.5vw] sm:gap-[0.5vw] mt-[0.5vw]">
              <span className="detailText px-[1.5vw] py-[0.3vw] sm:px-[0.45vw] sm:py-[0.1vw] bg-yellow text-secondary rounded-[0.15vw] font-medium text-[2.4vw] sm:text-[0.65vw]">
                ★ 8.8
              </span>
              <span className="detailText text-secondary/45 text-[2.4vw] sm:text-[0.65vw]">
                142 community ratings
              </span>
            </div>
          </div>
        </div>

        {/* Action Follow Button */}
        <div
          ref={followBtnRef}
          className={`px-[3vw] py-[1.2vw] sm:px-[1vw] sm:py-[0.35vw] rounded-[0.25vw] text-[3vw] sm:text-[0.75vw] font-medium transition-all duration-300 flex items-center gap-[1vw] sm:gap-[0.3vw] drop-shadow-soft ${
            isFollowing
              ? "bg-yellow text-secondary scale-105"
              : "bg-secondary text-primary hover:bg-secondary/90"
          }`}
        >
          {isFollowing ? (
            <>
              <svg className="w-[3vw] h-[3vw] sm:w-[0.8vw] sm:h-[0.8vw]" viewBox="0 0 24 24" fill="none">
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
            <span>+ Follow album</span>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between z-10 pt-[1vw] border-t border-secondary/10 text-secondary/60 detailText text-[2.6vw] sm:text-[0.7vw]">
        <span>
          {isFollowing
            ? "Album added to your taste network"
            : "Follow records to curate your feed"}
        </span>
        <span className="text-secondary/40">album-first social</span>
      </div>
    </div>
  );
}

// STEP 3: Real Feed Post matching FeedView.tsx
export function StepDiscussPost() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartBtnRef = useRef<HTMLDivElement>(null);

  const [likes, setLikes] = useState(48);
  const [hasLiked, setHasLiked] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 80 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      const container = containerRef.current;
      const heartBtn = heartBtnRef.current;

      if (container && heartBtn) {
        const cRect = container.getBoundingClientRect();
        const hRect = heartBtn.getBoundingClientRect();
        const targetX = ((hRect.left + hRect.width * 0.4 - cRect.left) / cRect.width) * 100;
        const targetY = ((hRect.top + hRect.height * 0.4 - cRect.top) / cRect.height) * 100;
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

      timeouts.push(
        setTimeout(() => {
          setCursorPos({ x: 75, y: 80 });
          setHasLiked(false);
          setLikes(48);
        }, 4500)
      );
    };

    const initTimer = setTimeout(runCycle, 400);
    const interval = setInterval(runCycle, 5500);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-auto min-h-[220px] sm:aspect-[16/10] bg-primary text-secondary rounded-[1.5vw] sm:rounded-[0.5vw] p-[3.5vw] sm:p-[1.8vw] flex flex-col justify-between border border-secondary/15 drop-shadow-soft relative overflow-hidden select-none pointer-events-none"
    >
      {/* Simulated Cursor */}
      <div
        className="absolute z-30 transition-all duration-700 ease-out"
        style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
      >
        <SimulatedCursor isClicking={isClicking} />
      </div>

      {/* Header matching real musi5t */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-[1.5vw] sm:gap-[0.6vw]">
          <div className="drop-shadow rounded-[0.2vw]">
            <div className="w-[3.5vw] h-[3.5vw] sm:w-[1vw] sm:h-[1vw] rounded-[0.15vw] bg-yellow" />
          </div>
          <span className="extraSmallText text-secondary/70">feed / discussion</span>
        </div>
        <span className="detailText text-secondary/50">12m ago</span>
      </div>

      {/* Main Post Card matching FeedView */}
      <div className="bg-secondary/[0.03] border border-secondary/10 rounded-[1vw] sm:rounded-[0.4vw] p-[3vw] sm:p-[1.2vw] my-auto flex flex-col gap-[2vw] sm:gap-[0.8vw]">
        {/* Author Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[2vw] sm:gap-[0.6vw]">
            <div className="w-[7vw] h-[7vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-[0.25vw] bg-yellow text-secondary flex items-center justify-center font-bold text-[3.2vw] sm:text-[0.85vw] drop-shadow shrink-0">
              S
            </div>
            <div className="flex flex-col">
              <span className="detailText font-medium text-secondary leading-tight text-[2.8vw] sm:text-inherit">
                Sofia
              </span>
              <span className="detailText text-secondary/50 text-[2.4vw] sm:text-[0.65vw]">
                @sofia.music
              </span>
            </div>
          </div>
          <span className="detailText px-[1.8vw] py-[0.4vw] sm:px-[0.5vw] sm:py-[0.15vw] bg-secondary/5 border border-secondary/10 text-secondary rounded-[0.2vw] font-medium text-[2.4vw] sm:text-[0.65vw]">
            #Currents
          </span>
        </div>

        {/* Post Content */}
        <p className="extraSmallText text-secondary/90 leading-snug text-[3.2vw] sm:text-inherit">
          &ldquo;The synth bassline on &apos;The Less I Know The Better&apos; into &apos;Past Life&apos; is unmatched. Still one of the best A-sides of the decade.&rdquo;
        </p>

        {/* Actions bar (Like & Replies) */}
        <div className="flex items-center gap-[4vw] sm:gap-[1.5vw] pt-[1.2vw] sm:pt-[0.4vw] border-t border-secondary/10">
          <div
            ref={heartBtnRef}
            className={`flex items-center gap-[1.2vw] sm:gap-[0.35vw] text-[3vw] sm:text-[0.75vw] transition-all duration-200 ${
              hasLiked ? "text-red-500 font-bold scale-105" : "text-secondary/60"
            }`}
          >
            <svg
              className="w-[3.6vw] h-[3.6vw] sm:w-[0.9vw] sm:h-[0.9vw]"
              viewBox="0 0 24 24"
              fill={hasLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{likes}</span>
          </div>

          <div className="flex items-center gap-[1.2vw] sm:gap-[0.35vw] text-secondary/50 text-[3vw] sm:text-[0.75vw]">
            <svg
              className="w-[3.6vw] h-[3.6vw] sm:w-[0.9vw] sm:h-[0.9vw]"
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

      {/* Footer info */}
      <div className="flex items-center justify-between z-10 pt-[1vw] border-t border-secondary/10 text-secondary/60 detailText text-[2.6vw] sm:text-[0.7vw]">
        <span>Conversations happen around albums</span>
        <span className="text-secondary/40">high-signal feed</span>
      </div>
    </div>
  );
}
