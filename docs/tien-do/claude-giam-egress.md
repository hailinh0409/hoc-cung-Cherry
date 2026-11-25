# Tiến độ: Giảm lưu lượng tải ra (egress) của Supabase

- Nhánh: `claude/giam-egress` · PR: (xem PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026 00:45
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
App đã bớt tải lại dữ liệu thừa. Mở `hoc-cung-cherry/client/real.js` (hàm `loadAll`), `hoc-cung-cherry/app/api/sync/route.js` (tham số `?players=0`) và `hoc-cung-cherry/lib/topics.js` (`topicVersion` có tính cả hình). Chạy thử theo AGENTS.md mục 3.

## Mục tiêu
Supabase báo tổ chức vượt hạn mức egress của gói Free: 7,24 / 5 GB (145%) trong chu kỳ 21/11 – 21/12/2026. Nếu vẫn vượt thì project bị hạn chế từ 25/12/2026. Thầy nhờ đọc code tìm chỗ tốn lưu lượng rồi sửa.

## Nguyên nhân tìm được (số liệu ngày 26/11/2026)
Toàn bộ dữ liệu chỉ khoảng 7 MB, nhưng app tải đi tải lại nhiều lần:
1. Cứ 15 phút, mỗi máy lại tải lại toàn bộ kho bài `ltt_topics` của cả 7 khối, khoảng 1,9 MB.
2. Mỗi phút, mỗi máy gọi `/api/sync` và tải lại danh sách người chơi. Với giáo viên đó là toàn bộ `data` của 61 học sinh, khoảng 2,4 MB một lần (khoảng 140 MB mỗi giờ khi để app mở).
3. Mỗi lần lưu (`/api/me/save`), máy chủ đọc lại cả hồ sơ học sinh: trung bình khoảng 40 KB, lớn nhất 240 KB.
4. Hồ sơ phình to dần, chủ yếu ở `rev` (1,36 MB, tổng của mọi học sinh) và `wst` (0,6 MB).

## Quyết định đã chốt với thầy
- Thầy đồng ý cho Claude sửa để giảm egress (26/11/2026).
- **Chưa** giới hạn bài theo khối: học sinh vẫn có thể mở khối khác ở màn chọn khối, nên vẫn tải bài của mọi khối. Muốn chỉ tải bài của khối mình thì phải hỏi thầy trước.

## Đã xong (đã commit)
- [x] `lib/topics.js`: `topicVersion` tính thêm mốc của bảng `ltt_figures` (thời điểm cập nhật mới nhất và số hình). Khi bài và hình không đổi, `/api/sync` không gửi lại kho bài.
- [x] `client/real.js`: bỏ việc tải lại kho bài mỗi 15 phút. Nay chỉ tải lại khi phiên bản đổi; thêm một lần tải dự phòng sau mỗi 3 giờ.
- [x] `app/api/sync/route.js` + `client/real.js`: danh sách người chơi, tài khoản và báo lỗi chỉ tải lại sau mỗi 10 phút, hoặc ngay khi đăng nhập và khi giáo viên thao tác (`after()` đặt `lastPlayers=0`). Các lần đồng bộ 1 phút khác gọi `?players=0`.
- [x] `sql/ltt_topics_updated_at.sql`: trigger tự cập nhật `updated_at` khi bài bị sửa thẳng bằng SQL. **Chưa chạy trên Supabase**, chờ thầy duyệt.
- [x] `tests/fakedb.cjs`: CSDL giả hỗ trợ thêm `order`, `limit`, `count/head`.

## Đang làm dở
- Không có.

## Việc tiếp theo
- Thầy gộp PR. Vercel tự triển khai; khoảng 1 ngày sau xem lại biểu đồ "Egress per day" trên Supabase.
- Thầy duyệt rồi chạy `sql/ltt_topics_updated_at.sql`. Nếu không chạy thì bài sửa thẳng bằng SQL mà không đặt `updated_at` sẽ phải chờ tối đa 3 giờ mới tới máy học sinh.
- Nếu egress vẫn cao, làm tiếp theo thứ tự:
  1. Học sinh chỉ nhận bài của khối mình (cần thầy đồng ý vì đổi cách mở khối khác).
  2. Giáo viên không nhận cả `data` của mọi học sinh. Máy chủ tóm tắt sẵn những gì trang Theo dõi cần (số câu `rev` trong sổ, `wst` 14 ngày, `lvt`).
  3. `/api/me/save` chỉ đọc các trường cần để kiểm tra chống gian lận.
  4. Giới hạn kích thước `rev` và `wst` trong hồ sơ (ảnh hưởng lịch ôn, cần thầy đồng ý).

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/real.js`
- `hoc-cung-cherry/app/api/sync/route.js`
- `hoc-cung-cherry/lib/topics.js`
- `hoc-cung-cherry/sql/ltt_topics_updated_at.sql`
- `hoc-cung-cherry/tests/fakedb.cjs`

## Cách kiểm tra
- `npm test` cho kết quả 27/27; `FAKE_DB=1 … npx next build` thành công.
- Gọi thử bằng curl với tài khoản giáo viên mẫu, khi dữ liệu giả có `updated_at`:
  - `/api/sync` lần đầu trả về khoảng 31,9 KB.
  - `/api/sync?topics=<phiên bản>&players=0` chỉ còn 281 byte.
- Chạy bằng Playwright ở cỡ 390×844, cả tài khoản học sinh (`Học sinh thử` / `0000`) lẫn giáo viên. Tua đồng hồ thì thứ tự gọi đúng: đăng nhập gọi `/api/sync`, sau 1 phút gọi `/api/sync?players=0`, sau 11 phút lại gọi `/api/sync` đầy đủ. Không có lỗi console.

## Lưu ý cho người tiếp quản
- Không ghi gì lên Supabase; chỉ đọc số liệu (kích thước bảng, cột, trigger).
- Bảng xếp hạng và danh sách bạn bè nay có thể chậm tối đa 10 phút. Muốn nhanh hơn thì giảm `PLAYERS_EVERY` trong `client/real.js`, nhưng egress sẽ tăng theo.
- Dữ liệu giả `tests/seed.json` không có `updated_at`, nên khi chạy thử, `topicVersion` rỗng và kho bài vẫn được gửi mỗi lần (dữ liệu thật thì có đủ).
