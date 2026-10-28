import crypto from 'node:crypto';
import { pool } from './db.js';

// ---- Pages ------------------------------------------------------------------------------
// "_global" holds the header, footer, contact details and theme shared by every page.
const shape = (r) => ({ slug: r.slug, title: r.title, description: r.description, doc: r.doc, publishedAt: r.published_at, updatedAt: r.updated_at });

export async function getPages(slugs) {
  const { rows } = await pool.query('select * from komorebi_pages where slug = any($1)', [slugs]);
  return rows.map(shape);
}

export async function listPages() {
  const { rows } = await pool.query('select slug, title, description, published_at, updated_at from komorebi_pages order by title');
  return rows.map((r) => ({ ...shape({ ...r, doc: null }), doc: undefined }));
}

export async function writePage(slug, { title, description = '', doc }) {
  await pool.query(
    `insert into komorebi_pages (slug, title, description, doc) values ($1,$2,$3,$4)
     on conflict (slug) do update set title = excluded.title, description = excluded.description,
       doc = excluded.doc, updated_at = now()`,
    [slug, title, description, doc]
  );
}

export async function removePage(slug) {
  const { rowCount } = await pool.query('delete from komorebi_pages where slug = $1', [slug]);
  return rowCount > 0;
}

/** Change a page's URL slug; its draft moves with it. */
export async function renamePage(from, to) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('update komorebi_pages set slug = $2, updated_at = now() where slug = $1', [from, to]);
    await client.query('update komorebi_page_drafts set slug = $2 where slug = $1', [from, to]);
    await client.query('commit');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

// ---- Users ------------------------------------------------------------------------------
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const given = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

export async function verifyLogin(email, password) {
  const { rows } = await pool.query('select * from komorebi_users where lower(email) = lower($1)', [email]);
  const user = rows[0];
  return user && checkPassword(password, user.password_hash) ? publicUser(user) : null;
}

export async function listUsers() {
  const { rows } = await pool.query('select id, email, name, role, created_at from komorebi_users order by id');
  return rows;
}

export async function createUser({ email, name = '', role = 'editor', password }) {
  const { rows } = await pool.query(
    'insert into komorebi_users (email, name, role, password_hash) values ($1,$2,$3,$4) returning *',
    [email.trim(), name.trim(), role, hashPassword(password)]
  );
  return publicUser(rows[0]);
}

export async function updateUser(id, { name, role, password }) {
  if (name !== undefined) await pool.query('update komorebi_users set name = $2 where id = $1', [id, name.trim()]);
  if (role) await pool.query('update komorebi_users set role = $2 where id = $1', [id, role]);
  if (password) await pool.query('update komorebi_users set password_hash = $2 where id = $1', [id, hashPassword(password)]);
}

export async function deleteUser(id) {
  await pool.query('delete from komorebi_users where id = $1', [id]);
}
