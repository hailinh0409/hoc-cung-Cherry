# Tiến độ: Sửa giật màn và nút bước trong bài chat với Cherry

- Nhánh: `claude/sua-giat-man-bai-chat` · PR: (điền sau khi mở)
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu
Mọi thay đổi nằm trong `hoc-cung-cherry/client/chat.js` (hàm `render`, `blockHTML`, `updatePip`) và `client/chat.css`. Chạy `npm test`, `node scripts/build-app.mjs`, `node scripts/build-xem-thu.mjs`, rồi mở `xem-thu/index.html` ở 390 × 844 với `docs/bai-chat/k7-chuyen-ve.tex`.

## Mục tiêu
Thầy Linh (28/11/2026): "Trong đoạn chat với Cherry màn hình hiển thị văn bản sẽ co hoặc giãn sau khi chọn xong đáp án, và trong hình từng bước thì tùy chọn tiếp theo (quay lại) xếp hàng dọc có vẻ sẽ không hợp lí" → thầy cho Claude sửa luôn.

1. Chọn đáp án, bấm bước, bấm thao tác: chữ đã có trên màn không nhảy, không co giãn. Nguyên nhân: `render()` xoá rồi vẽ lại cả lượt (`innerHTML`), công thức hiện dạng chữ thô cho tới khi MathJax vẽ xong, hình bị gỡ ra gắn lại.
2. Nút "Bước trước" / "Bước sau" của hình từng bước nằm cùng một hàng (trước bên trái, dạng phụ; sau bên phải, dạng chính). Áp dụng cùng kiểu cho "Bước tiếp" của ví dụ và nút `\nutbuoc` ở mở đầu.

## Quyết định đã chốt với thầy
- Giữ nền sáng chữ tối cho khung chat (thầy hỏi, Claude khuyên giữ; chưa đổi).
- Phông chữ: thầy đang xem thử Lexend/Nunito, chưa đổi trong PR này.

## Đã xong (đã commit)
- (chưa)

## Đang làm dở
- `render()` → cập nhật từng phần tử thay vì thay cả `innerHTML`.

## Việc tiếp theo
Thầy thử trên điện thoại thật một bài chat có công thức (Bài 4 chuyển vế) và một bài có hình từng bước (Bài 9).

## Còn lại
- [ ] Cập nhật DOM theo phần tử, chỉ vẽ MathJax cho phần mới, phần mới ẩn tới khi vẽ xong
- [ ] Giữ khung hình khi đổi trạng thái/bước (không gỡ ra gắn lại, giữ chiều cao khi ảnh mới đang tải)
- [ ] Hàng nút bước
- [ ] Kiểm thử tự động + kiểm tra tay 390 × 844
- [ ] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/chat.js`
- `hoc-cung-cherry/client/chat.css`
- `hoc-cung-cherry/client/app.js` (hàm `typeset`)
- `docs/bai-chat/k7-chuyen-ve.tex`, `docs/bai-giang/k7-b9-bai-giang.tex`

## Cách kiểm tra
(điền khi xong)

## Lưu ý cho người tiếp quản
Không ghi gì lên Supabase.
