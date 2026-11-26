# Tiến độ: Khung bài giảng tương tác

- Nhánh: `codex/khung-bai-giang` · Issue #50
- Người đang làm: Codex · Cập nhật: 26/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu

Đọc `docs/bai-giang/ke-hoach.md`, mở bản thử Bài 9 và xem `hoc-cung-cherry/client/lesson.js`. Bộ đọc issue #49 đã có trên main.

## Mục tiêu

Dựng bài giảng với mục lục, hình chung, nhắc lại, tiến độ và chế độ ôn lại. Dùng thử với bài mới, bài cũ và tài khoản giáo viên.

## Quyết định đã chốt

- Bám bản thử đã duyệt. Màn rộng từ 760 px bố trí hình trái, nội dung phải.
- Bước B thay issue #48. Tương tác SVG chuyên biệt thuộc bước C.
- Tiến độ lưu trên thiết bị; giáo viên được mở mọi phần.

## Đã xong

- [x] Xác minh PR #56 đã gộp và không có PR đang làm trùng.

## Đang làm dở

Viết khung giao diện và kiểm tra dữ liệu mẫu.

## Việc tiếp theo

Hoàn tất khung và kiểm tra theo issue #50. Tích hợp hình SVG ở issue #51 và công cụ giáo viên ở #52.

## Còn lại

- [ ] Ghép giao diện, kiểm thử và chạy với dữ liệu giả.

## File liên quan

- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/lesson.css`
- `docs/bai-giang/ban-thu-bai9.html`
- `docs/bai-giang/k7-b9-bai-giang.tex`

## Cách kiểm tra

`npm test`, ghép giao diện, build với `FAKE_DB=1` và thử ở 360×640, 390×844, 1000×800.

## Lưu ý cho người tiếp quản

Dùng dữ liệu mẫu; chưa ghi dữ liệu Supabase.
