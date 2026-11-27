import { group, parseBank } from './latex.js';

export const CHAT_SETTING_KEY = 'bai_chat_khoi';

export function chatGrades(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter(grade => Number.isInteger(grade) && grade >= 6 && grade <= 12))]
    .sort((a, b) => a - b);
}

function chatMaskComments(source) {
  return source.replace(/(^|[^\\])%[^\r\n]*/gm, (_, prefix) =>
    prefix + ' '.repeat(_.length - prefix.length));
}

function chatBlockRange(source, environment) {
  const re = new RegExp('\\\\(begin|end)\\s*\\{' + environment + '\\}', 'g');
  const markers = [...chatMaskComments(source).matchAll(re)];
  if (!markers.length) return null;
  const [start, end] = markers;
  if (markers.length !== 2 || start[1] !== 'begin' || end[1] !== 'end') {
    return { error: 'Cần đúng một khối ' + environment + ' có đủ lệnh mở và đóng.', start: start.index };
  }
  return { start: start.index, end: end.index + end[0].length };
}

export function inspectChatSource(source, { standalone = false } = {}) {
  const raw = String(source || '');
  const block = chatBlockRange(raw, 'baichat');
  const line = raw.slice(0, block?.start || 0).split(/\r\n|\n|\r/).length;
  const reject = msg => ({ chat: null, block: '', errors: [{ line, msg }], warnings: [] });
  if (!block || block.error) return reject(block?.error || 'Dán một khối \\begin{baichat}…\\end{baichat}.');
  if (standalone && chatMaskComments(raw.slice(0, block.start) + '\n' + raw.slice(block.end)).trim()) {
    return reject('Ô Bản chat chỉ nhận khối baichat.');
  }
  const text = raw.slice(block.start, block.end);
  const parsed = parseBank('\\chude{Bài chat}\n' + text);
  const locate = item => ({ ...item, line: Math.max(line, line + (item.line || 2) - 2) });
  return { chat: parsed.chat, block: text, errors: parsed.errors.map(locate), warnings: parsed.warnings.map(locate) };
}

export function replaceChatBlock(topicSource, chatBlock) {
  const raw = String(topicSource || '');
  const current = chatBlockRange(raw, 'baichat');
  if (current?.error) throw new Error(current.error);
  if (current) return raw.slice(0, current.start) + chatBlock + raw.slice(current.end);

  const old = chatBlockRange(raw, 'lythuyet');
  if (old?.error) throw new Error(old.error);
  const masked = chatMaskComments(raw);
  const heading = /\\chude\s*\{/.exec(masked);
  const end = old?.end ?? (heading && group(masked, heading.index + 6)?.[1]);
  if (!end) throw new Error('Chủ đề cần có \\chude{Tên chủ đề} trước khi thêm bản chat.');
  const newline = raw.includes('\r\n') ? '\r\n' : '\n';
  const suffix = raw.slice(end);
  // Giữ bình luận cuối dòng đi cùng lệnh trước khi chèn.
  const sameLine = /^[ \t]*%[^\r\n]*/.exec(suffix)?.[0] || '';
  const at = end + sameLine.length;
  return raw.slice(0, at) + newline + newline + chatBlock + newline + raw.slice(at);
}
