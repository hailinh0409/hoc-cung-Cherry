import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';

// Xoá người chơi mẫu (dùng để xem trước bảng xếp hạng)
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const db = admin();
  const q = db.from('ltt_players').delete().eq('mau', true);
  const { error } = b.id ? await q.eq('account_id', b.id) : await q;
  if (!error) await db.from('ltt_accounts').delete().eq('role', 'student').like('name_norm', 'mẫu:%');
  return error ? fail('Chưa xoá được', 500) : json({ ok: true });
}
