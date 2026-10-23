"use client";

import React from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { ListSummary } from "@/lib/lists/service";

interface ListCardProps {
  list: ListSummary;
  accentColor?: string;
}

export function ListCard({ list, accentColor }: ListCardProps) {
  const covers = list.previewCovers || [];
  const defaultPlaceholder = "/images/musi5t/vinyl_player.webp";

  return (
    <Link
      href={`/lists/${list.id}`}
      className="group flex flex-col bg-secondary/[0.03] hover:bg-secondary/[0.06] border border-secondary/10 hover:border-secondary/25 rounded-[0.5vw] p-[3.5vw] sm:p-[1.2vw] transition-all duration-300 drop-shadow-soft"
    >
      {/* 4-Cover Collage Thumbnail */}
      <div className="w-full aspect-square rounded-[0.35vw] overflow-hidden bg-secondary/5 border border-secondary/10 relative mb-[3vw] sm:mb-[1vw]">
        {covers.length >= 2 ? (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[1px] bg-secondary/10">
            {[0, 1, 2, 3].map((idx) => {
              const cover = covers[idx] || defaultPlaceholder;
              return (
                <div key={idx} className="w-full h-full overflow-hidden bg-primary/20 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={covers[0] || defaultPlaceholder}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* Badges overlay on top of cover */}
        <div className="absolute top-[2vw] sm:top-[0.6vw] right-[2vw] sm:right-[0.6vw] flex items-center gap-[1vw] sm:gap-[0.3vw]">
          {!list.isPublic && (
            <span className="extraSmallText px-[2vw] py-[0.5vw] sm:px-[0.6vw] sm:py-[0.2vw] rounded-[0.2vw] bg-primary/90 text-secondary backdrop-blur-md border border-secondary/20 flex items-center gap-[0.4vw]">
              <svg className="w-[2.5vw] h-[2.5vw] sm:w-[0.7vw] sm:h-[0.7vw]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private</span>
            </span>
          )}
          <span
            className="extraSmallText font-medium px-[2vw] py-[0.5vw] sm:px-[0.6vw] sm:py-[0.2vw] rounded-[0.2vw] bg-primary/90 text-secondary backdrop-blur-md border border-secondary/20"
            style={accentColor ? { borderColor: accentColor } : undefined}
          >
            {list.itemCount} {list.itemCount === 1 ? "album" : "albums"}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h3 className="smallText font-medium text-secondary group-hover:text-secondary/90 transition-colors line-clamp-1">
            {list.title}
          </h3>
          {list.description ? (
            <p className="extraSmallText text-secondary/60 line-clamp-2 mt-[1.2vw] sm:mt-[0.4vw] leading-relaxed">
              {list.description}
            </p>
          ) : (
            <p className="extraSmallText text-secondary/35 italic mt-[1.2vw] sm:mt-[0.4vw]">
              No description provided.
            </p>
          )}
        </div>

        {/* Author badge */}
        <div className="flex items-center gap-[2vw] sm:gap-[0.6vw] mt-[3vw] sm:mt-[1vw] pt-[2vw] sm:pt-[0.8vw] border-t border-secondary/10">
          <div className="w-[6vw] h-[6vw] sm:w-[1.6vw] sm:h-[1.6vw] rounded-full overflow-hidden shrink-0 border border-secondary/20">
            <UserAvatar
              avatarUrl={list.author.avatarUrl}
              displayName={list.author.displayName}
              themeKey={list.author.themeKey}
              textClassName="text-[2.5vw] sm:text-[0.65vw] font-bold"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="extraSmallText text-secondary/80 font-medium truncate">
              {list.author.displayName}
            </span>
            <span className="extraSmallText text-secondary/40 truncate">
              @{list.author.username}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
