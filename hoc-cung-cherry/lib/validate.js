// Kiểm tra dữ liệu tiến độ học sinh gửi lên: không cho tự cộng XP vô lý,
// tự thêm đồ không trả tiền, hay tự nâng điểm thi đấu.
import { ITEMS, ITEM } from './items.js';

const MAX_BYTES = 450000;
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
  // Thi đấu: mỗi trận thay đổi tối đa +30 / −20 (sang mùa mới thì từ một nửa điểm cũ)
  const base = n.season && o.season && n.season !== o.season ? Math.floor(oLp / 2) : oLp;
  n.lp = Math.max(0, Math.min(Math.floor(num(n.lp)), base + 30 * dm), base - 20 * dm);

  // Vật phẩm: giữ đồ cũ; đồ mới phải trả đủ XP, đồ đặc biệt phải đạt điều kiện
  const own = { ...(o.own || {}) };
  const fresh = Object.keys(n.own || {}).filter(id => ITEM[id] && !own[id]);
  for (const id of fresh.filter(id => ITEM[id].special)) { const it = ITEM[id]; try { if (it.cond({ ...n, st: n.st || {}, stats: n.stats || {} })) own[id] = n.own[id]; } catch {} }
  const buy = fresh.filter(id => !ITEM[id].special).sort((a, b) => ITEM[a].price - ITEM[b].price);
  let spent = priceOfOwn(own);
  for (const id of buy) { if (spent + ITEM[id].price <= n.xp) { own[id] = n.own[id] || new Date(now).toISOString(); spent += ITEM[id].price; } }
  for (const id of Object.keys(own)) if (!ITEM[id]) delete own[id];
  n.own = own; n.spent = spent;
  const eq = {};
  for (const [slot, id] of Object.entries(n.eq || {})) if (id && own[id] && ITEM[id].slot === slot) eq[slot] = id;
  n.eq = eq;

  if (typeof n.nick === 'string') n.nick = n.nick.slice(0, 20); else n.nick = '';
  n.avatar = Math.max(0, Math.min(11, Math.floor(num(n.avatar))));
  n._saved = new Date(now).toISOString();
  return n;
}

// Phần hồ sơ ai cũng xem được (bảng xếp hạng, trang cá nhân)
export function publicOf(id, d, mau) {
  d = d || {};
  return {
    id, mau: !!mau, name: d.name, khoi: d.khoi, nick: d.nick || '', avatar: d.avatar || 0, eq: d.eq || {},
    xp: d.xp || 0, lp: d.lp || 0, matches: d.matches || 0, season: d.season || '', seasons: d.seasons || [],
    wk: d.wk || {}, st: d.st || {}, stats: d.stats || {}, ach: d.ach || {}, own: Object.fromEntries(Object.keys(d.own || {}).map(k => [k, 1])),
  };
}
export const itemCount = () => ITEMS.length;
