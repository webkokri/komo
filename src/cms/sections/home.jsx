import { useId, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DappledLight from '../../components/DappledLight.jsx';
import { Quote } from '../../components/Icons.jsx';
import { EASE, Item, Reveal, Stagger } from '../../components/motion.jsx';
import { Btn, CmsPhoto, Lnk, Txt } from '../fields.jsx';
import { evenGrid } from '../grid.js';
import { useCms } from '../store.jsx';
import { mediaUrl } from '../api.js';

export function Hero({ base, props: p }) {
  const { editing } = useCms();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  return (
    <section className="hero" ref={ref}>
      <div className="container hero__inner">
        <motion.div className="hero__copy" style={editing ? undefined : { y: copyY }}>
          <Txt
            path={`${base}.eyebrow`}
            as="p"
            className="eyebrow"
            motionProps={{
              initial: { opacity: 0, letterSpacing: '0.5em' },
              animate: { opacity: 1, letterSpacing: '0.24em' },
              transition: { duration: 1.1, ease: EASE },
            }}
          />
          <Txt path={`${base}.title`} as="h1" className="h1" anim="split" delay={0.2} />
          <Txt path={`${base}.lead`} as="p" className="lead" anim="reveal" delay={0.7} multiline />
          <Reveal className="hero__actions" delay={0.85}>
            <Btn path={`${base}.primary`} className="btn btn--light" arrow />
            <Btn path={`${base}.secondary`} className="btn btn--ghost-light" />
          </Reveal>
        </motion.div>

        <motion.div style={editing ? undefined : { y: photoY }}>
          <CmsPhoto path={`${base}.image`} tone="dark" className="hero__photo" height="clamp(360px, 44vw, 600px)">
            {p.dappled !== false && <DappledLight />}
          </CmsPhoto>
        </motion.div>
      </div>
    </section>
  );
}

function SectionHead({ base, headId, link }) {
  return (
    <div className="section-head">
      <Reveal className="section-head__text">
        <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" />
        <Txt path={`${base}.title`} as="h2" className="h2" id={headId} />
      </Reveal>
      {link ? (
        <Reveal delay={0.15}>
          <Btn path={`${base}.link`} className="link-arrow" arrow />
        </Reveal>
      ) : null}
    </div>
  );
}

export function CardGrid({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section" aria-labelledby={headId}>
      <div className="container">
        <SectionHead base={base} headId={headId} link />
        <Stagger className="grid-even" style={evenGrid(p.items.length, { '--gap': '48px 40px' })}>
          {p.items.map((it, i) => (
            <Item as="article" key={i} className="service-card">
              <Lnk to={it.to} className="service-card__link">
                <Txt path={`${base}.items.${i}.num`} className="num" />
                <Txt path={`${base}.items.${i}.title`} as="h3" className="h3" />
                <Txt path={`${base}.items.${i}.text`} as="p" multiline />
              </Lnk>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Steps({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section section--dark" aria-labelledby={headId}>
      <div className="container">
        <Reveal className="section-head__text" style={{ marginBottom: 56 }}>
          <Txt path={`${base}.eyebrow`} as="p" className="eyebrow" />
          <Txt path={`${base}.title`} as="h2" className="h2" id={headId} />
        </Reveal>
        <Stagger as="ol" className="steps grid-even" style={evenGrid(p.items.length, { '--gap': '40px' })} gap={0.14}>
          {p.items.map((it, i) => (
            <Item as="li" key={i} className="step">
              <motion.span
                className="step__dot"
                initial={{ scale: 0 }}
                whileInView={{ scale: [0, 1.6, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.14 }}
              />
              <h3 className="h3">{i + 1} · <Txt path={`${base}.items.${i}.title`} /></h3>
              <Txt path={`${base}.items.${i}.text`} as="p" multiline />
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function WorkGrid({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section" aria-labelledby={headId}>
      <div className="container">
        <SectionHead base={base} headId={headId} link />
        <div className="grid-even" style={evenGrid(p.items.length)}>
          {p.items.map((it, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <Lnk to={it.to} className="work-card hover-zoom">
                <CmsPhoto path={`${base}.items.${i}.image`} height={440} />
                <Txt path={`${base}.items.${i}.cat`} className="work-card__cat" />
                <Txt path={`${base}.items.${i}.title`} as="h3" className="work-card__title" />
                <Txt path={`${base}.items.${i}.meta`} className="work-card__meta" />
              </Lnk>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Story({ base, props: p }) {
  const headId = useId();
  return (
    <section className="section section--sand" aria-labelledby={headId}>
      <div className="container split">
        <CmsPhoto path={`${base}.image`} tone="sand" height={520} />
        <div className="stack" style={{ gap: 24 }}>
          <Txt
            path={`${base}.kanji`}
            as="p"
            className="kanji"
            motionProps={{
              initial: { opacity: 0, filter: 'blur(8px)' },
              whileInView: { opacity: 1, filter: 'blur(0px)' },
              viewport: { once: true },
              transition: { duration: 1.4, ease: EASE },
            }}
          />
          <Txt path={`${base}.title`} as="h2" className="h2" anim="split" inView delay={0.1} />
          <Txt path={`${base}.text`} as="p" className="muted" style={{ margin: 0, fontSize: 17 }} anim="reveal" delay={0.2} multiline />
          <Stagger as="ul" className="principles" delay={0.3}>
            {p.principles.map((pr, i) => (
              <Item as="li" key={i}>
                <span className="principles__dot" />
                <span>
                  <strong style={{ fontWeight: 600 }}><Txt path={`${base}.principles.${i}.title`} /></strong>{' '}
                  <Txt path={`${base}.principles.${i}.text`} />
                </span>
              </Item>
            ))}
          </Stagger>
          <Reveal delay={0.4}>
            <Btn path={`${base}.link`} className="link-arrow" arrow />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Testimonial({ base, props: p }) {
  const logos = p.logos || [];
  return (
    <section className="section" aria-label="Client testimonial">
      <div className="container container--narrow">
        <Reveal className="testimonial">
          <Quote />
          <Txt path={`${base}.quote`} as="blockquote" multiline />
          <Txt path={`${base}.by`} as="p" className="testimonial__by" />
        </Reveal>
      </div>
      {logos.length > 0 && (
        <div className="container marquee">
          <Txt path={`${base}.logosLabel`} as="p" className="eyebrow" style={{ color: 'var(--ink-soft)' }} />
          <div className="marquee__viewport">
            {/* the list is duplicated so the loop is seamless; only the first copy is editable */}
            <div className="marquee__track">
              {[...logos, ...logos].map((logo, idx) => {
                const i = idx % logos.length;
                const first = idx < logos.length;
                return (
                  <span key={idx} className="logo-slot" aria-hidden={first ? undefined : 'true'}>
                    {logo.src ? (
                      <img src={mediaUrl(logo.src)} alt={first ? logo.text : ''} style={{ maxHeight: 36, width: 'auto' }} />
                    ) : first ? (
                      <Txt path={`${base}.logos.${i}.text`} />
                    ) : (
                      logo.text
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
