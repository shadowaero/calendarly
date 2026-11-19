import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Sparkles, X, Loader2, RefreshCw } from 'lucide-react';

export default function AISettingsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('lmstudio');
  const [config, setConfig] = useState({
    provider: 'openai_compatible',
    baseUrl: 'http://192.168.76.87:1234/v1',
    apiKey: '',
    model: 'google/gemma-4-12b',
    temperature: 0.7
  });

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/ai/config')
      .then(r => r.json())
      .then(data => {
        if (data.config) {
          setConfig({
            provider: data.config.provider || 'openai_compatible',
            baseUrl: data.config.baseUrl || 'http://192.168.76.87:1234/v1',
            apiKey: data.config.hasApiKey ? '••••••••' : '',
            model: data.config.model || 'google/gemma-4-12b',
            temperature: data.config.temperature ?? 0.7
          });
        }
        if (data.presets) setPresets(data.presets);
      })
      .catch(e => console.error('Failed to load AI config:', e))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSelectPreset = (p) => {
    setSelectedPresetId(p.id);
    setConfig(prev => ({
      ...prev,
      provider: p.provider,
      baseUrl: p.baseUrl,
      model: p.model,
      apiKey: p.apiKey || (p.provider === 'ollama' || p.id === 'lmstudio' ? '' : prev.apiKey)
    }));
    setTestResult(null);
    setAvailableModels([]);
  };

  const handleFetchModels = async () => {
    setLoadingModels(true);
    setTestResult(null);
    try {
      const payload = { ...config, apiKey: config.apiKey === '••••••••' ? 'KEEP' : config.apiKey };
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.models)) {
        setAvailableModels(data.models);
        if (data.models.length > 0 && !data.models.includes(config.model)) {
          setConfig(prev => ({ ...prev, model: data.models[0] }));
        }
        setTestResult({ type: 'success', text: `Loaded ${data.models.length} model(s)!` });
      } else {
        setTestResult({ type: 'error', text: data.error || 'Could not fetch models' });
      }
    } catch (err) {
      setTestResult({ type: 'error', text: err.message });
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...config, apiKey: config.apiKey === '••••••••' ? 'KEEP' : config.apiKey };
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) setTestResult({ type: 'success', text: 'Settings saved!' });
      else setTestResult({ type: 'error', text: 'Failed to save' });
    } catch (err) {
      setTestResult({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const payload = { ...config, apiKey: config.apiKey === '••••••••' ? 'KEEP' : config.apiKey };
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) setTestResult({ type: 'success', text: data.message || 'Connected!' });
      else setTestResult({ type: 'error', text: data.error || 'Failed' });
    } catch (err) {
      setTestResult({ type: 'error', text: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">AI Provider Settings</h3>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`p-1.5 rounded-lg border text-left text-xs ${selectedPresetId === p.id ? 'bg-purple-600/30 border-purple-500 text-purple-200' : 'bg-slate-800 text-slate-300'}`}
            >
              <div className="font-bold truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{p.model}</div>
            </button>
          ))}
        </div>

        <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase">Provider</label>
            <select
              value={config.provider}
              onChange={e => setConfig(prev => ({ ...prev, provider: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
            >
              <option value="openai_compatible">OpenAI Compatible (LM Studio / DeepSeek / ChatGPT)</option>
              <option value="ollama">Ollama</option>
              <option value="gemini">Google Gemini</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase">Base URL</label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={e => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="e.g. http://192.168.76.87:1234/v1"
              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Model</label>
              <button
                type="button"
                onClick={handleFetchModels}
                disabled={loadingModels}
                className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800"
              >
                <RefreshCw className={`w-3 h-3 ${loadingModels ? 'animate-spin' : ''}`} />
                Detect Models
              </button>
            </div>
            {availableModels.length > 0 ? (
              <select
                value={config.model}
                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
              >
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={config.model}
                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. google/gemma-4-12b or gpt-4o-mini"
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
              />
            )}
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-... (leave empty for local LM Studio / Ollama)"
              className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
            />
          </div>
        </div>

        {testResult && (
          <div className={`p-2 rounded-lg text-xs ${testResult.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
            {testResult.text}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button onClick={handleTest} disabled={testing} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1">
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />} Test
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs">Close</button>
            <button onClick={handleSave} disabled={loading} className="px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
