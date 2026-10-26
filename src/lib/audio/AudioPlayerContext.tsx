"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface PlayableTrack {
  title: string;
  artistName: string;
  coverUrl?: string | null;
  previewUrl?: string | null;
}

export interface AudioPlayerContextType {
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number; // Fixed at 25
  playTrack: (track: PlayableTrack) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  stop: () => void;
  toggleTrack: (track: PlayableTrack) => Promise<void>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

let globalAudio: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = "auto";
  }
  return globalAudio;
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const activeRequestIdRef = useRef<number>(0);

  useEffect(() => {
    const audio = getGlobalAudio();
    if (!audio) return;

    const handleTimeUpdate = () => {
      const ct = audio.currentTime;
      if (ct >= 25.0) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1.0;
        setIsPlaying(false);
        setCurrentTime(0);
      } else if (ct >= 20.0) {
        const fadeProgress = (25.0 - ct) / 5.0;
        audio.volume = Math.max(0, Math.min(1, fadeProgress));
        setCurrentTime(Math.min(25, ct));
      } else {
        audio.volume = 1.0;
        setCurrentTime(ct);
      }
    };

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.volume = 1.0;
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
    };
  }, []);

  const playTrack = useCallback(async (track: PlayableTrack) => {
    const audio = getGlobalAudio();
    if (!audio) return;

    const requestId = ++activeRequestIdRef.current;

    // Stop existing playback immediately
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1.0;
    setCurrentTime(0);
    setIsPlaying(false);
    setCurrentTrack(track);

    let resolvedUrl = track.previewUrl;

    if (!resolvedUrl) {
      setIsLoading(true);
      try {
        const query = `/api/v1/catalog/preview?artist=${encodeURIComponent(
          track.artistName
        )}&title=${encodeURIComponent(track.title)}`;
        const res = await fetch(query);
        if (res.ok) {
          const data = (await res.json()) as { previewUrl: string | null };
          resolvedUrl = data.previewUrl;
        }
      } catch (err) {
        console.error("[AudioPlayer] Error fetching preview URL:", err);
      }
    }

    if (activeRequestIdRef.current !== requestId) {
      return;
    }

    if (!resolvedUrl) {
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    setCurrentTrack({
      ...track,
      previewUrl: resolvedUrl,
    });

    audio.src = resolvedUrl;
    audio.currentTime = 0;
    audio.volume = 1.0;
    setIsLoading(true);

    try {
      await audio.play();
      if (activeRequestIdRef.current === requestId) {
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("[AudioPlayer] Audio playback error:", err);
      if (activeRequestIdRef.current === requestId) {
        setIsPlaying(false);
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const pause = useCallback(() => {
    const audio = getGlobalAudio();
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(async () => {
    const audio = getGlobalAudio();
    if (!audio || !currentTrack) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("[AudioPlayer] Audio resume error:", err);
    }
  }, [currentTrack]);

  const stop = useCallback(() => {
    activeRequestIdRef.current++;
    const audio = getGlobalAudio();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0;
      audio.src = "";
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setCurrentTrack(null);
  }, []);

  const toggleTrack = useCallback(
    async (track: PlayableTrack) => {
      const isCurrent =
        currentTrack !== null &&
        currentTrack.title.toLowerCase() === track.title.toLowerCase() &&
        currentTrack.artistName.toLowerCase() === track.artistName.toLowerCase();

      if (isCurrent) {
        if (isPlaying) {
          pause();
        } else {
          await resume();
        }
      } else {
        await playTrack(track);
      }
    },
    [currentTrack, isPlaying, pause, resume, playTrack]
  );

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration: 25,
        playTrack,
        pause,
        resume,
        stop,
        toggleTrack,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer(): AudioPlayerContextType {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
