import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectChatSource, replaceChatBlock, chatGrades } from '../lib/chat-source.js';
import { figBlocks } from '../lib/figcode.js';

const demo = readFileSync(new URL('../../docs/bai-chat/k7-chuyen-ve.tex', import.meta.url), 'utf8');
const geometry = readFileSync(new URL('../../docs/bai-giang/k7-b9-bai-giang.tex', import.meta.url), 'utf8');

test('chèn và thay baichat mà giữ nguyên bản cũ, đề, chú thích và dòng tham số', () => {
  const original = '\\chude{Chuyển vế}\r\n\\begin{lythuyet}\\quytac{Quy tắc}{Ghi nhớ}\\end{lythuyet} % ghi chú\r\n' +
    '\\man{1}{Nhận biết}\r\n%@ a = ngaunhien(1,9)\r\n\\begin{exfb} Tính $1+2$. \\shortans{3} \\end{exfb}\r\n';
  const draft = inspectChatSource(demo, { standalone: true });
  assert.deepEqual(draft.errors, []);
  const inserted = replaceChatBlock(original, draft.block);
  assert.match(inserted, /\\end\{lythuyet\} % ghi chú\r\n\r\n\\begin\{baichat\}/);
  assert.equal(inserted.replace('\r\n\r\n' + draft.block + '\r\n', ''), original);
  const changed = draft.block.replace('Chào \\ten!', 'Chào cậu!');
  const replaced = replaceChatBlock(inserted, changed);
  assert.equal(replaced, inserted.replace(draft.block, changed));
  assert.ok(replaceChatBlock('\\chude{Bài {mới}}\n\\man{1}{Nhận biết}', draft.block).startsWith(
    '\\chude{Bài {mới}}\n\n\\begin{baichat}'));
  assert.ok(inspectChatSource(inserted, { standalone: true }).errors.length);
  assert.throws(() => replaceChatBlock(original + '\n\\begin{baichat}', draft.block), /đủ lệnh mở và đóng/);
  assert.deepEqual(chatGrades(['7', 7, 5, 13, 'foo', 10]), [7, 10]);
});

test('các khung TikZ trong baichat vẫn được thu thập để dịch', () => {
  const chat = geometry.replaceAll('{lythuyet}', '{baichat}');
  assert.equal(figBlocks(chat).length, 18);
  assert.deepEqual(figBlocks(chat), figBlocks(geometry));
});
