# Tiến độ: Quy trình soạn một lần (lý thuyết tương tác + bài tập)

- Nhánh: `claude/quy-trinh-soan-mot-lan` · PR: xem PR nháp cùng tên
- Người đang làm: Claude · Cập nhật lần cuối: 25/11/2026 11:30
- Trạng thái: xong, chờ thầy duyệt

## Mục tiêu

Thầy yêu cầu (25/11): "Bài 1 và bài 2 Toán 6 đã có lý thuyết tương tác, các bài khác mới chỉ là hình tĩnh. Cần một quy trình thống nhất để sau này soạn bài cho các khối khác chỉ cần Gemini làm duy nhất một lần, thầy chỉ yêu cầu Gemini rồi copy và dán toàn bộ (bài tập, lý thuyết tương tác) trong một lần."

## Quyết định đã chốt với thầy

- Mỗi bài thường: Gemini trả **một khối mã** gồm lý thuyết tương tác và bài tập; thầy dán một lần bằng **+ Dán bài**.
- Bài đã có (hiện chỉ có tóm tắt): Gemini chỉ trả khối `lythuyet`; thầy dán vào **Sửa lý thuyết**, phần bài tập giữ nguyên.

## Đã kiểm tra (không cần sửa mã)

- Bộ đọc `lib/latex.js` nhận một bài có `\loidan`, `\minhhoa`, `\thungay` cùng các `\man{…}` trong một khối: không báo lỗi, đọc đủ lý thuyết và câu hỏi.
- TikZ trong lý thuyết được dịch hình và hiển thị như trong câu hỏi (`tex()` đổi hình ở mọi chỗ; Actions dịch hình mỗi 15 phút).
- Giới hạn còn lại: mới có hai mẫu `\minhhoa` (đều về số tự nhiên). Các bài khác dùng `\loidan` + giải thích + `\vidu` + `\thungay` + hình TikZ.

## Đã xong (đã commit)

- [x] Cập nhật `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt` (lý thuyết tương tác là mặc định, dán một lần)
- [x] Bỏ bản chỉ dẫn Gem (thầy báo không còn dùng Gem, Gemini dùng chung skill với Claude); đưa mục *Quy trình một lần* vào `docs/soan-bai.md`
- [ ] Cập nhật skill `nap-bai-leo-thap` (đề xuất qua thẻ skill, thầy lưu)

## Còn lại

- [ ] Thầy lưu bản skill mới, thử nhờ Gemini soạn một bài lớp 7
- [ ] (Tùy thầy) Thêm mẫu `\minhhoa` tổng quát cho các khối khác

## File liên quan

- `AGENTS.md`
- `docs/soan-bai.md`
- `docs/soan-man-tuong-tac.txt`
- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/client/lesson.js`

## Lưu ý cho người tiếp quản

Chưa ghi gì vào Supabase.
