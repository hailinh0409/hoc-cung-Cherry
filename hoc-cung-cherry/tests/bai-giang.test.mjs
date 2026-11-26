import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseBank } from '../lib/latex.js';
import { figBlocks } from '../lib/figcode.js';

const sample = readFileSync(new URL('../../docs/bai-giang/k7-b9-bai-giang.tex', import.meta.url), 'utf8');
const topic = body => '\\chude{Bài thử}\n' + body;
const lessonSource = body => '\\begin{lythuyet}\n' + body + '\n\\end{lythuyet}';

test('Bài 9 đọc đủ phần, màn, trạng thái hình và lời nhắc theo từng góc', () => {
  const { lesson, theory, errors, warnings } = parseBank(topic(sample));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.equal(lesson.legacy, false);
  assert.equal(lesson.modau.cauhoi, 'Vì sao chỉ cần như vậy là đủ biết các thanh ngang song song?');
  assert.equal(lesson.modau.nutbuoc, 'Đặt ê ke');
  assert.equal(lesson.modau.fig.kind, 'hinhbuoc');
  assert.deepEqual(lesson.parts.map(({ title, goal }) => [title, goal]), [
    ['Góc so le trong, góc đồng vị', 'Nhận biết các góc tạo bởi một đường thẳng cắt hai đường thẳng'],
    ['Khi có một cặp góc so le trong bằng nhau', 'Biết các góc còn lại bằng nhau thế nào'],
    ['Dấu hiệu nhận biết hai đường thẳng song song', 'Dùng cặp góc so le trong, đồng vị để biết hai đường thẳng song song'],
    ['Vẽ hai đường thẳng song song', 'Vẽ bằng ê ke và giải thích vì sao'],
  ]);
  assert.deepEqual(lesson.parts.map(p => p.screens.length), [8, 4, 6, 2]);
  const [angles, measures, sign, drawing] = lesson.parts;
  assert.deepEqual(angles.fig.mau, { name: 'cat-tuyen', params: { duong: ['a', 'b', 'c'], diem: ['A', 'B'] } });
  assert.deepEqual(angles.screens[0].after, { so: 'hien' });
  const tap = angles.screens.find(sc => sc.type === 'tap').tap;
  assert.equal(tap.ans, 'B2');
  assert.deepEqual(Object.keys(tap.nhac), ['B3', 'B1', 'B4']);
  assert.match(tap.nhac.B3, /cùng phía/);
  const calc = measures.screens[0];
  assert.equal(calc.type, 'calc');
  assert.equal(calc.calc.items.length, 2);
  assert.match(calc.calc.ketluan, /cũng bằng nhau/);
  assert.deepEqual(calc.state, { to: { A1: 'cam', B3: 'cam' }, do: { A1: '60°', B3: '60°' } });
  assert.deepEqual(sign.screens[1].toggle[1].state, { to: { A1: 'lam', B1: 'lam' } });
  assert.equal(drawing.screens[0].type, 'steps');
  assert.deepEqual(drawing.screens[1].state, { buoc: 5 });
  assert.equal(lesson.ketbai.quiz.q, 'Vì sao các thanh ngang song song với nhau?');
  assert.equal(lesson.ketbai.emdahoc.length, 4);
  assert.ok(theory.some(item => item.k === 'dinhnghia'));
  assert.equal(figBlocks(sample).length, 18);
});

test('bài cũ giữ danh sách theory và chia phần theo lời dẫn', () => {
  const body = [
    '\\loidan{Bắt đầu.}',
    '\\dinhnghia{Ý thứ nhất}{Đọc hình \\begin{tikzpicture}\\draw (0,0)--(1,0);\\end{tikzpicture}.}',
    '\\loidan{Còn một ý.}',
    '\\quytac{Ý thứ hai}{Nội dung thứ hai.}',
  ].join('\n');
  const { lesson, theory, errors, warnings } = parseBank(topic(lessonSource(body)));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.equal(lesson.legacy, true);
  assert.deepEqual(lesson.parts.map(p => p.title), ['Ý thứ nhất', 'Ý thứ hai']);
  assert.equal(lesson.parts[0].fig.kind, 'tikz');
  assert.deepEqual(theory.map(item => item.k), ['loidan', 'dinhnghia', 'loidan', 'quytac']);
  assert.match(theory[1].body, /tikzpicture/);
});

test('phân biệt lỗi chặn lưu với cảnh báo lời Cherry và hình minh họa', () => {
  const body = [
    '\\phan{Góc}{Nhận biết góc}',
    '\\cherry{' + 'a'.repeat(200) + '}',
    '\\chamhinh{Chạm góc}{B7}{Đúng rồi}{Thử lại}',
    '\\nhac{B0}{Nhìn lại đỉnh}',
    '\\dinhnghia{Góc}{Chỉ có chữ}',
    '\\phan{Phần rỗng}{Ôn lại}',
  ].join('\n');
  const { errors, warnings } = parseBank(topic(lessonSource(body)));
  for (const match of [/cần hình mẫu/, /Khóa góc.*B7/, /Khóa góc.*B0/, /chưa có màn/]) {
    assert.ok(errors.some(e => match.test(e.msg)), String(match));
  }
  for (const match of [/120 kí tự/, /chỉ có chữ/, /Thiếu khối modau/, /Thiếu khối ketbai/]) {
    assert.ok(warnings.some(e => match.test(e.msg)), String(match));
  }
});

test('đọc hình mẫu dạng mặc định và trạng thái khai báo trước câu hỏi', () => {
  const body = [
    '\\phan{Góc}{Nhận biết góc}',
    '\\hinhchung{\\hinhmau{cat-tuyen}{}}',
    '\\saukhitra{so=hien}',
    '\\thungay{Câu hỏi}{Đúng}{Sai}{Vì đúng}{Vì sao sai}',
  ].join('\n');
  const { lesson, errors } = parseBank(topic(lessonSource(body)));
  assert.deepEqual(errors, []);
  assert.deepEqual(lesson.parts[0].fig.mau.params, {});
  assert.deepEqual(lesson.parts[0].screens[0].after, { so: 'hien' });
});
