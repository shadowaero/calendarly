import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useAspectFit } from '../useAspectFit';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

function lonToTileXFrac(lon, z) { return (lon + 180) / 360 * Math.pow(2, z); }
function latToTileYFrac(lat, z) {
  const rad = lat * Math.PI / 180;
  return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, z);
}

// Re-fetch RainViewer frames on a fixed cadence so a continuously-visible radar
// block stays current (RainViewer publishes new composites roughly every 10 min).
const RADAR_REFRESH_MS = 10 * 60 * 1000;

// Weather radar widget using RainViewer tiles, centered on a location.
export function RadarBlock({ config = {}, fontFamilyClass }) {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [frameIdx, setFrameIdx] = useState(0);

  const zip = config.zip || config.location || '32757';
  const zoom = 7; // RainViewer max supported zoom level
  const magnify = Math.min(Math.max(Number(config.magnify) || 2, 1), 3); // digital zoom (crop)
  const color = Number.isFinite(Number(config.color)) ? Number(config.color) : 4;
  const animate = config.animate !== false;
  const label = config.label || (zip ? `${zip} Radar` : 'Weather Radar');
  const pt = resolveFontSizePt(config.fontSize, 11);

  const [ref, size] = useAspectFit(1);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      fetch(`/api/weather/radar?zip=${encodeURIComponent(zip)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
        .then((d) => { if (mounted) { setMeta(d); setError(null); } })
        .catch(() => { if (mounted) setError('Radar unavailable'); });
    };
    load();
    const t = setInterval(load, RADAR_REFRESH_MS);
    return () => { mounted = false; clearInterval(t); };
  }, [zip]);

  useEffect(() => {
    if (!animate || !meta || !meta.frames || meta.frames.length <= 1) return;
    const t = setInterval(() => setFrameIdx((i) => (i + 1) % meta.frames.length), 800);
    return () => clearInterval(t);
  }, [animate, meta]);

  const centerX = meta ? Math.floor(lonToTileXFrac(meta.lon, zoom)) : 0;
  const centerY = meta ? Math.floor(latToTileYFrac(meta.lat, zoom)) : 0;
  const frame = meta && meta.frames.length ? meta.frames[frameIdx % meta.frames.length] : null;

  // 3x3 tile grid centered on the location
  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({ x: centerX + dx, y: centerY + dy });
    }
  }

  // Base map grid one zoom level higher (6x6 tiles at zoom 8) for extra
  // town/road detail, aligned with the 3x3 radar grid at zoom 7 (512px tiles).
  const mapZoom = zoom + 1;
  const mapTiles = [];
  for (let dy = 0; dy < 6; dy++) {
    for (let dx = 0; dx < 6; dx++) {
      mapTiles.push({ x: 2 * centerX - 2 + dx, y: 2 * centerY - 2 + dy });
    }
  }

  // Marker position (fractional, within the 3x3 grid)
  let markerLeft = 50;
  let markerTop = 50;
  if (meta) {
    const xFrac = lonToTileXFrac(meta.lon, zoom);
    const yFrac = latToTileYFrac(meta.lat, zoom);
    markerLeft = ((xFrac - (centerX - 1)) / 3) * 100;
    markerTop = ((yFrac - (centerY - 1)) / 3) * 100;
  }

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden p-2 ${fontFamilyClass}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold uppercase tracking-wider text-slate-300 truncate mr-2" style={fontSizeStyle(pt, 0.8)}>{label}</span>
        {meta && frame && (
          <span className="text-slate-500 shrink-0" style={fontSizeStyle(pt, 0.6)}>
            {new Date(frame.time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div ref={ref} className="flex-1 w-full min-h-0 flex items-center justify-center">
        {error ? (
          <div className="text-slate-500" style={fontSizeStyle(pt)}>{error}</div>
        ) : !meta || !frame ? (
          <div className="text-slate-500" style={fontSizeStyle(pt)}>Loading radar…</div>
        ) : (
          <div
            className="relative overflow-hidden rounded-xl border border-slate-700 shadow-lg"
            style={{ width: size.w, height: size.h, background: '#0b1220' }}
          >
            {/* Scaled map + radar stack (digital zoom crops around the location) */}
            <div
              className="absolute inset-0"
              style={{ transform: `scale(${magnify})`, transformOrigin: `${markerLeft}% ${markerTop}%` }}
            >
              {/* Base map (OpenStreetMap) at one zoom higher for town/road detail */}
              {mapTiles.map((t, i) => (
                <div
                  key={`base-${i}`}
                  className="absolute"
                  style={{
                    left: `${(i % 6) * 100 / 6}%`,
                    top: `${Math.floor(i / 6) * 100 / 6}%`,
                    width: `${100 / 6}%`,
                    height: `${100 / 6}%`,
                    backgroundImage: `url(https://tile.openstreetmap.org/${mapZoom}/${t.x}/${t.y}.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}

              {/* Dark tint so the radar colors pop against the map */}
              <div className="absolute inset-0" style={{ background: 'rgba(7, 10, 18, 0.28)' }} />

              {/* Radar overlay tiles (transparent PNGs, 512px for extra detail) */}
              {tiles.map((t, i) => (
                <div
                  key={`radar-${i}`}
                  className="absolute"
                  style={{
                    left: `${(i % 3) * 100 / 3}%`,
                    top: `${Math.floor(i / 3) * 100 / 3}%`,
                    width: `${100 / 3}%`,
                    height: `${100 / 3}%`,
                    backgroundImage: `url(${meta.host}${frame.path}/512/${zoom}/${t.x}/${t.y}/${color}/1_1.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </div>

            {/* Location marker (outside the scaled layer so it stays sharp) */}
            <div
              className="absolute text-white pointer-events-none"
              style={{ left: `${markerLeft}%`, top: `${markerTop}%`, transform: 'translate(-50%, -100%)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
            >
              <MapPin className="w-6 h-6 fill-red-500" />
            </div>

            {/* Attribution */}
            <div
              className="absolute bottom-0.5 right-1 text-slate-300/80 pointer-events-none"
              style={{ fontSize: '7px', textShadow: '0 1px 1px rgba(0,0,0,0.9)' }}
            >
              © OpenStreetMap contributors
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
