// Kiểm tra dữ liệu tiến độ học sinh gửi lên: không cho tự cộng XP vô lý,
// tự thêm đồ không trả tiền, hay tự nâng điểm thi đấu.
import { ITEMS, ITEM } from './items.js';
import { vnDay } from './srs.js';
import { seasonName, RANK_UP, RANK_DOWN, TOP, TIER_LP, capOf, tierOfP, seasonStart, PD_N } from './rank.js';

const MAX_BYTES = 450000;
// Mỗi gợi ý của câu tự luận (đề ôn tập TL) mở lần đầu tốn bấy nhiêu XP trong Ví XP. Sửa cùng HINT_XP ở client/app.js.
export const HINT_XP = 10;
// Gợi ý đã mua: { mã câu: số gợi ý đã mở }. Chỉ tăng, không giảm (gửi thiếu không làm mất gợi ý đã trả tiền).
export function mergeTlh(oldT, newT) {
  const out = {};
  for (const src of [oldT, newT]) for (const [k, v] of Object.entries(src && typeof src === 'object' ? src : {})) {
    if (typeof k !== 'string' || k.length > 40) continue;
    const c = Math.max(0, Math.min(20, Math.floor(num(v))));
    if (c > (out[k] || 0)) out[k] = c;
  }
  return out;
}
export const hintSpent = tlh => Object.values(tlh || {}).reduce((s, c) => s + c, 0) * HINT_XP;
const num = x => (Number.isFinite(+x) ? +x : 0);

export function priceOfOwn(own) {
  let s = 0;
  for (const id of Object.keys(own || {})) { const it = ITEM[id]; if (it && !it.special) s += it.price; }
  return s;
}

export function sanitize(old, doc, acc, now = Date.now()) {
  const o = old && typeof old === 'object' ? old : {};
  if (!doc || typeof doc !== 'object') throw new Error('Dữ liệu không hợp lệ');
  if (JSON.stringify(doc).length > MAX_BYTES) throw new Error('Dữ liệu quá lớn');
  const n = { ...o, ...doc }; // gộp: gói tin thiếu trường không làm mất dữ liệu cũ
  n.name = acc.name; n.khoi = acc.khoi;
  delete n.mau;

  // XP và số trận: "xô token" nạp lại theo thời gian, gửi nhiều lần cũng không vượt được
  const last = Date.parse(o._saved || 0) || 0;
  const mins = last ? Math.max(0, (now - last) / 60000) : 0;
  const tok = Math.floor(Math.min(800, (last ? num(o._tok ?? 800) : 1500) + 60 * mins));
  const oxp = num(o.xp), gain = Math.max(0, Math.min(Math.floor(num(n.xp)) - oxp, tok));
  n.xp = oxp + gain; n._tok = Math.floor(tok - gain);
  const om = num(o.matches), oLp = num(o.lp);
  const mt = Math.min(6, (last ? num(o._mt ?? 6) : 6) + mins / 1.5);
  const dm = Math.max(0, Math.min(Math.floor(num(n.matches)) - om, Math.floor(mt)));
  n.matches = om + dm; n._mt = mt - dm;
  // Thi đấu: mùa 30 ngày do máy chủ tính (sang mùa mới tụt 2 bậc, thanh về đầu bậc); mỗi trận tối đa +30 / −20.
  // Bậc: mỗi trận (bài kiểm tra thăng hạng cũng tính là một trận) lên hoặc xuống tối đa 1 bậc;
  // dưới Thách Đấu, điểm không vượt mốc bậc trên (phải thi mới lên).
  const day = vnDay(now), ses = seasonName(day);
  const t0 = tierOfP(o), S = o.season === ses ? { tier: t0, lp: oLp } : (o.season ? seasonStart(t0) : { tier: t0, lp: oLp });
  const tier = Math.max(0, Math.min(TOP, S.tier + dm, Math.max(S.tier - dm, Math.floor(num(n.tier ?? tierOfP(n))))));
  n.tier = tier;
  n.lp = Math.max(0, Math.min(Math.floor(num(n.lp)), S.lp + RANK_UP * dm, capOf(tier)), S.lp - RANK_DOWN * dm, tier < S.tier ? 0 : Math.min(S.lp, TIER_LP[tier]));
  n.season = ses;
  delete n._lpd;
  n.shield = Math.max(0, Math.min(5, Math.floor(num(n.shield))));
  n.tdh = (Array.isArray(n.tdh) ? n.tdh : []).slice(-PD_N).map(x => Math.max(0, Math.min(1, num(x))));

  // Vật phẩm: giữ đồ cũ; đồ mới phải trả đủ XP, đồ đặc biệt phải đạt điều kiện
  const own = { ...(o.own || {}) };
  const fresh = Object.keys(n.own || {}).filter(id => ITEM[id] && !own[id]);
  for (const id of fresh.filter(id => ITEM[id].special)) { const it = ITEM[id]; try { if (it.cond({ ...n, st: n.st || {}, stats: n.stats || {} })) own[id] = n.own[id]; } catch {} }
  const buy = fresh.filter(id => !ITEM[id].special).sort((a, b) => ITEM[a].price - ITEM[b].price);
  n.tlh = mergeTlh(o.tlh, n.tlh);
  let spent = priceOfOwn(own) + hintSpent(n.tlh);
  for (const id of buy) { if (spent + ITEM[id].price <= n.xp) { own[id] = n.own[id] || new Date(now).toISOString(); spent += ITEM[id].price; } }
  for (const id of Object.keys(own)) if (!ITEM[id]) delete own[id];
  n.own = own; n.spent = spent;
  const eq = {};
  for (const [slot, id] of Object.entries(n.eq || {})) if (id && own[id] && ITEM[id].slot === slot) eq[slot] = id;
  n.eq = eq;

  if (typeof n.nick === 'string') n.nick = n.nick.slice(0, 20); else n.nick = '';
  n.avatar = Math.max(0, Math.min(11, Math.floor(num(n.avatar))));
  // theo dõi: tối đa 300 người, không tự theo dõi mình
  const fol = {};
  for (const [k, v] of Object.entries(n.follow || {}).slice(0, 300)) if (typeof k === 'string' && k !== acc.id && k.length < 64) fol[k] = String(v).slice(0, 30);
  n.follow = fol;
  n._saved = new Date(now).toISOString();
  return n;
}

// Phần hồ sơ ai cũng xem được (bảng xếp hạng, trang cá nhân)
export function publicOf(id, d, mau) {
  d = d || {};
  return {
    id, mau: !!mau, name: d.name, khoi: d.khoi, nick: d.nick || '', avatar: d.avatar || 0, eq: d.eq || {},
    xp: d.xp || 0, lp: d.lp || 0, tier: tierOfP(d), tdh: Array.isArray(d.tdh) ? d.tdh.slice(-PD_N) : [], matches: d.matches || 0, season: d.season || '', seasons: d.seasons || [],
    wk: d.wk || {}, st: d.st || {}, stats: d.stats || {}, ach: d.ach || {}, own: d.own || {}, follow: d.follow || {},
    best: Object.fromEntries(Object.entries(d.best || {}).map(([k, b]) => [k, { st: b && b.st || 0, t: b && b.t || null }])), hist: (d.hist || []).slice(-5),
  };
}
export const itemCount = () => ITEMS.length;
