"use client";

import { useEffect, useState } from "react";

export interface ArtistPlaceholder {
  username: string;
  displayName: string;
}

export const ARTIST_PLACEHOLDERS: ArtistPlaceholder[] = [
  { username: "bowie_stardust", displayName: "David Bowie" },
  { username: "cerati_eterno", displayName: "Gustavo Cerati" },
  { username: "miles_ahead", displayName: "Miles Davis" },
  { username: "daft_robot", displayName: "Daft Punk" },
  { username: "charly_saynomore", displayName: "Charly García" },
  { username: "purple_groove", displayName: "Prince" },
  { username: "bjork_sound", displayName: "Björk" },
  { username: "coltrane_steps", displayName: "John Coltrane" },
  { username: "stevie_keys", displayName: "Stevie Wonder" },
  { username: "kate_bush", displayName: "Kate Bush" },
  { username: "flaco_spinetta", displayName: "Luis Alberto Spinetta" },
  { username: "nina_soul", displayName: "Nina Simone" },
  { username: "eno_ambient", displayName: "Brian Eno" },
  { username: "sade_smooth", displayName: "Sade" },
  { username: "hendrix_fuzz", displayName: "Jimi Hendrix" },
  { username: "fiona_keys", displayName: "Fiona Apple" },
  { username: "casablancas", displayName: "Julian Casablancas" },
  { username: "curtis_moveonup", displayName: "Curtis Mayfield" },
  { username: "aphex_twin", displayName: "Aphex Twin" },
  { username: "albarn_blur", displayName: "Damon Albarn" },
  { username: "beth_gibbons", displayName: "Beth Gibbons" },
  { username: "patti_horses", displayName: "Patti Smith" },
  { username: "mac_demarco", displayName: "Mac DeMarco" },
  { username: "lou_reed", displayName: "Lou Reed" },
  { username: "george_harrison", displayName: "George Harrison" },
  { username: "erykah_badu", displayName: "Erykah Badu" },
  { username: "fito_paez", displayName: "Fito Páez" },
  { username: "chet_baker", displayName: "Chet Baker" },
  { username: "stevie_nicks", displayName: "Stevie Nicks" },
  { username: "bill_evans_waltz", displayName: "Bill Evans" },
  { username: "marvin_gaye", displayName: "Marvin Gaye" },
  { username: "paul_mccartney", displayName: "Paul McCartney" },
];

/**
 * Returns a randomly initialized artist placeholder that periodically rotates
 * to showcase legendary musicians as input placeholders.
 */
export function useRotatingArtistPlaceholder(intervalMs = 3500): ArtistPlaceholder {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Select a random artist on mount
    const initialTimer = setTimeout(() => {
      setIndex(Math.floor(Math.random() * ARTIST_PLACEHOLDERS.length));
    }, 50);

    // Rotate through artists periodically
    const intervalTimer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ARTIST_PLACEHOLDERS.length);
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [intervalMs]);

  return ARTIST_PLACEHOLDERS[index];
}
