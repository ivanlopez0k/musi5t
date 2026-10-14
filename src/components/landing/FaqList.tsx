"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Why only 5 albums in the Top?",
    answer:
      "Constraints breed identity. Limiting your profile to 5 albums forces you to decide what truly defines your musical DNA, avoiding bloated endless lists and making taste comparisons between listeners instant and meaningful.",
  },
  {
    question: "How does post visibility work?",
    answer:
      "Posts can be tagged with up to 3 albums (#album) or marked as #public. When you talk about an album, your post reaches everyone who has that album in their Top 5 or follows it, connecting you directly to your musical tribe.",
  },
  {
    question: "Can I choose my favorite edition and artwork?",
    answer:
      "Yes. If an album has multiple versions (original pressing, Japanese import, anniversary edition, or vinyl remaster), musi5t lets you pick the exact artwork and pressing that represents your connection to the record.",
  },
  {
    question: "Where do album artworks and metadata come from?",
    answer:
      "We sync with open music databases including MusicBrainz and the Cover Art Archive, with direct fallbacks to Apple Music for pristine, high-resolution covers and verified tracklists.",
  },
  {
    question: "Is there full music streaming on musi5t?",
    answer:
      "musi5t is a social and discussion space, not a subscription streaming platform. We offer audio preview snippets and direct links to Spotify, Apple Music, and vinyl retailers so you can listen anywhere.",
  },
  {
    question: "Can I customize my profile palette?",
    answer:
      "Yes. Every member can select an accent palette for their public profile (/@username) from 5 curated options: Lima, Coral, Cobalto, Violeta, or Mandarina, making each listener's space distinctive.",
  },
  {
    question: "How do ratings and reviews work?",
    answer:
      "You can rate any album from 1 to 10 and publish text reviews. Community averages surface collective consensus, while discussions remain rooted around the music itself.",
  },
  {
    question: "Is musi5t free to join?",
    answer:
      "Completely free. musi5t is built by and for album lovers who believe album culture and deep listening deserve their own dedicated home on the web.",
  },
];

export function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const toggle = (idx: number) => {
    if (openIndex === idx) {
      close(idx);
      setOpenIndex(null);
    } else {
      if (openIndex !== null) {
        close(openIndex);
      }
      open(idx);
      setOpenIndex(idx);
    }
  };

  const open = (idx: number) => {
    const el = answerRefs.current[idx];
    const text = textRefs.current[idx];
    if (!el || !text) return;

    gsap.killTweensOf([el, text]);
    gsap.set(el, { height: el.offsetHeight });
    gsap.to(el, {
      height: text.offsetHeight,
      duration: 0.7,
      ease: "power3.out",
      onComplete: () => {
        gsap.set(el, { height: "auto" });
      },
    });
    gsap.to(text, {
      y: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  const close = (idx: number) => {
    const el = answerRefs.current[idx];
    const text = textRefs.current[idx];
    if (!el) return;

    gsap.killTweensOf([el, text]);
    gsap.set(el, { height: el.offsetHeight });
    gsap.to(el, {
      height: 0,
      duration: 0.45,
      ease: "power3.out",
    });
    if (text) {
      gsap.to(text, {
        y: "1.1em",
        duration: 0.45,
        ease: "power3.out",
      });
    }
  };

  useEffect(() => {
    answerRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { height: 0 });
      if (textRefs.current[i]) gsap.set(textRefs.current[i], { y: "1.1em" });
    });
  }, []);

  return (
    <div className="flex flex-col w-full select-none">
      {FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        const isHovered = hoveredIndex === idx;

        return (
          <div key={idx} className="faq-item w-full border-b border-secondary/10">
            <button
              type="button"
              onClick={() => toggle(idx)}
              onPointerEnter={() => setHoveredIndex(idx)}
              onPointerLeave={() => setHoveredIndex(null)}
              aria-expanded={isOpen}
              className={`faq-row flex flex-col w-full py-[4vw] sm:py-[2vw] text-left cursor-pointer transition-colors duration-300 ${
                isHovered ? "bg-secondary/5" : ""
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="faq-question mediumText pr-[4vw] sm:pr-0 font-normal">
                  {item.question}
                </span>

                <div
                  className={`faq-icon rounded-[0.5vw] sm:rounded-[0.25vw] shrink-0 transition-transform duration-300 ${
                    isOpen ? "is-open" : ""
                  }`}
                >
                  <div className="faq-icon__sq w-[4vw] h-[4vw] sm:w-[1.25vw] sm:h-[1.25vw] bg-yellow rounded-[0.5vw] sm:rounded-[0.2vw]" />
                </div>
              </div>

              {/* Collapsible Answer */}
              <div
                ref={(el) => {
                  answerRefs.current[idx] = el;
                }}
                className="faq-answer overflow-hidden"
              >
                <p
                  ref={(el) => {
                    textRefs.current[idx] = el;
                  }}
                  className="faq-answer__text extraSmallText text-secondary/60 pt-[3vw] sm:pt-[1.25vw] pr-[8vw] sm:pr-[2vw] sm:w-[90%] leading-relaxed"
                >
                  {item.answer}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
