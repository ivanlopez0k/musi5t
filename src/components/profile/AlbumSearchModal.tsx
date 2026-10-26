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

  // Unlisted record registration state
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerTitle, setRegisterTitle] = useState("");
  const [registerArtist, setRegisterArtist] = useState("");
  const [registerYear, setRegisterYear] = useState<string>(() => new Date().getFullYear().toString());
  const [registerCoverUrl, setRegisterCoverUrl] = useState("");
  const [registerSourceUrl, setRegisterSourceUrl] = useState("");
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleModalClose = () => {
    setQuery("");
    setResults([]);
    setSelectedAlbum(null);
    setShowRegisterForm(false);
    setRegisterTitle("");
    setRegisterArtist("");
    setRegisterYear(new Date().getFullYear().toString());
    setRegisterCoverUrl("");
    setRegisterSourceUrl("");
    setRegisterError(null);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerTitle.trim() || !registerArtist.trim()) {
      setRegisterError("Record title and artist name are required.");
      return;
    }

    setRegisterSubmitting(true);
    setRegisterError(null);

    try {
      const res = await fetch("/api/v1/catalog/albums/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: registerTitle.trim(),
          artistName: registerArtist.trim(),
          releaseYear: registerYear ? parseInt(registerYear, 10) : undefined,
          coverUrl: registerCoverUrl.trim() || undefined,
          sourceUrl: registerSourceUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register album");
      }

      const createdAlbum = data.album;
      await onSelectAlbum(
        createdAlbum.id,
        createdAlbum.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
        null,
        {
          title: createdAlbum.title,
          artistName: createdAlbum.artistName,
        }
      );
      handleModalClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register album";
      setRegisterError(message);
    } finally {
      setRegisterSubmitting(false);
    }
  };

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
        handleModalClose();
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
      handleModalClose();
    } catch (err) {
      console.error("Save top album error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const headerTitle = selectedAlbum
    ? "choose edition & sleeve"
    : showRegisterForm
      ? "register unlisted record"
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
            onClick={handleModalClose}
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
          className="flex-1 overflow-y-auto p-[4vw] sm:p-[1.8vw] space-y-[3vw] sm:space-y-[1.4vw] overscroll-contain touch-pan-y"
        >
          {selectedAlbum ? (
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-[2vw] sm:gap-[1vw] touch-pan-y">
                    {editions.map((ed, idx) => {
                      const isSelected = selectedEdition?.coverUrl === ed.coverUrl;
                      return (
                        <button
                          key={`${ed.releaseMbid}-${idx}`}
                          type="button"
                          onClick={() => setSelectedEdition(ed)}
                          style={{ touchAction: "pan-y" }}
                          className={`relative flex flex-col p-[1.5vw] sm:p-[0.75vw] rounded-[0.4vw] border cursor-pointer transition-all text-left touch-pan-y select-none ${
                            isSelected
                              ? "border-secondary bg-secondary/[0.06] drop-shadow-soft"
                              : "border-secondary/15 hover:border-secondary/40 bg-secondary/[0.02]"
                          }`}
                        >
                          <div className="relative aspect-square w-full rounded-[0.3vw] overflow-hidden mb-[1.5vw] sm:mb-[0.6vw] bg-secondary/10 drop-shadow pointer-events-none select-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ed.coverUrl}
                              alt={ed.title}
                              draggable={false}
                              className="w-full h-full object-cover pointer-events-none select-none"
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
                          <div className="flex items-center gap-[1vw] sm:gap-[0.35vw] overflow-hidden mt-[0.5vw] sm:mt-[0.2vw]">
                            {ed.country && (
                              <span className="detailText font-mono uppercase px-[1.2vw] sm:px-[0.35vw] py-[0.1vw] bg-secondary/10 rounded-[0.2vw] text-secondary font-semibold shrink-0">
                                {ed.country}
                              </span>
                            )}
                            <span className="detailText text-secondary/55 truncate">
                              {ed.disambiguation || (ed.country ? `${ed.country} Pressing` : "Official Release")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : showRegisterForm ? (
            // Inline Album Registration Form
            <form onSubmit={handleRegisterSubmit} className="space-y-[3vw] sm:space-y-[1.2vw]">
              <div className="flex items-center justify-between pb-[2vw] sm:pb-[0.8vw] border-b border-secondary/15">
                <div>
                  <h3 className="smallText font-medium text-secondary">
                    Register upcoming / unlisted record
                  </h3>
                  <p className="extraSmallText text-secondary/50">
                    Submit an unlisted or announced record directly into the catalog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setRegisterError(null);
                  }}
                  className="extraSmallText text-secondary/60 hover:text-secondary underline transition-colors cursor-pointer flex-shrink-0"
                >
                  ← back to search
                </button>
              </div>

              {registerError && (
                <div className="p-[2.5vw] sm:p-[0.8vw] rounded-[0.35vw] bg-red-500/10 border border-red-500/30 text-red-400 extraSmallText">
                  {registerError}
                </div>
              )}

              <div className="space-y-[2vw] sm:space-y-[1vw]">
                <div>
                  <label className="block extraSmallText text-secondary/70 mb-[1vw] sm:mb-[0.3vw]">
                    Record Title <span className="text-secondary/40">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerTitle}
                    onChange={(e) => setRegisterTitle(e.target.value)}
                    placeholder="e.g. Abbey Road, The Dark Side of the Moon..."
                    className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[3vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.75vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label className="block extraSmallText text-secondary/70 mb-[1vw] sm:mb-[0.3vw]">
                    Artist Name <span className="text-secondary/40">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registerArtist}
                    onChange={(e) => setRegisterArtist(e.target.value)}
                    placeholder="e.g. The Beatles, Pink Floyd, Daft Punk..."
                    className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[3vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.75vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vw] sm:gap-[1vw] touch-pan-y">
                  <div>
                    <label className="block extraSmallText text-secondary/70 mb-[1vw] sm:mb-[0.3vw]">
                      Release Year <span className="text-secondary/40">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2099"
                      value={registerYear}
                      onChange={(e) => setRegisterYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[3vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.75vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block extraSmallText text-secondary/70 mb-[1vw] sm:mb-[0.3vw]">
                      Cover Image URL <span className="text-secondary/40">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={registerCoverUrl}
                      onChange={(e) => setRegisterCoverUrl(e.target.value)}
                      placeholder="https://... or leave blank for vinyl sleeve"
                      className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[3vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.75vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block extraSmallText text-secondary/70 mb-[1vw] sm:mb-[0.3vw]">
                    Source / Proof URL <span className="text-secondary/40">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={registerSourceUrl}
                    onChange={(e) => setRegisterSourceUrl(e.target.value)}
                    placeholder="AOTY, Spotify, Apple Music, or announcement link"
                    className="w-full bg-secondary/[0.04] border border-secondary/20 rounded-[0.35vw] px-[3vw] py-[2vw] sm:px-[1.2vw] sm:py-[0.75vw] smallText text-secondary placeholder:text-secondary/35 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              <div className="pt-[2vw] sm:pt-[1vw] flex items-center justify-end gap-[2vw] sm:gap-[1vw]">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setRegisterError(null);
                  }}
                  className="extraSmallText text-secondary/60 hover:text-secondary transition-colors cursor-pointer px-[2vw] py-[1vw] sm:px-[1vw] sm:py-[0.5vw]"
                >
                  Cancel
                </button>

                <div className="drop-shadow rounded-[1vw] sm:rounded-[0.25vw]">
                  <button
                    type="submit"
                    disabled={registerSubmitting}
                    className="main-btn smallText text-secondary disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span className="main-btn__icon" aria-hidden="true" />
                    <span className="main-btn__label">
                      <span className="main-btn__clip">
                        <span className="main-btn__from">
                          {registerSubmitting ? "Registering..." : "Register and select record"}
                        </span>
                        <span className="main-btn__to" aria-hidden="true">
                          {registerSubmitting ? "Registering..." : "Register and select record"}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vw] sm:gap-[1vw] touch-pan-y">
                  {results.map((alb) => (
                    <button
                      key={alb.id}
                      type="button"
                      onClick={() => handlePickAlbum(alb)}
                      style={{ touchAction: "pan-y" }}
                      className="bg-primary hover:bg-secondary/[0.03] border border-secondary/15 hover:border-secondary/40 rounded-[0.4vw] p-[2vw] sm:p-[0.9vw] flex items-center gap-[1.5vw] sm:gap-[0.8vw] drop-shadow-soft cursor-pointer transition-all group text-left touch-pan-y select-none"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={alb.defaultCoverUrl}
                        alt={alb.title}
                        draggable={false}
                        className="aspect-square w-[14vw] sm:w-[4.2vw] rounded-[0.3vw] object-cover flex-shrink-0 drop-shadow group-hover:scale-105 transition-transform pointer-events-none select-none"
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

              {/* Register upcoming / unlisted record editorial button */}
              <div className="pt-[2vw] sm:pt-[1vw] border-t border-secondary/10 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(true);
                    if (query.trim() && !registerTitle) {
                      setRegisterTitle(query.trim());
                    }
                    setRegisterError(null);
                  }}
                  className="extraSmallText text-secondary/60 hover:text-secondary hover:underline transition-colors cursor-pointer flex items-center gap-[1vw] sm:gap-[0.4vw]"
                >
                  <span>+ Register upcoming / unlisted record</span>
                </button>
              </div>
            </>
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
