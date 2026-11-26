import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseGiaiMau, parseBank, gmFrame } from '../lib/latex.js';
import { figBlocks } from '../lib/figcode.js';

const src = fs.readFileSync(new URL('../../docs/mau/giaimau-tiep-tuyen.tex', import.meta.url), 'utf8');
const inner = src.match(/\\begin\{giaimau\}([\s\S]*?)\\end\{giaimau\}/)[1];

test('bài mẫu tiếp tuyến: đọc đủ bước, câu đoán, sơ đồ, không lỗi', () => {
  const g = parseGiaiMau(inner);
  assert.deepEqual(g.errors, []);
  assert.equal(g.steps, 13);
  assert.equal(g.items.filter(x => x.k === 'cau').length, 3);
  assert.equal(g.items.filter(x => x.k === 'doan').length, 5);
  assert.equal(g.items.find(x => x.k === 'doan').opts.length, 3);
  assert.equal(g.items.find(x => x.k === 'sodo').nodes.length, 6);
  assert.ok(g.frames.includes(g.full));
});
test('khung hình: chỉ dịch các khung, không dịch hình gốc; khung tô sáng bọc phần mờ', () => {
  const g = parseGiaiMau(inner), blocks = figBlocks('\\begin{lythuyet}\n' + src + '\n\\end{lythuyet}');
  assert.equal(blocks.length, g.frames.length);
  assert.ok(!blocks.includes(g.tikz));
  const f = gmFrame(g.tikz, 1, 1);
  assert.match(f, /^\\lttbuoc\{1\}\\lttsang\{1\}/);
  assert.match(f, /\\begin\{tikzpicture\}\[scale=1, line join=round\]\\begin\{scope\}\[opacity=\.3\]/);
  assert.match(f, /\\end\{scope\}\\lttsangve\n\\end\{tikzpicture\}$/);
  assert.equal(gmFrame(g.tikz, 2, 0), '\\lttbuoc{2}\\lttsang{0}\n' + g.tikz);
});
test('báo lỗi soạn', () => {
  const e = parseGiaiMau('\\cau{Câu 1}{x}\\doan{q}{a}{b}{c}').errors.join(' | ');
  assert.match(e, /thiếu \\de/);
  assert.match(e, /ít nhất một \\buocgiai/);
  assert.match(e, /\\doan cần/);
  const e2 = parseGiaiMau('\\de{x}\\begin{tikzpicture}\\sang{5}{\\draw (0,0)--(1,0);}\\end{tikzpicture}\\buocgiai{a}{b}{c}\\begin{sodo}\\nut{2}{x}{}\\end{sodo}').errors.join(' | ');
  assert.match(e2, /\\sang\{5\} không khớp/);
  assert.match(e2, /Sơ đồ cần bắt đầu/);
  const P = parseBank('\\chude{T}\n\\begin{lythuyet}\n\\begin{giaimau}\\de{x}\n\\end{lythuyet}');
  assert.ok(P.errors.some(x => /giải mẫu/.test(x.msg)));
});

test('hướng dẫn tự luận trong extl: tách khỏi đề, đọc bước và sơ đồ, dịch khung hình', () => {
  const tl = `\\chude{Đề TL}\n\\man{1}{Đề}\n\\begin{extl}Giải phương trình $x^2-5x+6=0$.
\\begin{huongdan}
\\begin{tikzpicture}\\draw (0,0)--(1,0);\\sang{1}{\\draw (0,0)--(1,0);}\\end{tikzpicture}
\\buocgiai{Nhận dạng}{Đây là phương trình bậc hai.}{Có $x^2$.}
\\begin{sodo}\\nut{1}{$x=2$ hoặc $x=3$}{}\\nut{2}{$(x-2)(x-3)=0$}{}\\end{sodo}
\\buocgiai{Phân tích}{Tìm hai số có tổng 5, tích 6.}{}
\\end{huongdan}
\\loigiai{$x=2$ hoặc $x=3$.}\\end{extl}`;
  const P = parseBank(tl);
  assert.deepEqual(P.errors, []);
  const q = P.levels[0].qs[0];
  assert.ok(!/huongdan|buocgiai/.test(q.stem));
  const g = parseGiaiMau(q.guide, true);
  assert.deepEqual(g.errors, []);
  assert.deepEqual(g.items.map(x => x.k), ['buocgiai', 'sodo', 'buocgiai']);
  assert.equal(g.frames.length, 3); // bước 1 tô sáng, sơ đồ (đã qua 1 bước), bước 2
  assert.equal(figBlocks(tl).length, 3);
  const bad = parseBank(tl.replace('\\buocgiai{Nhận dạng}', '\\doan{a}{b}{c}{d}{e}\\buocgiai{Nhận dạng}'));
  assert.ok(bad.errors.some(e => /Hướng dẫn tự luận chỉ dùng/.test(e.msg)));
});
