# Tiến độ: Thi đấu — trần mềm, giờ cả trận, bỏ qua câu, mở khóa ≤ 5 câu sai, trừ điểm câu sai

- Nhánh: `claude/thi-dau-gio-ca-tran` · PR: #31
- Người đang làm: Claude · Cập nhật lần cuối: 25/11/2026 16:00
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã làm xong cả 4 yêu cầu. Luật điểm nằm ở `hoc-cung-cherry/lib/rank.js` (`softGain`, `speedBonus`, `rankTarget`, `NB_UNLOCK`); đồng hồ cả trận và nút bỏ qua ở `client/app.js` (`qLim`, `timeLeft`, `pauseTimer`, `startTimer`, `#skipB`, `finish`). Chạy thử: `npm test`, rồi `FAKE_DB=1 … npx next start`, học sinh mẫu "Học sinh thử" / 0000, vào Toán › Khối 6 › Thi đấu.

## Mục tiêu
Thầy yêu cầu (25/11/2026):
1. Trần mềm: sau 80 điểm mỗi ngày thì chỉ còn nhận 1/3 số điểm (vẫn chống cày).
2. Chuyển sang giờ cả trận.
3. Cho bỏ qua câu và quay lại làm sau (nếu chưa chọn đáp án).
4. Luật dọn câu sai: mở lại khi trong kho còn không quá 5 câu sai.
5. (15:46) Chống bấm bừa: phạt trừ điểm câu sai, đặc biệt phần Thi đấu ("làm đúng nhiều đã có thưởng điểm rồi").

## Quyết định đã chốt với thầy
- Quá 80 điểm/ngày: điểm **cộng** chỉ nhận 1/3 (làm tròn xuống). Điểm **trừ** giữ nguyên (Claude chọn, thầy có thể đổi).
- Thời gian cả trận = tổng thời gian chuẩn cũ của từng câu (30/45/60/90 giây theo mức, cộng thêm cho đúng/sai, nối ý, sắp xếp, sơ đồ). Đồng hồ **dừng khi học sinh đọc lời giải**.
- Hết giờ: câu đang làm tính sai (vào kho câu sai như trước); các câu chưa mở/đã bỏ qua tính sai trong điểm trận nhưng **không** đưa vào kho câu sai.
- Điểm trận: câu đúng được điểm cố định theo mức (10/15/20/30), không còn thưởng tốc độ từng câu. Cuối trận thưởng thời gian = điểm trận × 15% × tỉ lệ thời gian còn dư.
- Thi đấu: câu trả lời sai (mọi dạng) bị trừ 1/3 điểm câu (mức 1: −3, mức 2: −5, mức 3: −7, mức 4: −10) → chọn bừa 1 trong 4 trung bình được 0 điểm. Không trừ: câu đúng một phần (sắp xếp, sơ đồ), câu hết giờ/chưa trả lời. Điểm trận cuối trận không âm.
- Mức chuẩn bậc giữ 40% + 6%/bậc (Thách Đấu 82%): điểm tối đa giờ là ×1,15 (thưởng thời gian) và câu sai bị trừ, nên học sinh đúng 6/10 vẫn lên được ở Đồng, chọn bừa thì tụt.
- Bản đồ (Hành trình) **chưa** trừ điểm: đó là chỗ học, sai là bình thường; nếu cần chống cày XP ở đó thì dùng luật "trả lời quá nhanh không được XP" (chưa làm, chờ thầy).
- Bỏ qua: câu chuyển xuống cuối trận, có nhãn "Câu làm sau"; bỏ qua được nhiều lần; nút ẩn khi chỉ còn một câu.
- Khóa Thi đấu: vẫn khóa khi > 10 câu sai; mở lại khi còn ≤ 5 câu.

## Đã xong (đã commit)
- [x] Trần mềm ở máy khách và máy chủ — `lib/rank.js` (`softGain`), `lib/validate.js`, `client/app.js` (`finish`)
- [x] Đồng hồ cả trận, dừng khi xem lời giải, hết giờ kết thúc trận — `client/app.js`
- [x] Nút "Bỏ qua, làm sau" + đếm "n câu làm sau" ở thanh trên — `client/app.js`
- [x] Mở khóa khi ≤ 5 câu sai, sửa mọi dòng chữ liên quan — `client/app.js`, `lib/rank.js`
- [x] Cập nhật luật thi đấu trên màn Thi đấu và hộp "Sẵn sàng?"
- [x] Trừ 1/3 điểm câu khi trả lời sai ở Thi đấu — `lib/rank.js` (`RANK_WRONG`, `wrongPenalty`), `client/app.js` (`result`, `finish`, luật)
- [x] Kiểm thử `tests/rank.test.mjs` (trần mềm, thưởng thời gian, máy chủ chặn gian lận)

## Đang làm dở
- không có

## Việc tiếp theo
- Đề xuất đã bàn, chưa làm: ghi thời gian làm từng câu (bảng Supabase mới, cần SQL cho thầy duyệt), báo cáo "nghi bấm bừa" cho giáo viên, câu trả lời quá nhanh không được XP ở bản đồ.
- Thầy thử trên điện thoại một trận thật: bỏ qua câu, đọc lời giải (đồng hồ phải đứng), xem điểm cuối trận.
- Theo dõi vài ngày: nếu học sinh trung bình kẹt quá thấp hoặc lên quá nhanh, chỉnh `rankTarget` trong `lib/rank.js`.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/rank.js`
- `hoc-cung-cherry/lib/validate.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/tests/rank.test.mjs`
- `hoc-cung-cherry/public/app.html` (file sinh ra)

## Cách kiểm tra
- `npm test` → 23/23 đạt.
- Chạy thử: chọn sai câu mức 1 → "Chưa đúng rồi −3", điểm trận −3.
- `FAKE_DB=1 SESSION_SECRET=… npx next build` → thành công.
- Chạy thử 390×844, học sinh "Học sinh thử" / 0000: hộp "Sẵn sàng?" ghi "6:15 cho cả trận"; bỏ qua 2 câu → thanh trên ghi "Câu 1/10 · 2 câu làm sau"; tua hết giờ → "Hết giờ cả trận! Còn 9 câu chưa làm, tính là sai" → kết quả 0/10. Không có lỗi JavaScript.

## Lưu ý cho người tiếp quản
- Máy chủ đếm điểm đã cộng trong ngày theo mức tăng ròng (`_lpd`), máy khách đếm ở `P.lpd`; hai chỗ dùng chung `softGain` (làm tròn xuống) nên máy khách không bao giờ vượt mức máy chủ cho phép.
- Không ghi gì lên Supabase.
