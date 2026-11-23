# Tiến độ: Hai dạng câu mới + chống cày Thi đấu

- Nhánh: `claude/dang-cau-moi-thi-dau` · PR: (đang mở)
- Người đang làm: Claude · Cập nhật lần cuối: 23/11/2026
- Trạng thái: đang làm

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

## Đã xong (đã commit)

## Còn lại
- [ ] Bộ đọc LaTeX (`lib/latex.js`, `lib/params.js`) + test
- [ ] Giao diện làm bài, chấm, xem đáp án (`client/app.js`, `client/app2.css`)
- [ ] Thi đấu: khóa khi >10 câu sai chưa sửa; thưởng tỉ lệ đúng; mùa 30 ngày; công thức điểm mới + trần điểm mỗi ngày (client + `lib/validate.js`)
- [ ] `docs/soan-bai.md`
- [ ] Kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/latex.js`, `lib/params.js`, `lib/rank.js`, `lib/validate.js`
- `hoc-cung-cherry/client/app.js`, `client/app2.css`, `scripts/build-app.mjs`
- `docs/soan-bai.md`

## Lưu ý cho người tiếp quản
- Mã nhận diện câu (`qkeyOf`) của các dạng cũ KHÔNG được đổi (sẽ mất lịch ôn học sinh): chỉ thêm trường mới vào chuỗi băm khi là `exsx`/`exsd`.
