import { useState } from 'react';
import { GLOBAL } from '../../cms/defaults.js';
import { useAuth } from '../auth.jsx';
import { useGlobal } from '../data.js';
import { Button, Card, CardHeader, Field, Input, Notice, PageHeader, Spinner, Textarea } from '../ui.jsx';

const BOXES = [
  ['head', 'Header code', 'Added inside <head> on every page. Good for verification tags, fonts, extra analytics.', '<!-- e.g. <meta name="…"> or <script>…</script> -->'],
  ['bodyStart', 'Body start code', 'Added right after <body> opens. Used by some tag managers.', '<!-- e.g. <noscript>…</noscript> -->'],
  ['footer', 'Footer code', 'Added at the end of <body>. Good for chat widgets and conversion scripts.', '<!-- e.g. <script src="https://…"></script> -->'],
  ['css', 'Custom CSS', 'Applied to every page after the site styles.', '.btn { border-radius: 999px; }'],
  ['js', 'Custom JavaScript', 'Runs on every page at the end of <body>. Do not include <script> tags.', "console.log('hello');"],
];

export default function CodeSettings() {
  const { user } = useAuth();
  const { doc, setDoc, save, error } = useGlobal();
  const [state, setState] = useState({ busy: false, error: '', saved: false });
  if (user.role !== 'admin') return <p className="sc-error">Only admins can edit site code.</p>;
  if (error) return <p className="sc-error">{error}</p>;
  if (!doc) return <Spinner />;
  const code = { ...GLOBAL.code, ...doc.code };
  const set = (k) => (e) => { setState((s) => ({ ...s, saved: false })); setDoc({ ...doc, code: { ...code, [k]: e.target.value } }); };

  const submit = async () => {
    setState({ busy: true, error: '', saved: false });
    try { await save({ ...doc, code }); setState({ busy: false, error: '', saved: true }); }
    catch (err) { setState({ busy: false, error: err.message, saved: false }); }
  };

  return (
    <>
      <PageHeader title="Code & tracking" description="Analytics IDs and custom code for the whole website. Per-page code is on each page’s settings." />
      <Notice tone="warning">Code you add runs for every visitor. Only paste code from sources you trust. It is not run inside the visual editor.</Notice>
      <Card className="sc-mt">
        <CardHeader title="Tracking IDs" description="Enter the ID only — the correct snippet is added for you." />
        <div className="sc-form">
          <div className="sc-grid2">
            <Field label="Google Analytics 4" help="Measurement ID, e.g. G-XXXXXXXXXX"><Input placeholder="G-XXXXXXXXXX" value={code.gaId} onChange={set('gaId')} /></Field>
            <Field label="Google Tag Manager" help="Container ID, e.g. GTM-XXXXXXX"><Input placeholder="GTM-XXXXXXX" value={code.gtmId} onChange={set('gtmId')} /></Field>
            <Field label="Meta (Facebook) Pixel" help="Numeric pixel ID"><Input placeholder="1234567890" value={code.pixelId} onChange={set('pixelId')} /></Field>
          </div>
        </div>
      </Card>
      {BOXES.map(([key, label, help, ph]) => (
        <Card className="sc-mt" key={key}>
          <CardHeader title={label} description={help} />
          <div className="sc-form"><Textarea className="sc-code" rows={7} spellCheck={false} placeholder={ph} value={code[key]} onChange={set(key)} /></div>
        </Card>
      ))}
      <div className="sc-savebar">
        {state.error && <span className="sc-error" role="alert">{state.error}</span>}
        {state.saved && <span className="sc-ok">Published</span>}
        <Button variant="primary" onClick={submit} disabled={state.busy}>{state.busy ? 'Saving…' : 'Save and publish'}</Button>
      </div>
    </>
  );
}
