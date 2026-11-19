import React, { useState } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, eachDayOfInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Globe } from 'lucide-react';
import DayOverflowModal from './DayOverflowModal';
import { resolveFontSizePt, fontSizeStyle } from './screens/fonts';
import CreateEventModal from './CreateEventModal';
import FeedManagerModal from './FeedManagerModal';

export default function CalendarView({
  events,
  feeds,
  onRefreshEvents,
  onAddFeed,
  onEditFeed,
  onDeleteFeed,
  onDeleteEvent,
  clientMode,
  isAdmin = false,
  viewMode = 'month',
  rollingWeeks = 4,
  fontFamilyClass,
  dateFontSize = 'sm',
  eventFontSize = 'sm',
  headerFontSize = 'lg'
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [targetCreateDate, setTargetCreateDate] = useState(null);

  const isRolling = viewMode === 'rolling';
  const numWeeks = Math.min(Math.max(Number(rollingWeeks) || 4, 2), 5);

  const prevPeriod = () => {
    if (isRolling) {
      setCurrentDate(subWeeks(currentDate, numWeeks));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const nextPeriod = () => {
    if (isRolling) {
      setCurrentDate(addWeeks(currentDate, numWeeks));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  React.useEffect(() => {
    const handler = () => setCurrentDate(new Date());
    window.addEventListener('calendar:goToday', handler);
    return () => window.removeEventListener('calendar:goToday', handler);
  }, []);

  let days = [];
  let headerTitle = '';

  if (isRolling) {
    const start = startOfWeek(currentDate);
    const end = addDays(start, numWeeks * 7 - 1);
    days = eachDayOfInterval({ start, end });
    const startMonth = format(start, 'MMM yyyy');
    const endMonth = format(end, 'MMM yyyy');
    headerTitle = startMonth === endMonth ? startMonth : `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
  } else {
    const monthStart = startOfMonth(currentDate);
    days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
    headerTitle = format(currentDate, 'MMMM yyyy');
  }

  const getEventsForDay = (day) => events.filter(ev => {
    try { return isSameDay(parseISO(ev.start_time), day); } catch (e) { return false; }
  });

  const datePt = resolveFontSizePt(dateFontSize, 9);
  const eventPt = resolveFontSizePt(eventFontSize, 8);
  const headerPt = resolveFontSizePt(headerFontSize, 18);

  return (
    <div className={`flex flex-col h-full bg-slate-950 p-4 overflow-hidden ${fontFamilyClass || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-black text-white" style={fontSizeStyle(headerPt)}>{headerTitle}</h2>
          <div className="flex items-center bg-slate-800 rounded-xl p-1">
            <button onClick={prevPeriod} className="p-1 hover:bg-slate-700 text-slate-300 rounded"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={goToToday} className="px-2.5 py-1 text-xs font-bold text-slate-200">Today</button>
            <button onClick={nextPeriod} className="p-1 hover:bg-slate-700 text-slate-300 rounded"><ChevronRight className="w-5 h-5" /></button>
          </div>
          {isRolling && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
              {numWeeks} WEEKS
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setIsFeedModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl font-bold text-xs border border-slate-700">
              <Globe className="w-4 h-4 text-blue-400" /> Feeds ({feeds?.length || 0})
            </button>
          )}
          {clientMode !== 'display' && (
            <button onClick={() => { setTargetCreateDate(format(new Date(), 'yyyy-MM-dd')); setIsCreateModalOpen(true); }} className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="font-black text-slate-400" style={fontSizeStyle(datePt, 0.85)}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr min-h-0">
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonthDay = isRolling ? true : isSameMonth(day, currentDate);
          const overflowCount = dayEvents.length - 2;

          return (
            <div
              key={day.toISOString()}
              onClick={() => { setSelectedDate(day); setIsDayModalOpen(true); }}
              className={`flex flex-col rounded-xl p-1.5 border relative cursor-pointer overflow-hidden ${isToday ? 'bg-slate-900 border-blue-500 ring-1 ring-blue-500' : isCurrentMonthDay ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-40'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className={`font-black flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' : 'text-slate-200'}`} style={{ ...fontSizeStyle(datePt), width: Math.round(datePt * 1.6) + 'pt', height: Math.round(datePt * 1.6) + 'pt' }}>
                    {format(day, 'd')}
                  </span>
                  {isRolling && format(day, 'd') === '1' && (
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {format(day, 'MMM')}
                    </span>
                  )}
                </div>
                {clientMode !== 'display' && (
                  <button onClick={(e) => { e.stopPropagation(); setTargetCreateDate(format(day, 'yyyy-MM-dd')); setIsCreateModalOpen(true); }} className="p-0.5 text-slate-400 hover:text-white">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 2).map(ev => (
                  <div key={ev.id} className="font-bold rounded truncate text-white" style={{ backgroundColor: ev.color || '#3B82F6', ...fontSizeStyle(eventPt) }}>
                    {ev.title}
                  </div>
                ))}
                {overflowCount > 0 && (
                  <span className="font-black px-1.5 py-0.2 bg-slate-800 text-blue-400 rounded border border-slate-700 w-max" style={fontSizeStyle(eventPt, 0.85)}>
                    +{overflowCount} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DayOverflowModal isOpen={isDayModalOpen} onClose={() => setIsDayModalOpen(false)} date={selectedDate} events={selectedDate ? getEventsForDay(selectedDate) : []} onDeleteEvent={onDeleteEvent} />
      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreated={onRefreshEvents} initialDate={targetCreateDate} />
      <FeedManagerModal isOpen={isFeedModalOpen} onClose={() => setIsFeedModalOpen(false)} feeds={feeds || []} onRefreshFeeds={onRefreshEvents} onAddFeed={onAddFeed} onEditFeed={onEditFeed} onDeleteFeed={onDeleteFeed} />
    </div>
  );
}
