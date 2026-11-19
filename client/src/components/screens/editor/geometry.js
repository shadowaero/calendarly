export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const round2 = (v) => Math.round(v * 100) / 100;

// Derive percentage geometry from a block, falling back to 12-col grid coords.
export function effectiveGeom(block) {
  if (!block) return { x: 0, y: 0, w: 50, h: 50 };
  return {
    x: block.x_percent ?? (block.pos_x != null ? (block.pos_x / 12) * 100 : 0),
    y: block.y_percent ?? (block.pos_y != null ? (block.pos_y / 12) * 100 : 0),
    w: block.w_percent ?? (block.width != null ? (block.width / 12) * 100 : 50),
    h: block.h_percent ?? (block.height != null ? (block.height / 12) * 100 : 50)
  };
}

// Normalize a block to carry explicit percentage geometry (used on save/edit).
export function toFreeform(block) {
  if (!block) return { x_percent: 0, y_percent: 0, w_percent: 50, h_percent: 50 };
  const g = effectiveGeom(block);
  return { ...block, x_percent: g.x, y_percent: g.y, w_percent: g.w, h_percent: g.h };
}
