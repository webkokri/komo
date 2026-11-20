// Vector source for the leafy corner sprigs (not used at runtime). To re-bake public/decor/flora-1..3.png: render <Flora/> in a temporary
// page and screenshot groups of .flora__layer ([0,1],[2],[3,4]) with a transparent background. Edit here, then re-bake.
// Style: deep olive leaves with gold veins, and metallic gold leaves.
const LEAF = 'M0 0 C7 -10 23 -11 34 0 C23 11 7 10 0 0Z';
const Defs = () => (
  <defs>
    <linearGradient id="gOlive" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stopColor="#2F3C1A" /><stop offset="0.55" stopColor="#566A2B" /><stop offset="1" stopColor="#8E9B52" /></linearGradient>
    <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0" stopColor="#9C7C2B" /><stop offset="0.45" stopColor="#E6C875" /><stop offset="1" stopColor="#B89A4A" /></linearGradient>
  </defs>
);
const Leaf = ({ x, y, r, s = 1, gold }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d={LEAF} fill={gold ? 'url(#gGold)' : 'url(#gOlive)'} />
    <path d="M0 0 C7 -10 23 -11 34 0 Z" fill="#fff" opacity=".13" />
    <path d="M1 0 H31" stroke={gold ? '#FFF3C4' : '#E6C875'} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    <path d="M9 0 L16 -5 M15 0 L23 -5.5 M9 0 L16 5 M15 0 L23 5.5" stroke={gold ? '#FFF3C4' : '#E6C875'} strokeWidth=".6" strokeLinecap="round" fill="none" opacity=".75" />
  </g>
);
const STEMS = [
  { p: [[4, 6], [40, 30], [80, 80], [124, 152]], gold: false, sc: 1.05 },
  { p: [[6, 4], [60, 14], [120, 40], [178, 98]], gold: true, sc: 1 },
  { p: [[4, 40], [30, 70], [40, 110], [36, 172]], gold: true, sc: 0.9 },
  { p: [[30, 4], [70, 10], [110, 20], [152, 12]], gold: false, sc: 0.85 },
];
const at = ([a, b, c, d], t) => {
  const u = 1 - t;
  const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
  const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
  return [x, y];
};
const stemLeaves = (st, flip) => {
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    const t = 0.12 + i * 0.135;
    const [x, y] = at(st.p, t);
    const [x2, y2] = at(st.p, Math.min(1, t + 0.02));
    const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
    const side = (i + flip) % 2 ? 1 : -1;
    out.push({ x, y, r: ang + side * 52, s: st.sc * (1.05 - i * 0.07), gold: st.gold ? i % 3 !== 0 : i % 3 === 0 });
  }
  const [ex, ey] = at(st.p, 1);
  const [bx, by] = at(st.p, 0.97);
  out.push({ x: ex, y: ey, r: (Math.atan2(ey - by, ex - bx) * 180) / Math.PI, s: st.sc * 0.62, gold: st.gold });
  return out;
};
const Layer = ({ d, children }) => <svg className="flora__layer" viewBox="-10 -10 220 220" style={{ '--d': `${d}s` }}><Defs />{children}</svg>;

export default function Flora({ size = 440 }) {
  return (
    <div className="flora" style={{ width: size, height: size }}>
      <Layer d={0}>
        {STEMS.map((st, i) => <path key={i} d={`M${st.p[0]} C${st.p[1]} ${st.p[2]} ${st.p[3]}`} fill="none" stroke={i % 2 ? '#B89A4A' : '#8E9B52'} strokeWidth="1.8" strokeLinecap="round" />)}
      </Layer>
      <Layer d={0}>{stemLeaves(STEMS[0], 0).map((l, i) => <Leaf key={i} {...l} />)}{stemLeaves(STEMS[3], 1).map((l, i) => <Leaf key={i} {...l} />)}</Layer>
      <Layer d={0.5}>{stemLeaves(STEMS[1], 1).map((l, i) => <Leaf key={i} {...l} />)}</Layer>
      <Layer d={1}>{stemLeaves(STEMS[2], 0).map((l, i) => <Leaf key={i} {...l} />)}</Layer>
      <Layer d={1}>
        {[[18, 22, 40, 0.9, true], [40, 12, 8, 0.8, false], [12, 54, 70, 0.8, true], [60, 38, 30, 0.7, false]].map(([x, y, r, s, g], i) => <Leaf key={i} x={x} y={y} r={r} s={s} gold={g} />)}
        {[[28, 30], [52, 24], [24, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#E6C875" />)}
      </Layer>
    </div>
  );
}
