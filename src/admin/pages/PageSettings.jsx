import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPages, saveDraft, updatePageMeta } from '../../cms/api.js';
import { GLOBAL } from '../../cms/defaults.js';
import { withSeoDefaults } from '../../cms/seo.js';
import { useAuth } from '../auth.jsx';
import { useGlobal } from '../data.js';
import { Button, Card, CardHeader, Field, Input, LinkButton, Notice, PageHeader, Spinner, slugify } from '../ui.jsx';
import PageSeoPanel from './PageSeoPanel.jsx';

const LOCKED = ['home', '404'];

export default function PageSettings() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(undefined);
  const [form, setForm] = useState(null);
  const [state, setState] = useState({ busy: false, error: '', saved: false });
  const { user } = useAuth();
  const globalDoc = useGlobal();

  useEffect(() => {
    fetchPages([slug]).then((p) => {
      const e = p[slug] || null;
      setEntry(e);
      const meta = (e?.draft ?? e?.published)?.meta || {};
      if (e) setForm({ title: meta.title || e.title || slug, seoTitle: meta.seoTitle || '', description: meta.seoDescription || '', slug, seo: meta.seo || {}, code: meta.code || {} });
    }).catch((err) => setState((s) => ({ ...s, error: err.message })));
  }, [slug]);

  if (entry === undefined || (entry && !globalDoc.doc)) return state.error ? <p className="sc-error">{state.error}</p> : <Spinner />;
  if (!entry) return <p className="sc-error">Page not found.</p>;

  const published = !!entry.published;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isAdmin = user.role === 'admin';
  const setSeo = (patch) => setForm({ ...form, seo: { ...form.seo, ...patch } });
  const setCode = (patch) => setForm({ ...form, code: { ...form.code, ...patch } });
  const liveDoc = entry.draft ?? entry.published ?? { sections: [] };

  const save = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', saved: false });
    const newSlug = slugify(form.slug) || slug;
    try {
      if (published) {
        await updatePageMeta(slug, { title: form.title.trim(), seoTitle: form.seoTitle, description: form.description, seo: form.seo, ...(isAdmin && { code: form.code }), newSlug: LOCKED.includes(slug) ? undefined : newSlug });
      }
      const target = published && !LOCKED.includes(slug) ? newSlug : slug;
      if (entry.draft || !published) {
        const base = entry.draft ?? { sections: [] };
        await saveDraft(target, { ...base, meta: { ...base.meta, title: form.title.trim(), seoTitle: form.seoTitle, seoDescription: form.description, seo: form.seo, ...(isAdmin && { code: form.code }) } });
      }
      setState({ busy: false, error: '', saved: true });
      if (target !== slug) navigate(`/pages/${target}`, { replace: true });
    } catch (err) {
      setState({ busy: false, error: err.message, saved: false });
    }
  };

  return (
    <>
      <PageHeader
        title={form.title || slug}
        description={<code>{slug === 'home' ? '/' : `/${slug}`}</code>}
        actions={<LinkButton variant="primary" href={`${slug === 'home' ? '/' : `/${slug}`}?edit=1`} target="_blank" rel="noreferrer">Edit visually</LinkButton>}
      />
      {!published && <Notice tone="warning">This page is a draft and not visible to visitors yet. Open the visual editor and press Publish.</Notice>}
      <form onSubmit={save}>
        <Card className="sc-mt">
          <CardHeader title="Page" />
          <div className="sc-form">
            <Field label="Page name"><Input required value={form.title} onChange={set('title')} /></Field>
            <Field label="Address" help={LOCKED.includes(slug) ? 'This page keeps its address.' : published ? `Visitors reach it at /${slugify(form.slug)}` : 'Publish the page first to change its address.'}>
              <Input value={form.slug} disabled={LOCKED.includes(slug) || !published} onChange={set('slug')} />
            </Field>
          </div>
        </Card>
        <PageSeoPanel form={form} setForm={setForm} setSeo={setSeo} setCode={setCode} global={withSeoDefaults(globalDoc.doc, GLOBAL)} sections={liveDoc.sections || []} slug={slug} isAdmin={isAdmin} />
        <div className="sc-savebar">
          {state.error && <span className="sc-error" role="alert">{state.error}</span>}
          {state.saved && <span className="sc-ok">Saved</span>}
          <Button type="submit" variant="primary" disabled={state.busy}>{state.busy ? 'Saving…' : 'Save settings'}</Button>
        </div>
      </form>
    </>
  );
}
