import React, { useRef } from 'react';
import { Plus, Trash2, Edit2, Upload, LayoutTemplate, Sparkles, Send, Check } from 'lucide-react';

export default function ScreensSidebar({
  screens,
  selectedScreen,
  displays = [],
  loops = [],
  onSelect,
  onStartNew,
  onOpenTemplates,
  onOpenAIDesigner,
  onEditSelected,
  onDeleteScreen,
  onImport,
  onPushScreen
}) {
  const [pushedId, setPushedId] = React.useState(null);

  const handlePush = async (screenId) => {
    if (onPushScreen) {
      setPushedId(screenId);
      await onPushScreen(screenId);
      setTimeout(() => setPushedId(null), 1500);
    }
  };
  const fileRef = useRef(null);

  return (
    <div className="w-64 border-r border-slate-800 bg-slate-900/80 flex flex-col p-3 shrink-0 gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white">Screens Studio</h2>
            <p className="text-[10px] text-slate-400">DAKboard layout builder</p>
          </div>
          <button onClick={onStartNew} className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow">
            <Plus className="w-3.5 h-3.5" /> Blank
          </button>
        </div>

        <button
          onClick={onOpenAIDesigner}
          className="w-full px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-200" /> AI Screen Designer
        </button>

        <button
          onClick={onOpenTemplates}
          className="w-full px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <LayoutTemplate className="w-3.5 h-3.5" /> Screen Presets
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" /> Import .dakexport
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".dakexport,.json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (file && onImport) onImport(file);
            e.target.value = '';
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {screens.map((screen) => (
          <div
            key={screen.id}
            onClick={() => onSelect(screen.id)}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
              selectedScreen?.id === screen.id ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/30' : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white truncate min-w-0">{screen.name}</h4>
              <span className="text-[9px] px-1 rounded bg-slate-900 text-slate-400 uppercase shrink-0">
                {screen.blocks?.length || 0} blocks
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedScreen && (
        <div className="border-t border-slate-800 pt-2 flex flex-col gap-1.5">
          <button
            onClick={() => handlePush(selectedScreen.id)}
            className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition active:scale-95 ${
              pushedId === selectedScreen.id
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Broadcast screen layout live to all assigned displays"
          >
            {pushedId === selectedScreen.id ? (
              <>
                <Check className="w-3.5 h-3.5 text-white animate-bounce" /> Synced to Displays!
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-emerald-200" /> Push to Displays
              </>
            )}
          </button>

          <div className="flex gap-1.5">
            <button onClick={onEditSelected} className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1">
              <Edit2 className="w-3 h-3" /> Customize
            </button>
            <button onClick={() => onDeleteScreen(selectedScreen.id)} className="p-1.5 text-rose-400 hover:text-rose-300 border border-slate-700 hover:bg-rose-950/30 rounded-lg">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

