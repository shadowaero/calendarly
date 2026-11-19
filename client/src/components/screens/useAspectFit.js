import { useEffect, useRef, useState } from 'react';

// Keeps a canvas at a fixed aspect ratio, centered and fit within its container.
// Returns [ref, size] where ref is attached to the wrapper and size is {w, h} in px.
export function useAspectFit(aspect) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => {
      const r = el.getBoundingClientRect();
      let w = r.width;
      let h = w / aspect;
      if (h > r.height) {
        h = r.height;
        w = h * aspect;
      }
      setSize({ w: Math.max(0, Math.floor(w)), h: Math.max(0, Math.floor(h)) });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);

  return [ref, size];
}
