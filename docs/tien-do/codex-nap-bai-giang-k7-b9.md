# Tiến độ: Nạp bài giảng Toán 7 Bài 9

- Người đang làm: Codex
- Nhánh `codex/nap-bai-giang-k7-b9` · PR #60 · Issue #53
- Trạng thái: đã nạp và kiểm tra trên web, chờ kiểm tra điện thoại
- Thời điểm ghi: khoảng 16:54 ngày 26/11/2026 (giờ Việt Nam)

## Bắt đầu từ đâu

Trên Học cùng Cherry, mở Toán → Khối 7 → Lý thuyết → Hai đường thẳng song song và dấu hiệu nhận biết. Bản đã duyệt nằm ở `docs/bai-giang/k7-b9-bai-giang.tex`.

## Mục tiêu và quyết định đã chốt

Chỉ thay đúng khối `lythuyet` của `lop7-b9-goc-o-vi-tri-dac-biet-tia-phan-giac-cua-mot-goc`. Giữ nguyên toàn bộ phần `\man` và trạng thái của chủ đề. Đã được duyệt trong chat trước khi ghi.

## Đã xong

- [x] Xác minh PR #59 đã gộp và Vercel đã triển khai thành công.
- [x] Dán đúng khối `lythuyet` qua Sửa lý thuyết của bài đang có. App báo “Đã lưu lý thuyết” và hiện phần Mở đầu mới. Luồng lưu giữ nội dung cũ trong `ltt_topics.ban_truoc`, theo API hiện hành.
- [x] Chạy GitHub Actions **Tự dịch hình TikZ** với đúng slug. Nhật ký đếm 18 khung chưa dịch và kết thúc với **18 hình mới, 0 hình lỗi**.
- [x] Mở lại bài trên app thật bằng Edge qua phiên giáo viên. Xác nhận hình mái nhà đã tải, nút Đặt ê ke đổi sang bước 2/4 và mục lục hiện đủ bốn phần cùng Kết bài.

## Đang làm dở

Chờ kiểm tra trên điện thoại.

## Việc tiếp theo

Mở Bài 9 trên điện thoại theo đường dẫn ở trên, thử **Đặt ê ke** và **Chạm góc** ở phần đầu. Nếu đang mở một phiên từ trước khi dịch hình, thoát bài và mở lại để cập nhật hình.

## Cách kiểm tra

[Lần chạy dịch hình #47](https://github.com/hailinh0409/hoc-cung-Cherry/actions/runs/45796295541). Chỉ cập nhật lý thuyết của chủ đề trên qua phiên giáo viên và các SVG do workflow tạo. PR #60 chỉ thay đổi tài liệu bàn giao.

## File liên quan

- `docs/bai-giang/k7-b9-bai-giang.tex`
- `.github/workflows/tu-dich-hinh.yml`
- `hoc-cung-cherry/app/api/admin/topic/route.js`
