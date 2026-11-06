// VECTOR SOURCE of the bouquet art. Not used at runtime: public/decor/flora-*.png are baked from this (render <Flora/> from this file in a
// page and screenshot each .flora__layer with a transparent background; viewBox -10 -10 220 220). Edit here, then re-bake.
const EASE = [0.22, 1, 0.36, 1];
const C = { pink: '#D4A93C', pinkL: '#F3DE94', orange: '#B98A1E', orangeL: '#F7EBC4', blue: '#B9C1CA', blueL: '#E9EDF1', red: '#C9D0D8', leaf: '#4E7A3C', leafL: '#9FC27A', gold: '#F4C650', yellow: '#E9CB6B', violet: '#5B8A3A', violetL: '#A9CB84', swirl: '#D5DBE1', navy: '#8D97A1' };
const MIRROR = { tl: 'none', tr: 'scaleX(-1)', br: 'scale(-1,-1)', bl: 'scaleY(-1)' };
const ORIGIN = { tl: '0 0', tr: '100% 0', br: '100% 100%', bl: '0 100%' };

const LEAF = 'M0 0 C8 -10 24 -13 38 0 C24 13 8 10 0 0Z';
const LILY = 'M0 0 C-11 -14 -9 -36 0 -46 C9 -36 11 -14 0 0Z';

const ring = (n, r, rx, ry, fill, rot = 0) => Array.from({ length: n }, (_, i) => <ellipse key={i} cx="0" cy={-r} rx={rx} ry={ry} fill={fill} transform={`rotate(${rot + (i * 360) / n})`} />);

/* Each bouquet is a few stacked SVG layers. The layers (not the dozens of parts inside them) are what animate, in CSS,
   so the browser only composites them: stems, then leaves, then the big flowers, then the small ones, then the details. */
const Bloom = ({ x, y, s = 1, rot = 0, children }) => <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>{children}</g>;
const Leaf = ({ x, y, r, s = 1, fill }) => <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><path d={LEAF} fill={fill} /></g>;
const Layer = ({ d, children }) => <svg className="flora__layer" viewBox="0 0 200 200" style={{ '--d': `${d}s` }}>{children}</svg>;

/**
 * A colourful bouquet for a frame corner: pink, orange, blue, violet and yellow flowers, berry sprigs,
 * green leaves, a blue swirl and baby's-breath. Drawn for the top-left corner; other corners mirror it.
 */
export default function Flora({ corner = 'tl', size = 120, offset = 0, on = true, delay = 0, className = '' }) {
  const pos = { tl: { top: offset, left: offset }, tr: { top: offset, right: offset }, br: { bottom: offset, right: offset }, bl: { bottom: offset, left: offset } }[corner];
  return (
    <div className={`flora ${on ? 'is-on' : ''} ${className}`} style={{ ...pos, width: size, height: size, transformOrigin: ORIGIN[corner], '--base': `${delay}s` }} aria-hidden="true">
      <div className="flora__mirror" style={{ transform: MIRROR[corner] }}>
        <Layer d={0}>
          <path d="M150 6 C196 18 190 76 156 84 C134 90 122 72 138 62" fill="none" stroke={C.swirl} strokeWidth="6" strokeLinecap="round" />
          <path d="M150 6 C196 18 190 76 156 84 C134 90 122 72 138 62" fill="none" stroke={C.navy} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 7" />
          {['M8 150 C24 170 52 176 70 168', 'M96 190 C112 176 138 178 150 166', 'M170 150 C182 160 184 176 176 188', 'M14 40 C26 22 44 14 70 12', 'M178 110 C190 128 188 150 172 166'].map((dd, i) => <path key={i} d={dd} fill="none" stroke={i > 2 ? C.leaf : C.gold} strokeWidth="1.5" strokeLinecap="round" />)}
        </Layer>
        <Layer d={0.3}>
          {[[56, 104, 74, 1.05, C.leaf], [100, 98, 24, 1.1, C.leafL], [30, 84, 152, 0.95, C.leaf], [108, 34, -52, 0.9, C.leafL], [74, 46, -118, 0.9, C.leaf], [120, 140, 40, 0.85, C.leaf], [20, 120, 118, 0.8, C.leafL], [150, 100, 8, 0.8, C.leaf], [84, 150, 96, 0.85, C.leafL], [160, 150, 60, 0.7, C.leaf]].map(([x, y, r, sc, fill], i) => <Leaf key={i} x={x} y={y} r={r} s={sc} fill={fill} />)}
        </Layer>
        <Layer d={0.75}>
          <Bloom x={78} y={80}>
            {ring(10, 20, 9, 19, C.pink)}{ring(10, 12, 6, 12, C.pinkL, 18)}<circle r="7.5" fill={C.gold} />
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={Math.cos((i * Math.PI) / 3) * 4} cy={Math.sin((i * Math.PI) / 3) * 4} r="1.1" fill="#C98B1C" />)}
          </Bloom>
          <Bloom x={142} y={52} s={0.8} rot={-10}>
            {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`rotate(${i * 60})`}><path d={LILY} fill={C.orange} /><path d={LILY} fill={C.orangeL} transform="scale(.5)" /></g>)}
            <circle r="5" fill={C.gold} />
          </Bloom>
          <Bloom x={44} y={136} s={0.95}>{ring(5, 14, 11.5, 15, C.blue)}{ring(5, 9, 6.5, 9, C.blueL, 36)}<circle r="5.5" fill="#fff" /><circle r="2.4" fill={C.gold} /></Bloom>
        </Layer>
        <Layer d={1.1}>
          <Bloom x={160} y={110} s={0.6} rot={14}>{ring(6, 15, 8, 15, C.violet)}{ring(6, 9, 5, 9, C.violetL, 30)}<circle r="5" fill={C.yellow} /></Bloom>
          <Bloom x={118} y={128} s={0.72} rot={20}>{ring(9, 19, 8, 17, C.pinkL)}{ring(9, 11, 5, 10, C.pink, 20)}<circle r="6" fill={C.orange} /></Bloom>
          <Bloom x={20} y={66} s={0.55}>{ring(8, 17, 6, 14, C.yellow)}<circle r="6" fill={C.orange} /></Bloom>
          <Bloom x={132} y={160} s={0.46}>{ring(7, 14, 7, 13, C.orangeL)}<circle r="5" fill={C.pink} /></Bloom>
          <Bloom x={96} y={172} s={0.42}>{ring(6, 14, 7, 13, C.blueL)}<circle r="4.5" fill={C.gold} /></Bloom>
          <Bloom x={12} y={100} s={0.42}>{ring(5, 14, 8, 12, C.violetL)}<circle r="4" fill={C.gold} /></Bloom>
          <Bloom x={106} y={14} s={0.4}>{ring(6, 14, 7, 12, C.pinkL)}<circle r="4" fill={C.gold} /></Bloom>
        </Layer>
        <Layer d={1.45}>
          {[[22, 30], [34, 20], [48, 15], [60, 12], [28, 40], [42, 28]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" fill={C.red} />)}
          {[[180, 116], [187, 130], [186, 146], [178, 160]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.2" fill={C.orange} />)}
          {[[64, 140], [70, 150], [58, 152], [150, 138], [158, 128], [100, 60], [34, 100], [92, 112], [128, 84], [8, 76], [60, 30], [168, 74]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#fff" fillOpacity="0.92" />)}
        </Layer>
      </div>
    </div>
  );
}

/** A tiny five-petal blossom used on the footer vine, ribbon and frame garlands. */
export function Blossom({ fill = C.pink, centre = C.gold, size = 18, className = '', x, y }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} x={x} y={y} className={className} aria-hidden="true">
      {ring(5, 6, 4.6, 6.4, fill)}
      <circle r="2.6" fill={centre} />
    </svg>
  );
}
export const BLOSSOM_COLOURS = [C.pink, C.orange, C.blue, C.violet, C.yellow];
