import { useEffect } from 'react';
import Page from '../components/Page.jsx';
import { SECTION_TYPES } from './registry.js';
import { SectionFrame } from './editor/SectionFrame.jsx';
import { useCms } from './store.jsx';

/** Applies the colour overrides saved in Site settings as CSS variables on :root. */
export function ThemeStyle() {
  const { get } = useCms();
  const theme = get('global.theme');
  useEffect(() => {
    const root = document.documentElement;
    const keys = Object.keys(theme || {});
    keys.forEach((k) => theme[k] && root.style.setProperty(k, theme[k]));
    return () => keys.forEach((k) => root.style.removeProperty(k));
  }, [theme]);
  return null;
}

/** Renders whichever page matches the URL from the sections stored in the CMS. */
export default function PageView() {
  const { doc, sections, loading, editing, openAdd } = useCms();

  if (loading) return <div style={{ minHeight: '100vh' }} aria-busy="true" />;
  if (!doc) return <div className="container" style={{ padding: '160px 0' }}>This page could not be loaded.</div>;

  return (
    <Page title={doc.meta?.seoTitle || doc.meta?.title}>
      {editing && sections.length === 0 && (
        <div className="cms-empty cms-ui">
          <p>This page is empty.</p>
          <button type="button" className="cms-btn cms-btn--primary" onClick={() => openAdd(0)}>Add your first section</button>
        </div>
      )}
      {sections.map((s, index) => {
        const def = SECTION_TYPES[s.type];
        if (!def) return null;
        if (s.hidden && !editing) return null;
        const Component = def.component;
        return (
          <SectionFrame key={s.id} section={s} index={index} count={sections.length} def={def}>
            <Component base={`page.sections.${index}.props`} props={s.props} />
          </SectionFrame>
        );
      })}
    </Page>
  );
}
