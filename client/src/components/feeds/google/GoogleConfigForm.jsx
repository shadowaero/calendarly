import React from 'react';

export default function GoogleConfigForm({ clientId, setClientId, clientSecret, setClientSecret, onSubmit, onCancel, loading }) {
  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col gap-2">
      <p className="text-[11px] text-slate-400">
        Redirect URI: <code className="text-blue-400 select-all font-mono text-[10px]">{window.location.origin}/api/google/callback</code>
      </p>
      <input
        type="text"
        placeholder="Google Client ID"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        required
        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
      />
      <input
        type="password"
        placeholder="Google Client Secret"
        value={clientSecret}
        onChange={(e) => setClientSecret(e.target.value)}
        required
        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded">Cancel</button>
        <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">Save</button>
      </div>
    </form>
  );
}
