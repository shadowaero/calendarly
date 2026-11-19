export const COLOR_BACKGROUNDS = [
  { label: 'Deep Dark', value: '#090D16' },
  { label: 'Slate Blue', value: '#0F172A' },
  { label: 'Obsidian', value: '#050811' },
  { label: 'Midnight', value: 'linear-gradient(135deg, #0a1128 0%, #1c2541 100%)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #061a14 0%, #0c2b20 100%)' },
  { label: 'Harvest Amber', value: 'linear-gradient(135deg, #1c0d02 0%, #3d1c06 100%)' },
  { label: 'Spooky Twilight', value: 'linear-gradient(135deg, #120726 0%, #2b0c3d 50%, #0d0417 100%)' },
  { label: 'Autumn Bronze', value: 'linear-gradient(135deg, #261105 0%, #4a2108 100%)' },
  { label: 'Holiday Pine', value: 'linear-gradient(135deg, #051a0e 0%, #0f3820 100%)' },
  { label: 'Christmas Crimson', value: 'linear-gradient(135deg, #240508 0%, #470d13 100%)' },
  { label: 'Winter Frost', value: 'linear-gradient(135deg, #061524 0%, #102a45 100%)' },
  { label: 'Chalkboard Green', value: '#2a9313' }
];

// 20 solid colors for per-block card backgrounds
export const BLOCK_BACKGROUND_COLORS = [
  { label: 'Deep Dark', value: '#090D16' },
  { label: 'Slate', value: '#0F172A' },
  { label: 'Slate 800', value: '#1e293b' },
  { label: 'Zinc 800', value: '#3f3f46' },
  { label: 'Zinc 900', value: '#27272a' },
  { label: 'Zinc 950', value: '#18181b' },
  { label: 'Teal 900', value: '#134e4a' },
  { label: 'Green 900', value: '#14532d' },
  { label: 'Green 950', value: '#052e16' },
  { label: 'Cyan 900', value: '#164e63' },
  { label: 'Blue 900', value: '#1e3a8a' },
  { label: 'Blue 950', value: '#172554' },
  { label: 'Indigo 900', value: '#312e81' },
  { label: 'Violet 900', value: '#4c1d95' },
  { label: 'Fuchsia 900', value: '#701a75' },
  { label: 'Pink 900', value: '#831843' },
  { label: 'Rose 900', value: '#881337' },
  { label: 'Red 900', value: '#7f1d1d' },
  { label: 'Orange 900', value: '#7c2d12' },
  { label: 'Amber 900', value: '#78350f' }
];

export const PATTERN_BACKGROUNDS = [
  { key: 'dots', label: 'Dots', css: 'radial-gradient(rgba(148,163,184,0.22) 1px, transparent 1px) 0 0/18px 18px, #0b1120' },
  { key: 'grid', label: 'Grid', css: 'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px) 0 0/36px 36px, linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px) 0 0/36px 36px, #0b1120' },
  { key: 'stripes', label: 'Stripes', css: 'repeating-linear-gradient(45deg, rgba(148,163,184,0.08) 0 12px, transparent 12px 24px), #0b1120' },
  { key: 'diagonal', label: 'Diagonal', css: 'repeating-linear-gradient(135deg, rgba(148,163,184,0.10) 0 1px, transparent 1px 14px), #0b1120' },
  { key: 'checker', label: 'Checker', css: 'conic-gradient(#0b1120 90deg, #141b2d 90deg 180deg, #0b1120 180deg 270deg, #141b2d 270deg) 0 0/32px 32px' },
  { key: 'waves', label: 'Waves', css: 'radial-gradient(circle at 50% 120%, rgba(59,130,246,0.18), transparent 55%), #0b1120' },
  { key: 'chalkboard', label: 'Gray Chalk', css: 'url(/photos/chalkboard_background.jpg) center / cover no-repeat #3a4148' },
  { key: 'spooky_fog', label: 'Spooky Mist', css: 'radial-gradient(circle at 80% 20%, rgba(168,85,247,0.25), transparent 40%), radial-gradient(circle at 20% 80%, rgba(249,115,22,0.20), transparent 45%), #0a0512' },
  { key: 'harvest_glow', label: 'Harvest Glow', css: 'radial-gradient(circle at 70% 30%, rgba(245,158,11,0.25), transparent 50%), radial-gradient(circle at 20% 70%, rgba(180,83,9,0.20), transparent 50%), #140802' },
  { key: 'holiday_bokeh', label: 'Holiday Bokeh', css: 'radial-gradient(circle at 30% 20%, rgba(239,68,68,0.22), transparent 40%), radial-gradient(circle at 75% 75%, rgba(34,197,94,0.20), transparent 45%), #08120c' }
];

export function getBackgroundStyle(type, value) {
  if (type === 'photo' && value) {
    return { backgroundImage: `url("${value}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (type === 'pattern' && value) {
    const p = PATTERN_BACKGROUNDS.find((x) => x.key === value);
    if (p) return { background: p.css };
  }
  return { background: value || '#090D16' };
}

// Per-block background: custom image takes precedence, then custom color.
// Returns an inline style object, or null when no custom background is set
// (so the caller falls back to its bgOpacity classes).
export function getBlockBackgroundStyle(config = {}) {
  if (config.bgImage) {
    return { backgroundImage: `url("${config.bgImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (config.bgColor) {
    return { background: config.bgColor };
  }
  return null;
}
