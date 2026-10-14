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

const LABELS = [
  { name: "Warp Records", tagline: "Sheffield / London" },
  { name: "4AD", tagline: "London" },
  { name: "Sub Pop", tagline: "Seattle" },
  { name: "Rough Trade", tagline: "London" },
  { name: "Blue Note", tagline: "New York" },
  { name: "Matador Records", tagline: "New York" },
  { name: "Ninja Tune", tagline: "London" },
  { name: "Domino", tagline: "London" },
  { name: "XL Recordings", tagline: "London" },
  { name: "Ghostly Int.", tagline: "Ann Arbor / NY" },
  { name: "Stones Throw", tagline: "Los Angeles" },
  { name: "Third Man", tagline: "Nashville / Detroit" },
];

export function WorkCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const scroller = container.closest("main") || window;

    const ctx = gsap.context(() => {
      // Parallax scroll scrub
      gsap.to(content, {
        y: "20svh",
        ease: "none",
        scrollTrigger: {
          trigger: container,
          scroller: scroller,
          start: "center center",
          end: "bottom top",
          scrub: true,
        },
      });

      // Floating wave animation on album cards
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: i % 2 === 0 ? -12 : 12,
          duration: 2.5 + i * 0.3,
          delay: i * 0.2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
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

  return (
    <div ref={containerRef} className="w-full h-full relative select-none">
      {/* 3D Horizontal Carousel */}
      <div className="w-full overflow-x-auto hide-scrollbar py-[4vw] px-[var(--margin)]">
        <div className="flex gap-[2.5vw] w-fit items-center [perspective:1400px]">
          {FEATURED_ALBUMS.map((album, i) => (
            <div
              key={album.name}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="w-[32vw] sm:w-[22vw] aspect-square rounded-[0.5vw] overflow-hidden drop-shadow-soft bg-secondary cursor-pointer shrink-0 will-change-transform relative group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.image}
                alt={`${album.artist} - ${album.name}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 w-full p-[1.5vw] bg-gradient-to-t from-black/80 via-black/40 to-transparent text-primary">
                <span className="smallText font-medium block truncate">{album.name}</span>
                <span className="extraSmallText text-primary/70 block truncate">{album.artist} · {album.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Content & Client Labels */}
      <div
        ref={contentRef}
        id="records"
        data-nav-color="secondary"
        className="relative z-0 w-full h-fit bg-primary text-secondary layout-grid pb-[calc(5vw+8svh)] pt-[4vw]"
      >
        <div className="col-span-full sm:col-span-12 flex justify-between items-center mb-[4vw]">
          <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
            <div className="drop-shadow rounded-[0.25vw]">
              <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
            </div>
            <span className="mediumText">curated catalog</span>
          </div>
          <h2 className="mediumText">records</h2>
        </div>

        {/* 12 Iconic Labels Grid */}
        <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-[2vw] items-center justify-items-center py-[3vw] border-y border-secondary/10">
          {LABELS.map((label) => (
            <div
              key={label.name}
              className="w-full h-[5vw] flex flex-col items-center justify-center text-center p-[0.5vw] border border-secondary/10 rounded-[0.3vw] hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-300 group cursor-default"
            >
              <span className="smallText font-medium text-secondary/80 group-hover:text-secondary truncate w-full">
                {label.name}
              </span>
              <span className="detailText text-secondary/40 font-mono text-[0.75vw]">
                {label.tagline}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
