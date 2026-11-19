export const DAKBOARD_TEMPLATES = [
  {
    id: 'chalkboard_family',
    name: 'Chalkboard Family HQ',
    category: 'Chalkboard',
    orientation: 'landscape',
    resolution: '1080p',
    description: 'Classic green chalkboard layout with title, agenda sidebar, and full month calendar.',
    background_type: 'color',
    background_value: '#2a9313',
    custom_css: "@import url('https://fonts.googleapis.com/css?family=Walter+Turncoat&display=swap');\n#screen-root { font-family: 'Walter Turncoat', cursive; }",
    blocks: [
      {
        type: 'text',
        x_percent: 31,
        y_percent: 1,
        w_percent: 67,
        h_percent: 7,
        config: { text: 'SCHOOL / FAMILY CALENDAR', fontFamily: 'walter', fontSize: 'lg', color: 'light' }
      },
      {
        type: 'clock_weather',
        x_percent: 1,
        y_percent: 1,
        w_percent: 28,
        h_percent: 14,
        config: { showSeconds: true, dateFormat: 'MMMM D', fontFamily: 'walter', bgOpacity: 'transparent' }
      },
      {
        type: 'calendar_agenda',
        x_percent: 1,
        y_percent: 16,
        w_percent: 28,
        h_percent: 82,
        config: { limit: 7, fontFamily: 'walter', bgOpacity: 'transparent' }
      },
      {
        type: 'calendar_month',
        x_percent: 30,
        y_percent: 9,
        w_percent: 69,
        h_percent: 74,
        config: { fontFamily: 'walter', bgOpacity: 'transparent' }
      },
      {
        type: 'calendar_legend',
        x_percent: 30,
        y_percent: 84,
        w_percent: 69,
        h_percent: 7,
        config: { fontFamily: 'walter', bgOpacity: 'transparent' }
      },
      {
        type: 'dailyfacts',
        x_percent: 30,
        y_percent: 91,
        w_percent: 69,
        h_percent: 8,
        config: { fontFamily: 'walter', bgOpacity: 'transparent' }
      }
    ]
  },
  {
    id: 'modern_split_hq',
    name: 'Modern Family Split HQ',
    category: 'Family',
    orientation: 'landscape',
    resolution: '1080p',
    description: 'Clean side-by-side layout: calendar, active chores tracker, and reward store.',
    background_type: 'color',
    background_value: '#090D16',
    custom_css: '',
    blocks: [
      {
        type: 'calendar_month',
        x_percent: 1,
        y_percent: 1,
        w_percent: 59,
        h_percent: 98,
        config: { fontFamily: 'outfit', bgOpacity: 'blur', showHeader: true }
      },
      {
        type: 'chores_tracker',
        x_percent: 61,
        y_percent: 1,
        w_percent: 38,
        h_percent: 98,
        config: { showRewards: true, fontFamily: 'outfit', bgOpacity: 'blur' }
      }
    ]
  },
  {
    id: 'morning_command',
    name: 'Morning Routine & Weather',
    category: 'Minimal',
    orientation: 'landscape',
    resolution: '1080p',
    description: 'Focus dashboard with weather forecast, motivational notes, and family schedule.',
    background_type: 'pattern',
    background_value: 'grid',
    custom_css: '',
    blocks: [
      {
        type: 'clock_weather',
        x_percent: 1,
        y_percent: 1,
        w_percent: 32,
        h_percent: 30,
        config: { location: 'Home', showSeconds: true, fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'weather_forecast',
        x_percent: 1,
        y_percent: 32,
        w_percent: 32,
        h_percent: 35,
        config: { fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'quote_notes',
        x_percent: 1,
        y_percent: 68,
        w_percent: 32,
        h_percent: 31,
        config: { fontFamily: 'kalam', bgOpacity: 'blur' }
      },
      {
        type: 'calendar_month',
        x_percent: 34,
        y_percent: 1,
        w_percent: 65,
        h_percent: 98,
        config: { fontFamily: 'outfit', bgOpacity: 'blur' }
      }
    ]
  },
  {
    id: 'photo_hub',
    name: 'Photo Frame & Schedule',
    category: 'Photo',
    orientation: 'landscape',
    resolution: '1080p',
    description: 'Ambient family photo frame alongside live agenda and weather widget.',
    background_type: 'color',
    background_value: '#080C14',
    custom_css: '',
    blocks: [
      {
        type: 'photo_embed',
        x_percent: 1,
        y_percent: 1,
        w_percent: 65,
        h_percent: 98,
        config: { caption: 'Family Memories', crop: true }
      },
      {
        type: 'clock_weather',
        x_percent: 67,
        y_percent: 1,
        w_percent: 32,
        h_percent: 28,
        config: { fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'calendar_agenda',
        x_percent: 67,
        y_percent: 30,
        w_percent: 32,
        h_percent: 44,
        config: { limit: 6, fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'dailyfacts',
        x_percent: 67,
        y_percent: 75,
        w_percent: 32,
        h_percent: 24,
        config: { fontFamily: 'outfit', bgOpacity: 'blur' }
      }
    ]
  },
  {
    id: 'portrait_wall_planner',
    name: 'Portrait Wall Planner',
    category: 'Portrait',
    orientation: 'portrait',
    resolution: '1080p',
    description: 'Vertical wall display optimized for 9:16 displays with stacked calendar and chore list.',
    background_type: 'color',
    background_value: '#090D16',
    custom_css: '',
    blocks: [
      {
        type: 'clock_weather',
        x_percent: 2,
        y_percent: 1,
        w_percent: 96,
        h_percent: 12,
        config: { showSeconds: true, fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'calendar_month',
        x_percent: 2,
        y_percent: 14,
        w_percent: 96,
        h_percent: 48,
        config: { fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'chores_tracker',
        x_percent: 2,
        y_percent: 63,
        w_percent: 96,
        h_percent: 35,
        config: { showRewards: true, fontFamily: 'outfit', bgOpacity: 'blur' }
      }
    ]
  },
  {
    id: 'portrait_agenda_daily',
    name: 'Portrait Agenda & Focus',
    category: 'Portrait',
    orientation: 'portrait',
    resolution: '1080p',
    description: 'Vertical daily routine with high-contrast upcoming schedule and daily facts.',
    background_type: 'pattern',
    background_value: 'dots',
    custom_css: '',
    blocks: [
      {
        type: 'clock_weather',
        x_percent: 2,
        y_percent: 1,
        w_percent: 96,
        h_percent: 14,
        config: { showSeconds: true, fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'calendar_agenda',
        x_percent: 2,
        y_percent: 16,
        w_percent: 96,
        h_percent: 48,
        config: { limit: 10, fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'weather_forecast',
        x_percent: 2,
        y_percent: 65,
        w_percent: 96,
        h_percent: 20,
        config: { fontFamily: 'outfit', bgOpacity: 'blur' }
      },
      {
        type: 'dailyfacts',
        x_percent: 2,
        y_percent: 86,
        w_percent: 96,
        h_percent: 13,
        config: { fontFamily: 'outfit', bgOpacity: 'blur' }
      }
    ]
  },
  {
    id: 'minimal_calendar_grid',
    name: 'Full Calendar Grid',
    category: 'Minimal',
    orientation: 'landscape',
    resolution: '1080p',
    description: 'Clean full-screen monthly calendar grid for high-visibility ambient viewing.',
    background_type: 'color',
    background_value: '#0A0F1D',
    custom_css: '',
    blocks: [
      {
        type: 'calendar_month',
        x_percent: 1,
        y_percent: 1,
        w_percent: 98,
        h_percent: 98,
        config: { fontFamily: 'outfit', bgOpacity: 'blur', showHeader: true }
      }
    ]
  }
];

export function getTemplateById(templateId) {
  return DAKBOARD_TEMPLATES.find(t => t.id === templateId) || null;
}
