import React, { useState } from 'react';
import { X, Layout, Monitor, Repeat, Clock, Calendar, CalendarDays, Users, Boxes, Check } from 'lucide-react';

const GROUP_DEFS = [
  { key: 'screens', label: 'Screens', icon: Layout },
  { key: 'displays', label: 'Displays', icon: Monitor },
  { key: 'loops', label: 'Loops', icon: Repeat },
  { key: 'schedules', label: 'Schedules', icon: Clock },
  { key: 'calendar', label: 'Calendar Feeds & Google', icon: Calendar },
  { key: 'events', label: 'Local Events', icon: CalendarDays },
  { key: 'family', label: 'Family (Members, Chores, Rewards)', icon: Users }
];

function summarize(backup) {
  const data = (backup && backup.data) || {};
  const count = (t) => (Array.isArray(data[t]) ? data[t].length : 0);
  const names = (t, k = 'name') => (Array.isArray(data[t]) ? data[t].map(r => r[k]).filter(Boolean) : []);
  return {
    exported_at: backup && backup.exported_at,
    screens: names('screens'),
    calendar_feeds: names('calendar_feeds'),
    members: names('members'),
    displays: names('displays'),
    loops: names('loops'),
    chores: names('chores', 'title'),
    rewards: names('rewards', 'title'),
    counts: {
      screens: count('screens'),
      displays: count('displays'),
      loops: count('loops'),
      schedules: count('schedules'),
      calendar_feeds: count('calendar_feeds'),
      events: count('events'),
      members: count('members'),
      chores: count('chores'),
      rewards: count('rewards')
    }
  };
}

export default function RestorePreviewModal({ isOpen, backup, onClose, onConfirm, busy }) {
  const [selected, setSelected] = useState(['all']);
  if (!isOpen || !backup) return null;

  const s = summarize(backup);
  const isAll = selected.includes('all');
  const toggleAll = () => setSelected(isAll ? [] : ['all']);
  const toggleGroup = (key) => {
    if (isAll) setSelected([key]);
    else if (selected.includes(key)) setSelected(selected.filter(k => k !== key));
    else setSelected([...selected, key]);
  };
  const renderNames = (arr) => {
    if (!arr || arr.length === 0) return <span className="text-slate-600">—</span>;
    const shown = arr.slice(0, 5).join(', ');
    const extra = arr.length > 5 ? ` +${arr.length - 5} more` : '';
    return <span className="text-slate-300">{shown}{extra}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" /> Review Backup Before Restore
            </h3>
            {s.exported_at && <p className="text-xs text-slate-400 mt-0.5">Backup created: {new Date(s.exported_at).toLocaleString()}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">This backup contains</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div><span className="text-slate-500">Screens ({s.counts.screens}):</span> {renderNames(s.screens)}</div>
              <div><span className="text-slate-500">Calendar feeds ({s.counts.calendar_feeds}):</span> {renderNames(s.calendar_feeds)}</div>
              <div><span className="text-slate-500">Members ({s.counts.members}):</span> {renderNames(s.members)}</div>
              <div><span className="text-slate-500">Displays ({s.counts.displays}):</span> {renderNames(s.displays)}</div>
              <div><span className="text-slate-500">Loops ({s.counts.loops}):</span> {renderNames(s.loops)}</div>
              <div><span className="text-slate-500">Chores ({s.counts.chores}):</span> {renderNames(s.chores)}</div>
              <div><span className="text-slate-500">Rewards ({s.counts.rewards}):</span> {renderNames(s.rewards)}</div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">What to restore</h4>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-700 bg-slate-900/60 cursor-pointer mb-1.5">
              <input type="checkbox" checked={isAll} onChange={toggleAll} className="w-4 h-4 rounded text-emerald-600 bg-slate-800" />
              <span className="text-xs font-bold text-white">Everything (full restore)</span>
            </label>
            <div className="space-y-1">
              {GROUP_DEFS.map((g) => {
                const checked = selected.includes(g.key);
                const Icon = g.icon;
                return (
                  <label key={g.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                    checked ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-slate-700/60 bg-slate-900/40'
                  }`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleGroup(g.key)} className="w-4 h-4 rounded text-emerald-600 bg-slate-800" />
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-200">{g.label}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-between items-center">
          <p className="text-[11px] text-slate-500 max-w-xs">Restoring replaces the selected sections with this backup's data.</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
            <button
              onClick={() => onConfirm(selected.length ? selected : ['all'])}
              disabled={busy || selected.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow"
            >
              {busy ? 'Restoring...' : 'Restore Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
