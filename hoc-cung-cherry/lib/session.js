import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { admin } from './supabase/admin';

const NAME = 'cherry_s';
const DAYS = 60;
const key = () => {
  const k = process.env.SESSION_SECRET;
  if (!k || k.length < 32) throw Object.assign(new Error('Máy chủ chưa cấu hình SESSION_SECRET (cần ít nhất 32 ký tự) trong Vercel → Settings → Environment Variables.'), { config: true });
  return k;
};
const sign = s => crypto.createHmac('sha256', key()).update(s).digest('base64url');

export function setSession(acc) {
  const body = Buffer.from(JSON.stringify({ id: acc.id, r: acc.role, e: Date.now() + DAYS * 864e5 })).toString('base64url');
  cookies().set(NAME, `${body}.${sign(body)}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: DAYS * 86400 });
}
export function clearSession() { cookies().set(NAME, '', { path: '/', maxAge: 0 }); }

function readCookie() {
  const v = cookies().get(NAME)?.value || '';
  const [body, sig] = v.split('.');
  if (!body || !sig) return null;
  const good = sign(body);
  if (good.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  try { const s = JSON.parse(Buffer.from(body, 'base64url').toString()); return s.e > Date.now() ? s : null; } catch { return null; }
}

// Tài khoản đang đăng nhập (kiểm tra lại trong cơ sở dữ liệu: còn hoạt động không)
export async function getAccount() {
  const s = readCookie();
  if (!s) return null;
  const { data } = await admin().from('ltt_accounts').select('id,role,name,khoi,mon,is_default,active').eq('id', s.id).maybeSingle();
  return data && data.active ? data : null;
}
export const json = (x, status = 200) => Response.json(x, { status, headers: { 'Cache-Control': 'no-store' } });
export const fail = (msg, status = 400, extra) => json({ error: msg, ...extra }, status);
export async function needTeacher() {
  const a = await getAccount();
  return a && a.role === 'teacher' ? a : null;
}
export const accPublic = a => ({ id: a.id, role: a.role, name: a.name, khoi: a.khoi, mon: a.mon || ['toan'] });
