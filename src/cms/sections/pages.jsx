import { useId, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import Accordion from '../../components/Accordion.jsx';
import DappledLight from '../../components/DappledLight.jsx';
import { ValueIcon } from '../../components/Icons.jsx';
import { EASE, Item, Reveal, SplitText, Stagger } from '../../components/motion.jsx';
import { Btn, CmsPhoto, Lnk, Txt } from '../fields.jsx';
import { evenGrid } from '../grid.js';
import { useCms } from '../store.jsx';

const TONE = { dark: 'section--dark', sand: 'section--sand', moss: 'section--moss', default: '' };

export function Cta({ base, props: p }) {
  const { get } = useCms();
  const title = get(`${base}.title`);
  return (
    <section className="section--moss cta-band" aria-label={title}>
      <div className="container cta-band__inner">
        <div className="stack" style={{ gap: 14, maxWidth: 640 }}>
          <Txt path={`${base}.title`} as="h2" className="display" anim="split" inView delay={0} />
          <Txt path={`${base}.text`} as="p" anim="reveal" delay={0.25} multiline />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Btn path={`${base}.button`} className="btn btn--light btn--lg" arrow />
        </motion.div>
      </div>
    </section>
  );
}

export function PageHero({ base, props: p }) {
  const { sections } = useCms();
  const dark = p.variant !== 'light';
  const chips = p.showChips ? sections.filter((s) => s.type === 'serviceBlock' && !s.hidden) : [];
  const inner = (
    <div className={`container page-hero ${dark ? '' : 'page-hero--light'}`} style={dark ? undefined : { paddingBottom: 48 }}>
      <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" anim="reveal" />
      <Txt path={`${base}.title`} as="h1" className="h1 h1--page" anim="split" />
      <Txt path={`${base}.lead`} as="p" className="lead" anim="reveal" delay={0.6} multiline />
      {chips.length > 0 && (
        <Stagger as="nav" aria-label="Jump to a service" className="chips" delay={0.8} gap={0.06}>
          {chips.map((s) => (
            <Item as="a" key={s.id} href={`#${s.props.anchor}`} className="chip">{s.props.chip}</Item>
          ))}
        </Stagger>
      )}
    </div>
  );
  return dark ? <section className="hero">{inner}</section> : <section>{inner}</section>;
}

export function ServiceBlock({ base, props: p }) {
  const headId = useId();
  const { editing } = useCms();
  return (
    <div className="container service-section">
      <section id={p.anchor} aria-labelledby={headId} className={`split service-block ${p.flip ? 'service-block--flip' : ''}`}>
        <div className="service-block__photo">
          <CmsPhoto path={`${base}.image`} height={480} />
        </div>
        <Stagger className="service-block__copy" gap={0.08}>
          <Item as="span" className="num"><Txt path={`${base}.num`} /> — <Txt path={`${base}.name`} /></Item>
          <Item as="h2" id={headId} className="h2 h2--sm"><Txt path={`${base}.title`} /></Item>
          <Item as="p"><Txt path={`${base}.body`} multiline /></Item>
          <Item as="ul" className="includes">
            {p.includes.map((_, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.07, ease: EASE }}
              >
                <Txt path={`${base}.includes.${i}`} />
              </motion.li>
            ))}
          </Item>
          <Item className="service-block__foot">
            {p.price || editing ? <span className="price"><Txt path={`${base}.priceLabel`} /> <strong><Txt path={`${base}.price`} /></strong></span> : <span />}
            <Lnk to={p.ctaTo} className="btn btn--moss btn--sm"><Txt path={`${base}.ctaLabel`} /></Lnk>
          </Item>
        </Stagger>
      </section>
    </div>
  );
}

export function FeatureGrid({ base, props: p }) {
  const headId = useId();
  return (
    <section className={`section ${TONE[p.tone] ?? TONE.dark}`} aria-labelledby={headId}>
      <div className="container">
        <Reveal className="section-head__text" style={{ marginBottom: 48 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" />
          <Txt path={`${base}.title`} as="h2" className="h2" id={headId} />
        </Reveal>
        <Stagger className="grid-even" style={evenGrid(p.items.length, { '--gap': '32px' })} gap={0.1}>
          {p.items.map((_, i) => (
            <Item key={i} className="included-item">
              <Txt path={`${base}.items.${i}.title`} as="h3" />
              <Txt path={`${base}.items.${i}.text`} as="p" multiline />
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Faq({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section" aria-labelledby={headId}>
      <div className="container grid-auto" style={{ '--min': '360px', '--gap': '48px' }}>
        <Reveal className="stack" style={{ gap: 16 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" />
          <Txt path={`${base}.title`} as="h2" className="h2" id={headId} />
        </Reveal>
        <Reveal delay={0.15}>
          <Accordion base={`${base}.items`} count={p.items.length} />
        </Reveal>
      </div>
    </section>
  );
}

const WIDE_SPOTS = [
  { cx: 620, cy: 90, r: 60, o: 0.22 },
  { cx: 520, cy: 200, r: 24, o: 0.18 },
  { cx: 700, cy: 250, r: 16, o: 0.24 },
  { cx: 180, cy: 120, r: 34, o: 0.12 },
  { cx: 320, cy: 300, r: 20, o: 0.16 },
  { cx: 420, cy: 70, r: 12, o: 0.2 },
];

export function AboutHero({ base }) {
  return (
    <section className="hero">
      <div className="container hero__inner" style={{ alignItems: 'end', paddingBottom: 56 }}>
        <div className="hero__copy" style={{ gap: 24 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" anim="reveal" />
          <Txt path={`${base}.title`} as="h1" className="h1 h1--page" anim="split" />
        </div>
        <Txt path={`${base}.lead`} as="p" className="lead" anim="reveal" delay={0.6} multiline />
      </div>
      <div className="container">
        <CmsPhoto path={`${base}.image`} tone="dark" className="about-hero__photo" height="clamp(300px, 36vw, 520px)">
          <DappledLight spots={WIDE_SPOTS} viewBox="0 0 800 400" />
        </CmsPhoto>
      </div>
    </section>
  );
}

export function TextColumns({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section" aria-labelledby={headId}>
      <div className="container grid-auto" style={{ '--min': '380px', '--gap': '56px' }}>
        <div className="stack" style={{ gap: 16 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" anim="reveal" />
          <Txt path={`${base}.title`} as="h2" className="h2" anim="split" inView delay={0} />
          <Txt
            path={`${base}.kanji`}
            as="p"
            className="kanji"
            style={{ fontSize: 44, marginTop: 8 }}
            motionProps={{
              initial: { opacity: 0, filter: 'blur(8px)' },
              whileInView: { opacity: 1, filter: 'blur(0px)' },
              viewport: { once: true },
              transition: { duration: 1.4, ease: EASE, delay: 0.3 },
            }}
          />
        </div>
        <Stagger className="stack muted" style={{ gap: 20, fontSize: 17 }} gap={0.12}>
          {p.paragraphs.map((_, i) => (
            <Txt key={i} path={`${base}.paragraphs.${i}`} as="p" anim="item" style={{ margin: 0 }} multiline />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function ValueCards({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section section--sand" aria-labelledby={headId}>
      <div className="container">
        <Reveal className="section-head__text" style={{ marginBottom: 48 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" />
          <Txt path={`${base}.title`} as="h2" className="h2" id={headId} />
        </Reveal>
        <Stagger className="grid-even" style={evenGrid(p.items.length, { '--gap': '24px' })} gap={0.12}>
          {p.items.map((v, i) => (
            <Item key={i}>
              <motion.div
                className="value-card"
                whileHover={{ y: -6, boxShadow: '0 24px 40px -28px rgba(27,35,29,.45)' }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <motion.span
                  style={{ display: 'inline-flex', width: 'fit-content' }}
                  whileHover={{ rotate: v.icon === 'sun' ? 90 : 8 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <ValueIcon name={v.icon} />
                </motion.span>
                <Txt path={`${base}.items.${i}.title`} as="h3" className="h3" style={{ fontSize: 24 }} />
                <Txt path={`${base}.items.${i}.text`} as="p" multiline />
              </motion.div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function TeamGrid({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section" aria-labelledby={headId}>
      <div className="container">
        <Reveal className="section-head__text" style={{ marginBottom: 48 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" />
          <Txt path={`${base}.title`} as="h2" className="h2" id={headId} />
        </Reveal>
        <div className="grid-even" style={evenGrid(p.items.length)}>
          {p.items.map((_, i) => (
            <Reveal key={i} className="team-card hover-zoom" delay={i * 0.1}>
              <CmsPhoto path={`${base}.items.${i}.image`} height={320} />
              <Txt path={`${base}.items.${i}.name`} as="h3" />
              <Txt path={`${base}.items.${i}.role`} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Workshop({ base }) {
  const headId = useId();
  return (
    <section className="section section--dark" aria-labelledby={headId}>
      <div className="container split">
        <Stagger className="stack" style={{ gap: 20 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" anim="item" />
          <Txt path={`${base}.title`} as="h2" className="h2" anim="item" id={headId} />
          <Txt path={`${base}.text`} as="p" className="muted" style={{ margin: 0, fontSize: 17 }} anim="item" multiline />
          <Txt path={`${base}.note`} anim="item" style={{ fontSize: 15 }} />
          <Item>
            <Btn path={`${base}.button`} className="btn btn--outline-light btn--sm" style={{ fontSize: 15 }} />
          </Item>
        </Stagger>
        <CmsPhoto path={`${base}.image`} tone="dark" height={460} />
      </div>
    </section>
  );
}

export function ProjectGrid({ base, props: p }) {
  const { editing } = useCms();
  const [filter, setFilter] = useState('All');
  const all = p.items.map((it, i) => ({ ...it, i }));
  const shown = filter === 'All' || editing ? all : all.filter((it) => it.cat === filter);
  const noun = shown.length === 1 ? p.countOne : p.countMany;

  return (
    <>
      <section>
        <div className="container" style={{ paddingBottom: 40 }}>
          <Reveal className="filter-bar" style={{ marginTop: 0 }}>
            <LayoutGroup>
              <div role="group" aria-label="Filter projects" className="filters">
                {p.filters.map((f) => {
                  const active = f === filter;
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={active}
                      className={`filter ${active ? 'is-active' : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {active && (
                        <motion.span layoutId="filter-pill" className="filter__pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                      )}
                      <span className="filter__label">{f}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
            <AnimatePresence mode="wait">
              <motion.span
                key={shown.length}
                className="muted"
                style={{ fontSize: 14 }}
                aria-live="polite"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {shown.length} {noun}
              </motion.span>
            </AnimatePresence>
          </Reveal>
        </div>
      </section>

      <section aria-label="Projects" style={{ paddingBottom: 'var(--section)' }}>
        <motion.div layout className="container project-grid" style={evenGrid(all.length)}>
          <AnimatePresence mode="popLayout">
            {shown.map((it, n) => (
              <motion.article
                layout
                key={it.i}
                className="work-card hover-zoom"
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE, delay: n * 0.05 } }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3 } }}
              >
                <CmsPhoto path={`${base}.items.${it.i}.image`} height={380} />
                <Txt path={`${base}.items.${it.i}.cat`} className="work-card__cat" />
                <Txt path={`${base}.items.${it.i}.title`} as="h2" className="work-card__title" />
                <Txt path={`${base}.items.${it.i}.meta`} className="work-card__meta" />
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  );
}

export function ImageBand({ base, props: p }) {
  return (
    <div className="container" style={{ margin: '56px auto' }}>
      <CmsPhoto path={`${base}.image`} height={p.height || 360} />
    </div>
  );
}

export function TextBlock({ base, props: p }) {
  const align = p.align === 'center' ? 'center' : 'left';
  return (
    <section className={`section ${TONE[p.tone] ?? ''}`}>
      <div className="container container--narrow" style={{ textAlign: align }}>
        <div className="stack" style={{ gap: 20, alignItems: align === 'center' ? 'center' : 'flex-start' }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" anim="reveal" />
          <Txt path={`${base}.title`} as="h2" className="h2" anim="split" inView />
          <Txt path={`${base}.body`} as="p" className="muted" style={{ margin: 0, fontSize: 17 }} anim="reveal" delay={0.2} multiline />
          <Reveal delay={0.3}><Btn path={`${base}.button`} className="btn btn--moss" arrow /></Reveal>
        </div>
      </div>
    </section>
  );
}

export function Spacer({ props: p }) {
  return <div aria-hidden="true" style={{ height: p.height || 64 }} />;
}

export function NotFoundBlock({ base }) {
  return (
    <section className="container not-found">
      <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" anim="reveal" />
      <Txt path={`${base}.title`} as="h1" className="h1 h1--page" anim="split" />
      <Reveal delay={0.5}>
        <Btn path={`${base}.button`} className="btn btn--moss" arrow />
      </Reveal>
    </section>
  );
}
