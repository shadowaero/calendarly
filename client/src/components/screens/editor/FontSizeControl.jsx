import React from "react";
import { Minus, Plus, Type } from "lucide-react";
import { FONT_SIZE_PRESETS, resolveFontSizePt } from "../fonts";

// Unified point-size control: number input + preset chips + stepper buttons.
export function FontSizeControl({ value, onChange, label = "Font Size" }) {
  const pt = Math.round(resolveFontSizePt(value, 14));

  const set = (v) => {
    const n = Math.round(Number(v));
    if (Number.isFinite(n)) onChange(Math.max(6, Math.min(96, n)));
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[8px] text-slate-400">{label}</label>
        <span className="text-[9px] font-bold text-cyan-300">{pt}pt</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => set(pt - 1)}
          className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          min="6"
          max="96"
          value={pt}
          onChange={(e) => set(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded text-[10px] text-white px-1.5 py-0.5 text-center"
        />
        <button
          type="button"
          onClick={() => set(pt + 1)}
          className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {FONT_SIZE_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => set(p.pt)}
            className={`px-1.5 py-0.5 rounded border text-[8px] font-bold transition ${
              pt === p.pt
                ? "bg-cyan-600/30 border-cyan-500 text-cyan-200"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
