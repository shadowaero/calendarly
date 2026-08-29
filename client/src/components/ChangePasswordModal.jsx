import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (next !== confirm) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Password updated successfully');
        setCurrent('');
        setNext('');
        setConfirm('');
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" /> Change Admin Password
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Current Password</label>
            <input
              type="password"
              required
              placeholder="Enter current password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">New Password</label>
            <input
              type="password"
              required
              placeholder="Enter new password (min 4 chars)"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {error && (
          <div className="text-xs p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300">
            {success}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 transition"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
}

