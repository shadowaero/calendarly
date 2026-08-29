import React from 'react';
import { Quote } from 'lucide-react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

const QUOTE_COLORS = {
  indigo: { icon: 'text-indigo-400', author: 'text-indigo-400', bg: 'bg-indigo-950/20' },
  purple: { icon: 'text-purple-400', author: 'text-purple-400', bg: 'bg-purple-950/20' },
  emerald: { icon: 'text-emerald-400', author: 'text-emerald-400', bg: 'bg-emerald-950/20' },
  amber: { icon: 'text-amber-400', author: 'text-amber-400', bg: 'bg-amber-950/20' },
  rose: { icon: 'text-rose-400', author: 'text-rose-400', bg: 'bg-rose-950/20' },
  cyan: { icon: 'text-cyan-400', author: 'text-cyan-400', bg: 'bg-cyan-950/20' }
};

export function QuoteNotesBlock({ config = {}, fontFamilyClass }) {
  const quotes = [
    { text: "Family is not an important thing. It's everything.", author: "Michael J. Fox" },
    { text: "The love of family and the admiration of friends is much more important than wealth and privilege.", author: "Charles Kuralt" },
    { text: "Together is our favorite place to be.", author: "Family Motto" }
  ];

  const customText = config.note || config.customQuote || config.text;
  const customAuthor = config.author || config.customAuthor || (config.note ? 'Family Note' : 'Note');
  const q = customText ? { text: customText, author: customAuthor } : quotes[0];
  const colorTheme = QUOTE_COLORS[config.color] || QUOTE_COLORS.indigo;
  const pt = resolveFontSizePt(config.fontSize, 12);

  return (
    <div className={`h-full w-full p-4 flex flex-col justify-center text-center text-slate-200 ${fontFamilyClass}`}>
      <Quote className={`w-5 h-5 ${colorTheme.icon} mx-auto mb-1.5 opacity-60`} />
      <p className="font-medium italic mb-1.5" style={fontSizeStyle(pt)}>"{q.text}"</p>
      {q.author && <span className={`font-bold ${colorTheme.author} uppercase tracking-wider`} style={fontSizeStyle(pt, 0.75)}>— {q.author}</span>}
    </div>
  );
}
