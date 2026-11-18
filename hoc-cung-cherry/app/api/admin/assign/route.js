import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';

export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const db = admin();
  const { data: t } = await db.from('ltt_topics').select('id').eq('slug', String(b.topicId || '')).maybeSingle();
  if (!t) return fail('Không tìm thấy chủ đề', 404);
  const due = b.due ? new Date(b.due) : null;
  if (due && isNaN(due)) return fail('Hạn nộp không hợp lệ');
  const { error } = await db.from('ltt_assignments').insert({ class: String(b.khoi), topic_id: t.id, levels: Math.max(1, Math.min(4, Number(b.levels) || 1)), due_at: due ? due.toISOString() : null, note: String(b.note || '').slice(0, 200) });
  return error ? fail('Chưa lưu được', 500) : json({ ok: true });
}
export async function DELETE(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const id = new URL(req.url).searchParams.get('id');
  const { error } = await admin().from('ltt_assignments').delete().eq('id', id);
  return error ? fail('Chưa xoá được', 500) : json({ ok: true });
}
