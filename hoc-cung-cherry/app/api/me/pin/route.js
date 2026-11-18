import { admin } from '@/lib/supabase/admin';
import { getAccount, json, fail } from '@/lib/session';
import { verify } from '@/lib/accounts';
import { hashSecret } from '@/lib/secret';

// Học sinh tự đổi mật khẩu khi đã đăng nhập
export async function POST(req) {
  const a = await getAccount();
  if (!a || a.role !== 'student') return fail('Chưa đăng nhập', 401);
  const { old, pin } = await req.json().catch(() => ({}));
  if (!/^\d{4}$/.test(String(old || '')) || !/^\d{4}$/.test(String(pin || ''))) return fail('Mật khẩu gồm đúng 4 chữ số.');
  if (pin === '0000') return fail('Em chọn mật khẩu khác 0000 nhé.');
  const { data: acc } = await admin().from('ltt_accounts').select('id,secret_hash,fails,locked_until').eq('id', a.id).maybeSingle();
  const v = await verify(acc, old);
  if (!v.ok) return fail(v.msg.replace('Sai mật khẩu.', 'Mật khẩu hiện tại chưa đúng.'), 401);
  await admin().from('ltt_accounts').update({ secret_hash: hashSecret(pin), is_default: false, reset_req: false }).eq('id', a.id);
  return json({ ok: true });
}
