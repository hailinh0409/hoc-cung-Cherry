# Tiến độ: Hình từng bước + quy trình soạn hình hàng loạt bằng Gemini

- Nhánh: `claude/hinh-tung-buoc` · PR: #35
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã làm xong phần nền, chờ thầy gộp. Mã chính: `lib/latex.js` (`parseHinhBuoc`, `hbFrame`, `hinhBuocErrors`), `lib/figcode.js` (`figBlocks` tách khung, `PREAMBLE` có `\hien`/`\lttbuoc`), `client/real.js` (hiện hình từng bước), `client/app.js` (mục "Soạn bằng Gemini theo chương"), `app/api/admin/figs/route.js`. Chạy thử: `cd hoc-cung-cherry && npm ci && node scripts/build-app.mjs && npm test`.

## Mục tiêu
Thầy (25–26/11/2026): làm "hình từng bước" cho lý thuyết tương tác, và một quy trình tiết kiệm token nhất để soạn hình hàng loạt: Claude chỉ làm phần nền một lần, Gemini soạn nội dung ("Hãy để Claude làm phần nền đi").

## Quyết định đã chốt với thầy
- Claude làm phần nền; việc soạn hình hàng loạt về sau do Gemini làm (tiết kiệm token Claude).
- Cú pháp đã thử trên artifact "Hình từng bước – thử": một `tikzpicture`, phần hiện từ bước k bọc `\hien{k}{…}`, mỗi bước một `\loibuoc{…}`.
- Phần chưa đến lượt vẫn vẽ nhưng trong suốt (opacity 0) để mọi khung cùng kích thước.
- Dán theo chương: app chỉ thay khối `lythuyet` của bài đã có, khóa câu hỏi; bài chưa có thì tạo bài nháp.

## Đã xong (đã commit)
- [x] Đọc và kiểm lỗi `\begin{hinhbuoc}` (`lib/latex.js`); đứng riêng trong `lythuyet` thì là mục `hinhbuoc`, hiện ở cột minh họa (`client/lesson.js`); dùng được cả trong nội dung mục và câu hỏi.
- [x] Actions dịch mỗi bước thành một khung (`lib/figcode.js` `figBlocks`; `PREAMBLE` có `\lttstep`, `\lttbuoc`, `\hien`). Không cần sửa `tu-dich-hinh.yml` hay `dung-hinh.mjs`. Đã thử biên dịch thật bằng xelatex với đúng PREAMBLE.
- [x] Hiển thị: chạm hình / Tiếp / Lùi, chấm tiến độ, lời từng bước có công thức (`client/real.js`, `client/lesson.css`). Khung chưa dịch đủ thì hiện "Hình từng bước chưa dịch xong".
- [x] Nút **✦ Soạn bằng Gemini** trên biển tên chương (chỉ giáo viên): Sao chép chương (kèm lời nhờ sửa được), Dán kết quả (nhiều bài một lần, xem trước, khóa câu hỏi), Kiểm tra hình của chương, Sao chép lỗi hình cho Gemini (`client/app.js`, API mới `app/api/admin/figs`).
- [x] Hướng dẫn: `docs/gemini-skill-soan-bai.md` (mục 3.7b Hình từng bước, 7b Soạn theo chương, tự kiểm tra hình), `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`, chú thích trong ô Sửa lý thuyết.
- [x] Kiểm thử `tests/hinhbuoc.test.mjs` (đọc, khóa khung máy chủ = giao diện, báo lỗi).

## Đang làm dở
- Không có.

## Việc tiếp theo
- Thầy gộp PR, rồi chạy thử quy trình trên một chương thật (đề xuất Toán 6 Chương III Số nguyên hoặc Toán 7 Chương IV).
- Skill `nap-bai-leo-thap` (skill tài khoản của thầy): Claude đã đề xuất bản cập nhật thêm hình từng bước; thầy lưu từ thẻ đề xuất.
- Ý tưởng đã bàn, chưa làm: các mẫu tương tác khác (trục số kéo điểm, hình học động JSXGraph, đồ thị có thanh trượt…).

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/lib/figcode.js`
- `hoc-cung-cherry/scripts/dich_hinh.py` (script cũ: chỉ thêm PREAMBLE, không tách khung)
- `hoc-cung-cherry/client/real.js`
- `hoc-cung-cherry/client/lesson.js`, `client/lesson.css`
- `hoc-cung-cherry/client/app.js` (tìm `Soạn bằng Gemini theo chương`)
- `hoc-cung-cherry/app/api/admin/figs/route.js`
- `hoc-cung-cherry/tests/hinhbuoc.test.mjs`
- `docs/gemini-skill-soan-bai.md`, `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`

## Cách kiểm tra
- `npm test` (30/30 qua), `FAKE_DB=1 SESSION_SECRET=… npx next build` (qua).
- Đã chạy thử trên trình duyệt 390×844 với dữ liệu giả có thêm một bài Toán 7 Bài 12 có hình từng bước 5 bước (khung dịch thật bằng xelatex) và một bài có hình lỗi (dữ liệu thử không commit): hình chạy đủ 5 bước, nút Lùi/Tiếp/chạm hình đúng; Sao chép chương ra đúng định dạng; Dán kết quả chỉ đổi khối lythuyet, câu hỏi giữ nguyên, bài chưa có được tạo nháp, bài lặp/bài Gemini chưa soạn bị bỏ qua có ghi chú; Kiểm tra hình báo "5/6 khung, 1 hình lỗi" và sao chép lỗi đúng.
- Thầy thử trên app thật: giáo viên → Toán → khối → biển tên chương → ✦ Soạn bằng Gemini.

## Lưu ý cho người tiếp quản
- Mỗi khung là một "khối" riêng trong `ltt_figures`: mã khung = `\lttbuoc{k}` + xuống dòng + nguyên văn `tikzpicture` (đã bỏ chú thích). Hash = sha1 của chuỗi đó; máy chủ (`figBlocks`) và giao diện (`figSwap` trong `real.js`) đều dùng `parseHinhBuoc`/`hbFrame` của `lib/latex.js`, đừng tính riêng.
- `tikzpicture` bên trong `hinhbuoc` không được dịch như hình thường (tránh dịch thừa).
- Các biến `let/const` của giao diện nằm trong một khối `{ … }`, nên khi thử bằng Playwright không gọi được `TOPICS`, `curK` từ ngoài; lúc thử tôi chèn tạm `window.__ev=s=>eval(s)` vào `public/app.html` rồi dựng lại (không commit).
- Không ghi gì lên Supabase thật trong việc này.
