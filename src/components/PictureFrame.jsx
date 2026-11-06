/** A gold gallery frame with a cream mat, art-deco corner fans and a brass picture light. Pure CSS/SVG, sits over a photo. */
const Fan = () => (
  <svg viewBox="0 0 60 60" aria-hidden="true">
    {[10, 20, 30, 40, 50].map((r) => <path key={r} className="pframe__arc" d={`M0 ${r} A${r} ${r} 0 0 0 ${r} 0`} pathLength="1" />)}
    {[0, 22, 45, 68, 90].map((a) => <line key={a} className="pframe__ray" x1="0" y1="0" x2={Math.cos((a * Math.PI) / 180) * 56} y2={Math.sin((a * Math.PI) / 180) * 56} pathLength="1" />)}
    <rect x="2" y="2" width="7" height="7" transform="rotate(45 5.5 5.5)" fill="currentColor" />
  </svg>
);

export default function PictureFrame() {
  return (
    <div className="pframe" aria-hidden="true">
      <span className="pframe__border" />
      <span className="pframe__mat" />
      <span className="pframe__shine" />
      {['tl', 'tr', 'br', 'bl'].map((c) => <span key={c} className={`pframe__corner pframe__corner--${c}`}><Fan /></span>)}
      <span className="pframe__light"><i /><b /></span>
      <span className="pframe__plaque">Interior · Komorebi</span>
    </div>
  );
}
