import React, { useState } from 'react';
import { X, Link, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function PairDeviceModal({ isOpen, onClose, screens, loops, onPaired }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [assignedType, setAssignedType] = useState('screen');
  const [assignedId, setAssignedId] = useState(screens[0]?.id || 1);
  const [devicePreview, setDevicePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCodeChange = async (val) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 4);
    setCode(clean);
    setErrorMsg('');

    if (clean.length === 4) {
      try {
        const res = await fetch(`/api/displays/pair/lookup/${clean}`);
        if (res.ok) {
          const data = await res.json();
          setDevicePreview(data);
          setName(data.touch_capable ? 'Touch Command Center (Pi 4)' : 'Wall Display (Pi 5)');
        } else {
          setErrorMsg('Code not found or expired.');
          setDevicePreview(null);
        }
      } catch (err) {
        setErrorMsg('Error looking up code');
      }
    } else {
      setDevicePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 4) return;
    setLoading(true);

    try {
      const res = await fetch('/api/displays/pair/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          assigned_type: assignedType,
          assigned_id: Number(assignedId),
          client_mode: devicePreview?.touch_capable ? 'touch' : 'display'
        })
      });

      if (res.ok) {
        if (onPaired) onPaired();
        onClose();
        setCode('');
        setDevicePreview(null);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed pairing device');
      }
    } catch (err) {
      setErrorMsg('Failed pairing device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Link className="w-5 h-5 text-cyan-400" /> Link Display Hardware
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-200">
          <p className="font-semibold text-cyan-300 mb-1">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
            <li>Open <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-400 font-mono">/pair</code> (or <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-400 font-mono">?mode=display</code>) on your client screen/Raspberry Pi browser.</li>
            <li>A <strong>4-digit code</strong> will be displayed on that client screen.</li>
            <li>Enter that 4-digit code into the box below to link and assign a screen/loop to it.</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Enter 4-Digit Code on Screen
            </label>
            <input
              type="text"
              required
              maxLength={4}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="e.g. 8429"
              className="w-full bg-slate-950 border-2 border-cyan-500/60 rounded-xl px-4 py-3 text-center text-3xl font-black font-mono tracking-widest text-cyan-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {errorMsg && (
            <div className="text-xs p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {devicePreview && (
            <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Device Discovered
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                  {devicePreview.touch_capable ? 'Touchscreen' : 'Passive Display'}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Display Label</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Source</label>
                  <select
                    value={assignedType}
                    onChange={(e) => setAssignedType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="screen">Screen</option>
                    <option value="loop">Loop</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Target</label>
                  <select
                    value={assignedId}
                    onChange={(e) => setAssignedId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    {assignedType === 'screen' ? (
                      screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                    ) : (
                      loops.map(l => <option key={l.id} value={l.id}>{l.name}</option>)
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !devicePreview}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold shadow"
            >
              {loading ? 'Pairing...' : 'Confirm & Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
