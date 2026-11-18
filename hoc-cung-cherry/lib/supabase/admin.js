import 'server-only';
import { createClient } from '@supabase/supabase-js';
// Khoá service role chỉ dùng trên máy chủ. Mọi bảng bật RLS không có policy,
// nên trình duyệt không đọc được trực tiếp dữ liệu.
let client;
export function admin() {
  if (client) return client;
  if (process.env.FAKE_DB === '1') {
    // Chỉ dùng khi kiểm thử trên máy: cơ sở dữ liệu giả trong bộ nhớ
    const { makeFake } = require('../../tests/fakedb.cjs');
    const seed = JSON.parse(require('node:fs').readFileSync(process.cwd() + '/tests/seed.json', 'utf8'));
    return (client = globalThis.__FAKE ||= makeFake(seed));
  }
  return (client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }));
}
