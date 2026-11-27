# Tiến độ: G3 — đưa bài chat vào app

- Nhánh: `codex/g3-gan-bai-chat-vao-app` · Issue: #65
- Người đang làm: Codex · Cập nhật lần cuối: 27/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu

Đọc mục 3.3 trong `docs/bai-chat/ke-hoach.md`. Nhánh dựa trên PR #69.

## Mục tiêu

Giáo viên xem, lưu và bật bản chat theo từng khối. Học sinh mở bản chat khi khối đã bật.

## Quyết định đã chốt với thầy

Tính mọi chủ đề đã duyệt của khối. Bài thiếu bản chat tiếp tục dùng lý thuyết cũ.

## Đã xong (đã commit)

- [x] Tách nhánh cho phần kết nối app.

## Đang làm dở

Nối công tắc, khung xem trước, lưu đúng khối và thử hai vai trò với dữ liệu giả.

## Việc tiếp theo

Thử đổi bản trên app rồi dựng trang xem thử G4.

## Còn lại

- [ ] Hoàn thiện mã và chạy kiểm tra.

## File liên quan

- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/lib/chat-source.js`
- `hoc-cung-cherry/app/api/admin/settings/route.js`

## Cách kiểm tra

Chạy `npm test` và app với `FAKE_DB=1`.

## Lưu ý cho người tiếp quản

Chỉ dùng dữ liệu giả khi kiểm tra. Nhánh dùng mã của PR tiền nhiệm để có thể kiểm tra đủ chức năng.
