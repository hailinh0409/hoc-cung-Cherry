// Nhắc học sinh chưa làm bài thầy giao (gửi thông báo về máy). GitHub Actions chạy mỗi tối (.github/workflows/nhac-bai.yml).
// Chạy tay trên máy:  node --env-file=.env.local scripts/nhac-bai.mjs
import { createClient } from '@supabase/supabase-js';
import { nhacBai } from '../lib/push-core.mjs';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
try {
  const r = await nhacBai(db);
  console.log(`Đã nhắc ${r.hocSinh} học sinh (${r.sent} thông báo).`);
} catch (e) {
  // Bảng ltt_push_subs chưa tạo (chưa chạy sql/ltt_push_subs.sql): báo rõ, không coi là lỗi.
  if (/ltt_push_subs/.test(e?.message || '')) { console.log('Chưa có bảng ltt_push_subs, bỏ qua.'); process.exit(0); }
  console.error(e); process.exit(1);
}
