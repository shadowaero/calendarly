import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, RefreshCw, Database, HardDrive, AlertTriangle, CheckCircle2 } from 'lucide-react';
import RestorePreviewModal from './RestorePreviewModal';

export default function BackupManager({ onRefresh }) {
  const [autoBackups, setAutoBackups] = useState([]);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const restoreFileRef = useRef(null);

  const fetchAutoBackups = async () => {
    try {
      const res = await fetch('/api/backup/auto');
      if (res.ok) setAutoBackups(await res.json());
    } catch (e) {}
  };

  useEffect(() => { fetchAutoBackups(); }, []);

  const handleDownload = () => { window.location.href = '/api/backup'; };

  const handleBackupNow = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/backup/auto/now', { method: 'POST' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Automatic backup created.' });
        fetchAutoBackups();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Backup failed: ' + err.message });
    } finally { setBusy(false); }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      setMessage(null);
      setRestoreTarget({ backup, source: 'file', filename: file.name });
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid backup file: ' + err.message });
    }
  };

  const handleAutoRestoreClick = async (filename) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/backup/auto/${encodeURIComponent(filename)}`);
      if (res.ok) {
        const backup = await res.json();
        setRestoreTarget({ backup, source: 'auto', filename });
      } else {
        setMessage({ type: 'error', text: 'Could not load auto backup.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed: ' + err.message });
    } finally { setBusy(false); }
  };

  const confirmRestore = async (scope) => {
    if (!restoreTarget) return;
    setBusy(true);
    setMessage(null);
    try {
      let res;
      if (restoreTarget.source === 'auto') {
        res = await fetch(`/api/backup/auto/${encodeURIComponent(restoreTarget.filename)}/restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope })
        });
      } else {
        res = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backup: restoreTarget.backup, scope })
        });
      }
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Restore completed successfully.' });
        setRestoreTarget(null);
        if (onRefresh) onRefresh();
        fetchAutoBackups();
      } else {
        setMessage({ type: 'error', text: 'Restore failed: ' + (data.error || 'unknown') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Restore failed: ' + err.message });
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 p-6 overflow-hidden gap-5">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" /> Backup & Restore
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Download or restore a full snapshot — or selectively restore just screens, calendar feeds, members, etc.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6 content-start">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manual Backup</h3>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow"
          >
            <Download className="w-4 h-4" /> Download Full Backup
          </button>

          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Restore From File</span>
            <button
              onClick={() => restoreFileRef.current?.click()}
              disabled={busy}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow"
            >
              <Upload className="w-4 h-4" /> Choose Backup File to Restore
            </button>
            <input
              ref={restoreFileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) handleFileSelect(f);
                e.target.value = '';
              }}
            />
          </div>

          {message && (
            <div className={`text-xs p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'error' ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
            }`}>
              {message.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {message.text}
            </div>
          )}
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Automatic Backups (last 7 days)</h3>
            <button
              onClick={handleBackupNow}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} /> Back Up Now
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {autoBackups.length === 0 ? (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 py-4 justify-center">
                <HardDrive className="w-4 h-4" /> No automatic backups yet (daily at 3:00 AM)
              </div>
            ) : (
              autoBackups.map((b) => (
                <div key={b.filename} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white font-mono truncate">{b.filename}</div>
                    <div className="text-[10px] text-slate-400">{new Date(b.modified).toLocaleString()} · {Math.round(b.size / 1024)} KB</div>
                  </div>
                  <button
                    onClick={() => handleAutoRestoreClick(b.filename)}
                    disabled={busy}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shrink-0 disabled:opacity-50"
                  >
                    Review & Restore
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <RestorePreviewModal
        isOpen={Boolean(restoreTarget)}
        backup={restoreTarget?.backup}
        onClose={() => setRestoreTarget(null)}
        onConfirm={confirmRestore}
        busy={busy}
      />
    </div>
  );
}

