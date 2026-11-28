import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseGiaiMau, giaiMauErrors } from '../lib/latex.js';

const inner = f => fs.readFileSync(new URL('../../docs/tu-luan/' + f, import.meta.url), 'utf8').match(/\\begin\{giaimau\}([\s\S]*?)\\end\{giaimau\}/)[1];

test('bài tự luận mẫu (hình, đại số): đọc đủ \\huong, \\goiy, \\kiemtra, không lỗi', () => {
  const h = parseGiaiMau(inner('mau-hinh-tiep-tuyen.tex'));
  assert.deepEqual(h.errors, []);
  const st = h.items.filter(x => x.k === 'buocgiai');
  assert.equal(st.length, 13);
  assert.ok(st.every(x => x.lead));
  assert.equal(st.filter(x => x.check).length, 11);
  assert.equal(st[0].hints.length, 2);
  assert.equal(st[0].check.type, 'mc');
  assert.equal(st[0].check.opts.length, 3);
  assert.ok(st[0].check.opts[0].ok && !st[0].check.opts[1].ok);
  const d = parseGiaiMau(inner('mau-dai-so-viete.tex'));
  assert.deepEqual(d.errors, []);
  const nums = d.items.filter(x => x.check && x.check.type === 'num').map(x => x.check);
  assert.deepEqual(nums.map(c => c.ans), [4, 1.25]);
  assert.deepEqual(nums.map(c => c.wrong.map(w => w.v)), [[0], [1]]);
});

test('báo lỗi \\huong, \\goiy, \\kiemtra đặt sai chỗ hoặc thiếu', () => {
  const e = parseGiaiMau('\\de{x}\\huong{a}\\buocgiai{a}{b}{c}\\kiemtra{q}{a}{b}{c}\\kiemtra{q}{=x}{c}').errors.join(' | ');
  assert.match(e, /\\huong phải đứng ngay sau một \\buocgiai/);
  assert.match(e, /\\kiemtra cần/);
  const e2 = parseGiaiMau('\\de{x}\\buocgiai{a}{b}{c}\\kiemtra{q}{=x}{c}').errors.join(' | ');
  assert.match(e2, /phải là số nguyên/);
  const e3 = parseGiaiMau('\\de{x}\\buocgiai{a}{b}{c}\\goiy{1}\\goiy{2}\\goiy{3}\\goiy{4}').errors.join(' | ');
  assert.match(e3, /tối đa 3 \\goiy/);
  assert.match(giaiMauErrors('\\begin{extl}x\\begin{huongdan}\\buocgiai{a}{b}{c}\\huong{z}\\end{huongdan}\\end{extl}').join(' | '), /không dùng \\huong/);
  // bài mẫu cũ không có lệnh mới vẫn đọc được
  assert.deepEqual(parseGiaiMau('\\de{x}\\buocgiai{a}{b}{c}').errors, []);
});
