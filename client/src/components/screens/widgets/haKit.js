// haKit.js — shared kit for the Home Assistant tiles (ws7ay).
// Visual constants intentionally mirror fdwKit's wsTile `st` object so the HA tiles
// speak the same "instrument" language as the ws_* weather tiles. fdwKit stays
// byte-untouched (verbatim-port policy). cqh/cqw units match wsTile semantics.
import { useState, useEffect, useCallback } from 'react';

export const HA_ST = {
  box: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5cqh', boxSizing: 'border-box', padding: '2cqh 1.6cqw', background: 'rgba(2,6,23,0.55)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: '16px', overflow: 'hidden', position: 'relative', color: '#e2e8f0', textAlign: 'center', transition: 'opacity .8s' },
  lbl: { fontSize: 'clamp(9px,1.8cqh,17px)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(125,211,252,0.9)', textShadow: '0 1px 8px rgba(0,0,0,.45)', zIndex: 2 },
  big: { fontSize: 'clamp(24px,8cqh,84px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', textShadow: '0 2px 16px rgba(0,0,0,.4)', zIndex: 2 },
  med: { fontSize: 'clamp(12px,2.5cqh,26px)', fontWeight: 700, zIndex: 2 },
  small: { fontSize: 'clamp(9px,1.95cqh,18px)', fontWeight: 600, color: '#cbd5e1', zIndex: 2 },
  chip: { fontSize: 'clamp(8.5px,1.7cqh,15px)', fontWeight: 700, color: '#93c5fd', background: 'rgba(8,20,36,0.5)', border: '1px solid rgba(125,211,252,0.18)', borderRadius: '999px', padding: '0.45cqh 1.1cqw', whiteSpace: 'nowrap', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.6cqw' },
  foot: { fontSize: 'clamp(7.5px,1.4cqh,12px)', fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(148,163,184,.85)', zIndex: 2 }
};

export const HA_BTN = {
  width: 'clamp(26px,5.2cqh,48px)',
  height: 'clamp(26px,5.2cqh,48px)',
  borderRadius: '12px',
  border: '1px solid rgba(125,211,252,0.25)',
  background: 'rgba(8,20,36,0.6)',
  color: '#93c5fd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 3,
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent'
};

// Poll one HA entity through the server-side cache (/api/ha/states?ids=...).
export function useHaEntity(entityId, intervalMs = 30000) {
  const [ent, setEnt] = useState(null);
  const [err, setErr] = useState(null);
  const pull = useCallback((bust) => {
    if (!entityId) { setEnt(null); setErr(null); return; }
    fetch('/api/ha/states?ids=' + encodeURIComponent(entityId) + (bust ? '&_=' + Date.now() : ''))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http ' + r.status))))
      .then((j) => {
        const list = (j && j.states) || [];
        setEnt(list.find((s) => s.entity_id === entityId) || null);
        setErr(null);
      })
      .catch((e) => setErr(e.message || 'HA unavailable'));
  }, [entityId]);
  useEffect(() => {
    pull();
    const t = setInterval(() => pull(), intervalMs);
    return () => clearInterval(t);
  }, [pull, intervalMs]);
  return { ent, err, refresh: () => pull(true) };
}

// Call a whitelisted HA service (server validates domain/service/entity).
export function callHaService(domain, service, data) {
  return fetch('/api/ha/services/' + domain + '/' + service, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  }).then((r) => (r.ok ? r.json() : r.json().then((j) => Promise.reject(new Error(j.error || ('http ' + r.status))))));
}

export function haName(ent, fallback) {
  return (ent && ent.attributes && ent.attributes.friendly_name) || fallback || (ent ? ent.entity_id : 'HA');
}