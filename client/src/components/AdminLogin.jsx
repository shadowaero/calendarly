import React, { useState } from 'react';
import { Lock, LogIn, Keyboard } from 'lucide-react';
import { OnScreenKeyboard } from './OnScreenKeyboard';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState('username');
  const [kbVisible, setKbVisible] = useState(false);

  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  const doSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSubmit();
  };

  const handleKbKey = (key) => {
    const setter = activeField === 'password' ? setPassword : setUsername;
    if (key === 'BACKSPACE') {
      setter((prev) => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setter((prev) => prev + ' ');
    } else if (key === 'ENTER') {
      setKbVisible(false);
      doSubmit();
    } else {
      setter((prev) => prev + key);
    }
  };

  const focusField = (field) => {
    setActiveField(field);
    setKbVisible(true);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 p-4">
      <form onSubmit={handleSubmit} data-no-global-keyboard className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-black text-white">Admin Console</h1>
          <p className="text-xs text-slate-400">Sign in to manage settings</p>
          <button
            type="button"
            onClick={() => setKbVisible((v) => !v)}
            className="mt-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Keyboard className="w-4 h-4" />
            {kbVisible ? 'Hide Keyboard' : 'Show Keyboard'}
          </button>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onFocus={() => focusField('username')}
          onClick={() => focusField('username')}
          onChange={(e) => setUsername(e.target.value)}
          inputMode="none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className={`bg-slate-800 border rounded-lg px-3 py-2 text-white text-sm outline-none ${activeField === 'username' && kbVisible ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-slate-700'}`}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onFocus={() => focusField('password')}
          onClick={() => focusField('password')}
          onChange={(e) => setPassword(e.target.value)}
          inputMode="none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className={`bg-slate-800 border rounded-lg px-3 py-2 text-white text-sm outline-none ${activeField === 'password' && kbVisible ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-slate-700'}`}
        />

        {error && <div className="text-xs text-rose-400">{error}</div>}
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold disabled:opacity-50">
          <LogIn className="w-4 h-4" />
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {kbVisible && (
        <OnScreenKeyboard
          onKey={handleKbKey}
          onHide={() => setKbVisible(false)}
        />
      )}
    </div>
  );
}
