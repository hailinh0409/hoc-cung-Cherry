# Tiến độ: Bảng 3 lựa chọn ở chặng, mục Lý thuyết theo chương chỉ có tóm tắt

- Nhánh: `claude/ly-thuyet-tom-tat-3-lua-chon` · PR: (PR nháp cùng tên nhánh)
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu
Mã chính ở `hoc-cung-cherry/client/lesson.js` (khối "Lý thuyết (thầy duyệt 28/11/2026)": `lessonPick`, `thSummary`, `thIdx`, `lessonIco`, `markThDone`), `client/chat.js` (tùy chọn `summaryOnly` của `renderChatLesson`), `client/app.js` (bấm chặng gọi `lessonPick`, đánh dấu đã học trong `theory()`), `client/body.html` (màn `thidx`), `client/lesson.css`, `client/chat.css`.

## Mục tiêu
Bấm chặng trên bản đồ luôn bắt học lý thuyết, học sinh giỏi thấy phiền. Thầy muốn chọn cách học, và tách mục Lý thuyết riêng tổ chức theo chương giống app tiếng Anh.

## Quyết định đã chốt với thầy (28/11/2026, đã duyệt bản thử artifact "Bản thử Lý thuyết lớp 7")
- Bấm chặng có lý thuyết: **lần nào cũng hiện bảng 3 lựa chọn** Học từ đầu (chat với Cherry) / Tóm tắt lý thuyết / Làm bài luôn; cả 3 bấm được. Gợi ý theo tình trạng: chưa học thì gợi ý Học từ đầu, đã học thì Làm bài luôn lên đầu và được gợi ý.
- **Đã học** chỉ đánh dấu khi học xong bài chat với Cherry (bài kiểu cũ: xem tới màn cuối). Đọc tóm tắt không tính.
- **Mục Lý thuyết riêng** mở bằng ô "Lý thuyết" có sẵn ở màn khối, vào thẳng trang mới (không hiện bảng nhỏ như cũ): hàng ô chương (I, II, …) vuốt ngang ở trên, thẻ bài bên dưới, mỗi thẻ có biểu tượng riêng. **Mục này chỉ có tóm tắt**; học cùng Cherry chỉ có trên bản đồ. Mở được mọi bài của khối.
- Bài chưa có lý thuyết: thẻ xám, chữ "Đang soạn".
- Giữ cả hai lối vào (bản đồ và mục Lý thuyết), cùng một nội dung.

## Còn lại
- [ ] Chạy thử giao diện 390×844 (học sinh, giáo viên), ghi kết quả, ảnh
- [ ] Hoàn thiện bản bàn giao, chuyển PR sang Ready

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/chat.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/body.html`
- `hoc-cung-cherry/client/lesson.css`
- `hoc-cung-cherry/client/chat.css`

## Lưu ý cho người tiếp quản
- "Đã học" lưu ở `P.thd` (mã bài → ngày), gửi lên máy chủ cùng tiến độ (`pushMine`), gộp hai máy trong `mergeP`.
- Biểu tượng bài là kí hiệu Toán chọn theo tên bài (`LGLYPH`, quy tắc theo từ khóa), màu theo phân môn; sửa bảng này nếu thầy muốn đổi.
