import React, { useState } from 'react';
import EditableCanvas from './EditableCanvas';
import { ScreenSidebarControls } from './ScreenSidebarControls';
import { LayoutTemplate, Sparkles, Send } from 'lucide-react';

export default function ScreenEditor({
  screenForm,
  setScreenForm,
  onSave,
  onSaveAndPush,
  onCancel,
  addBlock,
  removeBlock,
  updateBlockGeometry,
  updateBlockConfig,
  onOpenTemplates,
  onOpenAIDesigner,
  events,
  feeds,
  members,
  chores,
  rewards,
  onToggleChore,
  onEditChore,
  onDeleteChore,
  onRedeemReward,
  onEditReward,
  onDeleteReward,
  clientMode
}) {
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(0);

  // Auto-clamp if blocks list changes
  const blocksCount = (screenForm?.blocks || []).length;
  const safeSelectedIdx = (selectedBlockIdx >= 0 && selectedBlockIdx < blocksCount) ? selectedBlockIdx : 0;


  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 gap-2.5">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={screenForm.name}
            onChange={(e) => setScreenForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Screen Name"
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
          />
          {onOpenTemplates && (
            <button
              type="button"
              onClick={onOpenTemplates}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition"
            >
              <LayoutTemplate className="w-3.5 h-3.5" /> Presets
            </button>
          )}
          {onOpenAIDesigner && (
            <button
              type="button"
              onClick={onOpenAIDesigner}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-purple-600/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Magic
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onCancel} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition">Cancel</button>
          <button type="button" onClick={onSave} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition">Save Draft</button>
          <button
            type="button"
            onClick={onSaveAndPush || onSave}
            className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition"
            title="Save changes and immediately broadcast live to all paired displays"
          >
            <Send className="w-3.5 h-3.5 text-emerald-200" /> Save & Push Live
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-2.5 overflow-hidden">
        <ScreenSidebarControls
          screenForm={screenForm}
          setScreenForm={setScreenForm}
          addBlock={addBlock}
          removeBlock={removeBlock}
          updateBlockGeometry={updateBlockGeometry}
          updateBlockConfig={updateBlockConfig}
          selectedBlockIdx={safeSelectedIdx}
          setSelectedBlockIdx={setSelectedBlockIdx}
        />

        <div
          className="flex-1 rounded-2xl overflow-hidden border border-slate-800 transition-all"
          style={{ background: '#070a12' }}
        >
          <EditableCanvas
            blocks={screenForm.blocks}
            orientation={screenForm.orientation}
            backgroundType={screenForm.background_type || 'color'}
            backgroundValue={screenForm.background_value || '#090D16'}
            selectedBlockIdx={safeSelectedIdx}
            onSelectBlock={setSelectedBlockIdx}
            onUpdateBlock={updateBlockGeometry}
            events={events}
            feeds={feeds}
            members={members}
            chores={chores}
            rewards={rewards}
            onToggleChore={onToggleChore}
            onEditChore={onEditChore}
            onDeleteChore={onDeleteChore}
            onRedeemReward={onRedeemReward}
            onEditReward={onEditReward}
            onDeleteReward={onDeleteReward}
            clientMode={clientMode}
          />
        </div>
      </div>
    </div>
  );
}

