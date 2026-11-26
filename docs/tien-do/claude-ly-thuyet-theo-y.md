# Tiến độ: Lý thuyết chia màn theo ý + công thức dài tự xuống dòng

- Nhánh: `claude/ly-thuyet-theo-y` · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026 13:45
- Trạng thái: đang làm

## Bắt đầu từ đâu
Sửa `hoc-cung-cherry/client/lesson.js` (lsLines, lsSentences, lsChunks, lessonScreens) và `client/app.js` (brOut, typeset). Chạy `node scripts/build-app.mjs && npm test`.

## Mục tiêu
Thầy duyệt 26/11/2026 (13:39): "màn lý thuyết theo ý, công thức dài tự xuống dòng".
Lỗi thầy chụp: Toán 6 Bài 1 "Hai cách mô tả tập hợp" bị cắt làm 2 màn (màn sau mất nhãn, tiêu đề; Cherry nói "Xem cách chuyển nhé!" nhưng hình chuyển ở 2 màn sau). Bài 4 Lưu ý bị cắt sau dấu hai chấm thành 2 dòng "!", công thức $37+85+63=(37+63)+85=185$ bị giấu phần cuối trong thanh cuộn ngang.

## Quyết định đã chốt với thầy
- Mỗi mục (định nghĩa, quy tắc, tính chất, lưu ý) giữ trọn một màn; chỉ chia ở `\\` khi mục quá dài; màn sau giữ nhãn và tiêu đề kèm "(tiếp)".
- Không cắt sau dấu hai chấm.
- Lời Cherry đi kèm màn nó nhắc tới (câu "Xem…" sang màn hình/minh họa).
- Công thức: ngắt dòng ở dấu = (và <, >, ≤, ≥, ⇒…) ngoài ngoặc; chuỗi ≥ 3 vế không vừa một dòng thì mỗi bước một dòng, thẳng cột; công thức không ngắt được thì thu nhỏ vừa khung (không dưới 75%), còn không vừa thì cuộn ngang có gợi ý "vuốt ngang".
- Không nâng MathJax 4.

## Đã xong (đã commit)
- [ ] (đang làm)

## Đang làm dở
- Bắt đầu sửa mã.

## Việc tiếp theo
- Gọi dịch hình ngay khi bấm "Dán bài mới" (PR riêng).

## Còn lại
- [ ] Chia màn theo ý (lesson.js)
- [ ] Ngắt / dàn / thu nhỏ công thức (app.js, CSS)
- [ ] Cập nhật hướng dẫn soạn (docs/soan-bai.md, soan-man-tuong-tac.txt, gemini-skill-soan-bai.md)
- [ ] Chạy kiểm tra (AGENTS.md mục 3) và thử ở 390×844

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/app2.css`

## Cách kiểm tra
(điền khi xong)

## Lưu ý cho người tiếp quản
Không ghi gì lên Supabase.
