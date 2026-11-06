import { useEffect } from 'react';
import Page from '../components/Page.jsx';
import SectionDecor from '../components/Ambient.jsx';
import { ThemeContext } from './theme.jsx';
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

const NO_DECOR = new Set(['spacer', 'imageBand', 'notFound', 'marquee', 'serviceBlock']);
function decorTone(s) {
  if (NO_DECOR.has(s.type)) return null;
  const p = s.props || {};
  if (s.type === 'hero') return 'dark';
  const t = p.tone || p.variant;
  return t === 'dark' || t === 'moss' ? 'dark' : 'light';
}

/** Renders whichever page matches the URL from the sections stored in the CMS. */
export default function PageView() {
  const { doc, sections, loading, editing, openAdd } = useCms();
  const theme = doc?.meta?.theme === 'corporate' ? 'corporate' : 'floral';
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => { delete document.documentElement.dataset.theme; };
  }, [theme]);

  if (loading) return <div style={{ minHeight: '100vh' }} aria-busy="true" />;
  if (!doc) return <div className="container" style={{ padding: '160px 0' }}>This page could not be loaded.</div>;

  return (
    <ThemeContext.Provider value={theme}>
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
        const tone = editing ? null : decorTone(s);
        const node = <Component base={`page.sections.${index}.props`} props={s.props} />;
        return (
          <SectionFrame key={s.id} section={s} index={index} count={sections.length} def={def}>
            {tone ? <div className="has-ambient">{node}<SectionDecor tone={tone} /></div> : node}
          </SectionFrame>
        );
      })}
    </Page>
    </ThemeContext.Provider>
  );
}
