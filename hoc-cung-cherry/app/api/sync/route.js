import { admin } from '@/lib/supabase/admin';
import { getAccount, json, fail } from '@/lib/session';
import { loadTopics } from '@/lib/topics';
import { publicOf } from '@/lib/validate';

export async function GET() {
  const a = await getAccount();
  if (!a) return fail('Chưa đăng nhập', 401);
  const T = a.role === 'teacher', db = admin();
  const [{ topics, figs }, asg, pl, accs] = await Promise.all([
    loadTopics(T),
    db.from('ltt_assignments').select('id,class,levels,due_at,note,created_at,topic:ltt_topics(slug)'),
    db.from('ltt_players').select('account_id,data,mau'),
    db.from('ltt_accounts').select(T ? 'id,name,khoi,mon,reset_req,is_default,active' : 'id,active').eq('role', 'student'),
  ]);
  // Tài khoản đã xoá: không hiện trên bảng xếp hạng, danh sách bạn bè
  const off = new Set((accs.data || []).filter(x => !x.active).map(x => x.id));
  const assignments = (asg.data || []).filter(x => x.topic).map(x => ({ id: x.id, khoi: x.class, topicId: x.topic.slug, levels: x.levels, due: x.due_at, note: x.note || '', created: x.created_at }));
  const players = (pl.data || []).filter(r => !off.has(r.account_id)).map(r => (T ? { ...r.data, id: r.account_id, mau: r.mau } : publicOf(r.account_id, r.data, r.mau)));
  const pub = x => ({ id: x.id, name: x.name, khoi: x.khoi, mon: x.mon, reset: x.reset_req, isDefault: x.is_default });
  const accounts = T ? (accs.data || []).filter(x => x.active).map(pub) : undefined;
  const removed = T ? (accs.data || []).filter(x => !x.active).map(pub) : undefined;
  return json({ topics, figs, assignments, players, accounts, removed });
}
