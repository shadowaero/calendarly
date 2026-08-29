import React, { useState, useEffect } from 'react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

// Photo frame / slideshow. Supports a single photo (config.url) or
// multiple photos (config.photos) with a rotation interval.
// Features:
// - fitMode: 'contain' (shrink photo to fit block) or 'cover' (crop to fill block)
// - cropPosition: 'center' | 'top' | 'bottom' | 'left' | 'right'
// - blurBackground: boolean (show blurred version behind if letterboxed / wasted space)
export function PhotoFrameBlock({ config = {} }) {
  const rawPhotos = Array.isArray(config.photos) && config.photos.length > 0
    ? config.photos
    : (config.url ? [config.url] : []);

  const photos = rawPhotos.map((p) => (typeof p === 'string' ? { url: p } : p));
  const interval = Math.max(2, Number(config.intervalSeconds) || 30) * 1000;
  const [index, setIndex] = useState(0);

  // Backward compatibility: if crop is explicitly false, default to 'contain', otherwise check fitMode or crop
  const fitMode = config.fitMode || (config.crop === false ? 'contain' : (config.crop === true || config.crop === '1' ? 'cover' : 'contain'));
  const blurBackground = config.blurBackground !== undefined 
    ? Boolean(config.blurBackground) 
    : (fitMode === 'contain'); // default blur on for contain mode so wasted space is filled
  const cropPosition = config.cropPosition || 'center';
  const captionPt = resolveFontSizePt(config.fontSize, 9);

  useEffect(() => {
    if (photos.length <= 1) return;
    setIndex(0);
    const t = setInterval(() => setIndex((i) => (i + 1) % photos.length), interval);
    return () => clearInterval(t);
  }, [photos.length, interval]);

  if (photos.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
        No photos selected
      </div>
    );
  }

  const current = photos[index % photos.length];

  const POSITION_CLASSES = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right'
  };
  const positionClass = POSITION_CLASSES[cropPosition] || 'object-center';

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden relative bg-slate-950 flex items-center justify-center select-none">
      {/* Blurred background layer when enabled */}
      {blurBackground && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={current.url}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover scale-110 blur-xl opacity-60 brightness-75 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Main Foreground Photo */}
      <img
        src={current.url}
        alt={current.caption || config.caption || 'Photo'}
        className={`relative z-10 w-full h-full transition-all duration-500 ${
          fitMode === 'cover' ? 'object-cover' : 'object-contain'
        } ${positionClass} rounded-2xl`}
      />

      {/* Caption overlay */}
      {(config.caption || current.caption) && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg font-semibold text-white shadow-lg" style={fontSizeStyle(captionPt)}>
          {current.caption || config.caption}
        </div>
      )}

      {/* Multi-photo indicator dots */}
      {photos.length > 1 && (
        <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-1 rounded-full">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index % photos.length ? 'bg-white scale-125' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

