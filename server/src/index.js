import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import express from 'express';
import multer from 'multer';
import { migrate, pool } from './db.js';
import { clearSession, rateLimit, readSession, requireEditor, setSession } from './session.js';
import * as cms from './cms.js';

for (const key of ['DATABASE_URL', 'SESSION_SECRET']) {
  if (!process.env[key]) throw new Error(`Missing ${key}. Copy server/.env.example to server/.env and fill it in.`);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS = path.join(here, '..', 'uploads');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$|^_global$/;
const MAX_DOC_BYTES = 1_000_000;

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d', immutable: true }));

const api = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const validSlug = (req, res, next) => (SLUG.test(req.params.slug) ? next() : res.status(400).json({ error: 'Invalid page slug.' }));
const validDoc = (req, res, next) => {
  const { doc } = req.body || {};
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return res.status(400).json({ error: 'doc must be an object.' });
  if (Buffer.byteLength(JSON.stringify(doc)) > MAX_DOC_BYTES) return res.status(413).json({ error: 'Page is too large.' });
  next();
};

// ---- Session ----------------------------------------------------------------------------
api.get('/session', (req, res) => res.json({ user: readSession(req) }));

api.post('/session', rateLimit({ windowMs: 15 * 60_000, max: 20 }), wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required.' });
  const user = await cms.verifyLogin(email.trim(), password);
  if (!user) return res.status(401).json({ error: 'Wrong email or password.' });
  setSession(res, user);
  res.json({ user });
}));

api.delete('/session', (req, res) => {
  clearSession(res);
  res.json({ user: null });
});

// ---- Pages ------------------------------------------------------------------------------
// Visitors get the published doc. Signed-in editors also get their unpublished draft.
api.get('/pages', wrap(async (req, res) => {
  const slugs = String(req.query.slugs || '').split(',').filter(Boolean);
  if (!slugs.length || slugs.length > 20 || !slugs.every((s) => SLUG.test(s))) return res.status(400).json({ error: 'Invalid slugs.' });
  const editor = readSession(req);
  const [pages, drafts] = await Promise.all([
    cms.getPages(slugs),
    editor ? pool.query('select slug, doc from komorebi_page_drafts where slug = any($1)', [slugs]) : { rows: [] },
  ]);
  const out = {};
  for (const slug of slugs) {
    const page = pages.find((p) => p.slug === slug);
    const draft = drafts.rows.find((d) => d.slug === slug);
    if (page || draft) out[slug] = { title: page?.title, published: page?.doc ?? null, draft: draft?.doc ?? null };
  }
  res.json({ pages: out });
}));

api.get('/pages/all', requireEditor, wrap(async (req, res) => {
  const [pages, drafts] = await Promise.all([cms.listPages(), pool.query('select slug from komorebi_page_drafts')]);
  const draftSlugs = new Set(drafts.rows.map((d) => d.slug));
  const list = pages.map((p) => ({ slug: p.slug, title: p.title, published: true, hasDraft: draftSlugs.has(p.slug) }));
  for (const slug of draftSlugs) {
    if (!list.some((p) => p.slug === slug)) list.push({ slug, title: slug, published: false, hasDraft: true });
  }
  res.json({ pages: list.sort((a, b) => a.slug.localeCompare(b.slug)) });
}));

api.put('/pages/:slug/draft', requireEditor, validSlug, validDoc, wrap(async (req, res) => {
  await pool.query(
    `insert into komorebi_page_drafts (slug, doc) values ($1, $2)
     on conflict (slug) do update set doc = excluded.doc, updated_at = now()`,
    [req.params.slug, req.body.doc]
  );
  res.json({ ok: true });
}));

api.delete('/pages/:slug/draft', requireEditor, validSlug, wrap(async (req, res) => {
  await pool.query('delete from komorebi_page_drafts where slug = $1', [req.params.slug]);
  res.json({ ok: true });
}));

api.post('/pages/:slug/publish', requireEditor, validSlug, validDoc, wrap(async (req, res) => {
  const { slug } = req.params;
  const { doc } = req.body;
  const title = String(doc.meta?.title || (slug === '_global' ? 'Site settings' : slug)).slice(0, 120);
  const description = String(doc.meta?.seoDescription || '').slice(0, 300);
  await cms.writePage(slug, { title, description, doc });
  await pool.query('delete from komorebi_page_drafts where slug = $1', [slug]);
  res.json({ ok: true });
}));

api.delete('/pages/:slug', requireEditor, validSlug, wrap(async (req, res) => {
  const { slug } = req.params;
  if (['home', '404', '_global'].includes(slug)) return res.status(400).json({ error: 'This page is required and cannot be deleted.' });
  await cms.removePage(slug);
  await pool.query('delete from komorebi_page_drafts where slug = $1', [slug]);
  res.json({ ok: true });
}));

// Rename a page's URL, change its title or search description without opening the editor.
api.patch('/pages/:slug', requireEditor, validSlug, wrap(async (req, res) => {
  const { slug } = req.params;
  const { title, description, seoTitle, newSlug } = req.body || {};
  const [page] = await cms.getPages([slug]);
  if (!page) return res.status(404).json({ error: 'Publish this page first.' });
  const doc = { ...page.doc, meta: { ...page.doc.meta, title: title ?? page.title, seoTitle: seoTitle ?? page.doc.meta?.seoTitle, seoDescription: description ?? page.description } };
  await cms.writePage(slug, { title: String(title ?? page.title).slice(0, 120), description: String(description ?? page.description).slice(0, 300), doc });
  if (newSlug && newSlug !== slug) {
    if (['home', '404', '_global'].includes(slug)) return res.status(400).json({ error: 'This page keeps its address.' });
    if (!SLUG.test(newSlug) || newSlug === '_global') return res.status(400).json({ error: 'Use lowercase letters, numbers and dashes in the address.' });
    if ((await cms.getPages([newSlug])).length) return res.status(409).json({ error: 'Another page already uses that address.' });
    await cms.renamePage(slug, newSlug);
  }
  res.json({ ok: true });
}));

// ---- Media ------------------------------------------------------------------------------
const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif' };
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED[file.mimetype] || ''}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => (ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG, WebP, GIF or AVIF images are allowed.'))),
});
const toMedia = (r) => ({ id: r.id, url: `/uploads/${r.filename}`, name: r.original, alt: r.alt, size: r.size });

api.get('/media', requireEditor, wrap(async (req, res) => {
  const { rows } = await pool.query('select * from komorebi_media order by created_at desc limit 200');
  res.json({ media: rows.map(toMedia) });
}));

api.post('/media', requireEditor, upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received.' });
  const { rows } = await pool.query(
    'insert into komorebi_media (filename, original, mime, size, alt) values ($1,$2,$3,$4,$5) returning *',
    [req.file.filename, req.file.originalname.slice(0, 200), req.file.mimetype, req.file.size, String(req.body.alt || '').slice(0, 200)]
  );
  res.json({ media: toMedia(rows[0]) });
}));

api.patch('/media/:id', requireEditor, wrap(async (req, res) => {
  await pool.query('update komorebi_media set alt = $2 where id = $1', [Number(req.params.id) || 0, String(req.body?.alt || '').slice(0, 200)]);
  res.json({ ok: true });
}));

api.delete('/media/:id', requireEditor, wrap(async (req, res) => {
  const { rows } = await pool.query('delete from komorebi_media where id = $1 returning filename', [Number(req.params.id) || 0]);
  if (rows[0]) await fs.promises.rm(path.join(UPLOADS, rows[0].filename), { force: true });
  res.json({ ok: true });
}));

// ---- Contact form -----------------------------------------------------------------------
api.post('/enquiries', rateLimit({ windowMs: 60_000, max: 5 }), wrap(async (req, res) => {
  const { website, ...fields } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: bots fill hidden fields
  const name = String(fields.name || '').slice(0, 200);
  const email = String(fields.email || '').slice(0, 200);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter your name and a valid email.' });
  const details = Object.fromEntries(Object.entries(fields).slice(0, 30).map(([k, v]) => [k.slice(0, 60), String(v).slice(0, 5000)]));
  await pool.query('insert into komorebi_enquiries (name, email, details) values ($1,$2,$3)', [name, email, details]);
  res.json({ ok: true });
}));

// ---- Admin: dashboard, leads, users -----------------------------------------------------
api.get('/admin/stats', requireEditor, wrap(async (req, res) => {
  const one = async (sql) => Number((await pool.query(sql)).rows[0].n);
  res.json({
    pages: await one("select count(*) n from komorebi_pages where slug <> '_global'"),
    drafts: await one('select count(*) n from komorebi_page_drafts'),
    media: await one('select count(*) n from komorebi_media'),
    leads: await one('select count(*) n from komorebi_enquiries'),
    unread: await one('select count(*) n from komorebi_enquiries where not read'),
    recent: (await pool.query('select id, name, email, read, created_at from komorebi_enquiries order by created_at desc limit 5')).rows,
  });
}));

api.get('/admin/leads', requireEditor, wrap(async (req, res) => {
  const { rows } = await pool.query('select * from komorebi_enquiries order by created_at desc limit 500');
  res.json({ leads: rows });
}));

api.patch('/admin/leads/:id', requireEditor, wrap(async (req, res) => {
  await pool.query('update komorebi_enquiries set read = $2 where id = $1', [Number(req.params.id) || 0, !!req.body?.read]);
  res.json({ ok: true });
}));

api.delete('/admin/leads/:id', requireEditor, wrap(async (req, res) => {
  await pool.query('delete from komorebi_enquiries where id = $1', [Number(req.params.id) || 0]);
  res.json({ ok: true });
}));

const requireAdmin = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Only admins can manage users.' }));
const checkUser = ({ email, password, role }, creating) => {
  if (creating && !/^\S+@\S+\.\S+$/.test(email || '')) return 'Enter a valid email.';
  if ((creating || password) && String(password || '').length < 8) return 'Password must be at least 8 characters.';
  if (role && !['admin', 'editor'].includes(role)) return 'Unknown role.';
  return null;
};

api.get('/admin/users', requireEditor, requireAdmin, wrap(async (req, res) => res.json({ users: await cms.listUsers() })));

api.post('/admin/users', requireEditor, requireAdmin, wrap(async (req, res) => {
  const problem = checkUser(req.body || {}, true);
  if (problem) return res.status(400).json({ error: problem });
  try {
    res.json({ user: await cms.createUser(req.body) });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A user with that email already exists.' });
    throw err;
  }
}));

api.patch('/admin/users/:id', requireEditor, requireAdmin, wrap(async (req, res) => {
  const problem = checkUser(req.body || {}, false);
  if (problem) return res.status(400).json({ error: problem });
  if (Number(req.params.id) === req.user.id && req.body.role && req.body.role !== 'admin') return res.status(400).json({ error: 'You cannot remove your own admin role.' });
  await cms.updateUser(Number(req.params.id), req.body);
  res.json({ ok: true });
}));

api.delete('/admin/users/:id', requireEditor, requireAdmin, wrap(async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
  await cms.deleteUser(Number(req.params.id));
  res.json({ ok: true });
}));

app.use('/api', api);

// In production the same process can serve the built React site (npm run build in the project root).
const DIST = path.join(here, '..', '..', 'dist');
if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));
  app.get(/^\/admin(\/|$)/, (req, res) => res.sendFile(path.join(DIST, 'admin.html')));
  app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.startsWith('Only ')) return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

await migrate();
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`KOMOREBI API listening on http://localhost:${port}`));
