/**
 * The website uses CSS GPU-accelerated `mix-blend-mode: difference` (.nav-blend)
 * for pixel-level sub-element contrast inversion across background changes,
 * photos, and overlapping letterforms.
 *
 * This helper remains for interface compatibility without burning RAF cycles.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setupNavColorTriggers(_scroller?: HTMLElement): () => void {
  return () => {};
}
