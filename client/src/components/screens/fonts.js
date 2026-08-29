export const FONT_OPTIONS = [
  { value: 'default', label: 'Plus Jakarta Sans', fontClass: "font-['Plus_Jakarta_Sans',sans-serif]", sample: 'Modern & Clean' },
  { value: 'outfit', label: 'Outfit', fontClass: "font-['Outfit',sans-serif]", sample: 'Geometric Sans' },
  { value: 'mono', label: 'Monospace', fontClass: 'font-mono', sample: '01:23 Tech Terminal' },
  { value: 'walter', label: 'Chalkboard (Walter)', fontClass: "font-['Walter_Turncoat',cursive]", sample: 'School Chalk' },
  { value: 'schoolbell', label: 'Schoolbell', fontClass: "font-['Schoolbell',cursive]", sample: 'Classroom Script' },
  { value: 'caveat', label: 'Caveat', fontClass: "font-['Caveat',cursive]", sample: 'Cursive Notes' },
  { value: 'patrick_hand', label: 'Patrick Hand', fontClass: "font-['Patrick_Hand',cursive]", sample: 'Marker Handwriting' },
  { value: 'kalam', label: 'Kalam', fontClass: "font-['Kalam',cursive]", sample: 'Pen Calligraphy' },
  { value: 'shadows', label: 'Shadows Into Light', fontClass: "font-['Shadows_Into_Light',cursive]", sample: 'Delicate Script' },
  { value: 'homemade', label: 'Homemade Apple', fontClass: "font-['Homemade_Apple',cursive]", sample: 'Vintage Lettering' },
  { value: 'gochi', label: 'Gochi Hand', fontClass: "font-['Gochi_Hand',cursive]", sample: 'Playful Comic' }
];

export const FONT_CLASSES = {
  default: "font-['Plus_Jakarta_Sans',sans-serif]",
  outfit: "font-['Outfit',sans-serif]",
  mono: 'font-mono',
  caveat: "font-['Caveat',cursive]",
  patrick_hand: "font-['Patrick_Hand',cursive]",
  kalam: "font-['Kalam',cursive]",
  shadows: "font-['Shadows_Into_Light',cursive]",
  walter: "font-['Walter_Turncoat',cursive]",
  homemade: "font-['Homemade_Apple',cursive]",
  gochi: "font-['Gochi_Hand',cursive]",
  schoolbell: "font-['Schoolbell',cursive]"
};

// ============================================================
// Unified font SIZE system (point sizes)
// ============================================================
export const FONT_SIZE_PRESETS = [
  { label: 'Tiny', pt: 8 },
  { label: 'XS', pt: 10 },
  { label: 'S', pt: 12 },
  { label: 'M', pt: 14 },
  { label: 'L', pt: 18 },
  { label: 'XL', pt: 24 },
  { label: 'XXL', pt: 32 }
];

// Legacy named sizes -> pt (backward compatible)
const LEGACY_PT = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 30,
  xxl: 30,
  '3xl': 36
};

// Resolve any stored fontSize value to a numeric point size.
export function resolveFontSizePt(value, fallbackPt = 14) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    if (!Number.isNaN(n)) return n;
    if (LEGACY_PT[value] != null) return LEGACY_PT[value];
  }
  return fallbackPt;
}

// Build an inline style for a base pt size scaled by factor.
export function fontSizeStyle(pt, factor = 1) {
  return { fontSize: Math.round((resolveFontSizePt(pt) * factor) * 10) / 10 + 'pt' };
}
