// Run once against any database: npm run sync-uploads
// Creates the tables and copies server/uploads/* into komorebi_media.data.
import { importDiskUploads, migrate, pool } from './db.js';

await migrate();
await importDiskUploads();
const { rows } = await pool.query('select count(*) filter (where data is not null) as stored, count(*) as total from komorebi_media');
console.log(`Images stored in the database: ${rows[0].stored} of ${rows[0].total}`);
await pool.end();
