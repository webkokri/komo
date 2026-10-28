import { useState } from 'react';
import { THEME_VARS } from '../../cms/registry.js';
import { Button, Card, CardHeader, Field, Input, PageHeader, Spinner, Textarea } from '../ui.jsx';
import { useGlobal } from '../data.js';

const DEFAULT_COLORS = { '--paper': '#F6F1E6', '--paper-2': '#EDE5D2', '--ink': '#1E2A1F', '--moss': '#4A6B3F', '--sun': '#D9A441' };

export default function SiteSettings() {
  const { doc, setDoc, save, error } = useGlobal();
  const [state, setState] = useState({ busy: false, error: '', saved: false });
  if (error) return <p className="sc-error">{error}</p>;
  if (!doc) return <Spinner />;

  const patch = (group, value) => {
    setState({ ...state, saved: false });
    setDoc({ ...doc, [group]: { ...doc[group], ...value } });
  };
  const header = doc.header || {};
  const footer = doc.footer || {};
  const contact = doc.contact || {};
  const theme = doc.theme || {};
  const socials = contact.socials || [];
  const setSocial = (i, k, v) => patch('contact', { socials: socials.map((s, n) => (n === i ? { ...s, [k]: v } : s)) });

  const submit = async () => {
    setState({ busy: true, error: '', saved: false });
    try {
      await save(doc);
      setState({ busy: false, error: '', saved: true });
    } catch (err) {
      setState({ busy: false, error: err.message, saved: false });
    }
  };

  return (
    <>
      <PageHeader title="Site settings" description="Details shared across every page. Saving publishes immediately." />
      <Card>
        <CardHeader title="Brand" />
        <div className="sc-form">
          <Field label="Logo word"><Input value={header.logoWord || ''} onChange={(e) => patch('header', { logoWord: e.target.value })} /></Field>
          <Field label="Logo tagline"><Input value={header.logoSub || ''} onChange={(e) => patch('header', { logoSub: e.target.value })} /></Field>
          <Field label="Logo image URL" help="Optional. Upload images in the Media library and paste the link here."><Input value={header.logoImage || ''} onChange={(e) => patch('header', { logoImage: e.target.value })} /></Field>
        </div>
      </Card>
      <Card className="sc-mt">
        <CardHeader title="Contact details" description="Used in the footer and on the contact page." />
        <div className="sc-form">
          <Field label="Phone"><Input value={contact.phone || ''} onChange={(e) => patch('contact', { phone: e.target.value })} /></Field>
          <Field label="Email"><Input value={contact.email || ''} onChange={(e) => patch('contact', { email: e.target.value })} /></Field>
          <Field label="Address"><Textarea rows={2} value={contact.address || ''} onChange={(e) => patch('contact', { address: e.target.value })} /></Field>
          <Field label="Opening hours"><Input value={contact.hours || ''} onChange={(e) => patch('contact', { hours: e.target.value })} /></Field>
        </div>
        <h3 className="sc-sub">Social links</h3>
        <div className="sc-rows">
          {socials.map((s, i) => (
            <div className="sc-row" key={i}>
              <Input aria-label="Network" placeholder="Instagram" value={s.label} onChange={(e) => setSocial(i, 'label', e.target.value)} />
              <Input aria-label="URL" placeholder="https://" value={s.href} onChange={(e) => setSocial(i, 'href', e.target.value)} />
              <Button size="icon" variant="danger" title="Remove" onClick={() => patch('contact', { socials: socials.filter((_, n) => n !== i) })}>✕</Button>
            </div>
          ))}
          <Button size="sm" onClick={() => patch('contact', { socials: [...socials, { label: '', href: '' }] })}>+ Add social link</Button>
        </div>
      </Card>
      <Card className="sc-mt">
        <CardHeader title="Footer text" />
        <div className="sc-form">
          <Field label="Tagline"><Textarea rows={2} value={footer.tagline || ''} onChange={(e) => patch('footer', { tagline: e.target.value })} /></Field>
          <Field label="Copyright"><Input value={footer.copyright || ''} onChange={(e) => patch('footer', { copyright: e.target.value })} /></Field>
          <Field label="Legal line"><Input value={footer.legal || ''} onChange={(e) => patch('footer', { legal: e.target.value })} /></Field>
        </div>
      </Card>
      <Card className="sc-mt">
        <CardHeader title="Colours" action={<Button size="sm" onClick={() => patch('theme', Object.fromEntries(THEME_VARS.map(([k]) => [k, ''])))}>Reset to default</Button>} />
        <div className="sc-colors">
          {THEME_VARS.map(([key, label]) => (
            <label key={key} className="sc-color">
              <input type="color" value={theme[key] || DEFAULT_COLORS[key] || '#000000'} onChange={(e) => patch('theme', { [key]: e.target.value })} />
              <span>{label}</span>
              <code>{theme[key] || 'default'}</code>
            </label>
          ))}
        </div>
      </Card>
      <div className="sc-savebar">
        {state.error && <span className="sc-error" role="alert">{state.error}</span>}
        {state.saved && <span className="sc-ok">Published</span>}
        <Button variant="primary" onClick={submit} disabled={state.busy}>{state.busy ? 'Saving…' : 'Save and publish'}</Button>
      </div>
    </>
  );
}
