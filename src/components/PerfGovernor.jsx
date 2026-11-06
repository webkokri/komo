import { useEffect } from 'react';

const KEY = 'kmb-lite';

/**
 * Keeps scrolling smooth on any device. While the visitor scrolls it samples frame times; if the page cannot hold
 * roughly 40fps it switches to "lite" mode (html.perf-lite), which turns off the heavy decoration (drifting leaves and
 * petals, garlands, cursor sparkles, light rays) and leaves the content, photos and frames. The choice is remembered.
 */
export default function PerfGovernor() {
  useEffect(() => {
    const root = document.documentElement;
    try { if (sessionStorage.getItem(KEY) === '1') { root.classList.add('perf-lite'); return undefined; } } catch { /* storage unavailable */ }

    let lastScroll = 0;
    let last = 0;
    let raf = 0;
    const frames = [];
    const onScroll = () => { lastScroll = performance.now(); if (!raf) raf = requestAnimationFrame(tick); };
    function tick(t) {
      raf = 0;
      if (last && t - lastScroll < 140) frames.push(t - last);
      last = t;
      if (frames.length >= 40) {
        const sorted = [...frames].sort((a, b) => a - b);
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        frames.length = 0;
        if (p75 > 26) {
          root.classList.add('perf-lite');
          try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
          window.removeEventListener('scroll', onScroll);
          return;
        }
      }
      if (t - lastScroll < 140) raf = requestAnimationFrame(tick); else last = 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
