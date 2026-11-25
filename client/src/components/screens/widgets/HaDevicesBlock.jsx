import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Plug, Thermometer, Activity, Fan, Blinds, Lock, Cpu, Gauge, ToggleLeft } from 'lucide-react';
import { callHaService } from './haKit';

const DOM_ICONS = {
  light: Lightbulb, switch: Plug, climate: Thermometer, sensor: Activity,
  binary_sensor: Activity, fan: Fan, cover: Blinds, lock: Lock,
  humidifier: Gauge, input_boolean: ToggleLeft, number: Cpu
};

// ha_devices — auto-grid of HA devices filtered by a domain list. Self-fills as
// devices get paired with Home Assistant, so the IoT screen needs no per-device
// authoring (and the empty state promises exactly that).
export function HaDevicesBlock({ config = {}, clientMode }) {
  const touch = clientMode !== 'display';
  const [ents, setEnts] = useState([]);
  const domains = String(config.domains || 'light,switch').split(',').map((s) => s.trim()).filter(Boolean);

  const pull = useCallback(() => {
    fetch('/api/ha/entities')
      .then((r) => (r.ok ? r.json() : { entities: [] }))
      .then((j) => setEnts((j.entities || []).filter((e) => domains.indexOf(e.domain) >= 0)))
      .catch(() => {});
  }, [config.domains]);

  useEffect(() => {
    pull();
    const t = setInterval(pull, 15000);
    return () => clearInterval(t);
  }, [pull]);

  const actionable = (d) => ['light', 'switch', 'fan', 'input_boolean', 'cover', 'lock', 'humidifier'].indexOf(d) >= 0;

  const tap = (e) => {
    if (!touch || !actionable(e.domain)) return;
    let service = null;
    const data = { entity_id: e.entity_id };
    if (e.domain === 'cover') service = e.state === 'open' ? 'close_cover' : 'open_cover';
    else if (e.domain === 'lock') service = e.state === 'locked' ? 'unlock' : 'lock';
    else service = 'toggle';
    callHaService(e.domain, service, data).then(pull).catch(() => {});
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.8cqh', boxSizing: 'border-box', padding: '1cqh 0.6cqw', overflow: 'hidden' }}>
      <div style={{ fontSize: 'clamp(9px,1.8cqh,17px)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(125,211,252,0.9)', textAlign: 'center' }}>
        {config.title || 'Devices'}{ents.length ? ' · ' + ents.length : ''}
      </div>
      {ents.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 'clamp(9px,1.8cqh,16px)', textAlign: 'center', padding: '0 1cqw', lineHeight: 1.4 }}>
          No devices here yet — they appear automatically once paired with Home Assistant.
        </div>
      )}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(' + (Number(config.columns) || 2) + ', minmax(0,1fr))', gap: '0.6cqh 0.5cqw', overflowY: 'auto', alignContent: 'start' }}>
        {ents.map((e) => {
          const Icon = DOM_ICONS[e.domain] || Activity;
          const hot = e.state === 'on' || e.state === 'open' || e.state === 'unlocked' || e.state === 'heat' || e.state === 'cool';
          return (
            <div
              key={e.entity_id}
              onClick={() => tap(e)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6cqw', background: 'rgba(8,20,36,.55)',
                border: '1px solid rgba(148,163,184,.14)', borderRadius: '10px', padding: '0.7cqh 0.6cqw',
                cursor: touch && actionable(e.domain) ? 'pointer' : 'default', touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent', userSelect: 'none', minHeight: '4.2cqh'
              }}
            >
              <Icon size={14} style={{ color: hot ? '#fbbf24' : '#7dd3fc', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 'clamp(8.5px,1.7cqh,15px)', fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                <div style={{ fontSize: 'clamp(7.5px,1.4cqh,12px)', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.unit ? e.state + ' ' + e.unit : e.state}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
