// Cơ sở dữ liệu giả trong bộ nhớ, mô phỏng phần supabase-js mà app dùng (chỉ để kiểm thử).
const crypto = require("node:crypto");
function makeFake(seed = {}) {
  const T = { ltt_accounts: [], ltt_players: [], ltt_topics: [], ltt_assignments: [], ltt_figures: [], ...seed };
  const pk = { ltt_players: 'account_id', ltt_figures: 'hash', ltt_settings: 'key', ltt_push_subs: 'endpoint' };
  class Q {
    constructor(t) { this.t = t; this.f = []; this.op = 'select'; this.one = false; }
    select(cols, opt = {}) { this.returnRows = this.op !== 'select'; if (this.op === 'select') { this.cols = cols; this.cnt = opt.count; this.head = opt.head; } return this; }
    order(c, o = {}) { this.ord = [c, o.ascending !== false]; return this; }
    limit(n) { this.lim = n; return this; }
    eq(c, v) { this.f.push(r => r[c] === v); return this; }
    like(c, p) { const re = new RegExp('^' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$'); this.f.push(r => re.test(r[c] || '')); return this; }
    in(c, a) { this.f.push(r => a.includes(r[c])); return this; }
    maybeSingle() { this.one = true; return this; }
    insert(x) { this.op = 'insert'; this.rows = [].concat(x); return this; }
    update(x) { this.op = 'update'; this.patch = x; return this; }
    upsert(x) { this.op = 'upsert'; this.rows = [].concat(x); return this; }
    delete() { this.op = 'delete'; return this; }
    run() {
      const tab = T[this.t] || (T[this.t] = []);
      const match = r => this.f.every(f => f(r));
      if (this.op === 'insert') { const key = pk[this.t]; if (key && this.rows.some(r => tab.some(x => x[key] === r[key]))) return { data: null, error: { code: '23505' } }; for (const r of this.rows) tab.push({ id: crypto.randomUUID(), created_at: new Date().toISOString(), fails: 0, active: true, mon: ['toan'], reset_req: false, is_default: true, ...r }); return { data: null, error: null }; }
      if (this.op === 'upsert') { const k = pk[this.t] || 'id'; for (const r of this.rows) { const i = tab.findIndex(x => x[k] === r[k]); if (i >= 0) tab[i] = { ...tab[i], ...r }; else tab.push({ mau: false, ...r }); } return { data: null, error: null }; }
      if (this.op === 'update') { const rows = tab.filter(match); rows.forEach(r => Object.assign(r, this.patch)); return { data: this.returnRows ? rows : null, error: null }; }
      if (this.op === 'delete') { T[this.t] = tab.filter(r => !match(r)); return { data: null, error: null }; }
      let rows = tab.filter(match).map(r => ({ ...r }));
      if (this.cols && this.cols.includes('topic:ltt_topics(slug)')) rows = rows.map(r => ({ ...r, topic: (() => { const t = T.ltt_topics.find(x => x.id === r.topic_id); return t ? { slug: t.slug } : null; })() }));
      if (this.ord) { const [c, asc] = this.ord; rows.sort((a, b) => String(a[c] ?? '').localeCompare(String(b[c] ?? '')) * (asc ? 1 : -1)); }
      const count = rows.length;
      if (this.lim != null) rows = rows.slice(0, this.lim);
      if (this.head) return { data: null, count, error: null };
      return { data: this.one ? rows[0] || null : rows, count: this.cnt ? count : null, error: null };
    }
    then(res, rej) { try { res(this.run()); } catch (e) { rej(e); } }
  }
  return { T, from: t => new Q(t) };
}
module.exports = { makeFake };
