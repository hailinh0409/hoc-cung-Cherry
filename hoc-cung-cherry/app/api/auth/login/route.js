import { pickStudent, verify, loadPlayer } from '@/lib/accounts';
import { setSession, json, fail, accPublic } from '@/lib/session';

export async function POST(req) {
  const { name, khoi, pin } = await req.json().catch(() => ({}));
  if (!String(name || '').trim()) return fail('Em nhập họ và tên.');
  if (!/^\d{4}$/.test(String(pin || ''))) return fail('Mật khẩu gồm đúng 4 chữ số.');
  const r = await pickStudent(name, khoi);
  if (r.err) return fail(r.err, 404);
  if (r.choose) return json({ choose: r.choose });
  const v = await verify(r.acc, pin);
  if (!v.ok) return fail(v.msg, 401);
  try { setSession(r.acc); } catch (e) { return fail(e.message, 500); }
  return json({ acc: accPublic(r.acc), data: await loadPlayer(r.acc.id), isDefault: r.acc.is_default });
}
