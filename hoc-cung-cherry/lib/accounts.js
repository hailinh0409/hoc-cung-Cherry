import 'server-only';
import { admin } from './supabase/admin';
import { normName, plainName } from './names';
import { checkSecret } from './secret';

const COLS = 'id,role,name,khoi,mon,secret_hash,is_default,fails,locked_until,active';
// Tìm học sinh theo họ tên (có dấu, nếu không thấy thì so khớp không dấu), lọc theo khối nếu có
export async function findStudents(name, khoi) {
  const db = admin();
  let { data } = await db.from('ltt_accounts').select(COLS).eq('role', 'student').eq('active', true).eq('name_norm', normName(name));
  if (!data?.length) ({ data } = await db.from('ltt_accounts').select(COLS).eq('role', 'student').eq('active', true).eq('name_plain', plainName(name)));
  data = data || [];
  if (khoi) data = data.filter(a => a.khoi === String(khoi));
  return data;
}
// Kiểm tra mã bí mật, có khoá tạm thời khi sai nhiều lần
export async function verify(acc, secret) {
  const db = admin();
  if (acc.locked_until && Date.parse(acc.locked_until) > Date.now()) {
    const s = Math.ceil((Date.parse(acc.locked_until) - Date.now()) / 1000);
    return { ok: false, msg: `Sai quá nhiều lần. Thử lại sau ${s > 90 ? Math.ceil(s / 60) + ' phút' : s + ' giây'}.` };
  }
  if (checkSecret(secret, acc.secret_hash)) {
    if (acc.fails) await db.from('ltt_accounts').update({ fails: 0, locked_until: null }).eq('id', acc.id);
    return { ok: true };
  }
  const fails = (acc.fails || 0) + 1;
  const lock = fails >= 10 ? 15 * 60e3 : fails >= 5 ? 60e3 : 0;
  await db.from('ltt_accounts').update({ fails, locked_until: lock ? new Date(Date.now() + lock).toISOString() : null }).eq('id', acc.id);
  return { ok: false, msg: lock ? `Sai ${fails} lần. Tài khoản tạm khoá ${lock >= 60e4 ? '15 phút' : '1 phút'}.` : 'Sai mật khẩu. Nếu quên, bấm "Quên mật khẩu" để báo thầy.' };
}
export async function loadPlayer(id) {
  const { data } = await admin().from('ltt_players').select('data').eq('account_id', id).maybeSingle();
  return data?.data || null;
}
// Một học sinh duy nhất, hoặc danh sách khối để chọn khi trùng tên
export async function pickStudent(name, khoi) {
  const m = await findStudents(name, khoi);
  if (!m.length) return { err: 'Không tìm thấy họ tên này. Em gõ đúng họ tên đầy đủ có dấu nhé.' };
  if (m.length > 1) return { choose: [...new Set(m.map(a => a.khoi))].sort((x, y) => x - y) };
  return { acc: m[0] };
}
