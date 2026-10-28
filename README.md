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

**2. Vercel (site + admin + API in one project)** – import the repo with the **repo root** as Root Directory (framework preset *Other*; `vercel.json` sets the build and routes). Add env vars `DATABASE_URL` and `SESSION_SECRET`, then redeploy. `/admin` and `/api` are then on the same domain, so the login cookie is first-party and no CORS or proxy is needed. Add `komorebiinteriors.ca` as a custom domain on the project if you want it served from Vercel.

**Hostinger instead (optional):** build the site and upload `dist/` to `public_html`; `public/.htaccess` routes `/admin` and proxies `/api` and `/uploads` to your Vercel domain (replace the two `YOUR-PROJECT.vercel.app` placeholders; needs `mod_proxy`). Alternatively set `VITE_API_URL` to a Vercel API domain and add `CORS_ORIGINS` there.

**One server instead:** `npm run build`, then `cd server && npm start` serves API, site and `/admin` together.

Add a new section type: component in `src/cms/sections/`, register in `src/cms/registry.js`.
# komo
# komo
