import { admin } from '@/lib/supabase/admin';
import { verify } from '@/lib/accounts';
import { setSession, json, fail, accPublic } from '@/lib/session';

export async function POST(req) {
  const { username, password } = await req.json().catch(() => ({}));
  const { data: acc } = await admin().from('ltt_accounts').select('id,role,name,khoi,mon,secret_hash,fails,locked_until,active')
    .eq('role', 'teacher').eq('username', String(username || '').trim().toLowerCase()).maybeSingle();
  if (!acc || !acc.active) return fail('Sai tên đăng nhập hoặc mật khẩu.', 401);
  const v = await verify(acc, String(password || ''));
  if (!v.ok) return fail(v.msg.replace('Nếu quên, bấm "Quên mật khẩu" để báo thầy.', ''), 401);
  try { setSession(acc); } catch (e) { return fail(e.message, 500); }
  return json({ acc: accPublic(acc) });
}
