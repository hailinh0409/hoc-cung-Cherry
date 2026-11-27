# Tiến độ: Bàn giao lý thuyết kiểu chat với Cherry

- Nhánh: `claude/bai-chat-ban-giao` · PR: #67
- Người đang làm: Claude · Cập nhật lần cuối: 27/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đọc `docs/bai-chat/ke-hoach.md` (việc G1–G4 cho Codex) và `docs/bai-chat/cu-phap.md`. Mở hai bản thử `docs/bai-chat/ban-thu-*.html` bằng trình duyệt để thấy chuẩn giao diện.

## Mục tiêu
Thầy: "Viết bàn giao trên Github để Codex viết mã cho phần lý thuyết kiểu mới (chat với Cherry). Trong phần chat thì Cherry gọi tên của học sinh (tên thật) xưng hô kiểu bạn bè. Trên Artifact của Claude, tạo thêm một phần nạp mã để kiểm tra trước khi nạp lên app. Phần soạn thảo nội dung vẫn để Gemini soạn. Codex lo phần viết mã, Gemini soạn nội dung bài, Claude lo phần chỉ đạo."

## Quyết định đã chốt với thầy
- Cherry xưng "tớ", gọi học sinh bằng tên riêng thật hoặc "cậu".
- Bài cũ: viết lại hết rồi mới bật, theo từng khối lớp (công tắc `bai_chat_khoi`). Bản chat nằm trong khối `baichat` cạnh `lythuyet` cũ.
- Trang xem thử trên Artifact chỉ để xem và báo lỗi; thầy sao chép rồi dán vào trang quản trị app.
- Hình: TikZ tĩnh + thư viện hình mẫu tương tác (`cat-tuyen`, `can`, `dang-thuc`).
- Công thức đứng riêng dòng, căn giữa.
- Hình nằm trong dòng chat (không ghim), không cần thu nhỏ hình; có trang tóm tắt.

## Đã xong (đã commit)
- [x] `docs/bai-chat/ke-hoach.md`, `cu-phap.md`, `k7-chuyen-ve.tex`, hai bản thử.
- [x] `AGENTS.md`: thêm dòng trỏ tới kế hoạch mới.
- [x] Issue cho Codex G1–G4; đóng #52, #53, #54 (thay bằng kế hoạch mới).

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy chọn khối soạn trước để Gemini bắt đầu.
- Sau khi G4 gộp: Claude đăng trang xem thử lên Artifact, cập nhật `docs/gemini-skill-soan-bai.md`.

## Còn lại
- [ ] Thầy duyệt và gộp PR.

## File liên quan
- `AGENTS.md`
- `docs/bai-chat/ke-hoach.md`
- `docs/bai-chat/cu-phap.md`
- `docs/bai-chat/k7-chuyen-ve.tex`
- `docs/bai-chat/ban-thu-dai-so.html`, `docs/bai-chat/ban-thu-hinh-hoc.html`
- `docs/bai-giang/cu-phap.md`, `docs/bai-giang/k7-b9-bai-giang.tex`

## Cách kiểm tra
Chỉ có tài liệu; không đổi mã. Bài mẫu đã soát bằng tay: không có công thức có dấu bằng nằm trong câu chữ.

## Lưu ý cho người tiếp quản
Không ghi gì lên Supabase. Chủ đề Bài 4 Toán 7 trên app: `lop7-b4-thu-tu-phep-tinh-chuyen-ve`.
