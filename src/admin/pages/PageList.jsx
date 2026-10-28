import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePage, listPages, saveDraft } from '../../cms/api.js';
import { Badge, Button, Card, EmptyState, Field, Input, LinkButton, PageHeader, Spinner, slugify } from '../ui.jsx';
import { starterDoc, useGlobal } from '../data.js';

const PROTECTED = ['home', '404'];
const urlFor = (slug) => (slug === 'home' ? '/' : `/${slug}`);

function status(p) {
  if (!p.published) return <Badge tone="amber">Draft</Badge>;
  if (p.hasDraft) return <Badge tone="info">Unpublished changes</Badge>;
  return <Badge tone="green">Published</Badge>;
}

export default function PageList() {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', addToNav: true });
  const [busy, setBusy] = useState(false);
  const global = useGlobal();

  const load = useCallback(() => listPages().then((r) => setPages(r.filter((p) => p.slug !== '_global'))).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    const slug = slugify(form.slug || form.title);
    if (!slug || PROTECTED.includes(slug) || pages.some((p) => p.slug === slug)) return setError('That address is already in use.');
    setBusy(true);
    try {
      await saveDraft(slug, starterDoc(form.title.trim()));
      if (form.addToNav && global.doc) {
        const header = global.doc.header || {};
        await global.save({ ...global.doc, header: { ...header, nav: [...(header.nav || []), { label: form.title.trim(), to: `/${slug}` }] } });
      }
      window.location.href = `${urlFor(slug)}?edit=1`;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try { await deletePage(p.slug); await load(); } catch (err) { setError(err.message); }
  };

  return (
    <>
      <PageHeader
        title="Pages"
        description="Every page of the website. Open one in the visual editor to change its content."
        actions={<Button variant="primary" onClick={() => setCreating((v) => !v)}>{creating ? 'Cancel' : 'New page'}</Button>}
      />
      {error && <p className="sc-error" role="alert">{error}</p>}
      {creating && (
        <Card className="sc-mb">
          <form className="sc-form" onSubmit={create}>
            <Field label="Page name"><Input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Address" help={`/${slugify(form.slug || form.title)}`}>
              <Input value={form.slug} placeholder="Leave blank to use the name" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <label className="sc-check"><input type="checkbox" checked={form.addToNav} onChange={(e) => setForm({ ...form, addToNav: e.target.checked })} />Add to the main menu</label>
            <Button type="submit" variant="primary" disabled={busy}>{busy ? 'Creating…' : 'Create and open editor'}</Button>
          </form>
        </Card>
      )}
      {!pages ? <Spinner /> : pages.length === 0 ? (
        <EmptyState title="No pages yet">Create your first page.</EmptyState>
      ) : (
        <div className="sc-tablewrap">
          <table className="sc-table">
            <thead><tr><th>Title</th><th>Address</th><th>Status</th><th /></tr></thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.slug}>
                  <td><Link className="sc-rowlink" to={`/pages/${p.slug}`}>{p.title}</Link></td>
                  <td><code>{urlFor(p.slug)}</code></td>
                  <td>{status(p)}</td>
                  <td className="sc-right">
                    <LinkButton size="sm" variant="primary" href={`${urlFor(p.slug)}?edit=1`} target="_blank" rel="noreferrer">Edit visually</LinkButton>{' '}
                    <LinkButton size="sm" to={`/pages/${p.slug}`}>Settings</LinkButton>{' '}
                    {!PROTECTED.includes(p.slug) && <Button size="sm" variant="danger" onClick={() => remove(p)}>Delete</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
