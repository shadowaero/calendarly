import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import BlocksCanvas from '../screens/BlocksCanvas';
import { getBackgroundStyle } from '../screens/backgrounds';

// How long the auto-rotation loop stays paused after the last touch/pointer
// interaction, so users can tap buttons, fill forms, or use the on-screen
// keyboard without the screen changing under them.
const LOOP_RESUME_DELAY_MS = 30000;

export default function DisplayEndpointViewer({
  slug,
  screens,
  loops,
  displays,
  events,
  feeds,
  members,
  chores,
  rewards,
  onToggleChore,
  onEditChore,
  onDeleteChore,
  onRedeemReward,
  onEditReward,
  onDeleteReward
}) {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [loopPaused, setLoopPaused] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const resumeTimerRef = useRef(null);

  const display = displays.find(d => d.slug === slug) || {
    name: 'Hardware Display',
    assigned_type: 'screen',
    assigned_id: screens[0]?.id,
    client_mode: 'display'
  };

  const isLoop = display.assigned_type === 'loop';
  const assignedLoop = isLoop ? loops.find(l => l.id === display.assigned_id) : null;
  const loopScreenIds = assignedLoop?.screen_ids || [];

  let activeScreen = null;
  if (isLoop && loopScreenIds.length > 0) {
    const targetId = loopScreenIds[currentScreenIndex % loopScreenIds.length];
    activeScreen = screens.find(s => s.id === targetId) || screens[0];
  } else {
    activeScreen = screens.find(s => s.id === display.assigned_id) || screens[0];
  }

  const loopScreenIdsKey = loopScreenIds.join(',');
  const intervalSec = assignedLoop?.interval_seconds || 30;

  // Pause auto-rotation on any touch/pointer interaction, and resume a fixed
  // delay after the last interaction. This lets users tap buttons, fill forms,
  // and use the on-screen keyboard without the screen changing under them.
  const registerInteraction = useCallback(() => {
    if (!isLoop || loopScreenIds.length <= 1) return;
    setLoopPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setLoopPaused(false), LOOP_RESUME_DELAY_MS);
  }, [isLoop, loopScreenIds.length]);

  // Auto rotation interval (skipped while paused)
  useEffect(() => {
    if (!isLoop || loopScreenIds.length <= 1 || loopPaused) return;
    const timer = setInterval(() => {
      setCurrentScreenIndex((prev) => (prev + 1) % loopScreenIds.length);
    }, Math.max(2, intervalSec) * 1000);

    return () => clearInterval(timer);
  }, [isLoop, loopScreenIdsKey, intervalSec, loopScreenIds.length, currentScreenIndex, loopPaused]);

  // Listen globally (capture phase) so touches anywhere — including modals and
  // the on-screen keyboard, which render outside this component — pause the loop.
  useEffect(() => {
    if (!isLoop || loopScreenIds.length <= 1) return;
    const onInteract = () => registerInteraction();
    document.addEventListener('pointerdown', onInteract, { capture: true });
    document.addEventListener('touchstart', onInteract, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', onInteract, { capture: true });
      document.removeEventListener('touchstart', onInteract, { capture: true });
    };
  }, [isLoop, loopScreenIds.length, registerInteraction]);

  // Clear any pending resume timer on unmount
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Touch Swipe Handlers for manual screen switching
  const handleTouchStart = (e) => {
    if (!isLoop || loopScreenIds.length <= 1) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (!isLoop || loopScreenIds.length <= 1) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Must be a decisive horizontal swipe within 600ms
    if (deltaTime < 600 && Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swipe Left -> Next Screen
        setCurrentScreenIndex((prev) => (prev + 1) % loopScreenIds.length);
        setShowSwipeHint(true);
        setTimeout(() => setShowSwipeHint(false), 800);
      } else {
        // Swipe Right -> Previous Screen
        setCurrentScreenIndex((prev) => (prev - 1 + loopScreenIds.length) % loopScreenIds.length);
        setShowSwipeHint(true);
        setTimeout(() => setShowSwipeHint(false), 800);
      }
    }
  };

  if (!activeScreen) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-400">
        No active screen assigned to display endpoint: {slug}
      </div>
    );
  }

  const bgStyle = getBackgroundStyle(activeScreen.background_type, activeScreen.background_value);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden select-none touch-pan-y"
      style={bgStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <BlocksCanvas
        key={activeScreen.id || currentScreenIndex}
        blocks={activeScreen.blocks || []}
        orientation={activeScreen.orientation || 'landscape'}
        backgroundType={activeScreen.background_type || 'color'}
        backgroundValue={activeScreen.background_value || '#090D16'}
        events={events}
        feeds={feeds}
        members={members}
        chores={chores}
        rewards={rewards}
        onToggleChore={onToggleChore}
        onEditChore={onEditChore}
        onDeleteChore={onDeleteChore}
        onRedeemReward={onRedeemReward}
        onEditReward={onEditReward}
        onDeleteReward={onDeleteReward}
        clientMode={display.client_mode || 'display'}
      />

      {/* Touch Screen Loop Indicators & Navigation Buttons */}
      {isLoop && loopScreenIds.length > 1 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setCurrentScreenIndex((prev) => (prev - 1 + loopScreenIds.length) % loopScreenIds.length)}
            className="p-1 hover:bg-white/20 rounded-full text-white/80 active:scale-90 transition"
            title="Previous Screen"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex gap-1.5 items-center px-1">
            {loopScreenIds.map((id, idx) => (
              <button
                key={id + '_' + idx}
                type="button"
                onClick={() => setCurrentScreenIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === (currentScreenIndex % loopScreenIds.length)
                    ? 'w-4 h-1.5 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentScreenIndex((prev) => (prev + 1) % loopScreenIds.length)}
            className="p-1 hover:bg-white/20 rounded-full text-white/80 active:scale-90 transition"
            title="Next Screen"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Lock Button */}
      <a
        href="/admin"
        title="Admin"
        className="absolute bottom-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/60 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <Lock className="w-4 h-4" />
      </a>
    </div>
  );
}
