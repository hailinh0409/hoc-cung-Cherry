# Tiến độ: sửa lỗi không vào được app trên iPhone 8 / iOS cũ

- Nhánh: `claude/may-cu-ios` · PR: (xem PR của nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 2026-11-27 15:10
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Lỗi đã sửa. Nguyên nhân: regex lookbehind trong `chatMath` (`hoc-cung-cherry/lib/latex.js`) làm Safari iOS < 16.4 báo lỗi cú pháp, cả khối script của `public/app.html` không chạy, học sinh đứng ở màn logo. Chạy thử: `cd hoc-cung-cherry && node scripts/build-app.mjs && node --test tests/may-cu.test.mjs`.

## Mục tiêu
Thầy: "Sửa lỗi này để các em dùng máy cũ có thể vào được" (iPhone 8 không vào được app).

## Đã xong (đã commit)
- [x] Viết lại regex `chatMath` không dùng lookbehind — `hoc-cung-cherry/lib/latex.js`
- [x] Bù `Array/String.prototype.at` và `Object.hasOwn` cho Safari < 15.4; hiện thông báo hướng dẫn nếu mã chính không chạy sau 6 giây — `hoc-cung-cherry/client/head.html`, `client/real.js` (đặt `window.__cherryUp=1`)
- [x] Kiểm thử chặn lookbehind quay lại — `hoc-cung-cherry/tests/may-cu.test.mjs`
- [x] Ghép lại `public/app.html`

## Việc tiếp theo
Thầy hỏi em nào còn lỗi xem iOS bao nhiêu (Cài đặt › Cài đặt chung › Giới thiệu). Nếu đã ≥ 16.4 mà vẫn lỗi thì nguyên nhân khác (mạng chặn cdnjs.cloudflare.com tải MathJax?). Không dùng regex lookbehind và hàm JS mới hơn Safari 15 trong `client/` và `lib/`.

## File liên quan
- `hoc-cung-cherry/lib/latex.js`, `hoc-cung-cherry/client/head.html`, `hoc-cung-cherry/client/real.js`, `hoc-cung-cherry/tests/may-cu.test.mjs`

## Cách kiểm tra
Đã biên dịch thử mã trang với esbuild target safari14/15/16: không còn cảnh báo lookbehind. `node --test tests/*.test.mjs`: chỉ `thong-bao` lỗi do môi trường thiếu gói `web-push`. Chưa thử trên iPhone thật.

## Lưu ý cho người tiếp quản
Cảnh báo "Unicode property escapes" của esbuild là báo nhầm (Safari ≥ 11.1 hỗ trợ).
