import { admin } from '@/lib/supabase/admin';
import { getAccount, json, fail } from '@/lib/session';
import { loadTopics, SPECIAL_TOPIC } from '@/lib/topics';
import { publicOf } from '@/lib/validate';

// Chỉ lấy các trường publicOf dùng cho danh sách bạn bè và bảng xếp hạng.
const playerFields = ['name','khoi','nick','avatar','eq','xp','lp','tier','tdh','matches','season','seasons','wk','st','stats','ach','own','follow','best','hist'];
const publicPlayerColumns = ['account_id','mau', ...playerFields.map(k => k + ':data->' + k)].join(',');

export async function GET(request) {
  const a = await getAccount();
  if (!a) return fail('Chưa đăng nhập', 401);
  const T = a.role === 'teacher', db = admin();
  const specialAccess = T || (a.mon || []).includes(SPECIAL_TOPIC);
  const params = new URL(request.url).searchParams;
  // ?players=0: máy đã có danh sách người chơi mới tải gần đây, không gửi lại (giảm lưu lượng Supabase).
  const withPlayers = params.get('players') !== '0';
  const none = Promise.resolve({ data: null });
  const [catalog, asg, pl, accs, rep, st] = await Promise.all([
    loadTopics(T, params.get('topics'), specialAccess, T ? '' : a.khoi),
    db.from('ltt_assignments').select('id,class,levels,due_at,note,created_at,topic:ltt_topics(slug)'),
    withPlayers ? db.from('ltt_players').select(T ? 'account_id,data,mau' : publicPlayerColumns) : none,
    withPlayers ? db.from('ltt_accounts').select(T ? 'id,name,khoi,mon,reset_req,is_default,active' : 'id,active').eq('role', 'student') : none,
    T && withPlayers ? db.from('ltt_reports').select('id,account_id,topic_slug,qkey,kind,note,snap,status,created_at,resolved_at') : Promise.resolve({ data: null }),
    db.from('ltt_settings').select('key,value').eq('key', 'moc_thi_dau')
  ]);
  // Tài khoản đã xoá: không hiện trên bảng xếp hạng, danh sách bạn bè
  const off = new Set((accs.data || []).filter(x => !x.active).map(x => x.id));
  // Học sinh chỉ nhận bài giao của khối mình
  const assignments = (asg.data || []).filter(x => x.topic && (T || !a.khoi || String(x.class) === String(a.khoi))).map(x => ({ id: x.id, khoi: x.class, topicId: x.topic.slug, levels: x.levels, due: x.due_at, note: x.note || '', created: x.created_at }));
  const players = !withPlayers ? undefined : (pl.data || []).filter(r => !off.has(r.account_id)).map(r => (T ? { ...r.data, id: r.account_id, mau: r.mau } : publicOf(r.account_id, r.data || r, r.mau)));
  const pub = x => ({ id: x.id, name: x.name, khoi: x.khoi, mon: x.mon, reset: x.reset_req, isDefault: x.is_default });
  const accounts = T && withPlayers ? (accs.data || []).filter(x => x.active).map(pub) : undefined;
  const removed = T && withPlayers ? (accs.data || []).filter(x => !x.active).map(pub) : undefined;
  // Báo lỗi câu hỏi (giáo viên): mọi báo lỗi chưa xử lý + 60 báo lỗi đã xử lý gần nhất. Bảng chưa tạo thì bỏ qua.
  let reports;
  if (T && withPlayers) {
    const who = new Map((accs.data || []).map(x => [x.id, x]));
    const all = (rep?.data || []).map(r => ({ id: r.id, tid: r.topic_slug, qkey: r.qkey, kind: r.kind, note: r.note || '', snap: r.snap || {}, done: r.status === 'xong', at: r.created_at, doneAt: r.resolved_at, name: who.get(r.account_id)?.name || '(tài khoản đã xoá)', khoi: who.get(r.account_id)?.khoi || '' }));
    all.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    reports = [...all.filter(r => !r.done), ...all.filter(r => r.done).sort((a, b) => String(b.doneAt).localeCompare(String(a.doneAt))).slice(0, 60)];
  }
  // Mốc Thi đấu theo khối (bảng chưa có thì coi như chưa đặt mốc)
  const moc = (st?.data || []).find(r => r.key === 'moc_thi_dau')?.value || {};
  return json({ ...catalog, specialAccess, assignments, players, accounts, removed, reports, moc });
}
