import { admin } from '@/lib/supabase/admin';
import { pickStudent, verify } from '@/lib/accounts';
import { hashSecret } from '@/lib/secret';
import { json, fail } from '@/lib/session';

export async function POST(req) {
  const { name, khoi, old, pin } = await req.json().catch(() => ({}));
  if (!/^\d{4}$/.test(String(old || '')) || !/^\d{4}$/.test(String(pin || ''))) return fail('Mật khẩu gồm đúng 4 chữ số.');
  if (pin === '0000') return fail('Em chọn mật khẩu khác 0000 nhé.');
  const r = await pickStudent(name, khoi);
  if (r.err) return fail(r.err, 404);
  if (r.choose) return json({ choose: r.choose });
  const v = await verify(r.acc, old);
  if (!v.ok) return fail(v.msg, 401);
  await admin().from('ltt_accounts').update({ secret_hash: hashSecret(pin), is_default: false, reset_req: false }).eq('id', r.acc.id);
  return json({ ok: true });
}
