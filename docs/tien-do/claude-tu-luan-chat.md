# Tiến độ: Chặng Tự luận trên bản đồ (bài tự luận chat cùng Cherry)

- Nhánh: `claude/tu-luan-chat` · PR: #78
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Bài tự luận dùng lại chủ đề Bài mẫu (`phan = 'bai-mau'`, `chuong = 'k<khối>-c<chương>'`, khối `\begin{giaimau}`), thêm ba lệnh tùy chọn sau mỗi `\buocgiai`: `\huong`, `\goiy`, `\kiemtra` (`lib/latex.js`, `parseGiaiMau`). Giao diện chat: `client/tuluan.js` (`renderTuLuan`), `client/tuluan.css`. Chặng trên bản đồ, danh sách bài, rương: `client/app.js` (tìm `Chặng Tự luận`, `withTL`, `tlStat`, `bmList`, `bmShow`). Chạy: `cd hoc-cung-cherry && node scripts/build-app.mjs && npm test`.

## Mục tiêu
Thầy (28/11/2026): dạng Toán tự luận có Cherry hướng dẫn từng bước theo phong cách chat. Thầy chọn bản thử 1 (không sơ đồ đi lên): https://claude.ai/artifact/GSpC2Z72PKK78VqkwA1aEg . "Yêu cầu Claude tự triển khai luôn phần này, cú pháp cho Gemini cũng viết để tôi chỉ cần copy."

## Quyết định đã chốt với thầy
- Bài tự luận là **một chặng riêng trên bản đồ**, đứng **giữa Luyện tập chung (bài cuối chương) và chương mới**; bên cạnh có **rương kho báu nhỏ**.
- **Số bài mở**: thầy tự thêm (mặc định nên 2 bài: bài 1 vừa sức, bài 2 có ý phân loại).
- **Rương mở khi làm trọn 2 bài bất kỳ** trong chặng (đi hết mọi câu; dùng gợi ý vẫn tính). Rương đã mở không bị lấy lại khi thầy thêm bài.
- **Không khóa đường đi**: bỏ qua chặng tự luận vẫn sang chương mới được, chỉ không có quà.
- **Không báo điểm** tự luận; tài khoản giáo viên **chỉ thấy đánh dấu** em nào đã làm.
- Kiểu chat **bản thử 1, không sơ đồ đi lên**: mỗi bước Cherry nêu mục tiêu và hướng → học sinh viết vào vở (bí thì xin gợi ý) → câu kiểm tra nhỏ (2 lần thử) → hiện dòng trình bày mẫu để so với vở. Hình ghim trên cùng, phần đang dùng tô cam.
- Cherry xưng "tớ" – "cậu", gọi học sinh bằng tên thật.

## Đã xong (đã commit)
- [x] `lib/latex.js`: `\huong{…}`, `\goiy{…}` (≤ 3), `\kiemtra{…}` (trắc nghiệm như `\doan`, hoặc nhập số `{=đáp số}` + đáp số sai hay gặp) gắn vào `\buocgiai` đứng trước; báo lỗi khi đặt sai chỗ/thiếu/đáp số không phải số; `huongdan` (Ôn tập) không nhận các lệnh này. Bài mẫu cũ vẫn đọc được.
- [x] `client/tuluan.js` + `tuluan.css`: chat kiểu bản thử 1 (đề + hình → mỗi câu → đoán hướng `\doan` → mỗi bước: mục tiêu + hướng, "Tớ viết xong"/"Tớ bí rồi" (gợi ý từng bậc, hết gợi ý thì "Cho tớ xem bước này"), câu kiểm tra 2 lần thử, dòng trình bày + "Vì sao?"), hình ghim thu nhỏ/phóng to, nút Đề và Tờ lời giải, cuối bài: lời giải đầy đủ + danh sách tự kiểm vở. Công thức không cắt/không thu nhỏ; dòng chỉ có một công thức thì đặt riêng căn giữa, cuộn ngang nếu dài; công thức dính liền dấu câu sau nó. Sơ đồ `sodo` bỏ qua.
- [x] Tiến độ lưu theo câu: `P.bm[mã] = {d, f, n, c: số câu xong, x: làm trọn}`; mở lại thì "Làm tiếp Câu b / Làm lại từ đầu". ⭐ chỉ cộng lần đầu làm trọn (đúng ngay +10, lần 2 +4, đoán hướng +5/+2, mỗi gợi ý −2, bước không có câu hỏi +3). Bản cũ `{d,f,n}` (đã xem hết) tính là làm trọn. `mergeP` gộp `bm`, `tlr` giữa hai máy.
- [x] Bản đồ: chặng **Tự luận** (biểu tượng vở + bút) chèn sau bài cuối mỗi chương (`withTL`), rương nhỏ bên cạnh ghi `0/2`, `Mở được!`, `Đã mở`. Học sinh chỉ thấy khi chương có bài đã duyệt; giáo viên luôn thấy (kèm số bài nháp). Bỏ nút "Bài mẫu" trên biển chương.
- [x] Danh sách bài TL1, TL2…: ✓ Đã làm trọn / Đang làm · xong c/n câu / Chưa làm / khóa ("Mở khi em qua Bài …", giữ quy tắc `\saubai` cũ); nhãn "Mới" cho bài chưa làm khi rương đã mở. Hộp rương + nút **Mở rương** (+50 XP, `P.tlr['k<khối>-c<chương>']`). Chương chỉ có 1 bài thì làm trọn bài đó là mở rương.
- [x] Giáo viên: **+ Dán bài tự luận** (kiểm tra lỗi, chạy thử chat ngay trong hộp, lưu Nháp), Xem thử / Sửa / Duyệt; **Sao chép yêu cầu cho Gemini** dùng cú pháp mới. **Theo dõi khối** có cột *Tự luận*: `✓ số bài đã làm trọn · 🎁 số rương` (không điểm).
- [x] Hướng dẫn soạn để chép cho Gemini: `docs/tu-luan/yeu-cau-gemini.md`; 2 bài mẫu: `docs/tu-luan/mau-hinh-tiep-tuyen.tex` (lớp 9 chương 5, sau `k9-b16`), `docs/tu-luan/mau-dai-so-viete.tex` (lớp 9 chương 6, sau `k9-b20`); trỏ từ `AGENTS.md` và `docs/gemini-skill-soan-bai.md` mục 3.9.
- [x] Test `tests/tu-luan.test.mjs` (59/59).

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy gộp PR, vào khối 9 → chặng Tự luận chương 5 → **+ Dán bài tự luận** → dán `docs/tu-luan/mau-hinh-tiep-tuyen.tex`; chương 6 dán `mau-dai-so-viete.tex`; chờ 15 phút cho hình; Xem thử rồi **Duyệt**.
- Bài mẫu cũ đã có trên app (nếu có) tự hiện trong chặng Tự luận nhưng chưa có `\huong`/`\kiemtra`: nên nhờ Gemini bổ sung theo `yeu-cau-gemini.md`.
- Chưa làm: Ôn tập tự luận (`extl` + `huongdan`) theo kiểu chat chế độ tự làm (thầy đã bàn: tự viết trước, gọi Cherry khi bí, không có lời giải chi tiết). Hiện Ôn tập vẫn mở gợi ý kiểu cũ.
- Cập nhật skill `nap-bai-leo-thap` của Claude (trong tài khoản thầy) theo cú pháp mới.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `docs/tu-luan/yeu-cau-gemini.md`, `docs/tu-luan/mau-hinh-tiep-tuyen.tex`, `docs/tu-luan/mau-dai-so-viete.tex`
- `hoc-cung-cherry/lib/latex.js` (`parseGiaiMau`)
- `hoc-cung-cherry/client/tuluan.js`, `hoc-cung-cherry/client/tuluan.css`
- `hoc-cung-cherry/client/app.js` (`withTL`, `tlStat`, `tlChest`, `bmList`, `bmShow`, `bmPaste`, `bmAsk`, `TL_SYNTAX`, `TL_CHECKLIST`, `track`, `mergeP`)
- `hoc-cung-cherry/scripts/build-app.mjs`
- `hoc-cung-cherry/tests/tu-luan.test.mjs`

## Cách kiểm tra
- `npm test` 59/59; `node scripts/build-app.mjs`; `FAKE_DB=1 SESSION_SECRET=… npx next build`: đạt.
- Chạy thử bằng dữ liệu giả (tạm thêm 2 bài tự luận + 1 bài nháp vào chương 1 khối 6, đã trả lại `tests/seed.json`), Chrome 390×844:
  - Học sinh: chặng Tự luận nằm giữa Luyện tập chung chương 1 và biển Chương 2, rương 0/2; làm trọn bài hình (13 bước) và bài đại số (8 bước, có 2 câu nhập số) → ⭐ cộng, danh sách ✓ 2 bài → **Mở rương** +50 XP → bản đồ "Đã mở". Mở lại sau khi gộp dữ liệu máy chủ vẫn giữ ✓ và rương.
  - Giáo viên: chặng có nhãn "1 nháp"; Dán bài tự luận báo lỗi đúng (`\huong` sai chỗ, đáp số không phải số), chạy thử chat trong hộp, lưu Nháp; Theo dõi khối có cột Tự luận "✓ 2 · 🎁1".
  - Không có lỗi JavaScript.

## Lưu ý cho người tiếp quản
- Không ghi gì lên Supabase. Không cần bảng mới: bài tự luận vẫn là `ltt_topics` với `phan = 'bai-mau'`.
- Khóa của `P.bm` là mã chủ đề trên app (slug), không phải id.
- `\kiemtra` nhập số chỉ nhận số nguyên, thập phân (dấu phẩy hoặc chấm) hoặc phân số `a/b`.
