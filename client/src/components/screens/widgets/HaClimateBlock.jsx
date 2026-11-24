import React from 'react';
import { Minus, Plus, Power } from 'lucide-react';
import { HA_ST, HA_BTN, useHaEntity, callHaService, haName } from './haKit';

// ha_climate — thermostat tile: current + target temps with touch +/- and power.
export function HaClimateBlock({ config = {}, clientMode }) {
  const { ent, refresh } = useHaEntity(config.entity_id, 20000);
  const step = Number(config.step) || 1;
  const touch = clientMode !== 'display';
  const attrs = (ent && ent.attributes) || {};
  const unit = attrs.temperature_unit || attrs.unit_of_measurement || '';
  const cur = attrs.current_temperature != null ? Math.round(Number(attrs.current_temperature) * 10) / 10 : null;
  const target = attrs.temperature != null ? Number(attrs.temperature) : null;
  const mode = (ent && ent.state) || '—';
  const action = attrs.hvac_action || (mode === 'off' ? 'off' : 'idle');
  const actionColor = action === 'heating' ? '#fbbf24' : action === 'cooling' ? '#7dd3fc' : action === 'off' ? '#64748b' : '#94a3b8';

  const setTarget = (delta) => {
    if (!touch || !ent || target == null) return;
    const next = Math.round((target + delta) * 2) / 2;
    callHaService('climate', 'set_temperature', { entity_id: config.entity_id, temperature: next })
      .then(refresh).catch(() => {});
  };
  const togglePower = () => {
    if (!touch || !ent) return;
    const modes = attrs.hvac_modes || [];
    const onMode = ['heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only'].find((m) => modes.indexOf(m) >= 0) || 'auto';
    callHaService('climate', 'set_hvac_mode', {
      entity_id: config.entity_id,
      hvac_mode: mode !== 'off' ? 'off' : onMode
    }).then(refresh).catch(() => {});
  };

  return (
    <div style={HA_ST.box}>
      <div style={HA_ST.lbl}>{config.label || haName(ent, 'Thermostat')}</div>
      {!ent && <div style={HA_ST.small}>{config.entity_id ? 'HA offline' : 'Pick an entity'}</div>}
      {ent && (
        <>
          <div style={{ ...HA_ST.big, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {cur != null ? cur : '—'}
            <span style={{ ...HA_ST.small, fontSize: 'clamp(10px,2.2cqh,20px)', marginTop: '0.6cqh' }}>{unit}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.4cqw', zIndex: 2 }}>
            {touch && (
              <button type="button" onClick={togglePower} style={{ ...HA_BTN, color: mode !== 'off' ? '#fbbf24' : '#64748b' }} aria-label="Power">
                <Power size={16} />
              </button>
            )}
            {touch && (
              <button type="button" onClick={() => setTarget(-step)} style={HA_BTN} aria-label="Cooler">
                <Minus size={16} />
              </button>
            )}
            <div style={{ ...HA_ST.med, minWidth: '8cqw' }}>
              <div style={HA_ST.foot}>TARGET</div>
              {target != null ? target + unit : '—'}
            </div>
            {touch && (
              <button type="button" onClick={() => setTarget(step)} style={HA_BTN} aria-label="Warmer">
                <Plus size={16} />
              </button>
            )}
          </div>
          <div style={{ ...HA_ST.chip, color: actionColor, borderColor: actionColor + '33' }}>{String(action).toUpperCase()}</div>
          <div style={HA_ST.foot}>{'MODE ' + String(mode).toUpperCase()}</div>
        </>
      )}
    </div>
  );
}