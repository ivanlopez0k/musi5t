"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function bezier(start: number, ctrl: number, unit: string) {
  return (value: string) => {
    const t = parseFloat(value) / start;
    return t * t * start + 2 * t * (1 - t) * ctrl + unit;
  };
}

export function HeroPhotos() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Center
  const centerScrollRef = useRef<HTMLDivElement>(null);
  const centerVelRef = useRef<HTMLDivElement>(null);
  const centerFloatRef = useRef<HTMLDivElement>(null);
  const centerBobRef = useRef<HTMLDivElement>(null);

  // Left
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const leftVelRef = useRef<HTMLDivElement>(null);
  const leftFloatRef = useRef<HTMLDivElement>(null);
  const leftBobRef = useRef<HTMLDivElement>(null);

  // Right
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const rightVelRef = useRef<HTMLDivElement>(null);
  const rightFloatRef = useRef<HTMLDivElement>(null);
  const rightBobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const centerScroll = centerScrollRef.current;
    const centerFloat = centerFloatRef.current;
    const centerBob = centerBobRef.current;

    const leftScroll = leftScrollRef.current;
    const leftFloat = leftFloatRef.current;
    const leftBob = leftBobRef.current;

    const rightScroll = rightScrollRef.current;
    const rightFloat = rightFloatRef.current;
    const rightBob = rightBobRef.current;

    if (
      !centerScroll ||
      !centerFloat ||
      !centerBob ||
      !leftScroll ||
      !leftFloat ||
      !leftBob ||
      !rightScroll ||
      !rightFloat ||
      !rightBob
    )
      return;

    const isDesktop = window.innerWidth >= 640;
    const scroller = root.closest("main") || window;

    const ctx = gsap.context(() => {
      // Set initial 3D perspectives and origins
      gsap.set(
        [
          centerScroll,
          centerFloat,
          centerBob,
          leftScroll,
          leftFloat,
          leftBob,
          rightScroll,
          rightFloat,
          rightBob,
        ],
        {
          transformPerspective: isDesktop ? 1400 : 800,
          transformOrigin: "50% 50%",
          force3D: true,
        }
      );

      // Initial offscreen positions for quadratic Bezier fly-in
      const centerStartY = isDesktop ? 75 : 58;
      const centerStartZ = isDesktop ? 140 : 80;
      const centerCtrlZ = isDesktop ? -200 : -120;

      const leftStartY = isDesktop ? 78 : 64;
      const leftStartZ = isDesktop ? 170 : 100;
      const leftCtrlZ = isDesktop ? -260 : -150;

      const rightStartY = isDesktop ? 75 : 61;
      const rightStartZ = isDesktop ? 160 : 90;
      const rightCtrlZ = isDesktop ? -230 : -135;

      gsap.set(centerFloat, {
        y: `${centerStartY}vh`,
        z: centerStartZ,
        rotateX: 62,
        rotateZ: 4,
      });

      gsap.set(leftFloat, {
        y: `${leftStartY}vh`,
        z: leftStartZ,
        rotateX: 62,
        rotateZ: -16,
      });

      gsap.set(rightFloat, {
        y: `${rightStartY}vh`,
        z: rightStartZ,
        rotateX: 62,
        rotateZ: 16,
      });

      // Fly-in timeline with quadratic Bezier trajectory and elastic settle
      const flyTl = gsap.timeline();

      flyTl.to(
        centerFloat,
        {
          y: "0vh",
          z: 0,
          rotationX: 0,
          rotation: 0,
          duration: 1.7,
          ease: "elastic.out(0.5, 0.75)",
          modifiers: {
            y: bezier(centerStartY, centerStartY * 0.55, "vh"),
            z: bezier(centerStartZ, centerCtrlZ, "px"),
          },
        },
        0.52
      );

      flyTl.to(
        leftFloat,
        {
          y: "0vh",
          z: 0,
          rotationX: 0,
          rotation: -8,
          duration: 1.7,
          ease: "elastic.out(0.5, 0.75)",
          modifiers: {
            y: bezier(leftStartY, leftStartY * 0.55, "vh"),
            z: bezier(leftStartZ, leftCtrlZ, "px"),
          },
        },
        0.58
      );

      flyTl.to(
        rightFloat,
        {
          y: "0vh",
          z: 0,
          rotationX: 0,
          rotation: 7,
          duration: 1.7,
          ease: "elastic.out(0.5, 0.75)",
          modifiers: {
            y: bezier(rightStartY, rightStartY * 0.55, "vh"),
            z: bezier(rightStartZ, rightCtrlZ, "px"),
          },
        },
        0.64
      );

      // Continuous Idle Floating Bob
      gsap.to(centerBob, {
        y: isDesktop ? 14 : 8,
        rotateZ: "+=1.6",
        duration: 2.2,
        delay: 0.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(leftBob, {
        y: isDesktop ? 22 : 12,
        rotateZ: "-=1.4",
        duration: 3.1,
        delay: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(rightBob, {
        y: isDesktop ? 18 : 10,
        rotateZ: "+=1.2",
        duration: 2.6,
        delay: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Scroll Scrub Parallax + 3D Rotation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: root.closest("#hero") || root,
          scroller: scroller,
          start: "top top",
          end: "bottom top",
          scrub: 1.6,
        },
      });

      scrollTl
        .to(
          centerScroll,
          {
            y: isDesktop ? "-18vw" : "-12vw",
            scale: 1.04,
            rotate: 1.5,
            rotateX: -45,
            ease: "none",
          },
          0
        )
        .to(
          leftScroll,
          {
            y: isDesktop ? "-28vw" : "-18vw",
            x: isDesktop ? "-8vw" : "-4vw",
            rotate: isDesktop ? -10 : -6,
            scale: 0.92,
            rotateX: -45,
            rotateY: 95,
            ease: "none",
          },
          0
        )
        .to(
          rightScroll,
          {
            y: isDesktop ? "-22vw" : "-14vw",
            x: isDesktop ? "10vw" : "5vw",
            rotate: isDesktop ? 9 : 5,
            scale: 0.94,
            rotateX: -35,
            rotateY: -65,
            ease: "none",
          },
          0
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="w-fit h-fit z-10 absolute top-[calc(28%+10vw)] left-1/2 -translate-x-1/2 [perspective:1600px] pointer-events-none select-none"
    >
      {/* Center Card — Tame Impala: Currents */}
      <div
        ref={centerScrollRef}
        className="will-change-transform [transform-style:preserve-3d]"
      >
        <div
          ref={centerVelRef}
          className="will-change-transform [transform-style:preserve-3d]"
        >
          <div
            ref={centerFloatRef}
            className="will-change-transform [transform-style:preserve-3d]"
          >
            <div
              ref={centerBobRef}
              className="will-change-transform [transform-style:preserve-3d]"
            >
              <div className="drop-shadow-soft w-[38vw] h-[25vw] rounded-[0.5vw] overflow-hidden bg-yellow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/musi5t/hero_center.webp"
                  alt="Tame Impala - Currents"
                  className="w-full h-full object-cover select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Card — Kendrick Lamar: GKMC */}
      <div className="w-[14vw] h-[9vw] absolute top-1/2 -left-1/3 -translate-x-1/3 -translate-y-1/2 [transform-style:preserve-3d]">
        <div
          ref={leftScrollRef}
          className="w-full h-full will-change-transform [transform-style:preserve-3d]"
        >
          <div
            ref={leftVelRef}
            className="w-full h-full will-change-transform [transform-style:preserve-3d]"
          >
            <div
              ref={leftFloatRef}
              className="w-full h-full will-change-transform [transform-style:preserve-3d]"
            >
              <div
                ref={leftBobRef}
                className="w-full h-full will-change-transform [transform-style:preserve-3d]"
              >
                <div className="drop-shadow-soft w-full h-full rounded-[0.2vw] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/musi5t/hero_left.webp"
                    alt="Kendrick Lamar - GKMC"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Card — Daft Punk: Random Access Memories */}
      <div className="w-[15vw] h-[10vw] absolute top-4/5 right-[-25%] translate-x-[25%] -translate-y-4/5 [transform-style:preserve-3d]">
        <div
          ref={rightScrollRef}
          className="w-full h-full will-change-transform [transform-style:preserve-3d]"
        >
          <div
            ref={rightVelRef}
            className="w-full h-full will-change-transform [transform-style:preserve-3d]"
          >
            <div
              ref={rightFloatRef}
              className="w-full h-full will-change-transform [transform-style:preserve-3d]"
            >
              <div
                ref={rightBobRef}
                className="w-full h-full will-change-transform [transform-style:preserve-3d]"
              >
                <div className="drop-shadow-soft w-full h-full rounded-[0.2vw] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/musi5t/hero_right.webp"
                    alt="Daft Punk - Random Access Memories"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
