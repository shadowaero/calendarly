import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Droplets, Wind, Thermometer } from 'lucide-react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';
import { fetchJSON, reportHealth } from './healthKit';

export function WeatherForecastBlock({ config = {}, fontFamilyClass }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const lat = config.lat ?? null;
  const lon = config.lon ?? null;
  const zip = config.zip || config.location || '';
  const days = Number(config.days) || 4;
  const units = config.units === 'C' ? 'celsius' : 'fahrenheit';
  const unitSymbol = config.units === 'C' ? '°C' : '°F';
  const label = config.label || (zip ? `${zip} Weather` : 'Weather Forecast');
  const pt = resolveFontSizePt(config.fontSize, 12);

  useEffect(() => {
    // ws7bf: 8s fetch timeout + backoff retry + watchdog health report. On failure
    // the last good forecast stays on screen (stale beats blank) and we retry after
    // 30s/60s/120s instead of idling out the full 15-minute interval.
    let mounted = true;
    let hasData = false;
    let attempt = 0;
    let timer = null;
    const RETRY_MS = [30000, 60000, 120000, 15 * 60 * 1000];
    const load = async () => {
      try {
        let queryParams = `units=${units}&days=${days}`;
        if (lat != null && lon != null && lat !== '' && lon !== '') {
          queryParams += `&lat=${lat}&lon=${lon}`;
        } else if (zip) {
          queryParams += `&zip=${encodeURIComponent(zip)}`;
        } else {
          queryParams += `&lat=40.7128&lon=-74.0060`;
        }
        const d = await fetchJSON(`/api/weather?${queryParams}`);
        if (!mounted) return;
        hasData = true;
        setData(d);
        setError(null);
        attempt = 0;
        reportHealth('weather', true);
        timer = setTimeout(load, 15 * 60 * 1000);
      } catch (e) {
        if (!mounted) return;
        reportHealth('weather', false);
        if (!hasData) setError('Weather unavailable');
        attempt += 1;
        timer = setTimeout(load, RETRY_MS[Math.min(attempt - 1, RETRY_MS.length - 1)]);
      }
    };
    load();
    return () => { mounted = false; if (timer) clearTimeout(timer); };
  }, [lat, lon, zip, units, days]);

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden p-3 ${fontFamilyClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-slate-400 truncate mr-2" style={fontSizeStyle(pt, 0.7)}>{label}</span>
        <span className="flex items-center gap-2 shrink-0">
          {(error || data?.stale) && <span className="text-amber-400/80" style={fontSizeStyle(pt, 0.7)}>stale</span>}
          {data && <span className="text-slate-500" style={fontSizeStyle(pt, 0.7)}>{data.units === 'C' ? 'Celsius' : 'Fahrenheit'}</span>}
        </span>
      </div>

      {error && !data && (
        <div className="flex-1 flex items-center justify-center text-slate-500" style={fontSizeStyle(pt)}>{error}</div>
      )}

      {!error && !data && (
        <div className="flex-1 flex items-center justify-center text-slate-500" style={fontSizeStyle(pt)}>Loading weather…</div>
      )}

      {data && (
        <div className="flex-1 flex flex-col overflow-hidden gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <span style={fontSizeStyle(pt, 2)} className="leading-none">{data.current.condition.icon}</span>
            <div>
              <div className="font-black text-white leading-tight" style={fontSizeStyle(pt, 2)}>
                {data.current.temp}{unitSymbol}
              </div>
              <div className="text-slate-300" style={fontSizeStyle(pt, 0.8)}>{data.current.condition.label}</div>
            </div>
            <div className="ml-auto text-right text-slate-400 space-y-0.5" style={fontSizeStyle(pt, 0.7)}>
              <div className="flex items-center gap-1 justify-end">
                <Thermometer className="w-3 h-3" /> Feels {data.current.apparent}{unitSymbol}
              </div>
              {data.current.humidity != null && (
                <div className="flex items-center gap-1 justify-end">
                  <Droplets className="w-3 h-3" /> {data.current.humidity}%
                </div>
              )}
              {data.current.wind != null && (
                <div className="flex items-center gap-1 justify-end">
                  <Wind className="w-3 h-3" /> {data.current.wind} mph
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <div className="font-bold uppercase tracking-wider text-slate-400 mb-1" style={fontSizeStyle(pt, 0.7)}>Hourly</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.hourly.slice(0, 12).map((h, i) => (
                <div key={i} className="flex flex-col items-center shrink-0 w-12 rounded-lg bg-black/20 py-1.5">
                  <span className="text-slate-400" style={fontSizeStyle(pt, 0.6)}>{h.current ? 'Now' : format(parseISO(h.time), 'h a')}</span>
                  <span className="leading-none my-0.5" style={fontSizeStyle(pt, 1)}>{h.condition.icon}</span>
                  <span className="font-bold text-white" style={fontSizeStyle(pt, 0.8)}>{h.temp}{unitSymbol}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div className="font-bold uppercase tracking-wider text-slate-400 mb-1" style={fontSizeStyle(pt, 0.7)}>{data.daily.length}-Day Forecast</div>
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
              {data.daily.map((d, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-slate-800/50 last:border-0">
                  <span className="w-12 font-bold text-slate-300 shrink-0" style={fontSizeStyle(pt, 0.8)}>
                    {i === 0 ? 'Today' : format(parseISO(d.date), 'EEE')}
                  </span>
                  <span className="shrink-0" style={fontSizeStyle(pt, 1)}>{d.condition.icon}</span>
                  <span className="flex-1 text-slate-400 truncate" style={fontSizeStyle(pt, 0.8)}>{d.condition.label}</span>
                  <span className="font-bold text-white shrink-0" style={fontSizeStyle(pt, 0.8)}>
                    {d.max}{unitSymbol} <span className="text-slate-500 font-normal">/ {d.min}{unitSymbol}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
