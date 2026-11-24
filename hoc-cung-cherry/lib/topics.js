import 'server-only';
import crypto from 'node:crypto';
import { admin } from './supabase/admin';
import { figBlocks } from './figcode';

const ST = { draft: 'nhap', published: 'giao', hidden: 'an' }, TS = { nhap: 'draft', giao: 'published', an: 'hidden' };
export const SPECIAL_TOPIC = 'chuyen-toan';
export const toStatus = s => TS[s];
const sha1 = c => crypto.createHash('sha1').update(c, 'utf8').digest('hex');

// Chủ đề theo định dạng giao diện dùng; học sinh chỉ nhận chủ đề đã duyệt
export async function loadTopics(teacher, knownVersion = '', specialAccess = teacher) {
  let manifest = admin().from('ltt_topics').select('id,updated_at,chuong');
  if (!teacher) manifest = manifest.eq('status','published');
  const { data: rows, error } = await manifest;
  if (error) throw error;
  const allowed = row => specialAccess || row.chuong !== SPECIAL_TOPIC;
  const visibleRows = (rows || []).filter(allowed);
  const topicVersion = rows && rows.length < 1000 && visibleRows.every(r => r.updated_at)
    ? sha1(JSON.stringify([teacher, specialAccess, visibleRows.map(r => [r.id, r.updated_at]).sort()])) : '';
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
