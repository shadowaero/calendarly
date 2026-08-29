import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Wand2, X, Loader2, Check, RefreshCw, Sliders } from 'lucide-react';
import AISettingsModal from './AISettingsModal';

export default function AIGeneratorModal({
  isOpen,
  onClose,
  onApplyScreen,
  onApplyBlock,
  targetMode = 'screen',
  currentBlocks = [],
  orientation = 'landscape'
}) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const samplePrompts = targetMode === 'screen' ? [
    "Thanksgiving harvest theme with rolling 4-week calendar on right (65% width) and agenda with weather on left",
    "Chalkboard school schedule with month grid, weekly chores tracker, and daily facts block",
    "Christmas holiday cozy theme with warm fireplace photo background, quote block, and agenda",
    "Minimal dark modern command center with 5-day weather forecast, big clock, and family chore list"
  ] : [
    "Thanksgiving styled notes block with autumnal orange theme",
    "5-day weather forecast widget with dark slate background",
    "Rolling 3-week calendar in handwritten font style"
  ];

  const handleGenerate = async (promptToUse = prompt) => {
    if (!promptToUse || !promptToUse.trim()) return;
    setGenerating(true);
    setError(null);
    setGeneratedData(null);

    try {
      const res = await fetch('/api/ai/generate-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse, orientation, targetMode, currentBlocks })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate screen with AI');
      setGeneratedData(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedData) return;
    if (targetMode === 'screen' && onApplyScreen) {
      onApplyScreen(generatedData);
    } else if (targetMode === 'block' && onApplyBlock) {
      onApplyBlock(generatedData.block || generatedData);
    }
    onClose();
  };
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Screen & Layout Designer</h3>
              <p className="text-[11px] text-slate-400">
                {targetMode === 'screen' ? 'Generate themed screen layouts with fonts and backgrounds' : 'Generate or style a block'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(true)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Settings
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-300 uppercase">Describe your screen or theme:</label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Create a Thanksgiving themed screen with a calendar on the right taking 65% of the screen and with an agenda and weather on the left."'
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Quick ideas:</span>
            <div className="flex flex-wrap gap-1">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setPrompt(p); handleGenerate(p); }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 text-[10px] text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={generating || !prompt.trim()}
          onClick={() => handleGenerate()}
          className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Designing theme & layout...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate</>}
        </button>

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            <strong>Error:</strong> {error}
          </div>
        )}

        {generatedData && (
          <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Plan Generated
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">
                {generatedData.blocks ? `${generatedData.blocks.length} blocks` : '1 block'}
              </span>
            </div>

            <div className="text-xs text-slate-300">
              <div className="text-white font-bold">{generatedData.name}</div>
              <div className="text-slate-400 text-[11px]">{generatedData.description}</div>
              {generatedData.theme_summary && (
                <div className="text-purple-300/80 text-[11px] italic mt-1 bg-purple-950/40 p-1.5 rounded">
                  "{generatedData.theme_summary}"
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Re-generate
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
              >
                <Check className="w-3 h-3" /> Apply to Canvas
              </button>
            </div>
          </div>
        )}
      </div>

      <AISettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>,
    document.body
  );
}

