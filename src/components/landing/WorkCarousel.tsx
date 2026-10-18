"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface Project {
  name: string;
  artist: string;
  image: string;
  year: string;
}

const FEATURED_ALBUMS: Project[] = [
  {
    name: "93 'Til Infinity",
    artist: "Souls of Mischief",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Music/22/6e/b6/mzi.xyhsjlep.jpg/600x600bb.jpg",
    year: "1993",
  },
  {
    name: "Purple",
    artist: "Wunderhorse",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7b/7b/4a/7b7b4a32-f2ff-fdb1-cb05-7f7332c812cc/cover.jpg/600x600bb.jpg",
    year: "2022",
  },
  {
    name: "Stonecutters",
    artist: "Dope Lemon",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/55/73/dd55738b-8df2-44cf-e6e0-59c49b4acea7/4050538506631.jpg/600x600bb.jpg",
    year: "2016",
  },
  {
    name: "Do You",
    artist: "Ghostwoman",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/bf/2c/55bf2cb5-be73-772d-38c5-4c5c713f67b6/5060626464315_cover.jpg/600x600bb.jpg",
    year: "2022",
  },
];

export function WorkCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Floating wave animation on album cards (desktop only for smooth mobile swiping)
      const isMobile = window.innerWidth < 640;
      if (!isMobile) {
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            y: i % 2 === 0 ? -10 : 10,
            duration: 2.5 + i * 0.3,
            delay: i * 0.2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        });
      }
    }, container);

    return () => ctx.revert();
  }, []);

  // Hover scale & peer dim effect
  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      if (hoveredIndex === null) {
        gsap.to(card, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
      } else if (hoveredIndex === i) {
        gsap.to(card, { scale: 1.05, opacity: 1, zIndex: 10, duration: 0.4, ease: "power3.out" });
      } else {
        gsap.to(card, { scale: 0.98, opacity: 0.85, zIndex: 1, duration: 0.4, ease: "power2.out" });
      }
    });
  }, [hoveredIndex]);

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      id="records"
      data-nav-color="secondary"
      className="w-full h-full relative select-none pt-[4vw] pb-[6vw] bg-primary text-secondary"
    >
      <div className="layout-grid mb-[2vw]">
        <div className="col-span-full flex justify-between items-center">
          <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
            <div className="drop-shadow rounded-[0.25vw]">
              <div className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] rounded-[1vw] sm:rounded-[0.2vw] bg-yellow" />
            </div>
            <span className="mediumText text-[4.8vw] sm:text-inherit">featured records</span>
          </div>
          <div className="flex items-center gap-[3vw] sm:gap-[1.5vw]">
            <h2 className="hidden sm:block text-secondary/40 extraSmallText font-mono">
              curated showcase
            </h2>
            <div className="flex items-center gap-[1.5vw] sm:gap-[0.5vw]">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous albums"
                className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full border border-secondary/20 flex items-center justify-center hover:bg-secondary/10 active:scale-95 transition-all text-[3.8vw] sm:text-[1vw] text-secondary cursor-pointer"
              >
                ←
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next albums"
                className="w-[8vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.2vw] rounded-full border border-secondary/20 flex items-center justify-center hover:bg-secondary/10 active:scale-95 transition-all text-[3.8vw] sm:text-[1vw] text-secondary cursor-pointer"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Horizontal Carousel with Native Touch Swiping & Snap */}
      <div
        ref={scrollContainerRef}
        data-lenis-prevent
        className="w-full overflow-x-auto hide-scrollbar py-[2vw] px-[var(--margin)] touch-pan-x overscroll-x-contain snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex gap-[4vw] sm:gap-[2.5vw] w-fit items-center [perspective:1400px]">
          {FEATURED_ALBUMS.map((album, i) => (
            <div
              key={album.name}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="snap-start sm:snap-align-none shrink-0 w-[75vw] sm:w-[22vw] aspect-square rounded-[2vw] sm:rounded-[0.5vw] overflow-hidden drop-shadow-soft bg-secondary cursor-pointer will-change-transform relative group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.image}
                alt={`${album.artist} - ${album.name}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
              />
              <div className="absolute bottom-0 left-0 w-full p-[3.5vw] sm:p-[1.5vw] bg-gradient-to-t from-black/80 via-black/40 to-transparent text-primary">
                <span className="smallText font-medium text-[4.2vw] sm:text-inherit block truncate">{album.name}</span>
                <span className="extraSmallText text-primary/70 text-[3.2vw] sm:text-inherit block truncate">{album.artist} · {album.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Swipe Cue */}
      <div className="layout-grid mt-[1.5vw]">
        <div className="col-span-full flex justify-between items-center text-secondary/40 extraSmallText font-mono">
          <span className="sm:hidden flex items-center gap-[1.5vw] text-[3.2vw]">
            <span>← swipe to explore →</span>
          </span>
          <span className="hidden sm:inline">curated catalogue</span>
          <span className="text-[3vw] sm:text-inherit">0{FEATURED_ALBUMS.length} records</span>
        </div>
      </div>
    </div>
  );
}
