import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';
import { toStatus } from '@/lib/topics';
import { plainName } from '@/lib/names';

const PHAN = ['dai-so', 'hinh-hoc', 'thong-ke', 'on-tap'];
const slugify = s => plainName(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'chu-de';
const sameTime = (a, b) => Date.parse(a || 0) === Date.parse(b || 0);

// Sửa chủ đề: nội dung LaTeX (lưu bản trước để hoàn tác), trạng thái, phần, chương, thứ tự.
// action 'create': tạo chủ đề mới (luôn ở trạng thái nháp), dùng cho "Tạo đề ôn tập mới" trong Ngân hàng câu hỏi
// và nút "Dán bài mới" trên bản đồ (gửi kèm text, chuong = mã bài, nguon).
// base: thời điểm sửa gần nhất mà giao diện đang có; nếu chủ đề đã bị sửa ở nơi khác thì từ chối để không ghi đè.
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const db = admin();

  if (b.action === 'create') {
    const title = String(b.title || '').replace(/\s+/g, ' ').trim().slice(0, 120), grade = String(b.khoi || '');
    const phan = PHAN.includes(b.phan) ? b.phan : 'on-tap';
    if (!title || !/^(6|7|8|9|1[0-2])$/.test(grade)) return fail('Thiếu tên hoặc khối');
    const chuong = phan === 'on-tap' ? null : (String(b.chuong || '').trim() || null);
    const code = chuong && /^k\d+-[a-z0-9-]+$/.test(chuong) ? chuong.replace(/^k\d+-/, '') + '-' : '';
    const sl = slugify(title), base = `lop${grade}-${code}${phan === 'on-tap' && !/^de-/.test(sl) ? 'de-' : ''}${sl}`.slice(0, 80);
    const { data: used } = await db.from('ltt_topics').select('slug').like('slug', base + '%');
    const taken = new Set((used || []).map(r => r.slug));
    let slug = base; for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
    const text = typeof b.text === 'string' && b.text.trim() ? b.text : `\\chude{${title.replace(/[{}\\]/g, '')}}\n\n\\man{1}{${phan === 'on-tap' ? 'Đề' : 'Nhận biết'}}\n`;
    const { error } = await db.from('ltt_topics').insert({ slug, title, grade, status: 'draft', source: text, sort: Math.floor(Number(b.thutu) || 0), nguon: String(b.nguon || '').trim().slice(0, 60) || 'Ngân hàng câu hỏi (giáo viên)', phan, chuong });
    return error ? fail('Chưa tạo được', 500) : json({ ok: true, id: slug });
  }

  const { data: t } = await db.from('ltt_topics').select('id,source,updated_at').eq('slug', String(b.id || '')).maybeSingle();
  if (!t) return fail('Không tìm thấy chủ đề', 404);
  if (typeof b.text === 'string' && b.base && t.updated_at && !sameTime(b.base, t.updated_at))
    return fail('Bài này vừa được sửa ở nơi khác (máy tính, tab khác hoặc Claude). App sẽ tải bản mới, thầy sửa lại giúp nhé.', 409);
  const up = { updated_at: new Date().toISOString() };
  if (typeof b.text === 'string') { up.source = b.text; up.ban_truoc = t.source; const m = b.text.match(/\\chude\s*\{([^}]*)\}/); if (m && m[1].trim()) up.title = m[1].trim(); }
  if (b.trangthai) { const s = toStatus(b.trangthai); if (!s) return fail('Trạng thái không hợp lệ'); up.status = s; }
  if (b.phan) { if (!PHAN.includes(b.phan)) return fail('Phần không hợp lệ'); up.phan = b.phan; }
  if (b.chuong !== undefined) up.chuong = String(b.chuong || '') || null;
  if (b.thutu !== undefined) up.sort = Math.floor(Number(b.thutu) || 0);
  const { error } = await db.from('ltt_topics').update(up).eq('id', t.id);
  return error ? fail('Chưa lưu được', 500) : json({ ok: true, updated_at: up.updated_at });
}
