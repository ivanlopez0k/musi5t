"use client";

import { useEffect, useState } from "react";
import { SidePlayer } from "@/components/SidePlayer";

export default function Home() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeService, setActiveService] = useState<string>("albums");

  // Global keyboard shortcut: 'm' toggles player, 'esc' closes
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        setIsPlayerOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isPlayerOpen) {
        setIsPlayerOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlayerOpen]);

  const servicesList = [
    { key: "albums", label: "albums", img: "https://upload.wikimedia.org/wikipedia/en/2/2e/In_Rainbows_official_cover.png" },
    { key: "top5", label: "top 5", img: "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg" },
    { key: "pressings", label: "pressings", img: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg" },
    { key: "dispatches", label: "dispatches", img: "https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png" },
    { key: "affinity", label: "affinity", img: "https://upload.wikimedia.org/wikipedia/en/a/ae/Daft_Punk_-_Discovery.jpg" },
    { key: "canons", label: "canons", img: "https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png" },
  ];

  const faqs = [
    {
      q: "Why are posts anchored to albums instead of personal feeds?",
      a: "Music discussion on traditional platforms gets fragmented and drowned out by engagement-bait. By anchoring posts to albums, you reach listeners who actually care about that record.",
    },
    {
      q: "How does the visibility rule work?",
      a: "When you publish to an album, your post surfaces for anyone who holds that record in their top 5, or follows that album. Mutual taste, not opaque algorithms.",
    },
    {
      q: "Can I choose which vinyl pressing or cover artwork to show?",
      a: "Yes. Powered by MusicBrainz and Cover Art Archive, you select the exact release — whether it's an original 1971 pressing, a Japanese obi strip edition, or a 2024 remaster.",
    },
    {
      q: "What is the purpose of custom profile color palettes?",
      a: "Every music listener has a distinct mood. You can customize your public profile (@handle) with one of our 5 editorial palettes — lima, coral, cobalto, violeta, or mandarina.",
    },
    {
      q: "What music APIs does musi5t connect to?",
      a: "We integrate directly with MusicBrainz for discographic metadata, Cover Art Archive for high-res sleeve scans, and support streaming preview links.",
    },
  ];

  return (
    <div
      className="site-frame"
      style={
        {
          "--layout-offset": isPlayerOpen ? "-25vw" : "0vw",
        } as React.CSSProperties
      }
    >
      {/* Sidejob Sliding Music Player */}
      <SidePlayer
        isOpen={isPlayerOpen}
        onToggle={() => setIsPlayerOpen((prev) => !prev)}
        onClose={() => setIsPlayerOpen(false)}
      />

      {/* Main Foreground Layout */}
      <div className="site-layout">
        {/* Navigation / Header */}
        <header className="relative w-full z-30 pt-[4vw] sm:pt-[2vw]">
          <div className="layout-grid w-full items-center text-secondary">
            {/* Logo */}
            <div className="col-span-4 sm:col-span-3 flex flex-col justify-start items-start">
              <a href="/" className="nav-btn mediumText font-normal lowercase tracking-tight">
                musi5t
              </a>
              <span
                onClick={() => setIsPlayerOpen(true)}
                className="text-[0.85vw] font-normal text-secondary/30 hover:text-secondary duration-300 sm:block hidden cursor-pointer mt-1"
              >
                press &apos;m&apos; for player
              </span>
            </div>

            {/* Peer Hover Nav Links */}
            <div className="col-span-6 justify-center items-center hidden sm:flex">
              <span className="nav-group flex gap-[0.35vw] smallText font-normal">
                <a href="#about" className="nav-btn cursor-pointer">
                  about,
                </a>
                <a href="#services" className="nav-btn cursor-pointer">
                  curation,
                </a>
                <a href="#work" className="nav-btn cursor-pointer">
                  records,
                </a>
                <a href="#process" className="nav-btn cursor-pointer">
                  process
                </a>
              </span>
            </div>

            {/* Right Action Button */}
            <div className="col-span-8 sm:col-span-3 flex justify-end items-center">
              <button
                onClick={() => alert("Registration will open in Sprint 1!")}
                className="main-btn smallText"
              >
                <span className="main-btn__icon" aria-hidden="true" />
                <span className="main-btn__label">
                  <span className="main-btn__clip">
                    <span className="main-btn__from">Enter musi5t</span>
                    <span className="main-btn__to">Join the canon</span>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION (100lvh) */}
        <section
          id="hero"
          className="w-full h-lvh bg-primary flex items-end relative overflow-hidden pointer-events-auto"
        >
          {/* Giant Centered Wordmark */}
          <h1 className="inline-block whitespace-nowrap text-[30vw] md:text-[20vw] tracking-[-0.07em] absolute top-[28%] left-1/2 -translate-x-1/2 translate-y-[-30%] leading-none text-secondary select-none pointer-events-none">
            musi5t
          </h1>

          {/* 3D Perspective Floating Collage Cards */}
          <div className="w-fit h-fit z-10 absolute top-[calc(26%+10vw)] left-1/2 -translate-x-1/2 [perspective:1600px] pointer-events-none">
            {/* Center Big Album Card */}
            <div className="w-[38vw] h-[25vw] rounded-[0.5vw] overflow-hidden bg-yellow shadow-2xl relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://upload.wikimedia.org/wikipedia/en/2/2e/In_Rainbows_official_cover.png"
                alt="In Rainbows"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Left Floating Offset Card */}
            <div className="w-[14vw] h-[9vw] absolute top-1/2 -left-1/3 -translate-x-1/3 -translate-y-1/2 rounded-[0.2vw] overflow-hidden shadow-2xl rotate-[-8deg] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg"
                alt="Blonde"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Floating Offset Card */}
            <div className="w-[15vw] h-[10vw] absolute top-4/5 right-[-25%] translate-x-[25%] -translate-y-4/5 rounded-[0.2vw] overflow-hidden shadow-2xl rotate-[8deg] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"
                alt="Currents"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Hero Bottom Bar */}
          <div className="w-full h-fit layout-grid mb-[2vw] z-20">
            <div className="sm:col-span-4 col-span-12 extraSmallTextBold text-secondary mb-[6vw] sm:mb-0">
              An independent social platform built around the records that define you. Curate your top 5 albums and connect through shared sound.
            </div>
            <div className="sm:col-span-6 col-span-12 sm:col-start-7 flex items-end justify-between sm:justify-end space-x-4 whitespace-nowrap extraSmallTextBold text-secondary">
              <div>The album canon</div>
              <div className="opacity-30">|</div>
              <a href="#about" className="hover:opacity-70 transition-opacity">
                Scroll to explore ↓
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 1: ABOUT (Dark Section: bg-secondary text-primary) */}
        <section
          id="about"
          className="w-full h-fit bg-secondary text-primary pb-[8vw] sm:pb-[calc(3vw+15svh)] relative pt-[8vw] sm:pt-[4vw]"
        >
          <div className="layout-grid w-full">
            <h2 className="col-span-full sm:col-span-8 mediumText font-light">
              musi5t is an independent music platform building affinity feeds around albums and personal canons. No influencers. Just the records you love.
            </h2>
          </div>

          <div className="w-full layout-grid">
            <div className="w-full border-t border-primary/10 col-span-full mt-[8vw] mb-[5vw] sm:mt-[4.5vw] sm:mb-[3vw]" />

            {/* Left Header Tag & Image */}
            <div className="col-span-full sm:col-span-6 flex flex-col sm:mb-[3vw]">
              <div className="flex items-center gap-[1vw] mb-[3vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-[0.2vw] bg-yellow" />
                <span className="mediumText">the premise</span>
              </div>

              {/* Sidejob Process Image Left */}
              <div className="w-full sm:w-[24vw] h-[50vw] sm:h-[16vw] overflow-hidden rounded-[0.25vw] bg-black/40 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg"
                  alt="Vinyl Pressing"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>

            {/* Right 3 Blocks */}
            <div className="col-span-full sm:col-span-4 flex flex-col mt-[8vw] sm:mt-0 mb-[5vw]">
              <div className="flex flex-col gap-[1vw] mb-[6vw]">
                <h3 className="smallText">Not an algorithm</h3>
                <p className="extraSmallText text-primary/50">
                  We don&apos;t run a timeline designed for rage or ads. Every dispatch is rooted in an album, reaching only those who share your connection to that record.
                </p>
              </div>

              <div className="flex flex-col gap-[1vw] mb-[6vw]">
                <h3 className="smallText">Top 5 as passport</h3>
                <p className="extraSmallText text-primary/50">
                  Your 5 definitive albums and 5 songs determine what surfaces in your feed. Mutual affinity, not arbitrary follower counts.
                </p>
              </div>

              <div className="flex flex-col gap-[1vw] mb-[4vw]">
                <h3 className="smallText">From vinyl to digital</h3>
                <p className="extraSmallText text-primary/50">
                  Choose your exact pressing, gatefold artwork, or Japanese obi-strip edition powered by MusicBrainz and Cover Art Archive.
                </p>
              </div>

              <div className="w-fit text-secondary mt-[2vw]">
                <button
                  onClick={() => alert("Registration will open in Sprint 1!")}
                  className="main-btn smallText"
                >
                  <span className="main-btn__icon" aria-hidden="true" />
                  <span className="main-btn__label">
                    <span className="main-btn__clip">
                      <span className="main-btn__from">Talk to us</span>
                      <span className="main-btn__to">Join musi5t</span>
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="hidden sm:block col-span-2 text-right">
              <span className="mediumText">about</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: SERVICES / THE MECHANICS (Light Section: bg-primary text-secondary) */}
        <section
          id="services"
          className="w-full sm:h-fit min-h-svh bg-primary text-secondary layout-grid relative py-[6vw]"
        >
          <div className="col-span-full flex justify-between items-center sm:mt-[2vw]">
            <div className="flex items-center gap-[1vw]">
              <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
              <span className="mediumText">the mechanics</span>
            </div>
            <h2 className="mediumText">curation</h2>
          </div>

          {/* Center Giant Stack of Words */}
          <div className="col-span-full flex flex-col items-center justify-center my-[8vw] relative">
            {servicesList.map((s) => (
              <div
                key={s.key}
                onMouseEnter={() => setActiveService(s.key)}
                className="relative cursor-pointer transition-colors duration-300 select-none"
                style={{ lineHeight: 0.95 }}
              >
                <span
                  className={`inline-block text-[11vw] tracking-[-0.03em] transition-colors duration-300 ${
                    activeService === s.key ? "text-yellow" : "text-secondary hover:text-yellow/70"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}

            {/* Hover Floating Image Previews */}
            <div className="absolute top-1/4 left-[5vw] w-[14vw] h-[14vw] rounded-[0.3vw] overflow-hidden shadow-2xl pointer-events-none transition-all duration-500 hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={servicesList.find((s) => s.key === activeService)?.img}
                alt="Curation Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-1/4 right-[5vw] w-[12vw] h-[12vw] rounded-[0.3vw] overflow-hidden shadow-2xl pointer-events-none transition-all duration-500 hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://upload.wikimedia.org/wikipedia/en/a/ae/Daft_Punk_-_Discovery.jpg"
                alt="Discovery Vinyl"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full border-t border-secondary/10 col-span-full mt-[4vw] mb-[2vw]" />
        </section>

        {/* SECTION 3: WORK / RECORDS (Light Section: bg-primary text-secondary) */}
        <section id="work" className="relative w-full h-fit bg-primary text-secondary layout-grid pb-[10vw]">
          <div className="col-span-full flex justify-between items-center sm:mt-[2vw] mb-[4vw]">
            <div className="flex items-center gap-[1vw]">
              <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
              <span className="mediumText">the archive</span>
            </div>
            <h2 className="mediumText">records</h2>
          </div>

          {/* Left Column: Headline and Partner Logos */}
          <div className="col-span-full sm:col-span-6 w-full mb-[8vw] sm:mb-0">
            <div className="largeText mb-[4vw]">built for impact made for culture</div>

            <div className="text-xs uppercase tracking-widest text-secondary/40 font-mono mb-4">
              connected archives
            </div>
            <div className="grid grid-cols-3 gap-6 opacity-40">
              <span className="text-sm font-semibold tracking-tight">MusicBrainz</span>
              <span className="text-sm font-semibold tracking-tight">Cover Art Archive</span>
              <span className="text-sm font-semibold tracking-tight">Internet Archive</span>
              <span className="text-sm font-semibold tracking-tight">Discogs Data</span>
              <span className="text-sm font-semibold tracking-tight">PostgreSQL</span>
              <span className="text-sm font-semibold tracking-tight">Drizzle ORM</span>
            </div>
          </div>

          {/* Right Column: Editorial Paragraphs */}
          <div className="col-span-full sm:col-span-6">
            <div className="smallToMediumText flex flex-col gap-[3vw] text-secondary/70">
              <span>
                A selection of records that shaped generations. When you post on musi5t, you are contributing to a living, curated encyclopedia of sound.
              </span>
              <span>
                The best music discussions happen between people who love the same deep cuts. We built musi5t to bypass algorithms and connect directly through personal canons.
              </span>
              <span>
                No superficial trends, no forced timelines. Every album page is a gathering space for listeners who know what the record actually feels like.
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 4: PROCESS (Dark Section: bg-secondary text-primary) */}
        <section id="process" className="relative w-full bg-secondary text-primary">
          <div className="layout-grid w-full pt-[6vw] sm:pt-[3vw] pb-[3vw] border-b border-primary/10">
            <div className="col-span-full flex justify-between">
              <div className="flex items-center gap-[1vw]">
                <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                <span className="mediumText">how we work</span>
              </div>
              <h2 className="mediumText">process</h2>
            </div>
          </div>

          {/* Process Step 1 */}
          <div className="w-full bg-secondary layout-grid text-primary pt-[6vw] sm:pt-[4vw] border-b border-primary/10">
            <div className="col-span-full sm:col-span-1 mediumText">
              <span>1</span>
            </div>
            <div className="col-span-full sm:col-span-4 flex flex-col gap-[1vw]">
              <span className="smallText">Start with your five</span>
              <span className="extraSmallText text-primary/50">
                Search the MusicBrainz release-group catalog and select the 5 albums and 5 songs that define your musical identity.
              </span>
            </div>
            <div className="col-span-full sm:col-span-7 mt-[4vw] sm:mt-0">
              <div className="w-full h-[50vw] sm:h-[28vw] overflow-hidden rounded-t-[0.5vw] bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/2/2e/In_Rainbows_official_cover.png"
                  alt="Process 1"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Process Step 2 */}
          <div className="w-full bg-secondary layout-grid text-primary pt-[6vw] sm:pt-[4vw] border-b border-primary/10">
            <div className="col-span-full sm:col-span-1 mediumText">
              <span>2</span>
            </div>
            <div className="col-span-full sm:col-span-4 flex flex-col gap-[1vw]">
              <span className="smallText">Select the pressing</span>
              <span className="extraSmallText text-primary/50">
                Choose the exact vinyl edition, gatefold scan, or Japanese pressing artwork from the Cover Art Archive to display on your profile.
              </span>
            </div>
            <div className="col-span-full sm:col-span-7 mt-[4vw] sm:mt-0">
              <div className="w-full h-[50vw] sm:h-[28vw] overflow-hidden bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg"
                  alt="Process 2"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Process Step 3 */}
          <div className="w-full bg-secondary layout-grid text-primary pt-[6vw] sm:pt-[4vw] pb-[8vw] sm:pb-[4vw] border-b border-primary/10">
            <div className="col-span-full sm:col-span-1 mediumText">
              <span>3</span>
            </div>
            <div className="col-span-full sm:col-span-4 flex flex-col gap-[1vw]">
              <span className="smallText">Own the conversation</span>
              <span className="extraSmallText text-primary/50">
                Publish text dispatches to albums. Your words surface directly for listeners who have those records in their top 5 or follow them.
              </span>
            </div>
            <div className="col-span-full sm:col-span-7 mt-[4vw] sm:mt-0">
              <div className="w-full h-[50vw] sm:h-[28vw] overflow-hidden rounded-b-[0.5vw] bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"
                  alt="Process 3"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: QUESTIONS & FAQ (Light Section: bg-primary text-secondary) */}
        <section id="faq" className="w-full bg-primary py-[10vw] sm:pt-[5vw] pb-[8vw]">
          <div className="layout-grid text-secondary mb-[8vw]">
            <div className="col-span-full sm:col-span-4 flex flex-col gap-[0.75vw]">
              <span className="smallText">Curated frequencies</span>
              <span className="extraSmallText text-secondary/50">
                Connecting listeners across the globe through immutable musical canons.
              </span>
            </div>
            <div className="hidden sm:block col-span-2" />
            <div className="col-span-full sm:col-span-6 largeText">
              no algorithmic noise<br />just the right records
            </div>
          </div>

          <div className="layout-grid w-full">
            <div className="col-span-full border-t border-secondary/10" />

            {/* Left Header Tag & Image */}
            <div className="col-span-full sm:col-span-4 flex flex-col pt-[4vw] sm:pt-[2vw]">
              <div className="flex items-center gap-[1vw] mb-[3vw]">
                <div className="w-[1.8vw] h-[1.8vw] rounded-[0.2vw] bg-yellow" />
                <h2 className="mediumText">any questions?</h2>
              </div>
              <div className="w-full sm:w-[24vw] h-[50vw] sm:h-[16vw] bg-gray-200 rounded-[0.25vw] overflow-hidden shadow-xl mb-6 hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/a/ae/Daft_Punk_-_Discovery.jpg"
                  alt="FAQ record"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right FAQ Accordion List */}
            <div className="col-span-full sm:col-span-8 flex flex-col pt-[2vw]">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="w-full border-b border-secondary/10">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="faq-row flex flex-col w-full py-[3vw] sm:py-[1.75vw] text-left cursor-pointer"
                    >
                      <span className="flex justify-between items-center w-full">
                        <span className="faq-question mediumText pr-[4vw] sm:pr-0">
                          {faq.q}
                        </span>
                        <div className="drop-shadow shrink-0">
                          <div
                            className={`faq-icon w-[4vw] h-[4vw] sm:w-[1.25vw] sm:h-[1.25vw] bg-yellow rounded-[0.25vw] flex items-center justify-center font-bold text-xs ${
                              isOpen ? "is-open" : ""
                            }`}
                          >
                            +
                          </div>
                        </div>
                      </span>
                      <div
                        className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
                          isOpen ? "max-h-48 pt-[1vw]" : "max-h-0"
                        }`}
                      >
                        <p className="extraSmallText text-secondary/60 max-w-xl">
                          {faq.a}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 6: CTA BANNER (Dark Section: h-[100svh] bg-secondary) */}
        <section className="w-full h-[100svh] bg-secondary flex justify-center items-center relative overflow-hidden text-primary">
          <div className="z-10 flex flex-col justify-center items-center gap-[4vw] text-center px-4">
            <span className="extraLargeText max-w-[50vw]">
              ready to define your personal canon?
            </span>
            <div className="scale-125 pt-4">
              <button
                onClick={() => alert("Registration will open in Sprint 1!")}
                className="main-btn smallText"
              >
                <span className="main-btn__icon" aria-hidden="true" />
                <span className="main-btn__label">
                  <span className="main-btn__clip">
                    <span className="main-btn__from">Enter musi5t</span>
                    <span className="main-btn__to">Join now</span>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER (Dark: bg-secondary text-primary) */}
        <footer className="w-full bg-secondary text-primary py-[6vw] sm:py-[3vw] border-t border-primary/10">
          <div className="layout-grid w-full mb-[6vw]">
            <div className="col-span-full sm:col-span-4 text-[14vw] sm:text-[7vw] leading-none tracking-[-0.07em]">
              <a href="/" className="nav-btn cursor-pointer">
                musi5t
              </a>
            </div>

            <div className="col-span-4 sm:col-span-2 mt-[6vw] sm:mt-0">
              <div className="flex items-center gap-[0.5vw] mb-3">
                <div className="w-[0.9vw] h-[0.9vw] bg-yellow rounded-[0.1vw]" />
                <span className="smallText">navigation</span>
              </div>
              <div className="text-hover-group flex flex-col gap-1 extraSmallText text-primary/50">
                <a href="#about" className="text-hover">about</a>
                <a href="#services" className="text-hover">curation</a>
                <a href="#work" className="text-hover">records</a>
                <a href="#process" className="text-hover">process</a>
              </div>
            </div>

            <div className="col-span-4 sm:col-span-2 mt-[6vw] sm:mt-0">
              <div className="flex items-center gap-[0.5vw] mb-3">
                <div className="w-[0.9vw] h-[0.9vw] bg-yellow rounded-[0.1vw]" />
                <span className="smallText">capabilities</span>
              </div>
              <div className="text-hover-group flex flex-col gap-1 extraSmallText text-primary/50">
                <span className="text-hover cursor-default">top 5 albums</span>
                <span className="text-hover cursor-default">top 5 songs</span>
                <span className="text-hover cursor-default">edition covers</span>
                <span className="text-hover cursor-default">affinity feed</span>
              </div>
            </div>

            <div className="col-span-4 sm:col-span-2 mt-[6vw] sm:mt-0">
              <div className="flex items-center gap-[0.5vw] mb-3">
                <div className="w-[0.9vw] h-[0.9vw] bg-yellow rounded-[0.1vw]" />
                <span className="smallText">connect</span>
              </div>
              <div className="text-hover-group flex flex-col gap-1 extraSmallText text-primary/50">
                <a href="mailto:hello@musi5t.local" className="text-hover">hello@musi5t.local</a>
                <a href="#" className="text-hover">github repository</a>
                <a href="#" className="text-hover">architecture docs</a>
              </div>
            </div>

            <div className="col-span-full sm:col-span-2 mt-[6vw] sm:mt-0 flex sm:justify-end items-start">
              <button
                onClick={() => alert("Registration will open in Sprint 1!")}
                className="main-btn smallText"
              >
                <span className="main-btn__icon" aria-hidden="true" />
                <span className="main-btn__label">
                  <span className="main-btn__clip">
                    <span className="main-btn__from">Enter musi5t</span>
                    <span className="main-btn__to">Join now</span>
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div className="layout-grid w-full pt-6 border-t border-primary/10 detailText text-primary/40">
            <div className="col-span-6">
              © 2026 musi5t — aesthetic architecture based on itsasidejob.com
            </div>
            <div className="col-span-6 flex justify-end">
              <a href="#" className="hover:text-primary transition-colors">
                ↑ back to top
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
