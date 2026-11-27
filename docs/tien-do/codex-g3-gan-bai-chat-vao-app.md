# Tiến độ: G3 — đưa bài chat vào app

- Nhánh: `codex/g3-gan-bai-chat-vao-app` · PR: #70 · Issue: #65
- Người đang làm: Codex · Cập nhật lần cuối: 27/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu

Mở công tắc trong Ngân hàng câu hỏi → Lý thuyết kiểu chat. Trên màn lý thuyết của giáo viên, dùng Sửa → Bản chat để dán và xem trước.

## Mục tiêu

Nối bài chat vào app, thêm công tắc theo khối và thẻ dán bản chat cho giáo viên.

## Quyết định đã chốt với thầy

Tính mọi chủ đề đã duyệt theo khối. Muốn bật sớm khi còn thiếu bài phải xác nhận. Bài chưa có bản chat vẫn dùng lý thuyết cũ.

## Đã xong (đã commit)

- [x] Nối bản chat vào màn lý thuyết và phần xem lại khi luyện.
- [x] Thêm đếm số bài, liệt kê bài thiếu và bật/tắt theo khối.
- [x] Chỉ thay khối chat khi lưu, giữ bản trước để hoàn tác.
- [x] Kiểm tra hình TikZ được thu thập từ khối baichat.

## Đang làm dở

Không có.

## Việc tiếp theo

Dùng G4 (#66) để thử bài trước khi dán vào app. Sau khi các PR gộp, xem lại khối 7 khi nội dung đã được soạn và duyệt.

## Còn lại

- [ ] Thầy duyệt PR.

## File liên quan

- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/lib/chat-source.js`
- `hoc-cung-cherry/app/api/admin/settings/route.js`
- `hoc-cung-cherry/app/api/admin/topic/route.js`

## Cách kiểm tra

`npm test` 52/52, kiểm tra cú pháp app đã ghép và `next build` với dữ liệu giả. Kiểm tra hai tài khoản mẫu ở 390 × 844: từ chối quyền học sinh, chặn bật khi thiếu bài, xác nhận bật sớm, đổi phiên bản, lưu và giữ nguồn cũ, tải lại tiến độ và tắt lại.

## Lưu ý cho người tiếp quản

Chỉ dùng dữ liệu giả khi kiểm tra. Nhánh dùng mã của PR tiền nhiệm để có thể kiểm tra đủ chức năng.
