"use client";

import { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "01",
    question: "why are posts anchored to albums instead of personal feeds?",
    answer:
      "because music commentary has always been scattered across generic feeds where it gets buried. By rooting discussions in specific records, you connect directly with the people who share your exact emotional frequencies.",
  },
  {
    id: "02",
    question: "how does the visibility rule work?",
    answer:
      "when you publish a post to an album, it surfaces for anyone who has that record in their top 5, or follows that album. No engagement algorithms, no clickbait — pure musical affinity.",
  },
  {
    id: "03",
    question: "can i choose which vinyl pressing or cover artwork to show?",
    answer:
      "yes. Powered by MusicBrainz and Cover Art Archive, you can select the exact edition — whether it's the 1969 UK first pressing, a Japanese obi-strip edition, or the 2017 anniversary remaster.",
  },
  {
    id: "04",
    question: "what is the purpose of custom profile color palettes?",
    answer:
      "every person's record collection has a distinct mood. You can customize your public profile (@handle) with one of our editorial palettes — Lime, Coral, Cobalt, Violet, Tangerine, Obsidian, or Forest Green — without polluting the rest of the application.",
  },
];

export function SidejobFaq() {
  const [openId, setOpenId] = useState<string | null>("01");

  return (
    <div className="w-full flex flex-col divide-y divide-black/10 border-y border-black/10">
      {FAQS.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div
            key={faq.id}
            className="group/faq transition-colors duration-300 hover:bg-black/[0.02]"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full py-6 md:py-8 flex items-center justify-between text-left cursor-pointer transition-all duration-300 group-hover/faq:px-3"
            >
              <div className="flex items-baseline gap-4 md:gap-8">
                <span className="text-xs font-mono text-[#0E0E0E]/30">{faq.id}</span>
                <span className="text-base md:text-xl font-medium tracking-tight lowercase">
                  {faq.question}
                </span>
              </div>

              {/* Sidejob Rotating Diamond / Plus Icon */}
              <div
                className={`w-6 h-6 rounded-md bg-[#FFE600] flex items-center justify-center shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
                  isOpen ? "rotate-45" : "group-hover/faq:rotate-12"
                }`}
              >
                <span className="text-sm font-bold text-[#0E0E0E] leading-none select-none">
                  +
                </span>
              </div>
            </button>

            {/* Answer Collapse */}
            <div
              className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${
                isOpen ? "max-h-60 pb-8 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-sm md:text-base text-[#0E0E0E]/70 max-w-2xl pl-8 md:pl-12 font-normal leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
