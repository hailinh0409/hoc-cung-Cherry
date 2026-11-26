# Tiến độ: Tải đủ hình của từng màn trước khi học

- Nhánh: `codex/hinh-tung-buoc-muot` · PR #61
- Người đang làm: Codex · 26/11/2026
- Trạng thái: xong, chờ duyệt

## Bắt đầu từ đâu

Mở Toán 7 Bài 9. Màn mở đầu có bốn khung cho nút Đặt ê ke. Kiểm tra `renderLecture`, `lectureScreenImages` và `showWhenReady` trong `hoc-cung-cherry/client/lesson.js`.

## Quyết định đã chốt

Tải và giải mã tất cả hình có sẵn của đúng màn sắp học, gồm các khung và hình trong lời giải hoặc phản hồi của màn đó. Khi sang màn khác mới tải hình của màn mới. Màn không có hình cần tải mở ngay. Hình TikZ chưa được dịch vẫn dùng thông báo sẵn có của bài.

## Đã xong

- [x] Hiện tiến độ tải và chỉ mở thao tác sau khi đủ hình. Có nút Thử lại khi lỗi tải hoặc hết thời gian chờ.
- [x] Chuyển khung tại chỗ, giữ bố cục khi tiến/lùi và khi thu gọn. Nút phóng to dùng đúng khung đang xem.
- [x] Giữ bước cuối của hình sau Kiểm tra. Rút hiệu ứng mờ của hình kiểu cũ từ 400 ms xuống 120 ms.
- [x] Chrome 390×844 với dữ liệu mô phỏng: chỉ có bốn yêu cầu hình của màn mở đầu, màn và tiến độ chờ đến đủ bốn khung. Đã thử lỗi tải, Thử lại và bước cuối sau Kiểm tra. Đã đi đủ 24 màn với các thao tác hình học.

## Đang làm dở

Chờ duyệt, triển khai và kiểm tra trên điện thoại thật.

## Việc tiếp theo

Sau khi gộp và Vercel triển khai, mở lại Toán 7 Bài 9 trên điện thoại. Thử Đặt ê ke và chuyển sang các màn sau trên kết nối chậm.

## File liên quan và cách kiểm tra

- `hoc-cung-cherry/client/lesson.js`, `hoc-cung-cherry/client/lesson.css`, `hoc-cung-cherry/public/app.html`.
- Ghép bằng `node scripts/build-app.mjs`. CI chạy kiểm tra cú pháp, `npm test` và build Next.js với `FAKE_DB=1`. Chưa ghi Supabase.
