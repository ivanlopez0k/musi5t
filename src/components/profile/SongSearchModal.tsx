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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#141412] text-[#E6E5DF] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-md text-black shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              0{position}
            </span>
            <h2 className="text-xl font-normal tracking-tight">
              Select Track for #{position}
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

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search track title or artist (e.g. Karma Police, Hard to Explain...)"
              className="w-full bg-[#1C1C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#E6E5DF] placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-colors"
            />
          </div>

          {loading && (
            <div className="text-center py-8 font-mono text-xs opacity-50 animate-pulse">
              Searching tracks...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-sm opacity-50">
              No tracks found for &ldquo;{query}&rdquo;.
            </div>
          )}

          <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden">
            {results.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {song.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center font-mono text-xs flex-shrink-0">
                      ♪
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-medium text-sm truncate">{song.title}</h4>
                    <p className="text-xs opacity-60 truncate">{song.artistName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={submittingId === song.id}
                  onClick={() => handlePick(song)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium text-black transition-transform hover:scale-105 disabled:opacity-50 flex-shrink-0 cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  {submittingId === song.id ? "Saving..." : "Select"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
