import { Lnk, Txt } from '../cms/fields.jsx';
import { useCms } from '../cms/store.jsx';
import { Stagger, Item } from './motion.jsx';
import { motion } from 'framer-motion';

// The vine is one smooth line; every leaf is rooted ON the line and grows out along it, alternating above and below.
const SEGS = [
  [[0, 22], [100, 6], [180, 38], [300, 22]],
  [[300, 22], [420, 6], [500, 6], [600, 22]],
  [[600, 22], [700, 38], [800, 38], [900, 22]],
  [[900, 22], [1000, 6], [1100, 6], [1200, 22]],
];
const bez = (P, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
const LEAF_SIZE = { olive: 52, gold: 52, pair: 46 };
const KINDS = ['gold', 'olive', 'pair', 'olive', 'gold'];
const VINE = Array.from({ length: 18 }, (_, i) => {
  const pos = (i + 0.5) / 18 * SEGS.length;
  const seg = Math.min(SEGS.length - 1, Math.floor(pos));
  const t = pos - seg;
  const [x, y] = bez(SEGS[seg], t);
  const [x2, y2] = bez(SEGS[seg], Math.min(1, t + 0.01));
  const [x1, y1] = bez(SEGS[seg], Math.max(0, t - 0.01));
  const tangent = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const side = i % 2 ? 1 : -1; // -1 = above the line, 1 = below
  const kind = KINDS[i % KINDS.length];
  // the image points "up" at rotation 0; aim it 48 degrees off the line, forward along it
  const rot = tangent + side * 48 + 90;
  return { x, y, rot, kind, size: LEAF_SIZE[kind], i };
});

/** A vine that grows along the top of the footer: the line draws itself, then leaves unfurl from points on it. */
function Vine() {
  return (
    <svg className="footer__vine" viewBox="0 0 1200 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(0 36)">
        <motion.path d="M0 22 C100 6 180 38 300 22 S500 6 600 22 S800 38 900 22 S1100 6 1200 22" fill="none" stroke="var(--sun)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }} />
        {VINE.map((l) => (
          <g key={l.i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)})`}>
            <motion.g style={{ transformBox: 'view-box', transformOrigin: '0px 0px' }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.4 + l.i * 0.12 }}>
              <image href={`/decor/leaf-${l.kind}.png?v=10`} x={-l.size / 2} y={-l.size + 4} width={l.size} height={l.size} preserveAspectRatio="xMidYMax meet" />
            </motion.g>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function Footer() {
  const { get, selectGlobal, editing } = useCms();
  const columns = get('global.footer.columns') || [];
  const socials = get('global.contact.socials') || [];

  return (
    <footer className="footer" onClickCapture={editing ? () => selectGlobal('footer') : undefined}>
      <Vine />
      <div className="container footer__inner">
        <Stagger className="footer__cols" gap={0.08}>
          <Item className="footer__col footer__brand">
            <Txt path="global.header.logoWord" className="logo__word" style={{ color: 'var(--paper)' }} />
            <Txt path="global.footer.tagline" as="p" multiline />
          </Item>
          {columns.map((col, c) => (
            <Item className="footer__col" key={c}>
              <Txt path={`global.footer.columns.${c}.title`} as="h2" />
              {col.links.map((l, i) => (
                <Lnk key={i} to={l.to}><Txt path={`global.footer.columns.${c}.links.${i}.label`} /></Lnk>
              ))}
            </Item>
          ))}
          <Item className="footer__col">
            <Txt path="global.footer.contactTitle" as="h2" />
            <Txt path="global.contact.phone" />
            <Txt path="global.contact.email" />
            <Txt path="global.contact.address" />
            <div className="socials" style={{ marginTop: 4 }}>
              {socials.map((s, i) => (
                <Lnk key={i} to={s.href}><Txt path={`global.contact.socials.${i}.label`} /></Lnk>
              ))}
            </div>
          </Item>
        </Stagger>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} <Txt path="global.footer.copyright" /></span>
          <Txt path="global.footer.legal" />
        </div>
      </div>
    </footer>
  );
}
