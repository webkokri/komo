import { useState } from 'react';
import { GLOBAL } from '../../cms/defaults.js';
import { apiUrl, rebuildSite } from '../../cms/api.js';
import { AI_BOTS, BUSINESS_TYPES, withSeoDefaults } from '../../cms/seo.js';
import { useAuth } from '../auth.jsx';
import { useGlobal } from '../data.js';
import { Button, Card, CardHeader, Field, Input, Notice, PageHeader, Select, Spinner, Textarea } from '../ui.jsx';

const TABS = [
  ['general', 'General'],
  ['local', 'Local business (GEO)'],
  ['ai', 'AI & answers (AEO · AIO)'],
  ['redirects', 'Redirects'],
  ['advanced', 'Advanced'],
];
const FILES = [['robots.txt', '/api/seo/robots.txt'], ['sitemap.xml', '/api/seo/sitemap.xml'], ['llms.txt', '/api/seo/llms.txt'], ['llms-full.txt', '/api/seo/llms-full.txt']];
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

export default function SeoSettings() {
  const { user } = useAuth();
  const { doc, setDoc, save, error } = useGlobal();
  const [tab, setTab] = useState('general');
  const [state, setState] = useState({ busy: false, error: '', saved: false });
  const [preview, setPreview] = useState({ name: '', text: '' });
  const [rebuild, setRebuild] = useState('');
  if (error) return <p className="sc-error">{error}</p>;
  if (!doc) return <Spinner />;

  const g = withSeoDefaults(doc, GLOBAL);
  const seo = g.seo;
  const b = seo.business;
  const ai = seo.ai;
  const isAdmin = user.role === 'admin';

  const put = (next) => { setState((s) => ({ ...s, saved: false })); setDoc({ ...doc, seo: next }); };
  const setSeo = (patch) => put({ ...seo, ...patch });
  const setBiz = (patch) => put({ ...seo, business: { ...b, ...patch } });
  const setAi = (patch) => put({ ...seo, ai: { ...ai, ...patch } });
  const field = (obj, set, key) => ({ value: obj[key] ?? '', onChange: (e) => set({ [key]: e.target.value }) });

  const submit = async () => {
    setState({ busy: true, error: '', saved: false });
    try { await save({ ...doc, seo }); setState({ busy: false, error: '', saved: true }); }
    catch (err) { setState({ busy: false, error: err.message, saved: false }); }
  };

  const show = async (name, path) => {
    setPreview({ name, text: 'Loading…' });
    try { setPreview({ name, text: await (await fetch(apiUrl(path))).text() }); }
    catch (err) { setPreview({ name, text: err.message }); }
  };

  const setRow = (key, list, i, patch) => put({ ...seo, [key]: list.map((r, n) => (n === i ? { ...r, ...patch } : r)) });
  const redirects = seo.redirects || [];
  const services = b.services || [];

  return (
    <>
      <PageHeader title="SEO & GEO" description="Search (SEO), answer engines (AEO), local search (GEO) and AI assistants (AIO). Saving publishes immediately." />
      <div className="sc-tabs" role="tablist">
        {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={`sc-tab ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {tab === 'general' && (
        <>
          <Card>
            <CardHeader title="Site identity" description="Used in titles, search results and social previews." />
            <div className="sc-form">
              <Field label="Website address" help="Exactly as visitors type it, no trailing slash. Used for canonical links and the sitemap."><Input placeholder="https://komorebiinteriors.ca" {...field(seo, setSeo, 'siteUrl')} /></Field>
              <Field label="Site name"><Input {...field(seo, setSeo, 'siteName')} /></Field>
              <Field label="Title template" help="%s becomes the page name, e.g. “%s — Komorebi Interiors”. Pages with their own SEO title ignore this."><Input {...field(seo, setSeo, 'titleTemplate')} /></Field>
              <Field label="Default description" help={`${(seo.defaultDescription || '').length}/160 · used when a page has none`}><Textarea rows={3} {...field(seo, setSeo, 'defaultDescription')} /></Field>
              <Field label="Default share image" help="Shown when a page is shared. Upload in Media library, then paste the /uploads/… link. 1200×630 works best."><Input placeholder="/uploads/…" {...field(seo, setSeo, 'ogImage')} /></Field>
              <div className="sc-grid2">
                <Field label="Twitter / X handle"><Input placeholder="@komorebi" {...field(seo, setSeo, 'twitter')} /></Field>
                <Field label="Locale"><Input placeholder="en_CA" {...field(seo, setSeo, 'locale')} /></Field>
              </div>
              <label className="sc-check"><input type="checkbox" checked={!!seo.noindexSite} onChange={(e) => setSeo({ noindexSite: e.target.checked })} />Hide the whole site from search engines (use while building)</label>
              {seo.noindexSite && <Notice tone="warning">Search engines are being told not to index any page. Untick before launch.</Notice>}
            </div>
          </Card>
          <Card className="sc-mt">
            <CardHeader title="Search console verification" description="Paste only the code from the meta tag, e.g. the content value." />
            <div className="sc-form">
              <div className="sc-grid2">
                {[['google', 'Google Search Console'], ['bing', 'Bing Webmaster Tools'], ['yandex', 'Yandex'], ['pinterest', 'Pinterest'], ['facebook', 'Meta domain verification']].map(([k, label]) => (
                  <Field key={k} label={label}><Input value={seo.verification?.[k] || ''} onChange={(e) => setSeo({ verification: { ...seo.verification, [k]: e.target.value.trim() } })} /></Field>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {tab === 'local' && (
        <>
          <Notice>This becomes LocalBusiness structured data, which Google Maps, voice assistants and AI answers use to understand where you work.</Notice>
          <Card className="sc-mt">
            <CardHeader title="Business" />
            <div className="sc-form">
              <div className="sc-grid2">
                <Field label="Business type"><Select value={b.type} onChange={(e) => setBiz({ type: e.target.value })}>{BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
                <Field label="Business name"><Input {...field(b, setBiz, 'name')} /></Field>
                <Field label="Legal name"><Input {...field(b, setBiz, 'legalName')} /></Field>
                <Field label="Price range" help="$, $$, $$$ or $$$$"><Input {...field(b, setBiz, 'priceRange')} /></Field>
                <Field label="Founded (year)"><Input {...field(b, setBiz, 'foundingYear')} /></Field>
                <Field label="Languages" help="Comma separated"><Input {...field(b, setBiz, 'languages')} /></Field>
              </div>
            </div>
          </Card>
          <Card className="sc-mt">
            <CardHeader title="Location" description="Leave the street blank if you do not want to publish an address; city and areas still help local search." />
            <div className="sc-form">
              <Field label="Street address"><Input {...field(b, setBiz, 'street')} /></Field>
              <div className="sc-grid2">
                <Field label="City"><Input {...field(b, setBiz, 'city')} /></Field>
                <Field label="Province / state"><Input {...field(b, setBiz, 'region')} /></Field>
                <Field label="Postal code"><Input {...field(b, setBiz, 'postal')} /></Field>
                <Field label="Country code"><Input placeholder="CA" {...field(b, setBiz, 'country')} /></Field>
                <Field label="Latitude"><Input inputMode="decimal" {...field(b, setBiz, 'lat')} /></Field>
                <Field label="Longitude"><Input inputMode="decimal" {...field(b, setBiz, 'lng')} /></Field>
              </div>
              <Field label="Service areas" help="One per line — cities or regions you travel to."><Textarea rows={4} value={(b.serviceAreas || []).join('\n')} onChange={(e) => setBiz({ serviceAreas: e.target.value.split('\n') })} /></Field>
              <Field label="Opening hours" help="One per line in schema format, e.g. Mo-Fr 10:00-18:00"><Textarea rows={3} {...field(b, setBiz, 'openingHours')} /></Field>
            </div>
          </Card>
          <Card className="sc-mt">
            <CardHeader title="Services offered" description="Listed in structured data so search and AI know what you do." action={<Button size="sm" onClick={() => setBiz({ services: [...services, { name: '', description: '' }] })}>+ Add service</Button>} />
            <div className="sc-rows">
              {services.map((s, i) => (
                <div className="sc-row" key={i}>
                  <Input aria-label="Service" placeholder="Wedding décor" value={s.name} onChange={(e) => setBiz({ services: services.map((r, n) => (n === i ? { ...r, name: e.target.value } : r)) })} />
                  <Input aria-label="Description" placeholder="One sentence" value={s.description} onChange={(e) => setBiz({ services: services.map((r, n) => (n === i ? { ...r, description: e.target.value } : r)) })} />
                  <Button size="icon" variant="danger" title="Remove" onClick={() => setBiz({ services: services.filter((_, n) => n !== i) })}>✕</Button>
                </div>
              ))}
            </div>
            <div className="sc-form sc-mt">
              <Field label="Topics you are expert in" help="Comma separated — becomes “knowsAbout”."><Textarea rows={2} {...field(b, setBiz, 'knowsAbout')} /></Field>
              <Field label="Other profile links (sameAs)" help="One URL per line: Google Business Profile, LinkedIn, Pinterest… Social links from Site settings are added automatically."><Textarea rows={3} {...field(b, setBiz, 'sameAs')} /></Field>
            </div>
          </Card>
        </>
      )}

      {tab === 'ai' && (
        <>
          <Card>
            <CardHeader title="What AI assistants should know" description="Written into llms.txt, the file ChatGPT, Claude, Perplexity and others can read to describe your business accurately." />
            <div className="sc-form">
              <Field label="Business summary" help="2–3 factual sentences. No marketing fluff."><Textarea rows={4} {...field(ai, setAi, 'summary')} /></Field>
              <Field label="Key facts" help="One per line. Short, quotable statements (what you do, who for, where, what makes you different)."><Textarea rows={6} value={(ai.facts || []).join('\n')} onChange={(e) => setAi({ facts: e.target.value.split('\n') })} /></Field>
            </div>
          </Card>
          <Card className="sc-mt">
            <CardHeader title="AI crawlers" description="Choose which AI systems may read the site. Blocking appears in robots.txt." />
            <div className="sc-tablewrap">
              <table className="sc-table">
                <thead><tr><th>Crawler</th><th>Used for</th><th>Access</th></tr></thead>
                <tbody>
                  {AI_BOTS.map(([name, use]) => (
                    <tr key={name}>
                      <td><code>{name}</code></td><td>{use}</td>
                      <td><Select aria-label={`${name} access`} value={ai.bots?.[name] || 'allow'} onChange={(e) => setAi({ bots: { ...ai.bots, [name]: e.target.value } })}><option value="allow">Allow</option><option value="block">Block</option></Select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="sc-mt">
            <CardHeader title="Generated files" description="Live from your current settings. Save first, then preview." />
            <div className="sc-row" style={{ flexWrap: 'wrap' }}>
              {FILES.map(([name, path]) => <Button key={name} size="sm" variant={preview.name === name ? 'primary' : 'secondary'} onClick={() => show(name, path)}>{name}</Button>)}
            </div>
            {preview.name && <pre className="sc-pre">{preview.text}</pre>}
          </Card>
        </>
      )}

      {tab === 'redirects' && (
        <Card>
          <CardHeader title="Redirects" description="Send an old address to a new one (for example after renaming a page)." action={<Button size="sm" onClick={() => put({ ...seo, redirects: [...redirects, { from: '', to: '' }] })}>+ Add redirect</Button>} />
          {redirects.length === 0 ? <p className="sc-help">No redirects yet.</p> : (
            <div className="sc-rows">
              {redirects.map((r, i) => (
                <div className="sc-row" key={i}>
                  <Input aria-label="From" placeholder="/old-page" value={r.from} onChange={(e) => setRow('redirects', redirects, i, { from: e.target.value })} />
                  <Input aria-label="To" placeholder="/new-page or https://…" value={r.to} onChange={(e) => setRow('redirects', redirects, i, { to: e.target.value })} />
                  <Button size="icon" variant="danger" title="Remove" onClick={() => put({ ...seo, redirects: redirects.filter((_, n) => n !== i) })}>✕</Button>
                </div>
              ))}
            </div>
          )}
          <p className="sc-help sc-mt">Redirects run in the visitor’s browser, which Google follows. For permanent server-side 301s, also add them to your hosting’s .htaccess.</p>
        </Card>
      )}

      {tab === 'advanced' && (
        <>
          <Card>
            <CardHeader title="robots.txt additions" description="Extra lines appended to the generated robots.txt." />
            <div className="sc-form">
              <Field label="Custom rules"><Textarea className="sc-code" rows={5} placeholder={'User-agent: SemrushBot\nDisallow: /'} {...field(seo, setSeo, 'robotsExtra')} /></Field>
            </div>
          </Card>
          {isAdmin && (
            <Card className="sc-mt">
              <CardHeader title="Static pages (crawler snapshot)" description="Every page is also built into plain HTML so crawlers that do not run JavaScript see your content. Rebuild after big SEO changes." />
              <div className="sc-form">
                <Field label="Vercel deploy hook URL" help="Vercel → Project → Settings → Git → Deploy Hooks. Lets the button below rebuild the site.">
                  <Input placeholder="https://api.vercel.com/v1/integrations/deploy/…" {...field(seo, setSeo, 'deployHook')} />
                </Field>
                <div className="sc-row">
                  <Button onClick={async () => { setRebuild('Starting…'); try { await submit(); await rebuildSite(); setRebuild('Rebuild started — live in about a minute.'); } catch (e) { setRebuild(e.message); } }}>Save and rebuild static pages</Button>
                  {rebuild && <span className="sc-help">{rebuild}</span>}
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      <div className="sc-savebar">
        {state.error && <span className="sc-error" role="alert">{state.error}</span>}
        {state.saved && <span className="sc-ok">Published</span>}
        <Button variant="primary" onClick={submit} disabled={state.busy}>{state.busy ? 'Saving…' : 'Save and publish'}</Button>
      </div>
    </>
  );
}
