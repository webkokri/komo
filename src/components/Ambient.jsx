import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useTheme } from '../cms/theme.jsx';
import Flora from './Flora.jsx';

const LEAF = 'M0 0 C4 -6.5 12 -6.5 17 0 C12 6.5 4 6.5 0 0Z';

// Fixed "random" values so the layout is stable between renders.
const FALL = [
  { x: 6, s: 18, d: 19, t: -3, dx: 40, r: 160 }, { x: 17, s: 13, d: 23, t: -11, dx: -30, r: -200 }, { x: 29, s: 22, d: 27, t: -18, dx: 55, r: 220 },
  { x: 41, s: 15, d: 21, t: -7, dx: -45, r: -140 }, { x: 53, s: 11, d: 25, t: -15, dx: 35, r: 180 }, { x: 64, s: 20, d: 29, t: -22, dx: -60, r: -240 },
  { x: 76, s: 14, d: 22, t: -9, dx: 50, r: 150 }, { x: 88, s: 19, d: 26, t: -13, dx: -35, r: -190 }, { x: 94, s: 12, d: 24, t: -5, dx: 30, r: 170 },
];
const PETALS_ALL = [
  { x: 9, s: 12, d: 21, t: -4, dx: 36, r: 200, c: '#F4A6BE' }, { x: 21, s: 10, d: 25, t: -12, dx: -42, r: -240, c: '#F7B260' }, { x: 33, s: 13, d: 23, t: -8, dx: 50, r: 180, c: '#93B5E2' },
  { x: 47, s: 11, d: 27, t: -16, dx: -34, r: -200, c: '#F4A6BE' }, { x: 58, s: 12, d: 22, t: -2, dx: 44, r: 220, c: '#D2B8F0' }, { x: 69, s: 10, d: 26, t: -19, dx: -48, r: -180, c: '#F7B260' },
  { x: 81, s: 13, d: 24, t: -10, dx: 40, r: 190, c: '#fff' }, { x: 92, s: 11, d: 28, t: -6, dx: -30, r: -210, c: '#F4A6BE' },
];
const SPOTS = [{ x: 12, y: 24, s: 90, d: 9 }, { x: 78, y: 64, s: 130, d: 12 }, { x: 46, y: 82, s: 60, d: 8 }];

const PETALS = PETALS_ALL.filter((_, i) => i % 2 === 0);

function Petals() {
  return PETALS.map((l, i) => (
    <svg key={`p${i}`} className="ambient__leaf ambient__petal" viewBox="-8 -8 16 16" style={{ left: `${l.x}%`, width: l.s, '--dx': `${l.dx}px`, '--r': `${l.r}deg`, animationDuration: `${l.d}s`, animationDelay: `${l.t}s` }}>
      <path d="M0 -7 C6 -4 6 4 0 7 C-6 4 -6 -4 0 -7Z" fill={l.c} />
    </svg>
  ));
}

function Branch({ className }) {
  return (
    <svg className={`ambient__branch ${className}`} viewBox="0 0 220 280" aria-hidden="true">
      <path d="M0 0 C46 38 78 92 112 184" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 52 C88 46 118 60 150 96" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[[22, 18, 36, 1.5], [44, 44, 62, 1.7], [66, 74, 86, 1.6], [88, 118, 96, 1.7], [104, 158, 110, 1.5], [70, 50, 12, 1.4], [108, 70, 28, 1.5], [136, 88, 40, 1.4]].map(([x, y, r, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><path d={LEAF} fill="currentColor" /></g>
      ))}
    </svg>
  );
}

/**
 * Soft ambient decoration laid over a section: drifting leaves and light on dark sections,
 * a swaying branch in the corners on light ones. Pointer-transparent and paused while off screen.
 */
const RISE = [{ x: 8, d: 17, t: -2, s: 6 }, { x: 22, d: 23, t: -11, s: 8 }, { x: 37, d: 19, t: -6, s: 5 }, { x: 55, d: 25, t: -15, s: 7 }, { x: 71, d: 21, t: -9, s: 6 }, { x: 88, d: 18, t: -4, s: 8 }];

export default function SectionDecor({ tone = 'light' }) {
  const ref = useRef(null);
  const live = useInView(ref, { margin: '120px' });
  const corp = useTheme() === 'corporate';
  if (corp) {
    return (
      <div ref={ref} className={`ambient ambient--corp ambient--${tone} ${live ? 'is-live' : ''}`} aria-hidden="true">
        <span className="corp-grid" />
        <span className="corp-sweep" />
        <span className="corp-square" style={{ top: '9%', right: '5%', width: 74, height: 74 }} />
        <span className="corp-square corp-square--b" style={{ bottom: '12%', left: '3%', width: 52, height: 52 }} />
        {live && RISE.map((r, i) => <span key={i} className="corp-rise" style={{ left: `${r.x}%`, width: r.s, height: r.s, animationDuration: `${r.d}s`, animationDelay: `${r.t}s` }} />)}
      </div>
    );
  }
  return (
    <div ref={ref} className={`ambient ambient--${tone} ${live ? 'is-live' : ''}`} aria-hidden="true">
      {tone === 'dark' ? (
        <>
          {SPOTS.map((p, i) => <span key={i} className="ambient__spot" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, animationDuration: `${p.d}s` }} />)}
          <Flora corner="tr" size={150} offset={-34} on={live} className="flora--edge" />
          <Flora corner="bl" size={150} offset={-34} on={live} delay={0.4} className="flora--edge flora--edge-br" />
          {live && <Petals />}
          {live && FALL.filter((_, i) => i % 3 !== 2).map((l, i) => (
            <svg key={i} className="ambient__leaf" viewBox="-2 -8 22 16" style={{ left: `${l.x}%`, width: l.s, '--dx': `${l.dx}px`, '--r': `${l.r}deg`, animationDuration: `${l.d}s`, animationDelay: `${l.t}s` }}>
              <path d={LEAF} fill={i % 3 === 0 ? 'var(--sun)' : '#9DB58F'} />
            </svg>
          ))}
        </>
      ) : (
        <>
          <Flora corner="tl" size={160} offset={-38} on={live} className="flora--edge" />
          <Flora corner="br" size={160} offset={-38} on={live} delay={0.4} className="flora--edge flora--edge-br" />
          {live && <Petals />}
        </>
      )}
    </div>
  );
}
