# Tiến độ: Lý thuyết chia màn theo ý + công thức dài tự xuống dòng

- Nhánh: `claude/ly-thuyet-theo-y` · PR: #46
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026 14:20
- Trạng thái: xong, chờ thầy duyệt

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
- [x] Chia màn theo ý — `client/lesson.js`: `LS_MAX` 160 → 320; `lsSentences` không cắt sau ":"; mục dài chia ở `\\`, màn sau "Tên mục (tiếp)"; `\luuy` chia bằng `lsChunks` (mỗi dòng `\\` một dòng "!", không tự tách câu); câu cuối của `\loidan` bắt đầu bằng Xem/Quan sát/Chạm/Kéo/Bấm/Thử (`LS_LOOK`) chuyển sang màn `hinhbuoc`/`minhhoa` đầu tiên của mục (`pushLab`).
- [x] Công thức — `client/app.js`: `mathBreak` (gọi trong `brOut`) cắt `$…$` ở dấu quan hệ ngoài ngoặc thành `<span class="mchain">$a$<wbr>${}=b$…</span>`; `mathFit` (gọi sau mỗi lần MathJax dựng: `typeset`, `tsP` trong q2.js, lúc khởi động trong head.html, khi đổi cỡ khung lý thuyết) dàn chuỗi bằng nhau ≥ 3 vế bằng `<br class="mbr">` + lề trái thẳng dấu "=", và thu nhỏ công thức rộng hơn khung (≥ 75%, không vừa thì thêm "↔ vuốt ngang để xem hết").
- [x] Hướng dẫn soạn: `docs/soan-bai.md`, `docs/gemini-skill-soan-bai.md`, `docs/soan-man-tuong-tac.txt`.

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy mở Toán 6 Bài 1 (Tập hợp) và Bài 4 (Phép cộng) trên điện thoại sau khi gộp: "Hai cách mô tả tập hợp" một màn; "Xem cách chuyển nhé!" ở màn hình chuyển; lưu ý 37+85+63 hiện đủ, xuống dòng ở dấu "=".
- Nội dung Bài 4 (Supabase `lop6-b4-cong-tru`): lưu ý đang bỏ bước $=100+85$, nên thêm (chưa sửa dữ liệu).
- Gọi dịch hình ngay khi bấm "Dán bài mới" (PR riêng).

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3) và thử ở 390×844
- [ ] Skill `nap-bai-leo-thap` trong tài khoản Claude của thầy chưa cập nhật (không sửa được từ repo); docs trong repo đã cập nhật.

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/app2.css`
- `hoc-cung-cherry/client/q2.js`
- `hoc-cung-cherry/client/head.html`
- `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`, `docs/gemini-skill-soan-bai.md`

## Cách kiểm tra
- `node scripts/build-app.mjs`, `npm test` (40/40 đạt), `FAKE_DB=1 … npx next build` (đạt).
- Dựng thử bằng Chrome không giao diện ở 390×844: nạp app, gọi `renderLessonMaterial` với nội dung Bài 1 và Bài 4 thật, chụp từng màn. Bài 1: 3 màn (quy tắc trọn một màn, Cần nhớ, màn hình kèm "Xem cách chuyển nhé!"). Bài 4: chuỗi 37+85+63=… dàn từng bước thẳng cột, dấu chấm theo vế cuối; tổng 7 phân số thu nhỏ vừa khung. Không có lỗi trang.

## Lưu ý cho người tiếp quản
Không ghi gì lên Supabase.
- `mathBreak` bỏ qua công thức có `\\begin`, `&` (aligned, cases) và công thức ngắn (< 14 kí tự); chỉ cắt ở độ sâu 0 (ngoài `{}`, `()`, `[]`, `\\{ \\}`).
- Chỗ nào tự gọi `MathJax.typesetPromise` mà không qua `typeset`/`tsP` thì nhớ gọi thêm `mathFit(el)`.
