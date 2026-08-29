import React, { useState, useEffect } from 'react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

export function DateBlock({ config = {}, fontFamilyClass }) {
  const [now, setNow] = useState(new Date());
  const pt = resolveFontSizePt(config.fontSize, 14);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const showDate = config.showDate !== false;
  const showYear = config.showYear !== false;

  return (
    <div className={`h-full w-full flex flex-col items-center justify-center text-center text-white px-2 ${fontFamilyClass}`}>
      {showDate && (
        <div className="font-bold" style={fontSizeStyle(pt, 1.1)}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      )}
      {showYear && (
        <div className="font-black tracking-tight" style={fontSizeStyle(pt, 2.2)}>{now.getFullYear()}</div>
      )}
    </div>
  );
}
