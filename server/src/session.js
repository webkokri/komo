import crypto from 'node:crypto';

const COOKIE = 'kmb_session';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

const sign = (payload) => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');

export function setSession(res, user) {
  const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  res.append('Set-Cookie', `${COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

export function clearSession(res) {
  res.append('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function readSession(req) {
  const raw = /(?:^|;\s*)kmb_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data.user : null;
  } catch {
    return null;
  }
}

export function requireEditor(req, res, next) {
  const user = readSession(req);
  if (!user) return res.status(401).json({ error: 'Sign in to edit.' });
  req.user = user;
  next();
}

/** Tiny in-memory limiter, enough to slow brute force and form spam. */
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return res.status(429).json({ error: 'Too many requests. Try again shortly.' });
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
