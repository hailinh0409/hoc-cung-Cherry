// Đọc ngân hàng câu hỏi LaTeX của game.
// Cú pháp:
//   \chude{Tên chủ đề}
//   \man{1}{Nhận biết}
//   \begin{ex}    đề \choice{..}{\True ..}{..}{..}        \loigiai{..} \end{ex}     trắc nghiệm
//   \begin{extf}  đề \choiceTF{\True ..}{..}{\True ..}{..} \loigiai{..} \end{extf}   đúng/sai từng ý
//   \begin{exfb}  đề \shortans{đáp số;đáp số khác}          \loigiai{..} \end{exfb}   điền đáp số
//   \begin{exmatch} đề \pair{trái}{phải} \pair{..}{..}       \loigiai{..} \end{exmatch} nối ý

import { instantiate } from './params.js';

const ENV = /\\begin\{(ex|extf|exfb|exmatch)\}([\s\S]*?)\\end\{\1\}/g;

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
  const str = JSON.stringify([q.type, q.stem, q.opts, q.items, q.ans, q.pairs, q.params]);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

const isTrue = t => /\\True\b/.test(t);
const clean = t => t.replace(/\\True\b/g, '').trim();

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
        q.opts = readGroups(b, k + 7).map(o => ({ t: clean(o), ok: isTrue(o) }));
        const nt = q.opts.filter(o => o.ok).length;
        if (q.opts.length < 2) { err('Câu trắc nghiệm cần ít nhất 2 phương án'); continue; }
        if (nt !== 1) { err(nt ? 'Câu trắc nghiệm có nhiều hơn một \\True' : 'Câu trắc nghiệm chưa đánh dấu \\True cho đáp án đúng'); continue; }
      } else if (q.type === 'extf') {
        let k = b.indexOf('\\choiceTF'), len = 9;
        if (k < 0) { k = b.indexOf('\\choice'); len = 7; }
        if (k < 0) { err('Câu đúng/sai thiếu \\choiceTF'); continue; }
        q.stem = b.slice(0, k).trim();
        q.items = readGroups(b, k + len).map(o => ({ t: clean(o), ok: isTrue(o) }));
        if (q.items.length < 2) { err('Câu đúng/sai cần ít nhất 2 ý'); continue; }
      } else if (q.type === 'exfb') {
        const k = b.indexOf('\\shortans');
        const g = k >= 0 && group(b, k + 9);
        if (!g || !g[0].trim()) { err('Câu điền đáp số thiếu \\shortans{đáp số}'); continue; }
        q.stem = b.slice(0, k).trim();
        q.ans = g[0].split(';').map(s => s.trim()).filter(Boolean);
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
      } else if (/\{\{[^{}]+\}\}/.test(JSON.stringify([q.stem, q.opts, q.items, q.ans, q.pairs, q.sol]))) {
        err('có {{...}} nhưng chưa khai báo tham số %@'); continue;
      }
      q.key = qkeyOf(q);
      qs.push(q);
    }
    const opened = (body.match(/\\begin\{(ex|extf|exfb|exmatch)\}/g) || []).length;
    const closed = (body.match(/\\begin\{(ex|extf|exfb|exmatch)\}[\s\S]*?\\end\{(ex|extf|exfb|exmatch)\}/g) || []).length;
    if (opened > closed) errors.push({ level: n, msg: 'Có câu chưa đóng \\end{...} hoặc \\begin và \\end không cùng loại' });
    if (!qs.length && !errors.some(er => er.level === n)) errors.push({ level: n, msg: 'Màn này chưa có câu hỏi nào' });
    levels.push({ n, title: g2[0].trim(), qs });
  });
  return { topic, levels, errors, theory };
}

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
