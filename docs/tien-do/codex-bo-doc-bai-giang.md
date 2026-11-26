# Tiến độ: Bộ đọc cú pháp bài giảng

- Nhánh: `codex/bo-doc-bai-giang` · Issue #49
- Người đang làm: Codex · Cập nhật: 26/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu

Đọc `docs/bai-giang/cu-phap.md` và mở `hoc-cung-cherry/lib/latex.js`. Kiểm tra bằng `npm test` trong thư mục ứng dụng.

## Mục tiêu

Đọc cú pháp bài giảng đã duyệt và trả dữ liệu có cấu trúc cho phần giao diện.

## Quyết định đã chốt

Giữ trường `theory` cho các nơi đang dùng. Thêm `lesson` và `warnings`; chỉ lỗi chặn lưu.

## Đã xong

- [x] Đối chiếu kế hoạch và issue #49 với nhánh main.

## Đang làm dở

Bộ đọc bài giảng và kiểm tra hồi quy.

## Việc tiếp theo

Kiểm tra Bài 9 mẫu, bài cũ, lỗi và cảnh báo. Giao diện và SVG tiếp theo ở #50 và #51 sau khi bộ đọc được gộp.

## Còn lại

- [ ] Chạy kiểm tra theo AGENTS.md.

## File liên quan

- `hoc-cung-cherry/lib/latex.js`
- `docs/bai-giang/k7-b9-bai-giang.tex`
- `docs/bai-giang/ke-hoach.md`

## Cách kiểm tra

Ghép giao diện, chạy kiểm thử và build Next.js với dữ liệu giả.

## Lưu ý cho người tiếp quản

Dùng bài mẫu trong repo để kiểm tra; chưa ghi dữ liệu Supabase.
