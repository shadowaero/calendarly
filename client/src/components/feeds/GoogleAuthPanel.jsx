import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertTriangle, ExternalLink, Unlink } from 'lucide-react';
import GoogleConfigForm from './google/GoogleConfigForm';
import CalendarListToggle from './google/CalendarListToggle';

export default function GoogleAuthPanel({ onUpdated }) {
  const [status, setStatus] = useState({ configured: false, connected: false, email: null, clientId: '' });
  const [calendars, setCalendars] = useState([]);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStatusAndCalendars = async () => {
    try {
      const res = await fetch('/api/google/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.clientId) setClientId(data.clientId);
        if (data.connected) fetchCalendars();
      }
    } catch (e) {}
  };

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/google/calendars');
      if (res.ok) setCalendars(await res.json());
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndCalendars();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/google/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret })
      });
      if (res.ok) {
        setShowConfig(false);
        fetchStatusAndCalendars();
      }
    } catch (err) {
      setErrorMsg('Failed saving keys');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/google/auth-url');
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.error) setErrorMsg(data.error);
    } catch (err) {
      setErrorMsg('Failed initiating OAuth');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google account?')) return;
    await fetch('/api/google/disconnect', { method: 'POST' });
    fetchStatusAndCalendars();
    if (onUpdated) onUpdated();
  };

  const handleToggleCalendar = async (cal) => {
    if (cal.subscribed) {
      await fetch('/api/google/calendars/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_calendar_id: cal.id })
      });
    } else {
      await fetch('/api/google/calendars/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_calendar_id: cal.id,
          summary: cal.summary,
          color: cal.backgroundColor || '#4285F4'
        })
      });
    }
    fetchCalendars();
    if (onUpdated) onUpdated();
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">Google Calendar Sync</span>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
        >
          <Key className="w-3.5 h-3.5" /> {status.configured ? 'API Keys' : 'Setup API Keys'}
        </button>
      </div>

      {errorMsg && <div className="text-xs p-2 rounded bg-rose-950/60 text-rose-300">{errorMsg}</div>}

      {showConfig && (
        <GoogleConfigForm
          clientId={clientId}
          setClientId={setClientId}
          clientSecret={clientSecret}
          setClientSecret={setClientSecret}
          onSubmit={handleSaveConfig}
          onCancel={() => setShowConfig(false)}
          loading={loading}
        />
      )}

      <div className="flex items-center justify-between pt-0.5">
        {status.connected ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[200px]">{status.email || 'Connected'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Not connected</span>
          </div>
        )}

        {status.connected ? (
          <button onClick={handleDisconnect} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-950/40 rounded flex items-center gap-1">
            <Unlink className="w-3 h-3" /> Disconnect
          </button>
        ) : (
          <button onClick={handleConnect} disabled={!status.configured} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded flex items-center gap-1 disabled:opacity-40">
            <ExternalLink className="w-3 h-3" /> Connect Account
          </button>
        )}
      </div>

      {status.connected && (
        <CalendarListToggle
          calendars={calendars}
          onToggle={handleToggleCalendar}
          onRefresh={fetchCalendars}
          loading={loading}
        />
      )}
    </div>
  );
}
