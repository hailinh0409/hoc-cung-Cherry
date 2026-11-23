// Thi đấu: mùa 30 ngày, điểm thi đấu sau mỗi trận, trần điểm mỗi ngày.
// Dùng chung cho giao diện (scripts/build-app.mjs ghép vào app) và máy chủ (lib/validate.js).
import { vnDay, addDays, dayDiff } from './srs.js';

export const SEASON0 = '2026-11-23';  // ngày bắt đầu Mùa 1
export const SEASON_DAYS = 30;        // mỗi mùa 30 ngày; sang mùa mới điểm thi đấu về 0
export const RANK_DAY_CAP = 80;       // mỗi ngày cộng tối đa bấy nhiêu điểm thi đấu
export const RANK_UP = 30, RANK_DOWN = 20; // mỗi trận cộng tối đa / trừ tối đa
export const NB_LOCK = 10;            // quá bấy nhiêu câu sai chưa làm lại đúng thì tạm khóa Thi đấu

export function seasonOf(day = vnDay()) {
  const k = Math.max(0, Math.floor(dayDiff(SEASON0, day) / SEASON_DAYS));
  const start = addDays(SEASON0, k * SEASON_DAYS), end = addDays(start, SEASON_DAYS - 1);
  const f = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  return { n: k + 1, start, end, name: `Mùa ${k + 1} (${f(start)}–${f(end)})`, left: dayDiff(day, end) + 1 };
}
export const seasonName = (day = vnDay()) => seasonOf(day).name;

// Mức chuẩn của bậc (tỉ lệ điểm trận so với điểm tối đa): Đồng 40%, mỗi bậc +6%, Thách Đấu 82%.
export const rankTarget = tier => 0.4 + 0.06 * tier;
// Thưởng chính xác theo số câu đúng trong trận
export const accBonus = (correct, n) => { const a = n ? correct / n : 0; return a >= 1 ? 6 : a >= 0.9 ? 4 : a >= 0.8 ? 2 : 0; };

// Điểm thi đấu cộng/trừ sau một trận. score: điểm trận; max: điểm trận tối đa (đúng hết, thật nhanh).
export function rankDelta({ score, max, correct, n, tier }) {
  const r = max > 0 ? score / max : 0;
  const base = Math.max(-RANK_DOWN, Math.min(RANK_UP - 6, Math.round((r - rankTarget(tier)) * 100)));
  const bonus = accBonus(correct, n);
  return { d: Math.min(RANK_UP, base + bonus), base, bonus };
}
