// Thi đấu: mùa 30 ngày, bậc và thanh tiến trình, bài kiểm tra thăng hạng, điểm phong độ Thách Đấu.
// Dùng chung cho giao diện (scripts/build-app.mjs ghép vào app) và máy chủ (lib/validate.js).
import { vnDay, addDays, dayDiff } from './srs.js';

export const SEASON0 = '2026-11-23';  // ngày bắt đầu Mùa 1
export const SEASON_DAYS = 30;        // mỗi mùa 30 ngày; sang mùa mới tụt SEASON_DROP bậc
export const SEASON_DROP = 2;
export const RANK_UP = 30, RANK_DOWN = 20; // mỗi trận cộng tối đa / trừ tối đa
export const NB_LOCK = 10;            // quá bấy nhiêu câu sai chưa làm lại đúng thì tạm khóa Thi đấu
export const NB_UNLOCK = 5;           // đang khóa: làm lại đến khi còn không quá bấy nhiêu câu sai thì mở lại
export const RANK_WRONG = 1 / 3;      // câu trả lời sai bị trừ 1/3 điểm câu: chọn bừa 1 trong 4 trung bình được 0 điểm
export const RANK_SPEED = 0.15;       // thưởng thời gian tối đa (15% điểm trận), tính theo thời gian còn dư của cả trận

// Bậc: Đồng, Bạc, Vàng, Bạch Kim, Kim Cương, Cao Thủ, Đại Cao Thủ, Thách Đấu.
// Điểm thi đấu (lp) chỉ là thanh tiến trình: ở bậc t, lp chạy từ TIER_LP[t] đến TIER_LP[t+1] (đầy thanh).
// Đầy thanh thì phải làm bài kiểm tra thăng hạng; đạt mới lên bậc. Thách Đấu: lp từ 1200 đến TOP_CAP ("độ vững bậc").
export const TIER_LP = [0, 100, 200, 350, 500, 700, 900, 1200];
export const TOP = TIER_LP.length - 1;
export const TOP_CAP = 1300;
export const tierFromLp = lp => { let t = 0; TIER_LP.forEach((x, i) => { if ((lp || 0) >= x) t = i; }); return t; };
export const tierOfP = p => (p && Number.isInteger(p.tier) ? Math.max(0, Math.min(TOP, p.tier)) : tierFromLp(p && p.lp));
export const capOf = t => (t >= TOP ? TOP_CAP : TIER_LP[t + 1]);
export const barFull = (t, lp) => t < TOP && (lp || 0) >= TIER_LP[t + 1];
export const barPct = (t, lp) => t >= TOP ? Math.round(100 * Math.max(0, Math.min(1, ((lp || 0) - TIER_LP[TOP]) / (TOP_CAP - TIER_LP[TOP]))))
  : Math.round(100 * Math.max(0, Math.min(1, ((lp || 0) - TIER_LP[t]) / (TIER_LP[t + 1] - TIER_LP[t]))));
export const SHIELD = 5;              // vừa lên bậc: 5 trận đầu không bị tụt bậc

// Sau một trận được d điểm: thanh không vượt mốc bậc trên; tụt dưới mốc bậc mình thì xuống bậc (trừ khi đang được bảo vệ).
export function applyMatch({ tier, lp, shield = 0 }, d) {
  let t = tier, x = Math.max(0, (lp || 0) + d);
  x = Math.min(x, capOf(t));
  if (x < TIER_LP[t]) { if (shield > 0) x = TIER_LP[t]; else if (t > 0) t--; }
  return { tier: t, lp: x, shield: Math.max(0, shield - 1), down: t < tier };
}
// Sang mùa mới: tụt SEASON_DROP bậc, thanh tiến trình về đầu bậc
export const seasonStart = tier => { const t = Math.max(0, (tier || 0) - SEASON_DROP); return { tier: t, lp: TIER_LP[t] }; };

// Bài kiểm tra thăng hạng
export const PROMO_N = 12;            // số câu
export const PROMO_PER_DAY = 2;       // mỗi ngày thi tối đa 2 lần
export const PROMO_FAIL = 20;         // trượt: thanh tiến trình lùi 20 điểm
export const promoPass = to => 0.55 + 0.05 * to;          // lên Bạc 60%, mỗi bậc +5%, lên Thách Đấu 90%
export const promoNeed3 = to => (to >= 3 ? 2 : 0);         // từ Bạch Kim: đúng ít nhất 2 câu mức 3 trở lên
// Chấm bài kiểm tra: score là điểm bài (đã trừ câu sai), max là tổng điểm các câu; ok3/n3: số câu mức ≥ 3 đúng / có trong đề.
export function promoResult({ score, max, ok3, n3, to }) {
  const pc = max > 0 ? Math.max(0, score) / max : 0, need3 = Math.min(promoNeed3(to), n3);
  return { pc: Math.round(pc * 100), pass: pc >= promoPass(to) - 1e-9 && ok3 >= need3, need3 };
}

// Thách Đấu: điểm phong độ = trung bình tỉ lệ điểm trận của PD_N trận gần nhất × 1000 (đánh nhiều không tăng điểm)
export const PD_N = 10, PD_MIN = 3;
export const pdOf = h => { const a = (Array.isArray(h) ? h : []).slice(-PD_N).map(Number).filter(Number.isFinite); return a.length ? Math.round(1000 * a.reduce((s, x) => s + Math.max(0, Math.min(1, x)), 0) / a.length) : 0; };

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
