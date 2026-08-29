import React, { useState, useEffect } from 'react';
import { Sun, Droplets, Wind } from 'lucide-react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

export function ClockWeatherBlock({ config = {}, fontFamilyClass }) {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);

  const loc = config.location || config.zip || '32757';
  const units = config.weatherUnits === 'C' ? 'celsius' : 'fahrenheit';
  const unitSymbol = config.weatherUnits === 'C' ? '°C' : '°F';
  const pt = resolveFontSizePt(config.fontSize, 12);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadWeather = async () => {
      try {
        const query = loc ? `zip=${encodeURIComponent(loc)}` : 'lat=40.7128&lon=-74.0060';
        const res = await fetch(`/api/weather?${query}&units=${units}&days=1`);
        if (res.ok) {
          const d = await res.json();
          if (mounted) setWeather(d);
        }
      } catch (e) {}
    };
    loadWeather();
    const t = setInterval(loadWeather, 15 * 60 * 1000);
    return () => { mounted = false; clearInterval(t); };
  }, [loc, units]);

  return (
    <div className={`h-full w-full p-4 flex flex-col justify-between text-white ${fontFamilyClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider truncate mr-2" style={fontSizeStyle(pt, 0.7)}>
          <Sun className="w-4 h-4 shrink-0" />
          <span className="truncate">{config.location || 'Local Weather'}</span>
        </div>
        <div className="font-black text-white shrink-0" style={fontSizeStyle(pt, 1.8)}>
          {weather ? `${weather.current.temp}${unitSymbol}` : '72°F'}{' '}
          <span className="text-slate-400 font-normal" style={fontSizeStyle(pt, 0.8)}>
            {weather?.current?.condition?.label || 'Sunny'}
          </span>
        </div>
      </div>

      <div className="my-auto text-center py-2">
        <div className="font-black font-mono tracking-tight text-white" style={fontSizeStyle(pt, 3)}>
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: config.showSeconds ? '2-digit' : undefined, hour12: !config.format24 })}
        </div>
        <div className="font-semibold text-slate-400 mt-1 uppercase tracking-widest" style={fontSizeStyle(pt, 0.8)}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between" style={fontSizeStyle(pt, 0.7)}>
        <span className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-cyan-400" /> Humidity: {weather?.current?.humidity ?? 45}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="w-3 h-3 text-sky-400" /> Wind: {weather?.current?.wind ?? 5} mph
        </span>
      </div>
    </div>
  );
}
