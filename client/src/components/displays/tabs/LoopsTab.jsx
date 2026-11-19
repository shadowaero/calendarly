import React, { useState } from 'react';
import { Repeat, Edit2, Trash2 } from 'lucide-react';

export default function LoopsTab({ loops, screens, onSave, onDelete, editingLoop, setEditingLoop }) {
  const [name, setName] = useState(editingLoop?.name || '');
  const [interval, setInterval] = useState(editingLoop?.interval_seconds || 30);
  const [selectedScreens, setSelectedScreens] = useState(editingLoop?.screen_ids || []);

  const cancelEdit = () => {
    setEditingLoop(null);
    setName('');
    setInterval(30);
    setSelectedScreens([]);
  };

  const toggleScreenInLoop = (id) => {
    if (selectedScreens.includes(id)) {
      setSelectedScreens(selectedScreens.filter(x => x !== id));
    } else {
      setSelectedScreens([...selectedScreens, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({
      id: editingLoop?.id,
      name,
      interval_seconds: Number(interval),
      screen_ids: selectedScreens,
      pause_on_touch: 1
    });
    cancelEdit();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          {editingLoop ? `Edit: ${editingLoop.name}` : 'Create Screen Loop'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Loop Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Day Rotation Playlist"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Interval (Seconds)</label>
            <input
              type="number"
              min="5"
              step="5"
              required
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Screens in Loop ({selectedScreens.length})</label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {screens.map(s => {
                const isChecked = selectedScreens.includes(s.id);
                return (
                  <label key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs cursor-pointer">
                    <span className="text-white font-medium truncate">{s.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleScreenInLoop(s.id)}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-900"
                    />
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {editingLoop && (
              <button type="button" onClick={cancelEdit} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs">
                Cancel
              </button>
            )}
            <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold shadow">
              {editingLoop ? 'Save Loop' : '+ Create Loop'}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-8 space-y-3">
        {loops.map((loop) => (
          <div key={loop.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-white">{loop.name}</h4>
                <span className="text-xs text-purple-300 font-semibold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                  Every {loop.interval_seconds}s
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setEditingLoop(loop); setName(loop.name); setInterval(loop.interval_seconds); setSelectedScreens(loop.screen_ids || []); }} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(loop.id)} className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Screens in Loop: {loop.screen_ids?.map(id => screens.find(s => s.id === id)?.name).filter(Boolean).join(' ➔ ') || 'No screens selected'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
