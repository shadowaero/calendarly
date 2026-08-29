import React, { useState } from 'react';
import { X, RefreshCw, Globe } from 'lucide-react';
import EditFeedModal from './feeds/EditFeedModal';
import GoogleAuthPanel from './feeds/GoogleAuthPanel';
import AddFeedForm from './feeds/AddFeedForm';
import FeedList from './feeds/FeedList';

export default function FeedManagerModal({ 
  isOpen, onClose, feeds, onRefreshFeeds, onAddFeed, onEditFeed, onDeleteFeed 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);

  if (!isOpen) return null;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshFeeds();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[88vh] text-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" /> Calendar Feeds & Integrations
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <GoogleAuthPanel onUpdated={onRefreshFeeds} />
          <AddFeedForm onAddFeed={onAddFeed} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Calendar Feeds ({feeds.length})</h3>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 text-xs text-blue-400 font-bold bg-blue-950/40 px-2 py-1 rounded border border-blue-900/50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync
              </button>
            </div>

            <FeedList
              feeds={feeds}
              onEdit={(feed) => setEditingFeed(feed)}
              onDelete={onDeleteFeed}
            />
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl">
            Done
          </button>
        </div>
      </div>

      <EditFeedModal
        isOpen={Boolean(editingFeed)}
        feed={editingFeed}
        onSave={onEditFeed}
        onClose={() => setEditingFeed(null)}
      />
    </div>
  );
}
