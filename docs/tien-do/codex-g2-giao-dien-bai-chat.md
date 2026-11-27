# Tiến độ: G2 — giao diện chat với Cherry

- Nhánh: `codex/g2-giao-dien-bai-chat` · PR: #69 · Issue: #64
- Người đang làm: Codex · Cập nhật lần cuối: 27/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu

Đọc `docs/bai-chat/ke-hoach.md` mục 3.2. Mở `renderChatLesson` trong `client/chat.js`. Nhánh này dựa trên PR #68.

## Mục tiêu

Hiển thị một dòng chat từ bài đã soạn, với hình tương tác và tiến độ trên thiết bị.

## Quyết định đã chốt với thầy

Giọng tớ–cậu, công thức riêng dòng, hình nằm trong lượt nhắn. Ảnh nổi nhỏ chỉ dùng để quay về lượt có hình.

## Đã xong (đã commit)

- [x] Dựng hai bài mẫu bằng cùng giao diện.
- [x] Thêm hình cân và đẳng thức dùng dữ liệu từ G1.
- [x] Kiểm tra lượt sai/đúng, nhắc lại, mục lục, tóm tắt, hoàn thành, lưu và mở lại.

## Đang làm dở

Không có.

## Việc tiếp theo

G3 (#65) đưa giao diện vào app. G4 (#66) nạp mã cho trang xem thử.

## Còn lại

- [ ] Thầy duyệt PR.

## File liên quan

- `hoc-cung-cherry/client/chat.js`
- `hoc-cung-cherry/client/chat.css`
- `hoc-cung-cherry/client/hinhmau.js`

## Cách kiểm tra

Bộ kiểm thử npm 50/50, kiểm tra cú pháp giao diện đã ghép, build Next.js với dữ liệu giả. Bấm qua bài chuyển vế và luồng hình học trong Edge ở 390 × 844 và 1000 × 800.

## Lưu ý cho người tiếp quản

Chỉ dùng dữ liệu giả khi kiểm tra. Nhánh dùng mã của PR tiền nhiệm để có thể kiểm tra đủ chức năng.
