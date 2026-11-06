import { Lnk, Txt } from '../cms/fields.jsx';
import { useCms } from '../cms/store.jsx';
import { Stagger, Item } from './motion.jsx';
import { motion } from 'framer-motion';
import { BLOSSOM_COLOURS, Blossom } from './Flora.jsx';

const LEAF = 'M0 0 C4 -6.5 12 -6.5 17 0 C12 6.5 4 6.5 0 0Z';
const VINE = Array.from({ length: 14 }, (_, i) => ({ x: 60 + i * 80, up: i % 2 === 0 }));

/** A vine that grows along the top of the footer, leaf by leaf. */
function Vine() {
  return (
    <svg className="footer__vine" viewBox="0 0 1200 44" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <motion.path d="M0 22 C100 6 180 38 300 22 S500 6 600 22 S800 38 900 22 S1100 6 1200 22" fill="none" stroke="var(--sun)" strokeWidth="1.4" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }} />
      {VINE.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.up ? 15 : 29}) rotate(${l.up ? -38 : 38})`}>
          <motion.path d={LEAF} fill="var(--sun)" fillOpacity="0.85" style={{ transformBox: 'fill-box', transformOrigin: '0% 50%' }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', stiffness: 200, damping: 13, delay: 0.5 + i * 0.13 }} />
        </g>
      ))}
      {VINE.filter((_, i) => i % 2 === 1).map((l, i) => (
        <g key={`b${i}`} transform={`translate(${l.x + 40} ${l.up ? 22 : 24})`}>
          <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center' }} initial={{ scale: 0, rotate: -60 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ type: 'spring', stiffness: 130, damping: 10, delay: 1.1 + i * 0.2 }}>
            <g className="flora__breath" style={{ animationDelay: `${i * 0.4}s` }}><Blossom fill={BLOSSOM_COLOURS[i % 3]} size={20} x={-10} y={-10} /></g>
          </motion.g>
        </g>
      ))}
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
