import React from 'react';
import { format, parseISO, isAfter } from 'date-fns';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

export function CalendarAgendaBlock({ config = {}, events, fontFamilyClass }) {
  const limit = config.limit || 7;
  const now = new Date();
  const pt = resolveFontSizePt(config.fontSize, 11);

  const upcoming = (events || [])
    .filter(ev => {
      try { return isAfter(parseISO(ev.start_time), now); } catch (e) { return false; }
    })
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, limit);

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden p-2 ${fontFamilyClass || ''}`}>
      <div className="font-bold uppercase tracking-wider text-slate-400 mb-1.5" style={fontSizeStyle(pt, 0.8)}>
        Upcoming
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {upcoming.length === 0 ? (
          <div className="text-slate-500" style={fontSizeStyle(pt)}>No upcoming events</div>
        ) : (
          upcoming.map((ev, idx) => {
            const d = parseISO(ev.start_time);
            return (
              <div
                key={ev.id || idx}
                className="flex items-start gap-2 p-1.5 rounded-lg"
                style={{ borderLeft: `3px solid ${ev.color || '#3B82F6'}`, background: 'rgba(0,0,0,0.25)' }}
              >
                <div className="shrink-0 text-center leading-tight">
                  <div className="font-black uppercase text-slate-300" style={fontSizeStyle(pt, 0.75)}>{format(d, 'MMM')}</div>
                  <div className="font-black text-white" style={fontSizeStyle(pt, 1.3)}>{format(d, 'd')}</div>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white truncate" style={fontSizeStyle(pt)}>{ev.title}</div>
                  <div className="text-slate-300" style={fontSizeStyle(pt, 0.8)}>
                    {ev.all_day ? 'All day' : format(d, 'h:mm a')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
