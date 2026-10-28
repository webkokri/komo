// SEO / AEO / GEO / AIO engine. Pure functions, shared by the React site, the Express API
// (robots.txt, sitemap.xml, llms.txt) and the build-time prerender script.

export const AI_BOTS = [
  ['GPTBot', 'OpenAI — model training'],
  ['OAI-SearchBot', 'OpenAI — ChatGPT search results'],
  ['ChatGPT-User', 'OpenAI — user-requested browsing'],
  ['ClaudeBot', 'Anthropic — model training'],
  ['Claude-SearchBot', 'Anthropic — Claude search results'],
  ['Claude-User', 'Anthropic — user-requested browsing'],
  ['PerplexityBot', 'Perplexity — answer engine index'],
  ['Perplexity-User', 'Perplexity — user-requested browsing'],
  ['Google-Extended', 'Google — Gemini training and grounding'],
  ['Applebot-Extended', 'Apple — Apple Intelligence training'],
  ['Meta-ExternalAgent', 'Meta — AI training'],
  ['Amazonbot', 'Amazon — Alexa and AI answers'],
  ['CCBot', 'Common Crawl — open datasets'],
  ['Bytespider', 'ByteDance — AI training'],
];

export const BUSINESS_TYPES = ['ProfessionalService', 'LocalBusiness', 'EventVenue', 'Store', 'HomeAndConstructionBusiness', 'Organization'];
export const SCHEMA_TYPES = ['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage', 'Service', 'FAQPage'];

const DEFAULT_SITE_URL = 'https://komorebiinteriors.ca';
const H1_TYPES = new Set(['hero', 'pageHero', 'aboutHero']);
const TEXT_KEYS = new Set(['eyebrow', 'title', 'lead', 'text', 'quote', 'by', 'q', 'a', 'meta', 'cat', 'note', 'kanji']);
const SERVICE_SLUGS = new Set(['corporate-events', 'weddings', 'other-events']);
const SLUG_TYPE = { 'about-us': 'AboutPage', 'contact-us': 'ContactPage' };

export const siteUrlOf = (global) => String(global?.seo?.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
export const pathOf = (slug) => (slug === 'home' ? '/' : `/${slug}`);
const clip = (s, n) => (String(s || '').length > n ? `${String(s).slice(0, n - 1).trimEnd()}…` : String(s || ''));
const words = (s) => (String(s || '').match(/[\p{L}\p{N}'’-]+/gu) || []).length;

/** Makes a stored image path absolute. Uploaded images are served by the API origin. */
export function absoluteUrl(src, { siteUrl, assetBase = '' } = {}) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/uploads')) return `${(assetBase || siteUrl || '').replace(/\/+$/, '')}${src}`;
  return `${siteUrl || ''}${src.startsWith('/') ? '' : '/'}${src}`;
}

// ---- Reading page content ---------------------------------------------------------------------
const visible = (doc) => (doc?.sections || []).filter((s) => !s.hidden);

function walk(value, out, key = '') {
  if (typeof value === 'string') {
    if (TEXT_KEYS.has(key) && value.trim()) out.push({ key, value: value.trim() });
  } else if (Array.isArray(value)) {
    value.forEach((v) => walk(v, out, key));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(v, out, k);
  }
}

/** Plain-text lines of a page, in reading order. */
export function pageLines(doc) {
  const out = [];
  for (const s of visible(doc)) {
    const found = [];
    walk(s.props, found);
    for (const f of found) out.push({ ...f, section: s.type });
  }
  return out;
}

export const pageText = (doc) => pageLines(doc).map((l) => l.value).join('\n');
export const wordCount = (doc) => words(pageText(doc));

export function h1Of(doc) {
  const s = visible(doc).find((x) => H1_TYPES.has(x.type) && x.props?.title);
  return s?.props?.title || '';
}

export function faqsOf(doc) {
  const out = [];
  for (const s of visible(doc)) {
    if (s.type === 'faq') for (const it of s.props?.items || []) if (it.q && it.a) out.push({ q: it.q, a: it.a });
  }
  return out;
}

function imagesOf(doc) {
  const out = [];
  const seen = new Set();
  const visit = (v) => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') {
      if (typeof v.src === 'string' && v.src && /\.(jpe?g|png|webp|gif|avif)$/i.test(v.src) && !seen.has(v.src)) {
        seen.add(v.src);
        out.push({ src: v.src, alt: v.alt || '' });
      }
      Object.values(v).forEach(visit);
    }
  };
  visit(doc?.sections || []);
  return out;
}

function internalLinks(doc) {
  let n = 0;
  const visit = (v, key = '') => {
    if (Array.isArray(v)) v.forEach((x) => visit(x, key));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => visit(x, k));
    else if (typeof v === 'string' && key === 'to' && v.startsWith('/')) n += 1;
  };
  visit(doc?.sections || []);
  return n;
}

// ---- Head tags + structured data --------------------------------------------------------------
const ROBOTS_INDEX = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

function orgNode(global, siteUrl, assetBase) {
  const seo = global?.seo || {};
  const b = seo.business || {};
  const contact = global?.contact || {};
  const logo = absoluteUrl(global?.header?.logoImage, { siteUrl, assetBase });
  const node = {
    '@type': b.type || 'ProfessionalService',
    '@id': `${siteUrl}/#organization`,
    name: b.name || seo.siteName || global?.header?.logoWord || 'Komorebi',
    url: siteUrl,
  };
  if (b.legalName) node.legalName = b.legalName;
  if (seo.defaultDescription) node.description = seo.defaultDescription;
  if (logo) { node.logo = { '@type': 'ImageObject', url: logo }; node.image = logo; }
  if (contact.phone) node.telephone = contact.phone;
  if (contact.email) node.email = contact.email;
  if (b.priceRange) node.priceRange = b.priceRange;
  if (b.foundingYear) node.foundingDate = String(b.foundingYear);
  if (b.street || b.city || b.region || b.postal) {
    node.address = {
      '@type': 'PostalAddress',
      ...(b.street && { streetAddress: b.street }),
      ...(b.city && { addressLocality: b.city }),
      ...(b.region && { addressRegion: b.region }),
      ...(b.postal && { postalCode: b.postal }),
      ...(b.country && { addressCountry: b.country }),
    };
  }
  if (b.lat !== '' && b.lng !== '' && b.lat != null && b.lng != null && !Number.isNaN(Number(b.lat)) && !Number.isNaN(Number(b.lng))) {
    node.geo = { '@type': 'GeoCoordinates', latitude: Number(b.lat), longitude: Number(b.lng) };
  }
  const areas = (b.serviceAreas || []).filter(Boolean);
  if (areas.length) node.areaServed = areas.map((name) => ({ '@type': 'Place', name }));
  const hours = String(b.openingHours || '').split('\n').map((s) => s.trim()).filter(Boolean);
  if (hours.length) node.openingHours = hours;
  if (b.languages) node.knowsLanguage = b.languages.split(',').map((s) => s.trim()).filter(Boolean);
  const knows = String(b.knowsAbout || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (knows.length) node.knowsAbout = knows;
  const same = [...(contact.socials || []).map((s) => s.href), ...String(b.sameAs || '').split('\n')]
    .map((s) => String(s || '').trim()).filter((s) => /^https?:\/\//i.test(s));
  if (same.length) node.sameAs = [...new Set(same)];
  const services = (b.services || []).filter((s) => s.name);
  if (services.length) {
    node.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, ...(s.description && { description: s.description }) },
      })),
    };
  }
  return node;
}

/**
 * Everything that belongs in <head> for one page.
 * `doc` is the page document, `global` the shared "_global" document.
 */
export function pageSeo({ global, doc, slug, assetBase = '' }) {
  const seo = global?.seo || {};
  const meta = doc?.meta || {};
  const ps = meta.seo || {};
  const siteUrl = siteUrlOf(global);
  const siteName = seo.siteName || global?.header?.logoWord || 'Komorebi';
  const url = ps.canonical || `${siteUrl}${pathOf(slug)}`;
  const baseTitle = meta.seoTitle || (meta.title ? `${meta.title} — ${siteName}` : siteName);
  const title = (seo.titleTemplate && seo.titleTemplate.includes('%s') && !meta.seoTitle ? seo.titleTemplate.replace('%s', meta.title || siteName) : baseTitle);
  const description = clip(meta.seoDescription || seo.defaultDescription || '', 320);
  const noindex = !!ps.noindex || !!seo.noindexSite || slug === '404';
  const robots = noindex ? 'noindex,nofollow' : ROBOTS_INDEX;
  const ogImage = absoluteUrl(ps.ogImage || seo.ogImage || global?.header?.logoImage, { siteUrl, assetBase });
  const ogTitle = ps.ogTitle || title;
  const ogDescription = ps.ogDescription || description;

  const tags = [];
  const m = (attrs) => tags.push({ tag: 'meta', attrs });
  const l = (attrs) => tags.push({ tag: 'link', attrs });
  if (description) m({ name: 'description', content: description });
  m({ name: 'robots', content: robots });
  if (ps.keyword) m({ name: 'keywords', content: ps.keyword });
  l({ rel: 'canonical', href: url });
  m({ property: 'og:type', content: slug === 'home' ? 'website' : 'article' });
  m({ property: 'og:site_name', content: siteName });
  m({ property: 'og:locale', content: seo.locale || 'en_CA' });
  m({ property: 'og:url', content: url });
  m({ property: 'og:title', content: ogTitle });
  if (ogDescription) m({ property: 'og:description', content: ogDescription });
  if (ogImage) m({ property: 'og:image', content: ogImage });
  m({ name: 'twitter:card', content: ogImage ? 'summary_large_image' : 'summary' });
  m({ name: 'twitter:title', content: ogTitle });
  if (ogDescription) m({ name: 'twitter:description', content: ogDescription });
  if (ogImage) m({ name: 'twitter:image', content: ogImage });
  if (seo.twitter) m({ name: 'twitter:site', content: seo.twitter.startsWith('@') ? seo.twitter : `@${seo.twitter}` });
  const v = seo.verification || {};
  if (v.google) m({ name: 'google-site-verification', content: v.google });
  if (v.bing) m({ name: 'msvalidate.01', content: v.bing });
  if (v.yandex) m({ name: 'yandex-verification', content: v.yandex });
  if (v.pinterest) m({ name: 'p:domain_verify', content: v.pinterest });
  if (v.facebook) m({ name: 'facebook-domain-verification', content: v.facebook });

  // Structured data: one @graph with the business (GEO), the site, the page and breadcrumbs.
  const graph = [orgNode(global, siteUrl, assetBase)];
  graph.push({ '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: siteName, inLanguage: (seo.locale || 'en_CA').replace('_', '-'), publisher: { '@id': `${siteUrl}/#organization` } });
  const type = ps.schemaType || SLUG_TYPE[slug] || (SERVICE_SLUGS.has(slug) ? 'Service' : 'WebPage');
  const pageNode = {
    '@type': type === 'Service' || type === 'FAQPage' ? 'WebPage' : type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#organization` },
    inLanguage: (seo.locale || 'en_CA').replace('_', '-'),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.lead'] },
  };
  if (description) pageNode.description = description;
  if (ogImage) pageNode.primaryImageOfPage = { '@type': 'ImageObject', url: ogImage };
  if (ps.quickAnswer) pageNode.abstract = ps.quickAnswer;
  graph.push(pageNode);
  if (type === 'Service') {
    const orgAreas = orgNode(global, siteUrl, assetBase).areaServed;
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: meta.title || title,
      serviceType: meta.title || title,
      ...(description && { description }),
      provider: { '@id': `${siteUrl}/#organization` },
      ...(orgAreas && { areaServed: orgAreas }),
      url,
    });
  }
  if (slug !== 'home' && slug !== '404') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: meta.title || slug, item: url },
      ],
    });
  }
  const faqs = faqsOf(doc);
  if (faqs.length) {
    graph.push({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  }
  const jsonld = [{ '@context': 'https://schema.org', '@graph': graph }];
  const customLd = meta.code?.jsonld;
  if (customLd) {
    try {
      const parsed = JSON.parse(customLd);
      jsonld.push(parsed);
    } catch { /* invalid custom JSON-LD is ignored; the admin shows a warning */ }
  }

  return { title, description, canonical: url, robots, noindex, lang: (seo.locale || 'en_CA').replace('_', '-'), tags, jsonld };
}

// ---- Files for crawlers ------------------------------------------------------------------------
export function buildRobots(global) {
  const seo = global?.seo || {};
  const siteUrl = siteUrlOf(global);
  const lines = [];
  if (seo.noindexSite) {
    lines.push('User-agent: *', 'Disallow: /');
  } else {
    lines.push('User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', '');
    const bots = seo.ai?.bots || {};
    for (const [name] of AI_BOTS) {
      if (bots[name] === 'block') lines.push(`User-agent: ${name}`, 'Disallow: /', '');
    }
  }
  if (seo.robotsExtra && seo.robotsExtra.trim()) lines.push(seo.robotsExtra.trim(), '');
  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** pages: [{ slug, updated_at, doc }] */
export function buildSitemap(global, pages, { assetBase = '' } = {}) {
  const siteUrl = siteUrlOf(global);
  const rows = pages
    .filter((p) => p.slug !== '_global' && p.slug !== '404' && !p.doc?.meta?.seo?.noindex)
    .sort((a, b) => (a.slug === 'home' ? -1 : b.slug === 'home' ? 1 : a.slug.localeCompare(b.slug)))
    .map((p) => {
      const loc = p.doc?.meta?.seo?.canonical || `${siteUrl}${pathOf(p.slug)}`;
      const last = p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : '';
      const images = imagesOf(p.doc).slice(0, 20)
        .map((i) => `    <image:image><image:loc>${esc(absoluteUrl(i.src, { siteUrl, assetBase }))}</image:loc>${i.alt ? `<image:title>${esc(i.alt)}</image:title>` : ''}</image:image>`).join('\n');
      return `  <url>\n    <loc>${esc(loc)}</loc>${last ? `\n    <lastmod>${last}</lastmod>` : ''}\n    <changefreq>${p.slug === 'home' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${p.slug === 'home' ? '1.0' : '0.8'}</priority>${images ? `\n${images}` : ''}\n  </url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${rows.join('\n')}\n</urlset>\n`;
}

function factsBlock(global) {
  const seo = global?.seo || {};
  const b = seo.business || {};
  const contact = global?.contact || {};
  const out = [];
  if (contact.phone) out.push(`Phone: ${contact.phone}`);
  if (contact.email) out.push(`Email: ${contact.email}`);
  const addr = [b.street, b.city, b.region, b.postal, b.country].filter(Boolean).join(', ');
  if (addr) out.push(`Address: ${addr}`);
  const areas = (b.serviceAreas || []).filter(Boolean);
  if (areas.length) out.push(`Service area: ${areas.join('; ')}`);
  if (contact.hours) out.push(`Hours: ${contact.hours}`);
  for (const f of (seo.ai?.facts || []).filter(Boolean)) out.push(f);
  return out;
}

/** llms.txt — a short, curated map of the site for AI assistants. */
export function buildLlms(global, pages) {
  const seo = global?.seo || {};
  const siteUrl = siteUrlOf(global);
  const name = seo.business?.name || seo.siteName || 'Komorebi';
  const lines = [`# ${name}`, ''];
  const summary = seo.ai?.summary || seo.defaultDescription;
  if (summary) lines.push(`> ${summary.replace(/\s*\n+\s*/g, ' ')}`, '');
  const facts = factsBlock(global);
  if (facts.length) lines.push('## Key facts', ...facts.map((f) => `- ${f}`), '');
  lines.push('## Pages');
  for (const p of pages.filter((x) => x.slug !== '_global' && x.slug !== '404' && !x.doc?.meta?.seo?.noindex)) {
    const m = p.doc?.meta || {};
    const desc = m.seo?.aiSummary || m.seoDescription || '';
    lines.push(`- [${m.title || p.slug}](${siteUrl}${pathOf(p.slug)})${desc ? `: ${desc.replace(/\s*\n+\s*/g, ' ')}` : ''}`);
  }
  lines.push('', '## Full content', `- [Complete site text for AI](${siteUrl}/llms-full.txt)`);
  return `${lines.join('\n')}\n`;
}

/** llms-full.txt — the readable text of every page. */
export function buildLlmsFull(global, pages) {
  const siteUrl = siteUrlOf(global);
  const seo = global?.seo || {};
  const name = seo.business?.name || seo.siteName || 'Komorebi';
  const out = [`# ${name} — full site content`, ''];
  const facts = factsBlock(global);
  if (facts.length) out.push('## Key facts', ...facts.map((f) => `- ${f}`), '');
  for (const p of pages.filter((x) => x.slug !== '_global' && x.slug !== '404' && !x.doc?.meta?.seo?.noindex)) {
    const m = p.doc?.meta || {};
    out.push(`## ${m.title || p.slug}`, `URL: ${siteUrl}${pathOf(p.slug)}`);
    if (m.seo?.quickAnswer) out.push('', `Quick answer: ${m.seo.quickAnswer}`);
    if (m.seo?.aiSummary) out.push('', m.seo.aiSummary);
    out.push('');
    let lastKey = '';
    for (const l of pageLines(p.doc)) {
      if (l.key === 'title') out.push(`### ${l.value}`);
      else if (l.key === 'q') out.push(`**${l.value}**`);
      else if (l.key === 'eyebrow' || l.key === 'kanji') continue;
      else out.push(l.value);
      lastKey = l.key;
    }
    if (lastKey) out.push('');
  }
  return `${out.join('\n')}\n`;
}

// ---- Analysis ------------------------------------------------------------------------------------
const lvl = (ok, warn = false) => (ok ? 'good' : warn ? 'warn' : 'bad');

/** Checks one page. Returns { score, checks: [{ id, group, status, label, hint }] } */
export function analyzePage({ global, doc, slug }) {
  const meta = doc?.meta || {};
  const ps = meta.seo || {};
  const seo = global?.seo || {};
  const head = pageSeo({ global, doc, slug });
  const h1 = h1Of(doc);
  const text = pageText(doc);
  const wc = words(text);
  const kw = String(ps.keyword || '').trim().toLowerCase();
  const first100 = text.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
  const imgs = imagesOf(doc);
  const noAlt = imgs.filter((i) => !i.alt.trim()).length;
  const faqs = faqsOf(doc).length;
  const qa = words(ps.quickAnswer);
  const b = seo.business || {};
  const checks = [];
  const add = (group, id, status, label, hint) => checks.push({ id, group, status, label, hint });

  const tl = head.title.length;
  add('SEO', 'title', tl === 0 ? 'bad' : lvl(tl >= 30 && tl <= 60, true), 'Page title length', `${tl} characters. Aim for 30–60 so Google shows it in full.`);
  const dl = head.description.length;
  add('SEO', 'description', dl === 0 ? 'bad' : lvl(dl >= 70 && dl <= 160, true), 'Meta description length', `${dl} characters. Aim for 70–160.`);
  add('SEO', 'h1', lvl(!!h1, false), 'Main heading (H1)', h1 ? `"${clip(h1, 60)}"` : 'Add a page heading or intro section with a title.');
  if (kw) {
    add('SEO', 'kw-title', lvl(head.title.toLowerCase().includes(kw), true), 'Focus keyword in title', `"${ps.keyword}"`);
    add('SEO', 'kw-desc', lvl(head.description.toLowerCase().includes(kw), true), 'Focus keyword in description', `"${ps.keyword}"`);
    add('SEO', 'kw-h1', lvl(h1.toLowerCase().includes(kw), true), 'Focus keyword in H1', `"${ps.keyword}"`);
    add('SEO', 'kw-intro', lvl(first100.includes(kw), true), 'Focus keyword in the first 100 words', `"${ps.keyword}"`);
  } else {
    add('SEO', 'kw', 'warn', 'Focus keyword', 'Set the phrase this page should rank for.');
  }
  add('SEO', 'words', lvl(wc >= 300, wc >= 120), 'Content length', `${wc} words. 300+ gives search engines more to work with.`);
  add('SEO', 'alt', imgs.length === 0 ? 'warn' : lvl(noAlt === 0, noAlt <= 1), 'Image descriptions (alt text)', imgs.length ? `${imgs.length - noAlt} of ${imgs.length} images have alt text.` : 'No images on this page.');
  add('SEO', 'links', lvl(internalLinks(doc) > 0, false), 'Internal links', `${internalLinks(doc)} link(s) to other pages.`);
  add('SEO', 'social', lvl(!!(ps.ogImage || seo.ogImage || global?.header?.logoImage), true), 'Social share image', 'Shown when the page is shared on Facebook, LinkedIn, WhatsApp…');
  add('SEO', 'index', head.noindex ? 'warn' : 'good', 'Indexable', head.noindex ? 'This page is hidden from search engines.' : 'Search engines may index this page.');
  add('AEO', 'quick', qa === 0 ? 'warn' : lvl(qa >= 25 && qa <= 80, true), 'Quick answer', qa ? `${qa} words. 25–80 reads best as a spoken or featured answer.` : 'Write a direct 1–3 sentence answer to the page\'s main question.');
  add('AEO', 'faq', lvl(faqs >= 2, faqs === 1), 'Questions & answers on the page', faqs ? `${faqs} question(s) — included as FAQ structured data.` : 'Add an FAQ section with real customer questions.');
  add('GEO', 'geo-address', lvl(!!(b.city || b.street), false), 'Business location', b.city || b.street ? [b.street, b.city, b.region].filter(Boolean).join(', ') : 'Add your city or address under SEO & GEO.');
  add('GEO', 'geo-areas', lvl((b.serviceAreas || []).filter(Boolean).length > 0, false), 'Service areas', `${(b.serviceAreas || []).filter(Boolean).length} area(s) listed.`);
  add('GEO', 'geo-contact', lvl(!!(global?.contact?.phone && global?.contact?.email), true), 'Phone and email', 'Used in structured data so assistants can quote them.');
  add('AIO', 'ai-summary', lvl(words(ps.aiSummary) >= 20, words(ps.aiSummary) > 0), 'AI summary', ps.aiSummary ? `${words(ps.aiSummary)} words, used in llms.txt.` : 'Add a factual summary for AI assistants.');
  add('AIO', 'ai-bots', lvl(!seo.noindexSite && !(seo.ai?.bots && Object.values(seo.ai.bots).includes('block')), true), 'AI crawlers allowed', Object.values(seo.ai?.bots || {}).includes('block') ? 'Some AI crawlers are blocked in robots.txt.' : 'AI search crawlers can read this site.');
  if (ps.keyword === undefined) { /* keep the list stable */ }
  if (meta.code?.jsonld) {
    let ok = true;
    try { JSON.parse(meta.code.jsonld); } catch { ok = false; }
    add('AIO', 'jsonld', lvl(ok, false), 'Custom JSON-LD is valid', ok ? 'Valid JSON.' : 'The custom JSON-LD could not be parsed and is ignored.');
  }

  const total = checks.length;
  const pts = checks.reduce((n, c) => n + (c.status === 'good' ? 1 : c.status === 'warn' ? 0.5 : 0), 0);
  return { score: Math.round((pts / total) * 100), checks };
}

/** HTML string for one head tag (prerender). */
export function tagToHtml(t) {
  const attrs = Object.entries(t.attrs || {}).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
  if (t.tag === 'script') return `<script${attrs}>${String(t.text || '').replace(/<\/script/gi, '<\\/script')}</script>`;
  return `<${t.tag}${attrs}>`;
}

export const jsonldTags = (head) => head.jsonld.map((o) => ({ tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(o) }));
export const escapeHtml = esc;

/** Fills any missing SEO settings from the defaults (older saved documents have none). */
export function withSeoDefaults(global, defaults) {
  const g = global || {};
  const d = defaults || {};
  const seo = g.seo || {};
  return {
    ...d,
    ...g,
    contact: { ...d.contact, ...g.contact },
    header: { ...d.header, ...g.header },
    seo: {
      ...d.seo,
      ...seo,
      verification: { ...d.seo?.verification, ...seo.verification },
      business: { ...d.seo?.business, ...seo.business },
      ai: { ...d.seo?.ai, ...seo.ai, bots: { ...d.seo?.ai?.bots, ...seo.ai?.bots } },
    },
  };
}
