"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface ServiceCategory {
  title: string;
  images: {
    left: string;
    right: string;
  };
}

const CATEGORIES: ServiceCategory[] = [
  {
    title: "film",
    images: {
      left: "/images/services/film1.webp",
      right: "/images/services/film2.webp",
    },
  },
  {
    title: "campaigns",
    images: {
      left: "/images/services/campaign1.webp",
      right: "/images/services/campaign2.webp",
    },
  },
  {
    title: "photography",
    images: {
      left: "/images/services/photography1.webp",
      right: "/images/services/photography2.webp",
    },
  },
  {
    title: "producing",
    images: {
      left: "/images/services/producing1.webp",
      right: "/images/services/producing2.webp",
    },
  },
  {
    title: "strategy",
    images: {
      left: "/images/services/strategy1.webp",
      right: "/images/services/strategy2.webp",
    },
  },
  {
    title: "casting",
    images: {
      left: "/images/services/casting1.webp",
      right: "/images/services/casting2.webp",
    },
  },
];

export function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const leftPhotoRef = useRef<HTMLDivElement>(null);
  const rightPhotoRef = useRef<HTMLDivElement>(null);

  const activeCategory = CATEGORIES[activeIndex];

  // Animate text states on activeIndex change
  useEffect(() => {
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === activeIndex && isHovered) {
        gsap.to(el, {
          scale: 1.045,
          y: "-0.2vw",
          duration: 0.85,
          ease: "elastic.out(0.5, 0.75)",
          overwrite: "auto",
        });
      } else {
        gsap.to(el, {
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });
  }, [activeIndex, isHovered]);

  // Animate photo dock positioning and entrance
  useEffect(() => {
    const activeRow = rowRefs.current[activeIndex];
    const dock = dockRef.current;
    if (!activeRow || !dock) return;

    const rowRect = activeRow.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      const topOffset = rowRect.top - containerRect.top + rowRect.height / 2;
      gsap.to(dock, {
        top: topOffset,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    }

    if (leftPhotoRef.current && rightPhotoRef.current) {
      if (isHovered) {
        gsap.to([leftPhotoRef.current, rightPhotoRef.current], {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
          overwrite: "auto",
        });
      } else {
        gsap.to([leftPhotoRef.current, rightPhotoRef.current], {
          opacity: 0,
          scale: 0.85,
          duration: 0.3,
          ease: "power2.in",
          overwrite: "auto",
        });
      }
    }
  }, [activeIndex, isHovered]);

  // Subtle floating idle bob on images
  useEffect(() => {
    const leftEl = leftPhotoRef.current;
    const rightEl = rightPhotoRef.current;
    if (!leftEl || !rightEl) return;

    const t1 = gsap.to(leftEl, {
      y: "-=8",
      rotate: "+=1.5",
      duration: 2.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    const t2 = gsap.to(rightEl, {
      y: "+=10",
      rotate: "-=1.5",
      duration: 2.8,
      delay: 0.3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    return () => {
      t1.kill();
      t2.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="services"
      data-nav-color="secondary"
      className="w-full sm:h-fit sm:min-h-fit min-h-svh bg-primary text-secondary layout-grid relative pt-[6vw] sm:pt-[4vw] pb-[8vw] select-none"
    >
      {/* Top Header */}
      <div className="col-span-full sm:col-span-12 flex justify-between items-center sm:mt-[2vw]">
        <div>
          <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
            <div className="drop-shadow rounded-[0.25vw]">
              <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
            </div>
            <div>
              <span className="mediumText">how may we help?</span>
            </div>
          </div>
        </div>
        <h2 className="mediumText">services</h2>
      </div>

      {/* Services List with Hover Dock */}
      <div className="col-span-full sm:col-span-12 flex flex-col items-center justify-center mt-[10vw] mb-[7vw] sm:mb-[3vw] relative">
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.title}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            onPointerEnter={() => {
              setActiveIndex(i);
              setIsHovered(true);
            }}
            onPointerLeave={() => setIsHovered(false)}
            className="relative cursor-pointer py-[0.5vw] z-10"
            style={{ lineHeight: 0.95 }}
          >
            <span
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className={`inline-block pointer-events-none text-[11vw] tracking-[-0.03em] will-change-transform transition-colors duration-300 ease-out font-medium ${
                i === activeIndex && isHovered
                  ? "text-yellow"
                  : "text-secondary hover:text-secondary/70"
              }`}
            >
              {cat.title}
            </span>
          </div>
        ))}

        {/* Hover Photo Dock: flanking the active row */}
        <div
          ref={dockRef}
          className="absolute left-0 w-full pointer-events-none -translate-y-1/2 flex justify-between px-[5vw] z-0"
        >
          {/* Left Floating Image */}
          <div
            ref={leftPhotoRef}
            className="w-[20vw] h-[14vw] rounded-[0.4vw] overflow-hidden drop-shadow-soft opacity-0 will-change-transform rotate-[-10deg]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeCategory.images.left}
              alt=""
              className="w-full h-full object-cover select-none"
            />
          </div>

          {/* Right Floating Image */}
          <div
            ref={rightPhotoRef}
            className="w-[22vw] h-[15vw] rounded-[0.4vw] overflow-hidden drop-shadow-soft opacity-0 will-change-transform rotate-[8deg]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeCategory.images.right}
              alt=""
              className="w-full h-full object-cover select-none"
            />
          </div>
        </div>
      </div>

      <div className="w-full border-t border-secondary/10 col-span-full mt-[5.5vw] mb-[3vw]" />
    </div>
  );
}
