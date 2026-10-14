"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { SidePlayer } from "@/components/landing/SidePlayer";
import { Header } from "@/components/landing/Header";
import { HeroPhotos } from "@/components/landing/HeroPhotos";
import { Services } from "@/components/landing/Services";
import { WorkCarousel } from "@/components/landing/WorkCarousel";
import { FaqList } from "@/components/landing/FaqList";

const PROCESS_STEPS = [
  {
    number: 1,
    title: "Start with the job",
    image: "/images/process1.webp",
    description:
      "Whether you're at the idea stage or already have a concept locked in, we get under the brief and work out what the job actually needs: the scope, the ambition, the timing, and what success looks like when it's done.",
  },
  {
    number: 2,
    title: "Build the crew",
    image: "/images/process2.webp",
    description:
      "No fixed team. Just the right one. We pull together photographers, filmmakers, stylists, designers, producers and whoever else the idea needs from our wider network, building a specialist crew around each project rather than forcing every brief through the same people.",
  },
  {
    number: 3,
    title: "Own the production",
    image: "/images/process3.webp",
    description:
      "We run it from call time to wrap. Creative direction, shoots, content, events, activations and everything in between. You get the work delivered and production handled properly, not a list of freelancers to coordinate yourself.",
  },
];

export default function Home() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parallax ref sections
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const faqContainerRef = useRef<HTMLDivElement>(null);

  // Lenis & ScrollTrigger Initialization
  useEffect(() => {
    const mainEl = mainRef.current;
    const contentEl = contentRef.current;
    if (!mainEl || !contentEl) return;

    const lenis = new Lenis({
      wrapper: mainEl,
      content: contentEl,
      lerp: 0.18,
      wheelMultiplier: 1.05,
      smoothWheel: true,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const rafHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafHandler);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Keyboard shortcut: press 'm' to toggle player, 'Escape' to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "m" || e.key === "M") {
        setIsPlayerOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isPlayerOpen) {
        setIsPlayerOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlayerOpen]);

  // Hero Wordmark 3D Char Flip & Parallax scrub
  useEffect(() => {
    const scroller = mainRef.current;
    if (!scroller) return;

    const ctx = gsap.context(() => {
      // Hero wordmark 3D char flip on entrance
      gsap.from(".hero-char", {
        yPercent: -125,
        rotateX: -50,
        scaleY: 1.4,
        opacity: 0,
        duration: 1.3,
        delay: 0.35,
        stagger: { each: 0.025, from: "edges" },
        ease: "elastic.out(0.5, 0.7)",
      });

      // About Section Scroll Scrub
      if (aboutRef.current) {
        gsap.to(aboutRef.current, {
          y: "20svh",
          ease: "none",
          scrollTrigger: {
            trigger: aboutRef.current,
            scroller: scroller,
            start: "center bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // FAQ Section Scroll Scrub
      if (faqContainerRef.current) {
        gsap.to(faqContainerRef.current, {
          y: "10svh",
          ease: "none",
          scrollTrigger: {
            trigger: faqContainerRef.current,
            scroller: scroller,
            start: "center center",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const scrollTo = (hash: string) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(hash, { duration: 1.2 });
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`site-frame text-secondary ${
        isPlayerOpen ? "panel-open" : ""
      }`}
    >
      {/* 1:1 Sidejob Music Player Drawer */}
      <SidePlayer
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />

      {/* Main Foreground Layout */}
      <div className="site-layout">
        <div className="app">
          <div className="route-surface">
            {/* Header */}
            <Header onOpenPlayer={() => setIsPlayerOpen(true)} />

            {/* Scrollable Container managed by Lenis */}
            <main
              ref={mainRef}
              id="swup"
              className="transition-swup hide-scrollbar"
              tabIndex={-1}
            >
              <div ref={contentRef}>
                {/* 1. HERO SECTION */}
                <div
                  ref={heroRef}
                  id="hero"
                  data-nav-color="primary"
                  className="w-full h-lvh bg-primary flex items-end relative overflow-hidden select-none"
                >
                  {/* Giant 3D Hero Wordmark */}
                  <h1 className="inline-block whitespace-nowrap will-change-transform text-[30vw] md:text-[20vw] tracking-[-0.07em] absolute top-[26%] left-1/2 -translate-x-1/2 translate-y-[-30%] leading-none text-secondary select-none pointer-events-none [perspective:1400px]">
                    {"sidejob".split("").map((char, i) => (
                      <span
                        key={i}
                        className="hero-char inline-block will-change-transform [transform-style:preserve-3d]"
                        style={{ transformOrigin: "50% 100%" }}
                      >
                        {char}
                      </span>
                    ))}
                  </h1>

                  {/* 3D Floating Collage with quadratic Bezier fly-in */}
                  <HeroPhotos />

                  {/* Bottom Grid Info */}
                  <div className="w-full h-fit layout-grid mb-[2vw] z-20 pointer-events-auto">
                    <div className="z-0 sm:col-span-3 col-span-4 extraSmallTextBold mb-[10vw] sm:mb-0">
                      A creative production agency bringing together the right
                      people to make campaigns, content and experiences that get
                      noticed.
                    </div>
                    <div className="mb-[15vw] sm:mb-0 sm:col-span-4 col-span-6 sm:col-start-10 flex items-end md:justify-end space-x-2 whitespace-nowrap extraSmallTextBold">
                      <div>Based in Oslo, Norway</div>
                      <div className="w-[3vw] flex items-center justify-center">
                        |
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollTo("#about")}
                        className="hover:opacity-75 transition-opacity cursor-pointer font-medium"
                      >
                        Scroll to explore ↓
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. ABOUT SECTION (Dark) */}
                <div
                  ref={aboutRef}
                  id="about"
                  data-nav-color="primary"
                  className="w-full h-fit bg-secondary text-primary pb-[8vw] sm:pb-[calc(3vw+15svh)] relative pt-[6vw] sm:pt-[4vw] select-none"
                >
                  <div className="layout-grid w-full">
                    <h2 className="z-0 col-span-full sm:col-span-6 mediumText font-light leading-snug">
                      sidejob is an independent creative production agency
                      building specialist teams for campaigns, content and
                      experiences. No fixed team. Just the right one for each
                      job.
                    </h2>
                  </div>

                  <div className="w-full layout-grid">
                    <div className="w-full border-t border-primary/10 col-span-full mt-[10vw] mb-[6vw] sm:mt-[5.5vw] sm:mb-[3vw]" />

                    {/* Left Column: Image with tag */}
                    <div className="col-span-full sm:col-span-6 relative self-stretch flex flex-col sm:mb-[3vw]">
                      <div className="hidden sm:flex items-center gap-[1vw] mb-[3vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div className="w-[1.8vw] h-[1.8vw] rounded-[0.2vw] bg-yellow" />
                        </div>
                        <span className="mediumText">working with you</span>
                      </div>

                      <div className="relative w-full sm:flex-1 sm:min-h-[16vw]">
                        <div className="drop-shadow w-full bg-primary sm:w-[24vw] h-[50vw] sm:h-[16vw] overflow-hidden rounded-[0.5vw] sm:rounded-[0.25vw]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/hero1.webp"
                            alt="Working with you"
                            className="w-full h-full object-cover bg-yellow opacity-90 select-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: 3 Paragraphs */}
                    <div className="col-span-full sm:col-span-4 flex flex-col mt-[8vw] sm:mt-0 mb-[5vw]">
                      <div className="flex flex-col gap-[2.5vw] sm:gap-[1vw] mb-[10vw] sm:mb-[6vw]">
                        <h3 className="smallText font-medium">Not an agency</h3>
                        <p className="extraSmallText opacity-60 leading-relaxed">
                          We&apos;re not a traditional agency, talent marketplace
                          or freelancer collective. We keep a small production
                          core and work with a wider network of independent
                          creatives, building the right crew around each project
                          and owning the delivery of the work.
                        </p>
                      </div>

                      <div className="flex flex-col gap-[2.5vw] sm:gap-[1vw] mb-[10vw] sm:mb-[6vw]">
                        <h3 className="smallText font-medium">Crew per project</h3>
                        <p className="extraSmallText opacity-60 leading-relaxed">
                          Every brief gets its own shape and its own people.
                          Photographers, filmmakers, stylists, designers,
                          producers, casting talent and editors are assembled
                          around the idea, not pulled from a fixed roster or
                          forced through the same in-house team every time.
                        </p>
                      </div>

                      <div className="flex flex-col gap-[2.5vw] sm:gap-[1vw]">
                        <h3 className="smallText font-medium">From concept to wrap</h3>
                        <p className="extraSmallText opacity-60 leading-relaxed">
                          We can be involved from the very start or brought in
                          once a concept already exists. Creative direction,
                          strategy, casting, shoots, content, events and
                          activations. However we get involved, we run production
                          properly and get the work over the line.
                        </p>
                      </div>

                      <div className="w-fit text-secondary mt-[4vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <a href="#about" className="main-btn smallText">
                            <span className="main-btn__icon" aria-hidden="true" />
                            <span className="main-btn__label">
                              <span className="main-btn__clip">
                                <span className="main-btn__from">
                                  Talk to us
                                </span>
                                <span className="main-btn__to" aria-hidden="true">
                                  Talk to us
                                </span>
                              </span>
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. SERVICES SECTION (Interactive with photo dock) */}
                <Services />

                {/* 4. WORK SECTION (3D Horizontal Carousel & Logos) */}
                <WorkCarousel />

                {/* 5. PROCESS SECTION (Dark) */}
                <div
                  id="process"
                  data-nav-color="primary"
                  className="w-full h-fit bg-secondary text-primary layout-grid py-[8vw] sm:py-[6vw] select-none"
                >
                  <div className="col-span-full flex justify-between items-center mb-[4vw]">
                    <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                      <div className="drop-shadow rounded-[0.25vw]">
                        <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                      </div>
                      <span className="mediumText">how we work</span>
                    </div>
                    <h2 className="mediumText">process</h2>
                  </div>

                  {PROCESS_STEPS.map((step, idx) => (
                    <div
                      key={step.number}
                      className={`col-span-full layout-grid py-[5vw] sm:py-[4vw] border-t border-primary/10 ${
                        idx === PROCESS_STEPS.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="col-span-2 sm:col-span-1">
                        <span className="largeText text-yellow font-light">
                          0{step.number}
                        </span>
                      </div>

                      <div className="col-span-4 sm:col-span-4 flex flex-col gap-[1vw]">
                        <h3 className="mediumText font-medium">{step.title}</h3>
                        <p className="extraSmallText text-primary/60 leading-relaxed pr-[2vw]">
                          {step.description}
                        </p>
                      </div>

                      <div className="col-span-6 sm:col-span-6 sm:col-start-7 mt-[4vw] sm:mt-0">
                        <div className="w-full aspect-[16/10] rounded-[0.5vw] overflow-hidden drop-shadow-soft">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-full object-cover select-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 6. FAQ SECTION (Light) */}
                <div
                  ref={faqContainerRef}
                  id="faq"
                  data-nav-color="secondary"
                  className="w-full bg-primary py-[10vw] sm:pt-[6vw] pb-[calc(5vw+5svh)] select-none"
                >
                  <div className="layout-grid text-secondary mb-[8vw] sm:mb-[6vw]">
                    <div className="col-span-full sm:col-span-3 flex flex-col gap-[1vw]">
                      <span className="smallText font-medium">Unlimited team</span>
                      <span className="extraSmallText text-secondary/50">
                        build the right crew around each project, bringing
                        together independent creatives.
                      </span>
                    </div>

                    <div className="col-span-full sm:col-span-6 sm:col-start-6">
                      <div className="largeText font-medium leading-none">
                        no fixed team,
                        <br />
                        just the right one
                      </div>
                    </div>
                  </div>

                  <div className="w-full layout-grid">
                    <div className="col-span-full border-t border-secondary/10 mb-[4vw]" />

                    {/* Left Column: Any Questions Badge + FAQ Image */}
                    <div className="col-span-full sm:col-span-4 self-stretch flex flex-col">
                      <div className="flex items-center gap-[1.5vw] sm:gap-[1vw] mb-[3vw]">
                        <div className="drop-shadow rounded-[0.25vw]">
                          <div className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] rounded-[0.5vw] sm:rounded-[0.2vw] bg-yellow" />
                        </div>
                        <h2 className="mediumText">any questions?</h2>
                      </div>

                      <div className="w-full sm:w-[24vw] h-[50vw] sm:h-[16vw] rounded-[0.5vw] sm:rounded-[0.25vw] overflow-hidden drop-shadow mb-[6vw] sm:mb-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/faq.webp"
                          alt="FAQ illustration"
                          className="w-full h-full object-cover select-none"
                        />
                      </div>
                    </div>

                    {/* Right Column: Accordion */}
                    <div className="col-span-full sm:col-span-7 sm:col-start-6">
                      <FaqList />
                    </div>
                  </div>
                </div>

                {/* 7. LANDING CTA BANNER (Dark) */}
                <div
                  id="cta"
                  data-nav-color="primary"
                  className="w-full bg-secondary text-primary py-[10vw] sm:py-[8vw] layout-grid select-none"
                >
                  <div className="col-span-full flex flex-col items-center justify-center text-center gap-[3vw]">
                    <h2 className="largeText font-light">
                      Got a project in mind?
                    </h2>
                    <div className="drop-shadow rounded-[0.25vw] scale-125 mt-[2vw]">
                      <a href="mailto:hello@itsasidejob.com" className="main-btn smallText text-secondary">
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">Talk to us</span>
                            <span className="main-btn__to" aria-hidden="true">
                              Talk to us
                            </span>
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 8. FOOTER (Dark) */}
                <footer className="w-full bg-secondary text-primary layout-grid pt-[6vw] pb-[4vw] border-t border-primary/10 select-none">
                  {/* Email contact links */}
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[8vw] sm:mb-0">
                    <span className="extraSmallText text-primary/40 font-mono">
                      direct contact
                    </span>
                    <div className="flex flex-col gap-[0.5vw]">
                      <a
                        href="mailto:hello@itsasidejob.com"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                      >
                        hello@itsasidejob.com
                      </a>
                      <a
                        href="mailto:booking@itsasidejob.com"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300"
                      >
                        booking@itsasidejob.com
                      </a>
                    </div>
                  </div>

                  {/* Back to top button */}
                  <div className="col-span-full sm:col-span-4 flex items-center justify-center mb-[8vw] sm:mb-0">
                    <button
                      type="button"
                      onClick={() => scrollTo("#hero")}
                      className="back-to-top extraSmallText text-primary/60 hover:text-primary cursor-pointer hover:scale-105 transition-transform"
                    >
                      <span className="back-to-top__clip">
                        <span className="back-to-top__from">
                          <span className="back-to-top__arrow mr-1">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                        <span className="back-to-top__to" aria-hidden="true">
                          <span className="back-to-top__arrow mr-1">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* Copyright & Legal */}
                  <div className="col-span-full sm:col-span-4 flex flex-col sm:items-end justify-between gap-[1vw]">
                    <span className="detailText text-primary/40">
                      © 2026 sidejob. All rights reserved.
                    </span>
                    <div className="flex gap-[1vw] detailText text-primary/50">
                      <a href="#about" className="hover:text-primary transition-colors">
                        privacy
                      </a>
                      <span>,</span>
                      <a href="#about" className="hover:text-primary transition-colors">
                        terms of use
                      </a>
                      <span>,</span>
                      <span className="opacity-40">musi5t core</span>
                    </div>
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
