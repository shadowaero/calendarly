import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Droplets } from 'lucide-react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';
import { fetchJSON, reportHealth } from './healthKit';

// Dedicated hour-by-hour weather forecast widget.
export function HourlyWeatherBlock({ config = {}, fontFamilyClass }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const zip = config.zip || config.location || '';
  const units = config.units === 'C' ? 'celsius' : 'fahrenheit';
  const unitSymbol = config.units === 'C' ? '°C' : '°F';
  const hours = Math.min(Math.max(Number(config.hours) || 12, 3), 24);
  const label = config.label || (zip ? `${zip} Hourly` : 'Hourly Forecast');
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
        const q = zip ? `zip=${encodeURIComponent(zip)}` : 'lat=40.7128&lon=-74.0060';
        const d = await fetchJSON(`/api/weather?${q}&units=${units}&days=2`);
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
  }, [zip, units]);

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
        <div className="flex-1 flex items-center justify-center text-slate-500" style={fontSizeStyle(pt)}>Loading forecast…</div>
      )}

      {data && (
        <div className="flex-1 flex flex-wrap content-start gap-1.5 overflow-y-auto pr-1">
          {data.hourly.slice(0, hours).map((h, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-lg bg-black/20 border border-slate-800/60 px-2 py-1.5 min-w-[3.2rem]"
            >
              <span className="text-slate-400" style={fontSizeStyle(pt, 0.65)}>
                {h.current ? 'Now' : format(parseISO(h.time), 'h a')}
              </span>
              <span className="leading-none my-1" style={fontSizeStyle(pt, 1.1)}>{h.condition.icon}</span>
              <span className="font-bold text-white" style={fontSizeStyle(pt, 0.85)}>{h.temp}{unitSymbol}</span>
              {h.precip != null && (
                <span className="flex items-center gap-0.5 text-cyan-300" style={fontSizeStyle(pt, 0.6)}>
                  <Droplets className="w-2.5 h-2.5" />{h.precip}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
