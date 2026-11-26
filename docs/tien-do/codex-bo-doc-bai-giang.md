# Tiến độ: Bộ đọc cú pháp bài giảng

- Nhánh: `codex/bo-doc-bai-giang` · PR #56 · Issue #49
- Người đang làm: Codex · Cập nhật: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu

Đọc `docs/bai-giang/ke-hoach.md` và `docs/bai-giang/cu-phap.md`. Bộ đọc nằm trong `hoc-cung-cherry/lib/latex.js`, hàm `parseLesson`. Chạy `npm test` trong thư mục ứng dụng.

## Mục tiêu

Đọc cú pháp bài giảng đã duyệt và trả dữ liệu có cấu trúc cho phần giao diện.

## Quyết định đã chốt

- Giữ trường `theory` cho những nơi đang dùng. Thêm `lesson` và `warnings`. Chỉ lỗi chặn lưu.
- Phần giao diện dùng các màn đã phân loại trong `lesson.parts`. Chuỗi trước và sau khi trả lời nằm ở `state` và `after`. Màn đọc có lệnh chuyển hình mang thêm `toggle`.
- Bộ đọc hỗ trợ `\saukhitra` trước lời hỏi như đặc tả và ngay sau lời hỏi như Bài 9 mẫu.

## Đã xong (đã commit)

- [x] Bộ đọc mới, gồm phần mở đầu, các phần, kết bài, hình và trạng thái tương tác.
- [x] Tương thích cấu trúc `theory` của bài cũ và phân nhóm theo `\loidan`.
- [x] Chuyển `lesson` và `warnings` từ bộ đọc sang hàm `parseTopic` của trình duyệt.
- [x] Kiểm tra Bài 9 mẫu có 4 phần với số màn 8, 4, 6, 2 và 18 khối hình cần dịch. Kiểm tra bài cũ và cách phân biệt lỗi với cảnh báo.

## Đang làm dở

Không có trong phạm vi issue #49.

## Việc tiếp theo

Sau khi thầy gộp PR #56, tạo nhánh mới từ `main` cho khung giao diện #50 và hình mẫu SVG #51. Giao diện giáo viên thuộc #52. Ghi bài thật theo #53 cần thầy duyệt riêng trước khi ghi.

## Còn lại

- [x] Chạy kiểm tra theo AGENTS.md.
- [ ] Thầy duyệt và gộp PR #56.

## File liên quan

- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/tests/bai-giang.test.mjs`
- `docs/bai-giang/k7-b9-bai-giang.tex`
- `docs/bai-giang/ban-thu-bai9.html`

## Cách kiểm tra

GitHub Actions chạy `npm ci`, ghép và kiểm tra cú pháp giao diện, `npm test` (44/44) và build Next.js với dữ liệu giả. [Lần kiểm tra commit triển khai](https://github.com/hailinh0409/hoc-cung-Cherry/actions/runs/45786971312).

## Lưu ý cho người tiếp quản

Bài mẫu dùng để kiểm tra cú pháp. Chưa ghi dữ liệu Supabase. Việc hiển thị bài giảng mới và thử trên điện thoại thuộc #50 và #51.
