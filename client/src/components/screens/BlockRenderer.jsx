import React from 'react';
import CalendarView from '../CalendarView';
import ChoreList from '../chores/ChoreList';
import RewardStore from '../chores/RewardStore';
import { ClockWeatherBlock } from './widgets/ClockWeatherBlock';
import { QuoteNotesBlock } from './widgets/QuoteNotesBlock';
import { TextBlock } from './widgets/TextBlock';
import { CalendarAgendaBlock } from './widgets/CalendarAgendaBlock';
import { DailyFactsBlock } from './widgets/DailyFactsBlock';
import { WeatherForecastBlock } from './widgets/WeatherForecastBlock';
import { HourlyWeatherBlock } from './widgets/HourlyWeatherBlock';
import { RadarBlock } from './widgets/RadarBlock';
import {
  wsTile as WsTile,
  wsWS as WsWS,
  wxGUI as WxGUI,
  rwRV as RwRV,
  rwWindy as RwWindy
} from './widgets/fdwKit';
import { PhotoFrameBlock } from './widgets/PhotoFrameBlock';
import { DateBlock } from './widgets/DateBlock';
import { TodayButtonBlock } from './widgets/TodayButtonBlock';
import { CalendarLegendBlock } from './widgets/CalendarLegendBlock';
import { HaClimateBlock } from './widgets/HaClimateBlock';
import { HaLightBlock } from './widgets/HaLightBlock';
import { HaSensorBlock } from './widgets/HaSensorBlock';
import { HaMediaBlock } from './widgets/HaMediaBlock';
import { HaScriptBlock } from './widgets/HaScriptBlock';
import { HaDevicesBlock } from './widgets/HaDevicesBlock';
import { FONT_CLASSES } from './fonts';
import { getBlockBackgroundStyle } from './backgrounds';

export default function BlockRenderer({ 
  block, events, feeds, members, chores, rewards, onToggleChore, onEditChore, onDeleteChore, onRedeemReward, onEditReward, onDeleteReward, clientMode 
}) {
  const type = block.type;
  const config = block.config || {};

  const fontFamilyClass = FONT_CLASSES[config.fontFamily] || FONT_CLASSES.default;

  // Custom background (image or color) takes precedence over bgOpacity presets
  const customBg = getBlockBackgroundStyle(config);

  let opacityBg;
  if (customBg) {
    opacityBg = 'border-slate-700/60';
  } else if (config.bgOpacity === 'solid') {
    opacityBg = 'bg-slate-900 border-slate-700 shadow-xl';
  } else if (config.bgOpacity === 'transparent') {
    opacityBg = 'bg-transparent border-slate-800/60';
  } else {
    opacityBg = 'bg-slate-900/70 backdrop-blur border-slate-800';
  }

  const containerStyle = `${fontFamilyClass} ${opacityBg} rounded-2xl border overflow-hidden h-full w-full flex flex-col`;
  const containerBg = customBg || undefined;

  switch (type) {
    case 'calendar_month':
      return (
        <div className={containerStyle} style={containerBg}>
          <CalendarView
            events={events}
            feeds={feeds}
            onRefreshEvents={() => {}}
            onAddFeed={() => {}}
            onEditFeed={() => {}}
            onDeleteFeed={() => {}}
            onDeleteEvent={() => {}}
            clientMode={clientMode}
            viewMode={config.viewMode || 'month'}
            rollingWeeks={config.rollingWeeks || 4}
            fontFamilyClass={fontFamilyClass}
            dateFontSize={config.dateFontSize || 'sm'}
            eventFontSize={config.eventFontSize || 'sm'}
            headerFontSize={config.headerFontSize || 'lg'}
          />
        </div>
      );

    case 'chores_list':
      return (
        <div className={containerStyle} style={containerBg}>
          <ChoreList
            chores={chores}
            members={members}
            onToggleChore={onToggleChore}
            onEditChore={onEditChore}
            onDeleteChore={onDeleteChore}
            clientMode={clientMode}
            fontSize={config.fontSize}
            embedded
          />
        </div>
      );

    case 'reward_store':
      return (
        <div className={containerStyle} style={containerBg}>
          <RewardStore
            rewards={rewards}
            onRedeemClick={onRedeemReward}
            onEditReward={onEditReward}
            onDeleteReward={onDeleteReward}
            clientMode={clientMode}
            fontSize={config.fontSize}
            embedded
          />
        </div>
      );

    case 'chores_tracker':
      return (
        <div className={`${containerStyle} p-3 gap-3`} style={containerBg}>
          <ChoreList
            chores={chores}
            members={members}
            onToggleChore={onToggleChore}
            onEditChore={onEditChore}
            onDeleteChore={onDeleteChore}
            clientMode={clientMode}
            fontSize={config.fontSize}
          />
          {config.showRewards !== false && (
            <RewardStore
              rewards={rewards}
              onRedeemClick={onRedeemReward}
              onEditReward={onEditReward}
              onDeleteReward={onDeleteReward}
              clientMode={clientMode}
              fontSize={config.fontSize}
            />
          )}
        </div>
      );

    case 'clock_weather':
      return (
        <div className={containerStyle} style={containerBg}>
          <ClockWeatherBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'quote_notes':
      return (
        <div className={containerStyle} style={containerBg}>
          <QuoteNotesBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'text':
      return (
        <div className={config.bgOpacity === 'transparent' ? 'h-full w-full flex items-center justify-center' : containerStyle} style={containerBg}>
          <TextBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'calendar_agenda':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <CalendarAgendaBlock config={config} events={events} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'dailyfacts':
      return (
        <div className={containerStyle} style={containerBg}>
          <DailyFactsBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'radar_windy':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <RwWindy config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'radar_rainviewer':
      return (
        <div className={containerStyle} style={containerBg}>
          <RwRV config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'radar_block':
      return (
        <div className={`${containerStyle} p-1`} style={containerBg}>
          <RadarBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_current':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="current" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_baro':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="baro" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_wind':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="wind" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_solar':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="solar" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_outdoor':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="outdoor" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_indoor':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="indoor" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_today':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="today" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_clock':
      return (
        <div className={`${containerStyle} p-0`} style={containerBg}>
          <WsTile config={config} kind="clock" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ws_alerts':
      return (
        <div className={`${containerStyle} p-0.5`} style={containerBg}>
          <WsTile config={config} kind="alerts" fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'weather_gui':
      return (
        <div className={containerStyle} style={containerBg}>
          <WxGUI config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'weather_station':
      return (
        <div className={`${containerStyle} p-1`} style={containerBg}>
          <WsWS config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'hourly_weather':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <HourlyWeatherBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'weather_forecast':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <WeatherForecastBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'photo_embed':
      return <PhotoFrameBlock config={config} />;

    case 'iframe_embed':
      return (
        <div className="h-full w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
          <iframe
            src={config.url || 'https://www.wikipedia.org'}
            className="w-full h-full border-0"
            title="External Embed"
          />
        </div>
      );

    case 'date_block':
      return (
        <div className={containerStyle} style={containerBg}>
          <DateBlock config={config} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'today_button':
      return <TodayButtonBlock config={config} fontFamilyClass={fontFamilyClass} />;

    case 'calendar_legend':
      return (
        <div className={containerStyle} style={containerBg}>
          <CalendarLegendBlock config={config} feeds={feeds} fontFamilyClass={fontFamilyClass} />
        </div>
      );

    case 'ha_climate':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <HaClimateBlock config={config} clientMode={clientMode} />
        </div>
      );

    case 'ha_light':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <HaLightBlock config={config} clientMode={clientMode} />
        </div>
      );

    case 'ha_sensor':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <HaSensorBlock config={config} clientMode={clientMode} />
        </div>
      );

    case 'ha_media':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <HaMediaBlock config={config} clientMode={clientMode} />
        </div>
      );

    case 'ha_script':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <HaScriptBlock config={config} clientMode={clientMode} />
        </div>
      );

    case 'ha_devices':
      return (
        <div className={`${containerStyle} p-2`} style={containerBg}>
          <HaDevicesBlock config={config} clientMode={clientMode} />
        </div>
      );

    default:
      return (
        <div className="h-full w-full flex items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          Widget: {type}
        </div>
      );
  }
}
