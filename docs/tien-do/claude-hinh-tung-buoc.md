# Tiến độ: Hình từng bước + quy trình soạn hình hàng loạt bằng Gemini

- Nhánh: `claude/hinh-tung-buoc` · PR: (xem PR nháp cùng tên)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu
Đang làm phần nền. Đọc mục *Đã xong* và *Còn lại*. Mã chính: `hoc-cung-cherry/lib/latex.js` (đọc khối `hinhbuoc`), `lib/figcode.js` (khung hình cho Actions), `client/real.js` (hiện hình từng bước), `client/app.js` (nút giáo viên). Chạy thử: `cd hoc-cung-cherry && npm ci && node scripts/build-app.mjs && npm test`.

## Mục tiêu
Thầy (25–26/11/2026): làm "hình từng bước" cho lý thuyết tương tác, và một quy trình tiết kiệm token nhất để soạn hình hàng loạt: Claude chỉ làm phần nền một lần, Gemini soạn nội dung.
1. App đọc `\begin{hinhbuoc} … \end{hinhbuoc}`; Actions dịch mỗi hình ra đủ các khung.
2. Nút giáo viên "Sao chép chương cho Gemini" (chép mã mọi bài trong chương + lời nhờ soạn hình).
3. "Dán bài" dán được cả chương một lần; chỉ thay lý thuyết và hình, khóa câu hỏi; xem trước từng bài.
4. Nút "Sao chép lỗi hình" gom các hình dịch lỗi để dán lại cho Gemini.
5. Cập nhật hướng dẫn soạn (`docs/soan-bai.md`, `docs/gemini-skill-soan-bai.md`) và skill `nap-bai-leo-thap`.

## Quyết định đã chốt với thầy
- Claude làm phần nền; việc soạn hình hàng loạt về sau do Gemini làm (tiết kiệm token Claude).
- Cú pháp đã thử trên artifact "Hình từng bước – thử": một `tikzpicture`, phần hiện từ bước k bọc `\hien{k}{…}`, mỗi bước một `\loibuoc{…}`.
- Phần chưa đến lượt vẫn vẽ nhưng trong suốt (opacity 0) để mọi khung cùng kích thước.

## Đã xong (đã commit)
- [ ] (chưa)

## Đang làm dở
- Bước 1.

## Việc tiếp theo
Sau khi thầy gộp: chạy thử một chương (đề xuất Toán 6 chương III) bằng quy trình Gemini.

## Còn lại
- [ ] 1. hinhbuoc: đọc + kiểm lỗi (latex.js), khung hình (figcode.js, dich_hinh.py), hiển thị (real.js, lesson.js, CSS)
- [ ] 2. Sao chép chương cho Gemini
- [ ] 3. Dán cả chương, khóa câu hỏi
- [ ] 4. Sao chép lỗi hình
- [ ] 5. Hướng dẫn soạn + skill
- [ ] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/lib/figcode.js`
- `hoc-cung-cherry/scripts/dich_hinh.py`
- `hoc-cung-cherry/client/real.js`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/app.js`
- `docs/soan-bai.md`, `docs/gemini-skill-soan-bai.md`

## Cách kiểm tra
`npm test`; `FAKE_DB=1 … npx next start`, giáo viên `thaylinh` / `matkhau123`, mở một bài có `hinhbuoc` (dữ liệu giả `tests/seed.json`).

## Lưu ý cho người tiếp quản
- Mỗi khung là một "khối" riêng trong `ltt_figures`: mã khung = `\lttbuoc{k}` + xuống dòng + nguyên văn `tikzpicture` (đã bỏ chú thích). Hash = sha1 của chuỗi đó, máy chủ và giao diện phải tính giống hệt nhau (`hbFrame` trong `lib/latex.js`).
