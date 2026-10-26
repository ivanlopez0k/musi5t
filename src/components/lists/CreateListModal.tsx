"use client";

import React, { useState, useEffect } from "react";
import { AlbumSearchModal } from "@/components/profile/AlbumSearchModal";
import type { DetailedList, ListSummary } from "@/lib/lists/service";

export interface EditableListItem {
  albumId: string;
  position: number;
  notes: string;
  coverUrl: string;
  albumTitle: string;
  albumArtist: string;
}

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (list: DetailedList | ListSummary) => void;
  initialData?: {
    id?: string;
    title: string;
    description: string | null;
    isPublic: boolean;
    items: Array<{
      albumId: string;
      position: number;
      notes?: string | null;
      coverUrl?: string | null;
      album?: {
        title: string;
        artistName: string;
        defaultCoverUrl?: string | null;
      };
    }>;
  };
  accentColor?: string;
}

interface FormContentProps {
  initialData?: CreateListModalProps["initialData"];
  accentColor: string;
  onClose: () => void;
  onSuccess: (list: DetailedList | ListSummary) => void;
}

function CreateListFormContent({
  initialData,
  accentColor,
  onClose,
  onSuccess,
}: FormContentProps) {
  const [title, setTitle] = useState(() => initialData?.title || "");
  const [description, setDescription] = useState(() => initialData?.description || "");
  const [isPublic, setIsPublic] = useState(() => (initialData ? initialData.isPublic : true));
  const [items, setItems] = useState<EditableListItem[]>(() => {
    if (!initialData?.items) return [];
    return initialData.items.map((it, idx) => ({
      albumId: it.albumId,
      position: it.position ?? idx + 1,
      notes: it.notes || "",
      coverUrl: it.coverUrl || it.album?.defaultCoverUrl || "/images/musi5t/vinyl_player.webp",
      albumTitle: it.album?.title || "Album",
      albumArtist: it.album?.artistName || "Artist",
    }));
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !searchModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchModalOpen, onClose]);

  const handleSelectAlbum = async (
    albumId: string,
    coverUrl: string,
    _coverReleaseMbid: string | null,
    albumMeta?: { title: string; artistName: string }
  ) => {
    if (items.some((it) => it.albumId === albumId)) {
      setError("This album is already added to the list.");
      return;
    }

    const newItem: EditableListItem = {
      albumId,
      position: items.length + 1,
      notes: "",
      coverUrl: coverUrl || "/images/musi5t/vinyl_player.webp",
      albumTitle: albumMeta?.title || "Unknown Album",
      albumArtist: albumMeta?.artistName || "Unknown Artist",
    };

    setItems((prev) => [...prev, newItem]);
    setError(null);
    setSearchModalOpen(false);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
  };

  const handleRemove = (index: number) => {
    setItems((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
  };

  const handleNoteChange = (index: number, newNote: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], notes: newNote };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please provide a title for your list.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least 1 album to your list.");
      return;
    }

    setSubmitting(true);

    try {
      const isEditing = Boolean(initialData?.id);
      const endpoint = isEditing ? `/api/v1/lists/${initialData?.id}` : "/api/v1/lists";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        title: trimmedTitle,
        description: description.trim() || null,
        isPublic,
        items: items.map((it, idx) => ({
          albumId: it.albumId,
          position: idx + 1,
          notes: it.notes.trim() || null,
          coverUrl: it.coverUrl,
        })),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save list");
      }

      onSuccess(data.list);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-list-title"
        className="fixed inset-0 z-50 bg-secondary/80 backdrop-blur-md flex items-center justify-center p-[4vw] sm:p-[2vw]"
      >
        <div
            data-lenis-prevent
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
            className="w-full max-w-[680px] max-h-[90dvh] sm:max-h-[92vh] overflow-y-auto hide-scrollbar bg-primary text-secondary border border-secondary/15 rounded-[1.5vw] sm:rounded-[0.5vw] drop-shadow-soft p-[5vw] sm:p-[2.5vw] flex flex-col gap-[4vw] sm:gap-[1.5vw] relative overscroll-contain touch-pan-y"
          >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-secondary/10 pb-[3vw] sm:pb-[1vw]">
            <div className="flex items-center gap-[2vw] sm:gap-[0.8vw]">
              <div className="drop-shadow rounded-[0.2vw]">
                <div
                  className="w-[4vw] h-[4vw] sm:w-[1.2vw] sm:h-[1.2vw] rounded-[0.15vw] transition-colors"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
              <h3 id="create-list-title" className="mediumText font-medium text-secondary">
                {initialData?.id ? "edit curated list" : "new curated list"}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-[7vw] h-[7vw] sm:w-[2vw] sm:h-[2vw] rounded-[0.25vw] bg-secondary/5 hover:bg-secondary/15 text-secondary flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="p-[3vw] sm:p-[0.8vw] rounded-[0.3vw] bg-red-500/10 border border-red-500/25 text-red-500 extraSmallText">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[4vw] sm:gap-[1.5vw]">
            {/* Title Input */}
            <div className="flex flex-col gap-[1.5vw] sm:gap-[0.4vw]">
              <label htmlFor="list-title" className="extraSmallText uppercase tracking-wider text-secondary/60 font-medium">
                List Title *
              </label>
              <input
                id="list-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Late Night Jazz Essentials, 90s Shoegaze Gems..."
                maxLength={100}
                required
                className="w-full px-[3.5vw] py-[2.5vw] sm:px-[1vw] sm:py-[0.6vw] rounded-[0.3vw] bg-secondary/[0.04] border border-secondary/15 focus:border-secondary/40 text-secondary smallText outline-none transition-colors"
              />
              <span className="extraSmallText text-secondary/40 text-right">
                {title.length}/100
              </span>
            </div>

            {/* Description Input */}
            <div className="flex flex-col gap-[1.5vw] sm:gap-[0.4vw]">
              <label htmlFor="list-description" className="extraSmallText uppercase tracking-wider text-secondary/60 font-medium">
                Description & Theme (optional)
              </label>
              <textarea
                id="list-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give your list some narrative context, backstory, or what unites these albums..."
                maxLength={1000}
                rows={3}
                className="w-full px-[3.5vw] py-[2.5vw] sm:px-[1vw] sm:py-[0.6vw] rounded-[0.3vw] bg-secondary/[0.04] border border-secondary/15 focus:border-secondary/40 text-secondary extraSmallText outline-none resize-none transition-colors"
              />
              <span className="extraSmallText text-secondary/40 text-right">
                {description.length}/1000
              </span>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-[3vw] sm:p-[1vw] rounded-[0.3vw] bg-secondary/[0.03] border border-secondary/10">
              <div className="flex flex-col">
                <span className="smallText font-medium text-secondary">
                  {isPublic ? "Public List" : "Private List"}
                </span>
                <span className="extraSmallText text-secondary/60">
                  {isPublic
                    ? "Visible to anyone on the community feed and your profile."
                    : "Only visible to you when signed into this account."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-[6vw] w-[11vw] sm:h-[1.6vw] sm:w-[2.8vw] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublic ? "bg-secondary" : "bg-secondary/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[5vw] w-[5vw] sm:h-[1.3vw] sm:w-[1.3vw] transform rounded-full bg-primary shadow ring-0 transition duration-200 ease-in-out ${
                    isPublic ? "translate-x-[5vw] sm:translate-x-[1.2vw]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Added Albums Section */}
            <div className="flex flex-col gap-[2vw] sm:gap-[0.8vw]">
              <div className="flex items-center justify-between">
                <label className="extraSmallText uppercase tracking-wider text-secondary/60 font-medium">
                  Albums in this list ({items.length})
                </label>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(true)}
                  className="extraSmallText font-medium px-[3vw] py-[1.2vw] sm:px-[0.8vw] sm:py-[0.35vw] rounded-[0.25vw] border border-secondary/25 hover:border-secondary text-secondary transition-colors cursor-pointer flex items-center gap-[1vw] sm:gap-[0.4vw]"
                >
                  <span>+</span>
                  <span>Add Album</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-secondary/20 rounded-[0.4vw] p-[6vw] sm:p-[2.5vw] text-center flex flex-col items-center justify-center gap-[2vw] sm:gap-[0.8vw]">
                  <p className="extraSmallText text-secondary/50">
                    No albums added yet. Start by adding your first record!
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchModalOpen(true)}
                    className="extraSmallText px-[3.5vw] py-[1.5vw] sm:px-[1vw] sm:py-[0.4vw] rounded-[0.25vw] bg-secondary/10 hover:bg-secondary/20 text-secondary transition-colors cursor-pointer"
                  >
                    Search Catalog
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-[2.5vw] sm:gap-[0.8vw] max-h-[38vh] overflow-y-auto pr-[1vw]">
                  {items.map((item, idx) => (
                    <div
                      key={item.albumId}
                      className="flex flex-col gap-[1.5vw] sm:gap-[0.5vw] p-[3vw] sm:p-[0.8vw] rounded-[0.35vw] bg-secondary/[0.03] border border-secondary/10"
                    >
                      <div className="flex items-center justify-between gap-[2vw]">
                        <div className="flex items-center gap-[2vw] sm:gap-[0.8vw] min-w-0">
                          {/* Position Badge */}
                          <span className="font-mono text-[3.2vw] sm:text-[0.85vw] font-bold text-secondary/40 shrink-0 w-[5vw] sm:w-[1.6vw]">
                            {String(idx + 1).padStart(2, "0")}
                          </span>

                          {/* Cover Thumbnail */}
                          <div className="w-[10vw] h-[10vw] sm:w-[2.8vw] sm:h-[2.8vw] rounded-[0.2vw] overflow-hidden bg-primary shrink-0 border border-secondary/15">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.coverUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Title & Artist */}
                          <div className="flex flex-col min-w-0">
                            <span className="extraSmallTextBold text-secondary truncate">
                              {item.albumTitle}
                            </span>
                            <span className="extraSmallText text-secondary/50 truncate">
                              {item.albumArtist}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-[1.5vw] sm:gap-[0.4vw] shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            title="Move up"
                            className="p-[1.5vw] sm:p-[0.35vw] rounded-[0.2vw] hover:bg-secondary/10 text-secondary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === items.length - 1}
                            title="Move down"
                            className="p-[1.5vw] sm:p-[0.35vw] rounded-[0.2vw] hover:bg-secondary/10 text-secondary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            title="Remove album"
                            className="p-[1.5vw] sm:p-[0.35vw] rounded-[0.2vw] hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Album Note Input */}
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleNoteChange(idx, e.target.value)}
                        placeholder="Add a personal note or reflection for this record (optional)..."
                        maxLength={500}
                        className="w-full px-[2.5vw] py-[1.5vw] sm:px-[0.6vw] sm:py-[0.35vw] rounded-[0.2vw] bg-secondary/[0.02] border border-secondary/10 focus:border-secondary/30 text-secondary extraSmallText outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-[3vw] sm:gap-[1vw] border-t border-secondary/10 pt-[3.5vw] sm:pt-[1vw] mt-[2vw]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="extraSmallText text-secondary/60 hover:text-secondary px-[4vw] py-[2vw] sm:px-[1vw] sm:py-[0.5vw] rounded-[0.3vw] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || items.length === 0 || !title.trim()}
                className="extraSmallText font-medium px-[5vw] py-[2vw] sm:px-[1.4vw] sm:py-[0.5vw] rounded-[0.3vw] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow"
                style={{
                  backgroundColor: accentColor,
                  color: "#0E0E0E",
                }}
              >
                {submitting ? "Saving..." : initialData?.id ? "Save Changes" : "Create List"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Album Search Modal */}
      {searchModalOpen && (
        <AlbumSearchModal
          isOpen={searchModalOpen}
          enableEditionSelection={false}
          onClose={() => setSearchModalOpen(false)}
          onSelectAlbum={handleSelectAlbum}
          accentColor={accentColor}
        />
      )}
    </>
  );
}

export function CreateListModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  accentColor = "#E3E75A",
}: CreateListModalProps) {
  if (!isOpen) return null;

  return (
    <CreateListFormContent
      key={initialData?.id || "new-list"}
      initialData={initialData}
      accentColor={accentColor}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
