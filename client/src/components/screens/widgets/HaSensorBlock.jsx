import React from 'react';
import { Thermometer, Droplets, Zap, Gauge, Sun, Activity } from 'lucide-react';
import { HA_ST, useHaEntity, haName } from './haKit';

const DC_ICONS = {
  temperature: Thermometer,
  humidity: Droplets,
  power: Zap,
  energy: Zap,
  current: Zap,
  voltage: Zap,
  apparent_power: Zap,
  illuminance: Sun,
  pressure: Gauge
};

// ha_sensor — readout tile for sensor.* / binary_sensor.* (value + unit + class).
export function HaSensorBlock({ config = {} }) {
  const { ent } = useHaEntity(config.entity_id, 30000);
  const attrs = (ent && ent.attributes) || {};
  const dc = attrs.device_class || '';
  const Icon = DC_ICONS[dc] || Activity;
  const unit = attrs.unit_of_measurement || '';
  const isBinary = String(config.entity_id || '').indexOf('binary_sensor.') === 0;

  let val = '—';
  let hot = false;
  if (ent) {
    if (isBinary) {
      hot = ent.state === 'on';
      val = hot ? 'ON' : 'OFF';
    } else if (ent.state !== 'unavailable' && ent.state !== 'unknown') {
      const n = Number(ent.state);
      val = Number.isFinite(n) ? String(Math.round(n * 10) / 10) : ent.state;
    }
  }

  return (
    <div style={HA_ST.box}>
      <div style={HA_ST.lbl}>{config.label || haName(ent, 'Sensor')}</div>
      <Icon style={{ width: 'clamp(22px,5cqh,54px)', height: 'auto', color: hot ? '#fbbf24' : '#7dd3fc', zIndex: 2 }} />
      <div style={{ ...HA_ST.big, color: hot ? '#fbbf24' : undefined }}>
        {val}
        {unit && val !== '—' && (
          <span style={{ ...HA_ST.small, fontSize: 'clamp(10px,2.2cqh,20px)', marginLeft: '0.4cqw' }}>{unit}</span>
        )}
      </div>
      <div style={HA_ST.chip}>{dc || (isBinary ? 'binary' : 'sensor')}</div>
      <div style={HA_ST.foot}>
        {!ent ? (config.entity_id ? 'HA OFFLINE' : 'PICK AN ENTITY') : ent.entity_id}
      </div>
    </div>
  );
}