import React, { useRef } from 'react';
import BlockRenderer from '../BlockRenderer';
import { clamp, round2, effectiveGeom } from './geometry';
import { useAspectFit } from '../useAspectFit';
import { getBackgroundStyle } from '../backgrounds';

const MIN = 5; // minimum block size in percent

const HANDLES = [
  { dir: 'nw', style: { left: -5, top: -5 }, cursor: 'nwse-resize' },
  { dir: 'n', style: { left: '50%', top: -5, marginLeft: -5 }, cursor: 'ns-resize' },
  { dir: 'ne', style: { right: -5, top: -5 }, cursor: 'nesw-resize' },
  { dir: 'e', style: { right: -5, top: '50%', marginTop: -5 }, cursor: 'ew-resize' },
  { dir: 'se', style: { right: -5, bottom: -5 }, cursor: 'nwse-resize' },
  { dir: 's', style: { left: '50%', bottom: -5, marginLeft: -5 }, cursor: 'ns-resize' },
  { dir: 'sw', style: { left: -5, bottom: -5 }, cursor: 'nesw-resize' },
  { dir: 'w', style: { left: -5, top: '50%', marginTop: -5 }, cursor: 'ew-resize' }
];

export default function EditableCanvas({
  blocks = [],
  orientation = 'landscape',
  backgroundType = 'color',
  backgroundValue = '#090D16',
  selectedBlockIdx = 0,
  onSelectBlock,
  onUpdateBlock,
  ...dataProps
}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const aspect = orientation === 'portrait' ? 9 / 16 : 16 / 9;
  const [wrapperRef, size] = useAspectFit(aspect);
  const bgStyle = getBackgroundStyle(backgroundType, backgroundValue);

  const startDrag = (e, idx, mode) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.stopPropagation();
    onSelectBlock(idx);
    const rect = canvasRef.current.getBoundingClientRect();
    const g = effectiveGeom(blocks[idx]);
    const state = {
      idx,
      mode,
      sx: e.clientX,
      sy: e.clientY,
      cw: rect.width || 1,
      ch: rect.height || 1,
      x: g.x,
      y: g.y,
      w: g.w,
      h: g.h,
      rot: (Number(blocks[idx].config?.rotation) || 0) * Math.PI / 180
    };
    dragRef.current = state;

    const onMove = (ev) => {
      const s = dragRef.current;
      if (!s) return;
      const rawDx = ((ev.clientX - s.sx) / s.cw) * 100;
      const rawDy = ((ev.clientY - s.sy) / s.ch) * 100;
      // Canvas aspect ratio (height / width). x/w are width-% while y/h are
      // height-%, so any math mixing the two axes must scale by this ratio.
      const k = s.ch / s.cw;
      let { x, y, w, h } = s;

      if (s.mode === 'move') {
        // Clamp using the block's visual (rotated) bounding box so it can reach
        // the canvas edges. width-% and height-% are different scales, so the
        // rotation must account for the canvas aspect ratio (k).
        const cos = Math.abs(Math.cos(s.rot));
        const sin = Math.abs(Math.sin(s.rot));
        const vw = s.w * cos + s.h * sin * k; // visual width in width-%
        const vh = s.w * sin / k + s.h * cos; // visual height in height-%
        const minX = -(s.w - vw) / 2;
        const minY = -(s.h - vh) / 2;
        const maxX = 100 - (s.w + vw) / 2;
        const maxY = 100 - (s.h + vh) / 2;
        x = clamp(s.x + rawDx, minX, maxX);
        y = clamp(s.y + rawDy, minY, maxY);
      } else {
        // Convert screen-space drag into the block's local (rotated) space,
        // aspect-corrected (width-% and height-% are different scales).
        const cos = Math.cos(s.rot);
        const sin = Math.sin(s.rot);
        const dx = rawDx * cos + rawDy * sin * k;
        const dy = -rawDx * sin / k + rawDy * cos;

        if (s.mode.includes('e')) w = clamp(s.w + dx, MIN, 100 - s.x);
        if (s.mode.includes('s')) h = clamp(s.h + dy, MIN, 100 - s.y);
        if (s.mode.includes('w')) {
          const nx = clamp(s.x + dx, 0, s.x + s.w - MIN);
          w = s.x + s.w - nx;
          x = nx;
        }
        if (s.mode.includes('n')) {
          const ny = clamp(s.y + dy, 0, s.y + s.h - MIN);
          h = s.y + s.h - ny;
          y = ny;
        }
      }

      onUpdateBlock(s.idx, {
        x_percent: round2(x),
        y_percent: round2(y),
        w_percent: round2(w),
        h_percent: round2(h)
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-center justify-center">
      <div
        ref={canvasRef}
        className="relative overflow-hidden rounded-sm"
        style={{
          width: size.w,
          height: size.h,
          touchAction: 'none',
          ...bgStyle
        }}
      >
        {blocks.map((block, idx) => {
          const g = effectiveGeom(block);
          const selected = idx === selectedBlockIdx;
          const isFloating = block.type === 'today_button';
          return (
            <div
              key={block.id || idx}
              className="absolute"
              style={{ left: `${g.x}%`, top: `${g.y}%`, width: `${g.w}%`, height: `${g.h}%`, zIndex: isFloating ? 50 : undefined, transform: block.config?.rotation ? `rotate(${block.config.rotation}deg)` : undefined }}
            >
              {/* Clipped content preview */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <BlockRenderer block={block} {...dataProps} />
              </div>

              {/* Transparent drag surface (blocks widget interaction in edit mode) */}
              <div
                className="absolute inset-0 z-10"
                style={{ cursor: 'move' }}
                onPointerDown={(e) => startDrag(e, idx, 'move')}
              />

              {selected && (
                <>
                  <div className="absolute inset-0 z-20 ring-2 ring-cyan-400 rounded-xl pointer-events-none" />
                  {HANDLES.map((hd) => (
                    <div
                      key={hd.dir}
                      className="absolute z-30 w-2.5 h-2.5 bg-cyan-400 border border-slate-900 rounded-sm"
                      style={{ ...hd.style, cursor: hd.cursor }}
                      onPointerDown={(e) => startDrag(e, idx, hd.dir)}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
