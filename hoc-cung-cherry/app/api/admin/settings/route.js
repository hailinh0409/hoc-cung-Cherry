import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';
import { CHAT_SETTING_KEY, chatGrades, inspectChatSource } from '@/lib/chat-source';
import { SPECIAL_TOPIC } from '@/lib/topics';

// Mốc Thi đấu: khối k đã học hết chương n (n = 0: bỏ mốc, mở mọi chương)
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  if (b.action === CHAT_SETTING_KEY) return setChatGrade(b);
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

async function setChatGrade({ khoi, enabled, confirmEarly }) {
  const grade = Number(khoi);
  if (!chatGrades([grade]).length || typeof enabled !== 'boolean') return fail('Khối hoặc trạng thái không hợp lệ');
  const db = admin();
  if (enabled && confirmEarly !== true) {
    const { data, error } = await db.from('ltt_topics').select('source,chuong')
      .eq('grade', String(grade)).eq('status', 'published');
    if (error) return fail('Chưa kiểm tra được các bài đã duyệt', 500);
    const topics = (data || []).filter(topic => topic.chuong !== SPECIAL_TOPIC);
    if (!topics.length || topics.some(topic => inspectChatSource(topic.source).errors.length)) {
      return fail('Khối này chưa đủ bản chat. Hãy xác nhận nếu muốn bật sớm.', 409);
    }
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: current, error } = await db.from('ltt_settings').select('value,updated_at')
      .eq('key', CHAT_SETTING_KEY).maybeSingle();
    if (error) break;
    const existing = chatGrades(current?.value);
    if (existing.includes(grade) === enabled) return json({ ok: true, chatGrades: existing });
    const value = chatGrades(enabled ? [...existing, grade] : existing.filter(x => x !== grade));
    const updated_at = new Date(Math.max(Date.now(), (Date.parse(current?.updated_at) || 0) + 1)).toISOString();
    if (!current) {
      const inserted = await db.from('ltt_settings').insert({ key: CHAT_SETTING_KEY, value, updated_at });
      if (!inserted.error) return json({ ok: true, chatGrades: value });
      if (inserted.error.code !== '23505') break;
      continue;
    }
    const changed = await db.from('ltt_settings').update({ value, updated_at })
      .eq('key', CHAT_SETTING_KEY).eq('updated_at', current.updated_at).select('key');
    if (changed.error) break;
    if (changed.data?.length) return json({ ok: true, chatGrades: value });
  }
  return fail('Chưa lưu được công tắc. Thầy thử lại nhé.', 503);
}
