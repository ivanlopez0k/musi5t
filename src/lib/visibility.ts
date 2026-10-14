/**
 * Calls `cb(true|false)` whenever `el` enters/leaves the (padded) viewport of
 * its scroll container, and also pauses when the tab is hidden. Returns a
 * cleanup function.
 */
export function observeVisible(el: Element, cb: (visible: boolean) => void) {
  let destroyed = false;
  let intersecting = false;
  let last: boolean | undefined;

  const update = () => {
    if (destroyed) return;
    const visible = intersecting && !document.hidden;
    if (visible !== last) {
      last = visible;
      cb(visible);
    }
  };

  let observer: IntersectionObserver | undefined;
  if (typeof IntersectionObserver === "function") {
    observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        update();
      },
      { root: el.closest("main"), rootMargin: "200px 0px" },
    );
    observer.observe(el);
  } else {
    intersecting = true;
  }

  document.addEventListener("visibilitychange", update);
  update();

  return () => {
    destroyed = true;
    observer?.disconnect();
    document.removeEventListener("visibilitychange", update);
  };
}
