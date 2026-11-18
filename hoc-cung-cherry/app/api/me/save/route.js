import { admin } from '@/lib/supabase/admin';
import { getAccount, json, fail } from '@/lib/session';
import { sanitize } from '@/lib/validate';

export async function POST(req) {
  const a = await getAccount();
  if (!a || a.role !== 'student') return fail('Chưa đăng nhập', 401);
  const { doc } = await req.json().catch(() => ({}));
  const db = admin();
  const { data: row } = await db.from('ltt_players').select('data').eq('account_id', a.id).maybeSingle();
  let clean;
  try { clean = sanitize(row?.data, doc, a); } catch (e) { return fail(e.message); }
  const { error } = await db.from('ltt_players').upsert({ account_id: a.id, data: clean, saved_at: new Date().toISOString() });
  if (error) return fail('Chưa lưu được', 500);
  return json({ ok: true, xp: clean.xp, lp: clean.lp, spent: clean.spent, own: clean.own, eq: clean.eq });
}
