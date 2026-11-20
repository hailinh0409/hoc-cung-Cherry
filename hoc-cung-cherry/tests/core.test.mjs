import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBank } from '../lib/latex.js';
import { instantiate } from '../lib/params.js';
import { readFileSync } from 'node:fs';
const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
test('mọi chủ đề mẫu đọc được, không lỗi', () => {
  for (const t of seed.ltt_topics) { const P = parseBank(t.source); assert.equal(P.errors.length, 0, t.slug + ': ' + JSON.stringify(P.errors)); }
});
test('câu có tham số sinh được số', () => {
  const P = parseBank(seed.ltt_topics.find(t => t.slug === 'lop8-hang-dang-thuc').source);
  const q = P.levels.flatMap(l => l.qs).find(q => q.params);
  for (let i = 0; i < 20; i++) assert.ok(instantiate(q).stem);
});
test('báo lỗi theo đáp án sai: \\sai và \\saithuong', () => {
  const src = String.raw`\chude{Thử}
\man{1}{Nhận biết}
\begin{ex}
Tính $-(2-7)$.
\choice{$-5$ \sai{Quên đổi dấu khi bỏ ngoặc: $-(a-b)=-a+b$.}}{\True $5$}{$9$}{$-9$ \sai{Chỉ đổi dấu số đầu.}}
\end{ex}
\begin{extf}
Xét các khẳng định.
\choiceTF{\True $2>1$}{$1>2$ \sai{Số nhỏ hơn không thể lớn hơn.}}
\end{extf}
\begin{exfb}
%@ a = ngaunhien(2, 9)
Tính $-(1-{{a+1}})$.
\shortans{{{a}}}
\saithuong{{{-a}}}{Quên đổi dấu.}
\saithuong{0}{Sai rồi.}
\end{exfb}
\begin{ex}
Câu lỗi
\choice{\True $1$ \sai{không được}}{$2$}
\end{ex}`;
  const P = parseBank(src);
  const [mc, tf, fb] = P.levels[0].qs;
  assert.equal(mc.opts[0].t, '$-5$'); assert.match(mc.opts[0].why, /Quên đổi dấu/);
  assert.equal(mc.opts[1].why, undefined); assert.equal(mc.opts[1].ok, true);
  assert.match(tf.items[1].why, /Số nhỏ/); assert.equal(tf.items[1].t, '$1>2$');
  assert.equal(fb.traps.length, 2);
  const q = instantiate(fb); assert.equal(q.traps[0].a, '-' + q.ans[0]);
  assert.equal(P.errors.length, 1); assert.match(P.errors[0].msg, /phương án \\True/);
  // thêm lời báo lỗi không đổi mã câu (giữ lịch ôn)
  const plain = parseBank(src.replace(/ \\sai\{[^{}]*(\$[^$]*\$[^{}]*)*\}/g, '')).levels[0].qs[0];
  assert.equal(plain.key, mc.key);
});

test('đề tự luận extl: đọc đề và gợi ý, không cho trộn với câu trắc nghiệm', () => {
  const P = parseBank('\\chude{Đề TL}\n\\man{1}{Đề}\n\\begin{extl}\nGiải phương trình $2x+3=7$.\n\\goiy{Chuyển $3$ sang vế phải.}\n\\goiy{Chia hai vế cho $2$.}\n\\loigiai{$x=2$}\n\\end{extl}\n\\begin{extl}\nTính $1+2$.\n\\end{extl}');
  assert.equal(P.errors.length, 0, JSON.stringify(P.errors));
  const [a, b] = P.levels[0].qs;
  assert.equal(a.type, 'extl'); assert.equal(a.stem, 'Giải phương trình $2x+3=7$.'); assert.equal(a.hints.length, 2); assert.equal(a.sol, '$x=2$');
  assert.equal(b.hints, undefined);
  const M = parseBank('\\chude{Trộn}\n\\man{1}{Đề}\n\\begin{extl}\nTính $1+2$.\n\\end{extl}\n\\begin{exfb}\nTính $2+2$. \\shortans{4}\n\\end{exfb}');
  assert.ok(M.errors.some(e => /không trộn/.test(e.msg)));
});
