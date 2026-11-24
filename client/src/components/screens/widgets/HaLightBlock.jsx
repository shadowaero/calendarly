import React from 'react';
import { Lightbulb } from 'lucide-react';
import { HA_ST, useHaEntity, callHaService, haName } from './haKit';

// ha_light — big tap-to-toggle tile with brightness bar (light.* or switch.*).
export function HaLightBlock({ config = {}, clientMode }) {
  const { ent, refresh } = useHaEntity(config.entity_id, 20000);
  const touch = clientMode !== 'display';
  const attrs = (ent && ent.attributes) || {};
  const on = Boolean(ent && ent.state === 'on');
  const bri = attrs.brightness != null ? Math.round((Number(attrs.brightness) / 255) * 100) : null;
  const domain = config.entity_id ? config.entity_id.split('.')[0] : 'light';

  const toggle = () => {
    if (!touch || !ent) return;
    callHaService(domain, 'toggle', { entity_id: config.entity_id }).then(refresh).catch(() => {});
  };

  return (
    <div
      style={{ ...HA_ST.box, cursor: touch && ent ? 'pointer' : 'default', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
      onClick={toggle}
    >
      <div style={HA_ST.lbl}>{config.label || haName(ent, 'Light')}</div>
      <div style={{ ...HA_ST.big, color: on ? '#fbbf24' : ent ? '#64748b' : '#475569', display: 'flex', alignItems: 'center', gap: '1.5cqw' }}>
        <Lightbulb
          style={{ width: 'clamp(26px,6.5cqh,64px)', height: 'auto' }}
          fill={on ? '#fbbf24' : 'none'}
          color={on ? '#fbbf24' : '#64748b'}
        />
        {on ? 'ON' : ent ? 'OFF' : '—'}
      </div>
      {bri != null && (
        <div style={{ width: '80%', height: '1.2cqh', borderRadius: '999px', background: 'rgba(148,163,184,.18)', overflow: 'hidden', zIndex: 2 }}>
          <div style={{ width: bri + '%', height: '100%', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
        </div>
      )}
      <div style={HA_ST.foot}>
        {!ent ? (config.entity_id ? 'HA OFFLINE' : 'PICK AN ENTITY') : bri != null ? bri + '% BRIGHTNESS' : touch ? 'TAP TO TOGGLE' : ''}
      </div>
    </div>
  );
}