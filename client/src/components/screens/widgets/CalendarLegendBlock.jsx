import React from 'react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

export function CalendarLegendBlock({ config = {}, feeds, fontFamilyClass }) {
  const activeFeeds = (feeds || []).filter(f => f.enabled !== 0 && f.name);
  const pt = resolveFontSizePt(config.fontSize, 10);

  const displayFeeds = activeFeeds.length > 0 ? activeFeeds : [
    { id: 'default_apple', name: 'Apple Family Calendar', color: '#8B5CF6' },
    { id: 'default_tech', name: 'Intro to Tech', color: '#10B981' },
    { id: 'default_peachjar', name: 'Focus and Peachjar Events', color: '#F59E0B' },
    { id: 'default_oliver', name: 'Oliver L&C', color: '#3B82F6' },
    { id: 'default_holidays', name: 'US Holidays', color: '#EF4444' }
  ];

  return (
    <div className={`h-full w-full flex flex-col justify-center p-2.5 overflow-hidden ${fontFamilyClass}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-start">
        <span className="font-black uppercase tracking-wider text-slate-400 shrink-0" style={fontSizeStyle(pt, 0.85)}>
          Calendar Feeds:
        </span>
        {displayFeeds.map((feed) => (
          <div key={feed.id} className="flex items-center gap-1.5 min-w-max">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: feed.color || '#3B82F6' }}
            />
            <span className="font-bold text-slate-200 truncate tracking-tight" style={fontSizeStyle(pt)}>
              {feed.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
