import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function EditFeedModal({ isOpen, feed, onSave, onClose }) {
  if (!isOpen || !feed) return null;

  const [name, setName] = useState(feed.name || '');
  const [url, setUrl] = useState(feed.url || '');
  const [color, setColor] = useState(feed.color || '#3B82F6');
  const [enabled, setEnabled] = useState(feed.enabled !== 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetColors = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444', '#4285F4', '#06B6D4'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onSave(feed.id, {
      name,
      url: feed.feed_type === 'google' ? feed.url : url,
      color,
      enabled
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-5 text-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Edit Feed Settings</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Feed Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          {feed.feed_type !== 'google' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">iCal URL</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Color Tag</label>
            <div className="flex items-center gap-2">
              {presetColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800"
            />
            <span className="text-xs font-semibold text-slate-300">Feed Enabled in Calendar</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
