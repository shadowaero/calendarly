import React, { useState } from 'react';
import { Monitor, Link } from 'lucide-react';
import DisplaysTab from './tabs/DisplaysTab';
import LoopsTab from './tabs/LoopsTab';
import PairDeviceModal from '../pairing/PairDeviceModal';

export default function DisplaysManager({
  displays,
  screens,
  loops,
  schedules,
  onSaveDisplay,
  onDeleteDisplay,
  onUnpairDisplay,
  onSaveLoop,
  onDeleteLoop,
  onRefresh
}) {
  const [activeTab, setActiveTab] = useState('displays');
  const [editingDisplay, setEditingDisplay] = useState(null);
  const [editingLoop, setEditingLoop] = useState(null);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 p-6 overflow-hidden gap-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" /> Hardware Displays & Screen Loops
          </h2>
          <p className="text-xs text-slate-400">Pair Raspberry Pis with 4-digit codes and assign screens/loops</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPairModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow transition"
          >
            <Link className="w-3.5 h-3.5" /> + Link Device with Code
          </button>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('displays')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'displays' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Displays ({displays.length})
            </button>
            <button
              onClick={() => setActiveTab('loops')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'loops' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Loops ({loops.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'displays' && (
          <DisplaysTab
            displays={displays}
            screens={screens}
            loops={loops}
            onSave={onSaveDisplay}
            onDelete={onDeleteDisplay}
            onUnpair={onUnpairDisplay}
            editingDisplay={editingDisplay}
            setEditingDisplay={setEditingDisplay}
          />
        )}

        {activeTab === 'loops' && (
          <LoopsTab
            loops={loops}
            screens={screens}
            onSave={onSaveLoop}
            onDelete={onDeleteLoop}
            editingLoop={editingLoop}
            setEditingLoop={setEditingLoop}
          />
        )}
      </div>

      <PairDeviceModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        screens={screens}
        loops={loops}
        onPaired={onRefresh}
      />
    </div>
  );
}

