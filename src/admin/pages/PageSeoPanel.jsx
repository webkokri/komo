import { mediaUrl } from '../../cms/api.js';
import { SCHEMA_TYPES, analyzePage, pageSeo } from '../../cms/seo.js';
import { Card, CardHeader, Field, Input, Notice, Select, Textarea } from '../ui.jsx';

const words = (s) => (String(s || '').match(/\S+/g) || []).length;
const GROUPS = { SEO: 'Search (SEO)', AEO: 'Answer engines (AEO)', GEO: 'Local (GEO)', AIO: 'AI assistants (AIO)' };

/** Everything SEO for one page: fields, previews, live analysis and (admins) custom code. */
export default function PageSeoPanel({ form, setSeo, setCode, setForm, global, sections, slug, isAdmin }) {
  const seo = form.seo;
  const code = form.code;
  const doc = { meta: { title: form.title, seoTitle: form.seoTitle, seoDescription: form.description, seo, code }, sections };
  const head = pageSeo({ global, doc, slug, assetBase: new URL(mediaUrl('/uploads/x'), window.location.origin).origin });
  const { score, checks } = analyzePage({ global, doc, slug });
  const ring = score >= 80 ? '#34d399' : score >= 50 ? '#f59e0b' : '#ef4444';
  const ogImage = head.tags.find((t) => t.attrs.property === 'og:image')?.attrs.content;
  const bind = (obj, set, key) => ({ value: obj[key] ?? '', onChange: (e) => set({ [key]: e.target.value }) });
  let ldError = '';
  if (code.jsonld) { try { JSON.parse(code.jsonld); } catch { ldError = 'This is not valid JSON, so it will be ignored.'; } }

  return (
    <>
      <Card className="sc-mt">
        <CardHeader title="Search engines" description="What Google shows for this page." />
        <div className="sc-form">
          <Field label="SEO title" help={`${head.title.length}/60 characters${form.seoTitle ? '' : ' · automatic from the site title template'}`}><Input value={form.seoTitle} placeholder={head.title} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} /></Field>
          <Field label="Meta description" help={`${head.description.length}/160 characters`}><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Focus keyword" help="The phrase this page should rank for. The analysis below checks it."><Input placeholder="wedding décor Toronto" {...bind(seo, setSeo, 'keyword')} /></Field>
          <Field label="Canonical URL" help="Leave blank unless this page duplicates another."><Input placeholder={head.canonical} {...bind(seo, setSeo, 'canonical')} /></Field>
          <label className="sc-check"><input type="checkbox" checked={!!seo.noindex} onChange={(e) => setSeo({ noindex: e.target.checked })} />Hide this page from search engines (noindex)</label>
          <div className="sc-serp" aria-label="Google preview">
            <p className="sc-serp__url">{head.canonical}</p>
            <h3 className="sc-serp__title">{head.title.length > 60 ? `${head.title.slice(0, 58)}…` : head.title}</h3>
            <p className="sc-serp__desc">{head.description.length > 160 ? `${head.description.slice(0, 157)}…` : head.description || 'No description yet.'}</p>
          </div>
        </div>
      </Card>

      <Card className="sc-mt">
        <CardHeader title="Social sharing" description="Facebook, LinkedIn, WhatsApp, iMessage, X." />
        <div className="sc-form">
          <Field label="Share title" help="Blank = SEO title"><Input {...bind(seo, setSeo, 'ogTitle')} /></Field>
          <Field label="Share description" help="Blank = meta description"><Textarea rows={2} {...bind(seo, setSeo, 'ogDescription')} /></Field>
          <Field label="Share image" help="/uploads/… from the Media library. Blank = site default. 1200×630 works best."><Input placeholder="/uploads/…" {...bind(seo, setSeo, 'ogImage')} /></Field>
          <div className="sc-share" aria-label="Share preview">
            {ogImage ? <img src={ogImage} alt="" /> : <img alt="" />}
            <div><small>{new URL(head.canonical).hostname}</small><strong>{seo.ogTitle || head.title}</strong><span>{seo.ogDescription || head.description}</span></div>
          </div>
        </div>
      </Card>

      <Card className="sc-mt">
        <CardHeader title="Answer engines & AI" description="Help voice assistants, Google AI Overviews, ChatGPT, Claude and Perplexity quote this page correctly." />
        <div className="sc-form">
          <Field label="Quick answer (AEO)" help={`${words(seo.quickAnswer)} words — a direct 25–80 word answer to the question this page solves. Used for featured snippets, voice answers and AI.`}><Textarea rows={3} {...bind(seo, setSeo, 'quickAnswer')} /></Field>
          <Field label="AI summary (AIO)" help="Factual, plain-language summary of this page. Added to llms.txt."><Textarea rows={3} {...bind(seo, setSeo, 'aiSummary')} /></Field>
          <Field label="Page schema type" help="Structured data type. Blank picks one from the page address."><Select value={seo.schemaType || ''} onChange={(e) => setSeo({ schemaType: e.target.value })}><option value="">Automatic</option>{SCHEMA_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        </div>
      </Card>

      <Card className="sc-mt">
        <CardHeader title="SEO analysis" description="Updates as you type. Fix red first, then amber." />
        <div className="sc-score">
          <div className="sc-score__ring" style={{ '--p': score, '--c': ring }}><b>{score}</b></div>
          <div><strong>{score >= 80 ? 'Looking good' : score >= 50 ? 'Needs some work' : 'Needs attention'}</strong><p className="sc-help" style={{ margin: '2px 0 0' }}>{checks.filter((c) => c.status === 'good').length} of {checks.length} checks passed</p></div>
        </div>
        {Object.entries(GROUPS).map(([g, label]) => (
          <div key={g}>
            <p className="sc-checkgroup">{label}</p>
            <ul className="sc-checks">
              {checks.filter((c) => c.group === g).map((c) => <li key={c.id} className={`is-${c.status}`}><i aria-hidden="true" /><span>{c.label}<small>{c.hint}</small></span></li>)}
            </ul>
          </div>
        ))}
      </Card>

      {isAdmin && (
        <Card className="sc-mt">
          <CardHeader title="Custom code for this page" description="Runs only on this page, after the site-wide code. Admins only." />
          <div className="sc-form">
            <Field label="Custom JSON-LD" help="A full structured-data object, e.g. an Event or Product. Valid JSON only, no <script> tags."><Textarea className="sc-code" rows={5} spellCheck={false} placeholder={'{ "@context": "https://schema.org", "@type": "Event", … }'} {...bind(code, setCode, 'jsonld')} /></Field>
            {ldError && <Notice tone="warning">{ldError}</Notice>}
            <Field label="Header code"><Textarea className="sc-code" rows={4} spellCheck={false} {...bind(code, setCode, 'head')} /></Field>
            <Field label="Footer code"><Textarea className="sc-code" rows={4} spellCheck={false} {...bind(code, setCode, 'footer')} /></Field>
            <Field label="Custom CSS"><Textarea className="sc-code" rows={4} spellCheck={false} {...bind(code, setCode, 'css')} /></Field>
            <Field label="Custom JavaScript" help="No <script> tags."><Textarea className="sc-code" rows={4} spellCheck={false} {...bind(code, setCode, 'js')} /></Field>
          </div>
        </Card>
      )}
    </>
  );
}
