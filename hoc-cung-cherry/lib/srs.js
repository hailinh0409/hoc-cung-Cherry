// Lịch ôn ngắt quãng + sổ câu sai + chuỗi ngày học. Ngày tính theo giờ Việt Nam.
export const INTERVALS = [1, 1, 3, 7, 14, 30]; // theo hộp 0..5 (ngày)
const VN = 7 * 3600e3;
export const vnDay = (t = Date.now()) => new Date(t + VN).toISOString().slice(0, 10);
export const addDays = (day, n) => new Date(Date.parse(day + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export const dayDiff = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);

// Cập nhật một dòng ltt_reviews sau một lần trả lời. row = dòng cũ hoặc null.
export function nextReview(row, ok, today = vnDay()) {
  if (!ok) {
    return { box: 0, due: addDays(today, 1), in_notebook: true, nb_hits: 0, last_ok: row?.last_ok ?? null, wrong_count: (row?.wrong_count || 0) + 1 };
  }
  if (!row) return { box: 1, due: addDays(today, INTERVALS[1]), in_notebook: false, nb_hits: 0, last_ok: today, wrong_count: 0 };
  if (row.last_ok === today) return null; // đúng nhiều lần trong cùng một ngày chỉ tính một lần
  const box = Math.min((row.box || 0) + 1, 5);
  // Câu đang ở sổ Câu sai: làm đúng lại chính câu đó (ở bản đồ, đề ôn tập) KHÔNG gạch khỏi sổ, vì có thể chỉ là nhớ đáp án.
  // Chỉ làm đúng câu thay thế trong "Làm lại câu sai" mới gạch (redoResult).
  if (row.in_notebook) return { ...row, box: row.box || 0, last_ok: today, wrong_count: row.wrong_count || 0 };
  return { box, due: addDays(today, INTERVALS[box]), last_ok: today, wrong_count: row.wrong_count || 0, nb_hits: 0, in_notebook: false };
}

// Làm lại câu sai (thầy chốt 28/11/2026): học sinh làm một câu thay thế cùng bài; đúng 1 lần là câu gốc ra khỏi sổ.
// Sai: câu gốc vẫn ở sổ, lần sau đổi câu thay thế khác; nếu bài hết câu mới thì câu gốc chỉ mở lại sau 1 ngày (due).
export function redoResult(row, ok, today = vnDay()) {
  if (ok) return { ...row, in_notebook: false, nb_hits: 1, box: Math.max(1, row.box || 0), due: addDays(today, INTERVALS[1]), last_ok: today };
  return { ...row, in_notebook: true, nb_hits: 0, box: 0, due: addDays(today, 1), wrong_count: (row.wrong_count || 0) + 1 };
}

// Chuỗi ngày học: mỗi ngày đạt mục tiêu (qua 1 màn hoặc làm xong 1 lượt ôn) thì +1.
// Lỡ đúng 1 ngày mà còn lá chắn thì tự dùng lá chắn để giữ chuỗi. Cứ 7 ngày liên tiếp được thêm 1 lá chắn (tối đa 2).
export function nextStreak(p, today = vnDay()) {
  const last = p.last_day ? String(p.last_day).slice(0, 10) : null;
  if (last === today) return null;
  let streak = p.streak || 0, shields = p.shields ?? 1, shieldUsed = false;
  const gap = last ? dayDiff(last, today) : null;
  if (gap === 1) streak += 1;
  else if (gap === 2 && shields > 0) { shields -= 1; streak += 1; shieldUsed = true; }
  else streak = 1;
  if (streak % 7 === 0) shields = Math.min(2, shields + 1);
  return { streak, best_streak: Math.max(p.best_streak || 0, streak), last_day: today, shields, shieldUsed };
}
// Chuỗi đang hiển thị (đã đứt nếu quá 1 ngày mà không có lá chắn)
export function liveStreak(p, today = vnDay()) {
  if (!p.last_day) return 0;
  const gap = dayDiff(String(p.last_day).slice(0, 10), today);
  return gap <= 1 || (gap === 2 && (p.shields || 0) > 0) ? p.streak || 0 : 0;
}
