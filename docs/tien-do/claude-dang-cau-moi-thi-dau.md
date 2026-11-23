# Tiến độ: Hai dạng câu mới + chống cày Thi đấu

- Nhánh: `claude/dang-cau-moi-thi-dau` · PR: #17
- Người đang làm: Claude · Cập nhật lần cuối: 23/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Mục tiêu
Thầy (23/11):
1. Thêm 2 dạng câu mới (đã thử trong artifact "Thử dạng câu mới") vào app: **Sắp xếp lời giải** `exsx` và **Sơ đồ phân tích đi lên** `exsd`.
2. Cập nhật skill nạp bài của Claude và hướng dẫn soạn bài cho Gemini (`docs/soan-bai.md`).
3. Số câu sai vượt 10 thì không được Thi đấu, phải dọn sạch kho câu sai trước.
4. Thưởng điểm cho tỉ lệ đúng cao.
5. Reset bảng xếp hạng sau 30 ngày.
6. Chống cày: có em 2 ngày đã lên Cao Thủ dù lực học trung bình.

## Quyết định đã chốt
- Cú pháp 2 dạng mới giữ đúng như artifact thử (`\buoc[nhóm]{}`, `\nhieu{}{}`, `\nut{số}[cha]{mệnh đề}{căn cứ}`, `\an{}`, `\anly{}`, `\nhieuly{}{}`).
- Sơ đồ luôn vẽ dạng cây nhánh ngang (kết luận ở trên, mũi tên đi lên); không dùng dạng danh sách thụt lề.
- Bản đồ (Hành trình kho báu): phải đúng hết mới tính đúng. Thi đấu: được điểm theo tỉ lệ ô/dòng đúng. Câu sơ đồ +20 giây mỗi ô trống.

- Khóa Thi đấu: đếm câu sai **chưa làm lại đúng lần nào** (`in_notebook` và `nb_hits = 0`). Quá 10 câu thì khóa; đã khóa thì phải về 0 mới mở. (Câu vẫn ở sổ câu sai đến khi đúng ở 2 ngày khác nhau như cũ; khóa chỉ cần làm lại đúng 1 lần, để học sinh dọn được trong ngày.)
- Thưởng chính xác: đúng 10/10 +6, 9/10 +4, 8/10 +2 (bỏ luật cũ "đúng ≥8 câu thì ít nhất +5").
- Mùa 30 ngày, Mùa 1 bắt đầu 23/11/2026; sang mùa mới điểm thi đấu về 0 (trước đây: mùa theo học kì, giảm một nửa). Máy chủ tự tính mùa, nên điểm cày của mùa trước bị xóa ngay khi bản này chạy.
- Chống cày: điểm thi đấu = (điểm trận / điểm trận tối đa − mức chuẩn của bậc) × 100, mức chuẩn Đồng 40%, mỗi bậc +6% (Cao Thủ 70%, Thách Đấu 82%); mỗi trận +30/−20; **mỗi ngày cộng tối đa 80 điểm** (máy chủ kiểm tra ở `_lpd`). Lên Cao Thủ (700) cần ít nhất 9 ngày và phải giữ tỉ lệ đúng cao.

## Đã xong (đã commit)
- [x] Bộ đọc LaTeX `exsx`, `exsd` (`lib/latex.js`, `lib/params.js`), test `tests/dang-moi.test.mjs`; mã câu cũ không đổi
- [x] Giao diện làm bài, chấm, xem đáp án, mẫu soạn câu trong app (`client/q2.js` mới, `client/app.js`, `client/app2.css`, `scripts/build-app.mjs`)
- [x] Thi đấu: khóa câu sai, thưởng chính xác, mùa 30 ngày, công thức điểm, trần ngày (`lib/rank.js` mới, `lib/validate.js`, `client/app.js`), test `tests/rank.test.mjs`
- [x] `docs/soan-bai.md`, `AGENTS.md`; skill `nap-bai-leo-thap` của Claude (thầy lưu ở thẻ đề xuất trong chat)
- [x] Sửa lỗi ghép app: `scripts/build-app.mjs` thay chuỗi bằng hàm (trước đây `$$` trong mã bị đổi thành `$`, làm `softRefresh` không nhận ra màn đang mở)
- [x] Kiểm tra: `npm test` 19/19, `next build` thành công, chạy thử FAKE_DB ở 390×844 (giáo viên chơi thử, học sinh Thi đấu, khóa câu sai, sang mùa)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/latex.js`, `lib/params.js`, `lib/rank.js`, `lib/validate.js`
- `hoc-cung-cherry/client/q2.js`, `client/app.js`, `client/app2.css`, `scripts/build-app.mjs`
- `hoc-cung-cherry/tests/dang-moi.tex`, `tests/seed.json` (thêm chủ đề mẫu lớp 8 "Thử dạng câu mới" cho dữ liệu giả)
- `docs/soan-bai.md`

## Cách kiểm tra
- `cd hoc-cung-cherry && npm test`
- `FAKE_DB=1 SESSION_SECRET=… npx next build && npx next start`: giáo viên `thaylinh`/`matkhau123` → Toán → Khối 8 → chặng "Thử dạng câu mới" → Chơi thử.

## Lưu ý cho người tiếp quản
- Không đặt `id="q2"` cho phần tử khác: hộp thoại Thoát đã dùng `#q2` (nút "Làm tiếp"); khung câu dạng mới là `#q2a`.
- Mã nhận diện câu (`qkeyOf`) của các dạng cũ KHÔNG được đổi (sẽ mất lịch ôn học sinh): chỉ thêm trường mới vào chuỗi băm khi là `exsx`/`exsd`.
