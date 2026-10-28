import { motion } from 'framer-motion';

// Soft spots of light that drift and breathe — the "komorebi" motif.
const DEFAULT_SPOTS = [
  { cx: 300, cy: 80, r: 46, o: 0.28 },
  { cx: 220, cy: 150, r: 22, o: 0.2 },
  { cx: 340, cy: 200, r: 14, o: 0.24 },
  { cx: 120, cy: 90, r: 30, o: 0.14 },
  { cx: 260, cy: 270, r: 36, o: 0.12 },
  { cx: 90, cy: 230, r: 10, o: 0.22 },
  { cx: 170, cy: 330, r: 18, o: 0.16 },
];

export default function DappledLight({ spots = DEFAULT_SPOTS, viewBox = '0 0 400 400' }) {
  return (
    <svg className="dapple" viewBox={viewBox} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {spots.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="var(--sun)"
          initial={{ opacity: 0, cx: s.cx, cy: s.cy }}
          animate={{
            opacity: [s.o, s.o * 1.9, s.o],
            cx: [s.cx, s.cx + (i % 2 ? 12 : -12), s.cx],
            cy: [s.cy, s.cy + (i % 3 ? -8 : 8), s.cy],
          }}
          transition={{ duration: 6 + i * 1.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}
    </svg>
  );
}
