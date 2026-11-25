# Tiến độ: Thi đấu — bài kiểm tra thăng hạng, bỏ trần ngày, mùa mới tụt 2 bậc

- Nhánh: `claude/thang-hang` (chứa luôn PR #31 và PR #32) · PR: #33
- Người đang làm: Claude · Cập nhật lần cuối: 25/11/2026 17:30
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã xong. Luật ở `hoc-cung-cherry/lib/rank.js` (`TIER_LP`, `applyMatch`, `barFull`, `seasonStart`, `promoResult`, `pdOf`), máy chủ ở `lib/validate.js` (đoạn "Thi đấu" trong `sanitize`). Giao diện `client/app.js`: `ranked`, `startPromo`, `promoPicks`, `promoFinish`, `startRedoKeys`, `board`, `finish` (nhánh `rank`), `checkSeason`, `promoBox` (Theo dõi khối), `mergeP`/`pushMine`. Chạy thử: học sinh "Học sinh thử"/0000 (khối 6); đặt sẵn `localStorage['ltt:p:52018431-4b14-4cd6-94e4-7fd23d288096']={lp:100,tier:0,matches:50,season:'Mùa 1 (23/11–22/12)'}` để có thanh đầy.

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
(như trên) và các chi tiết Claude chọn:
- Dữ liệu: `P.tier` (bậc, tách khỏi điểm), `P.lp` (thanh tiến trình, không vượt mốc bậc trên), `P.shield` (số trận còn được bảo vệ sau khi lên bậc, 5), `P.tdh` (tỉ lệ điểm trận 10 trận Thách Đấu gần nhất), `P.pr` (lượt thi hôm nay), `P.prw` (câu sai của lần thi trượt, phải làm lại đúng), `P.prh` (lịch sử thi, 20 lần).
- Dữ liệu cũ chưa có `tier`: suy từ điểm theo mốc cũ (0/100/200/350/500/700/900/1200).
- "Còn bài thầy giao" = bài giao của khối chưa hoàn thành (không chỉ bài quá hạn).
- Bài kiểm tra: 12 câu theo cơ cấu mức của **bậc sắp lên**, đổi câu trắc nghiệm sang dạng khác đến khi ≥ một nửa không phải `ex` (nếu kho đủ); có trừ điểm câu sai, không thưởng thời gian; giờ cả bài và bỏ qua câu như trận thường; thoát giữa chừng = trượt; tính là 1 trận (máy chủ cần để cho phép lên bậc).
- Đạt: lên bậc, thanh về đầu bậc mới, bảo vệ 5 trận. Trượt: thanh lùi 20 điểm, phải làm lại đúng các câu sai của lần đó, rồi đánh cho đầy thanh để thi lại; tối đa 2 lần/ngày.
- Thách Đấu: `lp` từ 1200 đến 1300 là "độ vững bậc" (về dưới 1200 thì tụt Đại Cao Thủ); bảng xếp hạng Thách Đấu xếp theo điểm phong độ (cần ≥ 3 trận); các bậc dưới chỉ liệt kê theo tên, không số thứ tự.
- Người chưa vào mùa mới vẫn hiện trên bảng ở bậc đã tụt 2.

## Đã xong (đã commit)
- [x] Luật bậc, thanh tiến trình, tụt bậc, bảo vệ sau khi lên bậc, mùa mới tụt 2 bậc, bỏ trần ngày — `lib/rank.js`, `lib/validate.js`, `app/api/sync/route.js` (thêm `tier`, `tdh` vào dữ liệu công khai)
- [x] Màn Thi đấu: thanh tiến trình, đầy thanh bắt buộc thi, chặn khi còn bài giao / câu sai của lần thi trước / hết lượt — `ranked`
- [x] Bài kiểm tra thăng hạng — `startPromo`, `promoPicks`, `promoFinish`, `result` (đếm câu mức 3 đúng, ghi câu sai)
- [x] Điểm phong độ Thách Đấu + bảng xếp hạng mới — `board`, `finish`
- [x] Trang cá nhân, báo cáo phụ huynh, thành tích, danh hiệu "Thách Đấu" dùng bậc mới — `profile_`, `parentReport`, `ACH`, `client/items.js`
- [x] Giáo viên: cột Rank hiện bậc + tiến trình; mục "Bài kiểm tra thăng hạng (14 ngày)" + em đang chờ thi — `track`, `promoBox`
- [x] Gộp nhánh PR #32 (điểm ôn tập) để tránh xung đột ở `pushMine`

## Đang làm dở
- không có

## Việc tiếp theo
- Chưa chạy thử giao diện nhánh **thi đạt** (chỉ có kiểm thử tự động `promoResult`); thầy thử bằng tài khoản thật.
- Kho câu mỏng (ít câu điền đáp số/đúng-sai/sắp xếp) thì bài kiểm tra có thể còn nhiều trắc nghiệm hơn một nửa → nạp thêm câu Kho Thi đấu dạng khác `ex`.
- Máy chủ chỉ chặn được "mỗi trận lên tối đa 1 bậc" và "không vượt mốc"; không kiểm chứng được bài kiểm tra có đạt thật hay không (chấm trên điện thoại).

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/rank.js`
- `hoc-cung-cherry/lib/validate.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/items.js`
- `hoc-cung-cherry/tests/rank.test.mjs`
- `hoc-cung-cherry/app/api/sync/route.js`

## Cách kiểm tra
- `npm test` → 27/27 đạt; `FAKE_DB=1 … npx next build` thành công.
- 390×844: học sinh có thanh đầy → màn Thi đấu hiện "Làm bài kiểm tra lên Bạc" (không có "Vào trận") → hộp "Thi lên Bạc: 12 câu · 8:00 · cần 60%" → làm sai hết → "Chưa đạt 0%", thanh lùi về 80%, câu sai vào kho. Giáo viên: Theo dõi khối 6 thấy "Đồng 80%" và dòng "Đồng → Bạc · 0% Trượt". Bảng xếp hạng: học sinh mùa trước Vàng hiện ở Đồng (tụt 2 bậc), không số thứ tự. Không có lỗi JavaScript.

## Lưu ý cho người tiếp quản
- Nhánh này chứa cả PR #31 và PR #32: gộp #33 là đủ (hoặc gộp #31, #32 trước rồi #33).
- Không ghi gì lên Supabase.
