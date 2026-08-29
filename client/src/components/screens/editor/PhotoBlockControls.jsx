import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, Crop, Maximize2, Sparkles } from 'lucide-react';

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoBlockControls({ config = {}, onConfigChange }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const res = await fetch('/api/photos');
      if (res.ok) setPhotos(await res.json());
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => { load(); }, []);

  const selected = Array.isArray(config.photos) ? config.photos : [];
  const isSelected = (url) => selected.includes(url);

  const toggle = (url) => {
    const next = isSelected(url) ? selected.filter((u) => u !== url) : [...selected, url];
    onConfigChange({ photos: next });
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        try {
          const dataUrl = await readFileAsDataURL(file);
          const base64 = dataUrl.split(',')[1];
          await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, mimeType: file.type, data: base64 })
          });
        } catch (e) {
          console.error('Upload failed for', file.name, e);
        }
      }
      await load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1 mt-0.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-pink-400 uppercase">Photos</span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-1.5 py-0.5 bg-pink-950 border border-pink-800 text-pink-300 rounded text-[8px] hover:bg-pink-900 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Upload className="w-2.5 h-2.5" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto pr-0.5">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.url)}
            className={`relative aspect-video rounded overflow-hidden border ${
              isSelected(p.url) ? 'border-pink-400 ring-2 ring-pink-400' : 'border-slate-700'
            }`}
          >
            <img src={p.url} alt={p.originalName} className="w-full h-full object-cover" />
            {isSelected(p.url) && (
              <span className="absolute inset-0 flex items-center justify-center bg-pink-500/40 text-white text-[10px] font-bold">
                ✓
              </span>
            )}
          </button>
        ))}
        {photos.length === 0 && (
          <span className="text-[8px] text-slate-500 col-span-3 text-center py-2">
            No photos uploaded yet
          </span>
        )}
      </div>
      {selected.length > 0 && (
        <span className="text-[7px] text-slate-400">{selected.length} selected</span>
      )}

      {/* Sizing & Cropping Controls */}
      {(() => {
        const fitMode = config.fitMode || (config.crop === false ? 'contain' : (config.crop === true || config.crop === '1' ? 'cover' : 'contain'));
        const blurBackground = config.blurBackground !== undefined ? Boolean(config.blurBackground) : (fitMode === 'contain');
        const cropPosition = config.cropPosition || 'center';

        return (
          <div className="flex flex-col gap-1 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[8px] text-slate-300 font-semibold">
              <span>Photo Sizing & Fit</span>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => onConfigChange({ fitMode: 'contain', crop: false })}
                className={`flex items-center justify-center gap-1 py-1 px-1 rounded text-[8px] font-medium border transition ${
                  fitMode === 'contain'
                    ? 'bg-pink-600/30 border-pink-500 text-pink-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-2.5 h-2.5" />
                Shrink to Fit
              </button>

              <button
                type="button"
                onClick={() => onConfigChange({ fitMode: 'cover', crop: true })}
                className={`flex items-center justify-center gap-1 py-1 px-1 rounded text-[8px] font-medium border transition ${
                  fitMode === 'cover'
                    ? 'bg-pink-600/30 border-pink-500 text-pink-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crop className="w-2.5 h-2.5" />
                Crop to Fill
              </button>
            </div>

            {/* Crop Alignment Selector when Crop/Cover is enabled */}
            {fitMode === 'cover' && (
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <label className="text-[7.5px] text-slate-400">Crop Focus</label>
                <select
                  value={cropPosition}
                  onChange={(e) => onConfigChange({ cropPosition: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded text-[8px] text-white px-1 py-0.5"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}

            {/* Blurred Background Toggle */}
            <label className="flex items-center justify-between gap-1 pt-0.5 cursor-pointer">
              <span className="text-[7.5px] text-slate-300 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                Blur sides / background
              </span>
              <input
                type="checkbox"
                checked={blurBackground}
                onChange={(e) => onConfigChange({ blurBackground: e.target.checked })}
                className="rounded border-slate-700 text-pink-500 focus:ring-pink-500/20 bg-slate-950 w-3 h-3 cursor-pointer"
              />
            </label>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 gap-1 items-center">
        <label className="text-[8px] text-slate-400">Seconds per photo</label>
        <input
          type="number"
          min="2"
          step="1"
          value={config.intervalSeconds || 30}
          onChange={(e) => onConfigChange({ intervalSeconds: Math.max(2, Number(e.target.value) || 30) })}
          className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white px-1 py-0.5"
        />
      </div>

      <input
        type="text"
        placeholder="Caption (optional)"
        value={config.caption || ''}
        onChange={(e) => onConfigChange({ caption: e.target.value })}
        className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white px-1 py-0.5"
      />
    </div>
  );
}
