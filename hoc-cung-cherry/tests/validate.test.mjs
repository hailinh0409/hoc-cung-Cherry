import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitize, priceOfOwn } from '../lib/validate.js';
import { ITEM } from '../lib/items.js';

const acc = { name: 'An', khoi: '8' };
test('không tự cộng XP vô hạn khi gửi liên tục', () => {
  let d = sanitize(null, { xp: 100 }, acc, 0);
  let t = 1000;
  for (let i = 0; i < 50; i++) d = sanitize(d, { ...d, xp: 999999 }, acc, (t += 1000));
  assert.ok(d.xp < 3000, 'xp=' + d.xp);
});
test('XP tăng hợp lệ được giữ', () => {
  const a = sanitize(null, { xp: 0 }, acc, 0);
  const b = sanitize(a, { ...a, xp: 150 }, acc, 5 * 60000);
  assert.equal(b.xp, 150);
});
test('mua đồ phải đủ XP, đồ đặc biệt cần điều kiện', () => {
  const a = sanitize(null, { xp: 500 }, acc, 0);
  const b = sanitize(a, { ...a, own: { 'hat-len-0': 'x', 'hat-vuongmien-9': 'x', 'hat-cherry': 'x' }, eq: { hat: 'hat-vuongmien-9' } }, acc, 60000);
  assert.ok(b.own['hat-len-0']); assert.ok(!b.own['hat-vuongmien-9']); assert.ok(!b.own['hat-cherry']);
  assert.equal(b.spent, ITEM['hat-len-0'].price); assert.deepEqual(b.eq, {});
  const c = sanitize(b, { ...b, st: { best_streak: 20 }, own: { ...b.own, 'hat-cherry': 'x' } }, acc, 120000);
  assert.ok(c.own['hat-cherry']);
});
test('điểm thi đấu: tối đa +30 mỗi trận', () => {
  const a = sanitize(null, { lp: 0, matches: 0 }, acc, 0);
  const b = sanitize(a, { ...a, lp: 500, matches: 1 }, acc, 60000);
  assert.equal(b.lp, 30);
  const c = sanitize(b, { ...b, lp: 500, matches: 1 }, acc, 120000);
  assert.equal(c.lp, 30);
});
test('không xoá được đồ đã mua để lấy lại XP', () => {
  const a = sanitize(null, { xp: 1000, own: { 'hat-len-0': 'x' } }, acc, 0);
  const b = sanitize(a, { ...a, own: {} }, acc, 60000);
  assert.ok(b.own['hat-len-0']); assert.equal(b.spent, priceOfOwn(b.own));
});
test('gói tin thiếu trường không xoá dữ liệu cũ', () => {
  const a = sanitize(null, { xp: 100, best: { 'x|0': { st: 3 } }, tut: 1 }, acc, 0);
  const b = sanitize(a, { xp: 120 }, acc, 60000);
  assert.deepEqual(b.best, { 'x|0': { st: 3 } }); assert.equal(b.tut, 1);
});
test('theo dõi: không tự theo dõi mình, giữ danh sách', () => {
  const a = sanitize(null, { follow: { me: 'x', b: '2026-11-18' } }, { ...acc, id: 'me' }, 0);
  assert.deepEqual(Object.keys(a.follow), ['b']);
});
