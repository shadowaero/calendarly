// DAKboard .dakexport importer
// A .dakexport file is JSON like: { "lock": "...", "data": "<base64-encoded screen JSON>" }
// The decoded "data" uses DAKboard's v7 screen schema (settings + blocks).

function numOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function mapDakboardBlock(b) {
  const pct = {
    x_percent: numOrNull(b.x_percent),
    y_percent: numOrNull(b.y_percent),
    w_percent: numOrNull(b.w_percent),
    h_percent: numOrNull(b.h_percent)
  };

  switch (b.type) {
    case 'photos':
      return {
        type: 'photo_embed',
        ...pct,
        config: {
          url: (b.params && b.params.url) || '',
          caption: b.name || '',
          crop: b.crop === '1'
        }
      };

    case 'calendar': {
      const ct = (b.calendar_type || 'monthly').toLowerCase();
      const isList = ct.includes('weekly') || ct.includes('agenda') || ct.includes('list');
      return {
        type: isList ? 'calendar_agenda' : 'calendar_month',
        ...pct,
        config: {
          feeds: (b.calendars || []).map(c => c.name || '').filter(Boolean),
          limit: numOrNull(b.limit) || 7,
          color: b.color || 'light',
          showLocation: b.show_location === '1',
          showDescription: b.show_description === '1'
        }
      };
    }

    case 'datetime':
      return {
        type: 'clock_weather',
        ...pct,
        config: {
          showSeconds: b.show_seconds === '1',
          format24: b.time_format === '24',
          dateFormat: b.date_format || null,
          location: b.name || 'Home'
        }
      };

    case 'text':
      return {
        type: 'text',
        ...pct,
        config: {
          text: b.text || b.name || '',
          color: b.color || 'light',
          fontSize: b.font_size || null
        }
      };

    case 'dailyfacts':
      return { type: 'dailyfacts', ...pct, config: {} };

    case 'weather':
      return {
        type: 'clock_weather',
        ...pct,
        config: { location: b.location || 'Home', weatherUnits: b.units || 'F' }
      };

    default:
      // Best-effort: render unknown DAKboard block as a text placeholder
      return {
        type: 'text',
        ...pct,
        config: { text: b.text || `[${b.type}] ${b.name || ''}`.trim() }
      };
  }
}

function decodeBase64Json(s) {
  try {
    const text = Buffer.from(s, 'base64').toString('utf8');
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

export function decodeDakexport(input) {
  let obj = input;

  // 1. If it's a string, parse it as JSON (or treat as raw base64)
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      obj = decodeBase64Json(obj);
      if (!obj) throw new Error('Invalid DAKboard export: could not parse file');
    }
  }

  // 2. Unwrap { lock, data } or { data: ... } wrapper forms
  if (obj && typeof obj === 'object') {
    if (typeof obj.data === 'string') {
      const decoded = decodeBase64Json(obj.data);
      if (decoded) {
        obj = decoded;
      } else {
        try { obj = JSON.parse(obj.data); } catch (e) {}
      }
    } else if (obj.data && typeof obj.data === 'object') {
      obj = obj.data;
    }
  }

  // 3. Accept either a single screen ({ blocks }) or a multi-screen backup ({ screens })
  if (obj && (Array.isArray(obj.blocks) || Array.isArray(obj.screens))) {
    return obj;
  }

  const keys = obj && typeof obj === 'object' ? Object.keys(obj).join(', ') : 'none';
  throw new Error(`Unsupported DAKboard export: no blocks found (found keys: ${keys})`);
}

// Returns an array of screen objects (handles single-screen and multi-screen backups)
export function convertDakboardBackupToScreens(parsed) {
  if (Array.isArray(parsed.screens)) {
    return parsed.screens.map(s => convertDakboardToScreen(s)).filter(s => s.blocks.length > 0);
  }
  if (Array.isArray(parsed.blocks)) {
    const s = convertDakboardToScreen(parsed);
    return s.blocks.length > 0 ? [s] : [];
  }
  return [];
}

export function convertDakboardToScreen(parsed) {
  const settings = parsed.settings || {};
  const inner = settings.settings || {};

  const blocks = (parsed.blocks || [])
    .filter(b => !b.is_disabled)
    .map(mapDakboardBlock);

  return {
    name: settings.name || 'Imported DAKboard Screen',
    description: 'Imported from DAKboard (.dakexport)',
    orientation: settings.orientation || 'landscape',
    resolution: (settings.width && settings.height) ? `${settings.width}x${settings.height}` : '1080p',
    background_type: 'color',
    background_value: inner.background_color || '#090D16',
    custom_css: inner.custom_css || '',
    is_template: 0,
    template_name: null,
    blocks
  };
}
