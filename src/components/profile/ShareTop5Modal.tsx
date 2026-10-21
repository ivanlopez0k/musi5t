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

    // Concentric Palette Orbs
    ctx.save();
    if (format === "story") {
      // Top Right Concentric Disc
      ctx.fillStyle = activePalette.secondaryOrb;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(width - 40, -40, 300, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activePalette.accent;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(width - 20, -20, 200, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activePalette.softGlow;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(width, 0, 100, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Left Concentric Sphere
      ctx.fillStyle = activePalette.secondaryOrb;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(-40, height + 20, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activePalette.accent;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(0, height + 40, 130, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Square Concentric Orbs
      ctx.fillStyle = activePalette.secondaryOrb;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(width - 30, -30, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activePalette.accent;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(width - 15, -15, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activePalette.softGlow;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(width, 0, 70, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Left
      ctx.fillStyle = activePalette.secondaryOrb;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(-30, height + 15, 160, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activePalette.accent;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(0, height + 30, 95, 0, Math.PI * 2);
      ctx.fill();
    }
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

    // Header: Brand & Identity
    ctx.fillStyle = "#0E0E0E";
    ctx.font = `900 ${format === "story" ? "185px" : "125px"} ${fontBase}`;
    ctx.fillText("musi5t", format === "story" ? 75 : 55, format === "story" ? 230 : 145);

    ctx.fillStyle = "rgba(14, 14, 14, 0.55)";
    ctx.font = `500 ${format === "story" ? "36px" : "24px"} ${fontBase}`;
    ctx.fillText(
      `@${user.username}'s definitive album rotation`,
      format === "story" ? 75 : 55,
      format === "story" ? 285 : 185
    );

    // Pre-load all album covers asynchronously
    const loadedImages: Record<number, HTMLImageElement> = {};
    await Promise.allSettled(
      albums.map((album) => {
        if (!album.coverUrl) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = album.coverUrl!;
          img.onload = () => {
            loadedImages[album.position] = img;
            resolve();
          };
          img.onerror = () => reject();
          setTimeout(() => reject(new Error("Timeout")), 2500);
        });
      })
    );

    const storyCards = [
      {
        pos: 1,
        left: 60,
        top: 350,
        width: 565,
        height: 720,
        artSize: 521,
        rotation: -5.0,
        paddingTop: 22,
        paddingSide: 22,
        paddingBottom: 24,
        numberSize: 62,
        titleSize: 36,
        artistSize: 22,
        numWidth: 84,
        zIndex: 4,
      },
      {
        pos: 2,
        left: 610,
        top: 370,
        width: 395,
        height: 505,
        artSize: 357,
        rotation: 3.5,
        paddingTop: 19,
        paddingSide: 19,
        paddingBottom: 21,
        numberSize: 44,
        titleSize: 26,
        artistSize: 18,
        numWidth: 60,
        zIndex: 3,
      },
      {
        pos: 3,
        left: 645,
        top: 870,
        width: 370,
        height: 475,
        artSize: 332,
        rotation: -2.8,
        paddingTop: 19,
        paddingSide: 19,
        paddingBottom: 21,
        numberSize: 42,
        titleSize: 25,
        artistSize: 17,
        numWidth: 58,
        zIndex: 3,
      },
      {
        pos: 4,
        left: 350,
        top: 1225,
        width: 335,
        height: 430,
        artSize: 297,
        rotation: 2.2,
        paddingTop: 19,
        paddingSide: 19,
        paddingBottom: 21,
        numberSize: 38,
        titleSize: 22,
        artistSize: 15,
        numWidth: 54,
        zIndex: 5,
      },
      {
        pos: 5,
        left: 65,
        top: 1315,
        width: 260,
        height: 345,
        artSize: 226,
        rotation: -5.5,
        paddingTop: 17,
        paddingSide: 17,
        paddingBottom: 19,
        numberSize: 32,
        titleSize: 19,
        artistSize: 13,
        numWidth: 48,
        zIndex: 4,
      },
    ];

    const squareCards = [
      {
        pos: 1,
        left: 50,
        top: 215,
        width: 355,
        height: 455,
        artSize: 317,
        rotation: -4.0,
        paddingTop: 19,
        paddingSide: 19,
        paddingBottom: 21,
        numberSize: 38,
        titleSize: 23,
        artistSize: 15,
        numWidth: 52,
        zIndex: 4,
      },
      {
        pos: 2,
        left: 425,
        top: 190,
        width: 280,
        height: 360,
        artSize: 246,
        rotation: 3.5,
        paddingTop: 17,
        paddingSide: 17,
        paddingBottom: 19,
        numberSize: 32,
        titleSize: 19,
        artistSize: 14,
        numWidth: 44,
        zIndex: 3,
      },
      {
        pos: 3,
        left: 745,
        top: 225,
        width: 270,
        height: 350,
        artSize: 236,
        rotation: -2.5,
        paddingTop: 17,
        paddingSide: 17,
        paddingBottom: 19,
        numberSize: 30,
        titleSize: 18,
        artistSize: 12,
        numWidth: 42,
        zIndex: 3,
      },
      {
        pos: 4,
        left: 650,
        top: 545,
        width: 275,
        height: 355,
        artSize: 241,
        rotation: 2.8,
        paddingTop: 17,
        paddingSide: 17,
        paddingBottom: 19,
        numberSize: 32,
        titleSize: 19,
        artistSize: 13,
        numWidth: 44,
        zIndex: 5,
      },
      {
        pos: 5,
        left: 270,
        top: 575,
        width: 270,
        height: 350,
        artSize: 236,
        rotation: -4.0,
        paddingTop: 17,
        paddingSide: 17,
        paddingBottom: 19,
        numberSize: 32,
        titleSize: 19,
        artistSize: 13,
        numWidth: 44,
        zIndex: 4,
      },
    ];

    const cardsToRender = (format === "story" ? storyCards : squareCards)
      .slice()
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const card of cardsToRender) {
      const album = albums.find((a) => a.position === card.pos);
      const cx = card.left + card.width / 2;
      const cy = card.top + card.height / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((card.rotation * Math.PI) / 180);

      // Physical polaroid drop shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
      ctx.shadowBlur = format === "story" ? 40 : 28;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = format === "story" ? 20 : 14;

      // White Polaroid body
      const halfW = card.width / 2;
      const halfH = card.height / 2;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(-halfW, -halfH, card.width, card.height, format === "story" ? 10 : 8);
      ctx.fill();

      // Clear shadow for crisp artwork and typography
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Subtle hairline border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inside artwork position
      const artX = -halfW + card.paddingSide;
      const artY = -halfH + card.paddingTop;
      const artSize = card.artSize;

      const img = loadedImages[card.pos];
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(artX, artY, artSize, artSize, 4);
        ctx.clip();
        ctx.drawImage(img, artX, artY, artSize, artSize);
        ctx.restore();
      } else {
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.roundRect(artX, artY, artSize, artSize, 4);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `600 ${Math.round(artSize * 0.08)}px ${fontBase}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("vinyl slot", artX + artSize / 2, artY + artSize / 2);
      }

      // Chin: Number + Metadata
      const chinY = artY + artSize + 14;
      const numX = artX;

      // Rank Number
      ctx.fillStyle = card.pos === 1 ? activePalette.accent : "#0E0E0E";
      ctx.font = `900 ${card.numberSize}px ${fontBase}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`0${card.pos}`, numX, chinY);

      const textX = numX + card.numWidth + 4;
      const maxTextWidth = card.artSize - card.numWidth - 4;

      // Title
      ctx.fillStyle = "#0E0E0E";
      ctx.font = `800 ${card.titleSize}px ${fontBase}`;
      let title = album ? album.title : `Slot 0${card.pos}`;
      if (ctx.measureText(title).width > maxTextWidth) {
        while (title.length > 0 && ctx.measureText(title + "...").width > maxTextWidth) {
          title = title.slice(0, -1);
        }
        title += "...";
      }
      ctx.fillText(title, textX, chinY + 2);

      // Subtitle (Artist · Year)
      ctx.fillStyle = "rgba(14, 14, 14, 0.6)";
      ctx.font = `500 ${card.artistSize}px ${fontBase}`;
      let subtitle = album
        ? `${album.artistName}${album.releaseYear ? ` · ${album.releaseYear}` : ""}`
        : "Uncurated";
      if (ctx.measureText(subtitle).width > maxTextWidth) {
        while (subtitle.length > 0 && ctx.measureText(subtitle + "...").width > maxTextWidth) {
          subtitle = subtitle.slice(0, -1);
        }
        subtitle += "...";
      }
      ctx.fillText(subtitle, textX, chinY + card.titleSize + 4);

      ctx.restore();
    }

    // Footer
    if (format === "story") {
      ctx.fillStyle = "#0E0E0E";
      ctx.font = `700 32px ${fontBase}`;
      ctx.fillText(`Curated rotation by @${user.username}`, 75, height - 130);

      ctx.strokeStyle = "rgba(14, 14, 14, 0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(75, height - 95);
      ctx.lineTo(width - 75, height - 95);
      ctx.stroke();

      ctx.fillStyle = "rgba(14, 14, 14, 0.5)";
      ctx.font = `600 26px ${fontBase}`;
      ctx.fillText(`musi5t.com/@${user.username}`, 75, height - 55);
    } else {
      ctx.fillStyle = "#0E0E0E";
      ctx.font = `700 22px ${fontBase}`;
      ctx.fillText(`Curated rotation by @${user.username}`, 55, height - 85);

      ctx.strokeStyle = "rgba(14, 14, 14, 0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(55, height - 60);
      ctx.lineTo(width - 55, height - 60);
      ctx.stroke();

      ctx.fillStyle = "rgba(14, 14, 14, 0.5)";
      ctx.font = `600 18px ${fontBase}`;
      ctx.fillText(`musi5t.com/@${user.username}`, 55, height - 35);
    }

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
