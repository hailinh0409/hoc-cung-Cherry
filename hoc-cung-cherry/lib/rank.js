// Thi đấu: mùa 30 ngày, điểm thi đấu sau mỗi trận, trần điểm mỗi ngày.
// Dùng chung cho giao diện (scripts/build-app.mjs ghép vào app) và máy chủ (lib/validate.js).
import { vnDay, addDays, dayDiff } from './srs.js';

export const SEASON0 = '2026-11-23';  // ngày bắt đầu Mùa 1
export const SEASON_DAYS = 30;        // mỗi mùa 30 ngày; sang mùa mới điểm thi đấu về 0
export const RANK_DAY_CAP = 80;       // trần mềm mỗi ngày: quá bấy nhiêu điểm thì phần cộng thêm chỉ được 1/RANK_OVER_DIV
export const RANK_OVER_DIV = 3;       // sau trần mềm, điểm cộng chỉ còn 1/3 (điểm trừ giữ nguyên)
export const RANK_UP = 30, RANK_DOWN = 20; // mỗi trận cộng tối đa / trừ tối đa
export const NB_LOCK = 10;            // quá bấy nhiêu câu sai chưa làm lại đúng thì tạm khóa Thi đấu
export const NB_UNLOCK = 5;           // đang khóa: làm lại đến khi còn không quá bấy nhiêu câu sai thì mở lại
export const RANK_WRONG = 1 / 3;      // câu trả lời sai bị trừ 1/3 điểm câu: chọn bừa 1 trong 4 trung bình được 0 điểm
export const RANK_SPEED = 0.15;       // thưởng thời gian tối đa (15% điểm trận), tính theo thời gian còn dư của cả trận

// Điểm cộng thực nhận khi hôm nay đã cộng g điểm và trận này được d điểm (d > 0): trần mềm RANK_DAY_CAP.
export function softGain(g, d) {
  if (!(d > 0)) return d;
  const room = Math.max(0, RANK_DAY_CAP - Math.max(0, g)), a = Math.min(d, room);
  return a + Math.floor((d - a) / RANK_OVER_DIV);
}

export function seasonOf(day = vnDay()) {
  const k = Math.max(0, Math.floor(dayDiff(SEASON0, day) / SEASON_DAYS));
  const start = addDays(SEASON0, k * SEASON_DAYS), end = addDays(start, SEASON_DAYS - 1);
  const f = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  return { n: k + 1, start, end, name: `Mùa ${k + 1} (${f(start)}–${f(end)})`, left: dayDiff(day, end) + 1 };
}
export const seasonName = (day = vnDay()) => seasonOf(day).name;

// Mức chuẩn của bậc (tỉ lệ điểm trận so với điểm tối đa): Đồng 40%, mỗi bậc +6%, Thách Đấu 82%.
// Điểm tối đa = điểm các câu × (1 + RANK_SPEED); thưởng thời gian nhỏ nên mức chuẩn chủ yếu đo số câu đúng.
// Câu sai bị trừ điểm (RANK_WRONG) nên mức chuẩn để như cũ: học sinh đúng 60% vẫn lên được ở Đồng, chọn bừa thì tụt.
export const rankTarget = tier => 0.4 + 0.06 * tier;
// Điểm bị trừ khi trả lời sai một câu được pts điểm
export const wrongPenalty = pts => Math.round(pts * RANK_WRONG);
// Thưởng thời gian cuối trận: điểm câu đúng × RANK_SPEED × tỉ lệ thời gian còn dư
export const speedBonus = (score, leftFrac) => Math.round(score * RANK_SPEED * Math.max(0, Math.min(1, leftFrac)));
// Thưởng chính xác theo số câu đúng trong trận
export const accBonus = (correct, n) => { const a = n ? correct / n : 0; return a >= 1 ? 6 : a >= 0.9 ? 4 : a >= 0.8 ? 2 : 0; };

// Điểm thi đấu cộng/trừ sau một trận. score: điểm trận; max: điểm trận tối đa (đúng hết, thật nhanh).
export function rankDelta({ score, max, correct, n, tier }) {
  const r = max > 0 ? score / max : 0;
  const base = Math.max(-RANK_DOWN, Math.min(RANK_UP - 6, Math.round((r - rankTarget(tier)) * 100)));
  const bonus = accBonus(correct, n);
  return { d: Math.min(RANK_UP, base + bonus), base, bonus };
}
