// Hai dạng câu mới: sắp xếp lời giải (exsx) và sơ đồ phân tích đi lên (exsd)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseBank } from '../lib/latex.js';
import { instantiate } from '../lib/params.js';

const src = readFileSync(new URL('./dang-moi.tex', import.meta.url), 'utf8');
const bank = (body) => parseBank('\\chude{x}\n\\man{1}{x}\n' + body);

test('đọc đủ câu mẫu, không lỗi', () => {
  const P = parseBank(src);
  assert.deepEqual(P.errors, []);
  const qs = P.levels.flatMap(l => l.qs);
  assert.deepEqual(qs.map(q => q.type), ['exsx', 'exsx', 'exsd', 'exsd', 'exsx']);
  assert.equal(qs[0].steps.length, 4);
  assert.equal(qs[0].bad.length, 2);
  assert.deepEqual(qs[1].steps.map(s => s.g), ['1', '1', '', '']);
  const sd = qs[3];
  assert.equal(sd.nodes.length, 9);
  assert.deepEqual(sd.hid, ['2', '6']);
  assert.deepEqual(sd.hidc, ['2', '4', '6']);
  assert.equal(sd.nodes.find(n => n.id === '6').p, '4');
  assert.match(qs[2].stem, /\\angle AMB/); // \an không nuốt \angle
});

test('câu có tham số đổi số ở cả bước và khối sai', () => {
  const q = parseBank(src).levels[1].qs[0];
  const x = instantiate(q, () => 0.5);
  assert.ok(!/\{\{/.test(JSON.stringify(x)));
  assert.equal(x.key, q.key);
});

test('báo lỗi soạn sai', () => {
  assert.match(bank('\\begin{exsx} Đề \\buoc{a} \\end{exsx}').errors[0].msg, /ít nhất 2/);
  assert.match(bank('\\begin{exsd} Đề \\nut{1}{A}{} \\nut{2}[1]{B}{x} \\end{exsd}').errors[0].msg, /Chưa ẩn/);
  assert.match(bank('\\begin{exsd} Đề \\nut{1}{A}{} \\nut{2}[3]{B}{x} \\an{2} \\end{exsd}').errors[0].msg, /ô cha \[3\]/);
  assert.match(bank('\\begin{exsd} Đề \\nut{1}{A}{} \\nut{2}[1]{B}{} \\an{1} \\end{exsd}').errors[0].msg, /kết luận/);
  assert.match(bank('\\begin{exsd} Đề \\nut{1}{A}{} \\nut{2}[1]{B}{} \\anly{2} \\end{exsd}').errors[0].msg, /căn cứ/);
});
