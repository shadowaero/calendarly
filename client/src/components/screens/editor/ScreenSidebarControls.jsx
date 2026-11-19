import React from "react";
import { Palette, Layers, Sliders, Trash2, Upload } from "lucide-react";
import { effectiveGeom } from "./geometry";
import { PhotoBlockControls } from "./PhotoBlockControls";
import { FontPicker } from "./FontPicker";
import { FontSizeControl } from "./FontSizeControl";
import { COLOR_BACKGROUNDS, PATTERN_BACKGROUNDS, BLOCK_BACKGROUND_COLORS } from "../backgrounds";

export function ScreenSidebarControls({
  screenForm, setScreenForm, addBlock, removeBlock, updateBlockGeometry, updateBlockConfig, selectedBlockIdx, setSelectedBlockIdx
}) {
  const selectedBlock = screenForm.blocks[selectedBlockIdx] || null;
  const [bgPhotos, setBgPhotos] = React.useState([]);

  React.useEffect(() => {
    fetch("/api/photos")
      .then((r) => (r.ok ? r.json() : []))
      .then(setBgPhotos)
      .catch(() => {});
  }, []);

  const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleBlockBgUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    e.target.value = '';
    try {
      const dataUrl = await readFileAsDataURL(file);
      const base64 = dataUrl.split(',')[1];
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, data: base64 })
      });
      if (res.ok) {
        const photo = await res.json();
        updateBlockConfig(selectedBlockIdx, { bgImage: photo.url, bgColor: '' });
        const r = await fetch('/api/photos');
        if (r.ok) setBgPhotos(await r.json());
      }
    } catch (err) {
      console.error('Block background upload failed', err);
    }
  };

  const isColor = (v) => (screenForm.background_type || "color") === "color" && screenForm.background_value === v;
  const isPattern = (k) => screenForm.background_type === "pattern" && screenForm.background_value === k;
  const isPhoto = (u) => screenForm.background_type === "photo" && screenForm.background_value === u;

  const getBlockDisplayName = (type) => {
    switch (type) {
      case "calendar_month": return "Month Grid";
      case "calendar_agenda": return "Agenda";
      case "calendar_legend": return "Feed Legend";
      case "chores_tracker": return "Chores + Rewards";
      case "chores_list": return "Chores";
      case "reward_store": return "Reward Store";
      case "clock_weather": return "Clock & Weather";
      case "weather_forecast": return "Weather Forecast";
      case "hourly_weather": return "Hourly Weather";
      case "radar_block": return "Weather Radar";
      case "date_block": return "Date";
      case "today_button": return "Today Button";
      case "text": return "Text / Title";
      case "quote_notes": return "Notes / Quote";
      case "dailyfacts": return "Daily Fact";
      case "photo_embed": return "Photo Frame";
      default: return type.replace("_", " ");
    }
  };

  return (
    <div className="w-64 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shrink-0 overflow-y-auto max-h-full">
      {/* Background Section */}
      <div>
        <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5 mb-1.5">
          <Palette className="w-3.5 h-3.5 text-amber-400" /> Background
        </span>
        <div className="grid grid-cols-3 gap-1 mb-1">
          {COLOR_BACKGROUNDS.map((bg, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setScreenForm(prev => ({ ...prev, background_type: "color", background_value: bg.value }))}
              style={{ background: bg.value }}
              className={`h-5 rounded-lg border text-[8px] font-bold text-slate-300 truncate px-1 ${isColor(bg.value) ? "ring-2 ring-amber-400 border-white" : "border-slate-700"}`}
            >
              {bg.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 mb-1">
          {PATTERN_BACKGROUNDS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setScreenForm(prev => ({ ...prev, background_type: "pattern", background_value: p.key }))}
              style={{ background: p.css }}
              className={`h-5 rounded-lg border text-[8px] font-bold text-slate-300 truncate px-1 ${isPattern(p.key) ? "ring-2 ring-amber-400 border-white" : "border-slate-700"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {bgPhotos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setScreenForm(prev => ({ ...prev, background_type: "photo", background_value: p.url }))}
              className={`h-6 rounded-lg overflow-hidden border relative ${isPhoto(p.url) ? "ring-2 ring-amber-400 border-white" : "border-slate-700"}`}
            >
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Add Widget Palette */}
      <div className="border-t border-slate-800 pt-2">
        <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5 mb-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" /> Add Widgets
        </span>
        <div className="grid grid-cols-3 gap-1">
          <button type="button" onClick={() => addBlock("calendar_month")} className="px-1.5 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-200 rounded-lg text-[9px] font-bold">+ Cal</button>
          <button type="button" onClick={() => addBlock("calendar_agenda")} className="px-1.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 rounded-lg text-[9px] font-bold">+ Agenda</button>
          <button type="button" onClick={() => addBlock("calendar_legend")} className="px-1.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-lg text-[9px] font-bold">+ Legend</button>
          <button type="button" onClick={() => addBlock("chores_list")} className="px-1.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 rounded-lg text-[9px] font-bold">+ Chores</button>
          <button type="button" onClick={() => addBlock("reward_store")} className="px-1.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 rounded-lg text-[9px] font-bold">+ Rewards</button>
          <button type="button" onClick={() => addBlock("clock_weather")} className="px-1.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 rounded-lg text-[9px] font-bold">+ Clock</button>
          <button type="button" onClick={() => addBlock("weather_forecast")} className="px-1.5 py-1 bg-teal-950/80 hover:bg-teal-900 border border-teal-800 text-teal-200 rounded-lg text-[9px] font-bold">+ Forecast</button>
          <button type="button" onClick={() => addBlock("hourly_weather")} className="px-1.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 rounded-lg text-[9px] font-bold">+ Hourly</button>
          <button type="button" onClick={() => addBlock("radar_block")} className="px-1.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 rounded-lg text-[9px] font-bold">+ Radar</button>
          <button type="button" onClick={() => addBlock("date_block")} className="px-1.5 py-1 bg-violet-950/80 hover:bg-violet-900 border border-violet-800 text-violet-200 rounded-lg text-[9px] font-bold">+ Date</button>
          <button type="button" onClick={() => addBlock("today_button")} className="px-1.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 rounded-lg text-[9px] font-bold">+ Today</button>
          <button type="button" onClick={() => addBlock("text")} className="px-1.5 py-1 bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-800 text-fuchsia-200 rounded-lg text-[9px] font-bold">+ Text</button>
          <button type="button" onClick={() => addBlock("quote_notes")} className="px-1.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 rounded-lg text-[9px] font-bold">+ Note</button>
          <button type="button" onClick={() => addBlock("dailyfacts")} className="px-1.5 py-1 bg-orange-950/80 hover:bg-orange-900 border border-orange-800 text-orange-200 rounded-lg text-[9px] font-bold">+ Fact</button>
          <button type="button" onClick={() => addBlock("photo_embed")} className="px-1.5 py-1 bg-pink-950/80 hover:bg-pink-900 border border-pink-800 text-pink-200 rounded-lg text-[9px] font-bold">+ Photo</button>
        </div>
      </div>

      {/* Blocks List */}
      <div className="border-t border-slate-800 pt-2 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Screen Blocks ({screenForm.blocks.length})
        </span>

        <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
          {screenForm.blocks.map((block, idx) => {
            const wPct = Math.round(effectiveGeom(block).w);
            const presets = [25, 33, 50, 66, 100];
            const isSelected = selectedBlockIdx === idx;

            return (
              <div
                key={block.id || idx}
                onClick={() => setSelectedBlockIdx(idx)}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  isSelected ? "bg-slate-800 border-cyan-400" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {getBlockDisplayName(block.type)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={wPct}
                      onChange={(e) => updateBlockGeometry(idx, { w_percent: Number(e.target.value) })}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-950 border border-slate-700 rounded text-[8px] text-slate-300 p-0.5"
                    >
                      {!presets.includes(wPct) && <option value={wPct}>{wPct}%</option>}
                      {presets.map((p) => <option key={p} value={p}>{p}%</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeBlock(idx); }}
                      className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded"
                      title="Delete block"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Block Style & Configuration Panel */}
        {selectedBlock && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2 mt-1 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[9px]">
                {getBlockDisplayName(selectedBlock.type)} Settings
              </span>
              <button
                type="button"
                onClick={() => setSelectedBlockIdx(null)}
                className="text-[8px] text-slate-500 hover:text-slate-300"
              >
                Done
              </button>
            </div>

            {/* Freeform geometry coordinates */}
            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className="text-[7px] text-slate-400">X %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={Math.round((effectiveGeom(selectedBlock).x) * 10) / 10}
                  onChange={(e) => updateBlockGeometry(selectedBlockIdx, { x_percent: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-0.5"
                />
              </div>
              <div>
                <label className="text-[7px] text-slate-400">Y %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={Math.round((effectiveGeom(selectedBlock).y) * 10) / 10}
                  onChange={(e) => updateBlockGeometry(selectedBlockIdx, { y_percent: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-0.5"
                />
              </div>
              <div>
                <label className="text-[7px] text-slate-400">W %</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="0.1"
                  value={Math.round((effectiveGeom(selectedBlock).w) * 10) / 10}
                  onChange={(e) => updateBlockGeometry(selectedBlockIdx, { w_percent: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-0.5"
                />
              </div>
              <div>
                <label className="text-[7px] text-slate-400">H %</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="0.1"
                  value={Math.round((effectiveGeom(selectedBlock).h) * 10) / 10}
                  onChange={(e) => updateBlockGeometry(selectedBlockIdx, { h_percent: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-0.5"
                />
              </div>
            </div>

            {/* Rotation */}
            <div className="border-t border-slate-800 pt-1.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <label className="text-[8px] text-slate-400 shrink-0">Rotate</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={selectedBlock.config?.rotation || 0}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { rotation: Number(e.target.value) })}
                  className="flex-1 accent-cyan-500"
                />
                <span className="text-[9px] font-bold text-cyan-300 w-9 text-right shrink-0">{selectedBlock.config?.rotation || 0}°</span>
                <button
                  type="button"
                  onClick={() => updateBlockConfig(selectedBlockIdx, { rotation: 0 })}
                  className="text-[8px] text-slate-500 hover:text-white shrink-0"
                >
                  Reset
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {[0, 45, 90, -45, -90, 180].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => updateBlockConfig(selectedBlockIdx, { rotation: deg })}
                    className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${
                      (selectedBlock.config?.rotation || 0) === deg
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Font Picker */}
            <FontPicker
              value={selectedBlock.config?.fontFamily || "default"}
              onChange={(f) => updateBlockConfig(selectedBlockIdx, { fontFamily: f })}
              label="Font Style"
            />

            {selectedBlock.type !== "calendar_month" && (
              <FontSizeControl
                value={selectedBlock.config?.fontSize}
                onChange={(v) => updateBlockConfig(selectedBlockIdx, { fontSize: v })}
                label="Font Size"
              />
            )}

            {/* Block Background: colors + custom image */}
            <div className="border-t border-slate-800 pt-1.5 flex flex-col gap-1">
              <span className="text-[8px] font-bold text-slate-300 uppercase">Block Background</span>

              <div className="grid grid-cols-8 gap-1">
                {BLOCK_BACKGROUND_COLORS.map((bc, i) => (
                  <button
                    key={i}
                    type="button"
                    title={bc.label}
                    onClick={() => updateBlockConfig(selectedBlockIdx, { bgColor: bc.value, bgImage: '' })}
                    style={{ background: bc.value }}
                    className={`h-5 rounded border ${selectedBlock.config?.bgColor === bc.value ? 'ring-2 ring-cyan-400 border-white' : 'border-slate-700'}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-6 gap-1 mt-0.5">
                {bgPhotos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateBlockConfig(selectedBlockIdx, { bgImage: p.url, bgColor: '' })}
                    className={`h-7 rounded border overflow-hidden ${selectedBlock.config?.bgImage === p.url ? 'ring-2 ring-cyan-400 border-white' : 'border-slate-700'}`}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                <label className="h-7 flex items-center justify-center rounded border border-dashed border-slate-600 text-slate-400 cursor-pointer hover:bg-slate-800 hover:text-white" title="Upload custom background image">
                  <Upload className="w-3 h-3" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleBlockBgUpload} />
                </label>
              </div>

              {(selectedBlock.config?.bgColor || selectedBlock.config?.bgImage) && (
                <button
                  type="button"
                  onClick={() => updateBlockConfig(selectedBlockIdx, { bgColor: '', bgImage: '' })}
                  className="text-[8px] text-rose-400 hover:text-rose-300 text-left"
                >
                  ✕ Clear custom background
                </button>
              )}

              <div>
                <label className="text-[7.5px] text-slate-400 block mb-0.5">Card Style (when no custom bg)</label>
                <select
                  value={selectedBlock.config?.bgOpacity || "blur"}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { bgOpacity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                >
                  <option value="blur">Blur Glass (Default)</option>
                  <option value="solid">Solid Card</option>
                  <option value="transparent">Transparent / None</option>
                </select>
              </div>
            </div>

            {/* Calendar Month Specific Controls */}
            {selectedBlock.type === "calendar_month" && (
              <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Month Grid & Font Sizing</span>
                
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-[7.5px] text-slate-400 block mb-0.5">View Style</label>
                    <select
                      value={selectedBlock.config?.viewMode || "month"}
                      onChange={(e) => updateBlockConfig(selectedBlockIdx, { viewMode: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                    >
                      <option value="month">Whole Month</option>
                      <option value="rolling">Rolling Weeks</option>
                    </select>
                  </div>
                  {selectedBlock.config?.viewMode === "rolling" ? (
                    <div>
                      <label className="text-[7.5px] text-slate-400 block mb-0.5">Weeks to Show</label>
                      <select
                        value={selectedBlock.config?.rollingWeeks || 4}
                        onChange={(e) => updateBlockConfig(selectedBlockIdx, { rollingWeeks: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                      >
                        <option value={2}>2 Weeks</option>
                        <option value={3}>3 Weeks</option>
                        <option value={4}>4 Weeks</option>
                        <option value={5}>5 Weeks</option>
                      </select>
                    </div>
                  ) : <div />}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <FontSizeControl
                    value={selectedBlock.config?.dateFontSize}
                    onChange={(v) => updateBlockConfig(selectedBlockIdx, { dateFontSize: v })}
                    label="Date Numbers"
                  />
                  <FontSizeControl
                    value={selectedBlock.config?.eventFontSize}
                    onChange={(v) => updateBlockConfig(selectedBlockIdx, { eventFontSize: v })}
                    label="Event Text"
                  />
                </div>

                <FontSizeControl
                  value={selectedBlock.config?.headerFontSize}
                  onChange={(v) => updateBlockConfig(selectedBlockIdx, { headerFontSize: v })}
                  label="Header Month Title"
                />
              </div>
            )}

            {/* Calendar Agenda Specific Controls */}
            {selectedBlock.type === "calendar_agenda" && (
              <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Agenda Config</span>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-[7.5px] text-slate-400 block mb-0.5">Max Events</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={selectedBlock.config?.limit || 7}
                      onChange={(e) => updateBlockConfig(selectedBlockIdx, { limit: Number(e.target.value) || 7 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* Text / Title Block */}
            {selectedBlock.type === "text" && (
              <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Text / Title Config</span>
                <textarea
                  placeholder="Enter text or title"
                  value={selectedBlock.config?.text || ""}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { text: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[10px] text-white p-1.5 h-16 resize-none"
                />
                <div>
                  <label className="text-[7.5px] text-slate-400 block mb-0.5">Text Color</label>
                  <select
                    value={selectedBlock.config?.color || "light"}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { color: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                  >
                    <option value="light">White</option>
                    <option value="dark">Dark</option>
                    <option value="blue">Blue</option>
                    <option value="cyan">Cyan</option>
                    <option value="emerald">Emerald</option>
                    <option value="green">Green</option>
                    <option value="amber">Amber</option>
                    <option value="orange">Orange</option>
                    <option value="rose">Rose</option>
                    <option value="red">Red</option>
                    <option value="purple">Purple</option>
                    <option value="muted">Muted Slate</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-1 items-end">
                  <div>
                    <label className="text-[7.5px] text-slate-400 block mb-0.5">Weight</label>
                    <select
                      value={selectedBlock.config?.fontWeight || "bold"}
                      onChange={(e) => updateBlockConfig(selectedBlockIdx, { fontWeight: e.target.value, bold: e.target.value !== "normal" })}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semi-Bold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between gap-1 text-[8px] text-slate-300 cursor-pointer pb-1">
                    <span>Underline</span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedBlock.config?.underline)}
                      onChange={(e) => updateBlockConfig(selectedBlockIdx, { underline: e.target.checked })}
                      className="rounded border-slate-700 text-cyan-500 bg-slate-950 w-3 h-3"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Quote / Notes Block */}
            {selectedBlock.type === "quote_notes" && (
              <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Notes / Quote Config</span>
                <textarea
                  placeholder="Custom note text (leave blank for rotating quote)"
                  value={selectedBlock.config?.note || ""}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { note: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1 h-12"
                />
                <input
                  type="text"
                  placeholder="Author / Tag (optional)"
                  value={selectedBlock.config?.author || ""}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { author: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                />
                <div className="grid grid-cols-2 gap-1">

                  <select
                    value={selectedBlock.config?.color || "light"}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { color: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                  >
                    <option value="light">Light</option>
                    <option value="rose">Rose</option>
                    <option value="emerald">Emerald</option>
                    <option value="cyan">Cyan</option>
                    <option value="amber">Amber</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>
            )}

            {/* Weather Forecast Block */}
            {selectedBlock.type === "weather_forecast" && (
              <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Weather Config</span>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Zip code or City (e.g. 32757)"
                    value={selectedBlock.config?.zip || ""}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { zip: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white px-1.5 py-0.5 flex-1"
                  />
                  <select
                    value={selectedBlock.config?.days || 4}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { days: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-0.5"
                  >
                    <option value={3}>3 Days</option>
                    <option value={4}>4 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={6}>6 Days</option>
                    <option value={7}>7 Days</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="Title Label (optional)"
                    value={selectedBlock.config?.label || ""}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { label: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                  />
                  <select
                    value={selectedBlock.config?.units || "F"}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { units: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                  >
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="C">Celsius (°C)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Hourly Weather Block */}
            {selectedBlock.type === "hourly_weather" && (
              <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Hourly Weather Config</span>
                <input
                  type="text"
                  placeholder="Zip code or City (e.g. 32757)"
                  value={selectedBlock.config?.zip || ""}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { zip: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                />
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="Label (optional)"
                    value={selectedBlock.config?.label || ""}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { label: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                  />
                  <select
                    value={selectedBlock.config?.hours || 12}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { hours: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                  >
                    <option value={6}>6 Hours</option>
                    <option value={12}>12 Hours</option>
                    <option value={18}>18 Hours</option>
                    <option value={24}>24 Hours</option>
                  </select>
                </div>
                <select
                  value={selectedBlock.config?.units || "F"}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { units: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                >
                  <option value="F">Fahrenheit (°F)</option>
                  <option value="C">Celsius (°C)</option>
                </select>
              </div>
            )}

            {/* Weather Radar Block */}
            {selectedBlock.type === "radar_block" && (
              <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Weather Radar Config</span>
                <input
                  type="text"
                  placeholder="Zip code or City (e.g. 32757)"
                  value={selectedBlock.config?.zip || ""}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { zip: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                />
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-[7.5px] text-slate-400 block mb-0.5">Color Scheme</label>
                    <select
                      value={selectedBlock.config?.color ?? 4}
                      onChange={(e) => updateBlockConfig(selectedBlockIdx, { color: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                    >
                      <option value={0}>Classic</option>
                      <option value={2}>Blue</option>
                      <option value={4}>Rainbow</option>
                      <option value={6}>Dark</option>
                      <option value={8}>Tron</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[7.5px] text-slate-400 block mb-0.5">Magnify</label>
                    <select
                      value={selectedBlock.config?.magnify || 2}
                      onChange={(e) => updateBlockConfig(selectedBlockIdx, { magnify: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                    >
                      <option value={1}>1× (Wide)</option>
                      <option value={2}>2× (Default)</option>
                      <option value={3}>3× (Close)</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center justify-between gap-1 text-[8px] text-slate-300 cursor-pointer">
                  <span>Animate Radar</span>
                  <input
                    type="checkbox"
                    checked={selectedBlock.config?.animate !== false}
                    onChange={(e) => updateBlockConfig(selectedBlockIdx, { animate: e.target.checked })}
                    className="rounded border-slate-700 text-cyan-500 bg-slate-950 w-3 h-3"
                  />
                </label>
                <input
                  type="text"
                  placeholder="Label (optional)"
                  value={selectedBlock.config?.label || ""}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { label: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                />
              </div>
            )}

            {/* Clock & Weather Block */}
            {selectedBlock.type === "clock_weather" && (
              <div className="flex flex-col gap-1 border-t border-slate-800 pt-1.5">
                <span className="font-bold text-cyan-400 uppercase text-[8px]">Clock & Weather Location</span>
                <input
                  type="text"
                  placeholder="Location / Zip (e.g. 32757 or Home)"
                  value={selectedBlock.config?.location || ""}
                  onChange={(e) => updateBlockConfig(selectedBlockIdx, { location: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"
                />
              </div>
            )}

            {/* Photo Block Controls */}
            {selectedBlock.type === "photo_embed" && (
              <PhotoBlockControls
                config={selectedBlock.config || {}}
                onConfigChange={(patch) => updateBlockConfig(selectedBlockIdx, patch)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
