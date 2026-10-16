"use client";

import React, { useState, useEffect, useRef } from "react";
import type { CatalogAlbum, AlbumEdition } from "@/lib/catalog/musicbrainz";

interface AlbumSearchModalProps {
  isOpen: boolean;
  position?: number;
  enableEditionSelection?: boolean;
  onClose: () => void;
  onSelectAlbum: (
    albumId: string,
    coverUrl: string,
    coverReleaseMbid: string | null,
    albumMeta?: { title: string; artistName: string }
  ) => Promise<void>;
  accentColor: string;
}

export function AlbumSearchModal({
  isOpen,
  position,
  enableEditionSelection = Boolean(position),
  onClose,
  onSelectAlbum,
  accentColor,
}: AlbumSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<CatalogAlbum | null>(null);
  const [editions, setEditions] = useState<AlbumEdition[]>([]);
  const [loadingEditions, setLoadingEditions] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<AlbumEdition | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
        const res = await fetch(`/api/v1/catalog/albums?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.albums || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  // When an album is picked: if edition selection is disabled, select immediately in 1 click
  const handlePickAlbum = async (album: CatalogAlbum) => {
    if (!enableEditionSelection) {
      setSubmitting(true);
      try {
        await onSelectAlbum(album.id, album.defaultCoverUrl, null, {
          title: album.title,
          artistName: album.artistName,
        });
        onClose();
      } catch (err) {
        console.error("Select album error:", err);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Top 5 records flow: fetch available pressings and covers
    setSelectedAlbum(album);
    const defaultEdition: AlbumEdition = {
      releaseMbid: album.mbid,
      title: "Standard Edition",
      country: null,
      year: album.releaseYear,
      disambiguation: "Official Cover Art",
      coverUrl: album.defaultCoverUrl,
    };
    setSelectedEdition(defaultEdition);
    setEditions([defaultEdition]);

    setLoadingEditions(true);
    try {
      const res = await fetch(`/api/v1/catalog/albums/${album.id}/covers`);
      if (res.ok) {
        const data = await res.json();
        if (data.editions && data.editions.length > 0) {
          setEditions(data.editions);
        }
      }
    } catch (err) {
      console.error("Failed to fetch editions:", err);
    } finally {
      setLoadingEditions(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAlbum) return;
    setSubmitting(true);
    try {
      const coverUrl = selectedEdition?.coverUrl || selectedAlbum.defaultCoverUrl;
      const releaseMbid =
        selectedEdition && selectedEdition.releaseMbid !== selectedAlbum.mbid
          ? selectedEdition.releaseMbid
          : null;

      await onSelectAlbum(selectedAlbum.id, coverUrl, releaseMbid, {
        title: selectedAlbum.title,
        artistName: selectedAlbum.artistName,
      });
      onClose();
    } catch (err) {
      console.error("Save top album error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const headerTitle = selectedAlbum
    ? "choose edition & sleeve"
    : position
      ? `curate record #${position}`
      : "tag record in discussion";

  const confirmLabel = submitting
    ? "Saving..."
    : position
      ? `Save selection`
      : "Confirm album";

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-primary text-secondary border border-secondary/15 rounded-[0.6vw] drop-shadow-soft overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Top Bar */}
        <div className="px-[4vw] py-[3vw] sm:px-[1.8vw] sm:py-[1.3vw] border-b border-secondary/15 flex items-center justify-between bg-primary">
          <div className="flex items-center gap-[2vw] sm:gap-[0.8vw]">
            <div className="drop-shadow rounded-[0.25vw]">
              <div
                className="sm:w-[1.4vw] sm:h-[1.4vw] w-[4vw] h-[4vw] rounded-[0.2vw]"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            <h2 className="mediumText lowercase">{headerTitle}</h2>
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
        <div className="flex-1 overflow-y-auto p-[4vw] sm:p-[1.8vw] space-y-[3vw] sm:space-y-[1.4vw]">
          {!selectedAlbum ? (
            // Search Step
            <>
              <div>
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search album title or artist (e.g. OK Computer, The Strokes...)"
                  className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[3vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.75vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {loading && (
                <div className="text-center py-[6vw] sm:py-[2.5vw] extraSmallText text-secondary/50 animate-pulse">
                  Searching catalog...
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="text-center py-[6vw] sm:py-[2.5vw] smallText text-secondary/50">
                  No albums found for &ldquo;{query}&rdquo;.
                </div>
              )}

              {!loading && !query && results.length === 0 && (
                <div className="py-[4vw] sm:py-[1.8vw] text-center extraSmallText text-secondary/45">
                  Type an album title or artist name to explore canonical records.
                </div>
              )}

              {results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vw] sm:gap-[1vw]">
                  {results.map((alb) => (
                    <button
                      key={alb.id}
                      type="button"
                      onClick={() => handlePickAlbum(alb)}
                      className="bg-primary hover:bg-secondary/[0.03] border border-secondary/15 hover:border-secondary/40 rounded-[0.4vw] p-[2vw] sm:p-[0.9vw] flex items-center gap-[1.5vw] sm:gap-[0.8vw] drop-shadow-soft cursor-pointer transition-all group text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={alb.defaultCoverUrl}
                        alt={alb.title}
                        className="aspect-square w-[14vw] sm:w-[4.2vw] rounded-[0.3vw] object-cover flex-shrink-0 drop-shadow group-hover:scale-105 transition-transform"
                      />
                      <div className="overflow-hidden flex-1">
                        <h4 className="smallText font-medium text-secondary truncate">
                          {alb.title}
                        </h4>
                        <p className="extraSmallText text-secondary/60 truncate">
                          {alb.artistName}{" "}
                          {alb.releaseYear ? `• ${alb.releaseYear}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Edition / Pressing Selection Step
            <div className="space-y-[3vw] sm:space-y-[1.4vw]">
              <div className="flex items-center justify-between pb-[2.5vw] sm:pb-[1vw] border-b border-secondary/15">
                <div className="overflow-hidden pr-[2vw]">
                  <h3 className="mediumText text-secondary truncate">
                    {selectedAlbum.title}
                  </h3>
                  <p className="extraSmallText text-secondary/60 truncate">
                    {selectedAlbum.artistName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="extraSmallText text-secondary/60 hover:text-secondary underline transition-colors cursor-pointer flex-shrink-0"
                >
                  ← change record
                </button>
              </div>

              {loadingEditions ? (
                <div className="text-center py-[6vw] sm:py-[2.5vw] extraSmallText text-secondary/50 animate-pulse">
                  Fetching available pressings and covers...
                </div>
              ) : (
                <div>
                  <p className="detailText text-secondary/50 lowercase mb-[2vw] sm:mb-[0.8vw]">
                    available pressings & sleeves
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-[2vw] sm:gap-[1vw]">
                    {editions.map((ed, idx) => {
                      const isSelected = selectedEdition?.coverUrl === ed.coverUrl;
                      return (
                        <button
                          key={`${ed.releaseMbid}-${idx}`}
                          type="button"
                          onClick={() => setSelectedEdition(ed)}
                          className={`relative flex flex-col p-[1.5vw] sm:p-[0.75vw] rounded-[0.4vw] border cursor-pointer transition-all text-left ${
                            isSelected
                              ? "border-secondary bg-secondary/[0.06] drop-shadow-soft"
                              : "border-secondary/15 hover:border-secondary/40 bg-secondary/[0.02]"
                          }`}
                        >
                          <div className="relative aspect-square w-full rounded-[0.3vw] overflow-hidden mb-[1.5vw] sm:mb-[0.6vw] bg-secondary/10 drop-shadow">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ed.coverUrl}
                              alt={ed.title}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <span
                                className="absolute top-[1vw] right-[1vw] sm:top-[0.4vw] sm:right-[0.4vw] w-[4.5vw] h-[4.5vw] sm:w-[1.3vw] sm:h-[1.3vw] rounded-full flex items-center justify-center detailText text-secondary font-bold drop-shadow"
                                style={{ backgroundColor: accentColor }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="extraSmallTextBold text-secondary truncate">
                            {ed.title}
                          </span>
                          <span className="detailText text-secondary/55 truncate">
                            {ed.disambiguation || ed.country || "Official Release"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Confirmation Bar */}
        {selectedAlbum && (
          <div className="px-[4vw] py-[3vw] sm:px-[1.8vw] sm:py-[1.2vw] border-t border-secondary/15 bg-primary flex items-center justify-between gap-[2vw] sm:gap-[1vw]">
            <button
              type="button"
              onClick={() => setSelectedAlbum(null)}
              className="extraSmallText text-secondary/60 hover:text-secondary transition-colors cursor-pointer"
            >
              ← Back to search
            </button>
            <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirm}
                className="main-btn smallText text-secondary disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                <span className="main-btn__icon" aria-hidden="true" />
                <span className="main-btn__label">
                  <span className="main-btn__clip">
                    <span className="main-btn__from">{confirmLabel}</span>
                    <span className="main-btn__to" aria-hidden="true">
                      {confirmLabel}
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
