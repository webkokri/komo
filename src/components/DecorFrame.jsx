import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/** Rounded rectangle with a radius per corner: [top-left, top-right, bottom-right, bottom-left]. */
function framePath(w, h, radii) {
  const lim = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = radii.map((r) => Math.max(0, Math.min(r, lim)));
  return `M${tl},0 H${w - tr} A${tr},${tr} 0 0 1 ${w},${tr} V${h - br} A${br},${br} 0 0 1 ${w - br},${h} H${bl} A${bl},${bl} 0 0 1 0,${h - bl} V${tl} A${tl},${tl} 0 0 1 ${tl},0 Z`;
}

// A small leafy sprig drawn for the top-left corner; the other corners mirror it.
const LEAVES = [
  { x: 6, y: 31, r: -118, s: 0.95 },
  { x: 11, y: 19, r: -64, s: 1 },
  { x: 22, y: 10, r: -28, s: 1 },
  { x: 36, y: 6, r: -4, s: 0.85 },
];
const LEAF = 'M0 0 C4 -6.5 12 -6.5 17 0 C12 6.5 4 6.5 0 0Z';
const MIRROR = { tl: 'none', tr: 'scaleX(-1)', br: 'scale(-1,-1)', bl: 'scaleY(-1)' };

function Sprig({ corner, size, offset, on, delay, reduce }) {
  const pos = { tl: { top: offset, left: offset }, tr: { top: offset, right: offset }, br: { bottom: offset, right: offset }, bl: { bottom: offset, left: offset } }[corner];
  const t = (d) => (reduce ? { duration: 0 } : { duration: 0.7, delay: delay + d, ease: EASE });
  return (
    <svg className="decor-sprig" viewBox="0 0 60 60" width={size} height={size} style={{ ...pos, transform: MIRROR[corner] }} aria-hidden="true">
      <motion.path d="M5 44 C5 20 20 5 44 5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={t(0)} />
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}>
          <motion.path d={LEAF} fill="currentColor" fillOpacity="0.9" style={{ transformBox: 'fill-box', transformOrigin: '0% 50%' }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 14, delay: delay + 0.35 + i * 0.11 }} />
        </g>
      ))}
      <motion.circle cx="46" cy="5" r="2.4" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: on ? 1 : 0 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 12, delay: delay + 0.9 }} />
      <motion.circle cx="5" cy="46" r="2.4" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: on ? 1 : 0 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 12, delay: delay + 1 }} />
    </svg>
  );
}

const STARS = [
  { x: 0.2, y: 0, d: 0 }, { x: 1, y: 0.34, d: 1.1 }, { x: 0.74, y: 1, d: 2.1 }, { x: 0, y: 0.68, d: 0.6 },
];

/**
 * A frame that decorates itself: a gold line draws around the edge, leafy sprigs grow into the corners
 * and small sparkles twinkle. Place inside a `position: relative` parent. `inset` can be negative to sit outside.
 * `radii` = [tl, tr, br, bl] (px). `replayKey` re-grows the ornaments (for slideshows).
 */
export default function DecorFrame({ inset = 12, radii = [2, 2, 2, 2], corners = ['tl', 'tr', 'br', 'bl'], delay = 0.2, replayKey, stars = true, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setBox({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const w = Math.max(0, box.w);
  const h = Math.max(0, box.h);
  const big = w >= 220 && h >= 170;
  const size = Math.max(34, Math.min(64, Math.min(w, h) / 6));
  const on = inView || !!reduce;
  const line = (d, inner) => (reduce ? { duration: 0 } : { duration: inner ? 1.7 : 1.5, delay: d, ease: EASE });

  return (
    <div ref={ref} className={`decor-frame ${className}`} style={{ inset }} aria-hidden="true">
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="decor-frame__line">
          <motion.path d={framePath(w, h, radii)} fill="none" stroke="currentColor" strokeWidth="1.3" initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={line(delay)} />
          {big && (
            <g transform="translate(7 7)">
              <motion.path className="decor-inner" d={framePath(w - 14, h - 14, radii.map((r) => Math.max(0, r - 5)))} fill="none" stroke="var(--paper)" strokeOpacity="0.5" strokeWidth="0.8" initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={line(delay + 0.25, true)} />
            </g>
          )}
        </svg>
      )}
      {big && corners.map((c) => <Sprig key={`${c}-${replayKey}`} corner={c} size={size} offset={-6} on={on} delay={delay + 1.1} reduce={reduce} />)}
      {big && stars && STARS.map((s, i) => (
        <span key={i} className="decor-star" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, '--d': `${s.d}s`, opacity: on ? undefined : 0 }}>
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8Z" fill="currentColor" /></svg>
        </span>
      ))}
    </div>
  );
}
