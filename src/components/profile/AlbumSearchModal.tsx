"use client";

import React, { useState, useEffect, useRef } from "react";
import type { CatalogAlbum, AlbumEdition } from "@/lib/catalog/musicbrainz";

interface AlbumSearchModalProps {
  isOpen: boolean;
  position: number;
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

  // When an album is picked, fetch available editions
  const handlePickAlbum = async (album: CatalogAlbum) => {
    setSelectedAlbum(album);
    setSelectedEdition({
      releaseMbid: album.mbid,
      title: "Standard Edition",
      country: null,
      year: album.releaseYear,
      disambiguation: "Default Artwork",
      coverUrl: album.defaultCoverUrl,
    });

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#141412] text-[#E6E5DF] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-md text-black shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              0{position}
            </span>
            <h2 className="text-xl font-normal tracking-tight">
              {selectedAlbum ? "Choose Album Edition & Cover" : `Select Album for #${position}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-mono opacity-50 hover:opacity-100 transition-opacity px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  className="w-full bg-[#1C1C19] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-[#E6E5DF] placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-colors"
                />
              </div>

              {loading && (
                <div className="text-center py-10 font-mono text-xs opacity-50 animate-pulse">
                  Searching catalog...
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="text-center py-12 text-sm opacity-50">
                  No albums found for &ldquo;{query}&rdquo;.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((alb) => (
                  <button
                    key={alb.id}
                    type="button"
                    onClick={() => handlePickAlbum(alb)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left cursor-pointer group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={alb.defaultCoverUrl}
                      alt={alb.title}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-sm truncate">{alb.title}</h4>
                      <p className="text-xs opacity-60 truncate">
                        {alb.artistName} {alb.releaseYear ? `• ${alb.releaseYear}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            // Edition Selection Step
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-medium">{selectedAlbum.title}</h3>
                  <p className="text-xs opacity-60 font-mono">{selectedAlbum.artistName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(null)}
                  className="text-xs font-mono underline opacity-70 hover:opacity-100"
                >
                  ← Change Album
                </button>
              </div>

              {loadingEditions ? (
                <div className="text-center py-8 font-mono text-xs opacity-50 animate-pulse">
                  Fetching available pressings and covers...
                </div>
              ) : (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider opacity-60 mb-3">
                    Available Portadas / Pressings:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {editions.map((ed, idx) => {
                      const isSelected = selectedEdition?.coverUrl === ed.coverUrl;
                      return (
                        <button
                          key={`${ed.releaseMbid}-${idx}`}
                          type="button"
                          onClick={() => setSelectedEdition(ed)}
                          className={`relative flex flex-col p-2 rounded-xl border transition-all text-left cursor-pointer ${
                            isSelected
                              ? "border-white/80 bg-white/10 ring-2 ring-white/30"
                              : "border-white/10 hover:border-white/30 bg-white/[0.02]"
                          }`}
                        >
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2 bg-black/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ed.coverUrl}
                              alt={ed.title}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <span
                                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-black font-bold"
                                style={{ backgroundColor: accentColor }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium truncate">{ed.title}</span>
                          <span className="text-[10px] opacity-60 truncate">
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

        {/* Modal Bottom Bar */}
        {selectedAlbum && (
          <div className="p-5 border-t border-white/10 bg-[#11110F] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedAlbum(null)}
              className="text-xs font-mono uppercase px-4 py-2 opacity-60 hover:opacity-100"
            >
              Back
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase text-black shadow-lg transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              {submitting ? "Saving..." : `Set as #${position}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
