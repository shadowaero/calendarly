import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';

export default function CreateEventModal({ isOpen, onClose, onCreated, initialDate, editEvent }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState('Family');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);

  // Edit mode: prefill from editEvent when opening; reset to "add" defaults on close.
  React.useEffect(() => {
    if (isOpen) {
      if (editEvent && editEvent.id != null) {
        const T = editEvent.start_time ? new Date(editEvent.start_time) : null;
        setTitle(editEvent.title || '');
        setStartDate(editEvent.all_day ? (editEvent.start_time || '').slice(0, 10) : T ? format(T, 'yyyy-MM-dd') : ((editEvent.start_time || '').slice(0, 10) || initialDate));
        setStartTime(T && !editEvent.all_day ? format(T, 'HH:mm') : '09:00');
        setAllDay(!!editEvent.all_day);
        setCategory(editEvent.category || 'Family');
        setColor(editEvent.color || '#3B82F6');
      }
    } else {
      setTitle('');
      setAllDay(false);
      setCategory('Family');
      setColor('#3B82F6');
      setStartDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
    }
  }, [isOpen]);

  const editing = !!(editEvent && editEvent.id != null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    // All-day keeps the plain date strings; timed events get timezone-safe ISO
    // instants (built from an explicit local wall-clock string, so the shown time
    // is the time that gets stored regardless of the machine's timezone).
    const startIso = allDay ? `${startDate}T00:00:00.000Z` : new Date(`${startDate}T${startTime}:00`).toISOString();
    const endIso = allDay ? `${startDate}T23:59:59.000Z` : new Date(`${startDate}T${startTime}:00`).toISOString();

    try {
      const res = await fetch(editing ? `/api/events/${editEvent.id}` : '/api/events', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          start_time: startIso,
          end_time: endIso,
          all_day: allDay ? 1 : 0,
          color,
          category
        })
      });
      if (res.ok) {
        onCreated();
        onClose();
        setTitle('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const presetColors = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444'];
  const categories = ['Family', 'School', 'Doctor', 'Sports', 'Birthday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative flex flex-col gap-4 text-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" /> {editing ? 'Edit Family Event' : 'Add Family Event'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Soccer Practice"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
              />
            </div>
            {!allDay && (
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="w-4 h-4 rounded text-blue-600 bg-slate-800" />
            <span className="text-xs font-semibold text-slate-300">All-day event</span>
          </label>
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${category === cat ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Color</label>
            <div className="flex items-center gap-2">
              {presetColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${color === c ? 'ring-2 ring-white scale-110' : 'opacity-80'}`}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
