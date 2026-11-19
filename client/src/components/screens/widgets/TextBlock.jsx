import React from 'react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

const TEXT_COLORS = {
  light: 'text-white',
  dark: 'text-slate-900',
  blue: 'text-blue-300',
  cyan: 'text-cyan-300',
  red: 'text-red-400',
  rose: 'text-rose-300',
  green: 'text-emerald-400',
  emerald: 'text-emerald-300',
  amber: 'text-amber-400',
  orange: 'text-orange-300',
  purple: 'text-purple-300',
  muted: 'text-slate-400',
  white: 'text-white'
};

export function TextBlock({ config = {}, fontFamilyClass }) {
  const text = config.text || '';
  const colorClass = TEXT_COLORS[config.color] || (config.color ? `text-${config.color}-400` : 'text-white');
  const pt = resolveFontSizePt(config.fontSize, 18);
  const weightClass = config.fontWeight === 'medium' ? 'font-medium' : config.fontWeight === 'semibold' ? 'font-semibold' : config.bold === false ? 'font-normal' : 'font-bold';
  const decorationClass = config.underline ? 'underline' : '';

  return (
    <div className={`h-full w-full flex items-center justify-center ${fontFamilyClass} ${colorClass} ${weightClass} ${decorationClass} tracking-wide text-center px-2`} style={fontSizeStyle(pt)}>
      {text}
    </div>
  );
}
