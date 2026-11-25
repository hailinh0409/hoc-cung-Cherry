# Tiến độ: Thi đấu — bài kiểm tra thăng hạng, bỏ trần ngày, mùa mới tụt 2 bậc

- Nhánh: `claude/thang-hang` (tách từ `claude/thi-dau-gio-ca-tran`, PR #31 — gộp #31 trước) · PR: (điền sau)
- Người đang làm: Claude · Cập nhật lần cuối: 25/11/2026 16:50
- Trạng thái: đang làm

## Bắt đầu từ đâu
Luật Thi đấu ở `hoc-cung-cherry/lib/rank.js` (dùng chung máy khách và máy chủ), máy chủ kiểm tra ở `lib/validate.js`, giao diện ở `client/app.js` (hàm `ranked`, `startRank`, `finish`, `board`).

## Mục tiêu
Thầy chốt (25/11/2026, 16:40):
- Lên **mọi bậc** đều phải thi bài kiểm tra thăng hạng.
- Dưới Thách Đấu: chỉ có **thanh tiến trình** dẫn đến bài kiểm tra. **Đầy thanh thì bắt buộc thi** (không đánh trận thường); **còn bài thầy giao chưa xong thì phải làm trước**.
- Từ Thách Đấu mới xếp thứ hạng bằng điểm — dùng **điểm phong độ** (theo các trận gần nhất, đánh nhiều không tăng điểm).
- **Có tụt bậc** trong mùa.
- Mức đạt **tăng dần theo bậc**: lên Bạc 60%, mỗi bậc +5%, lên Thách Đấu 90%; từ Bạch Kim cần đúng ít nhất 2 câu mức 3.
- Mùa mới: **tụt 2 bậc** (không về 0).
- **Bỏ trần điểm mỗi ngày.**
- Lên Thách Đấu **không** cần thi tự luận.

## Quyết định đã chốt với thầy
(như trên)

## Đã xong (đã commit)
- (chưa)

## Đang làm dở
- Bắt đầu sửa `lib/rank.js`.

## Việc tiếp theo
- (điền khi xong)

## Còn lại
- [ ] Luật bậc, thanh tiến trình, tụt bậc, mùa mới trong `lib/rank.js` + máy chủ `lib/validate.js`
- [ ] Bài kiểm tra thăng hạng (giao diện, chấm, lượt thi)
- [ ] Điểm phong độ Thách Đấu, bảng xếp hạng
- [ ] Giáo viên xem kết quả thăng hạng
- [ ] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/rank.js`
- `hoc-cung-cherry/lib/validate.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/items.js`
- `hoc-cung-cherry/tests/rank.test.mjs`

## Cách kiểm tra
(điền khi xong)

## Lưu ý cho người tiếp quản
- Nhánh này chứa cả các commit của PR #31 (chưa gộp).
