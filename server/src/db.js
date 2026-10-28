import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

// Hosted Postgres (Neon, Supabase, Vercel Postgres) needs TLS; local databases don't. Few connections: serverless spawns many instances.
// Vercel's database integrations name the variable after the project (e.g. komo_POSTGRES_URL), so accept those too.
const urlKey = ['DATABASE_URL', ...Object.keys(process.env).filter((k) => /(^|_)(POSTGRES_URL|DATABASE_URL)$/.test(k))].find((k) => process.env[k]);
const url = (urlKey && process.env[urlKey]) || '';
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url) || !url.includes('@');
export const pool = new pg.Pool({ connectionString: url, max: 3, ssl: local ? undefined : { rejectUnauthorized: false } });

const UPLOADS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');

export async function migrate() {
  await pool.query(`
    create table if not exists komorebi_users (
      id serial primary key,
      email text not null unique,
      name text not null default '',
      role text not null default 'editor' check (role in ('admin','editor')),
      password_hash text not null,
      created_at timestamptz not null default now()
    );
    create table if not exists komorebi_pages (
      slug text primary key,
      title text not null,
      description text not null default '',
      doc jsonb not null,
      published_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table if not exists komorebi_page_drafts (
      slug text primary key,
      doc jsonb not null,
      updated_at timestamptz not null default now()
    );
    create table if not exists komorebi_enquiries (
      id serial primary key,
      name text,
      email text,
      details jsonb,
      read boolean not null default false,
      created_at timestamptz not null default now()
    );
    alter table komorebi_enquiries add column if not exists read boolean not null default false;
    create table if not exists komorebi_media (
      id serial primary key,
      filename text not null,
      original text,
      mime text,
      size integer,
      alt text default '',
      created_at timestamptz not null default now()
    );
    alter table komorebi_media add column if not exists data bytea;
  `);
}

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };

/** Copies image files from server/uploads/ into the database: registers new ones and fills in bytes for rows that lack them. */
export async function importDiskUploads() {
  if (!fs.existsSync(UPLOADS)) return;
  const known = new Set((await pool.query('select filename from komorebi_media')).rows.map((r) => r.filename));
  for (const filename of fs.readdirSync(UPLOADS)) {
    const mime = MIME[path.extname(filename).toLowerCase()];
    if (!mime || known.has(filename)) continue;
    const data = fs.readFileSync(path.join(UPLOADS, filename));
    const alt = path.basename(filename, path.extname(filename)).replace(/[-_]+/g, ' ');
    await pool.query('insert into komorebi_media (filename, original, mime, size, alt, data) values ($1,$1,$2,$3,$4,$5)', [filename, mime, data.length, alt, data]);
  }
  const { rows } = await pool.query('select id, filename from komorebi_media where data is null');
  for (const r of rows) {
    const file = path.join(UPLOADS, r.filename);
    if (fs.existsSync(file)) await pool.query('update komorebi_media set data = $2 where id = $1', [r.id, fs.readFileSync(file)]);
  }
}
