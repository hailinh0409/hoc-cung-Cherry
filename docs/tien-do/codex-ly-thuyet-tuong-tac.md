# Tiến độ: Lý thuyết tương tác trong Học cùng Cherry

- Nhánh: `codex/ly-thuyet-tuong-tac` · PR #24.
- Người đang làm: Codex
- Trạng thái: xong, chờ thầy duyệt

## Mục tiêu

Đưa quy trình soạn và xem lý thuyết tương tác từ bản thử vào app thật.

## Quyết định đã chốt

- Bám sát SGK Toán Kết nối tri thức. Ví dụ, hình minh họa, thao tác và phản hồi cần giúp học sinh mức trung bình hiểu bài.
- Giữ nguyên phần bài tập và trạng thái câu đang làm khi học sinh quay lại từ phần lý thuyết.
- Người soạn sử dụng các mẫu được app hỗ trợ trong cùng khối LaTeX.

## Đã xong

- [x] Đối chiếu nhánh `main`, các PR và issue đang mở.
- [x] Thêm thư mục Lý thuyết trên bản đồ và cửa sổ xem lại giữa lượt luyện bài thường. Giữ nguyên số câu, đáp án, điểm và số tim đang có khi quay lại.
- [x] Thêm `\loidan`, `\minhhoa`, `\thungay` và bản xem trước của giáo viên. Bài Tập hợp có minh họa có sẵn khi chưa có nội dung tương tác do giáo viên nhập. Bài Cách ghi số tự nhiên có khối LaTeX để dán riêng vào phần lý thuyết.
- [x] Bổ sung các gói SWC theo nền tảng còn thiếu trong lockfile để cài sạch. Các phiên bản thư viện giữ nguyên.

## Đang làm dở

- Chờ chủ dự án duyệt và gộp PR.

## Còn lại

- [x] Chạy kiểm tra tự động và thử trên Chrome.
- [ ] Sau khi Vercel triển khai `main`, mở **Cách ghi số tự nhiên → Học lý thuyết → Sửa lý thuyết**, dán `docs/vi-du/k6-b2-ly-thuyet.tex`, thử tương tác rồi lưu. Bước này chỉ thay nội dung lý thuyết.

## File liên quan

- `AGENTS.md`
- `docs/soan-bai.md`
- `docs/soan-man-tuong-tac.txt`
- `docs/vi-du/k6-b2-ly-thuyet.tex`
- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/client/lesson.js`

## Cách kiểm tra

Ghép giao diện, kiểm tra cú pháp, chạy `npm test` (21/21) và `next build` với dữ liệu giả. Dùng Chrome ở 390×844 và 1366×900 để thử hai bài mẫu, mở và đóng lý thuyết khi đang làm, hoàn thành lượt luyện 8 câu. Thử lưu lý thuyết ở vai trò giáo viên và đối chiếu phần câu hỏi trước và sau theo từng ký tự.

## Lưu ý cho người tiếp quản

Chưa ghi dữ liệu vào Supabase.
