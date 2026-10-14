"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How do you choose the crew?",
    answer:
      "No fixed roster forced onto every brief. We keep a small production core, then pull photographers, filmmakers, stylists, designers, producers, casting and editors from a wider network based on the idea, the location and the craft the job needs.",
  },
  {
    question: "Can you take just one piece of the job?",
    answer:
      "Yes. Full campaign through to a single production lane. Same rule either way: we own that piece properly, with the right people on it, not a loose intro to someone else's calendar.",
  },
  {
    question: "Can you pick up a job that's already creatived?",
    answer:
      "Yes. Bring us in at concept, or once the idea is locked. We'll build the right crew around what's already there and run it to wrap. You shouldn't have to coordinate the freelancers yourself.",
  },
  {
    question: "What should we send to get started?",
    answer:
      "Where you are (idea / locked concept), what you're making, when you need it, roughly what success looks like, and any must-haves (talent, locations, deliverables). Rough is fine. We'll come back with what the job needs and whether we're the right fit.",
  },
  {
    question: "Do you only produce in Oslo?",
    answer:
      "We're based in Oslo and produce there often, but the crew and the job can travel. If the work needs another city, we build for that. Not everything has to run through Norway.",
  },
  {
    question: "Who do you work with?",
    answer:
      "Brands directly, and agencies or in-house teams who need production owned properly. Fashion, sport, hospitality, food and drink, music, lifestyle and culture. If the brief needs a specialist crew and a clean delivery, we're in range.",
  },
  {
    question: "How does pricing work?",
    answer:
      "No packages. We scope the brief, build the crew, and price the work it actually takes: days, people, locations, talent, deliverables. You get a clear figure before anyone's booked. Tell us the ceiling and we'll be honest about what fits inside it.",
  },
  {
    question: "How long does a job take?",
    answer:
      "Depends on the brief. A tight stills job can move in days; a full campaign or launch needs proper pre-production. In the first conversation we'll say what realistic looks like, not a fake turnaround.",
  },
];

export function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const toggle = (idx: number) => {
    if (openIndex === idx) {
      // Close currently open
      close(idx);
      setOpenIndex(null);
    } else {
      // Close previous if any
      if (openIndex !== null) {
        close(openIndex);
      }
      // Open new
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

  // Initial set height: 0
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
