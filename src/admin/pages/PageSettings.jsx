import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPages, saveDraft, updatePageMeta } from '../../cms/api.js';
import { Button, Card, CardHeader, Field, Input, LinkButton, Notice, PageHeader, Spinner, Textarea, slugify } from '../ui.jsx';

const LOCKED = ['home', '404'];

export default function PageSettings() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(undefined);
  const [form, setForm] = useState(null);
  const [state, setState] = useState({ busy: false, error: '', saved: false });

  useEffect(() => {
    fetchPages([slug]).then((p) => {
      const e = p[slug] || null;
      setEntry(e);
      const meta = (e?.draft ?? e?.published)?.meta || {};
      if (e) setForm({ title: meta.title || e.title || slug, seoTitle: meta.seoTitle || '', description: meta.seoDescription || '', slug });
    }).catch((err) => setState((s) => ({ ...s, error: err.message })));
  }, [slug]);

  if (entry === undefined) return state.error ? <p className="sc-error">{state.error}</p> : <Spinner />;
  if (!entry) return <p className="sc-error">Page not found.</p>;

  const published = !!entry.published;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value, ...(state.saved ? {} : {}) });

  const save = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', saved: false });
    const newSlug = slugify(form.slug) || slug;
    try {
      if (published) {
        await updatePageMeta(slug, { title: form.title.trim(), seoTitle: form.seoTitle, description: form.description, newSlug: LOCKED.includes(slug) ? undefined : newSlug });
      }
      const target = published && !LOCKED.includes(slug) ? newSlug : slug;
      if (entry.draft || !published) {
        const base = entry.draft ?? { sections: [] };
        await saveDraft(target, { ...base, meta: { ...base.meta, title: form.title.trim(), seoTitle: form.seoTitle, seoDescription: form.description } });
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
        <Card className="sc-mt">
          <CardHeader title="Search engines" description="What Google shows for this page." />
          <div className="sc-form">
            <Field label="SEO title" help={`${form.seoTitle.length}/60 characters`}><Input value={form.seoTitle} onChange={set('seoTitle')} /></Field>
            <Field label="Meta description" help={`${form.description.length}/160 characters`}><Textarea rows={3} value={form.description} onChange={set('description')} /></Field>
          </div>
        </Card>
        <div className="sc-savebar">
          {state.error && <span className="sc-error" role="alert">{state.error}</span>}
          {state.saved && <span className="sc-ok">Saved</span>}
          <Button type="submit" variant="primary" disabled={state.busy}>{state.busy ? 'Saving…' : 'Save settings'}</Button>
        </div>
      </form>
    </>
  );
}
