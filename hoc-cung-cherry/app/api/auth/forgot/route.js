import { admin } from '@/lib/supabase/admin';
import { pickStudent } from '@/lib/accounts';
import { json, fail } from '@/lib/session';

export async function POST(req) {
  const { name, khoi } = await req.json().catch(() => ({}));
  const r = await pickStudent(name, khoi);
  if (r.err) return fail(r.err, 404);
  if (r.choose) return json({ choose: r.choose });
  await admin().from('ltt_accounts').update({ reset_req: true, reset_at: new Date().toISOString() }).eq('id', r.acc.id);
  return json({ ok: true });
}
