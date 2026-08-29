import React from 'react';

export default function RedeemModal({ isOpen, reward, members, targetMember, setTargetMember, message, onConfirm, onClose }) {
  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 text-slate-100 shadow-2xl flex flex-col gap-3">
        <div className="text-center">
          <div className="text-3xl mb-1">{reward.icon}</div>
          <h3 className="text-base font-bold text-white">Redeem {reward.title}?</h3>
          <p className="text-xs text-purple-400 font-bold">Cost: {reward.cost} Points</p>
        </div>
        <select
          value={targetMember}
          onChange={(e) => setTargetMember(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.avatar} {m.name} ({m.weeklyPoints} pts available)</option>
          ))}
        </select>
        {message && (
          <div className={`text-xs p-2 rounded-lg font-bold text-center ${message.type === 'error' ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
            {message.text}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg">Confirm</button>
        </div>
      </div>
    </div>
  );
}
