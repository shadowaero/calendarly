import React from 'react';
import { Play, Pause, Volume2, VolumeX, Minus, Plus } from 'lucide-react';
import { HA_ST, HA_BTN, useHaEntity, callHaService, haName } from './haKit';

// ha_media — media_player (Sonos) zone tile: now-playing line, play/pause, mute,
// and volume stepper with a slim level bar. Mirrors HaClimateBlock's touch gating.
export function HaMediaBlock({ config = {}, clientMode }) {
  const { ent, refresh } = useHaEntity(config.entity_id, 15000);
  const touch = clientMode !== 'display';
  const attrs = (ent && ent.attributes) || {};
  const state = ent ? ent.state : '—';
  const playing = state === 'playing';
  const muted = Boolean(attrs.is_volume_muted);
  const vol = attrs.volume_level != null ? Math.round(Number(attrs.volume_level) * 100) : null;
  const title = attrs.media_title || (state === 'off' ? 'Off' : state === 'idle' ? 'Idle' : state === 'paused' ? 'Paused' : '');
  const artist = attrs.media_artist || attrs.app_name || '';

  const call = (service, data) => {
    if (!touch || !ent) return;
    callHaService('media_player', service, { entity_id: config.entity_id, ...data }).then(refresh).catch(() => {});
  };

  return (
    <div style={{ ...HA_ST.box, gap: '0.8cqh', padding: '1.4cqh 1cqw' }}>
      <div style={{ ...HA_ST.lbl, maxWidth: '96%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {config.label || haName(ent, 'Zone')}
      </div>
      <div style={{ ...HA_ST.small, minHeight: '2.2cqh', maxWidth: '96%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}{artist ? ' · ' + artist : ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8cqw', zIndex: 3 }}>
        {touch && ent && (
          <button type="button" onClick={() => call('media_play_pause')} style={HA_BTN} aria-label="Play or pause">
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        )}
        {touch && ent && (
          <button type="button" onClick={() => call('volume_mute', { is_volume_muted: !muted })} style={{ ...HA_BTN, color: muted ? '#f87171' : '#93c5fd' }} aria-label="Mute">
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        )}
        {touch && ent && (
          <button type="button" onClick={() => call('volume_down')} style={HA_BTN} aria-label="Volume down">
            <Minus size={14} />
          </button>
        )}
        <div style={{ ...HA_ST.med, minWidth: '4.4cqw' }}>{vol != null ? vol + '%' : '—'}</div>
        {touch && ent && (
          <button type="button" onClick={() => call('volume_up')} style={HA_BTN} aria-label="Volume up">
            <Plus size={14} />
          </button>
        )}
      </div>
      {vol != null && (
        <div style={{ width: '86%', height: '0.9cqh', borderRadius: '999px', background: 'rgba(148,163,184,.18)', overflow: 'hidden', zIndex: 2 }}>
          <div style={{ width: vol + '%', height: '100%', background: muted ? '#f87171' : 'linear-gradient(90deg,#7dd3fc,#38bdf8)' }} />
        </div>
      )}
      <div style={HA_ST.foot}>
        {!ent ? (config.entity_id ? 'HA OFFLINE' : 'PICK AN ENTITY') : muted ? 'MUTED' : String(state).toUpperCase()}
      </div>
    </div>
  );
}
