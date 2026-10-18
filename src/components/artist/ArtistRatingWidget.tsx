"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ArtistRatingWidgetProps {
  artistName: string;
  initialUserScore: number | null;
  initialAverageScore: number | null;
  initialRatingsCount: number;
  isLoggedIn: boolean;
}

export function ArtistRatingWidget({
  artistName,
  initialUserScore,
  initialAverageScore,
  initialRatingsCount,
  isLoggedIn,
}: ArtistRatingWidgetProps) {
  const router = useRouter();
  const [userScore, setUserScore] = useState<number | null>(initialUserScore);
  const [averageScore, setAverageScore] = useState<number | null>(initialAverageScore);
  const [ratingsCount, setRatingsCount] = useState<number>(initialRatingsCount);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (score: number) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      // If clicking the same score, clear rating
      if (userScore === score) {
        const res = await fetch(
          `/api/v1/artists/${encodeURIComponent(artistName)}/rating`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUserScore(null);
          setAverageScore(data.averageScore);
          setRatingsCount(data.ratingsCount);
          router.refresh();
        }
      } else {
        const res = await fetch(
          `/api/v1/artists/${encodeURIComponent(artistName)}/rating`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUserScore(data.userScore);
          setAverageScore(data.averageScore);
          setRatingsCount(data.ratingsCount);
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Failed to update artist rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-primary border border-secondary/15 rounded-[0.5vw] drop-shadow-soft p-[3.5vw] sm:p-[2vw] flex flex-col sm:flex-row sm:items-center justify-between gap-[3vw] sm:gap-[1.5vw]">
      {/* Community Score Display */}
      <div className="flex items-center gap-[3vw] sm:gap-[1.2vw]">
        <div className="w-[16vw] h-[16vw] sm:w-[4.6vw] sm:h-[4.6vw] rounded-[0.4vw] bg-yellow text-secondary flex flex-col items-center justify-center flex-shrink-0 drop-shadow">
          <span className="mediumText font-medium leading-none">
            {averageScore !== null ? averageScore.toFixed(1) : "—"}
          </span>
          <span className="detailText text-secondary/70 mt-[0.5vw] sm:mt-[0.15vw]">
            / 10
          </span>
        </div>

        <div className="flex flex-col gap-[0.5vw] sm:gap-[0.2vw]">
          <span className="extraSmallTextBold lowercase text-secondary/60">
            artist community rating
          </span>
          <span className="smallText font-medium text-secondary">
            {ratingsCount === 0
              ? "No ratings yet"
              : `${ratingsCount} ${ratingsCount === 1 ? "listener rating" : "listener ratings"}`}
          </span>
          <span className="extraSmallText text-secondary/50">
            {userScore
              ? `Your rating: ${userScore}/10 (click ${userScore} again to clear)`
              : isLoggedIn
                ? "Select 1–10 to rate this artist"
                : "Sign in to rate this artist"}
          </span>
        </div>
      </div>

      {/* Interactive 1-10 Score Selector */}
      <div className="flex flex-col items-start sm:items-end">
        <div className="flex items-center gap-[1.2vw] sm:gap-[0.4vw] flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const activeThreshold = hoveredScore ?? userScore ?? 0;
            const isHighlighted = num <= activeThreshold;
            const isExactUserScore = userScore === num;

            return (
              <button
                key={num}
                type="button"
                disabled={submitting}
                onMouseEnter={() => setHoveredScore(num)}
                onMouseLeave={() => setHoveredScore(null)}
                onClick={() => handleRate(num)}
                className={`w-[7.2vw] h-[8vw] sm:w-[2.2vw] sm:h-[2.4vw] rounded-[0.3vw] extraSmallTextBold transition-all cursor-pointer border ${
                  isExactUserScore
                    ? "bg-yellow text-secondary border-secondary/30 scale-105 drop-shadow"
                    : isHighlighted
                      ? "bg-secondary text-primary border-secondary"
                      : "bg-secondary/[0.03] text-secondary/65 border-secondary/15 hover:border-secondary/45 hover:text-secondary hover:scale-105"
                }`}
                title={`Rate ${num}/10`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
