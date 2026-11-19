# Kế hoạch dự phòng: Claude dừng giữa chừng, Gemini làm tiếp

Dành cho thầy Linh. Áp dụng khi Claude hết lượt dùng, hết bộ nhớ của cuộc trò chuyện, hoặc bị ngắt giữa chừng.

## Vì sao làm được

Claude không giữ việc dở trong đầu mà ghi hết lên GitHub (AGENTS.md mục 7):

- Mỗi việc có **một pull request nháp mở ngay từ đầu**, và **một file tiến độ** `docs/tien-do/<nhánh>.md` ghi: mục tiêu, quyết định đã chốt, đã xong gì, đang dở chỗ nào, còn lại gì, cách kiểm tra.
- Claude **commit và đẩy lên sau mỗi bước nhỏ**, nên khi dừng đột ngột thì việc mất tối đa là bước đang làm.

Gemini chỉ cần đọc pull request đó là biết làm tiếp từ đâu.

## Bước 1. Tìm việc đang dở (1 phút)

Mở https://github.com/hailinh0409/hoc-cung-Cherry/pulls. Việc dở là pull request **Draft** của nhánh `claude/…`. Mở tab *Files changed*, tìm file `docs/tien-do/<nhánh>.md`, đọc mục **Đang làm dở** và **Còn lại**.

## Bước 2. Giao cho Gemini (chọn một cách)

**Cách A — Antigravity (công cụ lập trình của Google chạy Gemini, cài trên máy tính).**
Google đã dừng Jules (chỉ còn xem từ 11/11/2026, đóng hẳn 31/12/2026) và chuyển sang Antigravity; Gemini CLI cũng được thay bằng Antigravity CLI.
Cài đặt một lần (chi tiết: `docs/cai-antigravity.md`): cài Antigravity trên máy, đăng nhập tài khoản Google; `git clone` repo `hailinh0409/hoc-cung-Cherry` vào một thư mục **mới** (không dùng bản cũ ở ổ D); đăng nhập GitHub trên máy để đẩy được nhánh.
Mỗi lần giao việc: mở thư mục repo trong Antigravity, chuyển sang nhánh dở (`git checkout claude/…`), dán câu lệnh mẫu ở Bước 3. Antigravity sửa file, commit và đẩy lên đúng nhánh, pull request tự cập nhật.

**Cách B — Gemini trên web (gemini.google.com).** Gemini web không tự commit được:
1. Trong Gemini, nhập repo GitHub (nút thêm tệp → nhập mã nguồn, nếu có) hoặc dán nội dung file tiến độ và các file liên quan.
2. Dán câu lệnh mẫu ở Bước 3, yêu cầu Gemini trả về **toàn bộ nội dung của từng file cần sửa**.
3. Thầy mở file đó trên GitHub (đúng nhánh `claude/…`), bấm ✏️, dán nội dung mới, *Commit changes* vào cùng nhánh.
Cách này chậm và dễ sót; chỉ dùng cho việc nhỏ.

**Cách C — Soạn câu hỏi, lý thuyết.** Không cần GitHub. Gemini soạn theo `docs/soan-bai.md`, xuất ra file `.tex`; thầy lưu vào `ngan-hang/lop<khối>/` rồi chạy `kiemtra` và `day` như trong file đó.

## Bước 3. Câu lệnh mẫu cho Gemini

```
Bạn tiếp quản một việc Claude đang làm dở trong repo hailinh0409/hoc-cung-Cherry.
1. Đọc AGENTS.md (quy tắc chung) và docs/tien-do/<nhánh>.md (tiến độ).
2. Làm tiếp trên đúng nhánh <nhánh>, đúng pull request #<số>. Không tạo nhánh mới,
   không sửa lại phần đã ghi là "Đã xong" trừ khi thấy lỗi.
3. Làm các mục "Đang làm dở" và "Còn lại" theo thứ tự. Sau mỗi mục: commit, đẩy lên,
   cập nhật file tiến độ (ghi "Người đang làm: Gemini").
4. Chạy các lệnh kiểm tra ở AGENTS.md mục 3 và ghi kết quả vào pull request.
5. Không tự gộp vào main. Không đụng dữ liệu học sinh trên Supabase. Không đưa khóa bí mật lên GitHub.
Nếu chỗ nào không rõ ý thầy, dừng lại và hỏi thầy, đừng đoán.
```

## Bước 4. Khi Claude quay lại

Nhắn Claude: "xem PR #<số>, Gemini đã làm tiếp". Claude đọc lại file tiến độ và các commit của Gemini, xem lại phần Gemini làm, rồi làm tiếp hoặc đóng việc. Thầy vẫn là người bấm Merge.

## Những việc Gemini không nên tiếp quản

- **Ghi trực tiếp lên Supabase thật** (tài khoản, tiến độ học sinh, thay đổi cấu trúc bảng): để thầy tự chạy sau khi đọc, hoặc chờ Claude.
- **Đưa Gemini vào bên trong app cho học sinh dùng**: điều khoản Gemini API không cho phép với người dưới 18 tuổi (AGENTS.md mục 6). Gemini vẫn được viết mã cho các tính năng AI, miễn mô hình chạy trong app là loại được phép.
