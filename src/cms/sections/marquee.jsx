import { Fragment } from 'react';
import { BLOSSOM_COLOURS, Blossom } from '../../components/Flora.jsx';
import { Txt } from '../fields.jsx';
import { useCms } from '../store.jsx';

/** A slowly scrolling ribbon of words between sections. */
export function Marquee({ base, props: p }) {
  const { editing } = useCms();
  const items = p.items || [];
  const tone = p.tone === 'light' ? 'light' : 'dark';
  const run = (copy) => items.map((it, i) => (
    <Fragment key={`${copy}-${i}`}>
      <span className="ribbon__item">{copy === 0 ? <Txt path={`${base}.items.${i}.text`} /> : it.text}</span>
      <Blossom className="ribbon__star" fill={BLOSSOM_COLOURS[i % 3]} size={22} />
    </Fragment>
  ));
  return (
    <section className={`ribbon ribbon--${tone} ${editing ? 'is-static' : ''}`} aria-label="Our services" style={{ '--speed': `${p.speed || 38}s` }}>
      <div className="ribbon__track">
        <div className="ribbon__row">{run(0)}</div>
        {!editing && <div className="ribbon__row" aria-hidden="true">{run(1)}</div>}
        {!editing && <div className="ribbon__row" aria-hidden="true">{run(2)}</div>}
      </div>
    </section>
  );
}
