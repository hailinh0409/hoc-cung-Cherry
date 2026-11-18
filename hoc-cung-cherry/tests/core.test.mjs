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
