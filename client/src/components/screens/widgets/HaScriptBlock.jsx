import React, { useState } from 'react';
import { callHaService } from './haKit';

// ha_script — one-tap HA script button (group / ungroup / preset announce) or a
// typed-announce prompt row. The message travels as script variables.message,
// matching the Lovelace preset buttons on the HA dashboard.
export function HaScriptBlock({ config = {}, clientMode }) {
  const touch = clientMode !== 'display';
  const prompt = Boolean(config.prompt);
  const [text, setText] = useState('');
  const [flash, setFlash] = useState('');
  const entity = config.entity_id || '';
  const accent = config.color || '#7dd3fc';

  const run = () => {
    if (!touch || !entity) return;
    const message = prompt ? text.trim() : (config.message || '');
    if (prompt && !message) return;
    const data = { entity_id: entity };
    if (message) data.variables = { message };
    callHaService('script', 'turn_on', data)
      .then(() => { setFlash('✓'); setText(''); setTimeout(() => setFlash(''), 1600); })
      .catch(() => { setFlash('✕'); setTimeout(() => setFlash(''), 1600); });
  };

  const card = {
    width: '100%', height: '100%', borderRadius: '14px', boxSizing: 'border-box',
    border: '1px solid ' + accent + '44',
    background: 'linear-gradient(180deg, rgba(8,20,36,.72), rgba(8,20,36,.5))',
    color: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '0.6cqh', overflow: 'hidden', padding: '1cqh 0.8cqw', touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent', userSelect: 'none'
  };
  const big = { fontSize: 'clamp(9px,2cqh,19px)', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.15 };

  if (prompt) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.8cqh', alignItems: 'stretch', justifyContent: 'center', boxSizing: 'border-box', padding: '1cqh 0.8cqw' }}>
        <div style={{ ...card, height: 'auto', padding: '0.8cqh 0.8cqw' }}>
          <span style={{ fontSize: 'clamp(13px,2.6cqh,26px)', lineHeight: 1 }}>{config.icon || '📣'}</span>
          <span style={big}>{config.label || 'Announce'}</span>
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(8,20,36,.6)', border: '1px solid ' + accent + '33', borderRadius: '10px', color: '#e2e8f0', padding: '0.9cqh 0.8cqw', fontSize: 'clamp(10px,2cqh,20px)' }}
        />
        <button type="button" onClick={run} disabled={!touch || !entity || !text.trim()} style={{ ...card, height: 'auto', padding: '1cqh', flexDirection: 'row', cursor: touch && entity && text.trim() ? 'pointer' : 'default', opacity: text.trim() ? 1 : 0.55 }}>
          <span style={big}>{flash || 'SEND ▸'}</span>
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={run} style={{ ...card, cursor: touch && entity ? 'pointer' : 'default' }}>
      <span style={{ fontSize: 'clamp(15px,3.4cqh,34px)', lineHeight: 1 }}>{config.icon || '⚡'}</span>
      <span style={big}>{config.label || 'Action'}</span>
      <span style={{ fontSize: 'clamp(8px,1.5cqh,13px)', fontWeight: 700, color: '#94a3b8' }}>{flash || (entity ? '' : 'PICK A SCRIPT')}</span>
    </button>
  );
}
