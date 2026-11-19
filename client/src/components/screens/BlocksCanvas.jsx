import React from 'react';
import BlockRenderer from './BlockRenderer';
import { effectiveGeom } from './editor/geometry';
import { useAspectFit } from './useAspectFit';
import { getBackgroundStyle } from './backgrounds';

// Renders blocks with percentage geometry on a fixed-aspect canvas,
// identical to how the screen editor renders them — so the preview,
// the editor, and the display endpoints all match.
export default function BlocksCanvas({
  blocks = [],
  orientation = 'landscape',
  backgroundType = 'color',
  backgroundValue = '#090D16',
  ...dataProps
}) {
  const aspect = orientation === 'portrait' ? 9 / 16 : 16 / 9;
  const [ref, size] = useAspectFit(aspect);
  const bgStyle = getBackgroundStyle(backgroundType, backgroundValue);

  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center">
      <div
        className="relative overflow-hidden"
        style={{ width: size.w, height: size.h, ...bgStyle }}
      >
        {(blocks || []).map((block, idx) => {
          const g = effectiveGeom(block);
          const isFloating = block.type === 'today_button';
          return (
            <div
              key={block.id || idx}
              className="absolute overflow-hidden"
              style={{ left: `${g.x}%`, top: `${g.y}%`, width: `${g.w}%`, height: `${g.h}%`, zIndex: isFloating ? 50 : undefined, transform: block.config?.rotation ? `rotate(${block.config.rotation}deg)` : undefined }}
            >
              <BlockRenderer block={block} {...dataProps} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
