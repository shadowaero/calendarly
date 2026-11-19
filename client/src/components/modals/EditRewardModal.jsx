import React, { useState } from 'react';
import { X, Gift } from 'lucide-react';

export function EditRewardModal({ isOpen, reward, onSave, onClose }) {
  if (!isOpen || !reward) return null;

  const [title, setTitle] = useState(reward.title || '');
  const [cost, setCost] = useState(reward.cost || 50);
  const [icon, setIcon] = useState(reward.icon || '🎁');
  const [description, setDescription] = useState(reward.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onSave(reward.id, {
      title: title.trim(),
      cost: Number(cost),
      icon,
      description: description.trim()
    });
    setIsSubmitting(false);
    onClose();
  };

  const icons = ['🎁', '🎮', '🍿', '🍕', '🍦', '💵', '🛹', '🎳', '🍩', '🎯', '🏖️', '🎬'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" /> Edit Reward Item
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Reward Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Cost (Points)</label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 1 hour of tablet gaming"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {icons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`text-lg p-1.5 rounded-lg border transition ${
                    icon === ic ? 'bg-purple-600/30 border-purple-500 scale-110' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
