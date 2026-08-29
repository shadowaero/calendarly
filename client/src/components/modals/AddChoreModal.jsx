import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export function AddChoreModal({ isOpen, onClose, members, onCreated }) {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(10);
  const [memberId, setMemberId] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [icon, setIcon] = useState('⭐');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    await fetch('/api/chores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        points: Number(points),
        member_id: memberId ? Number(memberId) : null,
        frequency,
        icon
      })
    });
    onCreated();
    onClose();
    setTitle('');
  };

  const icons = ['⭐', '🛏️', '🪥', '🐕', '🧹', '🍽️', '🗑️', '📚'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> New Chore
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Chore Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean Bedroom"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Points</label>
              <input
                type="number"
                min="1"
                required
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Assign To</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
            >
              <option value="">Any Family Member</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(ic => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`text-lg p-1.5 rounded-lg border ${icon === ic ? 'bg-emerald-600/30 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">Create Chore</button>
          </div>
        </form>
      </div>
    </div>
  );
}
