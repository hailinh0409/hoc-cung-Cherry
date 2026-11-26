# Tiến độ: Tăng cỡ chữ và làm gọn màn lý thuyết

- Nhánh: `codex/chu-de-doc-ly-thuyet` · PR #62
- Người đang làm: Codex · 26/11/2026
- Trạng thái: xong, chờ duyệt

## Bắt đầu từ đâu

Mở Toán 7 Bài 9 và thử Mở đầu, Thử ngay và màn Tính chất. Xem `lectureReadHTML` và `renderLecture` trong `hoc-cung-cherry/client/lesson.js`.

## Mục tiêu

Ưu tiên câu hỏi và thao tác, tăng cỡ chữ phần chính, trình bày các ý kiến thức dễ quét trên điện thoại.

## Đã xong

- [x] Chữ nội dung 19 px, câu hỏi 21 px, phương án 18 px.
- [x] Câu hỏi và phương án lên trước. Lời dẫn Cherry của câu hỏi mới có thể mở khi cần. Các màn yêu cầu chạm hình vẫn hiện lời chỉ dẫn.
- [x] Các dòng do người soạn ngắt được trình bày riêng. Dòng bắt đầu bằng dấu đầu dòng hiện thành danh sách.
- [x] Điều khiển hình từng bước nằm trước chú thích. Hình tĩnh chiếm ít chiều cao hơn trên khung hẹp; hình đang chờ chạm giữ kích thước vùng chạm.

## Kiểm tra

Đã kiểm tra trong Chrome với dữ liệu mô phỏng tại 360×640, 390×844 và 1000×800. Xác nhận cỡ chữ, đóng/mở lời dẫn, trả lời, bài phát biểu có đủ hai ý và hình có đủ tám vùng chạm. Các phép kiểm tra tự động và build dùng GitHub Actions.

## Đang làm dở và việc tiếp theo

Chờ gộp PR và thử trên điện thoại thật. Phần nội dung bài hiện hành vẫn có thể chỉnh riêng qua trình soạn bài nếu giáo viên muốn rút ngắn từng câu.

## File liên quan

- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/lesson.css`
- `hoc-cung-cherry/public/app.html`
