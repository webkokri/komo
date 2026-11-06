import { useEffect, useRef } from 'react';
import { useCms } from '../cms/store.jsx';

/** A faint trail of gold sparkles behind the mouse. Desktop only, off in the editor and for reduced motion. */
export default function CursorSparkle() {
  const { editing } = useCms();
  const corp = useCms().get('page.meta.theme') === 'corporate';
  const ref = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (editing || corp || !fine || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let w = 0; let h = 0; let raf = 0; let last = 0;
    const parts = [];
    const size = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); w = window.innerWidth; h = window.innerHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();

    const star = (x, y, r, rot) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
      for (let i = 0; i < 4; i += 1) { const a = (i * Math.PI) / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.28, Math.sin(a + Math.PI / 4) * r * 0.28); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    };

    const frame = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i -= 1) {
        const p = parts[i]; const age = (t - p.t0) / p.life;
        if (age >= 1) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = (1 - age) * 0.8; ctx.fillStyle = p.c;
        star(p.x + p.vx * age * 30, p.y + p.vy * age * 30 + age * age * 14, p.r * (1 - age * 0.5), p.rot + age * 2);
      }
      raf = parts.length ? requestAnimationFrame(frame) : 0;
    };

    const move = (e) => {
      const now = performance.now();
      if (now - last < 42) return;
      last = now;
      parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.4, vy: (Math.random() - 0.5) * 1.4 - 0.4, r: 3 + Math.random() * 3.5, rot: Math.random() * 3, t0: now, life: 650 + Math.random() * 350, c: Math.random() > 0.35 ? '#D9A441' : '#F3EFE6' });
      if (parts.length > 28) parts.shift();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('resize', size);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('resize', size); cancelAnimationFrame(raf); };
  }, [editing, corp]);

  return <canvas ref={ref} className="cursor-sparkle" aria-hidden="true" />;
}
