import React from 'react';
import { resolveFontSizePt, fontSizeStyle } from '../screens/fonts';
import { CheckCircle2, Circle, Sparkles, Edit2, Trash2 } from 'lucide-react';

export default function ChoreList({ chores, members, onToggleChore, onEditChore, onDeleteChore, clientMode, fontSize, embedded }) {
  const pt = resolveFontSizePt(fontSize, 11);
  return (
    <div className={embedded ? "h-full w-full flex flex-col overflow-hidden p-3" : "lg:col-span-7 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-hidden"}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-extrabold text-white flex items-center gap-2" style={fontSizeStyle(pt, 1.4)}>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Chore Tracker
        </h2>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300">
          {chores.filter(c => c.completedToday).length} / {chores.length} Done
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {chores.map((chore) => {
          const isDone = chore.completedToday;
          return (
            <div
              key={chore.id}
              onClick={() => clientMode !== 'display' && onToggleChore(chore.id, chore.member_id || members[0]?.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition ${
                isDone ? 'bg-emerald-950/20 border-emerald-800/50 opacity-70' : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <button type="button" className="text-emerald-400 shrink-0">
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 text-slate-400" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span>{chore.icon}</span>
                    <h4 className={`font-bold text-white truncate ${isDone ? 'line-through text-slate-400' : ''}`} style={fontSizeStyle(pt)}>
                      {chore.title}
                    </h4>
                  </div>
                  <div className="text-slate-400 mt-0.5 flex items-center gap-1" style={fontSizeStyle(pt, 0.8)}>
                    <span className="capitalize">{chore.frequency}</span>
                    {chore.member_name && <span className="text-indigo-400"> • {chore.member_avatar} {chore.member_name}</span>}
                    {chore.description && <span className="text-slate-500 truncate hidden sm:inline"> • {chore.description}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg text-amber-400 font-black text-xs">
                  <Sparkles className="w-3 h-3" /> +{chore.points}
                </div>

                {clientMode !== 'display' && onEditChore && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditChore(chore); }}
                    className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-700/60 transition"
                    title="Edit Chore"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {clientMode !== 'display' && onDeleteChore && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChore(chore.id); }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/40 transition"
                    title="Delete Chore"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

