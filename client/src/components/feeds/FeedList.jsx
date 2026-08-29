import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function FeedList({ feeds, onEdit, onDelete }) {
  return (
    <div className="space-y-1.5">
      {feeds.map((feed) => (
        <div key={feed.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: feed.color }} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white truncate">{feed.name}</h4>
                <span className="text-[10px] px-1 py-0.2 uppercase rounded bg-slate-900 text-slate-400">
                  {feed.feed_type === 'google' ? 'Google' : 'iCal'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-sm">{feed.url || feed.google_calendar_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(feed)}
              className="p-1.5 text-blue-400 hover:text-blue-300 rounded hover:bg-slate-700"
              title="Edit Feed"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(feed.id)}
              className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40"
              title="Delete Feed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
