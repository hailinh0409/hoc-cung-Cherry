// Tạo (hoặc đổi mật khẩu) tài khoản giáo viên:
//   node --env-file=.env.local scripts/create-teacher.mjs thaylinh "MatKhauManh" "Phan Hải Linh"
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const [username, password, name = 'Giáo viên'] = process.argv.slice(2);
if (!username || !password || password.length < 8) {
  console.log('Cách dùng: node --env-file=.env.local scripts/create-teacher.mjs <tên đăng nhập> <mật khẩu ≥ 8 ký tự> "Họ tên"');
  process.exit(1);
}
const salt = crypto.randomBytes(16).toString('hex');
const hash = `scrypt$${salt}$${crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 }).toString('hex')}`;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const u = username.trim().toLowerCase();
const { data: old } = await db.from('ltt_accounts').select('id').eq('username', u).maybeSingle();
const row = { role: 'teacher', username: u, name, name_norm: name.toLowerCase(), name_plain: name.toLowerCase(), secret_hash: hash, is_default: false, mon: ['toan', 'anh'] };
const { error } = old ? await db.from('ltt_accounts').update(row).eq('id', old.id) : await db.from('ltt_accounts').insert(row);
if (error) { console.error('Lỗi:', error.message); process.exit(1); }
console.log(`${old ? 'Đã đổi mật khẩu' : 'Đã tạo'} tài khoản giáo viên "${u}".`);
