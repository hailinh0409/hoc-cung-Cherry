# Tiến độ: Khung bài giảng tương tác

- Nhánh: `codex/khung-bai-giang` · PR #57 · Issue #50 và #48
- Người đang làm: Codex · Cập nhật: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu

Đọc `docs/bai-giang/ke-hoach.md`, mở bản thử Bài 9 và xem `renderLecture` trong `hoc-cung-cherry/client/lesson.js`. Mã ghép lại bằng `node scripts/build-app.mjs`.

## Mục tiêu

Bổ sung mục lục, hình chung, Nhắc lại, mở đầu, kết bài và lưu vị trí đang học.

## Quyết định đã chốt

- Hình ở trên khi khung hẹp, sang cột trái khi khung đạt 760 px. Mỗi phần nhớ cách thu gọn hình trong lượt học.
- Lần đầu học các phần mở lần lượt. Giáo viên mở mọi phần. Học xong thì lần sau vào mục lục Ôn lại.
- Bài cũ chia theo lời dẫn, ưu tiên hình TikZ tĩnh đầu tiên của phần nếu phần có nhiều màn.

## Đã xong (đã commit)

- [x] Khung bài giảng và màn Bài học hôm nay có thẻ phần bấm được.
- [x] Hình chung, ưu tiên hình riêng, thu gọn và phóng to; mở đầu và điều khiển hình từng bước; lời giải từng dòng; phản hồi Thử ngay, Kết bài và Em đã học.
- [x] Lưu màn đang dở, trạng thái hoàn thành và tiến độ vào `localStorage` theo bài.
- [x] Bài cũ nhận hình chung mà giữ hình riêng của ví dụ. Bài Tập hợp dựng sẵn và bài mẫu theo chương dùng luồng hiện có.

## Đang làm dở

SVG `cat-tuyen` và các màn thao tác chuyên biệt là bước C (#51). Bản B cho học sinh tiếp tục tại các màn đó trong khi chờ tích hợp.

## Việc tiếp theo

Dùng `paintPin` trong `renderLecture` để tích hợp SVG, sau đó hoàn thiện công cụ giáo viên ở #52. Nạp nội dung thật ở #53 cần duyệt riêng.

## Còn lại

- [x] Ghép giao diện, kiểm tra tự động và kiểm tra trình duyệt.
- [ ] Duyệt và gộp PR #57.

## File liên quan

- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/lesson.css`
- `hoc-cung-cherry/client/app.js`
- `docs/bai-giang/ban-thu-bai9.html`
- `docs/bai-giang/anh-kiem-tra/`

## Cách kiểm tra

- GitHub Actions đã cài gói, ghép giao diện, kiểm tra cú pháp, chạy 44/44 bài kiểm tra và build Next.js với `FAKE_DB=1`.
- Chrome ở 360×640, 390×844 và 1000×800: đi đủ 24 màn mẫu, khóa/mở qua mục lục, mở lại đúng màn, thu gọn, phóng to, Nhắc lại và Ôn lại. Vai trò giáo viên mở mọi phần, dán được bài mẫu vào ô Sửa lý thuyết và thấy khung xem trước.
- Thử bản LaTeX mô phỏng Toán 6 Bài 4 và tình huống hình chung Toán 7 Bài 9 phiên bản cũ. Dữ liệu trình duyệt dùng hình thay thế thử bố cục và mô phỏng vai trò ngay trong app đã ghép, không xác thực vào Supabase.
- Ảnh trong `docs/bai-giang/anh-kiem-tra/` minh họa bố cục và tình huống ảnh ở trên.

## Lưu ý cho người tiếp quản

Chưa ghi dữ liệu Supabase.
