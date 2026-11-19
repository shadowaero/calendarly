import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';

export default function AddFeedForm({ onAddFeed }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetColors = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !url) return;
    setIsSubmitting(true);
    await onAddFeed({ name, url, color, feed_type: 'ical' });
    setName('');
    setUrl('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700/80 p-3 rounded-xl flex flex-col gap-2.5">
      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Add Generic iCal / WebCal Feed</h3>
      <input
        type="text"
        placeholder="Feed Name (e.g. School Schedule, Sports Team)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
      />
      <input
        type="url"
        placeholder="iCal URL (https://.../basic.ics)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
      />
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {presetColors.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition ${color === c ? 'ring-2 ring-white scale-110' : 'opacity-75'}`}
            >
              {color === c && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow"
        >
          <Plus className="w-3.5 h-3.5" /> {isSubmitting ? 'Adding...' : 'Add iCal'}
        </button>
      </div>
    </form>
  );
}
