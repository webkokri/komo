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

## Deploy

`npm run build`, then `cd server && npm start` serves the API, `dist/` and `/admin` from one process. Set `NODE_ENV=production` and use HTTPS.

Add a new section type: component in `src/cms/sections/`, register in `src/cms/registry.js`.
# komo
# komo
