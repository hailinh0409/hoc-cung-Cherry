import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';
import { hashSecret } from '@/lib/secret';
import { normName, plainName, cleanName } from '@/lib/names';

const MON = ['toan', 'anh'];
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const db = admin();
  if (b.action === 'create') {
    const name = cleanName(b.name), khoi = String(b.khoi || '');
    const mon = (Array.isArray(b.mon) ? b.mon : ['toan']).filter(m => MON.includes(m));
    if (!name || !/^(6|7|8|9|1[0-2])$/.test(khoi) || !mon.length) return fail('Thiếu họ tên, khối hoặc môn');
    const { data: same } = await db.from('ltt_accounts').select('id').eq('role', 'student').eq('active', true).eq('name_norm', normName(name)).eq('khoi', khoi);
    if (same?.length) return fail('Đã có học sinh này', 409);
    const { error } = await db.from('ltt_accounts').insert({ role: 'student', name, name_norm: normName(name), name_plain: plainName(name), khoi, mon, secret_hash: hashSecret('0000'), is_default: true });
    return error ? fail('Chưa tạo được', 500) : json({ ok: true });
  }
  if (b.action === 'reset') {
    const { error } = await db.from('ltt_accounts').update({ secret_hash: hashSecret('0000'), is_default: true, reset_req: false, fails: 0, locked_until: null }).eq('id', b.id).eq('role', 'student');
    return error ? fail('Chưa lưu được', 500) : json({ ok: true });
  }
  if (b.action === 'mon') {
    const mon = (Array.isArray(b.mon) ? b.mon : []).filter(m => MON.includes(m));
    if (!mon.length) return fail('Mỗi tài khoản cần ít nhất một môn');
    const { error } = await db.from('ltt_accounts').update({ mon }).eq('id', b.id).eq('role', 'student');
    return error ? fail('Chưa lưu được', 500) : json({ ok: true });
  }
  if (b.action === 'remove') {
    const { error } = await db.from('ltt_accounts').update({ active: false }).eq('id', b.id).eq('role', 'student');
    return error ? fail('Chưa lưu được', 500) : json({ ok: true });
  }
  return fail('Thao tác không hợp lệ');
}
