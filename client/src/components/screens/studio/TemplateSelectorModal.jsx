import React, { useState, useEffect, useRef } from 'react';
import { LayoutTemplate, X, Monitor, Smartphone, Sparkles, Camera, Trash2, Loader2 } from 'lucide-react';
import { DAKBOARD_TEMPLATES } from '../templates';
import { getBackgroundStyle } from '../backgrounds';

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TemplateSelectorModal({ isOpen, onClose, onSelectTemplate, isAdmin }) {
  const [category, setCategory] = useState('All');
  const [orientation, setOrientation] = useState('All');
  const [previewOverrides, setPreviewOverrides] = useState({});
  const [uploadingForId, setUploadingForId] = useState(null);
  const fileInputRef = useRef(null);
  const targetTemplateIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/screens/template-previews')
      .then(r => r.ok ? r.json() : {})
      .then(d => setPreviewOverrides(d || {}))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Family', 'Chalkboard', 'Minimal', 'Photo', 'Portrait'];

  const filtered = DAKBOARD_TEMPLATES.filter((tpl) => {
    const matchCat = category === 'All' || tpl.category === category;
    const matchOri = orientation === 'All' || tpl.orientation === orientation;
    return matchCat && matchOri;
  });

  const handleUploadClick = (e, tplId) => {
    e.stopPropagation();
    targetTemplateIdRef.current = tplId;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    const tplId = targetTemplateIdRef.current;
    if (!file || !tplId) return;

    setUploadingForId(tplId);
    try {
      const dataUrl = await readFileAsDataURL(file);
      const base64 = dataUrl.split(',')[1];
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'image/jpeg',
          data: base64
        })
      });

      if (res.ok) {
        const photo = await res.json();
        const saveRes = await fetch('/api/screens/template-previews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: tplId, photoUrl: photo.url })
        });
        if (saveRes.ok) {
          const updated = await saveRes.json();
          setPreviewOverrides(updated);
        }
      }
    } catch (err) {
      console.error('Failed to upload template preview image:', err);
    } finally {
      setUploadingForId(null);
    }
  };

  const handleRemoveCustomBg = async (e, tplId) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/screens/template-previews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: tplId, photoUrl: null })
      });
      if (res.ok) {
        const updated = await res.json();
        setPreviewOverrides(updated);
      }
    } catch (err) {
      console.error('Failed to remove custom preview background:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                DAKboard Screen Presets
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready to Use
                </span>
              </h3>
              <p className="text-xs text-slate-400">Select a layout preset or customize preview photos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  category === c ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setOrientation('All')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition ${orientation === 'All' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${orientation === 'landscape' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor className="w-3 h-3" /> Landscape
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${orientation === 'portrait' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-3 h-3" /> Portrait
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => {
            const customBg = previewOverrides[tpl.id];
            const bgStyle = customBg
              ? { backgroundImage: `url("${customBg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : getBackgroundStyle(tpl.background_type, tpl.background_value);

            return (
              <div
                key={tpl.id}
                onClick={() => { onSelectTemplate(tpl); onClose(); }}
                className="group flex flex-col bg-slate-950 border border-slate-800/90 hover:border-amber-500/60 rounded-xl overflow-hidden cursor-pointer transition hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5"
              >
                {/* Visual Header Box with Background Image and Labels */}
                <div
                  className="h-28 w-full border-b border-slate-800/80 p-2.5 relative overflow-hidden flex flex-col justify-between"
                  style={bgStyle}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-white uppercase backdrop-blur shadow-sm">
                      {tpl.orientation}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/40 text-amber-200 border border-amber-500/40 backdrop-blur shadow-sm">
                      {tpl.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between z-10">
                    <div className="text-[9px] text-slate-200 font-bold bg-black/75 px-1.5 py-0.5 rounded backdrop-blur shadow-sm">
                      {tpl.blocks.length} blocks
                    </div>

                    {/* Admin photo upload button */}
                    <div className="flex items-center gap-1">
                      {customBg && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveCustomBg(e, tpl.id)}
                          className="p-1 rounded bg-black/75 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700/60 backdrop-blur transition"
                          title="Reset to default background"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleUploadClick(e, tpl.id)}
                        disabled={uploadingForId === tpl.id}
                        className="px-1.5 py-0.5 rounded bg-black/75 hover:bg-amber-600 text-slate-200 hover:text-white border border-slate-700/60 backdrop-blur flex items-center gap-1 text-[9px] font-bold transition"
                        title="Upload custom background photo for this preset"
                      >
                        {uploadingForId === tpl.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                        ) : (
                          <Camera className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{customBg ? 'Change Photo' : 'Add Photo'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300">{tpl.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{tpl.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-amber-400 group-hover:text-amber-300">
                    <span>Use Template</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
