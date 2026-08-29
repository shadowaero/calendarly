import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import ChoreRewardDashboard from './components/ChoreRewardDashboard';
import ScreensManager from './components/screens/ScreensManager';
import DisplaysManager from './components/displays/DisplaysManager';
import DisplayEndpointViewer from './components/displays/DisplayEndpointViewer';
import PairingScreen from './components/pairing/PairingScreen';
import BackupManager from './components/BackupManager';
import AdminLogin from './components/AdminLogin';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [members, setMembers] = useState([]);
  const [chores, setChores] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [activity, setActivity] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loops, setLoops] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [displays, setDisplays] = useState([]);
  const [displaySlug, setDisplaySlug] = useState(null);
  const [deviceDisplay, setDeviceDisplay] = useState(null);
  const [isDeviceEndpoint, setIsDeviceEndpoint] = useState(false);
  const [clientMode, setClientMode] = useState('touch');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  const checkDevicePairing = useCallback(async () => {
    const token = localStorage.getItem('family_dashboard_device_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/displays/device/${token}`);
      if (res.ok) {
        const data = await res.json();
        setDeviceDisplay(data.paired ? data.display : null);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/display\/([a-zA-Z0-9-_]+)/);
    const params = new URLSearchParams(window.location.search);
    const displayParam = params.get('display');

    if (path === '/admin' || path.startsWith('/admin')) {
      setIsAdminRoute(true);
      return;
    }

    if (match && match[1]) {
      setDisplaySlug(match[1]);
    } else if (displayParam) {
      setDisplaySlug(displayParam);
    } else if (path === '/pair' || path === '/kiosk' || params.get('mode') === 'display' || params.get('kiosk') === '1' || params.get('pair') === '1') {
      setIsDeviceEndpoint(true);
      checkDevicePairing();
    }
  }, [checkDevicePairing]);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.authenticated === true))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [evRes, feedRes, memRes, choreRes, rewRes, actRes, scRes, lpRes, schRes, dpRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/feeds'),
        fetch('/api/members'),
        fetch('/api/chores'),
        fetch('/api/rewards'),
        fetch('/api/activity'),
        fetch('/api/screens'),
        fetch('/api/loops'),
        fetch('/api/schedules'),
        fetch('/api/displays')
      ]);

      if (evRes.ok) setEvents((await evRes.json()).events || []);
      if (feedRes.ok) setFeeds(await feedRes.json());
      if (memRes.ok) setMembers(await memRes.json());
      if (choreRes.ok) setChores(await choreRes.json());
      if (rewRes.ok) setRewards(await rewRes.json());
      if (actRes.ok) setActivity(await actRes.json());
      if (scRes.ok) setScreens(await scRes.json());
      if (lpRes.ok) setLoops(await lpRes.json());
      if (schRes.ok) setSchedules(await schRes.json());
      if (dpRes.ok) setDisplays(await dpRes.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if ([
            'EVENT_CREATED', 'EVENT_DELETED', 'CALENDAR_SYNCED',
            'CHORE_UPDATED', 'CHORE_CREATED', 'CHORE_DELETED',
            'REWARD_REDEEMED', 'REWARD_CREATED', 'REWARD_DELETED',
            'MEMBER_CREATED', 'MEMBER_UPDATED', 'MEMBER_DELETED',
            'SCREEN_UPDATED', 'SCREEN_DELETED', 'LOOPS_UPDATED', 'DISPLAYS_UPDATED',
            'SCREEN_FORCE_SYNC', 'DISPLAY_RELOAD'
          ].includes(data.type)) {
            fetchData();
          }

          if (data.type === 'DISPLAY_RELOAD') {
            // If targeted or global, re-fetch screen immediately
            fetchData();
          }

          if (data.type === 'DISPLAY_PAIRED') {
            const myToken = localStorage.getItem('family_dashboard_device_token');
            if (data.payload?.device_token === myToken) {
              setDeviceDisplay(data.payload.display);
            }
          }
          if (data.type === 'DISPLAY_UNPAIRED') {
            const myToken = localStorage.getItem('family_dashboard_device_token');
            if (data.payload?.device_token === myToken) {
              setDeviceDisplay(null);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    const poller = setInterval(() => {
      fetchData();
      if (isDeviceEndpoint) checkDevicePairing();
    }, 30000);

    return () => {
      clearInterval(poller);
      if (ws) ws.close();
    };
  }, [fetchData, checkDevicePairing, isDeviceEndpoint]);

  const handleToggleChore = async (choreId, memberId) => {
    try {
      await fetch(`/api/chores/${choreId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditChore = async (choreId, choreData) => {
    await fetch(`/api/chores/${choreId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(choreData)
    });
    fetchData();
  };

  const handleDeleteChore = async (choreId) => {
    if (!confirm('Delete this chore?')) return;
    await fetch(`/api/chores/${choreId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleRedeemReward = async (rewardId, memberId) => {
    try {
      const res = await fetch(`/api/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId })
      });
      const data = await res.json();
      fetchData();
      return data;
    } catch (err) {
      return { error: err.message };
    }
  };

  const handleEditReward = async (rewardId, rewardData) => {
    await fetch(`/api/rewards/${rewardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rewardData)
    });
    fetchData();
  };

  const handleDeleteReward = async (rewardId) => {
    if (!confirm('Delete this reward item?')) return;
    await fetch(`/api/rewards/${rewardId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddFeed = async (feed) => {
    await fetch('/api/feeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feed)
    });
    fetchData();
  };

  const handleEditFeed = async (feedId, updatedData) => {
    await fetch(`/api/feeds/${feedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    fetchData();
  };

  const handleDeleteFeed = async (feedId) => {
    await fetch(`/api/feeds/${feedId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteEvent = async (eventId) => {
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    fetchData();
  };

  const handlePushScreen = async (screenId, displayId = null) => {
    try {
      const res = await fetch(`/api/screens/${screenId}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayId })
      });
      fetchData();
      return await res.json();
    } catch (e) {
      console.error("Push failed", e);
    }
  };

  const handleSaveScreen = async (screenData) => {
    if (screenData.id) {
      await fetch(`/api/screens/${screenData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screenData)
      });
    } else {
      await fetch('/api/screens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screenData)
      });
    }
    fetchData();
  };

  const handleDeleteScreen = async (screenId) => {
    if (!confirm('Delete this screen layout?')) return;
    await fetch(`/api/screens/${screenId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleImportScreen = async (file) => {
    try {
      const text = await file.text();
      const res = await fetch('/api/screens/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: text })
      });
      const data = await res.json();
      if (res.ok) {
        fetchData();
      } else {
        alert('Import failed: ' + (data.error || 'unknown error'));
      }
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };

  const handleSaveDisplay = async (displayData) => {
    if (displayData.id) {
      await fetch(`/api/displays/${displayData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(displayData)
      });
    } else {
      await fetch('/api/displays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(displayData)
      });
    }
    fetchData();
  };

  const handleDeleteDisplay = async (id) => {
    if (!confirm('Remove this display endpoint?')) return;
    await fetch(`/api/displays/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleUnpairDisplay = async (id) => {
    if (!confirm('Unpair device hardware from this display?')) return;
    await fetch(`/api/displays/${id}/unpair`, { method: 'POST' });
    fetchData();
  };

  const handleSaveLoop = async (loopData) => {
    if (loopData.id) {
      await fetch(`/api/loops/${loopData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loopData)
      });
    } else {
      await fetch('/api/loops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loopData)
      });
    }
    fetchData();
  };

  const handleDeleteLoop = async (id) => {
    if (!confirm('Delete this loop?')) return;
    await fetch(`/api/loops/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAdmin(false);
    setActiveTab('calendar');
  };

  if (isAdminRoute) {
    return <AdminLogin />;
  }

  // 1. Direct Slug View (e.g. /display/pi4-touch)
  if (displaySlug) {
    return (
      <DisplayEndpointViewer
        slug={displaySlug}
        screens={screens}
        loops={loops}
        displays={displays}
        events={events}
        feeds={feeds}
        members={members}
        chores={chores}
        rewards={rewards}
        onToggleChore={handleToggleChore}
        onEditChore={handleEditChore}
        onDeleteChore={handleDeleteChore}
        onRedeemReward={handleRedeemReward}
        onEditReward={handleEditReward}
        onDeleteReward={handleDeleteReward}
      />
    );
  }

  // 2. Linked Device Mode (Auto-paired or shows Pairing Screen)
  if (isDeviceEndpoint) {
    if (deviceDisplay) {
      return (
        <DisplayEndpointViewer
          slug={deviceDisplay.slug}
          screens={screens}
          loops={loops}
          displays={displays}
          events={events}
          feeds={feeds}
          members={members}
          chores={chores}
          rewards={rewards}
          onToggleChore={handleToggleChore}
          onEditChore={handleEditChore}
          onDeleteChore={handleDeleteChore}
          onRedeemReward={handleRedeemReward}
          onEditReward={handleEditReward}
          onDeleteReward={handleDeleteReward}
        />
      );
    } else {
      return <PairingScreen onPaired={(disp) => setDeviceDisplay(disp)} />;
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} clientMode={clientMode} isAdmin={isAdmin} onLogout={handleLogout} />

      <main className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            feeds={feeds}
            onRefreshEvents={fetchData}
            onAddFeed={handleAddFeed}
            onEditFeed={handleEditFeed}
            onDeleteFeed={handleDeleteFeed}
            onDeleteEvent={handleDeleteEvent}
            isAdmin={isAdmin}
            clientMode={clientMode}
          />
        )}

        {activeTab === 'chores' && (
          <ChoreRewardDashboard
            members={members}
            chores={chores}
            rewards={rewards}
            activity={activity}
            onToggleChore={handleToggleChore}
            onEditChore={handleEditChore}
            onDeleteChore={handleDeleteChore}
            onRedeemReward={handleRedeemReward}
            onEditReward={handleEditReward}
            onDeleteReward={handleDeleteReward}
            onRefresh={fetchData}
            clientMode={clientMode}
          />
        )}

        {activeTab === 'combined' && (
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-7 h-full border-r border-slate-800 overflow-hidden">
              <CalendarView
                events={events}
                feeds={feeds}
                onRefreshEvents={fetchData}
                onAddFeed={handleAddFeed}
                onEditFeed={handleEditFeed}
                onDeleteFeed={handleDeleteFeed}
                onDeleteEvent={handleDeleteEvent}
            isAdmin={isAdmin}
                clientMode={clientMode}
              />
            </div>
            <div className="col-span-5 h-full overflow-hidden">
              <ChoreRewardDashboard
                members={members}
                chores={chores}
                rewards={rewards}
                activity={activity}
                onToggleChore={handleToggleChore}
                onEditChore={handleEditChore}
                onDeleteChore={handleDeleteChore}
                onRedeemReward={handleRedeemReward}
                onEditReward={handleEditReward}
                onDeleteReward={handleDeleteReward}
                onRefresh={fetchData}
                clientMode={clientMode}
              />
            </div>
          </div>
        )}

        {activeTab === 'screens' && (
          <ScreensManager
            screens={screens}
            displays={displays}
            loops={loops}
            onSaveScreen={handleSaveScreen}
            onDeleteScreen={handleDeleteScreen}
            onImportScreen={handleImportScreen}
            onPushScreen={handlePushScreen}
            events={events}
            feeds={feeds}
            members={members}
            chores={chores}
            rewards={rewards}
            onToggleChore={handleToggleChore}
            onEditChore={handleEditChore}
            onDeleteChore={handleDeleteChore}
            onRedeemReward={handleRedeemReward}
            onEditReward={handleEditReward}
            onDeleteReward={handleDeleteReward}
            clientMode={clientMode}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'displays' && (
          <DisplaysManager
            displays={displays}
            screens={screens}
            loops={loops}
            schedules={schedules}
            onSaveDisplay={handleSaveDisplay}
            onDeleteDisplay={handleDeleteDisplay}
            onUnpairDisplay={handleUnpairDisplay}
            onSaveLoop={handleSaveLoop}
            onDeleteLoop={handleDeleteLoop}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'backup' && (
          <BackupManager onRefresh={fetchData} />
        )}
      </main>
    </div>
  );
}
