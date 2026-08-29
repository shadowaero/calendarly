import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Droplets, Wind, Thermometer } from 'lucide-react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

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
    let mounted = true;
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
        const res = await fetch(`/api/weather?${queryParams}`);
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
  }, [lat, lon, zip, units, days]);

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
