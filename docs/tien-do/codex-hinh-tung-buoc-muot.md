# Tiến độ: Chuyển hình từng bước mượt hơn

- Nhánh: `codex/hinh-tung-buoc-muot` · PR #61
- Người đang làm: Codex · 26/11/2026
- Trạng thái: xong, chờ duyệt

## Bắt đầu từ đâu

Mở Toán 7 Bài 9 và bấm Đặt ê ke. Kiểm tra `renderLecture` trong `hoc-cung-cherry/client/lesson.js`.

## Mục tiêu và nguyên nhân

Mỗi lần bấm từng bước trước đây tạo lại vùng hình và gắn một ảnh mới. Khi ảnh chưa tải, hình cũ biến mất và bố cục có thể nhảy.

## Đã xong

- [x] Tải và giải mã trước các khung của màn đang mở. Khi bấm sớm, đợi hình đích tải xong rồi đổi cả hình lẫn lời dẫn.
- [x] Chuyển khung tại chỗ, giữ bố cục. Thu gọn không xóa vùng hình và phóng to dùng đúng ảnh đang hiện.
- [x] Giữ bước cuối của hình sau khi chọn Kiểm tra. Rút hiệu ứng mờ của hình kiểu cũ từ 400 ms xuống 120 ms.
- [x] Ghép lại giao diện và kiểm tra Bài 9 ở 390×844 bằng Chrome với dữ liệu mô phỏng. Đã chặn phản hồi các khung sau để xác nhận hình đầu vẫn giữ nguyên khi bấm sớm. Sau khi tải xong, hình và lời dẫn đổi trong cùng lượt bấm. Kiểm tra Lùi, thu gọn, phóng to và bước cuối sau Kiểm tra, cùng luồng đủ 24 màn.

## Đang làm dở

Chờ duyệt PR và triển khai.

## Việc tiếp theo

Sau khi gộp và Vercel triển khai, thử Đặt ê ke ở Bài 9 trên điện thoại thật, mở mới từ kết nối chậm. Bản thử Chrome dùng app đã ghép và vai trò mô phỏng.

## File liên quan

- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/lesson.css`
- `hoc-cung-cherry/public/app.html`

## Cách kiểm tra

`node scripts/build-app.mjs`, kiểm tra cú pháp bản ghép, `npm test` và build Next.js với `FAKE_DB=1`. Chưa ghi Supabase.
