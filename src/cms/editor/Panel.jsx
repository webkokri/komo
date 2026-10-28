import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPages } from '../api.js';
import { GLOBAL_GROUPS, PICKABLE, SECTION_TYPES, THEME_VARS } from '../registry.js';
import { pathFor, useCms } from '../store.jsx';
import { FieldEditor } from './Fields.jsx';

function AddSection() {
  const { ui, addSection, closeAdd } = useCms();
  return (
    <div className="cms-pane">
      <button type="button" className="cms-back" onClick={closeAdd}>← Back</button>
      <h3 className="cms-h">Add a section</h3>
      <p className="cms-muted">It will be inserted {ui.adding === 0 ? 'at the top' : 'where you clicked'}. Everything in it can be edited afterwards.</p>
      <ul className="cms-types">
        {PICKABLE.map(([type, def]) => (
          <li key={type}>
            <button type="button" onClick={() => addSection(type, def.defaults, ui.adding)}>
              <strong>{def.label}</strong>
              <span>{def.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionSettings({ index }) {
  const { sections, select, moveSection, duplicateSection, removeSection, toggleSection } = useCms();
  const section = sections[index];
  const def = SECTION_TYPES[section.type];
  return (
    <div className="cms-pane">
      <button type="button" className="cms-back" onClick={() => select(null)}>← All sections</button>
      <h3 className="cms-h">{def.label}</h3>
      <div className="cms-actions-row">
        <button type="button" className="cms-btn" disabled={index === 0} onClick={() => moveSection(index, index - 1)}>↑ Up</button>
        <button type="button" className="cms-btn" disabled={index === sections.length - 1} onClick={() => moveSection(index, index + 1)}>↓ Down</button>
        <button type="button" className="cms-btn" onClick={() => duplicateSection(section.id)}>Duplicate</button>
        <button type="button" className="cms-btn" onClick={() => toggleSection(section.id)}>{section.hidden ? 'Show' : 'Hide'}</button>
        <button type="button" className="cms-btn cms-btn--danger" onClick={() => window.confirm('Delete this section?') && removeSection(section.id)}>Delete</button>
      </div>
      <FieldEditor fields={def.fields} base={`page.sections.${index}.props`} />
    </div>
  );
}

const PAGE_META = [
  { key: 'title', label: 'Page name (used in lists)', type: 'text' },
  { key: 'seoTitle', label: 'Browser tab / search title', type: 'text' },
  { key: 'seoDescription', label: 'Search description', type: 'textarea' },
];

function PageTab() {
  const { ui, sections, select, openAdd } = useCms();
  const [metaOpen, setMetaOpen] = useState(false);

  if (ui.adding !== null) return <AddSection />;
  const index = sections.findIndex((s) => s.id === ui.selected);
  if (index >= 0) return <SectionSettings index={index} />;

  return (
    <div className="cms-pane">
      <button type="button" className="cms-disclosure" aria-expanded={metaOpen} onClick={() => setMetaOpen(!metaOpen)}>
        {metaOpen ? '▾' : '▸'} Page settings &amp; SEO
      </button>
      {metaOpen && <div className="cms-box"><FieldEditor fields={PAGE_META} base="page.meta" /></div>}

      <h3 className="cms-h">Sections</h3>
      <p className="cms-muted">Click any text or image on the page to edit it. Click a section to change its settings, or pick one here.</p>
      <ol className="cms-sections">
        {sections.map((s, i) => (
          <li key={s.id} className={s.hidden ? 'is-hidden' : ''}>
            <button
              type="button"
              onClick={() => {
                select(s.id);
                document.querySelector(`[data-section="${s.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span>{i + 1}</span> {SECTION_TYPES[s.type]?.label ?? s.type}{s.hidden ? ' · hidden' : ''}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="cms-btn cms-btn--primary cms-block" onClick={() => openAdd(sections.length)}>+ Add section</button>
    </div>
  );
}

function ThemeEditor() {
  const { get, update } = useCms();
  const theme = get('global.theme') || {};
  const computed = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  return (
    <div className="cms-box">
      {THEME_VARS.map(([name, label]) => {
        const value = theme[name] || computed?.getPropertyValue(name).trim() || '#000000';
        return (
          <label key={name} className="cms-field cms-color">
            <span className="cms-label">{label}</span>
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={(e) => update('global.theme', (t = {}) => ({ ...t, [name]: e.target.value }))} />
            {theme[name] ? <button type="button" className="cms-btn cms-btn--quiet" onClick={() => update('global.theme', (t = {}) => { const { [name]: _, ...rest } = t; return rest; })}>Reset</button> : null}
          </label>
        );
      })}
    </div>
  );
}

function GlobalTab() {
  const { ui, selectGlobal } = useCms();
  return (
    <div className="cms-pane">
      <p className="cms-muted">These settings are shared by every page.</p>
      {GLOBAL_GROUPS.map((g) => (
        <div key={g.id} className="cms-accordion">
          <button type="button" className="cms-disclosure" aria-expanded={ui.group === g.id} onClick={() => selectGlobal(ui.group === g.id ? null : g.id)}>
            {ui.group === g.id ? '▾' : '▸'} {g.label}
          </button>
          {ui.group === g.id && <div className="cms-box"><FieldEditor fields={g.fields} base={`global.${g.id}`} /></div>}
        </div>
      ))}
      <div className="cms-accordion">
        <button type="button" className="cms-disclosure" aria-expanded={ui.group === 'theme'} onClick={() => selectGlobal(ui.group === 'theme' ? null : 'theme')}>
          {ui.group === 'theme' ? '▾' : '▸'} Colours
        </button>
        {ui.group === 'theme' && <ThemeEditor />}
      </div>
    </div>
  );
}

function PagesTab() {
  const { slug, createPage, removePage, docs, dirty } = useCms();
  const navigate = useNavigate();
  const [pages, setPages] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', addToNav: true });
  const [error, setError] = useState('');

  const load = () => listPages().then(setPages).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  // Pages created in this session that are not on the server yet.
  const local = useMemo(() => Object.keys(docs).filter((s) => s !== '_global' && !pages?.some((p) => p.slug === s)), [docs, pages]);
  const rows = [...(pages || []).filter((p) => p.slug !== '_global'), ...local.map((s) => ({ slug: s, title: docs[s]?.meta?.title || s, published: false, hasDraft: true }))];

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createPage({ title: form.title.trim(), slug: form.slug || form.title, addToNav: form.addToNav });
      setForm({ title: '', slug: '', addToNav: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete the page "${p.title}"? This cannot be undone.`)) return;
    try { await removePage(p.slug); await load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="cms-pane">
      <h3 className="cms-h">Pages</h3>
      <ul className="cms-pages">
        {rows.map((p) => (
          <li key={p.slug} className={p.slug === slug ? 'is-current' : ''}>
            <button type="button" onClick={() => navigate(pathFor(p.slug))}>
              <strong>{p.title}</strong>
              <span>{pathFor(p.slug)}{!p.published ? ' · not published' : dirty.includes(p.slug) || p.hasDraft ? ' · unpublished changes' : ''}</span>
            </button>
            {!['home', '404'].includes(p.slug) && <button type="button" className="cms-icon-btn" title="Delete page" onClick={() => remove(p)}>✕</button>}
          </li>
        ))}
      </ul>

      <form className="cms-box" onSubmit={submit}>
        <h3 className="cms-h">New page</h3>
        <label className="cms-field">
          <span className="cms-label">Page name</span>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="cms-field">
          <span className="cms-label">Address <small>/{(form.slug || form.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</small></span>
          <input value={form.slug} placeholder="leave blank to use the name" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label className="cms-check"><input type="checkbox" checked={form.addToNav} onChange={(e) => setForm({ ...form, addToNav: e.target.checked })} /><span>Add to the main menu</span></label>
        {error ? <p className="cms-error" role="alert">{error}</p> : null}
        <button type="submit" className="cms-btn cms-btn--primary cms-block">Create page</button>
      </form>
    </div>
  );
}

export default function Panel() {
  const { ui, setTab, undo, redo, canUndo, canRedo, saveDraft, publish, discardChanges, dirty, unpublished, status, setEditing, signOut, user } = useCms();

  const summary = status.state === 'saving' || status.state === 'error'
    ? status.message
    : dirty.length ? 'Unsaved changes'
      : unpublished.length ? `${unpublished.length} unpublished ${unpublished.length === 1 ? 'page' : 'pages'}`
        : status.message || 'All changes published';

  return (
    <aside className="cms-ui cms-panel" aria-label="Page editor">
      <header className="cms-panel__head">
        <div>
          <strong>Editor</strong>
          <span className={`cms-status cms-status--${status.state === 'error' ? 'error' : unpublished.length || dirty.length ? 'pending' : 'ok'}`}>{summary}</span>
        </div>
        <div className="cms-panel__top">
          <button type="button" className="cms-btn cms-btn--quiet" onClick={() => setEditing(false)} title="Hide the editor and view the page">Preview</button>
          <a className="cms-btn cms-btn--quiet" href="/admin" title="Back to the Studio CMS dashboard">Dashboard</a>
          <button type="button" className="cms-btn cms-btn--quiet" onClick={signOut} title={`Signed in as ${user?.email}`}>Log out</button>
        </div>
      </header>

      <div className="cms-panel__actions">
        <button type="button" className="cms-icon-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl/Cmd+Z)" aria-label="Undo">↶</button>
        <button type="button" className="cms-icon-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl/Cmd+Shift+Z)" aria-label="Redo">↷</button>
        <button type="button" className="cms-btn" onClick={saveDraft} disabled={!dirty.length} title="Ctrl/Cmd+S">Save draft</button>
        <button type="button" className="cms-btn cms-btn--primary" onClick={publish} disabled={!unpublished.length}>Publish{unpublished.length ? ` (${unpublished.length})` : ''}</button>
      </div>
      {unpublished.length > 0 && (
        <button type="button" className="cms-link-danger" onClick={() => window.confirm('Throw away all unpublished changes and go back to the live version?') && discardChanges()}>
          Discard unpublished changes
        </button>
      )}

      <nav className="cms-tabs" role="tablist">
        {[['page', 'This page'], ['global', 'Site'], ['pages', 'Pages']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={ui.tab === id} className={ui.tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      <div className="cms-panel__body">
        {ui.tab === 'page' && <PageTab />}
        {ui.tab === 'global' && <GlobalTab />}
        {ui.tab === 'pages' && <PagesTab />}
      </div>
    </aside>
  );
}
