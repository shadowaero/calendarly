import React from 'react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

export function TodayButtonBlock({ config = {}, fontFamilyClass }) {
  const label = config.label || 'Today';
  const pt = resolveFontSizePt(config.fontSize, 11);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('calendar:goToday'));
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <button
        onClick={handleClick}
        className={`px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg ${fontFamilyClass}`}
        style={fontSizeStyle(pt)}
      >
        {label}
      </button>
    </div>
  );
}
