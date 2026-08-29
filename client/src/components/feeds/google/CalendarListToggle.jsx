import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function CalendarListToggle({ calendars, onToggle, onRefresh, loading }) {
  return (
    <div className="mt-1 pt-2 border-t border-slate-700/60 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
        <span>Calendars ({calendars.length})</span>
        <button onClick={onRefresh} className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
        {calendars.map((cal) => (
          <div key={cal.id} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cal.backgroundColor || '#4285F4' }} />
              <span className="font-medium text-white truncate">{cal.summary}</span>
            </div>
            <button
              onClick={() => onToggle(cal)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${cal.subscribed ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
            >
              {cal.subscribed ? 'Subscribed' : '+ Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
