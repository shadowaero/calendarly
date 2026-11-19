import React, { useState, useRef, useEffect } from 'react';
import { Calendar, CheckCircle2, Sparkles, Layout, Monitor, Database, Lock, LogOut, KeyRound, Settings, ChevronDown } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import AISettingsModal from './ai/AISettingsModal';

export default function Header({ activeTab, setActiveTab, clientMode, isAdmin, onLogout }) {
  const [time, setTime] = useState(new Date());
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target)) {
        setShowSettingsMenu(false);
      }
    };
    if (showSettingsMenu) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [showSettingsMenu]);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 shrink-0">
      <div className="flex items-center gap-6">

        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            FAMILY HQ
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {clientMode === 'display' ? 'Display Station' : 'Command Center'}
          </p>
        </div>

        {clientMode !== 'display' && (
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 ml-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('chores')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'chores' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Chores
            </button>
            <button
              onClick={() => setActiveTab('combined')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'combined' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Split View
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('screens')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'screens' ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Layout className="w-3.5 h-3.5" />
                Screens Studio
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('displays')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'displays' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Displays & Loops
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('backup')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'backup' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Database className="w-3.5 h-3.5" />
                Backup
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {clientMode !== 'display' && (
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                {/* Admin Settings Dropdown Menu */}
                <div className="relative" ref={settingsMenuRef}>
                  <button
                    onClick={() => setShowSettingsMenu(prev => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      showSettingsMenu
                        ? 'bg-slate-700 text-white border-slate-600 shadow-md'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                    }`}
                    title="Settings"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-300" />
                    <span>Settings</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showSettingsMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showSettingsMenu && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 flex flex-col gap-0.5 animate-fadeIn">
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          setShowAIModal(true);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-purple-300 flex items-center gap-2.5 transition"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <div className="font-bold">AI Provider</div>
                          <div className="text-[10px] text-slate-400 font-normal">LLM keys & local presets</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          setShowPasswordModal(true);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-300 flex items-center gap-2.5 transition border-t border-slate-800/80"
                      >
                        <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold">Admin Password</div>
                          <div className="text-[10px] text-slate-400 font-normal">Change access credentials</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg text-xs font-bold border border-slate-700/80 transition"
                  title="Log out of admin session"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { window.location.href = '/admin'; }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 hover:text-white"
              >
                <Lock className="w-3.5 h-3.5" /> Admin
              </button>
            )}
          </div>
        )}
        <div className="text-right pl-2 border-l border-slate-800/80">
          <div className="text-2xl font-extrabold tracking-tight text-white font-mono">
            {formattedTime}
          </div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {formattedDate}
          </div>
        </div>
      </div>


      <AISettingsModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </header>
  );
}
