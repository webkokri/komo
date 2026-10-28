// Runs after `vite build`. Fetches the published pages from the API and writes, for every page:
//   dist/<page>/index.html with its own <title>, meta tags, canonical, Open Graph and JSON-LD,
//   plus a <noscript> copy of the text, so crawlers that do not run JavaScript (many AI crawlers) still see the content.
// On Hostinger it also writes robots.txt, sitemap.xml and llms.txt; on Vercel the API serves those live.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLlms, buildLlmsFull, buildRobots, buildSitemap, escapeHtml as esc, h1Of, jsonldTags, pageLines, pageSeo, tagToHtml } from '../src/cms/seo.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

function envFile(name) {
  try {
    const m = new RegExp(`^${name}=(.*)$`, 'm').exec(fs.readFileSync(path.join(root, '.env.production'), 'utf8'));
    return m?.[1]?.trim() || '';
  } catch { return ''; }
}

const api = (process.env.PRERENDER_API_URL || process.env.VITE_API_URL || envFile('VITE_API_URL')
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') || 'http://localhost:3001').replace(/\/$/, '');

const skip = (why) => { console.warn(`prerender: skipped (${why})`); process.exit(0); };
if (!fs.existsSync(path.join(dist, 'index.html'))) skip('dist/index.html not found');

let site;
try {
  const res = await fetch(`${api}/api/seo/site`, { signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  site = await res.json();
} catch (err) {
  skip(`could not reach ${api}: ${err.message}`);
}

const { global, pages } = site;
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const mark = (t) => ({ ...t, attrs: { ...t.attrs, 'data-kmb': 'seo' } });

function noscript(doc, slug) {
  const nav = (global.header?.nav || []).map((n) => `<a href="${esc(n.to)}">${esc(n.label)}</a>`).join(' ');
  const h1 = h1Of(doc);
  const body = [];
  let first = !!h1;
  for (const l of pageLines(doc)) {
    if (l.key === 'title') { if (first && l.value === h1) { first = false; continue; } body.push(`<h2>${esc(l.value)}</h2>`); }
    else if (l.key === 'q') body.push(`<h3>${esc(l.value)}</h3>`);
    else if (l.key === 'eyebrow' || l.key === 'kanji') continue;
    else body.push(`<p>${esc(l.value)}</p>`);
  }
  const c = global.contact || {};
  const contact = [c.phone, c.email, c.address, c.hours].filter(Boolean).map((x) => `<p>${esc(x)}</p>`).join('');
  return `<noscript><div id="seo-content"><nav>${nav}</nav><main>${h1 ? `<h1>${esc(h1)}</h1>` : ''}${body.join('')}</main><footer>${contact}</footer></div></noscript>`;
}

let written = 0;
for (const p of pages) {
  if (p.slug === '404') continue;
  const head = pageSeo({ global, doc: p.doc, slug: p.slug, assetBase: api });
  const tags = [...head.tags, ...jsonldTags(head)].map(mark).map(tagToHtml).join('\n    ');
  let html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${head.lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(head.title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace('</head>', `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript(p.doc, p.slug)}`);
  const out = p.slug === 'home' ? path.join(dist, 'index.html') : path.join(dist, p.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  written += 1;
}

if (!process.env.VERCEL) {
  fs.writeFileSync(path.join(dist, 'robots.txt'), buildRobots(global));
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), buildSitemap(global, pages, { assetBase: api }));
  fs.writeFileSync(path.join(dist, 'llms.txt'), buildLlms(global, pages));
  fs.writeFileSync(path.join(dist, 'llms-full.txt'), buildLlmsFull(global, pages));
  console.log('prerender: wrote robots.txt, sitemap.xml, llms.txt, llms-full.txt');
}
console.log(`prerender: wrote ${written} page(s) from ${api}`);
