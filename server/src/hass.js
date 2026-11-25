// hass.js — Home Assistant REST bridge for the kiosk (ws7ay).
// Config lives in DATA_DIR/ha.json ({ baseUrl, token }) — deliberately OUTSIDE git
// (house rule: no credentials in tracked files; server/data/ is gitignored).
// Env vars HA_BASE_URL / HA_TOKEN override for container deploys.
import path from 'path';
import fs from 'fs';
import db from './db.js';
import { broadcast } from './websocket.js';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const CFG_PATH = path.join(DATA_DIR, 'ha.json');
const DEFAULT_BASE = 'http://192.168.76.188:8123';

export function haConfig() {
  let fileCfg = {};
  try { fileCfg = JSON.parse(fs.readFileSync(CFG_PATH, 'utf8')); } catch { /* not provisioned yet */ }
  const baseUrl = String(process.env.HA_BASE_URL || fileCfg.baseUrl || DEFAULT_BASE).replace(/\/+$/, '');
  const token = String(process.env.HA_TOKEN || fileCfg.token || '');
  return { baseUrl, token };
}

export function haConfigured() {
  return Boolean(haConfig().token);
}

let cache = { at: 0, states: null };
const CACHE_MS = 5000;

// GET /api/states with a short cache (kiosk tiles poll frequently).
export async function haStates() {
  const now = Date.now();
  if (cache.states && now - cache.at < CACHE_MS) return cache.states;
  const { baseUrl, token } = haConfig();
  if (!token) return null;
  const r = await fetch(baseUrl + '/api/states', {
    headers: { Authorization: 'Bearer ' + token },
    signal: AbortSignal.timeout(5000)
  });
  if (!r.ok) throw new Error('ha http ' + r.status);
  const states = await r.json();
  cache = { at: now, states };
  return states;
}

// Service whitelist — kiosk touch actions stay LAN-open like the event endpoints
// (public edge is gated by authentik/NPM per the wave4 hardening policy), but the
// blast radius is limited: whitelisted domain/service pairs, one well-formed entity
// per call, and the entity domain must match the service domain.
export const HA_ALLOWED_SERVICES = {
  light: ['toggle', 'turn_on', 'turn_off'],
  switch: ['toggle', 'turn_on', 'turn_off'],
  fan: ['toggle', 'turn_on', 'turn_off'],
  climate: ['set_temperature', 'set_hvac_mode'],
  cover: ['open_cover', 'close_cover', 'stop_cover'],
  homeassistant: ['toggle'],
  // ws7ba — Sonos / whole-home audio (media tiles + join/unjoin groups) and the
  // script domain powering Group / Ungroup / Announce from the kiosk screens.
  media_player: ['turn_on', 'turn_off', 'toggle', 'volume_set', 'volume_up', 'volume_down', 'volume_mute', 'media_play', 'media_pause', 'media_stop', 'media_play_pause', 'media_next_track', 'media_previous_track', 'play_media', 'select_source', 'join', 'unjoin', 'clear_playlist', 'shuffle_set', 'repeat_set', 'snapshot', 'restore'],
  script: ['turn_on'],
  lock: ['lock', 'unlock'],
  input_boolean: ['toggle', 'turn_on', 'turn_off'],
  number: ['set_value']
};
const ENTITY_RE = /^[a-z_0-9]+\.[a-zA-Z0-9_]+$/;

export async function haCallService(domain, service, data) {
  const allowed = HA_ALLOWED_SERVICES[domain];
  if (!allowed || allowed.indexOf(service) < 0) {
    throw Object.assign(new Error('service not allowed'), { status: 403 });
  }
  const body = data && typeof data === 'object' ? { ...data } : {};
  const entity = String(body.entity_id || '');
  if (!ENTITY_RE.test(entity)) {
    throw Object.assign(new Error('entity_id required'), { status: 400 });
  }
  if (domain !== 'homeassistant' && entity.split('.')[0] !== domain) {
    throw Object.assign(new Error('entity/domain mismatch'), { status: 400 });
  }
  const { baseUrl, token } = haConfig();
  if (!token) throw Object.assign(new Error('ha not configured'), { status: 503 });
  const r = await fetch(baseUrl + '/api/services/' + domain + '/' + service, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000)
  });
  if (!r.ok) throw new Error('ha http ' + r.status);
  cache.at = 0; // states changed — bust the cache so tiles refresh instantly
  return await r.json();
}

// Auto-wire seeded ha_* blocks that still have an empty entity_id, once HA is
// reachable (runs at boot and after token provisioning + restart). Fills each
// entity only once; never overwrites a user-picked entity_id.
export async function autofillHaBlocks() {
  try {
    const states = await haStates();
    if (!states || !states.length) return { filled: 0 };
    const rows = db.prepare(
      "SELECT id, type, config FROM screen_blocks WHERE type IN ('ha_climate','ha_light','ha_sensor')"
    ).all();
    const used = new Set(
      rows
        .map((r) => { try { return (JSON.parse(r.config || '{}') || {}).entity_id || ''; } catch { return ''; } })
        .filter(Boolean)
    );
    const domainOf = (id) => String(id).split('.')[0];
    const nameOf = (s) => (s.attributes && s.attributes.friendly_name) || s.entity_id;
    const free = (pred) => states.filter((s) => !used.has(s.entity_id) && pred(s));
    const dcRank = { temperature: 0, humidity: 1, power: 2, energy: 3, illuminance: 4, pressure: 5 };
    let filled = 0;
    for (const row of rows) {
      let cfg = {};
      try { cfg = JSON.parse(row.config || '{}') || {}; } catch { /* keep {} */ }
      if (cfg.entity_id) continue;
      let pick = null;
      if (row.type === 'ha_climate') {
        pick = free((s) => domainOf(s.entity_id) === 'climate')[0];
      } else if (row.type === 'ha_light') {
        pick = free((s) => domainOf(s.entity_id) === 'light')[0] || free((s) => domainOf(s.entity_id) === 'switch')[0];
      } else {
        const pool = free((s) => domainOf(s.entity_id) === 'sensor' || domainOf(s.entity_id) === 'binary_sensor');
        pool.sort((a, b) => {
          const ra = dcRank[(a.attributes && a.attributes.device_class)] ?? 9;
          const rb = dcRank[(b.attributes && b.attributes.device_class)] ?? 9;
          return ra - rb;
        });
        pick = pool[0];
      }
      if (!pick) continue;
      used.add(pick.entity_id);
      cfg.entity_id = pick.entity_id;
      if (!cfg.label || /^(Sensor|Light) \d$|^Thermostat$/.test(cfg.label)) cfg.label = nameOf(pick);
      db.prepare('UPDATE screen_blocks SET config = ? WHERE id = ?').run(JSON.stringify(cfg), row.id);
      filled++;
    }
    if (filled) {
      console.log('[HA] autofilled ' + filled + ' block entity binding(s)');
      broadcast('SCREEN_UPDATED', {});
    }
    return { filled };
  } catch (e) {
    return { filled: 0, error: e.message };
  }
}