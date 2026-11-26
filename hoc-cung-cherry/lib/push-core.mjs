// Thông báo bài tập về máy học sinh (Web Push). Dùng chung cho máy chủ (app/api) và script nhắc bài (scripts/nhac-bai.mjs).
// Không import 'server-only' ở đây để script chạy được bằng node; chỉ máy chủ và GitHub Actions dùng file này.
import webpush from 'web-push';

const MAIL = 'mailto:hailinh0409@users.noreply.github.com';
export const NHAC_CACH_GIO = 20;      // một máy nhận tối đa 1 lời nhắc trong 20 giờ (lịch chạy mỗi tối)
export const NHAC_SAU_HAN_NGAY = 2;   // vẫn nhắc thêm 2 ngày sau hạn nộp
export const NHAC_KHONG_HAN_NGAY = 7; // bài không có hạn: nhắc trong 7 ngày kể từ lúc giao
export const NHAC_CHO_GIO = 3;        // bài vừa giao chưa tới 3 giờ thì chưa nhắc (đã có thông báo "bài mới")

// Khóa VAPID: ưu tiên biến môi trường; nếu không có thì tự tạo một lần và lưu trong ltt_settings (key 'vapid').
let cached = null;
export async function getVapid(db) {
  if (cached) return cached;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
    return (cached = { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY });
  const read = async () => (await db.from('ltt_settings').select('value').eq('key', 'vapid').maybeSingle()).data?.value;
  let v = await read();
  if (!v?.publicKey) {
    // insert (không upsert): nếu hai máy chủ cùng tạo, bản ghi đầu tiên thắng, bản sau đọc lại khóa đó.
    const k = webpush.generateVAPIDKeys();
    await db.from('ltt_settings').insert({ key: 'vapid', value: k, updated_at: new Date().toISOString() });
    v = (await read()) || k;
  }
  return (cached = { publicKey: v.publicKey, privateKey: v.privateKey });
}

// Gửi một thông báo tới các máy (dòng của ltt_push_subs). Máy đã gỡ app / tắt thông báo (404, 410) thì xóa khỏi bảng.
export async function sendTo(db, rows, payload) {
  if (!rows?.length) return { sent: 0, gone: 0 };
  const v = await getVapid(db);
  const body = JSON.stringify(payload);
  let sent = 0, gone = [];
  await Promise.all(rows.map(async r => {
    try {
      await webpush.sendNotification(r.sub, body, { vapidDetails: { subject: MAIL, publicKey: v.publicKey, privateKey: v.privateKey }, TTL: 86400, urgency: 'normal', timeout: 8000 });
      sent++;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) gone.push(r.endpoint);
    }
  }));
  if (gone.length) await db.from('ltt_push_subs').delete().in('endpoint', gone);
  return { sent, gone: gone.length, ok: rows.filter(r => !gone.includes(r.endpoint)).map(r => r.endpoint) };
}

// Giờ Việt Nam (UTC+7, không đổi giờ mùa hè), tự định dạng để mọi máy ra cùng một kiểu dd/mm.
const vn = iso => new Date(Date.parse(iso) + 7 * 36e5), p2 = n => String(n).padStart(2, '0');
export const ngayVN = iso => { const d = vn(iso); return `${p2(d.getUTCDate())}/${p2(d.getUTCMonth() + 1)}`; };
export const gioVN = iso => { const d = vn(iso); return `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`; };
const hanText = due => due ? `hạn ${gioVN(due)} ngày ${ngayVN(due)}` : 'không có hạn';

// Học sinh đã làm xong bài giao chưa: giống asgStatus trong client/app.js (mỗi bài một chặng, khóa '<slug>|0').
export function daXong(player, slug) {
  const k = slug + '|0';
  return Boolean(player?.pt?.[k]) || Number(player?.best?.[k]) > 0;
}

// Bài giao còn trong thời gian nhắc
export function conNhac(a, now = Date.now()) {
  const created = Date.parse(a.created_at || 0);
  if (now - created < NHAC_CHO_GIO * 36e5) return false;
  if (a.due_at) return now <= Date.parse(a.due_at) + NHAC_SAU_HAN_NGAY * 864e5;
  return now <= created + NHAC_KHONG_HAN_NGAY * 864e5;
}

// Nội dung thông báo
export function tinBaiMoi(khoi, title, due) {
  return { title: 'Thầy giao bài mới', body: `Khối ${khoi}: ${title} (${hanText(due)}). Em mở app để làm nhé!`, tag: 'bai-moi', url: '/' };
}
export function tinNhac(list, now = Date.now()) {
  const quaHan = list.filter(a => a.due_at && Date.parse(a.due_at) < now).length;
  const title = list.length === 1 ? 'Em còn 1 bài thầy giao chưa làm' : `Em còn ${list.length} bài thầy giao chưa làm`;
  const dong = list.slice(0, 3).map(a => `• ${a.title} (${a.due_at && Date.parse(a.due_at) < now ? 'đã quá hạn' : hanText(a.due_at)})`);
  if (list.length > 3) dong.push(`… và ${list.length - 3} bài nữa`);
  return { title, body: (quaHan ? 'Có bài đã quá hạn. ' : '') + dong.join('\n'), tag: 'nhac-bai', url: '/' };
}

// Thông báo ngay khi thầy giao bài: gửi tới mọi máy của học sinh khối đó (đang hoạt động, có học Toán).
export async function baoBaiMoi(db, { khoi, title, due }) {
  const { data: accs } = await db.from('ltt_accounts').select('id,khoi,mon,active,role').eq('role', 'student').eq('khoi', String(khoi));
  const ids = (accs || []).filter(a => a.active && (!a.mon || a.mon.includes('toan'))).map(a => a.id);
  if (!ids.length) return { sent: 0 };
  const { data: subs, error } = await db.from('ltt_push_subs').select('endpoint,account_id,sub').in('account_id', ids);
  if (error) return { sent: 0 };
  return sendTo(db, subs || [], tinBaiMoi(khoi, title, due));
}

// Nhắc học sinh chưa làm xong (chạy mỗi tối bằng GitHub Actions: scripts/nhac-bai.mjs).
export async function nhacBai(db, now = Date.now()) {
  const [{ data: asg }, { data: subs, error: e1 }] = await Promise.all([
    db.from('ltt_assignments').select('id,class,due_at,created_at,topic:ltt_topics(slug,title,status)'),
    db.from('ltt_push_subs').select('endpoint,account_id,sub,last_nhac'),
  ]);
  if (e1) throw e1;
  const live = (asg || []).filter(a => a.topic && a.topic.status === 'published' && conNhac(a, now))
    .map(a => ({ khoi: String(a.class), slug: a.topic.slug, title: a.topic.title, due_at: a.due_at }));
  if (!live.length || !subs?.length) return { hocSinh: 0, sent: 0 };
  const byAcc = new Map();
  for (const s of subs) (byAcc.get(s.account_id) || byAcc.set(s.account_id, []).get(s.account_id)).push(s);
  const ids = [...byAcc.keys()];
  const [{ data: accs }, { data: pls }] = await Promise.all([
    db.from('ltt_accounts').select('id,khoi,mon,active,role').in('id', ids),
    db.from('ltt_players').select('account_id,pt:data->pt,best:data->best').in('account_id', ids),
  ]);
  const plOf = new Map((pls || []).map(p => [p.account_id, p]));
  let hocSinh = 0, sent = 0;
  for (const acc of accs || []) {
    if (!acc.active || acc.role !== 'student' || (acc.mon && !acc.mon.includes('toan'))) continue;
    const mine = byAcc.get(acc.id) || [];
    const last = Math.max(0, ...mine.map(s => Date.parse(s.last_nhac || 0) || 0));
    if (now - last < NHAC_CACH_GIO * 36e5) continue;
    const con = live.filter(a => a.khoi === String(acc.khoi) && !daXong(plOf.get(acc.id), a.slug))
      .sort((a, b) => String(a.due_at || '9').localeCompare(String(b.due_at || '9')));
    if (!con.length) continue;
    const r = await sendTo(db, mine, tinNhac(con, now));
    if (r.ok?.length) await db.from('ltt_push_subs').update({ last_nhac: new Date(now).toISOString() }).in('endpoint', r.ok);
    hocSinh++; sent += r.sent;
  }
  return { hocSinh, sent };
}
