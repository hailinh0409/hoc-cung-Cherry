import 'server-only';
import crypto from 'node:crypto';
import { admin } from './supabase/admin';
import { figBlocks } from './figcode';

const ST = { draft: 'nhap', published: 'giao', hidden: 'an' }, TS = { nhap: 'draft', giao: 'published', an: 'hidden' };
export const SPECIAL_TOPIC = 'chuyen-toan';
export const toStatus = s => TS[s];
const sha1 = c => crypto.createHash('sha1').update(c, 'utf8').digest('hex');

// Chủ đề theo định dạng giao diện dùng; học sinh chỉ nhận chủ đề đã duyệt
// khoi: khối của học sinh. Học sinh chỉ nhận bài của khối mình (cộng Chuyên Toán nếu được mở); giáo viên nhận tất cả.
export async function loadTopics(teacher, knownVersion = '', specialAccess = teacher, khoi = '') {
  let manifest = admin().from('ltt_topics').select('id,updated_at,chuong,grade');
  if (!teacher) manifest = manifest.eq('status','published');
  // Mốc thay đổi của hình đã dịch: hình được dịch sau khi bài lưu (GitHub Actions), nên phiên bản phải tính cả hình.
  // Nhờ vậy máy học sinh chỉ tải lại bài khi bài hoặc hình thật sự đổi (trước đây tải lại cả kho 15 phút một lần).
  const [{ data: rows, error }, { data: figRow }, { count: figCount }] = await Promise.all([
    manifest,
    admin().from('ltt_figures').select('updated_at').order('updated_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
    admin().from('ltt_figures').select('hash', { count: 'exact', head: true }),
  ]);
  if (error) throw error;
  const ownGrade = !teacher && khoi ? String(khoi) : '';
  const allowed = row => row.chuong === SPECIAL_TOPIC ? specialAccess : (!ownGrade || String(row.grade) === ownGrade);
  const visibleRows = (rows || []).filter(allowed);
  const figStamp = [figRow?.updated_at || '', figCount ?? ''];
  const topicVersion = rows && rows.length < 1000 && visibleRows.every(r => r.updated_at)
    ? sha1(JSON.stringify([teacher, specialAccess, ownGrade, figStamp, visibleRows.map(r => [r.id, r.updated_at]).sort()])) : '';
  if (topicVersion && topicVersion === knownVersion) return { topicVersion };
  let q = admin().from('ltt_topics').select('id,slug,title,grade,status,source,sort,nguon,phan,chuong,updated_at' + (teacher ? ',ban_truoc' : ''));
  if (!teacher) q = q.eq('status', 'published');
  const { data, error: readError } = await q;
  if (readError) throw readError;
  const topics = (data || []).filter(allowed).map(t => ({ id: t.slug, uid: t.id, khoi: t.chuong === SPECIAL_TOPIC ? SPECIAL_TOPIC : t.grade, phan: t.phan || 'dai-so', chuong: t.chuong || '', title: t.title, text: t.source,
    trangthai: ST[t.status] || 'nhap', thutu: t.sort || 0, nguon: t.nguon || '', capnhat: t.updated_at || '', ...(teacher ? { banTruoc: t.ban_truoc || '' } : {}) }));
  const blocks = [...new Set(topics.flatMap(t => figBlocks(t.text)))];
  const figs = {};
  if (blocks.length) {
    const hs = Object.fromEntries(blocks.map(b => [sha1(b), b]));
    const { data: rows } = await admin().from('ltt_figures').select('hash,error').in('hash', Object.keys(hs));
    for (const r of rows || []) if (!r.error) figs[hs[r.hash]] = r.hash;
  }
  return { topics, figs, topicVersion };
}
