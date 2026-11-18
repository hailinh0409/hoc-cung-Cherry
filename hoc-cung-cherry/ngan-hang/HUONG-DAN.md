# Ngân hàng câu hỏi trên máy

Một lần duy nhất: `npm install`, rồi copy `.env.example` thành `.env.local` và điền `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`.

Chạy trong thư mục app (D:\hoc-cung-cherry):

    node --env-file=.env.local scripts/ngan-hang.mjs thongke --khoi 7   # đếm số câu
    node --env-file=.env.local scripts/ngan-hang.mjs keo                # kéo về ngan-hang/lop7, lop8, lop9
    node scripts/ngan-hang.mjs kiemtra ngan-hang                        # kiểm tra cú pháp (không cần .env)
    node --env-file=.env.local scripts/ngan-hang.mjs day --thu          # chạy thử, chưa ghi
    node --env-file=.env.local scripts/ngan-hang.mjs day                # đẩy file đã sửa lên app

Quy ước: sửa file .tex (bỏ qua các dòng `%%%` đầu file, đó là thông tin chủ đề). Muốn thêm chủ đề mới: tạo file
`ngan-hang/lop8/ten-moi.tex` (slug = tên file), thêm dòng `%%% phan: on-tap` cho đề ôn tập. Chủ đề mới luôn ở trạng thái nháp,
thầy duyệt trong app. Chủ đề có sẵn giữ nguyên trạng thái. Không có lệnh xóa; muốn ẩn thì đặt trạng thái ẩn trong app.
Có hình TikZ mới: chạy `scripts/dung-hinh.mjs <slug>` sau khi đẩy.
