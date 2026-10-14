"use client";

import React from "react";

interface SidejobButtonProps {
  label: string;
  hoverLabel?: string;
  onClick?: () => void;
  className?: string;
  variant?: "yellow" | "dark";
}

export function SidejobButton({
  label,
  hoverLabel,
  onClick,
  className = "",
  variant = "yellow",
}: SidejobButtonProps) {
  const isYellow = variant === "yellow";

  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 select-none ${
        isYellow
          ? "bg-[#FFE600] text-[#0E0E0E] hover:bg-[#F2DA00]"
          : "bg-[#0E0E0E] text-[#F7F7F7] hover:bg-black"
      } ${className}`}
    >
      {/* Signature Animated Icon */}
      <span
        aria-hidden="true"
        className={`w-3.5 h-3.5 rounded-[2px] transition-all duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:rotate-45 group-hover:scale-75 group-hover:rounded-full ${
          isYellow ? "bg-[#0E0E0E]" : "bg-[#FFE600]"
        }`}
      />

      {/* Dual-line Sliding Text Clip */}
      <span className="relative block overflow-hidden text-xs font-medium tracking-tight h-[15px] leading-[15px]">
        <span className="block transition-transform duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:-translate-y-full">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full transition-transform duration-400 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:translate-y-0"
        >
          {hoverLabel || label}
        </span>
      </span>
    </button>
  );
}
