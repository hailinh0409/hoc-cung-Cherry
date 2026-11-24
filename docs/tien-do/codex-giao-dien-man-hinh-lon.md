# Giao diện Cherry trên màn hình lớn

- Nhánh địa phương `codex/giao-dien-man-hinh-lon`, dựa trên `main` tại `166ff236`.
- Người thực hiện Codex, 24/11/2026.
- Bản vá đã kiểm tra với dữ liệu giả. Kết nối GitHub hiện không có quyền tạo nhánh từ xa.

## Mục tiêu

Tận dụng chiều rộng trên iPad và máy tính, đồng thời giữ giao diện một cột trên điện thoại.

## Thay đổi

- Gỡ giới hạn 480 px của khung ứng dụng. Dùng chiều rộng phù hợp cho biểu mẫu, danh sách, bản đồ và màn làm bài.
- Dùng cùng hệ tọa độ tương đối cho các nút bài học và đường đi trên bản đồ để khi xoay máy chúng vẫn khớp.
- Dành một cột riêng cho bàn phím đáp số khi màn hình đủ rộng nhưng thấp. Trình duyệt thiếu hỗ trợ bộ chọn CSS tương ứng tiếp tục dùng bàn phím bên dưới.
- Dùng chiều cao dự phòng cho trình duyệt thiếu hỗ trợ `dvh`.

## Kiểm tra

- Ghép lại `public/app.html` bằng `node scripts/build-app.mjs` và kiểm tra cú pháp JavaScript.
- `npm test` qua 19 kiểm thử. Build Next.js với `FAKE_DB=1` thành công bằng bộ phụ thuộc sẵn có.
- Kiểm tra bằng tài khoản mẫu qua màn đăng nhập, chọn môn, chọn khối, bản đồ, làm bài và ngân hàng câu hỏi. Dùng các khổ mô phỏng từ 320 px đến 1440 px.
- Cần thử thêm trên Safari iPad thật trước khi gộp.

## File liên quan

- `hoc-cung-cherry/client/responsive.css` điều chỉnh bố cục theo kích thước màn hình.
- `hoc-cung-cherry/client/app.js` điều chỉnh tọa độ bản đồ trong `journey()`.
- `hoc-cung-cherry/scripts/build-app.mjs` đưa CSS mới vào bản ghép.
- `hoc-cung-cherry/public/app.html` được sinh từ mã nguồn. Nếu gộp với PR khác làm đổi file này, chạy lại script sau khi gộp mã nguồn.
