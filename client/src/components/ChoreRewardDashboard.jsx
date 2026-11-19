import React, { useState } from 'react';
import { Plus, Sparkles, Users } from 'lucide-react';
import ChoreList from './chores/ChoreList';
import RewardStore from './chores/RewardStore';
import RedeemModal from './chores/RedeemModal';
import { AddChoreModal } from './modals/AddChoreModal';
import { EditChoreModal } from './modals/EditChoreModal';
import { AddRewardModal } from './modals/AddRewardModal';
import { EditRewardModal } from './modals/EditRewardModal';
import MemberManagerModal from './members/MemberManagerModal';

export default function ChoreRewardDashboard({ 
  members, chores, rewards, onToggleChore, onEditChore, onDeleteChore, onRedeemReward, onEditReward, onDeleteReward, onRefresh, clientMode 
}) {
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [redeemingReward, setRedeemingReward] = useState(null);
  const [redeemTargetMember, setRedeemTargetMember] = useState('');
  const [redeemMessage, setRedeemMessage] = useState(null);

  const filteredChores = selectedMemberId === 'all'
    ? chores
    : chores.filter(c => !c.member_id || c.member_id === Number(selectedMemberId));

  const handleRedeemClick = (reward) => {
    setRedeemingReward(reward);
    setRedeemTargetMember(selectedMemberId !== 'all' ? selectedMemberId : (members[0]?.id || ''));
  };

  const confirmRedeem = async () => {
    if (!redeemingReward || !redeemTargetMember) return;
    const res = await onRedeemReward(redeemingReward.id, Number(redeemTargetMember));
    if (res?.error) {
      setRedeemMessage({ type: 'error', text: res.error });
    } else {
      setRedeemMessage({ type: 'success', text: `Redeemed ${redeemingReward.title}!` });
      setTimeout(() => setRedeemingReward(null), 1200);
    }
    setTimeout(() => setRedeemMessage(null), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 overflow-hidden gap-4">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedMemberId('all')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase ${
              selectedMemberId === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            All
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(String(m.id))}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                selectedMemberId === String(m.id) ? 'bg-slate-800 border-indigo-500' : 'bg-slate-800/60 border-slate-700'
              }`}
            >
              <span className="text-xl">{m.avatar}</span>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">{m.name}</div>
                <div className="text-[10px] font-black text-amber-400 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> {m.weeklyPoints} pts
                </div>
              </div>
            </button>
          ))}
        </div>

        {clientMode !== 'display' && (
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMemberModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Members
            </button>
            <button onClick={() => setIsChoreModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> Chore
            </button>
            <button onClick={() => setIsRewardModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> Reward
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        <ChoreList
          chores={filteredChores}
          members={members}
          onToggleChore={onToggleChore}
          onEditChore={(c) => setEditingChore(c)}
          onDeleteChore={onDeleteChore}
          clientMode={clientMode}
        />
        <RewardStore
          rewards={rewards}
          onRedeemClick={handleRedeemClick}
          onEditReward={(r) => setEditingReward(r)}
          onDeleteReward={onDeleteReward}
          clientMode={clientMode}
        />
      </div>

      <RedeemModal
        isOpen={Boolean(redeemingReward)}
        reward={redeemingReward}
        members={members}
        targetMember={redeemTargetMember}
        setTargetMember={setRedeemTargetMember}
        message={redeemMessage}
        onConfirm={confirmRedeem}
        onClose={() => setRedeemingReward(null)}
      />

      <MemberManagerModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={members}
        onCreated={onRefresh}
        onUpdated={onRefresh}
        onDeleted={onRefresh}
      />

      <AddChoreModal isOpen={isChoreModalOpen} onClose={() => setIsChoreModalOpen(false)} members={members} onCreated={onRefresh} />
      <EditChoreModal isOpen={Boolean(editingChore)} chore={editingChore} members={members} onSave={onEditChore} onClose={() => setEditingChore(null)} />

      <AddRewardModal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} onCreated={onRefresh} />
      <EditRewardModal isOpen={Boolean(editingReward)} reward={editingReward} onSave={onEditReward} onClose={() => setEditingReward(null)} />
    </div>
  );
}
