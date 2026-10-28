# KOMOREBI — Event Décor Website

React site + **Studio CMS** admin (same layout as siman.ca/admin) + Node/Express API + PostgreSQL.

| Part | What it does |
|------|--------------|
| `src/` | The public React site. Every page is a list of **sections**; every heading, text, image, link and list item is data. Also holds the on-page visual editor (`src/cms/`). |
| `src/admin/` | **Studio CMS** at `/admin` (separate entry `admin.html`): Dashboard, Pages, Menus, Media library, Leads, Users, Site settings. |
| `server/` | Express API + PostgreSQL tables (`komorebi_pages`, `komorebi_page_drafts`, `komorebi_users`, `komorebi_media`, `komorebi_enquiries`). |

## Run

```bash
createdb komorebi
cp server/.env.example server/.env     # set DATABASE_URL and SESSION_SECRET
npm install && npm --prefix server install
npm run seed                           # starter content (-- --force overwrites)
npm run create-admin -- you@example.com "Your Name"   # prints a password
npm run dev:all                        # site + admin :5173, API :3001
```

Open <http://localhost:5173/admin>. Sign in, then use **Edit visually** on any page.

## Editing

- **Visual editor** (`/<page>?edit=1`): click text to type, click images to change/upload, click a section for its settings, add/move/duplicate/hide/delete sections, undo/redo. Autosaves a draft; **Publish** makes it live.
- **Pages**: create, rename the address, SEO title/description, delete.
- **Menus** / **Site settings**: header and footer links, contact details, social links, colours. Saved straight to the live site.
- **Leads**: contact-form enquiries. **Users**: admins and editors.

## Images

Uploaded images are stored **in PostgreSQL** (`komorebi_media.data`) and served from `/uploads/<file>`, so they survive redeploys and work on serverless hosting. Uploads are limited to 4 MB (Vercel's request limit). `server/uploads/` holds the starter photos; `npm --prefix server run sync-uploads` copies them into whatever database `DATABASE_URL` points to.

## Deploy: API on Vercel, site on Hostinger

**1. Database** – create a hosted Postgres (Neon, Supabase, Vercel Postgres). With its `DATABASE_URL` in `server/.env`, run once from `server/`:

```bash
npm run seed && npm run sync-uploads
npm run create-admin -- info@komorebiinteriors.ca "Komorebi Admin" 'your-password'
```

**2. API (Vercel)** – import the repo, set **Root Directory = `server`**, and add env vars:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | the hosted Postgres URL |
| `SESSION_SECRET` | a long random string |
| `NODE_ENV` | `production` (cookie becomes `SameSite=None; Secure`) |
| `CORS_ORIGINS` | `https://komorebiinteriors.ca,https://www.komorebiinteriors.ca` |

**Same-domain `/api` (recommended):** `public/.htaccess` proxies `komorebiinteriors.ca/api/*` and `/uploads/*` to Vercel, so the browser only talks to your domain (login cookie is first-party, no CORS). Edit the two `YOUR-PROJECT.vercel.app` lines to your Vercel domain, and turn off *Vercel Authentication* for the project. Check it after upload: `curl https://komorebiinteriors.ca/api/session` should return `{"user":null}`. If you get a 500/403, Hostinger isn't allowing `mod_proxy` – ask their support, or use the fallback below.

**Fallback:** a subdomain such as `api.komorebiinteriors.ca` pointing at Vercel (set `VITE_API_URL=https://api.komorebiinteriors.ca` before building).

**3. Site (Hostinger)** – leave `VITE_API_URL` empty when using the same-domain `/api` proxy (see `.env.production.example`), run `npm run build`, and upload the contents of `dist/` to `public_html/`. `public/.htaccess` (copied into `dist/`) routes `/admin` to the admin app and everything else to the site.

**One server instead:** `npm run build`, then `cd server && npm start` serves API, site and `/admin` together.

Add a new section type: component in `src/cms/sections/`, register in `src/cms/registry.js`.
# komo
# komo
