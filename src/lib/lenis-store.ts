import { useEffect, useRef } from "react";
import type Lenis from "lenis";

let current: Lenis | null = null;
const subscribers = new Set<(lenis: Lenis | null) => void>();

export function getLenis(): Lenis | null {
  return current;
}

export function setLenis(lenis: Lenis | null) {
  current = lenis;
  subscribers.forEach((cb) => cb(lenis));
}

export function subscribeLenis(cb: (lenis: Lenis | null) => void) {
  subscribers.add(cb);
  cb(current);
  return () => {
    subscribers.delete(cb);
  };
}

/**
 * Runs `callback` on every Lenis scroll event (and once immediately when the
 * Lenis instance becomes available). Safe to call before Lenis exists.
 */
export function useLenisScroll(callback: (lenis: Lenis) => void) {
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  });

  useEffect(() => {
    let off: (() => void) | undefined;
    const unsubscribe = subscribeLenis((lenis) => {
      off?.();
      off = undefined;
      if (!lenis) return;
      const handler = (instance: Lenis) => latest.current(instance);
      lenis.on("scroll", handler);
      handler(lenis);
      off = () => lenis.off("scroll", handler);
    });
    return () => {
      off?.();
      unsubscribe();
    };
  }, []);
}
