import { useEffect } from 'react';

const KEY = 'kmb-lite-2';

/**
 * Last-resort safety net for very weak devices. It only switches the heavy decoration off (html.perf-lite) when scrolling is
 * unmistakably struggling: a long, sustained run of frames slower than ~18fps, seen in two separate windows, well after the
 * page has loaded. Normal devices, busy tabs and slow first loads never trigger it.
 * Add ?fx=full to the address to force every effect on, or ?fx=lite to force lite mode.
 */
export default function PerfGovernor() {
  useEffect(() => {
    const root = document.documentElement;
    const fx = new URLSearchParams(window.location.search).get('fx');
    try {
      if (fx === 'full') { sessionStorage.removeItem(KEY); sessionStorage.setItem('kmb-fx', 'full'); }
      if (fx === 'lite') sessionStorage.setItem(KEY, '1');
      if (sessionStorage.getItem('kmb-fx') === 'full') return undefined;
      if (sessionStorage.getItem(KEY) === '1') { root.classList.add('perf-lite'); return undefined; }
    } catch { /* storage unavailable */ }

    let lastScroll = 0;
    let last = 0;
    let raf = 0;
    let badWindows = 0;
    const frames = [];
    const onScroll = () => { lastScroll = performance.now(); if (!raf) raf = requestAnimationFrame(tick); };
    function tick(t) {
      raf = 0;
      const scrolling = t - lastScroll < 140;
      if (last && scrolling && t > 8000) frames.push(t - last); // ignore the first 8s: images and scripts are still loading
      last = t;
      if (frames.length >= 100) {
        const sorted = [...frames].sort((a, b) => a - b);
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        frames.length = 0;
        badWindows = p75 > 55 ? badWindows + 1 : 0;
        if (badWindows >= 2) {
          root.classList.add('perf-lite');
          try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
          window.removeEventListener('scroll', onScroll);
          return;
        }
      }
      if (scrolling) raf = requestAnimationFrame(tick); else last = 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
