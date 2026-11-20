// Leafy corner sprigs. The art lives in public/decor/flora-1..3.png (stems, olive leaves, gold leaves),
// baked from the vector source in FloraArt.jsx so the browser only moves flat pictures (cheap) instead of painting hundreds of shapes.
const MIRROR = { tl: 'none', tr: 'scaleX(-1)', br: 'scale(-1,-1)', bl: 'scaleY(-1)' };
const ORIGIN = { tl: '0 0', tr: '100% 0', br: '100% 100%', bl: '0 100%' };
const V = '5'; // bump when the baked art changes (the server caches images for a year)
const LAYERS = [[`/decor/flora-1.png?v=${V}`, 0], [`/decor/flora-2.png?v=${V}`, 0.5], [`/decor/flora-3.png?v=${V}`, 1]];

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

/** A tiny leaf-sprig image used by the frame garlands (five colours, public/decor/blossom-0..4.png). */
export function GarlandBlossom({ index = 0, size = 18 }) {
  return <img src={`/decor/blossom-${index % 5}.png?v=${V}`} alt="" width={size} height={size} decoding="async" style={{ display: 'block' }} />;
}

// Small inline leaf sprig (three leaves on a stem) for the footer vine, ribbon and frame corners. Named Blossom for historical reasons.
const SPRIG = 'M0 0 C-4.6 -3 -4.6 -9 0 -12 C4.6 -9 4.6 -3 0 0Z';
const SPRIG_HALF = 'M0 0 C4.6 -3 4.6 -9 0 -12Z';
export function Blossom({ fill = '#566A2B', centre = '#E6C875', size = 18, className = '', x, y, style }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} x={x} y={y} className={className} style={style} aria-hidden="true">
      <path d="M0 11 V4" stroke={centre} strokeWidth="1" strokeLinecap="round" />
      {[[-52, 0.78], [52, 0.78], [0, 1]].map(([r, sc], i) => (
        <g key={i} transform={`translate(0 5) rotate(${r}) scale(${sc})`}>
          <path d={SPRIG} fill={fill} />
          <path d={SPRIG_HALF} fill="#fff" opacity=".18" />
          <path d="M0 -.5 V-10.5" stroke={centre} strokeWidth=".9" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}
export const BLOSSOM_COLOURS = ['#566A2B', '#C9A24A', '#3F4E21', '#8E9B52', '#E0BE63'];
