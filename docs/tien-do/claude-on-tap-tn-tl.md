# Tiến độ: Ôn tập chia 2 phần (Trắc nghiệm TN / Tự luận TL), dạng lưới

- Nhánh: `claude/on-tap-tn-tl` · PR: (xem PR nháp cùng tên nhánh)
- Người đang làm: Claude · Cập nhật lần cuối: 2026-11-20
- Trạng thái: đang làm

## Mục tiêu
Yêu cầu của thầy (20/11/2026): Phần Ôn tập có 2 phần
- Phần 1: các đề chỉ gồm trắc nghiệm, đúng/sai, trả lời ngắn, nối ý (biết điểm ngay).
- Phần 2: các đề tự luận để học sinh tự học (bài tập về nhà, đề thi thử tự luận sát đề thật). Chỉ có đề bài tự luận và gợi ý làm bài; bấm gợi ý phải trừ XP; học sinh làm bài vào vở.
- Ôn tập hiển thị dạng lưới icon thay cho danh sách. Đề trắc nghiệm đánh số TN1, TN2…; đề tự luận TL1, TL2…

## Quyết định đã chốt với thầy
- Đề tự luận: chỉ hiện đề bài và gợi ý, KHÔNG hiện lời giải cho học sinh.
- Mỗi gợi ý mở lần đầu trừ XP (trừ vào Ví XP như mua đồ, cấp độ không giảm); mở lại gợi ý đã mua thì không trừ nữa.

## Thiết kế
- Dạng câu mới `\begin{extl} đề \goiy{…} \goiy{…} \end{extl}` (tự luận). Một đề ôn tập (`phan='on-tap'`) có câu `extl` là đề TL; không được trộn `extl` với dạng câu khác trong một đề.
- Gợi ý đã mua lưu ở `P.tlh[mã câu] = số gợi ý đã mở`; máy chủ (`lib/validate.js`) gộp lấy số lớn hơn và tính `spent = giá đồ + số gợi ý × 10 XP`.
- Nút "Em đã làm xong vào vở" ghi `P.pt` của đề, để thầy giao đề TL và theo dõi được như đề thường.

## Đã xong (đã commit)
- (đang cập nhật)

## Còn lại
- [ ] `lib/latex.js`: dạng `extl`
- [ ] `lib/validate.js`: tính XP gợi ý
- [ ] `client/app.js`, `client/body.html`, `client/app2.css`: lưới Ôn tập TN/TL, màn đề tự luận, soạn đề TL
- [ ] Test, build, chạy thử ở cỡ điện thoại

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/lib/validate.js`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/body.html`
- `hoc-cung-cherry/client/app2.css`
- `docs/soan-bai.md`

## Cách kiểm tra
`npm test`, `FAKE_DB=1 … npx next start`, đăng nhập `thaylinh`/`matkhau123` và tài khoản học sinh mẫu, mở Ôn tập.

## Lưu ý cho người tiếp quản
Chưa ghi gì lên Supabase.
