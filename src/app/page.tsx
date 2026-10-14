"use client";

import { useEffect, useState } from "react";
import { SidejobButton } from "@/components/SidejobButton";
import { SidePlayer } from "@/components/SidePlayer";
import { SidejobFaq } from "@/components/SidejobFaq";

export default function Home() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Global keyboard shortcut: 'm' opens/closes side player
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        setIsPlayerOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="site-frame"
      style={
        {
          "--layout-offset": isPlayerOpen ? "-25vw" : "0vw",
        } as React.CSSProperties
      }
    >
      {/* Background Sidejob Music Player Panel */}
      <SidePlayer
        isOpen={isPlayerOpen}
        onToggle={() => setIsPlayerOpen((prev) => !prev)}
        onClose={() => setIsPlayerOpen(false)}
      />

      {/* Main Foreground Layout */}
      <div className="site-layout">
        {/* Fixed / Sticky Header */}
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F7F7F7]/85 border-b border-black/5 transition-colors">
          <div className="max-w-[1700px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
            {/* Logo */}
            <a
              href="#"
              className="text-xl md:text-2xl font-bold tracking-tight lowercase select-none text-[#0E0E0E]"
            >
              musi5t
            </a>

            {/* Signature Sidejob Peer Hover Dimming Nav */}
            <nav className="hidden lg:flex items-center gap-8 hover-dim-group text-sm font-medium">
              <a href="#about" className="hover-dim-item text-[#0E0E0E]">
                about,
              </a>
              <a href="#records" className="hover-dim-item text-[#0E0E0E]">
                records,
              </a>
              <a href="#process" className="hover-dim-item text-[#0E0E0E]">
                process,
              </a>
              <a href="#faq" className="hover-dim-item text-[#0E0E0E]">
                faq
              </a>
            </nav>

            {/* Action Bar */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Player Toggle Button */}
              <button
                onClick={() => setIsPlayerOpen((prev) => !prev)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 text-xs font-mono lowercase text-[#0E0E0E]/70 hover:text-[#0E0E0E] hover:border-black/30 transition-all cursor-pointer"
                title="Toggle music player (Shortcut: M)"
              >
                <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse" />
                <span>sound</span>
                <kbd className="text-[10px] bg-black/5 px-1 py-0.5 rounded font-mono">m</kbd>
              </button>

              {/* Signature Animated Button */}
              <SidejobButton
                label="get started"
                hoverLabel="join now"
                onClick={() => {
                  alert("Registration will open in Sprint 1!");
                }}
              />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 md:px-12 pt-12 md:pt-24 pb-20 max-w-[1700px] mx-auto min-h-[90vh] flex flex-col justify-between">
          <div className="max-w-5xl space-y-6">
            <span className="micro-tag block font-mono">
              [ 00 / social network for album lovers ]
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-normal tracking-tight lowercase leading-[0.98] text-[#0E0E0E]">
              the social network built around the albums that define you.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#0E0E0E]/65 max-w-2xl font-normal leading-relaxed pt-2">
              Forget follower counts and algorithmic noise. On musi5t, every conversation starts with a record, and your feed is tuned to shared taste.
            </p>
          </div>

          {/* Sidejob Editorial Hero Collage */}
          <div className="my-16 md:my-24 relative w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-end">
              {/* Card 1: In Rainbows */}
              <div className="group relative rounded-2xl overflow-hidden shadow-2xl bg-black/5 transition-transform duration-500 hover:-translate-y-2">
                <div className="aspect-square w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/2/2e/In_Rainbows_official_cover.png"
                    alt="In Rainbows"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-black/5 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs font-semibold lowercase">in rainbows</div>
                    <div className="text-[11px] text-[#0E0E0E]/50 lowercase">radiohead</div>
                  </div>
                  <span className="text-[10px] font-mono opacity-40">2007</span>
                </div>
              </div>

              {/* Card 2: Blonde (Offset / Elevated) */}
              <div className="group relative rounded-2xl overflow-hidden shadow-2xl bg-black/5 md:-translate-y-10 transition-transform duration-500 hover:-translate-y-12">
                <div className="aspect-square w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg"
                    alt="Blonde"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-black/5 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs font-semibold lowercase">blonde</div>
                    <div className="text-[11px] text-[#0E0E0E]/50 lowercase">frank ocean</div>
                  </div>
                  <span className="text-[10px] font-mono opacity-40">2016</span>
                </div>
              </div>

              {/* Card 3: Abbey Road */}
              <div className="group relative rounded-2xl overflow-hidden shadow-2xl bg-black/5 transition-transform duration-500 hover:-translate-y-2">
                <div className="aspect-square w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg"
                    alt="Abbey Road"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-black/5 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs font-semibold lowercase">abbey road</div>
                    <div className="text-[11px] text-[#0E0E0E]/50 lowercase">the beatles</div>
                  </div>
                  <span className="text-[10px] font-mono opacity-40">1969</span>
                </div>
              </div>

              {/* Card 4: Currents (Offset / Elevated) */}
              <div className="group relative rounded-2xl overflow-hidden shadow-2xl bg-black/5 md:-translate-y-8 transition-transform duration-500 hover:-translate-y-10">
                <div className="aspect-square w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png"
                    alt="Currents"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-black/5 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs font-semibold lowercase">currents</div>
                    <div className="text-[11px] text-[#0E0E0E]/50 lowercase">tame impala</div>
                  </div>
                  <span className="text-[10px] font-mono opacity-40">2015</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll to explore indicator */}
          <div className="pt-8 flex items-center justify-between border-t border-black/10 text-xs text-[#0E0E0E]/50">
            <span className="font-mono text-[11px]">feed / catalog / vinyl archive</span>
            <span className="animate-float cursor-pointer flex items-center gap-2">
              <span>scroll to explore</span>
              <span>↓</span>
            </span>
          </div>
        </section>

        {/* Section 01: About / The Premise */}
        <section id="about" className="px-6 md:px-12 py-24 md:py-36 max-w-[1700px] mx-auto border-t border-black/10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            <div className="md:col-span-4 space-y-4">
              <span className="micro-tag font-mono block">[ 01 / the premise ]</span>
              <h2 className="text-3xl md:text-5xl font-normal lowercase tracking-tight leading-tight">
                we don&apos;t follow influencers. we follow records.
              </h2>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 text-[#0E0E0E]/70 leading-relaxed text-base md:text-lg">
              <p>
                In standard social networks, music commentary gets fragmented, drowned out by hot takes, and buried by algorithms optimizing for rage. We flipped the hierarchy: on musi5t, the record is the anchor.
              </p>
              <p>
                When you post, you choose the albums you are speaking to. If someone has that record in their top 5, or follows that album, your post lands in their feed. Real resonance based on what you actually listen to.
              </p>
            </div>
          </div>
        </section>

        {/* Section 02: Records / Top 5 Showcase */}
        <section id="records" className="px-6 md:px-12 py-24 md:py-36 max-w-[1700px] mx-auto border-t border-black/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 gap-6">
            <div className="space-y-4 max-w-xl">
              <span className="micro-tag font-mono block">[ 02 / the top 5 ]</span>
              <h2 className="text-3xl md:text-6xl font-normal lowercase tracking-tight">
                five albums. your entire universe.
              </h2>
            </div>
            <p className="text-sm md:text-base text-[#0E0E0E]/60 max-w-md font-normal leading-relaxed">
              Every profile showcases an immutable hierarchy of 5 albums and 5 songs. Pick the exact pressing, deluxe art, or Japanese edition you cherish.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 pt-6">
            {[
              {
                rank: "01",
                title: "in rainbows",
                artist: "radiohead",
                edition: "2007 self-released boxset",
                src: "https://upload.wikimedia.org/wikipedia/en/2/2e/In_Rainbows_official_cover.png",
              },
              {
                rank: "02",
                title: "blonde",
                artist: "frank ocean",
                edition: "black friday vinyl edition",
                src: "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg",
              },
              {
                rank: "03",
                title: "abbey road",
                artist: "the beatles",
                edition: "1969 uk apple stereo",
                src: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
              },
              {
                rank: "04",
                title: "currents",
                artist: "tame impala",
                edition: "2015 modular recordings",
                src: "https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png",
              },
              {
                rank: "05",
                title: "discovery",
                artist: "daft punk",
                edition: "2001 virgin records japan",
                src: "https://upload.wikimedia.org/wikipedia/en/a/ae/Daft_Punk_-_Discovery.jpg",
              },
            ].map((album) => (
              <div
                key={album.rank}
                className="group flex flex-col p-3 rounded-2xl bg-white/70 border border-black/5 hover:border-black/20 shadow-sm transition-all duration-300"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/5 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={album.src}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0E0E0E] text-[#F7F7F7] font-mono text-[10px] font-bold">
                    {album.rank}
                  </div>
                </div>
                <span className="text-sm font-semibold truncate lowercase group-hover:underline">
                  {album.title}
                </span>
                <span className="text-xs text-[#0E0E0E]/60 truncate lowercase">
                  {album.artist}
                </span>
                <span className="text-[10px] text-[#0E0E0E]/40 font-mono mt-2 truncate">
                  {album.edition}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 03: Process / 3 Steps */}
        <section id="process" className="px-6 md:px-12 py-24 md:py-36 max-w-[1700px] mx-auto border-t border-black/10">
          <div className="space-y-4 pb-16">
            <span className="micro-tag font-mono block">[ 03 / how it works ]</span>
            <h2 className="text-3xl md:text-6xl font-normal lowercase tracking-tight">
              built with intentional constraints.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                title: "curate your five",
                description:
                  "search millions of releases via MusicBrainz. Assemble your definitive top 5 albums and top 5 songs with drag-and-drop reordering.",
              },
              {
                step: "02",
                title: "choose the pressing",
                description:
                  "every edition tells a story. Select the exact cover art variant from the Cover Art Archive — original vinyl, Japanese obi, or anniversary master.",
              },
              {
                step: "03",
                title: "speak to the record",
                description:
                  "publish short text dispatches directly to an album. Anyone who holds that record in their top 5 or follows it sees your voice in their feed.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col justify-between p-8 rounded-2xl bg-white/50 border border-black/5 hover:border-black/20 transition-all duration-300 min-h-[280px]"
              >
                <span className="text-3xl font-mono text-[#0E0E0E]/20 font-light">
                  {item.step}
                </span>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium lowercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#0E0E0E]/65 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 04: FAQ */}
        <section id="faq" className="px-6 md:px-12 py-24 md:py-36 max-w-[1700px] mx-auto border-t border-black/10">
          <div className="space-y-4 pb-12">
            <span className="micro-tag font-mono block">[ 04 / frequently asked questions ]</span>
            <h2 className="text-3xl md:text-6xl font-normal lowercase tracking-tight">
              answers before you dive in.
            </h2>
          </div>

          <SidejobFaq />
        </section>

        {/* Footer */}
        <footer className="border-t border-black/10 px-6 md:px-12 py-12 max-w-[1700px] mx-auto flex flex-col md:flex-row items-baseline justify-between gap-6 text-xs text-[#0E0E0E]/50">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[#0E0E0E] text-sm lowercase">musi5t</span>
            <span>the social platform for album lovers.</span>
          </div>

          <div className="flex items-center gap-8 font-mono text-[11px]">
            <span>stack: next.js 16 + drizzle + postgresql</span>
            <a href="#" className="hover:text-[#0E0E0E] transition-colors">
              back to top ↑
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
