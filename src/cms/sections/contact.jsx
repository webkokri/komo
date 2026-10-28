import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Arrow } from '../../components/Icons.jsx';
import { EASE, Item, Stagger } from '../../components/motion.jsx';
import { submitEnquiry } from '../api.js';
import { Btn, Lnk, Txt } from '../fields.jsx';
import { useCms } from '../store.jsx';

function Field({ base, field, index }) {
  const id = `f-${field.name}`;
  const common = { id, name: field.name, required: field.required, autoComplete: field.autocomplete };
  let control;
  if (field.type === 'select') {
    control = (
      <select {...common} defaultValue="">
        <option value="">{field.placeholder || 'Choose one'}</option>
        {(field.options || []).map((o, i) => <option key={i}>{o}</option>)}
      </select>
    );
  } else if (field.type === 'textarea') {
    control = <textarea {...common} rows={6} placeholder={field.placeholder} />;
  } else {
    control = <input {...common} type={field.type || 'text'} placeholder={field.placeholder} {...(field.type === 'number' ? { min: 1, inputMode: 'numeric' } : {})} />;
  }
  return (
    <Item className={`field ${field.full ? 'field--full' : ''}`}>
      <label htmlFor={id}><Txt path={`${base}.fields.${index}.label`} /></label>
      {control}
    </Item>
  );
}

function EnquiryForm({ base, props: p, onSent }) {
  const { editing } = useCms();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) return;
    setSending(true);
    setError('');
    try {
      await submitEnquiry(Object.fromEntries(new FormData(e.currentTarget)));
      onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.form
      key="form"
      className="form"
      onSubmit={handleSubmit}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
    >
      {p.fields.map((f, i) => <Field key={f.name + i} base={base} field={f} index={i} />)}
      {/* honeypot: real visitors never see or fill this */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <Item className="form__foot">
        <Txt path={`${base}.note`} className="form__note" />
        <motion.button
          type="submit"
          className="btn btn--moss btn--lg"
          disabled={sending}
          whileTap={{ scale: 0.96 }}
          style={{ border: 0, opacity: sending ? 0.75 : 1 }}
        >
          {sending ? (
            <>
              <Txt path={`${base}.sendingLabel`} />
              <motion.span
                aria-hidden="true"
                style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            </>
          ) : (
            <><Txt path={`${base}.submitLabel`} /> <Arrow /></>
          )}
        </motion.button>
        {error ? <p role="alert" style={{ color: '#9b2c2c', margin: 0, flexBasis: '100%' }}>{error}</p> : null}
      </Item>
    </motion.form>
  );
}

function Success({ base, onReset }) {
  return (
    <motion.div
      key="success"
      role="status"
      className="success"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <svg width="56" height="56" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <motion.circle cx="24" cy="24" r="22" stroke="var(--moss)" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
        <motion.path d="M15 24l6 6 12-13" stroke="var(--moss)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6, ease: EASE }} />
      </svg>
      <Txt path={`${base}.successTitle`} as="h2" className="h2" style={{ fontSize: 36 }} />
      <Txt path={`${base}.successText`} as="p" multiline />
      <div className="success__actions">
        <Btn path={`${base}.successButton`} className="btn btn--moss btn--sm" />
        <button type="button" className="btn btn--outline-dark btn--sm" onClick={onReset}><Txt path={`${base}.resetLabel`} /></button>
      </div>
    </motion.div>
  );
}

export function ContactSection({ base, props: p }) {
  const { get, editing } = useCms();
  const [sent, setSent] = useState(false);
  const socials = get('global.contact.socials') || [];

  return (
    <section aria-label="Enquiry" style={{ paddingBottom: 'var(--section)' }}>
      <div className="container contact-layout">
        <motion.aside
          className="contact-aside"
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        >
          <div className="contact-aside__group">
            <Txt path={`${base}.reachTitle`} as="h2" />
            <Txt path="global.contact.phone" className="contact-aside__big" />
            <Txt path="global.contact.email" className="contact-aside__big" />
            <Txt path="global.contact.address" style={{ color: 'var(--muted-dark)' }} />
            <Txt path="global.contact.hours" style={{ color: 'var(--muted-dark)' }} />
          </div>
          <div className="contact-aside__group">
            <Txt path={`${base}.nextTitle`} as="h2" />
            <Stagger as="ol" className="next-steps" delay={0.6} gap={0.12}>
              {p.steps.map((_, i) => (
                <Item as="li" key={i}>
                  <span className="next-steps__n">{i + 1}</span>
                  <Txt path={`${base}.steps.${i}`} multiline />
                </Item>
              ))}
            </Stagger>
          </div>
          <div className="contact-aside__group socials" style={{ flexDirection: 'row' }}>
            {socials.map((s, i) => <Lnk key={i} to={s.href}><Txt path={`global.contact.socials.${i}.label`} /></Lnk>)}
          </div>
        </motion.aside>

        <div className="contact-main">
          {editing && (
            <button type="button" className="cms-ui cms-chip" onClick={() => setSent((v) => !v)}>
              {sent ? 'Edit the form' : 'Edit the success message'}
            </button>
          )}
          <AnimatePresence mode="wait">
            {sent ? <Success base={base} onReset={() => setSent(false)} /> : <EnquiryForm base={base} props={p} onSent={() => setSent(true)} />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
