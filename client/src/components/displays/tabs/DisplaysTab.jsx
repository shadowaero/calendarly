import React from 'react';
import { Monitor, Edit2, Trash2, ExternalLink, Unlink, RefreshCw, Send, Check } from 'lucide-react';
import { DisplayForm } from './DisplayForm';

export default function DisplaysTab({ displays, screens, loops, onSave, onDelete, onUnpair, onReloadDisplay, editingDisplay, setEditingDisplay }) {
  const [reloadingId, setReloadingId] = React.useState(null);

  const handleReload = async (display) => {
    setReloadingId(display.id);
    try {
      await fetch("/api/displays/reload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: display.slug, displayId: display.id })
      });
    } catch (e) {}
    setTimeout(() => setReloadingId(null), 1200);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <DisplayForm
        key={editingDisplay?.id || 'new'}
        onSave={onSave}
        editingDisplay={editingDisplay}
        cancelEdit={() => setEditingDisplay(null)}
        screens={screens}
        loops={loops}
      />

      <div className="lg:col-span-8 space-y-3">
        {displays.map((display) => {
          const endpointUrl = `${window.location.origin}/display/${display.slug}`;
          const assignedScreen = screens.find(s => s.id === display.assigned_id);
          const assignedLoop = loops.find(l => l.id === display.assigned_id);

          return (
            <div key={display.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{display.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {display.client_mode} mode
                      </span>
                      {display.device_token ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          ● Hardware Linked
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Unlinked token</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleReload(display)}
                    className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded flex items-center gap-1 text-xs font-semibold transition active:scale-95"
                    title="Force immediate refresh on this display"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reloadingId === display.id ? 'animate-spin text-emerald-300' : ''}`} />
                    {reloadingId === display.id ? 'Pushing...' : 'Sync'}
                  </button>
                  <a
                    href={endpointUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded flex items-center gap-1 text-xs font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Launch
                  </a>
                  {display.device_token && onUnpair && (
                    <button
                      onClick={() => onUnpair(display.id)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded"
                      title="Unpair Device Hardware"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setEditingDisplay(display)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(display.id)} className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Active Target:</span>
                <span className="text-white font-semibold">
                  {display.assigned_type === 'screen' ? `Screen: ${assignedScreen?.name || 'None'}` : `Loop: ${assignedLoop?.name || 'None'}`}
                </span>
              </div>

              <div className="bg-slate-950 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 flex items-center justify-between border border-slate-800">
                <span className="truncate select-all">{endpointUrl}</span>
                <span className="text-[10px] text-slate-500 uppercase">Direct Slug</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

