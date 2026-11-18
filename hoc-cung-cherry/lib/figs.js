import 'server-only';
import crypto from 'node:crypto';
import { admin } from './supabase/admin';
import { figBlocks } from './figcode';

export const sha1 = c => crypto.createHash('sha1').update(c, 'utf8').digest('hex');

// Tình trạng các hình của một chủ đề: map khối→hash (hình đã dịch) và danh sách chi tiết
export async function figStatus(source) {
  const blocks = figBlocks(source);
  if (!blocks.length) return { map: {}, list: [] };
  const hashes = blocks.map(sha1);
  const { data } = await admin().from('ltt_figures').select('hash,error').in('hash', hashes);
  const rows = Object.fromEntries((data || []).map(r => [r.hash, r]));
  const list = blocks.map((code, i) => {
    const r = rows[hashes[i]];
    return { code, hash: hashes[i], ok: !!r && !r.error, error: r?.error || null };
  });
  return { map: Object.fromEntries(list.filter(x => x.ok).map(x => [x.code, x.hash])), list };
}
