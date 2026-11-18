# Học cùng Cherry · CLB Toán - Anh NGỌC LINH

App bài tập Toán dạng game trên điện thoại. Giao diện giống hệt bản thử trên artifact; dữ liệu lưu ở Supabase (project `bmfysidpeyzxkgmfzdcl`, các bảng `ltt_*`).

## Triển khai lên Vercel (một lần)

1. **Đưa mã lên GitHub:** tạo repo mới (ví dụ `hoc-cung-cherry`), tải toàn bộ thư mục này lên.
2. **Vercel → Add New → Project →** chọn repo, giữ mặc định (Next.js), rồi vào **Environment Variables** thêm 3 biến:
   | Tên | Giá trị |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://bmfysidpeyzxkgmfzdcl.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → **service_role** (giữ bí mật) |
   | `SESSION_SECRET` | một chuỗi ngẫu nhiên dài ≥ 32 ký tự (tạo bằng lệnh bên dưới) |

   Tạo `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Bấm **Deploy**. Xong sẽ có địa chỉ dạng `https://hoc-cung-cherry.vercel.app`.
4. **Tạo tài khoản giáo viên** (chạy trên máy, trong thư mục này, sau khi tạo file `.env.local` chứa 3 biến trên):
   ```bash
   npm install
   node --env-file=.env.local scripts/create-teacher.mjs thaylinh "MatKhauManh123" "Phan Hải Linh"
   ```
   Chạy lại lệnh này với mật khẩu khác để đổi mật khẩu.
5. Mở app → **Giáo viên đăng nhập** → **Tài khoản học sinh** → dán danh sách, mỗi dòng `Họ tên; khối; môn` (môn: `Toán`, `Anh` hoặc `Toán Anh`). Mật khẩu mặc định của học sinh là `0000`.
6. Gửi link cho học sinh. Trên điện thoại: mở link → Chia sẻ → **Thêm vào Màn hình chính** để dùng như app.

## Cấu trúc

- `client/` — mã giao diện (một trang). `scripts/build-app.mjs` ghép thành `public/app.html` và sinh `lib/items.js` (danh mục vật phẩm cho máy chủ). Sửa giao diện xong chạy `node scripts/build-app.mjs`.
- `app/api/` — máy chủ: đăng nhập, đồng bộ, lưu tiến độ, chức năng giáo viên.
- `lib/validate.js` — máy chủ kiểm tra dữ liệu học sinh gửi lên: XP tăng theo thời gian có giới hạn, đồ mua phải đủ XP (giá tính trên máy chủ), đồ đặc biệt phải đạt điều kiện, điểm thi đấu tối đa +30 mỗi trận, gói tin thiếu không làm mất dữ liệu.
- `lib/secret.js` — mã PIN/mật khẩu băm bằng scrypt. Sai 5 lần khoá 1 phút, sai 10 lần khoá 15 phút.
- `scripts/dung-hinh.mjs`, `scripts/dich_hinh.py` — dịch hình TikZ thành SVG (cần TeX Live).
- `tests/` — kiểm thử: `npm test`. Chạy thử trên máy không cần Supabase: `FAKE_DB=1 SESSION_SECRET=... npm run build && npm start` (dùng dữ liệu mẫu `tests/seed.json`; tài khoản giáo viên mẫu `thaylinh` / `matkhau123`).

## Câu hỏi
Câu hỏi soạn bằng LaTeX, lưu ở bảng `ltt_topics` (cột `source`). Claude soạn bằng skill *nap-bai-leo-thap* rồi thầy duyệt trong app (bấm vào tấm biển chủ đề trên bản đồ ở chế độ giáo viên). Sửa từng câu: nút ✎ hoặc **Sửa câu hỏi**.

**Ngân hàng câu hỏi** (chỉ giáo viên, nút ở màn chọn môn): xem mọi câu của một khối, lọc theo bài/mức/dạng/trạng thái, tìm theo chữ; thẻ *Thi đấu* xem kho câu Thi đấu (mọi mức của các bài đã duyệt) và thêm câu Mức 4; thẻ *Ôn tập* tạo đề mới (nháp) và ghép đề bằng nút *Chép vào đề…*. Khi lưu, máy chủ từ chối nếu bài vừa bị sửa ở nơi khác (tránh ghi đè). Làm việc hàng loạt trên máy: `scripts/ngan-hang.mjs` (xem `ngan-hang/HUONG-DAN.md`).

## Giới hạn hiện tại
- Chấm bài diễn ra trên điện thoại (đáp án được gửi kèm đề). Máy chủ chặn các kiểu gian lận lớn (tự cộng XP, tự thêm đồ, tự nâng hạng) nhưng học sinh rành kỹ thuật vẫn có thể xem đáp án trong mã trang.
- Công thức hiển thị bằng MathJax tải từ cdnjs; cần mạng.
- Chưa có thông báo nhắc học (push) và gửi báo cáo phụ huynh tự động: thầy sao chép báo cáo trong trang Theo dõi.
