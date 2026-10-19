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
  const [imageLoading, setImageLoading] = useState(true);

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

    // Decorative Lateral Circles (Palette-Driven like Profile)
    // Upper Right Concentric Disc
    ctx.save();
    ctx.fillStyle = activePalette.secondaryOrb;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(width - 40, -40, format === "story" ? 540 : 380, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = activePalette.accent;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.arc(width - 20, -20, format === "story" ? 340 : 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = activePalette.softGlow;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(width, 0, format === "story" ? 150 : 100, 0, Math.PI * 2);
    ctx.fill();

    // Left Edge Satellite Orb
    ctx.fillStyle = activePalette.accent;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(-20, format === "story" ? 720 : 440, format === "story" ? 160 : 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = activePalette.secondaryOrb;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.arc(10, format === "story" ? 740 : 455, format === "story" ? 95 : 65, 0, Math.PI * 2);
    ctx.fill();

    // Right Edge Mid Graphic Dot
    ctx.fillStyle = activePalette.softGlow;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(width + 10, format === "story" ? 1260 : 780, format === "story" ? 120 : 80, 0, Math.PI * 2);
    ctx.fill();

    // Bottom Left Concentric Sphere
    ctx.fillStyle = activePalette.secondaryOrb;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(-40, height + 20, format === "story" ? 340 : 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = activePalette.accent;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, height + 40, format === "story" ? 200 : 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Ensure KH Teka font is loaded in browser canvas
    try {
      if (typeof FontFace !== "undefined" && !document.fonts.check("500 30px KHTeka")) {
        const font = new FontFace("KHTeka", "url(/fonts/KHTeka-Medium.otf)", {
          weight: "500",
          style: "normal",
        });
        await font.load();
        document.fonts.add(font);
      }
    } catch {
      // Graceful fallback
    }

    const fontBase = '"KHTeka", -apple-system, BlinkMacSystemFont, sans-serif';

    // Brand Header (Prominent musi5t without square badge)
    ctx.fillStyle = "#0E0E0E";
    ctx.font = `900 ${format === "story" ? "148px" : "120px"} ${fontBase}`;
    ctx.fillText("musi5t", format === "story" ? 75 : 48, format === "story" ? 190 : 160);

    ctx.fillStyle = "rgba(14, 14, 14, 0.55)";
    ctx.font = `500 ${format === "story" ? "34px" : "26px"} ${fontBase}`;
    ctx.fillText(`@${user.username}'s definitive album rotation`, format === "story" ? 75 : 48, format === "story" ? 245 : 202);

    if (format === "story") {
      // 5 Albums Vertical List with Large Artwork
      const startY = 280;
      const cardHeight = 256;
      const cardGap = 24;
      const coverSize = 215;
      const badgeSize = 76;

      for (let pos = 1; pos <= 5; pos++) {
        const album = albums.find((a) => a.position === pos);
        const y = startY + (pos - 1) * (cardHeight + cardGap);

        // Card Background
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
        ctx.strokeStyle = "rgba(14, 14, 14, 0.08)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(75, y, width - 150, cardHeight, 26);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Rank Badge
        const badgeY = y + (cardHeight - badgeSize) / 2;
        ctx.fillStyle = pos === 1 ? activePalette.accent : "#0E0E0E";
        ctx.beginPath();
        ctx.roundRect(105, badgeY, badgeSize, badgeSize, 18);
        ctx.fill();

        ctx.fillStyle = pos === 1 ? (activePalette.textOnAccent || "#0E0E0E") : "#F7F7F7";
        ctx.font = `800 36px ${fontBase}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`0${pos}`, 105 + badgeSize / 2, badgeY + badgeSize / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        // Cover Art
        const coverX = 105 + badgeSize + 28;
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
            ctx.roundRect(coverX, coverY, coverSize, coverSize, 20);
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
          ctx.roundRect(coverX, coverY, coverSize, coverSize, 20);
          ctx.fill();
          ctx.fillStyle = "#F7F7F7";
          ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.fillText("vinyl", coverX + 24, coverY + coverSize / 2);
        }

        // Title & Artist
        const textX = coverX + coverSize + 28;
        const textAvailableWidth = width - textX - 100;
        ctx.fillStyle = "#0E0E0E";
        ctx.font = `700 42px ${fontBase}`;
        const title = album ? album.title : `Slot 0${pos} uncurated`;
        ctx.fillText(title.length > 30 ? `${title.slice(0, 29)}...` : title, textX, y + 105, textAvailableWidth);

        ctx.fillStyle = "rgba(14, 14, 14, 0.6)";
        ctx.font = `500 28px ${fontBase}`;
        const subtitle = album
          ? `${album.artistName}${album.releaseYear ? ` · ${album.releaseYear}` : ""}`
          : "Empty vinyl slot";
        ctx.fillText(subtitle.length > 38 ? `${subtitle.slice(0, 37)}...` : subtitle, textX, y + 155, textAvailableWidth);
      }

      // Curator text (Clean typography without card or dot)
      const curatorY = startY + 5 * (cardHeight + cardGap) + 40;
      ctx.fillStyle = "#0E0E0E";
      ctx.font = `700 36px ${fontBase}`;
      ctx.fillText(`Curated rotation by @${user.username}`, 75, curatorY);
    } else {
      // SQUARE (1:1): 5 Horizontal Album Shelf Columns
      // 5 Columns
      const colWidth = 186;
      const startX = 48;
      const gap = (width - 96 - 5 * colWidth) / 4;
      const shelfY = 340;

      for (let pos = 1; pos <= 5; pos++) {
        const album = albums.find((a) => a.position === pos);
        const colX = startX + (pos - 1) * (colWidth + gap);

        // Album Cover Art
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
            ctx.roundRect(colX, shelfY, colWidth, colWidth, 18);
            ctx.clip();
            ctx.drawImage(img, colX, shelfY, colWidth, colWidth);
            ctx.restore();
            imageDrawn = true;
          } catch {
            imageDrawn = false;
          }
        }

        if (!imageDrawn) {
          ctx.fillStyle = "#0E0E0E";
          ctx.beginPath();
          ctx.roundRect(colX, shelfY, colWidth, colWidth, 18);
          ctx.fill();
          ctx.fillStyle = "#F7F7F7";
          ctx.font = "600 18px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.fillText("vinyl slot", colX + 46, shelfY + colWidth / 2);
        }

        // Corner Rank Badge
        ctx.fillStyle = pos === 1 ? activePalette.accent : "rgba(14, 14, 14, 0.88)";
        ctx.beginPath();
        ctx.roundRect(colX + 10, shelfY + 10, 42, 42, 12);
        ctx.fill();

        ctx.fillStyle = pos === 1 ? (activePalette.textOnAccent || "#0E0E0E") : "#F7F7F7";
        ctx.font = `800 22px ${fontBase}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`0${pos}`, colX + 30, shelfY + 30);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        // Title & Artist
        ctx.fillStyle = "#0E0E0E";
        ctx.font = `700 23px ${fontBase}`;
        const title = album ? album.title : `Slot 0${pos}`;
        ctx.fillText(title.length > 14 ? `${title.slice(0, 13)}...` : title, colX, shelfY + colWidth + 30, colWidth);

        ctx.fillStyle = "rgba(14, 14, 14, 0.6)";
        ctx.font = `500 18px ${fontBase}`;
        const subtitle = album
          ? `${album.artistName}${album.releaseYear ? ` · ${album.releaseYear}` : ""}`
          : "Uncurated";
        ctx.fillText(subtitle.length > 18 ? `${subtitle.slice(0, 17)}...` : subtitle, colX, shelfY + colWidth + 56, colWidth);
      }

      // Shelf line
      const shelfLineY = shelfY + colWidth + 80;
      ctx.fillStyle = "rgba(14, 14, 14, 0.12)";
      ctx.beginPath();
      ctx.roundRect(65, shelfLineY, width - 130, 3, 2);
      ctx.fill();

      // Curator text (Clean typography without card or dot)
      const curatorY = shelfLineY + 50;
      ctx.fillStyle = "#0E0E0E";
      ctx.font = `700 28px ${fontBase}`;
      ctx.fillText(`Curated rotation by @${user.username}`, 48, curatorY);
    }

    // Footer
    const footerY = height - 70;
    ctx.strokeStyle = "rgba(14, 14, 14, 0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(65, footerY - 30);
    ctx.lineTo(width - 65, footerY - 30);
    ctx.stroke();

    ctx.fillStyle = "rgba(14, 14, 14, 0.5)";
    ctx.font = `600 ${format === "story" ? "30px" : "24px"} ${fontBase}`;
    ctx.fillText(`musi5t.com/@${user.username}`, format === "story" ? 75 : 48, footerY);

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
            onClick={() => {
              if (format !== "story") {
                setFormat("story");
                setImageLoading(true);
              }
            }}
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
            onClick={() => {
              if (format !== "square") {
                setFormat("square");
                setImageLoading(true);
              }
            }}
            className={`px-[3.5vw] py-[1.2vw] sm:px-[1.2vw] sm:py-[0.4vw] rounded-[0.3vw] detailText font-medium transition-all cursor-pointer ${
              format === "square"
                ? "bg-secondary text-primary shadow-sm"
                : "bg-secondary/5 text-secondary/60 hover:text-secondary hover:bg-secondary/10"
            }`}
          >
            Square (1:1)
          </button>
        </div>

        {/* Live Visual Poster Preview (100% WYSIWYG Real Generated Image) */}
        <div className="flex items-center justify-center py-[1vw]">
          <div
            className={`relative overflow-hidden rounded-[1.5vw] sm:rounded-[0.5vw] border border-secondary/20 drop-shadow-soft bg-[#F7F7F7] flex items-center justify-center ${
              format === "story"
                ? "w-[58vw] max-w-[270px] aspect-[9/16]"
                : "w-[68vw] max-w-[320px] aspect-square"
            }`}
          >
            {/* Loading skeleton / spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F7F7] z-20 gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin"
                  style={{ borderTopColor: activePalette.accent }}
                />
                <span className="detailText text-secondary/50 font-medium">
                  rendering poster...
                </span>
              </div>
            )}

            {/* Real WYSIWYG Poster Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${format}-${activePalette.accent}`}
              src={downloadUrl}
              alt={`${user.displayName}'s Top 5 poster`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
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
