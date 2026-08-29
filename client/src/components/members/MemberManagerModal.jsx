import React, { useState } from 'react';
import { X, Trash2, Edit2, Check } from 'lucide-react';

export default function MemberManagerModal({ isOpen, onClose, members, onCreated, onUpdated, onDeleted }) {
  const [editingMember, setEditingMember] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧒');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const presetAvatars = ['👦', '👧', '🧒', '👶', '👨', '👩', '🧑', '🐶', '🐱', '⭐', '🚀', '👑'];
  const presetColors = ['#3B82F6', '#EC4899', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#6366F1'];

  const startEdit = (m) => {
    setEditingMember(m);
    setName(m.name);
    setAvatar(m.avatar);
    setColor(m.color);
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setName('');
    setAvatar('🧒');
    setColor('#3B82F6');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      if (editingMember) {
        await fetch(`/api/members/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), avatar, color })
        });
        if (onUpdated) onUpdated();
      } else {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), avatar, color })
        });
        if (onCreated) onCreated();
      }
      cancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName}?`)) return;
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (onDeleted) onDeleted();
      if (editingMember?.id === id) cancelEdit();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-5 text-slate-100 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            👨‍👩‍👧‍👦 Family Members Management
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700/80 p-3.5 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {editingMember ? `Editing: ${editingMember.name}` : 'Add Family Member'}
              </h4>
              {editingMember && (
                <button type="button" onClick={cancelEdit} className="text-xs text-slate-400 hover:text-white">
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Avatar</label>
              <div className="flex flex-wrap gap-1.5">
                {presetAvatars.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`text-base p-1.5 rounded-lg border transition ${
                      avatar === av ? 'bg-blue-600/30 border-blue-500 scale-110' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Color Badge</label>
              <div className="flex items-center gap-1.5">
                {presetColors.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                      color === c ? 'ring-2 ring-white scale-110' : 'opacity-80'
                    }`}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
              >
                {editingMember ? 'Update Member' : '+ Add Member'}
              </button>
            </div>
          </form>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Existing Members ({members.length})
            </h4>
            <div className="space-y-1.5">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-xl">{m.avatar}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">{m.name}</h4>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      </div>
                      <p className="text-[11px] text-amber-400 font-semibold">{m.weeklyPoints || 0} weekly points</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(m)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded"
                      title="Edit / Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

