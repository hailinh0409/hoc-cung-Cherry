# Tiến độ: G1 — bộ đọc bài chat

- Nhánh: `codex/g1-bo-doc-bai-chat` · Issue: #63
- Người đang làm: Codex · Cập nhật lần cuối: 27/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu

Đọc `docs/bai-chat/ke-hoach.md` mục 3.1 và `docs/bai-chat/cu-phap.md`. Mở `hoc-cung-cherry/lib/latex.js` tại `parseLesson` và `parseBank`.

## Mục tiêu

Đọc và kiểm tra khối `baichat` cùng các lệnh và tham số hình mới.

## Quyết định đã chốt với thầy

Khối chat nằm cạnh khối lý thuyết cũ. Hai bài mẫu đại số và hình học dùng để kiểm tra tương thích.

## Đã xong (đã commit)

- [x] Kiểm tra các issue và PR đang mở, tạo nhánh từ `main`.

## Đang làm dở

Tích hợp cú pháp chat vào bộ đọc bài giảng và chuẩn bị kiểm tra tự động.

## Việc tiếp theo

Hoàn thành G1, sau đó dùng dữ liệu đã đọc trong giao diện G2 (#64).

## Còn lại

- [ ] Bộ đọc và kiểm tra cú pháp mới.
- [ ] Kiểm tra hai bài mẫu, chạy kiểm thử và build.

## File liên quan

- `hoc-cung-cherry/lib/latex.js`
- `docs/bai-chat/k7-chuyen-ve.tex`
- `docs/bai-giang/k7-b9-bai-giang.tex`

## Cách kiểm tra

Chạy `npm test` trong `hoc-cung-cherry`.

## Lưu ý cho người tiếp quản

Chỉ làm trên mã nguồn và dữ liệu giả.
