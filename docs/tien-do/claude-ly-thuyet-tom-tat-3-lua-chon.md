# Tiến độ: Bảng 3 lựa chọn ở chặng, mục Lý thuyết theo chương chỉ có tóm tắt

- Nhánh: `claude/ly-thuyet-tom-tat-3-lua-chon` · PR: #76
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: xong, chờ thầy duyệt

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

## Đã xong (đã commit)
- [x] Bấm chặng có lý thuyết (học sinh) → `lessonPick`: 3 lựa chọn, gợi ý theo `thDone`; "Làm bài luôn" bị khóa nếu chặng chưa mở hoặc chưa có câu hỏi. Giáo viên giữ bảng cũ (Chơi thử / Học lý thuyết / Cài đặt).
- [x] Trang tóm tắt `thSummary`: bài chat dùng `renderChatLesson(..., {summaryOnly:true, summaryActions})` (cùng nội dung nút "Tóm tắt" trong bài chat, không đụng tiến độ chat); bài kiểu cũ dùng `renderLessonSummary`.
- [x] Mục Lý thuyết `thIdx` (màn `thidx`): ô chương vuốt ngang, có vạch "Học kì II", thẻ bài có biểu tượng `lessonIco`; mở lần đầu ở chương có bài chưa học. Thẻ bài chưa có lý thuyết xám "Đang soạn".
- [x] Đánh dấu đã học `markThDone` khi bấm nút cuối bài chat, hoặc tới màn cuối bài kiểu cũ; lưu `P.thd`, đồng bộ máy chủ.

## Việc tiếp theo
- Thầy thử trên điện thoại (bản xem trước Vercel của PR #76): học sinh bấm chặng có lý thuyết, mở ô "Lý thuyết" ở màn khối.
- Biểu tượng bài đang là kí hiệu Toán theo từ khóa tên bài (`LGLYPH`); nếu thầy muốn hình vẽ riêng từng bài thì thay bằng SVG.
- Tài khoản học sinh mới: bấm "Mở trên bản đồ" lần đầu có thể bị màn chào của Cherry che bảng chọn (chỉ một lần).

## Cách kiểm tra
- `npm test` 56/56 đạt; `FAKE_DB=1 … npx next build` đạt.
- Chạy thử FAKE_DB 390×844, học sinh "Nguyễn Văn An" khối 6 (mật khẩu 0000); giáo viên nạp tạm bài chat mẫu `docs/bai-chat/k7-chuyen-ve.tex` vào Bài 2 lớp 6 và bật kiểu chat cho khối 6 (chỉ trên dữ liệu giả) để thử tóm tắt bài chat.
- Ảnh: `docs/tien-do/anh/lt-bang-3-lua-chon.jpg`, `lt-muc-ly-thuyet-theo-chuong.jpg`, `lt-tom-tat-kieu-cu.jpg`, `lt-tom-tat-bai-chat.jpg`.

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/chat.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/body.html`
- `hoc-cung-cherry/client/lesson.css`
- `hoc-cung-cherry/client/chat.css`

## Lưu ý cho người tiếp quản
- Không ghi gì lên Supabase thật, không đổi cấu trúc bảng.
- "Đã học" lưu ở `P.thd` (mã bài → ngày), gửi lên máy chủ cùng tiến độ (`pushMine`), gộp hai máy trong `mergeP`.
- Biểu tượng bài là kí hiệu Toán chọn theo tên bài (`LGLYPH`, quy tắc theo từ khóa), màu theo phân môn; sửa bảng này nếu thầy muốn đổi.
