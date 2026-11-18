import 'server-only';
import crypto from 'node:crypto';
// Băm mã PIN / mật khẩu bằng scrypt (chậm có chủ đích), so sánh an toàn thời gian.
export function hashSecret(s) {
  const salt = crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(String(s), salt, 32, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$${salt}$${h}`;
}
export function checkSecret(s, stored) {
  const [k, salt, h] = String(stored || '').split('$');
  if (k !== 'scrypt' || !salt || !h) return false;
  const x = crypto.scryptSync(String(s), salt, 32, { N: 16384, r: 8, p: 1 });
  const y = Buffer.from(h, 'hex');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
