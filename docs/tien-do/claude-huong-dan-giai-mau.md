# Tiến độ: Lời giải từng bước — đợt 3 (hướng dẫn soạn, quy trình kiểm tra, bài thử)

- Nhánh: `claude/huong-dan-giai-mau` (nối `claude/bai-mau-chuong` → `claude/loi-giai-tung-buoc`) · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt. **Gộp theo thứ tự #41 → #42 → PR này.**

## Bắt đầu từ đâu
Đọc `docs/gemini-skill-soan-bai.md` mục 3.9 (cú pháp `giaimau`, Bài mẫu, `huongdan` + *Quy trình suy luận và kiểm tra*). Bàn giao đợt 1, 2: `docs/tien-do/claude-loi-giai-tung-buoc.md`, `docs/tien-do/claude-bai-mau-chuong.md`.

## Mục tiêu
Thầy: "Làm tiếp đợt 3, bài tự luận cần cẩn thận, logic, sát chương trình nên nhớ dặn Claude và Gemini suy luận kĩ và kiểm tra."

## Quyết định đã chốt với thầy
- Mọi bài tự luận, bài giải mẫu, hướng dẫn tự luận phải theo **quy trình suy luận và kiểm tra bắt buộc** (giải hai cách/thử lại, sát SGK KNTT đến bài `\saubai`, logic từng bước, đáp án sai của `\doan` thật sự sai, sơ đồ khớp, tính tọa độ hình, đọc lại như học sinh, ghi "Đã tự kiểm tra" + chỗ chưa chắc).

## Đã xong (đã commit)
- [x] `docs/gemini-skill-soan-bai.md`: mục **3.9** (cú pháp đầy đủ ba chỗ dùng + quy trình 9 bước); mục 3.4 khuyên dùng `huongdan` thay `\goiy`; mục 6 thêm mục kiểm tra 11.
- [x] `docs/soan-bai.md`: mục *Bài giải mẫu từng bước, Bài mẫu theo chương, hướng dẫn tự luận* (tóm tắt + quy trình).
- [x] `docs/soan-bai-mau.txt`: mẫu lệnh nhờ Gemini/Claude soạn một bài mẫu.
- [x] App: nút **Sao chép yêu cầu cho Gemini** trong hộp Bài mẫu của chương (giáo viên): chép yêu cầu có sẵn chương, mã và tên các bài, cú pháp, quy trình kiểm tra (`bmAsk`, `client/app.js`). Không chép được thì hiện ô chữ để chọn.
- [x] Sửa: `\saubai` đọc sau khi bỏ dòng chú thích `%`.
- [x] Bài thử (đều đã qua bộ đọc, không lỗi):
  - `docs/mau/bai-mau-chuong.tex` (hình, lớp 9 chương 5, sau `k9-b16`). Khi kiểm tra "sát chương trình" phát hiện bước `OH·OA=R^2` dùng hệ thức lượng `b^2=ab'` (không phải nội dung chính SGK KNTT 9) → sửa thành chứng minh bằng `△OHB ∽ △OBA` (g.g, lớp 8). Tọa độ hình kiểm bằng Python (tiếp điểm, vuông góc, trung điểm, giao điểm đúng, sai số do làm tròn √3). 21 khung dịch thật bằng xelatex (đợt 1).
  - `docs/mau/bai-mau-dai-so-voi-nuoc.tex` (đại số, lớp 9 chương 1, sau `k9-b3`): hai cách giải (sympy) cùng ra 12 giờ, 8 giờ; thử lại vào đề; không dùng đặt ẩn phụ; đáp án sai của `\doan` thật sự sai. Chạy thử trên app 390×844, 12 màn, không lỗi.
  - `docs/mau/thu-tl-rut-gon-can.tex` (đề TL thử, lớp 9 chương 3): `huongdan` 5 bước + sơ đồ; kiểm bằng sympy (từng ngoặc, P, thay số x = 1/4, 4), câu b không cần phương trình bậc hai.
- [x] Skill `nap-bai-leo-thap` của Claude: thẻ đề xuất trong chat (cú pháp + quy trình); thầy bấm lưu.

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy gộp #41 → #42 → PR này; dán `docs/mau/bai-mau-chuong.tex` (chương 5 lớp 9) và `docs/mau/bai-mau-dai-so-voi-nuoc.tex` (chương 1) bằng **+ Dán bài mẫu**, chờ 15 phút cho hình, xem thử rồi Duyệt.
- Nhờ Gemini soạn 3–5 bài mẫu mỗi chương bằng nút **Sao chép yêu cầu cho Gemini**; thầy hoặc Claude rà theo quy trình trước khi duyệt.
- Sau đó: bài tương tự giấu bớt bước.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3): `npm test` 37/37, build đạt.

## File liên quan
- `docs/gemini-skill-soan-bai.md` (3.4, 3.9, 6), `docs/soan-bai.md`, `docs/soan-bai-mau.txt`
- `docs/mau/bai-mau-chuong.tex`, `docs/mau/giaimau-tiep-tuyen.tex`, `docs/mau/bai-mau-dai-so-voi-nuoc.tex`, `docs/mau/thu-tl-rut-gon-can.tex`
- `hoc-cung-cherry/client/app.js` (`bmAsk`, `bmAfter`)

## Lưu ý cho người tiếp quản
- Chưa chắc (cần thầy xác nhận): tính chất hai tiếp tuyến cắt nhau nằm ở Bài 16 KNTT 9 (bài mẫu tiếp tuyến đặt `\saubai{k9-b16}`).
- Khi rà bài Gemini soạn: ưu tiên kiểm lời giải bằng sympy, tọa độ hình bằng Python, dịch khung bằng xelatex (máy làm việc của Claude có sẵn).
