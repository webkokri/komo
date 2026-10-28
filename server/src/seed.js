// Loads the starter content (src/cms/defaults.js) into Postgres.
//   npm run seed            only creates pages that do not exist yet
//   npm run seed -- --force overwrites existing pages with the starter content
import { DEFAULTS, pageTitleFor } from '../../src/cms/defaults.js';
import { migrate, pool } from './db.js';
import * as cms from './cms.js';

const force = process.argv.includes('--force');
await migrate();

for (const [slug, doc] of Object.entries(DEFAULTS)) {
  const [existing] = await cms.getPages([slug]);
  if (existing && !force) {
    console.log(`skip    ${slug} (already exists)`);
    continue;
  }
  const title = doc.meta?.title || pageTitleFor(slug);
  await cms.writePage(slug, { title, description: doc.meta?.seoDescription || '', doc });
  await pool.query('delete from komorebi_page_drafts where slug = $1', [slug]);
  console.log(`${existing ? 'updated' : 'created'} ${slug}`);
}
await pool.end();
