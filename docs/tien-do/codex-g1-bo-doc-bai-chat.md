# Tiến độ: G1 — bộ đọc bài chat

- Nhánh: `codex/g1-bo-doc-bai-chat` · PR: #68 · Issue: #63
- Người đang làm: Codex · Cập nhật lần cuối: 27/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu

Đọc `docs/bai-chat/ke-hoach.md` mục 3.1 và `docs/bai-chat/cu-phap.md`. Mở `hoc-cung-cherry/lib/latex.js` tại `parseLesson` và `parseBank`. Các ca mẫu nằm trong `tests/bai-chat.test.mjs`.

## Mục tiêu

Đọc và kiểm tra khối `baichat`, các lệnh tương tác và tham số hình mới, đồng thời giữ cách đọc bài cũ.

## Quyết định đã chốt với thầy

Khối chat nằm cạnh khối lý thuyết cũ. Hai bài mẫu đại số và hình học dùng để kiểm tra tương thích.

## Đã xong (đã commit)

- [x] Đọc khối chat và chuẩn hóa phương án cho giao diện.
- [x] Đọc hình cân, đẳng thức và trạng thái từng bước. Báo dòng có lỗi hoặc cảnh báo.
- [x] Kiểm tra bài mẫu chuyển vế và khả năng đọc bài hình học từ cú pháp bài giảng.

## Đang làm dở

Không có trong G1.

## Việc tiếp theo

G2 (#64) dùng `parseBank(...).chat` để dựng dòng chat và hai hình mẫu. Bài hình học cũ đọc được và có cảnh báo theo quy tắc viết chat mới.

## Còn lại

- [ ] Thầy duyệt PR.

## File liên quan

- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/tests/bai-chat.test.mjs`
- `docs/bai-chat/k7-chuyen-ve.tex`
- `docs/bai-giang/k7-b9-bai-giang.tex`

## Cách kiểm tra

Trong `hoc-cung-cherry`: `npm ci`, `npm test` (50/50) và `next build` với `FAKE_DB=1`.

## Lưu ý cho người tiếp quản

Cấu trúc cũ của `lesson` được giữ cho giao diện bài giảng. Chưa ghi dữ liệu lên Supabase.

