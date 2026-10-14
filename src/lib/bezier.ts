/**
 * GSAP `modifiers` helper: maps the tween's own progress (derived from the
 * interpolated value) onto a quadratic Bezier curve, which gives the photos
 * their curved fly-in path instead of a straight line.
 *
 * `start` is the starting value, `ctrl` the control point and `unit` the CSS
 * unit appended to the result (or a numeric end offset).
 */
export function bezierModifier(start: number, ctrl: number, unit: string) {
  return (value: string) => {
    const t = parseFloat(value) / start;
    return t * t * start + 2 * t * (1 - t) * ctrl + unit;
  };
}
