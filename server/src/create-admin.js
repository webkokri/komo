// npm run create-admin -- you@example.com "Your Name" [password]
// Creates (or resets the password of) an admin account. Prints the password when it is generated.
import crypto from 'node:crypto';
import { migrate, pool } from './db.js';
import { createUser, updateUser } from './cms.js';

const [email, name = '', given] = process.argv.slice(2);
if (!email) {
  console.error('Usage: npm run create-admin -- <email> [name] [password]');
  process.exit(1);
}
const password = given || crypto.randomBytes(9).toString('base64url');
await migrate();
const { rows } = await pool.query('select id from komorebi_users where lower(email) = lower($1)', [email]);
if (rows[0]) await updateUser(rows[0].id, { role: 'admin', password });
else await createUser({ email, name, role: 'admin', password });
console.log(`${rows[0] ? 'Updated' : 'Created'} admin ${email}${given ? '' : `\nPassword: ${password}`}`);
await pool.end();
