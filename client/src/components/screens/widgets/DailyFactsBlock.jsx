import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { resolveFontSizePt, fontSizeStyle } from '../fonts';

const FACTS = [
  "A single strand of spaghetti is called a \"spaghetto\".",
  "Honey never spoils — archaeologists have found 3,000-year-old honey still edible.",
  "Octopuses have three hearts and blue blood.",
  "The shortest war in history lasted 38 minutes.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than a year on Venus.",
  "Wombat poop is cube-shaped.",
  "There are more stars in the universe than grains of sand on Earth.",
  "The Eiffel Tower grows about 6 inches taller in summer heat.",
  "Sloths can hold their breath longer than dolphins."
];

export function DailyFactsBlock({ config = {}, fontFamilyClass }) {
  const [idx, setIdx] = useState(0);
  const pt = resolveFontSizePt(config.fontSize, 10);

  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % FACTS.length), 20000);
    return () => clearInterval(timer);
  }, []);

  const fact = FACTS[idx];

  return (
    <div className={`h-full w-full flex items-center justify-center gap-2 px-3 text-center ${fontFamilyClass}`}>
      <Lightbulb className="w-4 h-4 text-amber-300 shrink-0" />
      <span className="text-slate-100 italic leading-snug" style={fontSizeStyle(pt)}>"{fact}"</span>
    </div>
  );
}
