"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface Project {
  name: string;
  image: string;
  alt: string;
}

const PROJECTS: Project[] = [
  {
    name: "Geir Ness",
    image: "/images/work1.webp",
    alt: "Geir Ness packaging beside a puffin against a snowy fjord landscape",
  },
  {
    name: "Varsity Headwear",
    image: "/images/work2.webp",
    alt: "Varsity Headwear fashion image with a model in a library",
  },
  {
    name: "Holzweiler",
    image: "/images/work3.webp",
    alt: "Holzweiler wordmark on a red cushion surrounded by sculptural red shapes",
  },
  {
    name: "Tom Wood",
    image: "/images/work4.webp",
    alt: "Tom Wood silver rings and chain displayed on stone beside a model's hand",
  },
];

const LOGOS = [
  { name: "Acne Studios", image: "/images/logos/acne-studios.svg" },
  { name: "Carhartt WIP", image: "/images/logos/carhartt-wip.svg" },
  { name: "Ganni", image: "/images/logos/ganni.svg" },
  { name: "Holzweiler", image: "/images/logos/holzweiler.svg" },
  { name: "Marimekko", image: "/images/logos/marimekko.svg" },
  { name: "Norrøna", image: "/images/logos/norrona.svg" },
  { name: "Oatly", image: "/images/logos/oatly.svg" },
  { name: "On Running", image: "/images/logos/on-running.svg" },
  { name: "Our Legacy", image: "/images/logos/our-legacy.svg" },
  { name: "Peak Performance", image: "/images/logos/peak-performance.svg" },
  { name: "Sonos", image: "/images/logos/sonos.svg" },
  { name: "Toteme", image: "/images/logos/toteme.svg" },
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

      // Floating wave animation on project cards
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
          {PROJECTS.map((proj, i) => (
            <div
              key={proj.name}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="w-[32vw] sm:w-[22vw] aspect-[3/4] rounded-[0.5vw] overflow-hidden drop-shadow-soft bg-gray-100 cursor-pointer shrink-0 will-change-transform relative group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proj.image}
                alt={proj.alt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 w-full p-[1.5vw] bg-gradient-to-t from-black/60 to-transparent text-primary">
                <span className="smallText font-medium">{proj.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Content & Client Logos */}
      <div
        ref={contentRef}
        id="work"
        data-nav-color="secondary"
        className="relative z-0 w-full h-fit bg-primary text-secondary layout-grid pb-[calc(5vw+8svh)] pt-[4vw]"
      >
        <div className="col-span-full sm:col-span-12 flex justify-between items-center mb-[4vw]">
          <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
            <div className="drop-shadow rounded-[0.25vw]">
              <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
            </div>
            <span className="mediumText">selected clients</span>
          </div>
          <h2 className="mediumText">work</h2>
        </div>

        {/* 12 Client Logos Grid */}
        <div className="col-span-full grid grid-cols-3 sm:grid-cols-6 gap-[3vw] sm:gap-[2vw] items-center justify-items-center py-[3vw] border-y border-secondary/10">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="w-[10vw] sm:w-[7vw] h-[4vw] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.image}
                alt={logo.name}
                className="max-h-full max-w-full object-contain filter grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
