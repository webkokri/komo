import { useEffect } from 'react';
import Lenis from 'lenis';
import { useCms } from '../cms/store.jsx';

let lenis = null;

/** Jump to the top without animating (used after a page change). */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

/** Inertial wheel scrolling for visitors. Off in the editor and for people who ask for less motion. */
export default function SmoothScroll() {
  const { editing } = useCms();

  useEffect(() => {
    if (editing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 3.2), wheelMultiplier: 0.95 });
    let raf;
    const loop = (time) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, [editing]);

  return null;
}
