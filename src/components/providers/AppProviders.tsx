"use client";

import React, { type ReactNode } from "react";
import { AudioPlayerProvider } from "@/lib/audio/AudioPlayerContext";
import { FloatingAudioPlayer } from "@/components/audio/FloatingAudioPlayer";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AudioPlayerProvider>
      {children}
      <FloatingAudioPlayer />
    </AudioPlayerProvider>
  );
}
