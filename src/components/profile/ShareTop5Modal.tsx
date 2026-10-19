"use client";

import { useState, useEffect } from "react";
import type { ProfilePalette } from "@/lib/profile/palettes";

interface TopAlbumItem {
  id: string;
  albumId?: string;
  position: number;
  coverUrl: string | null;
  title: string;
  artistName: string;
  releaseYear: number | null;
}

interface ShareTop5ModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    displayName: string;
  };
  albums: TopAlbumItem[];
  activePalette: ProfilePalette;
}

export function ShareTop5Modal({
  isOpen,
  onClose,
  user,
  albums,
  activePalette,
}: ShareTop5ModalProps) {
  const [format, setFormat] = useState<"story" | "square">("story");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const downloadUrl = `/api/v1/users/${user.username}/og?format=${format}`;

  const downloadViaCanvas = async () => {
    const width = 1080;
    const height = format === "story" ? 1920 : 1080;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize canvas context");

    // Clean Editorial Background
    ctx.fillStyle = "#F7F7F7";
    ctx.fillRect(0, 0, width, height);

    // Decorative Ambient Circle
    ctx.save();
    ctx.fillStyle = activePalette.secondaryOrb;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(width - 40, -40, format === "story" ? 480 : 350, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Brand Header
    ctx.fillStyle = activePalette.accent;
    ctx.beginPath();
    ctx.roundRect(75, 80, 28, 28, 6);
    ctx.fill();

    ctx.fillStyle = "#0E0E0E";
    ctx.font = "800 38px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("musi5t", 118, 106);

    // User display name & username
    ctx.font = "800 52px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(user.displayName, 75, 195);

    ctx.fillStyle = "rgba(14, 14, 14, 0.55)";
    ctx.font = "500 26px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`@${user.username}'s definitive vinyl rotation`, 75, 238);

    // 5 Albums
    const startY = format === "story" ? 340 : 280;
    const rowHeight = format === "story" ? 245 : 124;
    const coverSize = format === "story" ? 140 : 88;

    for (let pos = 1; pos <= 5; pos++) {
      const album = albums.find((a) => a.position === pos);
      const y = startY + (pos - 1) * rowHeight;
      const cardHeight = format === "story" ? 180 : 104;

      // Card Background
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.strokeStyle = "rgba(14, 14, 14, 0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(75, y, width - 150, cardHeight, 18);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Rank Badge
      const badgeSize = format === "story" ? 54 : 44;
      const badgeY = y + (cardHeight - badgeSize) / 2;
      ctx.fillStyle = pos === 1 ? activePalette.accent : "#0E0E0E";
      ctx.beginPath();
      ctx.roundRect(98, badgeY, badgeSize, badgeSize, 10);
      ctx.fill();

      ctx.fillStyle = pos === 1 ? "#0E0E0E" : "#F7F7F7";
      ctx.font = `800 ${format === "story" ? "24px" : "20px"} -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`0${pos}`, 98 + badgeSize / 2, badgeY + badgeSize / 2);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      // Cover Art
      const coverX = 98 + badgeSize + 24;
      const coverY = y + (cardHeight - coverSize) / 2;

      let imageDrawn = false;
      if (album?.coverUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = album.coverUrl;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            setTimeout(() => reject(new Error("Timeout")), 1500);
          });
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(coverX, coverY, coverSize, coverSize, 12);
          ctx.clip();
          ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
          ctx.restore();
          imageDrawn = true;
        } catch {
          imageDrawn = false;
        }
      }

      if (!imageDrawn) {
        ctx.fillStyle = "#0E0E0E";
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 12);
        ctx.fill();
        ctx.fillStyle = "#F7F7F7";
        ctx.font = "600 16px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText("vinyl", coverX + 16, coverY + coverSize / 2);
      }

      // Title & Artist
      const textX = coverX + coverSize + 24;
      const textAvailableWidth = width - textX - 100;
      ctx.fillStyle = "#0E0E0E";
      ctx.font = `700 ${format === "story" ? "28px" : "22px"} -apple-system, BlinkMacSystemFont, sans-serif`;
      const title = album ? album.title : `Slot 0${pos} uncurated`;
      ctx.fillText(title.length > 36 ? `${title.slice(0, 35)}...` : title, textX, y + (format === "story" ? 82 : 48), textAvailableWidth);

      ctx.fillStyle = "rgba(14, 14, 14, 0.6)";
      ctx.font = `500 ${format === "story" ? "22px" : "18px"} -apple-system, BlinkMacSystemFont, sans-serif`;
      const subtitle = album
        ? `${album.artistName}${album.releaseYear ? ` · ${album.releaseYear}` : ""}`
        : "Empty vinyl slot";
      ctx.fillText(subtitle.length > 42 ? `${subtitle.slice(0, 41)}...` : subtitle, textX, y + (format === "story" ? 122 : 82), textAvailableWidth);
    }

    // Footer
    const footerY = height - 70;
    ctx.strokeStyle = "rgba(14, 14, 14, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, footerY - 30);
    ctx.lineTo(width - 75, footerY - 30);
    ctx.stroke();

    ctx.fillStyle = "rgba(14, 14, 14, 0.5)";
    ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`musi5t.com/@${user.username}`, 75, footerY);

    ctx.fillStyle = "#0E0E0E";
    ctx.font = "800 20px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("ALBUM-FIRST SOCIAL", width - 75, footerY);
    ctx.textAlign = "left";

    // Export to Blob and download
    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas blob export failed"));
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `musi5t-${user.username}-top5-${format}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${downloadUrl}&t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const blob = await res.blob();
      if (!blob.type.includes("image") && !blob.type.includes("png")) {
        throw new Error(`Invalid response content type: ${blob.type}`);
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `musi5t-${user.username}-top5-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Server poster generation failed or returned error, falling back to client canvas:", err);
      try {
        await downloadViaCanvas();
      } catch (canvasErr) {
        console.error("Canvas poster export failed:", canvasErr);
        window.open(downloadUrl, "_blank");
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/@${user.username}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.displayName}'s Top 5 on musi5t`,
          text: `Check out @${user.username}'s definitive Top 5 records on musi5t.`,
          url: `${window.location.origin}/@${user.username}`,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Native share failed:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-poster-title"
      className="fixed inset-0 z-50 bg-secondary/80 backdrop-blur-md flex items-center justify-center p-[4vw] sm:p-[2vw] select-none"
    >
      <div
        className="w-full max-w-[540px] max-h-[92vh] overflow-y-auto hide-scrollbar bg-primary text-secondary border border-secondary/15 rounded-[2vw] sm:rounded-[0.5vw] drop-shadow-soft p-[5vw] sm:p-[2vw] flex flex-col gap-[3.5vw] sm:gap-[1.2vw] relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-secondary/10 pb-[2.5vw] sm:pb-[1vw]">
          <div className="flex items-center gap-[2vw] sm:gap-[0.6vw]">
            <div className="drop-shadow rounded-[0.2vw]">
              <div
                className="w-[4vw] h-[4vw] sm:w-[1.2vw] sm:h-[1.2vw] rounded-[0.15vw] transition-colors"
                style={{ backgroundColor: activePalette.accent }}
              />
            </div>
            <h3 id="share-poster-title" className="smallText font-medium text-secondary">
              share top 5 poster
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

        {/* Format Selector Pills */}
        <div className="flex items-center justify-center gap-[2vw] sm:gap-[0.8vw]">
          <button
            type="button"
            onClick={() => setFormat("story")}
            className={`px-[3.5vw] py-[1.2vw] sm:px-[1.2vw] sm:py-[0.4vw] rounded-[0.3vw] detailText font-medium transition-all cursor-pointer ${
              format === "story"
                ? "bg-secondary text-primary shadow-sm"
                : "bg-secondary/5 text-secondary/60 hover:text-secondary hover:bg-secondary/10"
            }`}
          >
            Story (9:16)
          </button>
          <button
            type="button"
            onClick={() => setFormat("square")}
            className={`px-[3.5vw] py-[1.2vw] sm:px-[1.2vw] sm:py-[0.4vw] rounded-[0.3vw] detailText font-medium transition-all cursor-pointer ${
              format === "square"
                ? "bg-secondary text-primary shadow-sm"
                : "bg-secondary/5 text-secondary/60 hover:text-secondary hover:bg-secondary/10"
            }`}
          >
            Square (1:1)
          </button>
        </div>

        {/* Live Visual Poster Preview */}
        <div className="flex items-center justify-center py-[1vw]">
          {format === "story" ? (
            // Story Format Preview (9:16)
            <div
              className="w-[58vw] max-w-[270px] aspect-[9/16] bg-[#F7F7F7] text-[#0E0E0E] rounded-[1.5vw] sm:rounded-[0.5vw] border border-secondary/20 drop-shadow-soft p-[3vw] sm:p-[1.2vw] flex flex-col justify-between overflow-hidden relative"
            >
              {/* Palette Orb */}
              <div
                className="absolute -top-[8vw] -right-[8vw] w-[24vw] h-[24vw] rounded-full opacity-40 pointer-events-none"
                style={{ backgroundColor: activePalette.secondaryOrb }}
              />

              {/* Header */}
              <div className="flex flex-col gap-[0.5vw] z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[1vw]">
                    <div
                      className="w-[2vw] h-[2vw] sm:w-[0.6vw] sm:h-[0.6vw] rounded-[0.1vw]"
                      style={{ backgroundColor: activePalette.accent }}
                    />
                    <span className="detailText font-bold tracking-tight">musi5t</span>
                  </div>
                  <span className="detailText px-[1.5vw] py-[0.2vw] sm:px-[0.5vw] sm:py-[0.05vw] rounded-full bg-secondary text-primary text-[2vw] sm:text-[0.55vw] font-bold">
                    TOP 5
                  </span>
                </div>
                <span className="smallText font-bold leading-tight mt-[0.5vw] truncate">
                  {user.displayName}
                </span>
                <span className="detailText text-secondary/50 text-[2.2vw] sm:text-[0.6vw] -mt-[0.2vw]">
                  @{user.username}
                </span>
              </div>

              {/* 5 Album List */}
              <div className="flex flex-col gap-[1.5vw] sm:gap-[0.5vw] my-[1vw] z-10">
                {[1, 2, 3, 4, 5].map((pos) => {
                  const album = albums.find((a) => a.position === pos);
                  return (
                    <div
                      key={pos}
                      className="flex items-center gap-[1.8vw] sm:gap-[0.6vw] bg-white/80 p-[1.2vw] sm:p-[0.35vw] rounded-[0.6vw] sm:rounded-[0.2vw] border border-secondary/10"
                    >
                      <div
                        className="w-[4.5vw] h-[4.5vw] sm:w-[1.4vw] sm:h-[1.4vw] rounded-[0.15vw] flex items-center justify-center font-bold detailText shrink-0"
                        style={{
                          backgroundColor: pos === 1 ? activePalette.accent : "#0E0E0E",
                          color: pos === 1 ? "#0E0E0E" : "#F7F7F7",
                        }}
                      >
                        0{pos}
                      </div>
                      <div className="w-[8vw] h-[8vw] sm:w-[2.4vw] sm:h-[2.4vw] rounded-[0.2vw] overflow-hidden bg-secondary shrink-0">
                        {album?.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={album.coverUrl}
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="detailText font-bold truncate leading-tight text-[2.4vw] sm:text-[0.65vw]">
                          {album ? album.title : `Slot 0${pos}`}
                        </span>
                        <span className="detailText text-secondary/50 truncate text-[2vw] sm:text-[0.55vw]">
                          {album ? album.artistName : "Uncurated"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-[0.8vw] border-t border-secondary/15 detailText text-secondary/50 text-[2vw] sm:text-[0.55vw] z-10">
                <span>musi5t.com/@{user.username}</span>
                <span className="font-bold text-secondary">ALBUM-FIRST</span>
              </div>
            </div>
          ) : (
            // Square Format Preview (1:1)
            <div
              className="w-[68vw] max-w-[320px] aspect-square bg-[#F7F7F7] text-[#0E0E0E] rounded-[1.5vw] sm:rounded-[0.5vw] border border-secondary/20 drop-shadow-soft p-[3.5vw] sm:p-[1.4vw] flex flex-col justify-between overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-[1.2vw] sm:gap-[0.5vw]">
                  <div
                    className="w-[2.4vw] h-[2.4vw] sm:w-[0.8vw] sm:h-[0.8vw] rounded-[0.1vw]"
                    style={{ backgroundColor: activePalette.accent }}
                  />
                  <span className="smallText font-bold tracking-tight">musi5t</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="detailText font-bold truncate leading-tight">
                    {user.displayName}
                  </span>
                  <span className="detailText text-secondary/50 text-[2vw] sm:text-[0.6vw]">
                    @{user.username}
                  </span>
                </div>
              </div>

              {/* 5 Horizontal Album Covers */}
              <div className="grid grid-cols-5 gap-[1.5vw] sm:gap-[0.5vw] my-[1vw] z-10">
                {[1, 2, 3, 4, 5].map((pos) => {
                  const album = albums.find((a) => a.position === pos);
                  return (
                    <div key={pos} className="flex flex-col gap-[0.5vw] overflow-hidden">
                      <div className="aspect-square rounded-[0.3vw] overflow-hidden bg-secondary relative border border-secondary/15">
                        {album?.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={album.coverUrl}
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                        <span
                          className="absolute top-[0.4vw] left-[0.4vw] px-[0.8vw] py-[0.1vw] rounded-[0.1vw] text-[1.8vw] sm:text-[0.5vw] font-bold"
                          style={{
                            backgroundColor: pos === 1 ? activePalette.accent : "rgba(0,0,0,0.8)",
                            color: pos === 1 ? "#0E0E0E" : "#FFF",
                          }}
                        >
                          0{pos}
                        </span>
                      </div>
                      <span className="detailText font-bold truncate text-[2vw] sm:text-[0.55vw] leading-tight">
                        {album ? album.title : `Slot 0${pos}`}
                      </span>
                      <span className="detailText text-secondary/50 truncate text-[1.8vw] sm:text-[0.5vw]">
                        {album ? album.artistName : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-[0.8vw] border-t border-secondary/15 detailText text-secondary/50 text-[2vw] sm:text-[0.55vw] z-10">
                <span>Definitive Top 5 Records</span>
                <span className="font-bold text-secondary">MUSI5T.COM</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-[2.5vw] sm:gap-[0.8vw] pt-[1vw]">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="w-full sm:flex-1 py-[2.8vw] sm:py-[0.7vw] px-[4vw] sm:px-[1.2vw] rounded-[0.3vw] bg-secondary text-primary hover:bg-secondary/90 transition-colors font-medium smallText flex items-center justify-center gap-[1.5vw] sm:gap-[0.5vw] cursor-pointer drop-shadow-soft disabled:opacity-60"
          >
            <svg
              className="w-[4vw] h-[4vw] sm:w-[1vw] sm:h-[1vw]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{downloading ? "Generating PNG..." : "Download Poster (.png)"}</span>
          </button>

          <div className="flex items-center gap-[2vw] sm:gap-[0.6vw] w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial py-[2.8vw] sm:py-[0.7vw] px-[3vw] sm:px-[1vw] rounded-[0.3vw] bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 text-secondary transition-colors font-medium extraSmallText cursor-pointer"
            >
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>

            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-[2.8vw] sm:py-[0.7vw] px-[3vw] sm:px-[1vw] rounded-[0.3vw] bg-yellow text-secondary hover:bg-yellow/90 transition-colors font-medium extraSmallText cursor-pointer drop-shadow-soft"
              >
                Share...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
