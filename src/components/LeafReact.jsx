import { useEffect } from 'react';

// Leaves shift slightly with the mouse (parallax). Translation only, no rotation. Larger pieces move more, so the decoration has depth.
const TARGETS = [
  ['.flora', 22],
  ['.decor-sprig', 14],
  ['.decor-garland > span', 10],
  ['.ambient__leaf', 16],
];
const SELECTOR = TARGETS.map(([s]) => s).join(',');

export default function LeafReact() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return undefined;

    const root = document.documentElement;
    const depthOf = (el) => (TARGETS.find(([s]) => el.matches(s)) || [, 8])[1];
    const known = new WeakSet();
    const visible = new Set();
    let cx = 0; let cy = 0; let tx = 0; let ty = 0; let raf = 0;

    const apply = (el) => { el.style.translate = `${(-cx * depthOf(el)).toFixed(2)}px ${(-cy * depthOf(el)).toFixed(2)}px`; };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { visible.add(e.target); apply(e.target); } else visible.delete(e.target);
      });
    }, { rootMargin: '80px' });

    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => { if (!known.has(el)) { known.add(el); io.observe(el); } });
    };
    let scanTimer = 0;
    const mo = new MutationObserver(() => { window.clearTimeout(scanTimer); scanTimer = window.setTimeout(scan, 300); });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();

    const tick = () => {
      raf = 0;
      if (root.classList.contains('perf-lite')) return;
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      visible.forEach(apply);
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(scanTimer);
      mo.disconnect(); io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
