# Tiến độ: G4 — trang xem thử bài chat

- Nhánh: `codex/g4-trang-xem-thu-bai-chat` · Issue: #66
- Người đang làm: Codex · Cập nhật lần cuối: 27/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu

Chạy `node scripts/build-xem-thu.mjs` trong `hoc-cung-cherry/`. Mở `xem-thu/index.html` rồi dán mã.

## Mục tiêu

Dựng một trang HTML tự chứa để kiểm tra và sao chép bài chat trước khi dán lên app.

## Quyết định đã chốt với thầy

Dùng cùng bộ đọc và trình hiển thị với app. Hình TikZ dùng khung giữ chỗ trong bản xem thử.

## Đã xong (đã commit)

- [x] Tách nhánh riêng để duyệt trang xem thử.

## Đang làm dở

Đưa trình dựng, bản HTML và bước kiểm tra vào GitHub.

## Việc tiếp theo

Sau khi PR được gộp, Claude đăng HTML lên Artifact.

## Còn lại

- [ ] Hoàn thiện mã và chạy kiểm tra.

## File liên quan

- `hoc-cung-cherry/scripts/build-xem-thu.mjs`
- `hoc-cung-cherry/xem-thu/index.html`
- `.github/workflows/kiem-tra.yml`

## Cách kiểm tra

Mở trang HTML với hai bài mẫu, bật thử, sao chép và tải lại.

## Lưu ý cho người tiếp quản

Chỉ dùng dữ liệu giả khi kiểm tra. Nhánh dùng mã của PR tiền nhiệm để có thể kiểm tra đủ chức năng.
