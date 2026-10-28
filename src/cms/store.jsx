import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from './api.js';
import { DEFAULTS, GLOBAL } from './defaults.js';
import { clone, getIn, move, setIn, uid } from './path.js';

const CmsContext = createContext(null);
export const useCms = () => useContext(CmsContext);

export const slugFor = (pathname) => pathname.replace(/^\/+|\/+$/g, '').toLowerCase() || 'home';
export const pathFor = (slug) => (slug === 'home' ? '/' : `/${slug}`);

const HISTORY_LIMIT = 100;
const json = (doc) => JSON.stringify(doc ?? null);

export function CmsProvider({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const slug = slugFor(pathname);

  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [docs, setDocs] = useState({});
  const [missing, setMissing] = useState({}); // slugs known to have no page
  const [editing, setEditingState] = useState(false);
  const [ui, setUi] = useState({ tab: 'page', selected: null, group: null, media: null, adding: null });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  // Baselines used to work out what is unsaved / unpublished.
  const [saved, setSaved] = useState({});
  const [published, setPublished] = useState({});

  const docsRef = useRef(docs);
  docsRef.current = docs;
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const lastEdit = useRef({ key: null, at: 0 });
  const [, bump] = useState(0);

  // ---- Session ---------------------------------------------------------------------------
  useEffect(() => {
    api.getSession().then(setUser).catch(() => setUser(null)).finally(() => setSessionReady(true));
  }, []);

  // The admin's "Edit visually" button opens a page with ?edit=1.
  useEffect(() => {
    if (user && new URLSearchParams(window.location.search).has('edit')) setEditingState(true);
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    const u = await api.login(email, password);
    setDocs({});
    setSaved({});
    setPublished({});
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
    setEditingState(false);
    setDocs({});
    setSaved({});
    setPublished({});
    undoStack.current = [];
    redoStack.current = [];
  }, []);

  // ---- Loading ---------------------------------------------------------------------------
  useEffect(() => {
    if (!sessionReady) return undefined;
    const wanted = [...new Set([slug, '_global', '404'])].filter((s) => !(s in docsRef.current) && !missing[s]);
    if (!wanted.length) return undefined;
    let cancelled = false;

    api.fetchPages(wanted).then((remote) => {
      if (cancelled) return;
      const nextDocs = {};
      const nextSaved = {};
      const nextPublished = {};
      const nextMissing = {};
      for (const s of wanted) {
        const entry = remote[s];
        const fallback = DEFAULTS[s] ?? null;
        const live = entry?.published ?? fallback;
        const working = (user && entry?.draft) || live;
        if (!working) { nextMissing[s] = true; continue; }
        nextDocs[s] = working;
        nextPublished[s] = json(live);
        nextSaved[s] = json(entry?.draft && user ? entry.draft : live);
      }
      setDocs((d) => ({ ...d, ...nextDocs }));
      setSaved((d) => ({ ...d, ...nextSaved }));
      setPublished((d) => ({ ...d, ...nextPublished }));
      setMissing((m) => ({ ...m, ...nextMissing }));
    }).catch(() => {
      if (cancelled) return;
      // API unreachable: fall back to the built-in content so the site still renders.
      const nextDocs = {};
      for (const s of wanted) if (DEFAULTS[s]) nextDocs[s] = DEFAULTS[s];
      setDocs((d) => ({ ...nextDocs, ...d }));
      setSaved((d) => ({ ...Object.fromEntries(Object.entries(nextDocs).map(([k, v]) => [k, json(v)])), ...d }));
      setPublished((d) => ({ ...Object.fromEntries(Object.entries(nextDocs).map(([k, v]) => [k, json(v)])), ...d }));
    });
    return () => { cancelled = true; };
  }, [slug, sessionReady, user, missing]);

  // ---- Reading & writing the document tree -------------------------------------------------
  const pageKey = !docs[slug] && missing[slug] ? '404' : slug;

  const resolve = useCallback((path) => {
    if (path.startsWith('page.')) return `${pageKey}.${path.slice(5)}`;
    if (path.startsWith('global.')) return `_global.${path.slice(7)}`;
    return path;
  }, [pageKey]);

  const get = useCallback((path) => getIn(docs, resolve(path)), [docs, resolve]);

  const commit = useCallback((next, key) => {
    const now = Date.now();
    const coalesce = key && lastEdit.current.key === key && now - lastEdit.current.at < 1200;
    if (!coalesce) {
      undoStack.current.push(docsRef.current);
      if (undoStack.current.length > HISTORY_LIMIT) undoStack.current.shift();
    }
    lastEdit.current = { key, at: now };
    redoStack.current = [];
    docsRef.current = next;
    setDocs(next);
  }, []);

  const set = useCallback((path, value) => {
    const full = resolve(path);
    commit(setIn(docsRef.current, full, value), full);
  }, [commit, resolve]);

  const update = useCallback((path, fn) => {
    const full = resolve(path);
    commit(setIn(docsRef.current, full, fn(getIn(docsRef.current, full))), null);
  }, [commit, resolve]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(docsRef.current);
    docsRef.current = prev;
    setDocs(prev);
    lastEdit.current = { key: null, at: 0 };
    bump((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(docsRef.current);
    docsRef.current = next;
    setDocs(next);
    lastEdit.current = { key: null, at: 0 };
    bump((n) => n + 1);
  }, []);

  // ---- Section operations (current page) ----------------------------------------------------
  const sections = docs[pageKey]?.sections ?? [];

  const addSection = useCallback((type, props, at) => {
    const id = uid();
    update('page.sections', (list = []) => {
      const copy = [...list];
      copy.splice(at ?? copy.length, 0, { id, type, props: clone(props) });
      return copy;
    });
    setUi((u) => ({ ...u, tab: 'page', selected: id, adding: null }));
    return id;
  }, [update]);

  const moveSection = useCallback((from, to) => update('page.sections', (list) => move(list, from, to)), [update]);
  const removeSection = useCallback((id) => {
    update('page.sections', (list) => list.filter((s) => s.id !== id));
    setUi((u) => (u.selected === id ? { ...u, selected: null } : u));
  }, [update]);
  const duplicateSection = useCallback((id) => {
    const copyId = uid();
    update('page.sections', (list) => {
      const i = list.findIndex((s) => s.id === id);
      if (i < 0) return list;
      const copy = [...list];
      copy.splice(i + 1, 0, { ...clone(list[i]), id: copyId });
      return copy;
    });
    setUi((u) => ({ ...u, selected: copyId }));
  }, [update]);
  const toggleSection = useCallback((id) => update('page.sections', (list) => list.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s))), [update]);

  // ---- Saving ----------------------------------------------------------------------------
  const dirty = useMemo(() => Object.keys(docs).filter((s) => json(docs[s]) !== saved[s]), [docs, saved]);
  const unpublished = useMemo(() => Object.keys(docs).filter((s) => json(docs[s]) !== published[s]), [docs, published]);

  const saveDraft = useCallback(async () => {
    const targets = Object.keys(docsRef.current).filter((s) => json(docsRef.current[s]) !== saved[s]);
    if (!targets.length) return;
    setStatus({ state: 'saving', message: 'Saving draft…' });
    try {
      const snapshot = {};
      for (const s of targets) {
        snapshot[s] = json(docsRef.current[s]);
        await api.saveDraft(s, docsRef.current[s]);
      }
      setSaved((prev) => ({ ...prev, ...snapshot }));
      setStatus({ state: 'saved', message: 'Draft saved' });
    } catch (e) {
      setStatus({ state: 'error', message: e.message });
    }
  }, [saved]);

  const publish = useCallback(async () => {
    const targets = Object.keys(docsRef.current).filter((s) => json(docsRef.current[s]) !== published[s]);
    if (!targets.length) return;
    setStatus({ state: 'saving', message: 'Publishing…' });
    try {
      const snapshot = {};
      for (const s of targets) {
        snapshot[s] = json(docsRef.current[s]);
        await api.publishPage(s, docsRef.current[s]);
      }
      setSaved((prev) => ({ ...prev, ...snapshot }));
      setPublished((prev) => ({ ...prev, ...snapshot }));
      setStatus({ state: 'saved', message: `Published ${targets.length} ${targets.length === 1 ? 'page' : 'pages'}` });
    } catch (e) {
      setStatus({ state: 'error', message: e.message });
    }
  }, [published]);

  const discardChanges = useCallback(async () => {
    const targets = Object.keys(docsRef.current).filter((s) => json(docsRef.current[s]) !== published[s]);
    await Promise.all(targets.map((s) => api.discardDraft(s).catch(() => {})));
    const restored = { ...docsRef.current };
    for (const s of targets) {
      const live = JSON.parse(published[s]);
      if (live) restored[s] = live;
    }
    undoStack.current = [];
    redoStack.current = [];
    docsRef.current = restored;
    setDocs(restored);
    setSaved((prev) => ({ ...prev, ...Object.fromEntries(targets.map((s) => [s, published[s]])) }));
    setStatus({ state: 'idle', message: '' });
  }, [published]);

  // Autosave the draft shortly after editing stops, so nothing is lost on refresh.
  useEffect(() => {
    if (!editing || !dirty.length) return undefined;
    const t = setTimeout(saveDraft, 2500);
    return () => clearTimeout(t);
  }, [editing, dirty, saveDraft]);

  useEffect(() => {
    if (!dirty.length) return undefined;
    const warn = (e) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty.length]);

  // ---- Pages ------------------------------------------------------------------------------
  const createPage = useCallback(async ({ title, slug: newSlug, addToNav }) => {
    const clean = newSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!clean || ['home', '404'].includes(clean) || docsRef.current[clean]) throw new Error('That address is already in use.');
    let next = {
      ...docsRef.current,
      [clean]: {
        meta: { title, seoTitle: `${title} — ${GLOBAL.header.logoWord}`, seoDescription: '' },
        sections: [
          { id: uid(), type: 'pageHero', props: { variant: 'dark', eyebrow: 'New page', title, lead: 'Write an introduction here.', showChips: false } },
        ],
      },
    };
    if (addToNav) {
      const nav = getIn(next, '_global.header.nav') || [];
      next = setIn(next, '_global.header.nav', [...nav, { label: title, to: `/${clean}` }]);
    }
    commit(next, null);
    setMissing((m) => { const { [clean]: _, ...rest } = m; return rest; });
    navigate(`/${clean}`);
  }, [commit, navigate]);

  const removePage = useCallback(async (target) => {
    await api.deletePage(target);
    const { [target]: _, ...rest } = docsRef.current;
    docsRef.current = rest;
    setDocs(rest);
    setMissing((m) => ({ ...m, [target]: true }));
    if (target === slug) navigate('/');
  }, [navigate, slug]);

  // ---- UI -------------------------------------------------------------------------------
  const setEditing = useCallback((on) => {
    setEditingState(on);
    if (!on) setUi((u) => ({ ...u, selected: null, media: null }));
  }, []);
  const select = useCallback((id) => setUi((u) => ({ ...u, tab: 'page', selected: id, adding: null })), []);
  const openAdd = useCallback((at) => setUi((u) => ({ ...u, tab: 'page', selected: null, adding: at })), []);
  const closeAdd = useCallback(() => setUi((u) => ({ ...u, adding: null })), []);
  const selectGlobal = useCallback((group) => setUi((u) => ({ ...u, tab: 'global', group })), []);
  const setTab = useCallback((tab) => setUi((u) => ({ ...u, tab })), []);
  const openMedia = useCallback((path, mode = 'image') => setUi((u) => ({ ...u, media: { path, mode } })), []);
  const closeMedia = useCallback(() => setUi((u) => ({ ...u, media: null })), []);

  const doc = docs[pageKey] ?? null;
  const notFound = pageKey === '404' && slug !== '404';

  const value = {
    user, sessionReady, signIn, signOut,
    slug, doc, notFound, sections, loading: !doc && !(missing[slug] && missing['404']),
    docs, get, set, update, resolve,
    editing: editing && !!user, setEditing,
    ui, select, openAdd, closeAdd, selectGlobal, setTab, openMedia, closeMedia, pageKey,
    addSection, moveSection, removeSection, duplicateSection, toggleSection,
    undo, redo, canUndo: undoStack.current.length > 0, canRedo: redoStack.current.length > 0,
    dirty, unpublished, status, saveDraft, publish, discardChanges,
    createPage, removePage,
  };

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}
