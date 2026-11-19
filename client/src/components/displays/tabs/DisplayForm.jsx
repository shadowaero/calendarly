import React, { useState } from 'react';

export function DisplayForm({ onSave, editingDisplay, cancelEdit, screens, loops }) {
  const [name, setName] = useState(editingDisplay?.name || '');
  const [slug, setSlug] = useState(editingDisplay?.slug || '');
  const [assignedType, setAssignedType] = useState(editingDisplay?.assigned_type || 'screen');
  const [assignedId, setAssignedId] = useState(editingDisplay?.assigned_id || screens[0]?.id || '');
  const [clientMode, setClientMode] = useState(editingDisplay?.client_mode || 'display');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug) return;
    await onSave({
      id: editingDisplay?.id,
      name,
      slug,
      assigned_type: assignedType,
      assigned_id: Number(assignedId),
      client_mode: clientMode
    });
    cancelEdit();
  };

  return (
    <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
        {editingDisplay ? `Edit: ${editingDisplay.name}` : 'Register Hardware Display'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Display Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Raspberry Pi 4 Touch"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Slug / Endpoint Token</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. pi4-touch"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs font-mono"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Source</label>
            <select
              value={assignedType}
              onChange={(e) => setAssignedType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            >
              <option value="screen">Screen</option>
              <option value="loop">Loop</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Target</label>
            <select
              value={assignedId}
              onChange={(e) => setAssignedId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            >
              {assignedType === 'screen' ? (
                screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
              ) : (
                loops.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
              )}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">Interaction Mode</label>
          <select
            value={clientMode}
            onChange={(e) => setClientMode(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
          >
            <option value="display">Display Only (Wall)</option>
            <option value="touch">Interactive Touch</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          {editingDisplay && (
            <button type="button" onClick={cancelEdit} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs">
              Cancel
            </button>
          )}
          <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-white rounded text-xs font-bold shadow">
            {editingDisplay ? 'Save' : '+ Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
