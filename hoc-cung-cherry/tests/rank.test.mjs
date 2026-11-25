// Thi đấu: mùa 30 ngày, điểm sau trận, trần điểm mỗi ngày (máy chủ)
import test from 'node:test';
import assert from 'node:assert/strict';
import { seasonOf, rankDelta, accBonus, speedBonus, wrongPenalty, rankTarget, applyMatch, seasonStart, barFull, barPct, promoResult, promoPass, pdOf, tierOfP } from '../lib/rank.js';
import { sanitize } from '../lib/validate.js';

test('mùa 30 ngày bắt đầu 23/11/2026', () => {
  assert.equal(seasonOf('2026-11-23').name, 'Mùa 1 (23/11–22/12)');
  assert.equal(seasonOf('2026-12-22').n, 1);
  assert.equal(seasonOf('2026-12-23').name, 'Mùa 2 (23/12–21/01)');
  assert.equal(seasonOf('2026-12-22').left, 1);
});

test('điểm sau trận: bậc cao cần làm tốt hơn, thưởng chính xác', () => {
  assert.deepEqual([accBonus(10, 10), accBonus(9, 10), accBonus(8, 10), accBonus(7, 10)], [6, 4, 2, 0]);
  const mid = { score: 95, max: 180, correct: 6, n: 10 };           // học sinh trung bình: khoảng 53% điểm trận
  assert.ok(rankDelta({ ...mid, tier: 0 }).d > 0);                    // Đồng: vẫn lên
  assert.ok(rankDelta({ ...mid, tier: 5 }).d < 0);                    // Cao Thủ: tụt
  assert.equal(rankDelta({ score: 270, max: 270, correct: 10, n: 10, tier: 0 }).d, 30);
  assert.equal(rankDelta({ score: 0, max: 270, correct: 0, n: 10, tier: 7 }).d, -20);
});

const acc = { id: 'a', name: 'Em', khoi: '6' };
const T0 = Date.parse('2026-11-25T03:00:00Z');
test('thưởng thời gian', () => {
  assert.equal(speedBonus(100, 0.5), 8);       // 15% × 50% thời gian còn dư
  assert.equal(speedBonus(100, 0), 0);
});

test('thanh tiến trình: không vượt mốc, tụt dưới mốc thì xuống bậc, được bảo vệ sau khi lên bậc', () => {
  assert.deepEqual(applyMatch({ tier: 1, lp: 190 }, 30), { tier: 1, lp: 200, shield: 0, down: false }); // Bạc: dừng ở mốc Vàng
  assert.ok(barFull(1, 200) && !barFull(1, 199));
  assert.deepEqual(applyMatch({ tier: 2, lp: 205 }, -20), { tier: 1, lp: 185, shield: 0, down: true });
  assert.deepEqual(applyMatch({ tier: 2, lp: 205, shield: 3 }, -20), { tier: 2, lp: 200, shield: 2, down: false });
  assert.equal(applyMatch({ tier: 0, lp: 5 }, -20).lp, 0);
  assert.equal(applyMatch({ tier: 7, lp: 1290 }, 30).lp, 1300); // Thách Đấu: độ vững tối đa
  assert.equal(barPct(3, 425), 50);
});

test('mùa mới tụt 2 bậc; dữ liệu cũ suy bậc từ điểm', () => {
  assert.deepEqual(seasonStart(5), { tier: 3, lp: 350 });
  assert.deepEqual(seasonStart(1), { tier: 0, lp: 0 });
  assert.equal(tierOfP({ lp: 650 }), 4);
  assert.equal(tierOfP({ lp: 650, tier: 2 }), 2);
});

test('bài kiểm tra thăng hạng: mức đạt tăng dần, từ Bạch Kim cần 2 câu mức 3', () => {
  assert.equal(Math.round(promoPass(1) * 100), 60);
  assert.equal(Math.round(promoPass(7) * 100), 90);
  assert.ok(promoResult({ score: 60, max: 100, ok3: 0, n3: 0, to: 1 }).pass);
  assert.ok(!promoResult({ score: 59, max: 100, ok3: 0, n3: 0, to: 1 }).pass);
  assert.ok(!promoResult({ score: 90, max: 100, ok3: 1, n3: 4, to: 3 }).pass);   // thiếu câu mức 3
  assert.ok(promoResult({ score: 90, max: 100, ok3: 1, n3: 1, to: 3 }).pass);    // đề chỉ có 1 câu mức 3
  assert.equal(promoResult({ score: -10, max: 100, ok3: 0, n3: 0, to: 1 }).pc, 0);
});

test('điểm phong độ Thách Đấu: trung bình 10 trận gần nhất', () => {
  assert.equal(pdOf([0.5, 0.7]), 600);
  assert.equal(pdOf([...Array(20).fill(0.2), ...Array(10).fill(0.9)]), 900);
  assert.equal(pdOf([]), 0);
});

test('máy chủ: không trần ngày, không vượt mốc khi chưa thi, mỗi trận lên tối đa 1 bậc', () => {
  let d = sanitize(null, { lp: 0, matches: 0 }, acc, T0);
  for (let i = 1; i <= 6; i++) d = sanitize(d, { ...d, lp: d.lp + 30, matches: d.matches + 1 }, acc, T0 + i * 120000);
  assert.equal(d.lp, 100); assert.equal(d.tier, 0);         // Đồng: dừng ở mốc Bạc
  d = sanitize(d, { ...d, tier: 3, lp: 400, matches: d.matches + 1 }, acc, T0 + 7 * 120000);
  assert.equal(d.tier, 1); assert.equal(d.lp, 130);
  const old = { ...sanitize(null, { lp: 0 }, acc, T0), lp: 760, tier: 5, season: 'Mùa cũ' };
  const s2 = sanitize(old, { ...old }, acc, T0 + 60000);
  assert.equal(s2.tier, 3); assert.equal(s2.lp, 350);
});

test('trừ điểm câu sai: chọn bừa trung bình được 0 điểm và bị tụt hạng', () => {
  assert.deepEqual([10, 15, 20, 30].map(wrongPenalty), [3, 5, 7, 10]);
  // 40 câu mức 1 chọn bừa: đúng 10 câu, sai 30 câu
  const guess = 10 * 10 - 30 * wrongPenalty(10);
  assert.ok(guess <= 10);
  assert.ok(rankDelta({ score: Math.max(0, guess / 4), max: 115, correct: 2, n: 10, tier: 0 }).d < 0);
  // học sinh đúng 6/10 câu mức 1 vẫn được cộng ở Đồng
  const s6 = 6 * 10 - 4 * wrongPenalty(10);
  assert.ok(s6 / 115 >= rankTarget(0));
});

test('máy chủ: sang mùa mới tụt 2 bậc, gửi mùa cũ cũng không giữ được điểm', () => {
  const old = { ...sanitize(null, { lp: 0 }, acc, T0), lp: 650, season: 'Mùa HK1 2026–2027' };
  delete old.tier;                                                     // dữ liệu cũ chưa có bậc riêng: suy từ điểm (650 → Kim Cương)
  const d = sanitize(old, { ...old, lp: 650 }, acc, T0 + 60000);
  assert.equal(d.tier, 2); assert.equal(d.lp, 200);
  assert.equal(d.season, 'Mùa 1 (23/11–22/12)');
});
