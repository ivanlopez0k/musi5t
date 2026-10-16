"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AlbumRatingWidgetProps {
  albumId: string;
  initialUserScore: number | null;
  initialAverageScore: number | null;
  initialRatingsCount: number;
  isLoggedIn: boolean;
}

export function AlbumRatingWidget({
  albumId,
  initialUserScore,
  initialAverageScore,
  initialRatingsCount,
  isLoggedIn,
}: AlbumRatingWidgetProps) {
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
        const res = await fetch(`/api/v1/albums/${albumId}/rating`, {
          method: "DELETE",
        });
        if (res.ok) {
          const data = await res.json();
          setUserScore(null);
          setAverageScore(data.averageScore);
          setRatingsCount(data.ratingsCount);
          router.refresh();
        }
      } else {
        const res = await fetch(`/api/v1/albums/${albumId}/rating`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
        });
        if (res.ok) {
          const data = await res.json();
          setUserScore(data.userScore);
          setAverageScore(data.averageScore);
          setRatingsCount(data.ratingsCount);
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Failed to update album rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-white/10 bg-[#161614] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      {/* Community Score Display */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FFE600] text-black flex flex-col items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-2xl font-bold tracking-tight leading-none">
            {averageScore !== null ? averageScore.toFixed(1) : "—"}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider opacity-75 mt-0.5">
            / 10
          </span>
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#FFE600] mb-0.5">
            Community Rating
          </div>
          <div className="text-sm text-white/90 font-medium">
            {ratingsCount === 0
              ? "No ratings yet"
              : `${ratingsCount} ${ratingsCount === 1 ? "listener rating" : "listener ratings"}`}
          </div>
          <div className="text-xs font-mono text-white/40 mt-0.5">
            {userScore
              ? `Your rating: ${userScore}/10 (click ${userScore} again to clear)`
              : isLoggedIn
              ? "Select 1–10 to rate this record"
              : "Sign in to rate this record"}
          </div>
        </div>
      </div>

      {/* Interactive 1-10 Score Selector */}
      <div className="flex flex-col items-start sm:items-end gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
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
                className={`w-7 h-8 sm:w-8 sm:h-9 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer border ${
                  isExactUserScore
                    ? "bg-[#FFE600] text-black border-[#FFE600] scale-105 shadow-md"
                    : isHighlighted
                    ? "bg-[#FFE600]/30 text-[#FFE600] border-[#FFE600]/50"
                    : "bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white"
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
