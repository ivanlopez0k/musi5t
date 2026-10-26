"use client";

import React, { useState, useEffect, useRef } from "react";
import type { CatalogSong } from "@/lib/catalog/musicbrainz";

interface SongSearchModalProps {
  isOpen: boolean;
  position: number;
  onClose: () => void;
  onSelectSong: (songId: string) => Promise<void>;
  accentColor: string;
}

export function SongSearchModal({
  isOpen,
  position,
  onClose,
  onSelectSong,
  accentColor,
}: SongSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/catalog/songs?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.songs || []);
        }
      } catch (err) {
        console.error("Song search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handlePick = async (song: CatalogSong) => {
    setSubmittingId(song.id);
    try {
      await onSelectSong(song.id);
      onClose();
    } catch (err) {
      console.error("Select song error:", err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 pt-[5vh] sm:pt-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-primary text-secondary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.6vw] drop-shadow-soft overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[85vh] my-auto">
        {/* Modal Top Bar */}
        <div className="px-[4vw] py-[3vw] sm:px-[1.8vw] sm:py-[1.3vw] border-b border-secondary/15 flex items-center justify-between bg-primary shrink-0">
          <div className="flex items-center gap-[2vw] sm:gap-[0.8vw]">
            <div className="drop-shadow rounded-[0.25vw]">
              <div
                className="sm:w-[1.4vw] sm:h-[1.4vw] w-[4vw] h-[4vw] rounded-[0.2vw]"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <h2 className="mediumText lowercase">curate track #{position}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="extraSmallText text-secondary/50 hover:text-secondary transition-colors px-[1vw] py-[0.5vw] sm:px-[0.5vw] sm:py-[0.25vw] cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div
          data-lenis-prevent
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          className="p-[4vw] sm:p-[1.8vw] space-y-[3vw] sm:space-y-[1.4vw] flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y"
        >
          <div>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search track title or artist (e.g. Karma Police, Hard to Explain...)"
              className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[3vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.75vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          {loading && (
            <div className="text-center py-[6vw] sm:py-[2.5vw] extraSmallText text-secondary/50 animate-pulse">
              Searching tracks...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-[6vw] sm:py-[2.5vw] smallText text-secondary/50">
              No tracks found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {!loading && !query && results.length === 0 && (
            <div className="py-[4vw] sm:py-[1.8vw] text-center extraSmallText text-secondary/45">
              Type a song title or artist name to curate track #{position}.
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-[0.4vw] bg-primary drop-shadow-soft">
              {results.map((song) => {
                const isSaving = submittingId === song.id;
                const btnLabel = isSaving ? "Saving..." : "Select";
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-[2.5vw] sm:p-[0.9vw] hover:bg-secondary/[0.03] transition-colors gap-[2vw] sm:gap-[1vw]"
                  >
                    <div className="flex items-center gap-[2vw] sm:gap-[0.8vw] flex-1 min-w-0">
                      {song.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          draggable={false}
                          className="aspect-square w-[11vw] sm:w-[3.2vw] object-cover rounded-[0.25vw] flex-shrink-0 drop-shadow pointer-events-none"
                        />
                      ) : (
                        <div className="aspect-square w-[11vw] sm:w-[3.2vw] rounded-[0.25vw] bg-secondary/10 flex items-center justify-center extraSmallText text-secondary/60 flex-shrink-0 pointer-events-none">
                          ♪
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="smallText font-medium text-secondary truncate">
                          {song.title}
                        </h4>
                        <p className="extraSmallText text-secondary/60 truncate">
                          {song.artistName}
                        </p>
                      </div>
                    </div>

                    <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw] flex-shrink-0">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handlePick(song)}
                        className="main-btn smallText text-secondary disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: accentColor }}
                      >
                        <span className="main-btn__icon" aria-hidden="true" />
                        <span className="main-btn__label">
                          <span className="main-btn__clip">
                            <span className="main-btn__from">{btnLabel}</span>
                            <span className="main-btn__to" aria-hidden="true">
                              {btnLabel}
                            </span>
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
