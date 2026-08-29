import React from 'react';
import { X, Clock, Calendar, MapPin, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function DayOverflowModal({ isOpen, onClose, date, events, onDeleteEvent }) {
  if (!isOpen || !date) return null;

  const dateHeading = format(date, 'EEEE, MMMM d, yyyy');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              {dateHeading}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {events.length} {events.length === 1 ? 'event scheduled' : 'events scheduled'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">
              No events scheduled for this date.
            </div>
          ) : (
            events.map((ev) => {
              const start = parseISO(ev.start_time);
              const timeDisplay = ev.all_day 
                ? 'All Day' 
                : format(start, 'h:mm a');

              return (
                <div
                  key={ev.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-slate-850 bg-slate-800/80 hover:bg-slate-800 transition shadow-sm"
                  style={{ borderLeftColor: ev.color || '#3B82F6', borderLeftWidth: '5px' }}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300">
                        {ev.category || 'Family'}
                      </span>
                      <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeDisplay}
                      </span>
                      {ev.source === 'ical' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                          iCal
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white truncate">
                      {ev.title}
                    </h3>

                    {ev.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  {/* Delete button (only for local touch events) */}
                  {ev.source === 'local' && onDeleteEvent && (
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition shrink-0"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
