"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis-store";
import { setupNavColorTriggers } from "@/lib/nav-theme";
import { Header } from "@/components/landing/Header";
import { HeroPhotos } from "@/components/landing/HeroPhotos";
import { Services } from "@/components/landing/Services";
import { WorkCarousel } from "@/components/landing/WorkCarousel";
import { FaqList } from "@/components/landing/FaqList";
import {
  StepCurateCollage,
  StepConnectAnimation,
  StepDiscussPost,
} from "@/components/landing/HowItWorksVisuals";

const PROCESS_STEPS = [
  {
    number: 1,
    title: "Curate your Top 5",
    image: "/images/musi5t/process_curate.webp",
    description:
      "Search our MusicBrainz and Cover Art catalog. Pick your 5 essential albums and 5 all-time songs. Choose the exact vinyl edition, Japanese pressing, or original sleeve that defines your connection to each record.",
  },
  {
    number: 2,
    title: "Connect through records",
    image: "/images/musi5t/process_connect.webp",
    description:
      "Follow albums to tune your personal timeline. Whenever someone posts about an album in your Top 5 or a record you track, their insights appear directly in your 'For You' feed. Taste-matching made organic.",
  },
  {
    number: 3,
    title: "Join the conversation",
    image: "/images/musi5t/process_discuss.webp",
    description:
      "Publish thoughts targeted to specific albums (#album) or share globally. No noise, no algorithmic clickbait—just authentic discussion with people who cherish the exact same soundscapes.",
  },
];

export function LandingPageClient() {
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

    const cleanupNav = setupNavColorTriggers(mainEl);

    const rafHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cleanupNav();
      gsap.ticker.remove(rafHandler);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

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
    <div className="site-frame text-secondary">
      {/* Main Foreground Layout */}
      <div className="site-layout">
        <div className="app">
          <div className="route-surface">
            {/* Header */}
            <Header />

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
                  data-nav-color="secondary"
                  className="w-full h-lvh bg-primary flex items-end relative overflow-hidden select-none"
                >
                  {/* Giant 3D Hero Wordmark */}
                  <h1 className="inline-block whitespace-nowrap will-change-transform text-[26vw] sm:text-[30vw] md:text-[20vw] tracking-[-0.07em] absolute top-[26%] left-1/2 -translate-x-1/2 translate-y-[-30%] leading-none text-secondary select-none pointer-events-none [perspective:1400px]">
                    {"musi5t".split("").map((char, i) => (
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
                    <div className="col-span-full sm:col-span-4 extraSmallTextBold text-[3.8vw] sm:text-inherit mb-[3vw] sm:mb-0 leading-relaxed">
                      A social platform built around albums, not accounts. Share
                      your Top 5 records, discover music through shared taste, and
                      join discussions centered on albums.
                    </div>
                    <div className="col-span-full sm:col-span-4 sm:col-start-9 flex items-center justify-between sm:justify-end space-x-2 whitespace-nowrap extraSmallTextBold text-[3.6vw] sm:text-inherit mb-[4vw] sm:mb-0">
                      <div>Built for true listeners</div>
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
                    <h2 className="z-0 col-span-full sm:col-span-6 mediumText font-light leading-snug text-[5.5vw] sm:text-inherit">
                      musi5t is an independent music platform built around albums,
                      not accounts. Your Top 5 defines your identity; your posts
                      reach the people who love the exact same records.
                    </h2>
                  </div>

                  <div className="w-full layout-grid">
                    <div className="w-full border-t border-primary/10 col-span-full mt-[10vw] mb-[6vw] sm:mt-[5.5vw] sm:mb-[3vw]" />

                    {/* Left Column: Image with tag */}
                    <div className="col-span-full sm:col-span-6 relative self-stretch flex flex-col sm:mb-[3vw]">
                      <div className="flex items-center gap-[2vw] sm:gap-[1vw] mb-[3vw]">
                        <div className="drop-shadow rounded-[0.5vw] sm:rounded-[0.25vw]">
                          <div className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] rounded-[1vw] sm:rounded-[0.2vw] bg-yellow" />
                        </div>
                        <span className="mediumText text-[4.8vw] sm:text-inherit">album-first social</span>
                      </div>

                      <div className="relative w-full sm:flex-1 sm:min-h-[16vw]">
                        <div className="drop-shadow w-full h-[52vw] sm:w-[24vw] sm:h-[16vw] bg-primary overflow-hidden rounded-[2vw] sm:rounded-[0.25vw]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/musi5t/about_vinyl.webp"
                            alt="Spinning vinyl"
                            className="w-full h-full object-cover bg-yellow opacity-90 select-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: 3 Paragraphs */}
                    <div className="col-span-full sm:col-span-4 flex flex-col mt-[6vw] sm:mt-0 mb-[5vw] gap-[6vw] sm:gap-[3vw]">
                      <div className="flex flex-col gap-[1.5vw] sm:gap-[1vw]">
                        <h3 className="smallText font-medium text-[4.5vw] sm:text-inherit">Not an algorithm</h3>
                        <p className="extraSmallText opacity-60 leading-relaxed text-[3.6vw] sm:text-inherit">
                          No opaque feeds or follower popularity contests. Your feed
                          is curated strictly by the albums you care about and the
                          people who share your taste. High-signal music culture.
                        </p>
                      </div>

                      <div className="flex flex-col gap-[1.5vw] sm:gap-[1vw]">
                        <h3 className="smallText font-medium text-[4.5vw] sm:text-inherit">Top 5 as identity</h3>
                        <p className="extraSmallText opacity-60 leading-relaxed text-[3.6vw] sm:text-inherit">
                          Every member curates their definitive Top 5 Albums and
                          Top 5 Songs. Pick your preferred pressing, deluxe
                          edition, and artwork version to showcase your musical DNA.
                        </p>
                      </div>

                      <div className="flex flex-col gap-[1.5vw] sm:gap-[1vw]">
                        <h3 className="smallText font-medium text-[4.5vw] sm:text-inherit">Posts targeted to records</h3>
                        <p className="extraSmallText opacity-60 leading-relaxed text-[3.6vw] sm:text-inherit">
                          When you write, choose whether your thoughts belong to the
                          global feed or to specific album communities (#album).
                          Direct, authentic conversations around sound.
                        </p>
                      </div>

                      <div className="w-fit text-secondary mt-[2vw] sm:mt-[4vw]">
                        <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                          <Link
                            href="/register"
                            className="main-btn smallText !px-[4vw] sm:!px-[0.6vw] !py-[2vw] sm:!py-[0.25vw] !gap-[2vw] sm:!gap-[0.5vw]"
                          >
                            <span className="main-btn__icon" aria-hidden="true" />
                            <span className="main-btn__label">
                              <span className="main-btn__clip">
                                <span className="main-btn__from">
                                  Join musi5t
                                </span>
                                <span className="main-btn__to" aria-hidden="true">
                                  Join musi5t
                                </span>
                              </span>
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. FEATURES SECTION (Interactive with artwork dock) */}
                <Services />

                {/* 4. RECORDS SECTION (3D Horizontal Carousel & Labels) */}
                <WorkCarousel />

                {/* 5. HOW IT WORKS SECTION (Dark) */}
                <div
                  id="how-it-works"
                  data-nav-color="primary"
                  className="w-full h-fit bg-secondary text-primary layout-grid py-[8vw] sm:py-[6vw] select-none"
                >
                  <div className="col-span-full flex justify-between items-center mb-[4vw]">
                    <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                      <div className="drop-shadow rounded-[0.25vw]">
                        <div className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] rounded-[1vw] sm:rounded-[0.2vw] bg-yellow" />
                      </div>
                      <span className="mediumText text-[4.8vw] sm:text-inherit">how it works</span>
                    </div>
                    <h2 className="mediumText text-[4.8vw] sm:text-inherit">the loop</h2>
                  </div>

                  {PROCESS_STEPS.map((step, idx) => (
                    <div
                      key={step.number}
                      className={`col-span-full layout-grid py-[5vw] sm:py-[4vw] border-t border-primary/10 ${
                        idx === PROCESS_STEPS.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <div className="col-span-full sm:col-span-1">
                        <span className="largeText text-yellow font-light text-[10vw] sm:text-inherit">
                          0{step.number}
                        </span>
                      </div>

                      <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] sm:gap-[1vw] mt-[1vw] sm:mt-0">
                        <h3 className="mediumText font-medium text-[5.8vw] sm:text-inherit">{step.title}</h3>
                        <p className="extraSmallText text-primary/70 leading-relaxed pr-0 sm:pr-[2vw] text-[3.8vw] sm:text-inherit">
                          {step.description}
                        </p>
                      </div>

                      <div className="col-span-full sm:col-span-6 sm:col-start-7 mt-[5vw] sm:mt-0">
                        {step.number === 1 && <StepCurateCollage />}
                        {step.number === 2 && <StepConnectAnimation />}
                        {step.number === 3 && <StepDiscussPost />}
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
                    <div className="col-span-full sm:col-span-3 flex flex-col gap-[1vw] mb-[4vw] sm:mb-0">
                      <span className="smallText font-medium text-[4.5vw] sm:text-inherit">True listeners</span>
                      <span className="extraSmallText text-secondary/50 text-[3.6vw] sm:text-inherit">
                        build your personal shrine of records and connect with
                        listeners who hear what you hear.
                      </span>
                    </div>

                    <div className="col-span-full sm:col-span-6 sm:col-start-6">
                      <div className="largeText font-medium leading-tight sm:leading-none text-[7vw] sm:text-inherit">
                        no algorithmic noise,
                        <br />
                        just pure records
                      </div>
                    </div>
                  </div>

                  <div className="w-full layout-grid">
                    <div className="col-span-full border-t border-secondary/10 mb-[4vw]" />

                    {/* Left Column: Any Questions Badge */}
                    <div className="col-span-full sm:col-span-4 self-stretch flex flex-col">
                      <div className="flex items-center gap-[2vw] sm:gap-[1vw] mb-[2vw]">
                        <div className="drop-shadow rounded-[0.5vw] sm:rounded-[0.25vw]">
                          <div className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] rounded-[1vw] sm:rounded-[0.2vw] bg-yellow" />
                        </div>
                        <h2 className="mediumText text-[4.8vw] sm:text-inherit">any questions?</h2>
                      </div>
                      <p className="extraSmallText text-secondary/50 leading-relaxed pr-[3vw] hidden sm:block">
                        Everything you need to know about how musi5t connects listeners through albums, Top 5 curation, and record-targeted posts.
                      </p>
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
                  className="w-full bg-secondary text-primary py-[12vw] sm:py-[8vw] layout-grid select-none"
                >
                  <div className="col-span-full flex flex-col items-center justify-center text-center gap-[3vw]">
                    <h2 className="largeText font-light text-[7.5vw] sm:text-inherit">
                      Ready to curate your Top 5?
                    </h2>
                    <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] scale-110 sm:scale-125 mt-[2vw]">
                      <Link
                        href="/register"
                        className="main-btn smallText text-secondary !px-[4vw] sm:!px-[0.6vw] !py-[2vw] sm:!py-[0.25vw] !gap-[2vw] sm:!gap-[0.5vw]"
                      >
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">Join musi5t</span>
                            <span className="main-btn__to" aria-hidden="true">
                              Join musi5t
                            </span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 8. FOOTER (Dark) */}
                <footer
                  data-nav-color="primary"
                  className="w-full bg-secondary text-primary layout-grid pt-[8vw] sm:pt-[6vw] pb-[6vw] sm:pb-[4vw] border-t border-primary/10 select-none"
                >
                  {/* Email contact links */}
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[1.5vw] mb-[8vw] sm:mb-0">
                    <span className="extraSmallText text-primary/40 font-mono text-[3.2vw] sm:text-inherit">
                      direct contact
                    </span>
                    <div className="flex flex-col gap-[0.5vw]">
                      <a
                        href="mailto:hello@musi5t.com"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300 text-[5vw] sm:text-inherit"
                      >
                        hello@musi5t.com
                      </a>
                      <a
                        href="mailto:press@musi5t.com"
                        className="footer-link-clip w-fit mediumText hover:text-yellow transition-colors duration-300 text-[5vw] sm:text-inherit"
                      >
                        press@musi5t.com
                      </a>
                    </div>
                  </div>

                  {/* Back to top button */}
                  <div className="col-span-full sm:col-span-4 flex items-center justify-center mb-[8vw] sm:mb-0">
                    <button
                      type="button"
                      onClick={() => scrollTo("#hero")}
                      className="back-to-top extraSmallText text-primary/60 hover:text-primary cursor-pointer hover:scale-105 transition-transform text-[3.8vw] sm:text-inherit"
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
                  <div className="col-span-full sm:col-span-4 flex flex-col sm:items-end justify-between gap-[2vw] sm:gap-[1vw]">
                    <span className="detailText text-primary/40 text-[3.2vw] sm:text-inherit">
                      © 2026 musi5t. The album-centric social network.
                    </span>
                    <div className="flex gap-[2vw] sm:gap-[1vw] detailText text-primary/50 text-[3.2vw] sm:text-inherit flex-wrap">
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
