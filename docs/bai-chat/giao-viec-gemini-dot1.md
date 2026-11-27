# Giao việc Gemini · đợt 1 (khối 7)

Thầy dán đoạn dưới vào Gemini, kèm các file đính kèm ghi ở cuối.

---

Chào Gemini. Cậu là người **soạn nội dung** lý thuyết kiểu "chat với Cherry" cho app Học cùng Cherry (Toán, SGK Kết nối tri thức). Codex viết mã, Claude chỉ đạo và duyệt bài. **Khối 7 làm trước**; mọi bài của khối 7 sẽ được viết lại theo kiểu này.

Đọc kĩ `cu-phap.md` (cú pháp khối `baichat` và quy tắc viết ở mục 7), xem bài mẫu `k7-chuyen-ve.tex`, và mở hai bản thử `ban-thu-dai-so.html`, `ban-thu-hinh-hoc.html` để thấy học sinh học thế nào.

**Việc 1. Toán 7 Bài 9 (Hai đường thẳng song song và dấu hiệu nhận biết).**
Viết lại `k7-b9-bai-giang.tex` thành khối `\begin{baichat}…\end{baichat}`:
- Giữ kịch bản, hình và cách đánh số góc theo SGK Hình 3.16.
- Đổi giọng Cherry sang **tớ–cậu**, dùng `\ten` 3–6 lần.
- Đổi `\thungay` thành môi trường `thu` 3–4 phương án, mỗi phương án sai lấy từ lỗi hay gặp và có lời giải thích riêng.
- Thêm `[Nhắc nhanh]` đầu phần nếu cần kiến thức cũ, `[Tự nhớ lại]` cuối mỗi phần.
- Công thức đứng riêng dòng `\[…\]`.

**Việc 2. Toán 7 Bài 4 (Thứ tự thực hiện các phép tính. Quy tắc chuyển vế).**
Hoàn thiện `k7-chuyen-ve.tex`:
- Thêm một `\phan{Thứ tự thực hiện các phép tính}{…}` **trước** phần "Tính chất của đẳng thức", theo mục 1 của bài SGK: biểu thức không có ngoặc, có ngoặc, có lũy thừa với số hữu tỉ.
- Mở đầu hiện tại (quả bưởi) giữ nguyên.
- Các phần sau giữ nguyên, chỉ sửa nếu thấy lỗi.
- Phần mới cần hình: ưu tiên hình mẫu `dang-thuc` để hiện từng bước tính (mỗi dòng một bước, `\theobuoc`, `tinh`). Cần loại hình mẫu chưa có thì **ghi rõ ý tưởng hình ở cuối câu trả lời** để Claude đặc tả, đừng tự bịa lệnh.

**Cách trả lời:**
- Mỗi lần trả lời **một bài**. Dòng đầu: `%%% slug: <slug>`. Sau đó **chỉ** khối `\begin{baichat}…\end{baichat}` (không kèm câu hỏi `\man`).
  - Bài 9: `lop7-b9-goc-o-vi-tri-dac-biet-tia-phan-giac-cua-mot-goc`
  - Bài 4: `lop7-b4-thu-tu-phep-tinh-chuyen-ve`
- Cuối câu trả lời, ngoài khối mã: số lượt nhắn từng phần, chỗ nào cậu không chắc với SGK, hình mẫu còn thiếu (nếu có).
- Bám SGK, diễn đạt lại, không chép nguyên văn. Không "tính mẹo".

File đính kèm: `cu-phap.md`, `k7-chuyen-ve.tex`, `ban-thu-dai-so.html`, `ban-thu-hinh-hoc.html` (trong `docs/bai-chat/`), `docs/bai-giang/cu-phap.md`, `docs/bai-giang/k7-b9-bai-giang.tex`, và trang SGK Toán 7 tập 1 Bài 4 (nếu thầy có).
