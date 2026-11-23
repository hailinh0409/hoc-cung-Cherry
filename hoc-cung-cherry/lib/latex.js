// Đọc ngân hàng câu hỏi LaTeX của game.
// Cú pháp:
//   \chude{Tên chủ đề}
//   \man{1}{Nhận biết}
//   \begin{ex}    đề \choice{..}{\True ..}{..}{..}        \loigiai{..} \end{ex}     trắc nghiệm
//   \begin{extf}  đề \choiceTF{\True ..}{..}{\True ..}{..} \loigiai{..} \end{extf}   đúng/sai từng ý
//   \begin{exfb}  đề \shortans{đáp số;đáp số khác}          \loigiai{..} \end{exfb}   điền đáp số
//   \begin{exmatch} đề \pair{trái}{phải} \pair{..}{..}       \loigiai{..} \end{exmatch} nối ý
//   \begin{extl}  đề \goiy{gợi ý 1} \goiy{gợi ý 2}          \end{extl}     tự luận (chỉ dùng trong đề ôn tập,
//                 học sinh làm vào vở; app chỉ hiện đề và gợi ý, mỗi gợi ý mở lần đầu trừ XP)
// Báo lỗi theo đáp án sai (hiện ngay khi học sinh chọn sai):
//   ex:   \sai{vì sao sai} đặt trong phương án sai, ví dụ \choice{$5$ \sai{Quên đổi dấu}}{\True $-5$}..
//   extf: \sai{giải thích} đặt trong ý, hiện khi học sinh đánh giá sai ý đó
//   exfb: \saithuong{đáp số sai hay gặp}{vì sao sai}, viết nhiều lần được
// Sắp xếp lời giải:
//   \begin{exsx} đề \buoc{bước 1} \buoc{bước 2} … \nhieu{khối sai}{vì sao sai} \loigiai{..} \end{exsx}
//   các bước liền nhau cùng nhãn \buoc[1]{..} được đổi chỗ cho nhau
// Sơ đồ phân tích đi lên:
//   \begin{exsd} đề \nut{số}[ô cha]{mệnh đề}{căn cứ} … (ô kết luận không có [ô cha])
//     \an{2,3} ẩn mệnh đề, \anly{3} ẩn căn cứ, \nhieu{mệnh đề sai}{vì sao}, \nhieuly{căn cứ sai}{vì sao} \end{exsd}

import { instantiate } from './params.js';

export const QTYPES = 'ex|extf|exfb|exmatch|extl|exsx|exsd';
const ENV = new RegExp('\\\\begin\\{(' + QTYPES + ')\\}([\\s\\S]*?)\\\\end\\{\\1\\}', 'g');

export function group(s, i) {
  while (i < s.length && /\s/.test(s[i])) i++;
  if (s[i] !== '{') return null;
  let d = 0, j = i;
  for (; j < s.length; j++) {
    if (s[j] === '\\') { j++; continue; }
    if (s[j] === '{') d++;
    else if (s[j] === '}') { d--; if (!d) break; }
  }
  if (d) return null;
  return [s.slice(i + 1, j), j + 1];
}

function takeCmd(body, cmd) {
  const k = body.indexOf('\\' + cmd);
  if (k < 0) return [body, null];
  const g = group(body, k + cmd.length + 1);
  if (!g) return [body, null];
  return [body.slice(0, k) + body.slice(g[1]), g[0].trim()];
}

function readGroups(b, i) {
  const out = []; let g;
  while ((g = group(b, i))) { out.push(g[0]); i = g[1]; }
  return out;
}

function takeAll(body, cmd) {
  const out = []; let r;
  for (;;) { [body, r] = takeCmd(body, cmd); if (r === null) break; out.push(r); }
  return [body, out];
}
// Mã nhận diện câu hỏi (ổn định khi soạn lại không đổi nội dung câu)
export function qkeyOf(q) {
  // Lời báo lỗi (\sai, \saithuong) không tính vào mã: thêm/sửa lời báo lỗi không làm mất lịch ôn của câu
  const strip = a => a && a.map(({ why, ...o }) => o);
  const base = [q.type, q.stem, strip(q.opts), strip(q.items), q.ans, q.pairs, q.params];
  // Dạng mới (sắp xếp, sơ đồ): thêm trường riêng; dạng cũ giữ nguyên chuỗi băm để không đổi mã câu
  if (q.steps || q.nodes) base.push(q.steps, strip(q.bad), q.nodes, q.hid, q.hidc, strip(q.badc));
  const str = JSON.stringify(base);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

// Lấy mọi lệnh \ten[tùy chọn]{..}{..} (đúng tên, không nhầm \an với \angle hay \anly).
// Trả về [phần còn lại, [{o, a:[..]}]]. Thiếu đối số bắt buộc thì ghi vào bad.
function takeArgs(body, name, n, min, withOpt, bad) {
  const out = [], re = new RegExp('\\\\' + name + '(?![a-zA-Z])');
  for (let m; (m = re.exec(body));) {
    let i = m.index + m[0].length, o = null;
    if (withOpt) { let k = i; while (/\s/.test(body[k] || '')) k++; if (body[k] === '[') { const e = body.indexOf(']', k); if (e > 0) { o = body.slice(k + 1, e).trim(); i = e + 1; } } }
    const a = [];
    for (let x = 0; x < n; x++) { const g = group(body, i); if (!g) break; a.push(g[0].trim()); i = g[1]; }
    if (a.length < min) bad.push('\\' + name + ' thiếu phần trong ngoặc {…}');
    else out.push({ o, a });
    body = body.slice(0, m.index) + body.slice(a.length < min ? m.index + m[0].length : i);
  }
  return [body, out];
}
const ids = xs => xs.flatMap(x => x.a[0].split(',').map(v => v.trim()).filter(Boolean));
const trap = x => (x.a[1] ? { t: x.a[0], why: x.a[1] } : { t: x.a[0] });

// \nut{số}[ô cha]{mệnh đề}{căn cứ}: phần [ô cha] nằm giữa {số} và {mệnh đề}
function takeNut(body, bad) {
  const out = [], re = /\\nut(?![a-zA-Z])/;
  for (let m; (m = re.exec(body));) {
    const g1 = group(body, m.index + 4);
    if (!g1) { bad.push('\\nut thiếu số ô'); body = body.slice(0, m.index) + body.slice(m.index + 4); continue; }
    let i = g1[1], p = '', k = i;
    while (/\s/.test(body[k] || '')) k++;
    if (body[k] === '[') { const e = body.indexOf(']', k); if (e > 0) { p = body.slice(k + 1, e).trim(); i = e + 1; } }
    const g2 = group(body, i), g3 = g2 && group(body, g2[1]);
    if (!g2) { bad.push(`\\nut{${g1[0].trim()}} thiếu mệnh đề`); body = body.slice(0, m.index) + body.slice(i); continue; }
    out.push({ id: g1[0].trim(), p, t: g2[0].trim(), c: g3 ? g3[0].trim() : '' });
    body = body.slice(0, m.index) + body.slice(g3 ? g3[1] : g2[1]);
  }
  return [body, out];
}
// Kiểm tra sơ đồ: đúng một ô kết luận, ô cha có thật, không vòng lặp, có ô ẩn, không ẩn ô kết luận
function checkTree(q) {
  const by = {};
  for (const n of q.nodes) { if (by[n.id]) return `Có hai ô cùng số ${n.id}`; by[n.id] = n; }
  const roots = q.nodes.filter(n => !n.p);
  if (q.nodes.length < 2) return 'Sơ đồ cần ít nhất 2 \\nut{…}';
  if (roots.length !== 1) return roots.length ? 'Chỉ được một ô kết luận (ô không có [ô cha])' : 'Chưa có ô kết luận (ô không có [ô cha])';
  for (const n of q.nodes) {
    if (n.p && !by[n.p]) return `Ô ${n.id} ghi ô cha [${n.p}] nhưng chưa có \\nut{${n.p}}`;
    let x = n, d = 0; while (x.p && d++ <= q.nodes.length) x = by[x.p];
    if (d > q.nodes.length) return `Ô ${n.id} nằm trong một vòng lặp ô cha`;
  }
  for (const id of [...q.hid, ...q.hidc]) if (!by[id]) return `\\an hoặc \\anly nhắc ô ${id} nhưng chưa có ô này`;
  for (const id of q.hidc) if (!by[id].c) return `Ô ${id} chưa có căn cứ nên không ẩn được bằng \\anly`;
  if (q.hid.includes(roots[0].id)) return 'Không ẩn ô kết luận: học sinh cần biết phải chứng minh gì';
  if (!q.hid.length && !q.hidc.length) return 'Chưa ẩn ô nào: thêm \\an{…} hoặc \\anly{…}';
  return '';
}
const isTrue = t => /\\True\b/.test(t);
const clean = t => t.replace(/\\True\b/g, '').trim();
// Tách \sai{...} khỏi một phương án / một ý (không nhầm với \saithuong)
function takeWhy(t) {
  const m = /\\sai(?![a-zA-Z])/.exec(t);
  if (!m) return [t, null];
  const g = group(t, m.index + 4);
  if (!g) return [t, null];
  return [t.slice(0, m.index) + t.slice(g[1]), g[0].trim()];
}
const opt = o => { const [t, why] = takeWhy(o); const r = { t: clean(t), ok: isTrue(t) }; if (why) r.why = why; return r; };

export function parseBank(raw) {
  const errors = [];
  raw = String(raw || '').replace(/\r/g, '')
    .replace(/^[ \t]*%@(.*)$/gm, (_, x) => '\\lttp{' + x.replace(/[{}]/g, '').replace(/%/g, '\u0001') + '}')
    .replace(/(^|[^\\])%.*$/gm, '$1');
  const t = raw.match(/\\chude\s*\{/);
  const tg = t ? group(raw, t.index + 6) : null;
  const topic = tg ? tg[0].trim() : '';
  if (!topic) errors.push({ msg: 'Thiếu \\chude{Tên chủ đề}' });

  // Tóm tắt lý thuyết: \begin{lythuyet} ... \end{lythuyet} (một khối, thường đặt trước \man{1})
  let theory = null;
  const lt = raw.match(/\\begin\{lythuyet\}([\s\S]*?)\\end\{lythuyet\}/);
  if (lt) { theory = parseTheory(lt[1], errors); raw = raw.slice(0, lt.index) + raw.slice(lt.index + lt[0].length); }
  else if (/\\begin\{lythuyet\}/.test(raw)) errors.push({ msg: 'Khối lý thuyết chưa đóng \\end{lythuyet}' });

  const marks = []; const re = /\\man\s*\{/g; let m;
  while ((m = re.exec(raw))) marks.push(m.index);
  if (!marks.length && !theory) errors.push({ msg: 'Chưa có màn nào. Mỗi màn bắt đầu bằng \\man{số}{tên mức}' });

  const levels = [];
  marks.forEach((at, x) => {
    const g1 = group(raw, at + 4), g2 = g1 && group(raw, g1[1]);
    if (!g1 || !g2) { errors.push({ msg: `\\man thứ ${x + 1} phải có dạng \\man{số}{tên mức}` }); return; }
    const n = Number(g1[0]) || x + 1;
    const body = raw.slice(g2[1], x + 1 < marks.length ? marks[x + 1] : raw.length);
    const qs = [];
    const err = (msg) => errors.push({ level: n, q: qs.length + 1, msg });
    let e; ENV.lastIndex = 0;
    while ((e = ENV.exec(body))) {
      let [b, sol] = takeCmd(e[2], 'loigiai');
      let params, hints;
      [b, params] = takeAll(b, 'lttp');
      [b, hints] = takeAll(b, 'goiy');
      const q = { type: e[1], sol: sol || null };
      if (params.length) q.params = params.map(x => x.replace(/\u0001/g, '%'));
      if (hints.length) q.hints = hints;
      if (q.type === 'ex') {
        const k = b.indexOf('\\choice');
        if (k < 0) { err('Câu trắc nghiệm thiếu \\choice'); continue; }
        q.stem = b.slice(0, k).trim();
        q.opts = readGroups(b, k + 7).map(opt);
        const nt = q.opts.filter(o => o.ok).length;
        if (q.opts.some(o => o.ok && o.why)) { err('\\sai{…} chỉ đặt trong phương án sai, không đặt trong phương án \\True'); continue; }
        if (q.opts.length < 2) { err('Câu trắc nghiệm cần ít nhất 2 phương án'); continue; }
        if (nt !== 1) { err(nt ? 'Câu trắc nghiệm có nhiều hơn một \\True' : 'Câu trắc nghiệm chưa đánh dấu \\True cho đáp án đúng'); continue; }
      } else if (q.type === 'extf') {
        let k = b.indexOf('\\choiceTF'), len = 9;
        if (k < 0) { k = b.indexOf('\\choice'); len = 7; }
        if (k < 0) { err('Câu đúng/sai thiếu \\choiceTF'); continue; }
        q.stem = b.slice(0, k).trim();
        q.items = readGroups(b, k + len).map(opt);
        if (q.items.length < 2) { err('Câu đúng/sai cần ít nhất 2 ý'); continue; }
      } else if (q.type === 'exfb') {
        const traps = []; let bad = false;
        for (let m; (m = b.indexOf('\\saithuong')) >= 0;) {
          const a = group(b, m + 10), c = a && group(b, a[1]);
          if (!a || !c) { bad = true; break; }
          traps.push({ a: a[0].trim(), why: c[0].trim() }); b = b.slice(0, m) + b.slice(c[1]);
        }
        if (bad) { err('\\saithuong cần hai cặp: \\saithuong{đáp số sai}{vì sao sai}'); continue; }
        if (traps.length) q.traps = traps;
        const k = b.indexOf('\\shortans');
        const g = k >= 0 && group(b, k + 9);
        if (!g || !g[0].trim()) { err('Câu điền đáp số thiếu \\shortans{đáp số}'); continue; }
        q.stem = b.slice(0, k).trim();
        q.ans = g[0].split(';').map(s => s.trim()).filter(Boolean);
      } else if (q.type === 'extl') {
        q.stem = b.trim();
      } else if (q.type === 'exsx') {
        const bad = []; let st, nh;
        [b, nh] = takeArgs(b, 'nhieu', 2, 1, false, bad);
        [b, st] = takeArgs(b, 'buoc', 1, 1, true, bad);
        if (bad.length) { err(bad[0]); continue; }
        q.steps = st.map(x => ({ t: x.a[0], g: x.o || '' }));
        q.bad = nh.map(trap);
        q.stem = b.trim();
        if (q.steps.length < 2) { err('Câu sắp xếp cần ít nhất 2 \\buoc{…}'); continue; }
      } else if (q.type === 'exsd') {
        const bad = []; let nu, an, al, nl, nh;
        [b, q.nodes] = takeNut(b, bad);
        [b, an] = takeArgs(b, 'an', 1, 1, false, bad);
        [b, al] = takeArgs(b, 'anly', 1, 1, false, bad);
        [b, nl] = takeArgs(b, 'nhieuly', 2, 1, false, bad);
        [b, nh] = takeArgs(b, 'nhieu', 2, 1, false, bad);
        if (bad.length) { err(bad[0]); continue; }
        q.hid = ids(an); q.hidc = ids(al); q.bad = nh.map(trap); q.badc = nl.map(trap);
        q.stem = b.trim();
        const e2 = checkTree(q);
        if (e2) { err(e2); continue; }
      } else {
        const k = b.indexOf('\\pair');
        if (k < 0) { err('Câu nối ý thiếu \\pair{..}{..}'); continue; }
        q.stem = b.slice(0, k).trim(); q.pairs = [];
        let i = k, bad = false;
        while (i >= 0) {
          const a = group(b, i + 5), c = a && group(b, a[1]);
          if (!a || !c) { bad = true; break; }
          q.pairs.push([a[0].trim(), c[0].trim()]);
          i = b.indexOf('\\pair', c[1]);
        }
        if (bad) { err('\\pair phải có 2 vế: \\pair{trái}{phải}'); continue; }
        if (q.pairs.length < 2) { err('Câu nối ý cần ít nhất 2 cặp'); continue; }
      }
      if (!q.stem) { err('Câu hỏi chưa có đề bài'); continue; }
      if (q.params) {
        try { for (let t = 0; t < 5; t++) instantiate(q); } catch (ex) { err('tham số: ' + ex.message); continue; }
      } else if (/\{\{[^{}]+\}\}/.test(JSON.stringify([q.stem, q.opts, q.items, q.ans, q.pairs, q.sol, q.traps, q.steps, q.nodes, q.bad, q.badc]))) {
        err('có {{...}} nhưng chưa khai báo tham số %@'); continue;
      }
      q.key = qkeyOf(q);
      qs.push(q);
    }
    const opened = (body.match(new RegExp('\\\\begin\\{(' + QTYPES + ')\\}', 'g')) || []).length;
    const closed = (body.match(new RegExp('\\\\begin\\{(' + QTYPES + ')\\}[\\s\\S]*?\\\\end\\{(' + QTYPES + ')\\}', 'g')) || []).length;
    if (opened > closed) errors.push({ level: n, msg: 'Có câu chưa đóng \\end{...} hoặc \\begin và \\end không cùng loại' });
    if (!qs.length && !errors.some(er => er.level === n)) errors.push({ level: n, msg: 'Màn này chưa có câu hỏi nào' });
    levels.push({ n, title: g2[0].trim(), qs });
  });
  const all = levels.flatMap(l => l.qs);
  if (all.some(q => q.type === 'extl') && all.some(q => q.type !== 'extl'))
    errors.push({ msg: 'Đề tự luận (\\begin{extl}) không trộn chung với câu trắc nghiệm, đúng/sai, điền số, nối ý. Thầy tách thành hai đề.' });
  return { topic, levels, errors, theory };
}
// Đề tự luận: mọi câu là extl
export const isTLBank = levels => levels.some(l => l.qs.some(q => q.type === 'extl'));

// Các mục của khối lý thuyết. Hai đối số {tiêu đề}{nội dung}, riêng \luuy{nội dung}; \vidu{đề}{lời giải}.
export const THEORY_KINDS = { dinhnghia: 'Định nghĩa', quytac: 'Quy tắc', congthuc: 'Công thức', dinhly: 'Định lý', tinhchat: 'Tính chất', luuy: 'Lưu ý', vidu: 'Ví dụ' };
function parseTheory(body, errors) {
  const items = [], re = /\\(dinhnghia|quytac|congthuc|dinhly|tinhchat|luuy|vidu)\b/g; let m;
  while ((m = re.exec(body))) {
    const k = m[1], g1 = group(body, m.index + m[0].length);
    if (!g1) { errors.push({ msg: `Lý thuyết: \\${k} thiếu {…}` }); continue; }
    if (k === 'luuy') { items.push({ k, title: '', body: g1[0].trim() }); re.lastIndex = g1[1]; continue; }
    const g2 = group(body, g1[1]);
    if (!g2) { errors.push({ msg: `Lý thuyết: \\${k} cần hai cặp {…}{…}` }); re.lastIndex = g1[1]; continue; }
    items.push(k === 'vidu' ? { k, title: '', body: g1[0].trim(), sol: g2[0].trim() } : { k, title: g1[0].trim(), body: g2[0].trim() });
    re.lastIndex = g2[1];
  }
  if (!items.length) errors.push({ msg: 'Khối lý thuyết chưa có mục nào (\\dinhnghia, \\quytac, \\congthuc, \\dinhly, \\tinhchat, \\luuy, \\vidu)' });
  return items;
}

export function errorText(e) {
  return (e.level ? `Màn ${e.level}` : '') + (e.q ? `, câu ${e.q}` : '') + (e.level ? ': ' : '') + e.msg;
}
