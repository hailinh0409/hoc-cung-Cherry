import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseBank } from '../lib/latex.js';

const fixture = path => readFileSync(new URL('../../docs/' + path, import.meta.url), 'utf8');
const topic = body => String.raw`\chude{Bài thử}` + '\n' + body;
const block = body => '\\begin{baichat}\n' + body + '\n\\end{baichat}';

test('bài chat chuyển vế đọc toàn bộ các màn và trạng thái hình', () => {
  const { chat, errors, warnings } = parseBank(topic(fixture('bai-chat/k7-chuyen-ve.tex')));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.equal(chat.modau.fig.mau.name, 'can');
  assert.deepEqual(chat.parts.map(part => part.screens.length), [4, 7, 3]);
  const [equality, transpose, practice] = chat.parts;
  const act = equality.screens[0];
  assert.equal(act.type, 'act');
  assert.deepEqual(act.acts.map(step => step.warn), [true, false]);
  assert.equal(act.acts[1].state.phai[0].count, 4);
  assert.equal(transpose.screens[0].label, 'Nhắc nhanh');
  const tap = transpose.screens[1];
  assert.equal(tap.tap.ans, '1t2');
  assert.deepEqual(Object.keys(tap.tap.nhac), ['1t1', '1p1']);
  assert.deepEqual(tap.after, { dong: 2, to: { '1t2': 'cam', '2p2': 'cam' } });
  assert.deepEqual(transpose.screens[3].stepStates, [
    { dong: 2, to: { '2p2': 'cam' } }, {}, { dong: 3, to: { '3p1': 'luc' } },
  ]);
  assert.equal(practice.screens[0].calc.items.length, 2);
  assert.equal(practice.screens[0].calc.items[1].after.dong, 3);
  assert.match(practice.screens[0].calc.ketluan, /SGK/);
  assert.equal(chat.ketbai.quiz.opts.length, 4);
  assert.equal(chat.ketbai.quiz.opts.filter(option => option.ok).length, 1);
  assert.equal(chat.ketbai.emdahoc.length, 3);
});

test('bài hình học đọc được trong baichat và bản lythuyet vẫn giữ cấu trúc cũ', () => {
  const sample = fixture('bai-giang/k7-b9-bai-giang.tex');
  const chatSource = sample.replaceAll('{lythuyet}', '{baichat}');
  const { theory, lesson, chat, errors, warnings } = parseBank(topic(sample + '\n' + chatSource));
  assert.deepEqual(errors, []);
  assert.ok(warnings.some(warning => warning.msg.includes('\\ten')));
  assert.ok(theory.length);
  assert.equal(lesson.parts[0].screens[0].quiz.correct, chat.parts[0].screens[0].quiz.opts.find(option => option.ok).text);
  assert.deepEqual(chat.parts.map(part => part.screens.length), [8, 4, 6, 2]);
  assert.equal(chat.parts[1].screens[0].calc.items[0].opts.length, 2);
});

test('chặn khối trùng, phương án lỗi, số hạng sai và trạng thái ví dụ không đúng chỗ', () => {
  const body = [
    '\\phan{Đẳng thức}{Đọc hai vế}',
    '\\hinhchung{\\hinhmau{dang-thuc}{dong1=x + 3 = 7}}',
    '\\theobuoc{dong=1}',
    '\\begin{thu}{Câu hỏi $x = 4$}',
    '\\dung{$x = 4$}{}',
    '\\dung{$x = 5$}{Cần hai loại phương án}',
    '\\end{thu}',
    '\\chamhinh{Chọn số hạng}{1t9}{Đúng}{Thử lại}',
    '\\nhac{1p2}{Nhìn lại vế phải}',
    '\\saukhitra{to=1t3:cam}',
    '\\theobuoc{}{}',
    '\\vidu{Tìm x}{Một dòng}',
  ].join('\n');
  const { errors, warnings } = parseBank(topic(block(body) + '\n' + block(body)));
  for (const pattern of [/một khối baichat/, /đứng ngay trước/, /2–4 phương án/, /1t9/, /1p2/, /1t3/, /nhiều trạng thái/]) {
    assert.ok(errors.some(error => pattern.test(error.msg) && Number.isInteger(error.line)), String(pattern));
  }
  assert.ok(errors.some(error => error.line === 7 && error.msg.includes('\\dung')));
  assert.ok(warnings.some(warning => warning.line === 6 && warning.msg.includes('dòng riêng')));
});

