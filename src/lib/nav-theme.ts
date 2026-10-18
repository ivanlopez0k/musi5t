/**
 * Automatically monitors sections with [data-nav-color] within a scroll container
 * and dynamically updates data-nav-theme on the fixed .header:
 *
 * - [data-nav-color="primary"]: dark section background -> navbar text turns light (cream/white).
 * - [data-nav-color="secondary"]: light section background -> navbar text turns dark (ink/black).
 */
export function setupNavColorTriggers(scroller: HTMLElement): () => void {
  const header = document.querySelector<HTMLElement>(".header");
  if (!header) return () => {};

  const getSections = () =>
    Array.from(scroller.querySelectorAll<HTMLElement>("[data-nav-color]"));

  let lastAppliedTheme: "light" | "dark" | null = null;

  const updateHeaderTheme = () => {
    const sections = getSections();
    if (sections.length === 0) return;

    const headerRect = header.getBoundingClientRect();
    const headerMid = headerRect.top + (headerRect.height > 0 ? headerRect.height / 2 : 24);

    // Find the section that physically intersects the center of the header
    let matchedColor: string | null = null;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= headerMid && rect.bottom >= headerMid) {
        matchedColor = section.getAttribute("data-nav-color");
        break;
      }
    }

    // Default to "secondary" (dark text) if outside or on standard light background
    const targetTheme: "light" | "dark" =
      matchedColor === "primary" ? "light" : "dark";

    if (lastAppliedTheme !== targetTheme) {
      lastAppliedTheme = targetTheme;
      header.setAttribute("data-nav-theme", targetTheme);
    }
  };

  // Run initial calculation
  updateHeaderTheme();

  // Scroll listener on the scroll container
  scroller.addEventListener("scroll", updateHeaderTheme, { passive: true });
  window.addEventListener("resize", updateHeaderTheme, { passive: true });

  // RAF loop for smooth frame-by-frame synchronization during Lenis lerp animations
  let rafId: number | null = null;
  const tick = () => {
    updateHeaderTheme();
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    scroller.removeEventListener("scroll", updateHeaderTheme);
    window.removeEventListener("resize", updateHeaderTheme);
  };
}
