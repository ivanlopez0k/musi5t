"use client";

import { useEffect, useState } from "react";

const TRACKS = [
  {
    title: "93 'Til Infinity",
    author: "Souls of Mischief",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music/22/6e/b6/mzi.xyhsjlep.jpg/600x600bb.jpg",
  },
  {
    title: "Purple",
    author: "Wunderhorse",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7b/7b/4a/7b7b4a32-f2ff-fdb1-cb05-7f7332c812cc/cover.jpg/600x600bb.jpg",
  },
  {
    title: "Stonecutters",
    author: "Dope Lemon",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/55/73/dd55738b-8df2-44cf-e6e0-59c49b4acea7/4050538506631.jpg/600x600bb.jpg",
  },
  {
    title: "Do You",
    author: "Ghostwoman",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/bf/2c/55bf2cb5-be73-772d-38c5-4c5c713f67b6/5060626464315_cover.jpg/600x600bb.jpg",
  },
  {
    title: "Easy Way Out",
    author: "Broncho",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d1/64/20/d1642078-a808-9502-0263-fe618e319da5/3615933818133_cover.jpg/600x600bb.jpg",
  },
  {
    title: "The End of a Gun",
    author: "Ghostwoman",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cb/ef/c1/cbefc198-984d-5d2b-4ff2-344ca522d5fd/5060626466333_cover.jpg/600x600bb.jpg",
  },
  {
    title: "Geneva Strangemod",
    author: "Glyders",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/78/70/93/787093d2-3e80-81ff-76d9-1c224eb2b5d0/781484310228.png/600x600bb.jpg",
  },
  {
    title: "I Can Talk",
    author: "Two Door Cinema Club",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/f0/89/c7/f089c71b-9e94-522f-c1cf-f9f3d766daa2/5414939448577_cover.jpg/600x600bb.jpg",
  },
  {
    title: "Leader of the Pack",
    author: "Wunderhorse",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7b/7b/4a/7b7b4a32-f2ff-fdb1-cb05-7f7332c812cc/cover.jpg/600x600bb.jpg",
  },
  {
    title: "Lost My Mind",
    author: "Froth",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/88/a3/e2/88a3e291-f742-bdbb-9ec2-05a912e7ba97/859742233067_cover.jpg/600x600bb.jpg",
  },
  {
    title: "Marinade",
    author: "Dope Lemon",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/55/73/dd55738b-8df2-44cf-e6e0-59c49b4acea7/4050538506631.jpg/600x600bb.jpg",
  },
];

const FAQS = [
  {
    q: "How do you choose the crew?",
    a: "No fixed roster forced onto every brief. We keep a small production core, then pull photographers, filmmakers, stylists, designers, producers, casting and editors from a wider network based on the idea, the location and the craft the job needs.",
  },
  {
    q: "Can you take just one piece of the job?",
    a: "Yes. Full campaign through to a single production lane. Same rule either way: we own that piece properly, with the right people on it, not a loose intro to someone else's calendar.",
  },
  {
    q: "Can you pick up a job that's already creatived?",
    a: "Yes. Bring us in at concept, or once the idea is locked. We'll build the right crew around what's already there and run it to wrap. You shouldn't have to coordinate the freelancers yourself.",
  },
  {
    q: "What should we send to get started?",
    a: "Where you are (idea / locked concept), what you're making, when you need it, roughly what success looks like, and any must-haves (talent, locations, deliverables). Rough is fine. We'll come back with what the job needs and whether we're the right fit.",
  },
  {
    q: "Do you only produce in Oslo?",
    a: "We're based in Oslo and produce there often, but the crew and the job can travel. If the work needs another city, we build for that. Not everything has to run through Norway.",
  },
  {
    q: "Who do you work with?",
    a: "Brands directly, and agencies or in-house teams who need production owned properly. Fashion, sport, hospitality, food and drink, music, lifestyle and culture. If the brief needs a specialist crew and a clean delivery, we're in range.",
  },
  {
    q: "How does pricing work?",
    a: "No packages. We scope the brief, build the crew, and price the work it actually takes: days, people, locations, talent, deliverables. You get a clear figure before anyone's booked. Tell us the ceiling and we'll be honest about what fits inside it.",
  },
  {
    q: "How long does a job take?",
    a: "Depends on the brief. A tight stills job can move in days; a full campaign or launch needs proper pre-production. In the first conversation we'll say what realistic looks like, not a fake turnaround.",
  },
];

export default function Home() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeService, setActiveService] = useState<string>("film");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeTrack = TRACKS[activeTrackIndex];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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

  return (
    <div className={`site-frame text-secondary ${isPlayerOpen ? "panel-open" : ""}`}>
      {/* 1:1 Sidejob Music Player Panel */}
      <section className="side-panel mediaplayer-grid" aria-label="Side panel">
        <div className="col-span-full h-fit mt-[1vw] mb-[2.5vw] flex justify-between extraSmallText">
          <div className="flex items-center gap-[0.25vw]" />
          <span
            onClick={() => setIsPlayerOpen(false)}
            className="text-hover cursor-pointer w-fit"
          >
            <span className="cursor-pointer hover:text-secondary/50 text-secondary/20 duration-300">
              &apos;esc&apos; to close
            </span>
          </span>
        </div>

        {/* Now Playing */}
        <div className="now-playing col-span-full h-fit">
          <div className="now-playing-track flex">
            <div className="w-[35%] aspect-square bg-secondary rounded-[0.8vw] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeTrack.cover}
                alt=""
                className="now-playing-artwork w-full h-full object-cover select-none"
              />
            </div>
            <div className="flex flex-col ml-[1.25vw] smallText mt-[1.75vw]">
              <span className="now-playing-title truncate">{activeTrack.title}</span>
              <span className="now-playing-author text-secondary/30 truncate">
                {activeTrack.author}
              </span>
            </div>
          </div>
        </div>

        {/* Player Controls & Timeline */}
        <div className="player-main col-span-full mt-[2vw]">
          <div className="w-full h-fit flex justify-between mb-[0.5vw] text-[1vw] text-secondary/50">
            <div className="timeline-time">
              <span>0:00</span>
            </div>
            <div className="timeline-time timeline-duration">
              <span>3:42</span>
            </div>
          </div>
          <div className="w-full h-[0.35vw] bg-yellow/20 rounded-full cursor-pointer overflow-hidden">
            <div
              className="timeline-progress h-full bg-yellow rounded-full transition-all duration-300"
              style={{ width: "35%" }}
            />
          </div>

          <div className="col-span-full flex items-center justify-evenly mt-[2vw] pb-[1.5vw] border-b border-secondary/10">
            <div
              onClick={() =>
                setActiveTrackIndex((p) => (p === 0 ? TRACKS.length - 1 : p - 1))
              }
              className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg width="1.5vw" height="1.75vw" viewBox="0 0 22 26" fill="none">
                <rect width="4" height="26" rx="1" fill="black" />
                <path d="M1 13L22 0.875645V25.1244L1 13Z" fill="black" />
              </svg>
            </div>
            <div
              onClick={() => setIsPlaying(!isPlaying)}
              className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            >
              <svg width="1.75vw" height="3vw" viewBox="0 0 28 45" fill="none">
                <path d="M3 2.5L25 22.5L3 42.5V2.5Z" fill="black" />
              </svg>
            </div>
            <div
              onClick={() =>
                setActiveTrackIndex((p) => (p === TRACKS.length - 1 ? 0 : p + 1))
              }
              className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg width="1.5vw" height="1.75vw" viewBox="0 0 22 26" fill="none">
                <path d="M22 25C22 25.5523 21.5523 26 21 26H19C18.4477 26 18 25.5523 18 25V1C18 0.447715 18.4477 0 19 0H21C21.5523 0 22 0.447715 22 1V25Z" fill="black" />
                <path d="M21 13.0001L0 25.1245V0.875732L21 13.0001Z" fill="black" />
              </svg>
            </div>
          </div>

          {/* Track List */}
          <div className="track-list">
            <div className="track-content flex flex-col gap-[0.5vw] py-[2vw]">
              {TRACKS.map((t, i) => (
                <div
                  key={i}
                  onClick={() => setActiveTrackIndex(i)}
                  className="col-span-full flex items-center cursor-pointer"
                >
                  <div
                    className={`${
                      i === activeTrackIndex ? "bg-yellow" : "bg-[#EBEBEC]"
                    } flex items-center w-full pl-[0.4vw] text-secondary h-[4vw] shrink-0 rounded-[0.25vw] transition-colors`}
                  >
                    <div className="w-[3.3vw] h-[3.3vw] rounded-[0.2vw] aspect-auto bg-yellow overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.cover}
                        alt=""
                        className="w-full h-full object-cover select-none"
                      />
                    </div>
                    <div className="flex flex-col extraSmallText ml-[1.5vw] gap-[0.3vw] min-w-0 pr-2">
                      <span className="font-medium truncate">{t.title}</span>
                      <span className="opacity-50 font-medium truncate">{t.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Foreground Layout */}
      <div className="site-layout">
        <div className="app">
          <div className="route-surface">
            {/* Header */}
            <header className="header">
              <div className="layout-fixed layout-grid relative w-full z-30 mt-[4vw] sm:mt-[2vw] pointer-events-auto">
                <div className="text-secondary mediumText col-span-3 flex justify-start items-center">
                  <a href="/" className="nav-btn cursor-pointer">
                    sidejob
                  </a>
                </div>

                <div className="text-secondary smallText col-span-6 justify-center items-center hidden sm:flex">
                  <span className="nav-group flex gap-[0.25vw]">
                    <a href="#about" className="nav-btn cursor-pointer">
                      About,
                    </a>
                    <a href="#services" className="nav-btn cursor-pointer">
                      Services,
                    </a>
                    <a href="#work" className="nav-btn cursor-pointer">
                      Work,
                    </a>
                    <a href="#process" className="nav-btn cursor-pointer">
                      Process
                    </a>
                  </span>
                </div>

                <div className="col-span-3 flex justify-end items-center">
                  <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                    <a href="/contact" className="main-btn smallText">
                      <span className="main-btn__icon" aria-hidden="true" />
                      <span className="main-btn__label">
                        <span className="main-btn__clip">
                          <span className="main-btn__from">Talk to us</span>
                          <span className="main-btn__to" aria-hidden="true" />
                        </span>
                      </span>
                    </a>
                  </div>
                </div>

                {/* Press 'm' trigger */}
                <span
                  onClick={() => setIsPlayerOpen(true)}
                  className="text-[1vw] font-normal text-secondary/20 hover:text-secondary/50 duration-300 absolute bottom-[-1.75vw] sm:block hidden cursor-pointer"
                >
                  <span className="text-hover cursor-pointer w-fit">
                    press &apos;m&apos; for player
                  </span>
                </span>
              </div>
            </header>

            <main tabIndex={-1}>
              {/* HERO SECTION */}
              <div
                id="hero"
                data-nav-color="primary"
                className="w-full h-lvh bg-primary flex items-end relative overflow-hidden"
              >
                {/* Giant Wordmark */}
                <h1 className="inline-block whitespace-nowrap will-change-transform text-[30vw] md:text-[20vw] tracking-[-0.07em] absolute top-[26%] left-1/2 -translate-x-1/2 translate-y-[-30%] leading-none text-secondary select-none pointer-events-none">
                  sidejob
                </h1>

                {/* 3D Floating Collage */}
                <div className="w-fit h-fit z-10 absolute top-[calc(28%+10vw)] left-1/2 -translate-x-1/2 [perspective:1600px] pointer-events-none">
                  {/* Center Card */}
                  <div className="drop-shadow-soft w-[38vw] h-[25vw] rounded-[0.5vw] overflow-hidden pointer-events-none bg-yellow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://www.itsasidejob.com/images/hero0.webp"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Left Card */}
                  <div className="w-[14vw] h-[9vw] absolute top-1/2 -left-1/3 -translate-x-1/3 -translate-y-1/2">
                    <div className="drop-shadow-soft w-full h-full rounded-[0.2vw] overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/hero2.webp"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Right Card */}
                  <div className="w-[15vw] h-[10vw] absolute top-4/5 right-[-25%] translate-x-[25%] -translate-y-4/5">
                    <div className="drop-shadow-soft w-full h-full rounded-[0.2vw] overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/hero3.webp"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Grid Info */}
                <div className="w-full h-fit layout-grid mb-[2vw] z-20">
                  <div className="z-0 sm:col-span-3 col-span-4 extraSmallTextBold mb-[10vw] sm:mb-0">
                    A creative production agency bringing together the right people to make campaigns, content and experiences that get noticed.
                  </div>
                  <div className="mb-[15vw] sm:mb-0 sm:col-span-4 col-span-6 sm:col-start-10 flex items-end md:justify-end space-x-2 whitespace-nowrap extraSmallTextBold">
                    <div>Based in Oslo, Norway</div>
                    <div className="w-[3vw] flex items-center justify-center">|</div>
                    <a href="#about" className="hover:opacity-75 transition-opacity">
                      Scroll to explore ↓
                    </a>
                  </div>
                </div>
              </div>

              {/* ABOUT SECTION (Dark) */}
              <div
                id="about"
                data-nav-color="primary"
                className="w-full h-fit bg-secondary text-primary pb-[8vw] sm:pb-[calc(3vw+15svh)] relative pt-[6vw] sm:pt-[2vw]"
              >
                <div className="layout-grid w-full">
                  <h2 className="z-0 col-span-full sm:col-span-6 mediumText font-light">
                    sidejob is an independent creative production agency building specialist teams for campaigns, content and experiences. No fixed team. Just the right one for each job.
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
                          src="https://www.itsasidejob.com/images/hero1.webp"
                          alt=""
                          className="w-full h-full object-cover bg-yellow opacity-90"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 3 Paragraphs */}
                  <div className="col-span-full sm:col-span-4 flex flex-col mt-[8vw] sm:mt-0 mb-[5vw]">
                    <div className="flex flex-col gap-[2.5vw] sm:gap-[1vw] mb-[10vw] sm:mb-[6vw]">
                      <h3 className="smallText">Not an agency</h3>
                      <p className="extraSmallText opacity-50">
                        We&apos;re not a traditional agency, talent marketplace or freelancer collective. We keep a small production core and work with a wider network of independent creatives, building the right crew around each project and owning the delivery of the work.
                      </p>
                    </div>

                    <div className="flex flex-col gap-[2.5vw] sm:gap-[1vw] mb-[10vw] sm:mb-[6vw]">
                      <h3 className="smallText">Crew per project</h3>
                      <p className="extraSmallText opacity-50">
                        Every brief gets its own shape and its own people. Photographers, filmmakers, stylists, designers, producers, casting talent and editors are assembled around the idea, not pulled from a fixed roster or forced through the same in-house team every time.
                      </p>
                    </div>

                    <div className="flex flex-col gap-[2.5vw] sm:gap-[1vw] mb-[8vw] sm:mb-[4vw]">
                      <h3 className="smallText">From concept to wrap</h3>
                      <p className="extraSmallText opacity-50">
                        We can be involved from the very start or brought in once a concept already exists. Creative direction, strategy, casting, shoots, content, events and activations. However we get involved, we run production properly and get the work over the line.
                      </p>
                    </div>

                    <div className="w-fit text-secondary mt-[3vw]">
                      <a href="/contact" className="main-btn smallText">
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">Talk to us</span>
                            <span className="main-btn__to" aria-hidden="true" />
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>

                  <div className="hidden sm:block col-span-2 text-right">
                    <span className="mediumText">about</span>
                  </div>
                </div>
              </div>

              {/* SERVICES SECTION (Light) */}
              <div
                id="services"
                data-nav-color="secondary"
                className="w-full sm:h-fit min-h-svh bg-primary text-secondary layout-grid relative"
              >
                <div className="col-span-full sm:col-span-12 flex justify-between items-center sm:mt-[4vw]">
                  <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                    <div className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] rounded-[0.5vw] sm:rounded-[0.2vw] bg-yellow" />
                    <span className="mediumText">how may we help?</span>
                  </div>
                  <h2 className="mediumText">services</h2>
                </div>

                {/* Interactive Services List */}
                <div className="col-span-full sm:col-span-12 flex flex-col items-center justify-center mt-[10vw] mb-[7vw] sm:mb-[3vw] relative select-none">
                  {["film", "campaigns", "photography", "producing", "strategy", "casting"].map(
                    (item) => (
                      <div
                        key={item}
                        onMouseEnter={() => setActiveService(item)}
                        className="relative cursor-default"
                        style={{ lineHeight: 0.95 }}
                      >
                        <span
                          className={`inline-block pointer-events-none text-[11vw] tracking-[-0.03em] transition-colors duration-300 ${
                            activeService === item ? "text-yellow" : "text-secondary"
                          }`}
                        >
                          {item}
                        </span>
                      </div>
                    )
                  )}

                  {/* Hover Image Reveal Left */}
                  <div className="absolute top-2/5 -translate-y-1/2 left-[-8vw] -translate-x-1/2 w-[12vw] h-[8vw] hidden sm:block pointer-events-none">
                    <div className="drop-shadow-soft w-full h-full bg-gray-200 overflow-hidden rounded-[0.2vw] rotate-[-10deg]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/services/film1.webp"
                        alt="film"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Hover Image Reveal Right */}
                  <div className="absolute top-3/5 -translate-y-3/5 right-[-8vw] translate-x-1/2 w-[12vw] h-[8vw] hidden sm:block pointer-events-none">
                    <div className="drop-shadow-soft w-full h-full bg-gray-200 overflow-hidden rounded-[0.2vw] rotate-[8deg]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/services/film2.webp"
                        alt="film"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full border-t border-secondary/10 col-span-full mt-[5.5vw] mb-[3vw]" />
              </div>

              {/* WORK SECTION (Light) */}
              <div id="work" className="relative z-0 w-full h-fit bg-primary text-secondary layout-grid pb-[calc(5vw+8svh)]">
                <div className="col-span-full sm:col-span-12 flex justify-between items-center sm:mt-[2vw] mb-[3vw] sm:mb-[5vw]">
                  <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                    <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                    <span className="mediumText">we&apos;ve done a lot</span>
                  </div>
                  <h2 className="mediumText">work</h2>
                </div>

                {/* Left: Headline & Client Logos */}
                <div className="col-span-full sm:col-span-5 w-full mb-[15vw] sm:mb-0 sm:h-full">
                  <div className="grid grid-cols-6 sm:grid-cols-5 sm:grid-rows-[1fr_auto] gap-[var(--gutter)] h-full">
                    <div className="col-span-6 sm:col-span-3 mt-[10vw] sm:mt-0 sm:row-start-1">
                      <div className="largeText">built for impact made for culture</div>
                    </div>
                    <div className="col-span-4 hidden w-full sm:block sm:row-start-2 sm:col-start-1">
                      <div className="grid grid-cols-4 gap-[var(--gutter)] w-full h-fit">
                        {[
                          "acne-studios",
                          "carhartt-wip",
                          "ganni",
                          "holzweiler",
                          "marimekko",
                          "norrona",
                          "oatly",
                          "on-running",
                          "our-legacy",
                          "peak-performance",
                          "sonos",
                          "toteme",
                        ].map((brand) => (
                          <div key={brand} className="w-full aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://www.itsasidejob.com/images/logos/${brand}.svg`}
                              alt={brand}
                              className="w-full h-full object-contain grayscale opacity-25"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Paragraphs */}
                <div className="col-span-full sm:col-span-5 sm:col-start-8">
                  <div className="smallToMediumText flex flex-col gap-[4vw]">
                    <span>
                      A selection of recent jobs we&apos;ve loved making. Campaigns, shoots, launches, events and the kind of work that needs the right crew behind it.
                    </span>
                    <span>
                      The best work starts with the right mix of people. We build each job around the idea, pulling together photographers, filmmakers, designers, producers and whoever else it takes to make something worth looking at.
                    </span>
                    <span>
                      No fixed formulas, no oversized teams. Every project gets its own shape, its own crew and its own way of working. From quick-turnaround shoots to full campaigns and real-world moments, we keep things flexible from start to finish.
                    </span>
                    <span>
                      Different people, different places, different briefs. All connected by good ideas, close collaboration and a commitment to making the final thing feel right.
                    </span>
                    <span>
                      Some projects move quickly, others take time - but we always stay close to the idea and honest about what it takes. That&apos;s how we build lasting relationships.
                    </span>
                  </div>
                </div>
              </div>

              {/* PROCESS SECTION (Dark) */}
              <div id="process" className="relative z-10 bg-secondary">
                <div className="w-full bg-secondary layout-grid text-primary">
                  <div className="col-span-full sm:col-span-12 flex justify-between mt-[6vw] sm:mt-[3vw] pb-[4vw] sm:pb-[2vw] border-b border-primary/10">
                    <div className="flex items-center gap-[1.5vw] sm:gap-[1vw]">
                      <div className="sm:w-[1.8vw] sm:h-[1.8vw] w-[5vw] h-[5vw] sm:rounded-[0.2vw] rounded-[0.5vw] bg-yellow" />
                      <span className="mediumText">how we work</span>
                    </div>
                    <h2 className="mediumText">process</h2>
                  </div>
                </div>

                {/* Step 1 */}
                <div className="w-full bg-secondary layout-grid text-primary pt-[8vw] sm:pt-[5vw] sm:border-b border-primary/10">
                  <div className="col-span-full sm:col-span-1 mediumText pt-[2vw] sm:pt-[1vw] flex sm:block items-baseline gap-[3vw] sm:gap-0">
                    <span>1</span>
                    <span className="smallText sm:hidden">Start with the job</span>
                  </div>
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[2.5vw] sm:gap-[1vw] pt-[3vw] sm:pt-[1vw]">
                    <span className="smallText hidden sm:block">Start with the job</span>
                    <p className="w-full sm:w-[75%] extraSmallText text-primary/50">
                      Whether you&apos;re at the idea stage or already have a concept locked in, we get under the brief and work out what the job actually needs: the scope, the ambition, the timing, and what success looks like when it&apos;s done.
                    </p>
                  </div>
                  <div className="col-span-full sm:col-span-7 mt-[4vw] sm:-mt-px">
                    <div className="drop-shadow rounded-[0.5vw] sm:rounded-[0.25vw] overflow-hidden w-full h-[50vw] sm:h-[35vw] bg-gray-200 rounded-t-[0.5vw] sm:rounded-t-[0.25vw]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/process1.webp"
                        alt="Start with the job"
                        className="w-full h-full object-cover opacity-90"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="w-full bg-secondary layout-grid text-primary pt-[10vw] sm:pt-0 sm:border-b border-primary/10">
                  <div className="col-span-full sm:col-span-1 mediumText pt-[2vw] sm:pt-[1vw] flex sm:block items-baseline gap-[3vw] sm:gap-0">
                    <span>2</span>
                    <span className="smallText sm:hidden">Build the crew</span>
                  </div>
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[2.5vw] sm:gap-[1vw] pt-[3vw] sm:pt-[1vw]">
                    <span className="smallText hidden sm:block">Build the crew</span>
                    <p className="w-full sm:w-[75%] extraSmallText text-primary/50">
                      No fixed team. Just the right one. We pull together photographers, filmmakers, stylists, designers, producers and whoever else the idea needs from our wider network, building a specialist crew around each project rather than forcing every brief through the same people.
                    </p>
                  </div>
                  <div className="col-span-full sm:col-span-7 mt-[4vw] sm:-mt-px">
                    <div className="drop-shadow rounded-[0.5vw] sm:rounded-[0.25vw] overflow-hidden w-full h-[50vw] sm:h-[35vw] bg-gray-400">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/process2.webp"
                        alt="Build the crew"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="w-full bg-secondary layout-grid text-primary pt-[10vw] sm:pt-0 pb-[15vw] sm:pb-[3vw] sm:border-b border-primary/10">
                  <div className="col-span-full sm:col-span-1 mediumText pt-[2vw] sm:pt-[1vw] flex sm:block items-baseline gap-[3vw] sm:gap-0">
                    <span>3</span>
                    <span className="smallText sm:hidden">Own the production</span>
                  </div>
                  <div className="col-span-full sm:col-span-4 flex flex-col gap-[2.5vw] sm:gap-[1vw] pt-[3vw] sm:pt-[1vw]">
                    <span className="smallText hidden sm:block">Own the production</span>
                    <p className="w-full sm:w-[75%] extraSmallText text-primary/50">
                      We run it from call time to wrap. Creative direction, shoots, content, events, activations and everything in between. You get the work delivered and production handled properly, not a list of freelancers to coordinate yourself.
                    </p>
                  </div>
                  <div className="col-span-full sm:col-span-7 mt-[4vw] sm:-mt-px">
                    <div className="drop-shadow rounded-[0.5vw] sm:rounded-[0.25vw] overflow-hidden w-full h-[50vw] sm:h-[35vw] bg-gray-200 rounded-b-[0.5vw] sm:rounded-b-[0.25vw]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/process3.webp"
                        alt="Own the production"
                        className="w-full h-full object-cover opacity-90"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ SECTION (Light) */}
              <div className="w-full bg-primary py-[10vw] sm:pt-[5vw] pb-[calc(5vw+5svh)]">
                <div className="layout-grid text-secondary mb-[12vw] sm:mb-[10vw]">
                  <div className="col-span-full sm:col-span-3 flex flex-col gap-[2vw] sm:gap-[0.75vw] mb-[8vw] sm:mb-0">
                    <span className="smallText">Unlimited team</span>
                    <span className="extraSmallText text-secondary/50">
                      build the right crew around each project, bringing together independent creatives.
                    </span>
                  </div>
                  <div className="hidden sm:block col-span-3" />
                  <div className="col-span-full sm:col-span-6">
                    <div className="largeText">
                      no fixed team<br />just the right one
                    </div>
                  </div>
                </div>

                <div className="layout-grid w-full">
                  <div className="col-span-full sm:col-span-12 border-t border-secondary/10" />

                  {/* Left Column: Image with any questions? */}
                  <div className="col-span-full sm:col-span-4 self-stretch flex flex-col">
                    <div className="flex items-center gap-[2vw] sm:gap-[1vw] mb-[6vw] sm:mb-[3vw] pt-[6vw] sm:pt-[2vw]">
                      <div className="w-[5vw] h-[5vw] sm:w-[1.8vw] sm:h-[1.8vw] rounded-[0.5vw] sm:rounded-[0.2vw] bg-yellow" />
                      <h2 className="mediumText">any questions?</h2>
                    </div>

                    <div className="relative w-full sm:flex-1 sm:min-h-[16vw] mb-[8vw] sm:mb-0">
                      <div className="drop-shadow w-full bg-primary sm:w-[24vw] h-[50vw] sm:h-[16vw] overflow-hidden rounded-[0.5vw] sm:rounded-[0.25vw]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://www.datocms-assets.com/235377/1790333201-faq.webp"
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 8 Accordion Items */}
                  <div className="col-span-full sm:col-span-7 sm:col-start-6">
                    <div className="flex flex-col w-full">
                      {FAQS.map((faq, i) => {
                        const isOpen = openFaq === i;
                        return (
                          <div key={i} className="faq-item w-full border-b border-secondary/10">
                            <button
                              type="button"
                              onClick={() => setOpenFaq(isOpen ? null : i)}
                              className="faq-row flex flex-col w-full py-[4vw] sm:py-[2vw] text-left cursor-pointer"
                            >
                              <span className="flex justify-between items-center w-full">
                                <span className="faq-question mediumText pr-[4vw] sm:pr-0">
                                  {faq.q}
                                </span>
                                <div className="drop-shadow faq-icon shrink-0">
                                  <div
                                    className={`faq-icon__sq w-[4vw] h-[4vw] sm:w-[1.25vw] sm:h-[1.25vw] bg-yellow rounded-[0.5vw] sm:rounded-[0.25vw] flex items-center justify-center font-bold text-xs ${
                                      isOpen ? "is-open" : ""
                                    }`}
                                  >
                                    +
                                  </div>
                                </div>
                              </span>
                              <div
                                className={`faq-answer overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
                                  isOpen ? "max-h-48 pt-[1.25vw]" : "max-h-0"
                                }`}
                              >
                                <p className="extraSmallText text-secondary/50 pr-[8vw] sm:pr-[2vw] sm:w-[90%]">
                                  {faq.a}
                                </p>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA BANNER (Dark full-bleed) */}
              <div className="w-full h-fit bg-secondary flex justify-center items-center overflow-hidden">
                <div className="w-full bg-secondary h-[120svh] overflow-hidden relative z-10 flex flex-col justify-center items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://www.itsasidejob.com/images/ctabackground.webp"
                    alt=""
                    className="w-screen max-w-none h-[120svh] object-cover object-top opacity-90 sm:opacity-95 absolute top-0 left-1/2 -translate-x-1/2"
                  />

                  <div className="z-10 flex flex-col justify-center items-center gap-[5vw] relative">
                    {/* Floating Camera */}
                    <div className="sm:w-[17vw] h-[20vw] absolute top-[-5vw] left-[-15vw] sm:left-[-12vw] -z-10 rotate-[-10deg]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/camera.webp"
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Floating Pager */}
                    <div className="sm:w-[20vw] h-[20vw] absolute top-[19vw] sm:top-[10vw] right-[-15vw] -z-10 rotate-[-25deg]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://www.itsasidejob.com/images/pager.webp"
                        alt=""
                        className="w-full h-full object-contain scale-x-[-1]"
                      />
                    </div>

                    <div className="w-[70vw] sm:w-[40vw] text-center text-primary">
                      <span className="extraLargeText">want to hear how we can help?</span>
                    </div>

                    <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] scale-150 pt-[3vw] sm:pt-0">
                      <a href="/contact" className="main-btn smallText">
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">Talk to us</span>
                            <span className="main-btn__to" aria-hidden="true" />
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER (Dark) */}
              <div className="w-full h-fit bg-secondary">
                <div className="w-full bg-secondary layout-grid text-primary py-[6vw] sm:py-[1vw] translate-y-[-8vw] opacity-25">
                  <div className="col-span-full sm:col-span-4 text-[16vw] sm:text-[7vw] leading-none tracking-[-0.07em]">
                    <a href="/" className="nav-btn cursor-pointer">
                      sidejob
                    </a>
                  </div>

                  {/* Navigation Column */}
                  <div className="col-span-3 sm:col-span-2 mt-[8vw] sm:mt-[2vw]">
                    <div className="flex items-center gap-[2vw] sm:gap-[0.5vw]">
                      <div className="w-[3vw] h-[3vw] sm:w-[0.9vw] sm:h-[0.9vw] bg-yellow rounded-[0.5vw] sm:rounded-[0.1vw] mt-[0.5vw] sm:mt-[0.2vw]" />
                      <span className="smallText">navigation</span>
                    </div>
                    <div className="text-hover-group w-fit flex flex-col items-start extraSmallText text-primary/50 mt-[3vw] sm:mt-[0.5vw]">
                      <a href="#about" className="text-hover py-[1.5vw] sm:py-[0.25vw]">about</a>
                      <a href="#services" className="text-hover py-[1.5vw] sm:py-[0.25vw]">services</a>
                      <a href="#work" className="text-hover py-[1.5vw] sm:py-[0.25vw]">work</a>
                      <a href="#process" className="text-hover py-[1.5vw] sm:py-[0.25vw]">process</a>
                    </div>
                  </div>

                  {/* Capabilities Column */}
                  <div className="col-span-3 sm:col-span-2 mt-[8vw] sm:mt-[2vw]">
                    <div className="flex items-center gap-[2vw] sm:gap-[0.5vw]">
                      <div className="w-[3vw] h-[3vw] sm:w-[0.9vw] sm:h-[0.9vw] bg-yellow rounded-[0.5vw] sm:rounded-[0.1vw] mt-[0.5vw] sm:mt-[0.2vw]" />
                      <span className="smallText">capabilities</span>
                    </div>
                    <div className="text-hover-group w-fit flex flex-col items-start extraSmallText text-primary/50 mt-[3vw] sm:mt-[0.5vw]">
                      <span className="text-hover py-[1.5vw] sm:py-[0.25vw] !cursor-default">film</span>
                      <span className="text-hover py-[1.5vw] sm:py-[0.25vw] !cursor-default">campaigns</span>
                      <span className="text-hover py-[1.5vw] sm:py-[0.25vw] !cursor-default">photography</span>
                      <span className="text-hover py-[1.5vw] sm:py-[0.25vw] !cursor-default">strategy</span>
                      <span className="text-hover py-[1.5vw] sm:py-[0.25vw] !cursor-default">producing</span>
                      <span className="text-hover py-[1.5vw] sm:py-[0.25vw] !cursor-default">casting</span>
                    </div>
                  </div>

                  {/* Connect Column */}
                  <div className="col-span-3 sm:col-span-2 mt-[8vw] sm:mt-[2vw]">
                    <div className="flex items-center gap-[2vw] sm:gap-[0.5vw]">
                      <div className="w-[3vw] h-[3vw] sm:w-[0.9vw] sm:h-[0.9vw] bg-yellow rounded-[0.5vw] sm:rounded-[0.1vw] mt-[0.5vw] sm:mt-[0.2vw]" />
                      <span className="smallText">connect</span>
                    </div>
                    <div className="text-hover-group w-fit flex flex-col items-start extraSmallText text-primary/50 mt-[3vw] sm:mt-[0.5vw]">
                      <a href="mailto:hello@itsasidejob.com" className="text-hover py-[1.5vw] sm:py-[0.25vw]">hello@itsasidejob.com</a>
                      <a href="mailto:support@itsasidejob.com" className="text-hover py-[1.5vw] sm:py-[0.25vw]">contact support</a>
                      <a href="mailto:careers@itsasidejob.com" className="text-hover py-[1.5vw] sm:py-[0.25vw]">careers</a>
                    </div>
                  </div>

                  {/* Talk to us Button in Footer */}
                  <div className="col-span-3 sm:col-span-2 mt-[8vw] sm:mt-[2vw] flex items-start sm:justify-end">
                    <div className="w-fit text-secondary">
                      <a href="/contact" className="main-btn smallText">
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">Talk to us</span>
                            <span className="main-btn__to" aria-hidden="true" />
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* Copyright & Back to Top */}
                  <div className="col-span-3 sm:col-span-4 mt-[20vw] sm:mt-[15.75vw]">
                    <span className="detailText font-thin text-primary/50">© 2026 sidejob</span>
                  </div>

                  <div className="col-span-full sm:col-span-4 mt-[6vw] sm:mt-[15vw] hidden sm:block">
                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="back-to-top extraSmallText font-thin text-primary/50 cursor-pointer hover:scale-105"
                    >
                      <span className="back-to-top__clip">
                        <span className="back-to-top__from">
                          <span className="back-to-top__arrow">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                        <span className="back-to-top__to" aria-hidden="true">
                          <span className="back-to-top__arrow">↑</span>
                          <span className="back-to-top__label">back to top</span>
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="col-span-3 sm:col-span-4 flex sm:justify-end mt-[20vw] sm:mt-[15.75vw]">
                    <nav aria-label="Legal and credits" className="legal-links detailText font-thin text-primary/70">
                      <a href="/privacy" className="text-hover">privacy</a>
                      <span>, </span>
                      <a href="/terms" className="text-hover">terms of use</a>
                      <a href="https://joshchant.com" target="_blank" rel="noopener noreferrer" className="ml-[0.5vw] text-hover">
                        site by josh
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
