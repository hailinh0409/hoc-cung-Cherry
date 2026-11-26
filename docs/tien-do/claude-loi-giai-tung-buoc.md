# Tiến độ: Lời giải từng bước (bài giải mẫu) — đợt 1

- Nhánh: `claude/loi-giai-tung-buoc` · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: đợt 1 xong, chờ thầy duyệt; đợt 2–3 chưa làm

## Bắt đầu từ đâu
Bản mẫu thầy duyệt: https://claude.ai/artifact/CD4WLVXu13kCvrkeGBtEnR (bài tiếp tuyến lớp 9). Cú pháp và bộ đọc: `parseGiaiMau`, `gmFrame`, `giaiMauErrors` trong `hoc-cung-cherry/lib/latex.js` (chú thích đầu khối ghi đủ cú pháp). Hiển thị: `gmScreens`, `gmTreeHTML` trong `client/lesson.js` (dùng chung bộ màn học từng màn). Bài mẫu soạn sẵn: `docs/mau/giaimau-tiep-tuyen.tex`.

## Mục tiêu
Thầy: hiển thị ví dụ, đặc biệt bài tự luận dài nhiều bước như bài chuyên, theo từng bước giống phần lý thuyết để học sinh hiểu và tự làm được. Sau bản mẫu: "Ý tưởng xuất sắc. Chúng ta sẽ sử dụng mẫu này cho các bài tự luận về sau để làm ví dụ minh họa cho học sinh."

## Quyết định đã chốt với thầy
- Dùng ở 3 chỗ: ví dụ trong lý thuyết, mục riêng **Bài mẫu**, **Ôn tập tự luận**.
- Bài mẫu **gắn theo chương** (biểu tượng ở biển tên chương), mỗi bài mẫu ghi "cần học xong đến bài nào" để mở đúng lúc.
- Ôn tập tự luận **không có lời giải chi tiết**: thay gợi ý cũ bằng gợi ý mở từng bước (tốn XP như hiện nay), có thể kèm sơ đồ đi lên; học sinh trình bày vào vở.
- Hình **tô sáng theo từng bước** (máy dịch mỗi màn một khung).
- **1–2 câu "Em đoán bước tiếp theo" mỗi ý**, ở bước then chốt.

## Đã xong (đã commit) — đợt 1
- [x] Cú pháp `\begin{giaimau}`: `\de`, một `tikzpicture` (có `\hien{k}{…}`, `\phu{a}{b}{…}` nét phụ chỉ hiện bước a→b, `\sang{k}{…}` tô cam bước k), `\cau{Câu 1}{yêu cầu}`, `\doan{câu hỏi}{đúng}{sai}{vì sao đúng}{vì sao sai}[{sai 2}{vì sao}…]`, `\buocgiai{mục tiêu}{lời giải}{vì sao}`, `\begin{sodo}\nut{cấp}{nội dung}{ghi chú}…\end{sodo}`, `\nhanxet{…}`. Bước k đếm `\buocgiai` từ 1 trong cả bài.
- [x] Kiểm lỗi soạn (`giaiMauErrors`, gọi trong `parseBank`): thiếu `\de`, không có `\buocgiai`, `\doan` sai số ngoặc, nhiều hơn một hình, `\hien`/`\sang`/`\phu` vượt số bước, sơ đồ sai cấp.
- [x] Khung hình: `gmFrame(tikz,k,s)` = `\lttbuoc{k}\lttsang{s}` + hình; khi tô sáng thì bọc phần còn lại trong `scope[opacity=.3]` và vẽ phần `\sang{s}` sau cùng màu cam (`\lttsangve`). Lệnh TeX `\sang`, `\phu`, `\lttsang`, `\lttsangve` thêm vào `PREAMBLE` (`lib/figcode.js`); `figBlocks` dịch các khung, không dịch hình gốc. Đề bài dùng khung đầy đủ (`k=99`, nét `\phu` ẩn).
- [x] Hiển thị trong lý thuyết (khối `giaimau` đặt trong `lythuyet`): màn Đề bài → Yêu cầu từng câu → Em đoán bước tiếp theo (đúng: "Xem bước giải", sai: "Chọn lại") → Bước n/tổng (mục tiêu, các dòng, "Vì sao?") → Phân tích đi lên (nhánh ngang, chạm mở nhánh) → Nhận xét. Hình ghim trên cùng (≤34% chiều cao, xoay ngang 60%), nút **Đề bài** mở đề + hình đầy đủ.
- [x] Ô sửa lý thuyết của giáo viên có dòng nhắc cú pháp.
- [x] `tests/giai-mau.test.mjs` (3 test).

## Đang làm dở
Không có.

## Việc tiếp theo
- **Đợt 2:** (a) mục Bài mẫu theo chương: biểu tượng ở biển tên chương, danh sách bài mẫu, mốc "cần học xong đến bài"; nơi lưu và cách dán (cần thiết kế bảng/khóa — đưa SQL cho thầy nếu cần bảng mới); (b) Ôn tập tự luận: gợi ý mở từng bước tốn XP, sơ đồ đi lên, không hiện lời giải chi tiết; đề cũ chạy như cũ.
- **Đợt 3:** thêm cú pháp vào `docs/gemini-skill-soan-bai.md`, `docs/soan-bai.md`, skill `nap-bai-leo-thap`; thử 2–3 bài (1 hình, 1 đại số).
- Sau đó: bài tương tự giấu bớt bước.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/latex.js`, `hoc-cung-cherry/lib/figcode.js`
- `hoc-cung-cherry/client/lesson.js`, `hoc-cung-cherry/client/lesson.css`, `hoc-cung-cherry/client/app.js` (dòng nhắc cú pháp)
- `docs/mau/giaimau-tiep-tuyen.tex`, `hoc-cung-cherry/tests/giai-mau.test.mjs`

## Cách kiểm tra
- `node scripts/build-app.mjs`, `npm test` 36/36, `FAKE_DB=1 … npx next build`: đạt.
- Dịch thật 21 khung của bài tiếp tuyến bằng xelatex + pdftocairo với đúng `PREAMBLE`: 21/21 đạt, mọi khung cùng kích thước 277×133pt.
- Chạy `FAKE_DB=1 … next start` (tạm đưa bài vào lý thuyết `lop9-can-bac-hai` + 21 SVG vào `tests/seed.json`, đã trả lại), 390×844, học sinh: đi hết 24 màn, đoán sai/đúng, Vì sao, sơ đồ, nút Đề bài; không lỗi JavaScript.

## Lưu ý cho người tiếp quản
- Máy chủ và app phải tính mã khung giống hệt nhau (`gmFrame`, nằm trong `lib/latex.js` nên dùng chung).
- Trong `\sang{k}{…}` chỉ dùng `\draw`/`\fill` không đặt màu (màu cam do `\lttsangve`); điểm, nhãn mới thì dùng `\hien`.
- `scripts/dich_hinh.py` (cũ, không dùng) chưa có các lệnh mới; Actions dùng `scripts/dung-hinh.mjs` → `wrapFigure` nên đã có.
