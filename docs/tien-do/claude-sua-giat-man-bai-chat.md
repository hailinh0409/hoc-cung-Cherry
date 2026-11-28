# Tiến độ: Sửa giật màn và nút bước trong bài chat với Cherry

- Nhánh: `claude/sua-giat-man-bai-chat` · PR: #77
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: xong, chờ thầy duyệt

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
- [x] `chatMorph` (đầu `client/chat.js`): so lượt nhắn mới với lượt đang hiện, giữ nguyên phần không đổi (kể cả công thức đã vẽ), chỉ sửa thuộc tính nút, so tiếp từng con của khung chỉ chứa phần tử (khung kiến thức, danh sách bước ví dụ), chỉ thay ruột khung hình.
- [x] Khung hình: tải trước ảnh của bước mới, ảnh cũ ở lại tới lúc đó; giữ chiều cao khi đổi.
- [x] Phần mới có công thức được vẽ ngoài dòng chảy (ẩn, không chiếm chỗ), vẽ xong mới vào chỗ một lần; quá 1,2 giây thì hiện luôn.
- [x] `typeset` của app (`client/app.js`) và của khung chat trả về lời hứa để biết lúc vẽ xong.
- [x] Hình thu nhỏ nổi cập nhật theo nội dung hình (vì khung hình giờ được giữ nguyên).
- [x] Hàng nút bước `.chat-step-row`: "‹ Bước trước" nhỏ bên trái, "Bước sau ›" chính bên phải; "Bước tiếp ›" của ví dụ và nút `\nutbuoc` cùng kiểu. Bấm Bước sau thì con trỏ bàn phím ở lại nút Bước sau.
- [x] Mẫu minh họa `\minhhoa` vẫn vẽ lại toàn bộ như cũ (vì tự gắn sự kiện).

## Đang làm dở
- Không có.

## Việc tiếp theo
Còn một lần lệch nhỏ (8–10 px) khi hình đổi trạng thái sau câu trả lời đúng ở Bài 9 (khung hình đổi chiều cao thật). Chưa cần sửa. Thầy thử trên điện thoại thật một bài chat có công thức (Bài 4 chuyển vế) và một bài có hình từng bước (Bài 9).

## Còn lại
- [ ] Thầy thử trên điện thoại thật rồi gộp

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/chat.js`
- `hoc-cung-cherry/client/chat.css`
- `hoc-cung-cherry/client/app.js` (hàm `typeset`)
- `docs/bai-chat/k7-chuyen-ve.tex`, `docs/bai-giang/k7-b9-bai-giang.tex`

## Cách kiểm tra
- `npm test`: 56/56 qua. `FAKE_DB=1 … npx next build`: qua.
- Playwright (Chrome) chạy trang xem thử `xem-thu/index.html`, tự bấm hết bài, đo mỗi lần chọn đáp án trong 45 khung hình; giả lập MathJax chậm 200 ms như app thật (MathJax SVG + `mathFit`).
  - Bài 4 chuyển vế: bản cũ lộ công thức chữ thô ở 10/14 lần bấm (128 khung hình), vẽ lại câu hỏi 14/14 lần; bản mới 0 khung chữ thô, giữ câu hỏi 29/29, không nhảy.
  - Bài 9 (đặt trong baichat): bản cũ nhảy 16/16 lần, nặng nhất 139 px, 201 khung chữ thô; bản mới 0 khung chữ thô, giữ câu hỏi 16/16, còn 1 lần lệch 8 px khi hình đổi.
  - Không có lỗi trong console. Ảnh hàng nút ở khung 390 px: Bước trước/Bước sau cùng một hàng.

## Lưu ý cho người tiếp quản
Không ghi gì lên Supabase.
