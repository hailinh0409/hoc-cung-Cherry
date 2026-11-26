import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';
import { toStatus, SPECIAL_TOPIC } from '@/lib/topics';
import { parseBank } from '@/lib/latex';
import { plainName } from '@/lib/names';

const PHAN = ['dai-so', 'hinh-hoc', 'thong-ke', 'on-tap', 'thi-dau', 'bai-mau']; // thi-dau: Kho Thi đấu theo chương, bai-mau: Bài mẫu theo chương; cả hai có chuong = k<khối>-c<số chương>
const slugify = s => plainName(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'chu-de';
function specialExamError(text, publishing = false) {
  const { levels, errors } = parseBank(text);
  const questions = levels.flatMap(level => level.qs);
  if (questions.some(question => question.type !== 'extl')) return 'Khu Chuyên Toán chỉ nhận câu tự luận.';
  if (errors.length) return 'Đề Chuyên Toán có lỗi LaTeX. Thầy kiểm tra lại nội dung.';
  if (publishing && !questions.length) return 'Cần ít nhất một câu tự luận trước khi duyệt.';
  return '';
}
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
    const special = grade === SPECIAL_TOPIC;
    const phan = special ? 'on-tap' : (PHAN.includes(b.phan) ? b.phan : 'on-tap');
    if (!title || (!special && !/^(6|7|8|9|1[0-2])$/.test(grade))) return fail('Thiếu tên hoặc khối');
    const chuong = special ? SPECIAL_TOPIC : phan === 'on-tap' ? null : (String(b.chuong || '').trim() || null);
    if (phan === 'thi-dau' && !new RegExp(`^k${grade}-c\\d+$`).test(chuong || '')) return fail('Kho Thi đấu cần chọn chương');
    if (phan === 'bai-mau' && !new RegExp(`^k${grade}-c\\d+$`).test(chuong || '')) return fail('Bài mẫu cần chọn chương');
    const code = chuong && /^k\d+-[a-z0-9-]+$/.test(chuong) ? chuong.replace(/^k\d+-/, '') + '-' + (phan === 'bai-mau' ? 'mau-' : '') : '';
    const sl = slugify(title), base = `lop${grade}-${code}${phan === 'on-tap' && !/^de-/.test(sl) ? 'de-' : ''}${sl}`.slice(0, 80);
    const { data: used } = await db.from('ltt_topics').select('slug').like('slug', base + '%');
    const taken = new Set((used || []).map(r => r.slug));
    let slug = base; for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
    const text = typeof b.text === 'string' && b.text.trim() ? b.text : `\\chude{${title.replace(/[{}\\]/g, '')}}\n\n\\man{1}{${phan === 'on-tap' ? 'Đề' : 'Nhận biết'}}\n`;
    if (chuong === SPECIAL_TOPIC && !special) return fail('Hãy tạo đề từ khu Chuyên Toán.');
    if (special) {
      const message = specialExamError(text);
      if (message) return fail(message);
    }
    // Dùng mã khu vực ở cột chuong để giữ kiểu và giá trị grade tương thích với cơ sở dữ liệu hiện có.
    const { error } = await db.from('ltt_topics').insert({ slug, title, grade: special ? '9' : grade, status: 'draft', source: text, sort: Math.floor(Number(b.thutu) || 0), nguon: String(b.nguon || '').trim().slice(0, 60) || 'Ngân hàng câu hỏi (giáo viên)', phan, chuong });
    return error ? fail('Chưa tạo được', 500) : json({ ok: true, id: slug });
  }

  const { data: t } = await db.from('ltt_topics').select('id,source,updated_at,chuong,status').eq('slug', String(b.id || '')).maybeSingle();
  if (!t) return fail('Không tìm thấy chủ đề', 404);
  if (typeof b.text === 'string' && b.base && t.updated_at && !sameTime(b.base, t.updated_at))
    return fail('Bài này vừa được sửa ở nơi khác (máy tính, tab khác hoặc Claude). App sẽ tải bản mới, thầy sửa lại giúp nhé.', 409);
  const up = { updated_at: new Date().toISOString() };
  if (typeof b.text === 'string') { up.source = b.text; up.ban_truoc = t.source; const m = b.text.match(/\\chude\s*\{([^}]*)\}/); if (m && m[1].trim()) up.title = m[1].trim(); }
  if (b.trangthai) { const s = toStatus(b.trangthai); if (!s) return fail('Trạng thái không hợp lệ'); up.status = s; }
  if (b.phan) { if (!PHAN.includes(b.phan)) return fail('Phần không hợp lệ'); up.phan = b.phan; }
  if (b.chuong !== undefined) up.chuong = String(b.chuong || '') || null;
  if (t.chuong === SPECIAL_TOPIC) {
    if ((up.chuong !== undefined && up.chuong !== SPECIAL_TOPIC) || (up.phan && up.phan !== 'on-tap'))
      return fail('Đề Chuyên Toán thuộc khu Chuyên Toán.');
    const publishing = (up.status || t.status) === 'published';
    if (up.source !== undefined || up.status === 'published') {
      const message = specialExamError(up.source ?? t.source, publishing);
      if (message) return fail(message);
    }
  } else if (up.chuong === SPECIAL_TOPIC) return fail('Hãy tạo đề từ khu Chuyên Toán.');
  if (b.thutu !== undefined) up.sort = Math.floor(Number(b.thutu) || 0);
  const { error } = await db.from('ltt_topics').update(up).eq('id', t.id);
  return error ? fail('Chưa lưu được', 500) : json({ ok: true, updated_at: up.updated_at });
}
