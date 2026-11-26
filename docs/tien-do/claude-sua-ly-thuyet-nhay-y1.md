# Bàn giao: sửa lỗi lý thuyết tự nhảy về Ý 1

Nhánh: `claude/sua-ly-thuyet-nhay-y1` · Trạng thái: **xong, chờ thầy duyệt** (PR #36)

## Lỗi
Đang đọc lý thuyết ở Ý 2/Ý 3, không bấm gì mà app tự quay về Ý 1 (và cuộn lên đầu trang).

## Nguyên nhân
`client/real.js` có `setInterval(refreshVisible, 60000)` và `visibilitychange → refreshVisible`.
`refreshVisible → loadAll → softRefresh → refresh()`, và `refresh()` trong `client/app.js` gọi lại `theory(x)` khi đang ở màn `theory`.
`theory()` dựng lại toàn bộ trang → `renderLessonMaterial` luôn mở trang 0 và đặt `scrollTop = 0`.
Vì vậy cứ khoảng 1 phút (hoặc khi học sinh chuyển sang app khác rồi quay lại) trang lại về Ý 1. Các phần tương tác đang làm dở (ghép số La Mã, hình từng bước…) cũng bị xóa.

## Cách sửa (`client/app.js`)
1. `refresh()`: ở màn `theory`, chỉ vẽ lại khi nội dung lý thuyết của bài **thật sự đổi** (so sánh `JSON.stringify(x.theory)` với `thT.theory`). Làm mới định kỳ không đụng tới trang nữa.
2. `theory(t, keep)`: tham số mới `keep`. Khi `keep=true` và vẫn là bài đó, giữ nguyên ý đang mở (tab `aria-current`) và vị trí cuộn sau khi vẽ lại.
3. Hai chỗ giáo viên lưu/xóa lý thuyết gọi `theory(x, true)` → giáo viên sửa xong vẫn ở ý đang xem.

Đã chạy `node scripts/build-app.mjs` (sinh lại `public/app.html`) và `npm test` (30/30 đạt).

## Lưu ý cho người tiếp quản
Các màn khác cũng được `refresh()` dựng lại mỗi phút (`journey`, `ontap`, `tlde`…). Nếu sau này có báo lỗi kiểu "tự cuộn lên đầu" ở các màn đó thì nguyên nhân cũng là vòng làm mới này.
