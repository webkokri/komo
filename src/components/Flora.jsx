// Colourful corner bouquets. The art lives in public/decor/flora-1..3.png (stems + leaves, big flowers, small flowers),
// baked from the vector source in FloraArt.jsx so the browser only moves flat pictures (cheap) instead of painting hundreds of shapes.
const MIRROR = { tl: 'none', tr: 'scaleX(-1)', br: 'scale(-1,-1)', bl: 'scaleY(-1)' };
const ORIGIN = { tl: '0 0', tr: '100% 0', br: '100% 100%', bl: '0 100%' };
const LAYERS = [['/decor/flora-1.png', 0], ['/decor/flora-2.png', 0.5], ['/decor/flora-3.png', 1]];

/** A bouquet for a frame or section corner. Layers bloom in turn (CSS) once `on`, then the bouquet sways. */
export default function Flora({ corner = 'tl', size = 120, offset = 0, on = true, delay = 0, className = '' }) {
  const pos = { tl: { top: offset, left: offset }, tr: { top: offset, right: offset }, br: { bottom: offset, right: offset }, bl: { bottom: offset, left: offset } }[corner];
  return (
    <div className={`flora ${on ? 'is-on' : ''} ${className}`} style={{ ...pos, width: size, height: size, transformOrigin: ORIGIN[corner], '--base': `${delay}s` }} aria-hidden="true">
      <div className="flora__mirror" style={{ transform: MIRROR[corner] }}>
        {LAYERS.map(([src, d]) => <img key={src} className="flora__layer" src={src} alt="" width="440" height="440" decoding="async" style={{ '--d': `${d}s` }} />)}
      </div>
    </div>
  );
}

/** A tiny blossom image used by the frame garlands (five colours, public/decor/blossom-0..4.png). */
export function GarlandBlossom({ index = 0, size = 18 }) {
  return <img src={`/decor/blossom-${index % 5}.png`} alt="" width={size} height={size} decoding="async" style={{ display: 'block' }} />;
}

// Small inline blossom for the footer vine and the ribbon.
const PETAL = (n, r, rx, ry, fill) => Array.from({ length: n }, (_, i) => <ellipse key={i} cx="0" cy={-r} rx={rx} ry={ry} fill={fill} transform={`rotate(${(i * 360) / n})`} />);
export function Blossom({ fill = '#E8628A', centre = '#F4C650', size = 18, className = '', x, y }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} x={x} y={y} className={className} aria-hidden="true">
      {PETAL(5, 6, 4.6, 6.4, fill)}
      <circle r="2.6" fill={centre} />
    </svg>
  );
}
export const BLOSSOM_COLOURS = ['#E8628A', '#F28A2E', '#4C6EA8', '#8E6CC4', '#F7D154'];
