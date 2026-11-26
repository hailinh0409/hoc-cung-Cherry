# Tiến độ: Thông báo bài tập về máy học sinh

- Nhánh: `claude/thong-bao-bai-tap` · PR: (xem PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt (cần chạy `sql/ltt_push_subs.sql` trên Supabase trước khi gộp)

## Bắt đầu từ đâu
Mã đã xong và đã kiểm tra. Lõi nằm ở `hoc-cung-cherry/lib/push-core.mjs` (gửi, báo bài mới, nhắc bài). Phía máy học sinh: cuối `client/real.js` (thẻ "Bật thông báo bài tập" ở màn chọn môn). Chạy thử: `npm test` (tests/thong-bao.test.mjs).

## Mục tiêu
Thầy: "Khi tôi giao bài tập cho học sinh, hãy để app gửi thông báo về máy của học sinh để học sinh biết là có bài thầy giao, học sinh nào chưa hoàn thành bài tập thầy giao thì cách một khoảng thời gian lại gửi thông báo."

## Quyết định đã chốt với thầy
- Thông báo dùng Web Push của trình duyệt (app là PWA, không có app gốc).
- Khoảng nhắc do Claude chọn (thầy chưa nói con số, đổi được): **mỗi tối khoảng 19 giờ**, mỗi máy tối đa 1 lời nhắc / 20 giờ, gộp mọi bài chưa làm vào một thông báo. Nhắc tới 2 ngày sau hạn; bài không có hạn nhắc 7 ngày. Bài vừa giao chưa tới 3 giờ thì chưa nhắc (đã có thông báo "bài mới").
- Không gửi tên học sinh trong nội dung thông báo.

## Đã xong (đã commit)
- [x] Bảng mới `ltt_push_subs` — `sql/ltt_push_subs.sql` (**chưa chạy trên Supabase thật**)
- [x] Khóa VAPID tự tạo lần đầu, lưu ở `ltt_settings` key `vapid` (không cần thêm biến môi trường; nếu đặt `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` trong Vercel thì dùng khóa đó)
- [x] `app/api/push/route.js`: GET khóa công khai, POST lưu máy, DELETE bỏ máy
- [x] `app/api/admin/assign/route.js`: giao bài (đã duyệt) → báo ngay về máy học sinh khối đó; trả thêm `thongBao` = số máy đã nhận
- [x] `scripts/nhac-bai.mjs` + `.github/workflows/nhac-bai.yml`: GitHub Actions chạy 12:00 UTC (19:00 VN), dùng 2 secret Supabase đã có của workflow dịch hình
- [x] `public/sw.js`: hiện thông báo, bấm vào thì mở app
- [x] `client/real.js`, `client/app.js`, `client/app2.css`: thẻ bật thông báo (Android/máy tính: nút Bật; iPhone chưa cài app: hướng dẫn "Thêm vào MH chính"; đã chặn: hướng dẫn mở lại); đăng nhập lại thì cập nhật máy về tài khoản đang dùng; đăng xuất thì máy thôi nhận (sửa trong `scripts/build-app.mjs`)
- [x] `api/sync` chỉ đọc key `moc_thi_dau` của `ltt_settings` (để khóa riêng VAPID không bị đọc kèm)

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy chạy `sql/ltt_push_subs.sql` (hoặc cho Claude chạy), gộp PR, rồi thử: đăng nhập một học sinh trên Android → Bật → thầy giao một bài khối đó.
- Có thể thêm cho giáo viên: xem học sinh nào đã bật thông báo; báo "đã gửi tới N máy" sau khi giao bài; chọn giờ/khoảng nhắc trong app.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/push-core.mjs`
- `hoc-cung-cherry/app/api/push/route.js`
- `hoc-cung-cherry/app/api/admin/assign/route.js`
- `hoc-cung-cherry/scripts/nhac-bai.mjs`
- `.github/workflows/nhac-bai.yml`
- `hoc-cung-cherry/public/sw.js`
- `hoc-cung-cherry/client/real.js` (cuối file), `client/app.js` (`subjects`, `enter`), `client/app2.css` (`.pushcard`)
- `hoc-cung-cherry/sql/ltt_push_subs.sql`

## Cách kiểm tra
- `node scripts/build-app.mjs`, `npm test` (33/33), `FAKE_DB=1 … npx next build`: đạt.
- Dữ liệu giả: đăng nhập học sinh (Lê Minh Châu, khối 9, 0000) → `/api/push` trả khóa, lưu máy được; giáo viên giao bài khối 9 → `{ok:true}`.
- Dựng máy nhận giả (HTTPS cục bộ) và giải mã được thông báo; máy trả 410 bị xóa khỏi bảng; học sinh đã làm xong không bị nhắc; chạy nhắc 2 lần liên tiếp không gửi lặp.
- Giao diện 390×844: thẻ hiện đúng ở màn chọn môn (ảnh trong PR). Trình duyệt chạy thử không có dịch vụ đẩy thật nên chưa thử nhận trên điện thoại thật.

## Lưu ý cho người tiếp quản
- iPhone/iPad chỉ nhận thông báo khi học sinh đã **Thêm vào Màn hình chính** và mở app từ biểu tượng (iOS 16.4 trở lên).
- Một máy chỉ gắn với tài khoản đăng nhập gần nhất (upsert theo `endpoint`).
- "Đã làm xong" tính giống `asgStatus`: `P.pt['<slug>|0']` hoặc `P.best['<slug>|0'] > 0` trong `ltt_players.data`.
- Nếu đổi khóa VAPID, máy học sinh tự đăng kí lại khi đăng nhập (so khóa trong `pushSubscribe`).
