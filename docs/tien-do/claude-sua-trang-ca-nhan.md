# Tiến độ: Sửa lỗi trang cá nhân trên điện thoại

- Nhánh: `claude/sua-trang-ca-nhan` (PR #28, đã gộp) và `claude/sua-mon-chuyen-toan` (PR #29)
- Người đang làm: Claude · Cập nhật lần cuối: 25/11/2026 13:50
- Trạng thái: #28 đã gộp; #29 xong, chờ thầy duyệt

## Bắt đầu từ đâu
Trang cá nhân được dựng bởi hàm `profile()` / `profile_()` trong `hoc-cung-cherry/client/app.js` (mục "trang cá nhân + thành tích"). Nếu dựng lỗi, trang hiện "Chưa mở được trang cá nhân" kèm nguyên văn lỗi: hỏi thầy chụp màn hình đó là biết lỗi nằm ở đâu. Chạy thử: `cd hoc-cung-cherry && node scripts/build-app.mjs && npm test`.

## Mục tiêu
Thầy báo: bấm vào trang cá nhân trên điện thoại thì trang trắng, chỉ còn tiêu đề; trên máy tính vẫn bình thường.

## Quyết định đã chốt với thầy
- Thầy đồng ý đẩy bản vá lên GitHub (25/11).
- Từ nay mọi thay đổi đều kèm bản bàn giao (AGENTS.md mục 7).

## Đã xong (đã commit)
- [x] PR #28: bọc `profile()` trong try/catch, hiện thông báo lỗi và nút Quay lại thay vì trang trắng; chặn `seasons` sai kiểu — `hoc-cung-cherry/client/app.js`
- [x] PR #29: nguyên nhân thật. Tài khoản có quyền Chuyên Toán mang mã môn `chuyen-toan`, mã này không có trong `MON`, nên `MON[m].n` ở dòng "Khối · Môn" làm sập trang. Nay hiện "Chuyên Toán"; mã lạ hiện nguyên mã. Sửa luôn câu báo "Em chưa đăng kí môn …" (cùng kiểu tra).

## Đang làm dở
- Không có.

## Việc tiếp theo
- Thầy gộp PR #29, rồi mở trang cá nhân trên điện thoại để xác nhận hết lỗi.
- Nên rà các chỗ khác còn tra `MON[...]` trực tiếp theo môn của tài khoản (ví dụ màn chọn môn, quản lý tài khoản) xem có sập với `chuyen-toan` không.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3): build + `npm test` 21 pass, 0 fail.

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/app.js` (hàm `profile`, hằng `MON`, `CHUYEN_TOAN`)
- `hoc-cung-cherry/public/app.html` (file sinh ra, không sửa tay)

## Cách kiểm tra
Giả lập iPhone 14 (Playwright, Chrome và WebKit), API giả trả tài khoản `mon=["toan","chuyen-toan"]`: trang cá nhân hiện "8 · Toán, Chuyên Toán". Trên app thật: đăng nhập tài khoản có quyền Chuyên Toán, bấm avatar ở thanh trên cùng.

## Lưu ý cho người tiếp quản
- Lỗi chỉ hiện trên điện thoại vì điện thoại đăng nhập tài khoản có `chuyen-toan`; máy tính dùng tài khoản khác. Khi "máy này lỗi, máy kia không", nghĩ đến khác tài khoản hoặc khác dữ liệu lưu trên máy (`localStorage`) trước.
- PR #28 bị gộp trước khi commit sửa nguyên nhân thật được đẩy lên, nên phải mở PR #29. Trước khi đẩy thêm vào PR, kiểm tra PR còn mở.
- Không ghi gì lên Supabase trong việc này (chỉ đọc bảng `ltt_accounts`, `ltt_players` để chẩn đoán).
