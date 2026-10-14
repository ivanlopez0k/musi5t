import type { MouseEvent as ReactMouseEvent } from "react";
import { getLenis } from "@/lib/lenis-store";

const SCROLL_OPTIONS = {
  duration: 1.4,
  easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
};

type ClickEvent = ReactMouseEvent<HTMLElement> | undefined;

/** Mirrors the reference's click handling: let modified clicks pass through. */
function shouldHandle(event: ClickEvent) {
  if (!event) return true;
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  event.preventDefault();
  return true;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function goToSection(id: string, event?: ClickEvent) {
  if (!shouldHandle(event)) return;
  const lenis = getLenis();
  if (!lenis) return;
  const target = lenis.options.wrapper instanceof HTMLElement ? lenis.options.wrapper.querySelector(`#${CSS.escape(id)}`) : null;
  if (target instanceof HTMLElement) lenis.scrollTo(target, SCROLL_OPTIONS);
}

export function goToTop(event?: ClickEvent) {
  if (!shouldHandle(event)) return;
  getLenis()?.scrollTo(0, SCROLL_OPTIONS);
}

/** Pages that do not exist yet: swallow the click instead of 404-ing. */
export function noopLink(event?: ClickEvent) {
  shouldHandle(event);
}
