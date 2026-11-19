# Kế hoạch dự phòng: Claude dừng giữa chừng, Gemini (trên web) làm tiếp

Dành cho thầy Linh. Áp dụng khi Claude hết lượt dùng, hết bộ nhớ của cuộc trò chuyện, hoặc bị ngắt giữa chừng. Gemini dùng ở **gemini.google.com** (gói Pro của thầy).

## Gemini trên web làm được gì, không làm được gì

- **Làm được:** đọc các file thầy đính kèm, viết mã, chỉ chính xác chỗ cần sửa, soạn câu hỏi và lý thuyết, đọc lỗi kiểm tra và sửa.
- **Không làm được:** tự mở GitHub (kể cả đường link), tự lưu mã lên GitHub, tự ghi vào Supabase. Thầy là người chuyển file qua lại.
- **Nên giao:** việc nhỏ và vừa (sửa giao diện, sửa lỗi đã rõ chỗ, thêm một màn hình đơn giản), soạn câu hỏi và lý thuyết.
- **Nên chờ Claude:** việc chạm nhiều file lõi (chấm bài, tài khoản, cấu trúc dữ liệu), mọi việc ghi thẳng lên dữ liệu thật.

## Claude chuẩn bị sẵn những gì (AGENTS.md mục 7)

Mỗi việc nhiều bước có một **pull request nháp** và một **file tiến độ** `docs/tien-do/<nhánh>.md`: mục tiêu, quyết định đã chốt, đã xong gì, đang dở chỗ nào, còn lại gì, **file liên quan**, cách kiểm tra. Claude lưu lên GitHub sau mỗi bước nhỏ.

## Việc mã nguồn: 5 bước

**1. Tìm việc dở.** Mở https://github.com/hailinh0409/hoc-cung-Cherry/pulls, mở PR nháp của nhánh `claude/…`. Tab *Files changed* → mở file `docs/tien-do/<nhánh>.md`, xem mục **File liên quan**.

**2. Lấy file.** Ở trang repo, đổi nhánh sang `claude/…` (nút chọn nhánh góc trái), bấm **Code → Download ZIP**, giải nén. Đính kèm vào Gemini: `AGENTS.md`, file tiến độ, và các file trong mục **File liên quan**.

**3. Dán câu lệnh này vào Gemini** (sửa phần trong `<…>`):

```
Bạn tiếp quản việc Claude đang làm dở trong app Học cùng Cherry.
Tôi đã đính kèm AGENTS.md (quy tắc chung), file tiến độ docs/tien-do/<nhánh>.md và các file liên quan.
1. Đọc AGENTS.md và file tiến độ. Làm các mục "Đang làm dở" và "Còn lại" theo thứ tự.
   Không làm lại phần "Đã xong". Giữ đúng các "Quyết định đã chốt".
2. Trả kết quả theo từng file. Với mỗi chỗ sửa, viết đúng dạng:
   FILE: <đường dẫn>
   TÌM (chép nguyên văn từ file, đủ dài để chỉ có một chỗ khớp):
   <đoạn cũ>
   THAY BẰNG:
   <đoạn mới>
   File mới tạo thì ghi FILE: <đường dẫn> và toàn bộ nội dung.
   Không sửa public/app.html và lib/items.js (hai file này tự sinh).
3. Cuối cùng, viết lại nội dung mới của file tiến độ (cập nhật "Người đang làm: Gemini", đã xong, còn lại).
Chỗ nào không rõ ý tôi thì hỏi lại, đừng đoán.
```

**4. Dán thay đổi lên GitHub.** Ở trang repo, đang chọn đúng nhánh `claude/…`, bấm phím **`.`** (dấu chấm) để mở trình sửa mã trên web (github.dev). Với mỗi chỗ Gemini đưa: mở file, **Ctrl+H**, dán đoạn TÌM và đoạn THAY BẰNG, bấm thay. Xong hết: biểu tượng nhánh ở thanh bên trái (Source Control) → ghi một dòng mô tả → **Commit & Push**.

**5. Xem kết quả kiểm tra.** Quay lại PR: sau vài phút có dấu ✓ (đạt) hoặc ✗ (lỗi). Nếu ✗: bấm *Details*, chép phần chữ đỏ, dán cho Gemini và nhờ sửa, rồi lặp lại bước 4.

Khi PR có ✓ và thầy đã thử trên app (nếu Vercel có tạo bản xem trước cho PR, đường link nằm trong PR), thầy bấm Merge. Hoặc chờ Claude quay lại xem trước khi gộp.

## Soạn câu hỏi, lý thuyết (không cần GitHub)

1. Đính kèm `docs/soan-bai.md` vào Gemini, nhờ soạn bài theo đúng định dạng trong file.
2. Vào app bằng tài khoản giáo viên → bài cần sửa → **Cài đặt & sửa câu hỏi** → **Sửa toàn bộ LaTeX** (hoặc **Sửa lý thuyết**) → dán mã Gemini soạn → Lưu. App tự báo lỗi cú pháp, chưa lỗi thì mới lưu được. Bài vẫn ở trạng thái thầy đã đặt (nháp/đã duyệt).
3. Bài chưa có trên app: chờ Claude tạo, hoặc dùng `scripts/ngan-hang.mjs` trên máy như hướng dẫn trong `docs/soan-bai.md`.

## Khi Claude quay lại

Nhắn Claude: "xem PR #<số>, Gemini đã làm tiếp". Claude đọc file tiến độ và các commit, xem lại phần Gemini làm, rồi làm tiếp hoặc đóng việc.

## Không giao cho Gemini

- Ghi trực tiếp vào dữ liệu thật trên Supabase (tài khoản, tiến độ học sinh, cấu trúc bảng).
- Đưa Gemini vào bên trong app cho học sinh dùng: điều khoản Gemini API không cho phép với người dưới 18 tuổi (AGENTS.md mục 6).
