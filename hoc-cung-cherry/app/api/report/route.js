import { admin } from '@/lib/supabase/admin';
import { getAccount, json, fail } from '@/lib/session';

const KIND = ['de', 'dapan', 'khac'];
const PER_DAY = 20;
// Học sinh báo lỗi một câu hỏi. Cùng một câu đang chờ thầy xem thì gộp (cập nhật lý do, ghi chú), không tạo bản mới.
export async function POST(req) {
  const a = await getAccount();
  if (!a) return fail('Chưa đăng nhập', 401);
  if (a.role !== 'student') return fail('Giáo viên sửa câu trực tiếp bằng nút ✎');
  const b = await req.json().catch(() => ({}));
  const kind = String(b.kind || ''), qkey = String(b.qkey || '').slice(0, 64), slug = String(b.tid || '').slice(0, 120);
  const note = String(b.note || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (!KIND.includes(kind) || !qkey || !slug) return fail('Thiếu thông tin câu hỏi');
  let snap = b.snap && typeof b.snap === 'object' ? b.snap : {};
  if (JSON.stringify(snap).length > 12000) snap = { stem: String(snap.stem || '').slice(0, 3000), cut: true };
  const db = admin();
  const { data: t } = await db.from('ltt_topics').select('id').eq('slug', slug).maybeSingle();
  if (!t) return fail('Không tìm thấy bài của câu này', 404);
  const { data: mine, error: e1 } = await db.from('ltt_reports').select('id,qkey,status,created_at').eq('account_id', a.id);
  if (e1) return fail('Chưa gửi được, em thử lại sau', 500);
  const open = (mine || []).find(r => r.qkey === qkey && r.status === 'moi');
  if (open) {
    const { error } = await db.from('ltt_reports').update({ kind, note, snap }).eq('id', open.id);
    return error ? fail('Chưa gửi được, em thử lại sau', 500) : json({ ok: true, dup: true });
  }
  const day = Date.now() - 864e5;
  if ((mine || []).filter(r => Date.parse(r.created_at) > day).length >= PER_DAY) return fail('Hôm nay em đã báo nhiều câu rồi, mai báo tiếp nhé.', 429);
  const { error } = await db.from('ltt_reports').insert({ account_id: a.id, topic_slug: slug, qkey, kind, note, snap, status: 'moi' });
  return error ? fail('Chưa gửi được, em thử lại sau', 500) : json({ ok: true });
}
