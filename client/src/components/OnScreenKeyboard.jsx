import React, { useState } from 'react';
import { Delete, CornerDownLeft, CaseUpper, X } from 'lucide-react';

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

// Reusable on-screen keyboard. Emits keys via onKey(key) where key is
// either a single character or a special token: 'BACKSPACE' | 'SPACE' | 'ENTER' | 'SHIFT'.
export function OnScreenKeyboard({ onKey, onHide }) {
  const [shift, setShift] = useState(false);

  const press = (k) => { if (onKey) onKey(k); };
  const display = (k) => (shift ? k.toUpperCase() : k);

  const keyCls =
    'h-11 flex-1 min-w-0 rounded-lg bg-slate-800 border border-slate-700 text-white text-base font-semibold active:bg-cyan-700 active:scale-95 transition select-none flex items-center justify-center';

  const row1 = ROWS[0];
  const row2 = ROWS[1];
  const row3 = ROWS[2];
  const row4 = ROWS[3];

  return (
    <div className="fixed inset-x-0 bottom-0 z-[999] bg-slate-900/95 backdrop-blur border-t border-slate-700 px-2 pt-1.5 pb-2 flex flex-col gap-1 shadow-2xl" onMouseDown={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">On-Screen Keyboard</span>
        <button
          type="button"
          onClick={onHide}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Done
        </button>
      </div>

      <div className="flex gap-1">
        {row1.map((k) => (
          <button key={k} type="button" onClick={() => press(k)} className={keyCls}>{k}</button>
        ))}
      </div>

      <div className="flex gap-1">
        {row2.map((k) => (
          <button key={k} type="button" onClick={() => press(display(k))} className={keyCls}>{display(k)}</button>
        ))}
      </div>

      <div className="flex gap-1">
        {row3.map((k) => (
          <button key={k} type="button" onClick={() => press(display(k))} className={keyCls}>{display(k)}</button>
        ))}
        <button type="button" onClick={() => press('BACKSPACE')} className={`${keyCls} flex-[1.2]`}>
          <Delete className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setShift((s) => !s)}
          className={`${keyCls} flex-[1.2] ${shift ? 'bg-cyan-700 border-cyan-500 text-cyan-100' : ''}`}
        >
          <CaseUpper className="w-5 h-5" />
        </button>
        {row4.map((k) => (
          <button key={k} type="button" onClick={() => press(display(k))} className={keyCls}>{display(k)}</button>
        ))}
        <button type="button" onClick={() => press('ENTER')} className={`${keyCls} flex-[1.4]`}>
          <CornerDownLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-1">
        <button type="button" onClick={() => press('SPACE')} className={`${keyCls} flex-[4]`}>Space</button>
        <button type="button" onClick={() => press('@')} className={keyCls}>@</button>
        <button type="button" onClick={() => press('.')} className={keyCls}>.</button>
        <button type="button" onClick={() => press('-')} className={keyCls}>-</button>
      </div>
    </div>
  );
}
