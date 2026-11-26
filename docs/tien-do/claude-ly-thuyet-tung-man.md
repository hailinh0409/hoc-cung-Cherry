# Tiến độ: Lý thuyết từng màn (kiểu Duolingo) cho toàn bộ app

- Nhánh: `claude/ly-thuyet-tung-man` · PR: (PR nháp mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu
Bản mẫu thầy đã duyệt: https://claude.ai/artifact/NM6kCLsF8U2KxkXkg38WYk (Bài 1. Tập hợp). Việc chính: viết lại `renderLessonMaterial` trong `hoc-cung-cherry/client/lesson.js` để tự chia lý thuyết đã soạn thành từng màn.

## Mục tiêu
Thầy (26/11/2026) so màn lý thuyết của Cherry với Duolingo, thấy chữ nhiều và dày. Sau khi xem bản mẫu: "Tuyệt vời, toàn bộ lý thuyết trong app sẽ tiến hành thế này".

## Quyết định đã chốt với thầy
- Mỗi màn một ý (tối đa khoảng 3 dòng chữ), màn nào cũng có thứ để chạm; thanh tiến độ ở trên, nút "Tiếp tục" cố định ở dưới; trả lời đúng/sai hiện dải xanh/đỏ kèm giải thích, sai thì "Thử lại".
- Nền sáng thống nhất, chữ thân bài khoảng 19px, lời Cherry là bong bóng thoại ngắn, bỏ tiêu đề lặp.
- Kết thúc có số câu đúng ngay lần đầu + tóm tắt ngắn + nút "Luyện tập cả bài".
- App **tự chia** lý thuyết đã có thành từng màn (không bắt Gemini soạn lại).

## Đã xong (đã commit)
- [ ] (chưa)

## Đang làm dở
- Đọc mã lý thuyết hiện tại.

## Việc tiếp theo
- Viết bộ chia màn + giao diện từng màn.

## Còn lại
- [ ] Bộ chia màn từ `t.theory` (loidan, dinhnghia/quytac/…, minhhoa, hinhbuoc, vidu, luuy, thungay)
- [ ] Giao diện từng màn + chân trang Tiếp tục/Kiểm tra
- [ ] Màn kết thúc + tóm tắt
- [ ] Bài Tập hợp dựng sẵn (setLesson) cũng theo kiểu mới
- [ ] Chạy kiểm tra (AGENTS.md mục 3), ảnh chụp 390×844

## File liên quan
- `AGENTS.md`
- `docs/ban-giao-ly-thuyet-tuong-tac.md`
- `hoc-cung-cherry/client/lesson.js`, `client/lesson.css`, `client/app.js` (hàm `theory`)

## Cách kiểm tra
(chưa)

## Lưu ý cho người tiếp quản
(chưa)
