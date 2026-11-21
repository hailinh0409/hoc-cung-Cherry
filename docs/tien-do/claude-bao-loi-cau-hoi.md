# Tiến độ: Học sinh báo lỗi câu hỏi, giáo viên nhận và kiểm tra

- Nhánh: `claude/bao-loi-cau-hoi` · PR: #14
- Người đang làm: Claude · Cập nhật lần cuối: 21/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Mục tiêu
Thầy: "Bổ sung thêm 1 tính năng báo lỗi cho mỗi câu hỏi, nếu học sinh nào báo câu hỏi bị lỗi (lời giải sai hoặc đề sai), câu hỏi đó sẽ được gửi vào tài khoản của giáo viên để giáo viên kiểm tra lại."

## Quyết định đã chốt với thầy
- (Claude tự chọn, chờ thầy duyệt) Nút "Báo lỗi" nằm ở bảng kết quả sau khi trả lời (lúc đó học sinh đã thấy đáp án, lời giải) và ở từng câu tự luận trong đề TL. Không đặt trong lúc làm bài để không ảnh hưởng đồng hồ Thi đấu.
- Loại lỗi: Đề sai / Đáp án hoặc lời giải sai / Lỗi khác (hình, chữ…), kèm ghi chú tuỳ chọn.

## Đã xong (đã commit)
- [x] Máy chủ: bảng SQL, API báo lỗi, API giáo viên, sync (xem mục Còn lại đã đánh dấu)

## Còn lại
- [x] `sql/ltt_reports.sql` — bảng mới, thầy chạy tay trên Supabase
- [x] API học sinh gửi báo lỗi `app/api/report/route.js` (giới hạn 20 lần/ngày, trùng câu thì gộp)
- [x] API giáo viên `app/api/admin/report/route.js` (đã xử lý / mở lại / xoá) + `app/api/sync/route.js` trả danh sách
- [x] Giao diện học sinh: nút Báo lỗi (`client/app.js` hàm `sheetOpen`, `tlDe`)
- [x] Giao diện giáo viên: trang "Câu báo lỗi" ở màn chọn môn
- [x] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/sql/ltt_reports.sql`
- `hoc-cung-cherry/app/api/report/route.js`
- `hoc-cung-cherry/app/api/admin/report/route.js`
- `hoc-cung-cherry/app/api/sync/route.js`
- `hoc-cung-cherry/client/app.js`, `client/real.js`, `client/app2.css`

## Cách kiểm tra
`FAKE_DB=1 … npx next start`: đăng nhập học sinh (seed) làm một màn, bấm Báo lỗi; đăng nhập `thaylinh` / `matkhau123`, mở "Câu báo lỗi".

## Lưu ý cho người tiếp quản
- 21/11/2026: thầy cho phép, Claude đã tạo bảng `ltt_reports` trên Supabase thật (migration `ltt_reports`, RLS bật, chưa có dòng nào).
