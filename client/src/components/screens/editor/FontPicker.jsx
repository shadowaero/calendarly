import React, { useState, useRef, useEffect } from "react";
import { Type, Check, ChevronDown } from "lucide-react";
import { FONT_OPTIONS } from "../fonts";

export function FontPicker({ value = "default", onChange, label = "Font Style" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentOption = FONT_OPTIONS.find(f => f.value === value) || FONT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-0.5 relative" ref={containerRef}>
      {label && <label className="text-[8px] text-slate-400 block">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-1.5 px-2 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-left transition shadow-sm group"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Type className="w-3 h-3 text-cyan-400 shrink-0" />
          <div className="flex flex-col min-w-0 leading-tight">
            <span className={`text-[10px] text-white font-bold truncate ${currentOption.fontClass}`}>
              {currentOption.label}
            </span>
            <span className={`text-[7.5px] text-slate-400 truncate ${currentOption.fontClass}`}>
              {currentOption.sample}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-cyan-400" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-950 border border-slate-700/90 rounded-xl shadow-2xl p-1 flex flex-col gap-1 backdrop-blur-md">
          {FONT_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition ${
                  isSelected
                    ? "bg-cyan-950/70 border-cyan-500/80 text-cyan-200 ring-1 ring-cyan-500/40"
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className={`text-[11px] font-bold text-white ${opt.fontClass}`}>
                    {opt.label}
                  </span>
                  <span className={`text-[9px] text-slate-400 leading-tight ${opt.fontClass}`}>
                    {opt.sample}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
