// Thi đấu: mùa 30 ngày, điểm sau trận, trần điểm mỗi ngày (máy chủ)
import test from 'node:test';
import assert from 'node:assert/strict';
import { seasonOf, rankDelta, accBonus, RANK_DAY_CAP } from '../lib/rank.js';
import { sanitize } from '../lib/validate.js';

test('mùa 30 ngày bắt đầu 23/11/2026', () => {
  assert.equal(seasonOf('2026-11-23').name, 'Mùa 1 (23/11–22/12)');
  assert.equal(seasonOf('2026-12-22').n, 1);
  assert.equal(seasonOf('2026-12-23').name, 'Mùa 2 (23/12–21/01)');
  assert.equal(seasonOf('2026-12-22').left, 1);
});

test('điểm sau trận: bậc cao cần làm tốt hơn, thưởng chính xác', () => {
  assert.deepEqual([accBonus(10, 10), accBonus(9, 10), accBonus(8, 10), accBonus(7, 10)], [6, 4, 2, 0]);
  const mid = { score: 90, max: 180, correct: 6, n: 10 };           // học sinh trung bình: 50% điểm trận
  assert.ok(rankDelta({ ...mid, tier: 0 }).d > 0);                    // Đồng: vẫn lên
  assert.ok(rankDelta({ ...mid, tier: 5 }).d < 0);                    // Cao Thủ: tụt
  assert.equal(rankDelta({ score: 270, max: 270, correct: 10, n: 10, tier: 0 }).d, 30);
  assert.equal(rankDelta({ score: 0, max: 270, correct: 0, n: 10, tier: 7 }).d, -20);
});

const acc = { id: 'a', name: 'Em', khoi: '6' };
const T0 = Date.parse('2026-11-25T03:00:00Z');
test('máy chủ: trần điểm mỗi ngày', () => {
  let d = sanitize(null, { lp: 0, matches: 0 }, acc, T0);
  for (let i = 1; i <= 6; i++) d = sanitize(d, { ...d, lp: d.lp + 30, matches: d.matches + 1 }, acc, T0 + i * 120000);
  assert.equal(d.lp, RANK_DAY_CAP);
  const next = sanitize(d, { ...d, lp: d.lp + 30, matches: d.matches + 1 }, acc, T0 + 864e5);
  assert.equal(next.lp, RANK_DAY_CAP + 30);
});

test('máy chủ: sang mùa mới điểm về 0, gửi mùa cũ cũng không giữ được điểm', () => {
  const old = { ...sanitize(null, { lp: 0 }, acc, T0), lp: 650, season: 'Mùa HK1 2026–2027' };
  const d = sanitize(old, { ...old, lp: 650 }, acc, T0 + 60000);
  assert.equal(d.lp, 0);
  assert.equal(d.season, 'Mùa 1 (23/11–22/12)');
});
