import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';

// Mốc Thi đấu: khối k đã học hết chương n (n = 0: bỏ mốc, mở mọi chương)
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  if (b.action !== 'moc') return fail('Thao tác không hợp lệ');
  const k = String(b.khoi || ''), n = Math.floor(Number(b.chuong) || 0);
  if (!/^(6|7|8|9|1[0-2])$/.test(k) || n < 0 || n > 20) return fail('Khối hoặc chương không hợp lệ');
  const db = admin();
  const { data: cur, error: e1 } = await db.from('ltt_settings').select('value').eq('key', 'moc_thi_dau').maybeSingle();
  if (e1) return fail('Chưa lưu được', 500);
  const value = { ...(cur?.value || {}) };
  if (n) value[k] = n; else delete value[k];
  const { error } = await db.from('ltt_settings').upsert({ key: 'moc_thi_dau', value, updated_at: new Date().toISOString() });
  return error ? fail('Chưa lưu được', 500) : json({ ok: true, moc: value });
}
