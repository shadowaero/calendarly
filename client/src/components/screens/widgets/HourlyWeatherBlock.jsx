import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Droplets } from 'lucide-react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

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
    let mounted = true;
    const load = async () => {
      try {
        const q = zip ? `zip=${encodeURIComponent(zip)}` : 'lat=40.7128&lon=-74.0060';
        const res = await fetch(`/api/weather?${q}&units=${units}&days=2`);
        if (res.ok) {
          const d = await res.json();
          if (mounted) { setData(d); setError(null); }
        } else if (mounted) {
          setError('Weather unavailable');
        }
      } catch (e) {
        if (mounted) setError('Weather unavailable');
      }
    };
    load();
    const t = setInterval(load, 15 * 60 * 1000);
    return () => { mounted = false; clearInterval(t); };
  }, [zip, units]);

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden p-3 ${fontFamilyClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold uppercase tracking-wider text-slate-400 truncate mr-2" style={fontSizeStyle(pt, 0.7)}>{label}</span>
        {data && <span className="text-slate-500 shrink-0" style={fontSizeStyle(pt, 0.7)}>{data.units === 'C' ? 'Celsius' : 'Fahrenheit'}</span>}
      </div>

      {error && (
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
