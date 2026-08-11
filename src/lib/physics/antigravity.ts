/**
 * AntiGravity — a critically-damped spring used to drive the custom cursor and
 * any "magnetic" element. Not a generic lerp: it carries velocity, so the
 * reticle overshoots slightly and settles, the way a mechanical needle would —
 * rather than the flat exponential-decay drift every AI-generated cursor uses.
 */
export class AntiGravitySpring {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  tx = 0;
  ty = 0;

  /** stiffness: higher = snappier. damping: higher = less overshoot. */
  constructor(private stiffness = 0.18, private damping = 0.78) {}

  setTarget(x: number, y: number) {
    this.tx = x;
    this.ty = y;
  }

  step() {
    const ax = (this.tx - this.x) * this.stiffness;
    const ay = (this.ty - this.y) * this.stiffness;
    this.vx = (this.vx + ax) * this.damping;
    this.vy = (this.vy + ay) * this.damping;
    this.x += this.vx;
    this.y += this.vy;
    return { x: this.x, y: this.y };
  }
}

/** Distance-based magnetic pull toward the nearest registered magnetic element. */
export function magneticPull(
  cursor: { x: number; y: number },
  rect: DOMRect,
  radius = 90,
  strength = 0.35
) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = cx - cursor.x;
  const dy = cy - cursor.y;
  const dist = Math.hypot(dx, dy);
  if (dist > radius) return null;
  const pull = 1 - dist / radius;
  return { x: dx * pull * strength, y: dy * pull * strength, active: true };
}
