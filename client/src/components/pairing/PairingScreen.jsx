import React, { useState, useEffect } from 'react';
import { Monitor, Link, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function PairingScreen({ onPaired }) {
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [touchCapable, setTouchCapable] = useState(false);
  const [loading, setLoading] = useState(true);

  const getDeviceToken = () => {
    let token = localStorage.getItem('family_dashboard_device_token');
    if (!token) {
      token = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('family_dashboard_device_token', token);
    }
    return token;
  };

  const fetchPairingCode = async () => {
    setLoading(true);
    try {
      const token = getDeviceToken();
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setTouchCapable(isTouch);

      const res = await fetch('/api/displays/pair/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_token: token,
          touch_capable: isTouch,
          screen_res: `${window.screen.width}x${window.screen.height}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.paired) {
          if (onPaired) onPaired(data.display);
        } else {
          setCode(data.code);
          setExpiresAt(data.expires_at);
        }
      }
    } catch (err) {
      console.error('Pairing code fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairingCode();
    const interval = setInterval(fetchPairingCode, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Link className="w-8 h-8 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Link This Display</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter this 4-digit code in your Family Dashboard under <strong>Displays & Loops</strong> to assign screens or loops.
          </p>
        </div>

        <div className="bg-slate-950 border-2 border-dashed border-cyan-500/40 rounded-2xl px-8 py-5 w-full flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pairing Code</span>
          <div className="text-5xl font-black font-mono tracking-widest text-cyan-400 py-1">
            {loading ? '••••' : code}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-4 py-2 rounded-xl w-full justify-between">
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-slate-300" />
            <span>{window.screen.width} × {window.screen.height}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${touchCapable ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span className="font-semibold text-slate-200">
              {touchCapable ? 'Elo Touchscreen Detected' : 'Display-Only Wall Unit'}
            </span>
          </div>
        </div>

        <button
          onClick={fetchPairingCode}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Code
        </button>
      </div>
    </div>
  );
}
