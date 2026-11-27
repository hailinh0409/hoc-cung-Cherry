# Tiến độ: G4 — trang xem thử bài chat

- Nhánh: `codex/g4-trang-xem-thu-bai-chat` · PR: #71 · Issue: #66
- Người đang làm: Codex · Cập nhật lần cuối: 27/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu

Mở `hoc-cung-cherry/xem-thu/index.html` trong trình duyệt. Để dựng lại, chạy `node scripts/build-xem-thu.mjs` trong `hoc-cung-cherry/`.

## Mục tiêu

Cung cấp một file HTML tự chứa để người soạn kiểm tra và sao chép bài chat trước khi dán vào app.

## Quyết định đã chốt với thầy

Dùng cùng bộ đọc và trình hiển thị với app. Hình TikZ có khung giữ chỗ. Bản xem thử chỉ lấy MathJax và phông chữ từ ngoài.

## Đã xong (đã commit)

- [x] Dựng trang dán bài có cảnh báo theo dòng, khung 390 × 844, sao chép khối và làm lại.
- [x] Thêm bước dựng HTML trong GitHub Actions.
- [x] Kiểm tra hai bài mẫu và MathJax trong Edge.

## Đang làm dở

Không có.

## Việc tiếp theo

Sau khi PR được gộp, Claude đăng `xem-thu/index.html` lên Artifact để thầy và Gemini mở.

## Còn lại

- [ ] Thầy duyệt PR.

## File liên quan

- `hoc-cung-cherry/scripts/build-xem-thu.mjs`
- `hoc-cung-cherry/xem-thu/index.html`
- `.github/workflows/kiem-tra.yml`

## Cách kiểm tra

Đã dựng lại HTML và chạy thử hai bài mẫu. Kiểm tra chọn tên, hiển thị hình, công thức, số dòng, sao chép, nhớ bản dán và làm lại.

## Lưu ý cho người tiếp quản

Chỉ dùng dữ liệu giả khi kiểm tra. Nhánh dùng mã của PR tiền nhiệm để có thể kiểm tra đủ chức năng.
