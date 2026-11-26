import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBank, parseHinhBuoc, hbFrame } from '../lib/latex.js';
import { figBlocks, normalizeSource } from '../lib/figcode.js';

const HB = String.raw`\begin{hinhbuoc}
\begin{tikzpicture} % chú thích bị bỏ
\draw (0,0)--(2,0);
\hien{2}{\draw (0,0)--(0,2);}
\hien{3}{\node at (1,1) {$x$};}
\end{tikzpicture}
\loibuoc{Vẽ đoạn nằm ngang.}
\loibuoc{Thêm đoạn thẳng đứng, chiếm 50\% hình.}
\loibuoc{Ghi $x$.}
\end{hinhbuoc}`;
const SRC = String.raw`\chude{Thử hình từng bước}
\begin{lythuyet}
\loidan{Cherry vẽ từng nét nhé.}
\dinhnghia{Đoạn thẳng}{Nội dung \begin{tikzpicture}\draw (0,0)--(1,0);\end{tikzpicture}}
` + HB + String.raw`
\thungay{Câu?}{Đúng}{Sai}{Vì đúng}{Vì sai}
\end{lythuyet}
\man{1}{Nhận biết}
\begin{exfb}
Tính $1+1$.
\shortans{2}
\end{exfb}`;

test('đọc hình từng bước trong lythuyet thành một mục riêng, không lỗi', () => {
  const P = parseBank(SRC);
  assert.deepEqual(P.errors, []);
  assert.deepEqual(P.theory.map(i => i.k), ['loidan', 'dinhnghia', 'hinhbuoc', 'thungay']);
  const h = parseHinhBuoc(P.theory[2].body);
  assert.equal(h.caps.length, 3);
  assert.equal(h.caps[1], 'Thêm đoạn thẳng đứng, chiếm 50\\% hình.');
  assert.deepEqual(h.steps, [2, 3]);
});

test('mỗi bước là một khối hình; mã khung ở máy chủ và giao diện giống hệt nhau', () => {
  const blocks = figBlocks(SRC);
  assert.equal(blocks.length, 4); // 3 khung + 1 hình thường
  assert.ok(blocks[0].startsWith('\\lttbuoc{1}\n\\begin{tikzpicture}'));
  assert.ok(!blocks.some(b => b.includes('chú thích')));
  // Giao diện: lấy mục hinhbuoc từ parseBank rồi tính khung, phải trùng khóa của máy chủ
  const item = parseBank(SRC).theory.find(i => i.k === 'hinhbuoc');
  const body = item.body.replace(/^\\begin\{hinhbuoc\}/, '').replace(/\\end\{hinhbuoc\}$/, '');
  const client = parseHinhBuoc(body).frames;
  assert.deepEqual(client, blocks.slice(0, 3));
  // Hình thường bên trong hinhbuoc không bị dịch riêng
  const tikz = normalizeSource(HB).match(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/)[0];
  assert.ok(!blocks.includes(tikz));
  assert.equal(hbFrame(tikz, 2), blocks[1]);
});

test('báo lỗi soạn hình từng bước', () => {
  const err = s => parseBank('\\chude{X}\n\\begin{lythuyet}\n\\luuy{a}\n' + s + '\n\\end{lythuyet}').errors.map(e => e.msg).join(' | ');
  assert.match(err(String.raw`\begin{hinhbuoc}\loibuoc{a}\loibuoc{b}\end{hinhbuoc}`), /đúng một hình tikzpicture/);
  assert.match(err(String.raw`\begin{hinhbuoc}\begin{tikzpicture}\hien{2}{x}\end{tikzpicture}\loibuoc{a}\end{hinhbuoc}`), /ít nhất 2 dòng/);
  assert.match(err(String.raw`\begin{hinhbuoc}\begin{tikzpicture}\hien{4}{x}\end{tikzpicture}\loibuoc{a}\loibuoc{b}\end{hinhbuoc}`), /vượt quá số bước/);
  assert.match(err(String.raw`\begin{hinhbuoc}\begin{tikzpicture}\draw(0,0);\end{tikzpicture}\loibuoc{a}\loibuoc{b}\end{hinhbuoc}`), /chưa có \\hien/);
  assert.match(err(String.raw`\begin{hinhbuoc}\begin{tikzpicture}\hien{2}{x}\end{tikzpicture}\loibuoc{a}\loibuoc{b}`), /chưa đóng/);
});
