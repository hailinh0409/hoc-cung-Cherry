import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';

// Giáo viên xử lý báo lỗi: ids là danh sách (các bạn cùng báo một câu được xử lý một lần)
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const ids = (Array.isArray(b.ids) ? b.ids : [b.id]).map(String).filter(Boolean).slice(0, 200);
  if (!ids.length) return fail('Thiếu mã báo lỗi');
  const q = db => db.from('ltt_reports');
  const db = admin();
  let r;
  if (b.action === 'done') r = await q(db).update({ status: 'xong', resolved_at: new Date().toISOString() }).in('id', ids);
  else if (b.action === 'reopen') r = await q(db).update({ status: 'moi', resolved_at: null }).in('id', ids);
  else if (b.action === 'delete') r = await q(db).delete().in('id', ids);
  else return fail('Thao tác không hợp lệ');
  return r.error ? fail('Chưa lưu được', 500) : json({ ok: true });
}
