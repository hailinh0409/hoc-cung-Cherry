# Bàn giao cho Claude — Lý thuyết tương tác Học cùng Cherry

## Trạng thái đã xác minh ngày 25/11/2026

Nhánh `main` đã có cả hai thay đổi dưới đây. Lần triển khai Vercel của commit `2deea09` đã thành công.

- **#24** thêm lý thuyết tương tác, mục tra cứu trên bản đồ, cửa sổ xem lại trong lúc luyện và phần xem trước cho giáo viên. [PR #24](https://github.com/hailinh0409/hoc-cung-Cherry/pull/24)
- **#25** đồng nhất bố cục giữa bài dựng sẵn và bài soạn từ LaTeX. [PR #25](https://github.com/hailinh0409/hoc-cung-Cherry/pull/25)

## Học sinh và giáo viên đang dùng thế nào?

- Học sinh vào một bài trên bản đồ hoặc mở mục **Lý thuyết** để tra cứu. Trong bài luyện thường và các lượt làm lại có gắn chủ đề, nút quyển sách mở lý thuyết ngay trên câu đang làm. Đóng cửa sổ sẽ quay lại cùng câu, đáp án đang nhập, điểm và số tim. Quyền mở lý thuyết và điều kiện mở lượt luyện tập được xét riêng. Chế độ Thi đấu và đề kiểm tra vẫn dùng luồng hiện tại.
- Mỗi mục học tương tác dùng một bố cục chung gồm lời dẫn Cherry, hình hoặc thao tác nếu có, giải thích, ví dụ và câu **Thử ngay**. Có nhiều mục thì hiện nút chọn ở đầu bài. Màn hình rộng đặt minh họa cạnh phần giải thích và ví dụ. Điện thoại xếp dọc. Màn học, cửa sổ xem lại và bản xem trước của giáo viên dùng chung cách hiển thị. Bài cũ chỉ có tóm tắt vẫn đọc được.
- Giáo viên sửa bài đang có qua **Học lý thuyết → Sửa lý thuyết**. Chỉ dán khối `lythuyet`, bấm thử hình và cả hai đáp án trong bản xem trước rồi lưu. Việc lưu giữ nguyên phần câu hỏi từ `\man{1}` đến cuối, gồm các dòng `%@`. Bài mới tiếp tục đi qua nháp và chỉ hiển thị cho học sinh sau khi thầy duyệt.

## Hai bài lớp 6 để đối chiếu

- **Bài 1. Tập hợp (`k6-b1`)** có hai mục mẫu dựng sẵn về phần tử thuộc tập hợp và hai cách mô tả tập hợp. Bản dựng sẵn được dùng khi bài chưa có nội dung tương tác do giáo viên soạn. Khi giáo viên thêm lệnh tương tác, bài ưu tiên nội dung LaTeX đã lưu.
- **Bài 2. Cách ghi số tự nhiên (`k6-b2`)** là ví dụ đọc hoàn toàn từ LaTeX. Hai mục là **Hệ thập phân** và **Số La Mã**. Thử chạm chữ số **4** trong **2 485** để thấy **4**, **400** và **24** biểu thị ba điều khác nhau. Thử ghép **X + X + IV** thành **XXIV**. Ảnh thầy gửi đã cho thấy nội dung tương tác trong giao diện giáo viên. Nếu cần kiểm tra trạng thái bài, mở đúng bài trên app. Các PR này không ghi trực tiếp vào Supabase thật. [Khối LaTeX lý thuyết mẫu](vi-du/k6-b2-ly-thuyet.tex)

## Cú pháp để soạn bài tiếp theo

Một bài vẫn tương ứng một khối mã. Trong `lythuyet`, mỗi `\loidan{...}` mở một mục. App lấy tiêu đề đầu tiên trong mục để đặt tên nút chọn. Giữ các lệnh giải thích và ví dụ vốn có, chẳng hạn `\quytac`, `\congthuc`, `\luuy` và `\vidu`.

```latex
\loidan{Lời của Cherry}
\minhhoa{gia-tri-theo-hang}{2485}
\minhhoa{ghep-so-la-ma}{24}
\thungay{Câu hỏi}{Đáp án đúng}{Đáp án sai}{Vì sao đúng}{Cách sửa lỗi sai}
```

Hai dòng `\minhhoa` ở trên minh họa hai mẫu đang có. Mẫu giá trị theo hàng nhận số tự nhiên tối đa 12 chữ số, viết liền và có thể dùng riêng số 0. Mẫu La Mã nhận số nguyên từ 1 đến 39. Câu **Thử ngay** tự đổi vị trí hai đáp án và nằm ngoài lượt luyện có chấm điểm. Các mẫu kéo thả hình học và thanh phân số vẫn là ý tưởng. Nếu bài cần hình tĩnh thì dùng quy trình TikZ của repo. [Quy chuẩn soạn bài](soan-bai.md) · [Mẫu lệnh cho Gemini hoặc Claude](soan-man-tuong-tac.txt)

## Mã nguồn và cách kiểm tra

- `hoc-cung-cherry/lib/latex.js` đọc và kiểm tra các lệnh tương tác. `client/lesson.js` chia mục, dựng mẫu và xử lý thao tác bằng JavaScript trong trình duyệt. `client/lesson.css` giữ bố cục dùng chung. `client/app.js` nối màn lý thuyết, lượt luyện và phần chỉnh sửa. `client/body.html` chứa cửa sổ xem lại. Các đường dẫn `client/` ở đây nằm dưới `hoc-cung-cherry/`.
- Khi đổi giao diện, sửa file nguồn rồi chạy `node scripts/build-app.mjs` để sinh lại `public/app.html`. Lần bàn giao này đã qua `npm ci`, kiểm tra cú pháp, `npm test` **21/21**, build Next.js với dữ liệu giả, GitHub Actions và Vercel. PR #24 đã bổ sung mục SWC còn thiếu theo nền tảng trong lockfile, giữ các phiên bản cũ.
- Đã thử với vai trò học sinh và giáo viên ở **390×844** và **1366×900**. Khi chạm vào nội dung này, thử chuyển qua lại giữa hai mục để kiểm tra câu trả lời vẫn còn, mở lý thuyết giữa lượt luyện để kiểm tra trạng thái câu, và đối chiếu nguyên văn phần bài tập trước và sau khi lưu lý thuyết. Dùng dữ liệu giả theo [AGENTS.md](../AGENTS.md).

## Tiêu chí cho các bài sau

1. Bám sát SGK Toán **Kết nối tri thức** theo đúng khối, bài, trình tự, thuật ngữ và phạm vi. Diễn đạt bằng lời của mình.
2. Làm phần học trực quan và tương tác hơn trang sách để học sinh mức trung bình theo kịp. Dẫn từ ví dụ cụ thể, giải thích vì sao, cho học sinh thử và phản hồi đúng lỗi. Dùng một ví dụ mới để kiểm tra các em có tự giải thích hoặc áp dụng được ý chính.

Các ghi chú tiến độ của #24 và #25 phản ánh lúc PR còn chờ duyệt. Dùng trạng thái ở đầu tài liệu này và nhánh `main` để tiếp quản.
