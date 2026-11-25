// HaSonosPanel.jsx — ws7bd: native port of the Lovelace custom-sonos-card
// (github.com/punxaphil/custom-sonos-card) as ONE movable block per card SECTION
// (player / volumes / groups / grouping). Screen Studio's drag/resize handles give
// every section free placement + sizing; config.visible=false hides a section
// without deleting it. Services stay inside the ws7ba whitelist (volume_set/
// volume_mute, media_* transport, shuffle_set/repeat_set, join/unjoin). Album art
// flows through the server-side /api/ha/art proxy (HA URL/token stay hidden).
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Unlink, Crown, Link2 } from 'lucide-react';
import { callHaService } from './haKit';

const SECTION_TITLES = { player: 'Now Playing', volumes: 'Zone Volumes', groups: 'Groups', grouping: 'Grouping' };

const S = {
  box: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.8cqh', boxSizing: 'border-box', padding: '1cqh 0.7cqw', overflow: 'hidden', color: '#e2e8f0', position: 'relative' },
  lbl: { fontSize: 'clamp(9px,1.8cqh,17px)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(125,211,252,0.9)', textAlign: 'center', flexShrink: 0, zIndex: 2 },
  row: { display: 'flex', alignItems: 'center', gap: '0.6cqw', background: 'rgba(8,20,36,.55)', border: '1px solid rgba(148,163,184,.14)', borderRadius: '10px', padding: '0.6cqh 0.6cqw' },
  name: { fontSize: 'clamp(8.5px,1.7cqh,15px)', fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { fontSize: 'clamp(7.5px,1.4cqh,12px)', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  btn: { width: 'clamp(24px,4.6cqh,42px)', height: 'clamp(24px,4.6cqh,42px)', borderRadius: '10px', border: '1px solid rgba(125,211,252,0.25)', background: 'rgba(8,20,36,0.6)', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' },
  scroll: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6cqh', alignContent: 'start' },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 'clamp(9px,1.8cqh,16px)', textAlign: 'center', padding: '0 1cqw', lineHeight: 1.4 },
  err: { fontSize: 'clamp(8px,1.5cqh,13px)', color: '#fca5a5', textAlign: 'center', flexShrink: 0 }
};

const artUrl = (pic) => {
  if (!pic) return null;
  if (/^https?:\/\//i.test(pic)) return pic;
  return '/api/ha/art?path=' + encodeURIComponent(pic);
};

const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
};

// Sonos group_members = [coordinator, ...slaves] (verified live against the fleet).
const groupOf = (st) => {
  const gm = st && st.attributes && Array.isArray(st.attributes.group_members) ? st.attributes.group_members : [];
  return gm.length ? gm : (st ? [st.entity_id] : []);
};
const coordinatorOf = (st) => groupOf(st)[0] || (st && st.entity_id);

// Poll all media_player states (server caches 5s) so every section auto-discovers
// zones — no per-speaker authoring, same philosophy as ha_devices.
function useSonosPlayers(intervalMs = 5000) {
  const [players, setPlayers] = useState([]);
  const pull = useCallback(() => {
    fetch('/api/ha/states?domain=media_player')
      .then((r) => (r.ok ? r.json() : { states: [] }))
      .then((j) => setPlayers(((j && j.states) || []).filter((s) => s && s.attributes)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    pull();
    const t = setInterval(pull, intervalMs);
    return () => clearInterval(t);
  }, [pull, intervalMs]);
  return { players, refresh: pull };
}

const filterZones = (players, config) => {
  const only = String(config.players || '').split(',').map((s) => s.trim()).filter(Boolean);
  return only.length
    ? players.filter((p) => only.indexOf(p.entity_id) >= 0)
    : players.filter((p) => p.attributes && p.attributes.device_class === 'speaker');
};

const pickFocus = (zones, config) => {
  if (config.entity_id) {
    const fixed = zones.find((z) => z.entity_id === config.entity_id);
    if (fixed) return fixed;
  }
  const score = (st) => {
    const a = st.attributes || {};
    const t = (Date.parse(a.media_position_updated_at || '') || 0) / 1e13;
    let s = t;
    if (st.state === 'playing') s += 10; else if (st.state === 'paused') s += 5; else s += 1;
    return s;
  };
  return [...zones].sort((a, b) => score(b) - score(a))[0] || null;
};

// Live track position: media_position extrapolated from media_position_updated_at.
const livePos = (st) => {
  const a = (st && st.attributes) || {};
  const dur = Number(a.media_duration) || 0;
  if (typeof a.media_position !== 'number') return { pos: 0, dur };
  const base = Date.parse(a.media_position_updated_at || '') || Date.now();
  const elapsed = st.state === 'playing' ? (Date.now() - base) / 1000 : 0;
  let pos = Math.max(0, a.media_position + elapsed);
  if (dur > 0) pos = Math.min(pos, dur);
  return { pos, dur };
};

function VolumeSlider({ value, onCommit, disabled }) {
  const [val, setVal] = useState(value);
  const last = useRef(0);
  useEffect(() => { setVal(value); }, [value]);
  const commit = (v) => {
    const n = v == null ? val : v;
    if (Date.now() - last.current < 350) return;
    last.current = Date.now();
    onCommit(Math.max(0, Math.min(1, n)));
  };
  return (
    <input
      type="range" min="0" max="1" step="0.02" value={val} disabled={disabled}
      onChange={(e) => setVal(Number(e.target.value))}
      onPointerUp={() => commit()} onMouseUp={() => commit()} onTouchEnd={() => commit()} onKeyUp={() => commit()}
      style={{ flex: 1, accentColor: '#38bdf8', height: '2.6cqh', touchAction: 'manipulation', minWidth: 0 }}
    />
  );
}

function MuteBtn({ muted, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={muted ? 'Unmute' : 'Mute'}
      style={{ ...S.btn, width: 'clamp(20px,3.8cqh,34px)', height: 'clamp(20px,3.8cqh,34px)', borderColor: muted ? 'rgba(248,113,113,.5)' : 'rgba(125,211,252,0.25)', color: muted ? '#f87171' : '#93c5fd', opacity: disabled ? 0.4 : 1 }}>
      {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );
}
// Album art: 'background' = full-bleed with scrim; 'side' = square tile; 'off' = none.
function ArtBackdrop({ pic, mode }) {
  const art = artUrl(pic);
  if (!art || mode === 'off') return null;
  if (mode === 'background') {
    return (
      <>
        <img src={art} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(2px) brightness(0.45)', transform: 'scale(1.06)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(2,6,23,.15),rgba(2,6,23,.82))', zIndex: 1 }} />
      </>
    );
  }
  return <img src={art} alt="" style={{ width: '34%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 12, flexShrink: 0, zIndex: 2, boxShadow: '0 4px 18px rgba(0,0,0,.5)' }} />;
}

// ─── Section: player (now playing card — artwork, transport, progress, volume) ───
function PlayerSection({ zones, config, refresh, flash }) {
  const focus = pickFocus(zones, config);
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (!focus) return <div style={S.empty}>No zones found — speakers appear automatically once paired with Home Assistant.</div>;
  const a = focus.attributes || {};
  const mode = config.artwork || 'background';
  const svc = (service, data) => callHaService('media_player', service, { entity_id: focus.entity_id, ...(data || {}) }).then(refresh).catch((e) => flash(e.message));
  return (
    <div style={{ ...S.box, justifyContent: 'flex-end' }}>
      <ArtBackdrop pic={a.entity_picture} mode={mode} />
      <div style={{ ...S.lbl, textAlign: 'left' }}>{config.title || SECTION_TITLES.player}</div>
      <div style={{ display: 'flex', gap: '1cqw', alignItems: 'center', flex: 1, minHeight: 0, zIndex: 2 }}>
        {mode === 'side' && <ArtBackdrop pic={a.entity_picture} mode="side" />}
        <PlayerInfo st={focus} svc={svc} />
      </div>
      <PlayerControls st={focus} svc={svc} />
    </div>
  );
}

function PlayerInfo({ st, svc }) {
  const a = st.attributes || {};
  const { pos, dur } = livePos(st);
  const RepIcon = a.repeat === 'one' ? Repeat1 : Repeat;
  const repOn = !!(a.repeat && a.repeat !== 'off');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5cqh', minWidth: 0, zIndex: 2, flex: 1 }}>
      <div style={{ fontSize: 'clamp(13px,3cqh,30px)', fontWeight: 800, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>
        {a.media_title || (st.state === 'idle' ? 'Idle' : st.state)}
      </div>
      <div style={{ ...S.sub, fontSize: 'clamp(9px,1.9cqh,17px)' }}>{[a.media_artist, a.media_album_name].filter(Boolean).join(' · ') || (a.friendly_name || '')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6cqw' }}>
        <span style={{ ...S.sub, width: '3.2cqw', textAlign: 'right', flexShrink: 0 }}>{fmtTime(pos)}</span>
        <div style={{ flex: 1, height: '0.7cqh', borderRadius: 99, background: 'rgba(148,163,184,.25)', overflow: 'hidden' }}>
          <div style={{ width: (dur > 0 ? Math.min(100, (pos / dur) * 100) : 0) + '%', height: '100%', background: 'linear-gradient(90deg,#38bdf8,#7dd3fc)' }} />
        </div>
        <span style={{ ...S.sub, width: '3.2cqw', flexShrink: 0 }}>{dur > 0 ? fmtTime(dur) : 'LIVE'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6cqw', flexWrap: 'wrap' }}>
        <button type="button" style={{ ...S.btn, background: a.shuffle ? 'rgba(56,189,248,.25)' : S.btn.background, borderColor: a.shuffle ? '#38bdf8' : S.btn.borderColor }} onClick={() => svc('shuffle_set', { shuffle: !a.shuffle })}><Shuffle size={15} /></button>
        <button type="button" style={{ ...S.btn, background: repOn ? 'rgba(56,189,248,.25)' : S.btn.background, borderColor: repOn ? '#38bdf8' : S.btn.borderColor }} onClick={() => svc('repeat_set', { repeat: a.repeat === 'off' || !a.repeat ? 'all' : a.repeat === 'all' ? 'one' : 'off' })}><RepIcon size={15} /></button>
        <div style={{ flex: 1 }} />
        <span style={{ ...S.sub, fontSize: 'clamp(8px,1.5cqh,13px)' }}>{a.source ? a.source + ' · ' : ''}{a.friendly_name || ''}</span>
      </div>
    </div>
  );
}

function PlayerControls({ st, svc }) {
  const a = st.attributes || {};
  const playing = st.state === 'playing';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8cqw', zIndex: 2, flexShrink: 0 }}>
      <button type="button" style={S.btn} onClick={() => svc('media_previous_track')}><SkipBack size={16} /></button>
      <button type="button" onClick={() => svc(playing ? 'media_pause' : 'media_play')}
        style={{ ...S.btn, width: 'clamp(34px,7cqh,62px)', height: 'clamp(34px,7cqh,62px)', borderRadius: 16, background: 'rgba(56,189,248,.22)', borderColor: '#38bdf8', color: '#e0f2fe' }}>
        {playing ? <Pause size={22} /> : <Play size={22} />}
      </button>
      <button type="button" style={S.btn} onClick={() => svc('media_next_track')}><SkipForward size={16} /></button>
      <div style={{ flex: 1 }} />
      <MuteBtn muted={!!a.is_volume_muted} onClick={() => svc('volume_mute', { is_volume_muted: !a.is_volume_muted })} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4cqw', width: '38%', minWidth: 0 }}>
        <VolumeSlider value={Number(a.volume_level) || 0} onCommit={(v) => svc('volume_set', { volume_level: v })} />
        <span style={{ ...S.sub, width: '2.6cqw', textAlign: 'right' }}>{Math.round((Number(a.volume_level) || 0) * 100)}</span>
      </div>
    </div>
  );
}
// ─── Section: volumes (per-zone sliders + mute — the card's signature) ───
function VolumesSection({ zones, config, refresh, flash }) {
  const svc = (id, service, data) => callHaService('media_player', service, { entity_id: id, ...(data || {}) }).then(refresh).catch((e) => flash(e.message));
  return (
    <div style={S.box}>
      <div style={S.lbl}>{config.title || SECTION_TITLES.volumes}{zones.length ? ' · ' + zones.length : ''}</div>
      {zones.length === 0 && <div style={S.empty}>No zones found — they appear automatically once paired with Home Assistant.</div>}
      <div style={S.scroll}>
        {zones.map((z) => {
          const a = z.attributes || {};
          const off = z.state === 'unavailable';
          return (
            <div key={z.entity_id} style={{ ...S.row, opacity: off ? 0.45 : 1 }}>
              <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3cqh' }}>
                <div style={S.name}>{a.friendly_name || z.entity_id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4cqw' }}>
                  <VolumeSlider disabled={off} value={Number(a.volume_level) || 0} onCommit={(v) => svc(z.entity_id, 'volume_set', { volume_level: v })} />
                  <span style={{ ...S.sub, width: '2.4cqw', textAlign: 'right' }}>{Math.round((Number(a.volume_level) || 0) * 100)}</span>
                </div>
              </div>
              <MuteBtn disabled={off} muted={!!a.is_volume_muted} onClick={() => svc(z.entity_id, 'volume_mute', { is_volume_muted: !a.is_volume_muted })} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Cluster zones into Sonos groups via coordinator-first group_members.
const clusterGroups = (zones) => {
  const byId = {};
  zones.forEach((z) => { byId[z.entity_id] = z; });
  const seen = {};
  const groups = [];
  zones.forEach((z) => {
    const members = groupOf(z);
    const coord = members[0];
    if (seen[coord]) return;
    seen[coord] = true;
    groups.push(members.map((id) => byId[id] || { entity_id: id, state: 'unavailable', attributes: { friendly_name: id.split('.')[1] } }));
  });
  return groups;
};

// ─── Section: groups (current groups + per-member ungroup) ───
function GroupsSection({ zones, config, refresh, flash }) {
  const groups = clusterGroups(zones);
  const unjoin = (id) => callHaService('media_player', 'unjoin', { entity_id: id }).then(refresh).catch((e) => flash(e.message));
  return (
    <div style={S.box}>
      <div style={S.lbl}>{config.title || SECTION_TITLES.groups}</div>
      {groups.length === 0 && <div style={S.empty}>No zones found — they appear automatically once paired with Home Assistant.</div>}
      <div style={S.scroll}>
        {groups.map((g) => {
          const coord = g[0];
          const multi = g.length > 1;
          return (
            <div key={coord.entity_id} style={{ ...S.row, flexDirection: 'column', alignItems: 'stretch', gap: '0.4cqh' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5cqw' }}>
                {multi && <Crown size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />}
                <div style={{ ...S.name, flex: 1 }}>{(coord.attributes && coord.attributes.friendly_name) || coord.entity_id}{multi ? ' · ' + g.length + ' zones' : ''}</div>
                {multi && (
                  <button type="button" onClick={() => g.slice(1).forEach((m) => unjoin(m.entity_id))}
                    style={{ ...S.btn, width: 'auto', height: 'clamp(18px,3.2cqh,28px)', padding: '0 0.6cqw', gap: '0.3cqw', fontSize: 'clamp(7.5px,1.4cqh,12px)', fontWeight: 700 }}>
                    <Unlink size={12} /> All
                  </button>
                )}
              </div>
              {multi && g.slice(1).map((m) => (
                <div key={m.entity_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5cqw', background: 'rgba(2,6,23,.4)', borderRadius: 8, padding: '0.35cqh 0.5cqw' }}>
                  <Link2 size={11} style={{ color: '#7dd3fc', flexShrink: 0 }} />
                  <div style={{ ...S.sub, flex: 1, color: '#cbd5e1' }}>{(m.attributes && m.attributes.friendly_name) || m.entity_id}</div>
                  <button type="button" onClick={() => unjoin(m.entity_id)} title="Remove from group" style={{ ...S.btn, width: 'clamp(18px,3.2cqh,28px)', height: 'clamp(18px,3.2cqh,28px)', borderRadius: 8 }}><Unlink size={11} /></button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── Section: grouping (tap a coordinator, tap members to join/leave) ───
function GroupingSection({ zones, config, refresh, flash }) {
  const [sel, setSel] = useState(null);
  const selZone = zones.find((z) => z.entity_id === sel) || null;
  const selGroup = selZone ? groupOf(selZone) : [];

  const tap = (z) => {
    if (!sel) { setSel(z.entity_id); return; }
    if (z.entity_id === sel) { setSel(null); return; }
    const inGroup = selGroup.indexOf(z.entity_id) >= 0;
    const req = inGroup
      ? callHaService('media_player', 'unjoin', { entity_id: z.entity_id })
      : callHaService('media_player', 'join', { entity_id: sel, group_members: [z.entity_id] });
    req.then(refresh).catch((e) => flash(e.message));
  };

  return (
    <div style={S.box}>
      <div style={S.lbl}>{config.title || SECTION_TITLES.grouping}</div>
      {zones.length === 0 && <div style={S.empty}>No zones found — they appear automatically once paired with Home Assistant.</div>}
      <div style={{ ...S.sub, flexShrink: 0, textAlign: 'center', whiteSpace: 'normal' }}>
        {sel ? (
          <>Grouping to <b style={{ color: '#7dd3fc' }}>{(selZone.attributes && selZone.attributes.friendly_name) || sel}</b> — tap zones to add/remove · tap ★ to finish</>
        ) : 'Tap a zone to become the group leader, then tap the zones to add'}
      </div>
      <div style={S.scroll}>
        {zones.map((z) => {
          const a = z.attributes || {};
          const members = groupOf(z);
          const isCoord = coordinatorOf(z) === z.entity_id;
          const multi = members.length > 1;
          const selected = z.entity_id === sel;
          const inSel = selGroup.indexOf(z.entity_id) >= 0;
          return (
            <div key={z.entity_id} onClick={() => tap(z)}
              style={{
                ...S.row, cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', userSelect: 'none',
                borderColor: selected ? '#38bdf8' : inSel ? 'rgba(56,189,248,.45)' : 'rgba(148,163,184,.14)',
                background: selected ? 'rgba(56,189,248,.18)' : 'rgba(8,20,36,.55)',
                opacity: z.state === 'unavailable' ? 0.45 : 1
              }}>
              {multi && <Crown size={13} style={{ color: isCoord ? '#fbbf24' : 'transparent', flexShrink: 0 }} />}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={S.name}>{a.friendly_name || z.entity_id}{selected ? ' ★' : ''}</div>
                <div style={S.sub}>{multi ? (isCoord ? 'Group leader · ' + members.length + ' zones' : 'In ' + members.length + '-zone group') : (z.state === 'unavailable' ? 'Unavailable' : 'Solo')}</div>
              </div>
              {sel && inSel && z.entity_id !== sel && <Unlink size={13} style={{ color: '#f87171', flexShrink: 0 }} />}
              {sel && !inSel && z.entity_id !== sel && <Link2 size={13} style={{ color: '#7dd3fc', flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ha_sonos_panel — one configurable Sonos-card section per block.
export function HaSonosPanel({ config = {}, clientMode }) {
  const { players, refresh } = useSonosPlayers();
  const [err, setErr] = useState('');
  const errTimer = useRef(null);
  const flash = useCallback((m) => {
    setErr(m || '');
    clearTimeout(errTimer.current);
    errTimer.current = setTimeout(() => setErr(''), 4500);
  }, []);

  if (config.visible === false) {
    if (clientMode === 'display') return null;
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(148,163,184,.4)', borderRadius: 12, color: '#64748b', fontSize: 'clamp(8px,1.6cqh,14px)', textAlign: 'center', padding: '0 1cqw' }}>
        Section hidden (Sonos: {SECTION_TITLES[config.section] || config.section || 'panel'}) — enable it in settings
      </div>
    );
  }

  const zones = filterZones(players, config);
  const section = config.section || 'player';
  const common = { zones, config, refresh, flash };
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {section === 'player' ? <PlayerSection {...common} />
          : section === 'volumes' ? <VolumesSection {...common} />
          : section === 'groups' ? <GroupsSection {...common} />
          : <GroupingSection {...common} />}
      </div>
      {err && <div style={S.err}>⚠ {err}</div>}
    </div>
  );
}
