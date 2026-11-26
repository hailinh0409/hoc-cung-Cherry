import { admin } from '@/lib/supabase/admin';
import { getAccount, json, fail } from '@/lib/session';
import { getVapid } from '@/lib/push-core.mjs';

// Thông báo bài tập: máy học sinh lấy khóa công khai, rồi gửi lên địa chỉ nhận thông báo của máy.
export async function GET() {
  const a = await getAccount();
  if (!a) return fail('Chưa đăng nhập', 401);
  try { return json({ publicKey: (await getVapid(admin())).publicKey }); }
  catch { return fail('Máy chủ chưa sẵn sàng gửi thông báo', 503); }
}
export async function POST(req) {
  const a = await getAccount();
  if (!a) return fail('Chưa đăng nhập', 401);
  const b = await req.json().catch(() => ({}));
  const s = b.sub || {};
  if (typeof s.endpoint !== 'string' || !/^https:\/\//.test(s.endpoint) || s.endpoint.length > 1000 || !s.keys?.p256dh || !s.keys?.auth) return fail('Thông tin máy không hợp lệ');
  const sub = { endpoint: s.endpoint, keys: { p256dh: String(s.keys.p256dh).slice(0, 200), auth: String(s.keys.auth).slice(0, 100) } };
  const { error } = await admin().from('ltt_push_subs').upsert({ endpoint: sub.endpoint, account_id: a.id, sub }, { onConflict: 'endpoint' });
  return error ? fail('Chưa bật được thông báo', 500) : json({ ok: true });
}
export async function DELETE(req) {
  const a = await getAccount();
  if (!a) return fail('Chưa đăng nhập', 401);
  const b = await req.json().catch(() => ({}));
  await admin().from('ltt_push_subs').delete().eq('endpoint', String(b.endpoint || '')).eq('account_id', a.id);
  return json({ ok: true });
}
