# Tiến độ: Lời giải từng bước — đợt 2 (Bài mẫu theo chương, gợi ý từng bước cho Ôn tập tự luận)

- Nhánh: `claude/bai-mau-chuong` (tách từ `claude/loi-giai-tung-buoc`, PR #41) · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt. **Gộp PR #41 (đợt 1) trước.**

## Bắt đầu từ đâu
Đọc `docs/tien-do/claude-loi-giai-tung-buoc.md` (đợt 1: cú pháp `giaimau`). Đợt 2: khối "Bài mẫu theo chương" trong `hoc-cung-cherry/client/app.js` (tìm `Bài mẫu theo chương`), gợi ý từng bước trong `tlDe` (`client/app.js`), `parseGiaiMau(raw, guide)` + `HUONGDAN` trong `lib/latex.js`.

## Mục tiêu
Thầy: dùng lời giải từng bước cho ví dụ trong lý thuyết, mục riêng Bài mẫu, và Ôn tập tự luận. "Làm tiếp đợt 2".

## Quyết định đã chốt với thầy
- Bài mẫu **gắn theo chương**, mỗi bài mẫu ghi "cần học xong đến bài nào" để mở đúng lúc.
- Ôn tập tự luận: **không có lời giải chi tiết** cho học sinh; gợi ý mở từng bước (tốn XP như hiện nay), có thể kèm sơ đồ đi lên.

## Đã xong (đã commit)
- [x] **Bài mẫu** là chủ đề `phan = 'bai-mau'`, `chuong = 'k<khối>-c<chương>'` trong `ltt_topics` (không cần bảng mới; API `admin/topic` nhận `bai-mau`, bắt buộc chọn chương, slug `lop<k>-c<n>-mau-…`). Nội dung: `\chude{tên}`, `\saubai{k9-b16}` (tùy chọn), khối `\begin{giaimau}`. Bộ đọc không báo "Chưa có màn nào" khi có `giaimau`.
- [x] Học sinh: nút **Bài mẫu · số bài** trong dòng thông tin của biển tên chương (chỉ hiện khi chương có bài mẫu đã duyệt; giáo viên thấy ở mọi chương). Danh sách: số thứ tự / ✓ đã xem (kèm "đoán đúng ngay f/n") / ổ khóa + "Mở khi em qua Bài …". Mở khi đã qua bài ghi ở `\saubai` (mọi chủ đề có câu hỏi của bài đó có điểm > 0); không ghi thì khi qua mọi bài có câu hỏi của chương. Xem bằng bộ màn từng bước (màn kết thúc "Xong bài mẫu!", nút "Về danh sách bài mẫu"). Đã xem lưu ở `P.bm[mã] = {d, f, n}` (máy chủ giữ nguyên trường lạ khi lưu).
- [x] Giáo viên: **+ Dán bài mẫu** (kiểm tra cú pháp, kiểm tra mã bài ở `\saubai`, xem trước từng bước, lưu Nháp), bấm bài mẫu → Xem thử / Sửa nội dung / Duyệt, ẩn, đổi chương (`tOpts`, chọn chương như Kho Thi đấu). Bài mẫu không hiện trên đường đi, không có trong Giao bài.
- [x] **Ôn tập tự luận**: trong `\begin{extl}` thêm `\begin{huongdan} … \end{huongdan}` (chỉ `\buocgiai{mục tiêu}{gợi ý}{vì sao}` và `\begin{sodo}`; có thể một hình TikZ với `\sang`/`\hien`/`\phu`). Mỗi bước hoặc sơ đồ là một gợi ý mở bằng XP (đếm chung `P.tlh`, `HINT_XP`). Gợi ý hiện: "Gợi ý n/N · mục tiêu", khung hình tô sáng, các dòng, "Vì sao?" thu gọn; sơ đồ chạm mở nhánh. Không có `huongdan` thì dùng `\goiy` như cũ. Lời giải `\loigiai` chỉ giáo viên thấy (như trước).
- [x] Dòng nhắc cú pháp trong ô sửa câu hỏi; mẫu `docs/mau/bai-mau-chuong.tex`, `docs/mau/huongdan-tu-luan.tex`.
- [x] Test: `tests/giai-mau.test.mjs` thêm test hướng dẫn tự luận (37/37).

## Đang làm dở
Không có.

## Việc tiếp theo
- **Đợt 3:** thêm cú pháp `giaimau`, `huongdan`, Bài mẫu vào `docs/gemini-skill-soan-bai.md`, `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt` và skill `nap-bai-leo-thap` (thẻ đề xuất); thử 2–3 bài (1 hình, 1 đại số).
- Sau đó: bài tương tự giấu bớt bước.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `hoc-cung-cherry/client/app.js` (PHAN, `isBM`, `mapItems`, `asgForm`, `chapOf`, `tOpts`, `journey` biển chương, khối Bài mẫu, `tlDe`)
- `hoc-cung-cherry/client/lesson.js` (`o.doneTitle`), `hoc-cung-cherry/client/lesson.css` (`.pbm`, `.bmrow`, `.tl-guide`)
- `hoc-cung-cherry/lib/latex.js` (`HUONGDAN`, `parseGiaiMau(raw, guide)`, `extl` → `q.guide`, bỏ lỗi "Chưa có màn nào" khi có `giaimau`), `hoc-cung-cherry/lib/figcode.js` (khung `huongdan`)
- `hoc-cung-cherry/app/api/admin/topic/route.js` (`bai-mau`)
- `docs/mau/bai-mau-chuong.tex`, `docs/mau/huongdan-tu-luan.tex`

## Cách kiểm tra
- `npm test` 37/37, `FAKE_DB=1 … npx next build`: đạt.
- Dữ liệu giả (tạm, đã trả lại): 2 bài mẫu khối 9 (chương 5 mở, chương 3 có `\saubai{k9-b7}` chưa qua → khóa), đề TL lớp 8 câu 2 có `huongdan` + 3 khung hình dịch thật bằng xelatex.
  - Học sinh 390×844: nút Bài mẫu trên biển chương 3 và 5; chương 3 khóa ("Mở khi em qua Bài 7…"); chương 5 xem hết 24 màn → danh sách hiện ✓ "Đã xem · đoán đúng ngay f/5". Đề TL: nút "Mở gợi ý 1/3 · 10 XP".
  - Giáo viên: nút ở cả 10 chương; Dán bài mẫu báo lỗi mã bài sai, xem trước, lưu Nháp, danh sách có nhãn "Nháp"; đề TL thấy đủ 3 gợi ý (2 bước có hình tô sáng + sơ đồ).
  - Không lỗi JavaScript.

## Lưu ý cho người tiếp quản
- Bài mẫu phải ở chương có thật (`k<khối>-c<số>`), `\saubai` là mã bài trên bản đồ (`k9-b16`), không phải slug.
- Số gợi ý của câu TL đổi khi thêm/bớt bước trong `huongdan`; `P.tlh[mã câu]` chỉ đếm số đã mở nên học sinh không mất XP đã trả.
