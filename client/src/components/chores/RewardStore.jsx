import React from 'react';
import { resolveFontSizePt, fontSizeStyle } from '../screens/fonts';
import { Gift, Edit2, Trash2 } from 'lucide-react';

export default function RewardStore({ rewards, onRedeemClick, onEditReward, onDeleteReward, clientMode, fontSize, embedded }) {
  const pt = resolveFontSizePt(fontSize, 11);
  return (
    <div className={embedded ? "h-full w-full flex flex-col min-h-0" : "lg:col-span-5 flex flex-col gap-4 min-h-0"}>
      <div className={embedded ? "flex-1 flex flex-col overflow-hidden p-3" : "flex-1 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl p-4 overflow-hidden"}>
        <h2 className="font-extrabold text-white flex items-center gap-2 mb-3" style={fontSizeStyle(pt, 1.3)}>
          <Gift className="w-4 h-4 text-purple-400" /> Award Store
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {rewards.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-xl">{reward.icon}</span>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate" style={fontSizeStyle(pt)}>{reward.title}</h4>
                  <p className="text-purple-300 font-bold" style={fontSizeStyle(pt, 0.9)}>{reward.cost} Points</p>
                  {reward.description && <p className="text-slate-400 truncate" style={fontSizeStyle(pt, 0.8)}>{reward.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {clientMode !== 'display' && (
                  <button onClick={() => onRedeemClick(reward)} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow">
                    Redeem
                  </button>
                )}
                {clientMode !== 'display' && onEditReward && (
                  <button onClick={() => onEditReward(reward)} className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-700/60 transition" title="Edit Reward">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {clientMode !== 'display' && onDeleteReward && (
                  <button onClick={() => onDeleteReward(reward.id)} className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/40 transition" title="Delete Reward">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

