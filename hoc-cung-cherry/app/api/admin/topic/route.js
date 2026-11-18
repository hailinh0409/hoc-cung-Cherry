import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';
import { toStatus } from '@/lib/topics';

// Sửa chủ đề: nội dung LaTeX (lưu bản trước để hoàn tác), trạng thái, phần, chương, thứ tự
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const db = admin();
  const { data: t } = await db.from('ltt_topics').select('id,source').eq('slug', String(b.id || '')).maybeSingle();
  if (!t) return fail('Không tìm thấy chủ đề', 404);
  const up = { updated_at: new Date().toISOString() };
  if (typeof b.text === 'string') { up.source = b.text; up.ban_truoc = t.source; const m = b.text.match(/\\chude\s*\{([^}]*)\}/); if (m && m[1].trim()) up.title = m[1].trim(); }
  if (b.trangthai) { const s = toStatus(b.trangthai); if (!s) return fail('Trạng thái không hợp lệ'); up.status = s; }
  if (b.phan) { if (!['dai-so', 'hinh-hoc', 'thong-ke', 'on-tap'].includes(b.phan)) return fail('Phần không hợp lệ'); up.phan = b.phan; }
  if (b.chuong !== undefined) up.chuong = String(b.chuong || '') || null;
  if (b.thutu !== undefined) up.sort = Math.floor(Number(b.thutu) || 0);
  const { error } = await db.from('ltt_topics').update(up).eq('id', t.id);
  return error ? fail('Chưa lưu được', 500) : json({ ok: true });
}
