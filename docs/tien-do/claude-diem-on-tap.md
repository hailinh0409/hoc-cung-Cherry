# Tiến độ: Gửi điểm ôn tập về tài khoản giáo viên

- Nhánh: `claude/diem-on-tap` · PR: #32
- Người đang làm: Claude · Cập nhật lần cuối: 25/11/2026 16:05
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã xong. Giáo viên xem điểm ở Toán › Khối › Theo dõi › mục "Điểm ôn tập". Mã chính trong `hoc-cung-cherry/client/app.js`: `deList`, `deCell`, `deScores`, `deHistBox` (ngay trên `parentReport`), phần `G.mode==='de'` trong `finish`, `pushMine` và `mergeP`.

## Mục tiêu
Thầy (25/11/2026): "Phần ôn tập điểm chưa được gửi về tài khoản giáo viên, phần này cần triển khai."

## Quyết định đã chốt với thầy
- (Claude chọn) Ô điểm hiện **điểm cao nhất**, dòng nhỏ dưới là **điểm lần đầu** và **số lần làm**; bấm vào điểm xem từng lần (ngày giờ, điểm, số câu đúng, thời gian).
- Đề tự luận (TL): chỉ hiện ✓ khi học sinh bấm "Đã làm xong" (bài làm trong vở).
- Báo cáo phụ huynh (bấm tên học sinh) có thêm dòng điểm 5 đề trắc nghiệm gần nhất.
- Đề Chuyên Toán (chỉ có tự luận, nhiều khối dùng chung) chưa đưa vào bảng.

## Đã xong (đã commit)
- [x] Sửa lỗi: đề dưới 50% không được gửi lên máy chủ (vì chỉ gửi các đề có sao). Nay gửi mọi đề đã làm — `pushMine`, `finish`
- [x] Ghi lịch sử 10 lần làm gần nhất mỗi đề (`P.deh`), đồng bộ lên máy chủ và gộp khi đăng nhập máy khác — `finish`, `pushMine`, `mergeP`, `newP`
- [x] Bảng "Điểm ôn tập" ở Theo dõi khối + hàng "Cả khối" (điểm TB / số em đã làm TL) — `deScores`
- [x] Hộp xem từng lần làm — `deHistBox`; CSS `client/app1.css`
- [x] Báo cáo phụ huynh có điểm ôn tập — `parentReport`

## Đang làm dở
- không có

## Việc tiếp theo
- Học sinh đã làm đề trước bản này: điểm cao nhất vẫn hiện (nếu ≥ 50%, hoặc sau khi app em gửi lại), nhưng chưa có lịch sử từng lần.
- Ý tưởng đang bàn, chưa làm: bài kiểm tra thăng hạng trong Thi đấu.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/app1.css`
- `hoc-cung-cherry/public/app.html` (file sinh ra)

## Cách kiểm tra
- `npm test` → 21/21 đạt; `FAKE_DB=1 … npx next build` thành công.
- Chạy thử 390×844: học sinh "Trần Thị Bình" / 1234 (khối 8) làm TN1 "Ôn tập học kì I" được 0% → đăng nhập `thaylinh` / `matkhau123`, Toán › Khối 8 › Theo dõi: thấy ô đỏ "0% · 1 lần", bấm vào thấy "Lần 1 · 25-11 15:59: 0% (0/2 câu, 0:03)". Không có lỗi JavaScript.

## Lưu ý cho người tiếp quản
- Máy chủ (`lib/validate.js`) giữ nguyên mọi trường lạ khi gộp, nên `deh` được lưu mà không cần sửa máy chủ. Giáo viên nhận toàn bộ dữ liệu học sinh qua `/api/sync`; học sinh khác chỉ thấy `publicOf` (không có điểm ôn tập).
- Không ghi gì lên Supabase.
