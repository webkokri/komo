import pg from 'pg';

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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
  `);
}
