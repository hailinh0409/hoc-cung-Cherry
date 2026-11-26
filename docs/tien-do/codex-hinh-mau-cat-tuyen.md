# Tiến độ: Hình mẫu cát tuyến và thao tác trên hình

- Nhánh: `codex/hinh-mau-cat-tuyen` · Issue #51
- Người đang làm: Codex · Cập nhật: 26/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu

Xem hướng dẫn hình mẫu trong `docs/bai-giang/cu-phap.md`, bản thử Bài 9 và khung ở PR #57.

## Mục tiêu

Vẽ hình SVG thống nhất và hỗ trợ chạm góc, chạm vùng, trượt, Em tính, đổi trạng thái.

## Quyết định đã chốt

Đánh số như Hình 3.16. Trạng thái đặt lại theo màn. Trượt 1,4 giây và bỏ chuyển động khi thiết bị yêu cầu.

## Đã xong

- [x] Bộ đọc đã gộp vào main; khung PR #57 sẵn sàng để duyệt.

## Đang làm dở

Kiểm tra hình mẫu và các màn tương tác trên trình duyệt.

## Việc tiếp theo

Đưa phần tương tác lên PR riêng sau khi kiểm tra. Gộp PR #57 trước.

## Còn lại

- [ ] Chạy kiểm tra theo AGENTS.md.

## File liên quan

- `hoc-cung-cherry/client/hinhmau.js`
- `hoc-cung-cherry/client/lesson.js`
- `docs/bai-giang/ban-thu-bai9.html`

## Cách kiểm tra

`npm test`, build Next.js dữ liệu giả, thử các màn hình học ở 390×844.

## Lưu ý cho người tiếp quản

PR bước C dựa trên khung bước B để xem riêng thay đổi. Chưa ghi dữ liệu Supabase.
