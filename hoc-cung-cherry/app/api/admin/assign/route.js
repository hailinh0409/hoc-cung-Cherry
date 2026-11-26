import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';
import { baoBaiMoi } from '@/lib/push-core.mjs';

export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const db = admin();
  const { data: t } = await db.from('ltt_topics').select('id,title,status').eq('slug', String(b.topicId || '')).maybeSingle();
  if (!t) return fail('Không tìm thấy chủ đề', 404);
  const due = b.due ? new Date(b.due) : null;
  if (due && isNaN(due)) return fail('Hạn nộp không hợp lệ');
  const { error } = await db.from('ltt_assignments').insert({ class: String(b.khoi), topic_id: t.id, levels: Math.max(1, Math.min(4, Number(b.levels) || 1)), due_at: due ? due.toISOString() : null, note: String(b.note || '').slice(0, 200) });
  if (error) return fail('Chưa lưu được', 500);
  // Báo ngay về máy học sinh khối đó (chỉ khi bài đã duyệt cho học sinh). Lỗi gửi thông báo không làm hỏng việc giao bài.
  let thongBao = 0;
  if (t.status === 'published') { try { thongBao = (await baoBaiMoi(db, { khoi: String(b.khoi), title: t.title, due: due ? due.toISOString() : null })).sent || 0; } catch {} }
  return json({ ok: true, thongBao });
}
export async function DELETE(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const id = new URL(req.url).searchParams.get('id');
  const { error } = await admin().from('ltt_assignments').delete().eq('id', id);
  return error ? fail('Chưa xoá được', 500) : json({ ok: true });
}
