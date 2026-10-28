import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mediaUrl } from './api.js';
import { GLOBAL } from './defaults.js';
import { jsonldTags, pageSeo, withSeoDefaults } from './seo.js';
import { useCms } from './store.jsx';

const MARK = 'data-kmb';

function build({ tag, attrs, text }) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  if (text) el.textContent = text;
  el.setAttribute(MARK, 'seo');
  return el;
}

/** Keeps <title>, meta tags, canonical, Open Graph and JSON-LD in sync with the current page. */
export function SeoHead() {
  const { get, docs, pageKey, editing } = useCms();
  const meta = get('page.meta');
  const sections = get('page.sections');
  const rawGlobal = docs._global;

  useEffect(() => {
    if (!rawGlobal || !meta) return undefined;
    const global = withSeoDefaults(rawGlobal, GLOBAL);
    const head = pageSeo({ global, doc: { meta, sections }, slug: pageKey, assetBase: new URL(mediaUrl('/uploads/x'), window.location.origin).origin });
    document.title = head.title;
    document.documentElement.lang = head.lang;
    document.head.querySelectorAll(`[${MARK}="seo"], meta[name="description"]`).forEach((n) => n.remove());
    const nodes = [...head.tags, ...jsonldTags(head)].map(build);
    nodes.forEach((n) => document.head.appendChild(n));
    return () => nodes.forEach((n) => n.remove());
  }, [meta, sections, rawGlobal, pageKey, editing]);

  return null;
}

/** Applies the redirects set in SEO & GEO → Redirects. */
export function Redirects() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { get } = useCms();
  const rules = get('global.seo.redirects');

  useEffect(() => {
    if (!Array.isArray(rules)) return;
    const path = pathname.replace(/\/+$/, '') || '/';
    const hit = rules.find((r) => r.from && (r.from.replace(/\/+$/, '') || '/') === path && r.to);
    if (!hit) return;
    if (/^https?:\/\//i.test(hit.to)) window.location.replace(hit.to);
    else navigate(hit.to, { replace: true });
  }, [pathname, rules, navigate]);

  return null;
}

// ---- Code injection -------------------------------------------------------------------------------
function runnable(node) {
  // Scripts created through innerHTML never run, so they are rebuilt.
  if (node.nodeName !== 'SCRIPT') return node;
  const s = document.createElement('script');
  for (const a of node.attributes) s.setAttribute(a.name, a.value);
  s.text = node.textContent;
  return s;
}

function insert(html, where, tag) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const made = [];
  for (const child of [...tpl.content.childNodes]) {
    const n = runnable(child);
    if (n.nodeType === 1) n.setAttribute(MARK, tag);
    made.push(n);
    if (where === 'head') document.head.appendChild(n);
    else if (where === 'start') document.body.insertBefore(n, document.body.firstChild);
    else document.body.appendChild(n);
  }
  return made;
}

const gtag = (id) => `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');</script>`;
const gtmHead = (id) => `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');</script>`;
const gtmBody = (id) => `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
const pixel = (id) => `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');</script>`;
const SAFE_ID = /^[A-Za-z0-9_-]{4,40}$/;

/** Site-wide tracking IDs and the head / body / footer / CSS / JS boxes (set by admins). Not run inside the editor. */
export function CodeInjection() {
  const { get, editing } = useCms();
  const code = get('global.code');
  const pageCode = get('page.meta.code');
  const key = JSON.stringify(code || {});
  const pageKey = JSON.stringify(pageCode || {});

  useEffect(() => {
    if (editing) return undefined;
    const c = code || {};
    const made = [];
    if (SAFE_ID.test(c.gaId || '')) made.push(...insert(gtag(c.gaId), 'head', 'code'));
    if (SAFE_ID.test(c.gtmId || '')) {
      made.push(...insert(gtmHead(c.gtmId), 'head', 'code'));
      made.push(...insert(gtmBody(c.gtmId), 'start', 'code'));
    }
    if (/^\d{5,20}$/.test(c.pixelId || '')) made.push(...insert(pixel(c.pixelId), 'head', 'code'));
    if (c.css) { const st = document.createElement('style'); st.setAttribute(MARK, 'code'); st.textContent = c.css; document.head.appendChild(st); made.push(st); }
    if (c.head) made.push(...insert(c.head, 'head', 'code'));
    if (c.bodyStart) made.push(...insert(c.bodyStart, 'start', 'code'));
    if (c.footer) made.push(...insert(c.footer, 'end', 'code'));
    if (c.js) made.push(...insert(`<script>${c.js}</script>`, 'end', 'code'));
    return () => made.forEach((n) => n.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, editing]);

  useEffect(() => {
    if (editing) return undefined;
    const c = pageCode || {};
    const made = [];
    if (c.css) { const st = document.createElement('style'); st.setAttribute(MARK, 'page-code'); st.textContent = c.css; document.head.appendChild(st); made.push(st); }
    if (c.head) made.push(...insert(c.head, 'head', 'page-code'));
    if (c.footer) made.push(...insert(c.footer, 'end', 'page-code'));
    if (c.js) made.push(...insert(`<script>${c.js}</script>`, 'end', 'page-code'));
    return () => made.forEach((n) => n.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, editing]);

  return null;
}
