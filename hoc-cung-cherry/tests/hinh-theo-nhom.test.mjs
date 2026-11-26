// Hỏi bảng hình theo từng nhóm (lỗi 26/11/2026: ~730 mã hình trong một yêu cầu bị Supabase trả 400,
// tài khoản giáo viên mất hết hình).
import test from 'node:test';
import assert from 'node:assert/strict';
import { figRows, FIG_BATCH } from '../lib/figcode.js';

// Bảng giả: nhớ số mã của mỗi lần hỏi; quá 650 mã thì báo lỗi như Supabase thật.
function fakeDb(have, failAt = Infinity) {
  const calls = [];
  return {
    calls,
    from: () => ({ select: () => ({ in: async (_col, list) => {
      calls.push(list.length);
      if (list.length > 650 || calls.length >= failAt) return { data: null, error: { message: 'Bad Request' } };
      return { data: list.filter(h => have.has(h)).map(hash => ({ hash, error: null })), error: null };
    } }) }),
  };
}

test('730 mã hình: hỏi thành nhiều nhóm, không nhóm nào quá giới hạn, lấy đủ hình', async () => {
  const hashes = Array.from({ length: 730 }, (_, i) => 'h' + i), db = fakeDb(new Set(hashes));
  const rows = await figRows(db, hashes);
  assert.equal(rows.length, 730);
  assert.ok(db.calls.every(n => n <= FIG_BATCH));
  assert.equal(db.calls.length, Math.ceil(730 / FIG_BATCH));
});

test('mã trùng chỉ hỏi một lần; danh sách rỗng không gọi Supabase', async () => {
  const db = fakeDb(new Set(['a']));
  assert.deepEqual((await figRows(db, ['a', 'a', 'b'])).map(r => r.hash), ['a']);
  assert.deepEqual(db.calls, [2]);
  const db2 = fakeDb(new Set());
  assert.deepEqual(await figRows(db2, []), []);
  assert.equal(db2.calls.length, 0);
});

test('Supabase báo lỗi thì ném lỗi, không lặng lẽ coi như chưa có hình', async () => {
  const hashes = Array.from({ length: 450 }, (_, i) => 'h' + i);
  await assert.rejects(figRows(fakeDb(new Set(hashes), 2), hashes), /ltt_figures/);
});
