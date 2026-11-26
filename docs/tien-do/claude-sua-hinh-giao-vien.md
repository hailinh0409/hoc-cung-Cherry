# Tiến độ: Sửa lỗi tài khoản giáo viên mất hết hình TikZ

- Nhánh: `claude/sua-hinh-giao-vien` · PR: (xem PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026 13:45
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã sửa xong. Hàm chính là `figRows` trong `hoc-cung-cherry/lib/figcode.js` (hỏi bảng `ltt_figures` theo nhóm 200 mã). Chạy thử bằng `npm test` (file `tests/hinh-theo-nhom.test.mjs`).

## Mục tiêu
Thầy thấy GitHub dịch hình báo thành công nhưng hình trong app vẫn không hiện. Tìm nguyên nhân thật và sửa.

## Nguyên nhân (đã kiểm tra trên Supabase thật, 26/11/2026)
- Việc dịch hình KHÔNG lỗi: bảng `ltt_figures` có 846 hình, 0 hình lỗi, 0 hình thiếu ảnh. Lần chạy 11:14 đã dịch xong 55 hình, nên lần 11:43 báo "Cần dịch: 0" là đúng. Tùy chọn `--bo-qua-loi` không làm sót hình nào (Codex nghi chỗ này, nhưng dữ liệu không có hình lỗi).
- Lỗi thật: máy chủ hỏi Supabase "hình nào đã có" bằng một yêu cầu chứa toàn bộ mã hình. Thử trên Supabase thật: 600 mã → 200 OK, 700 mã → 400 Bad Request (đường dẫn quá dài). Cả kho hiện khoảng 730 hình (493 hình thường + ~236 khung hình từng bước).
- Mã cũ không kiểm tra lỗi trả về, nên coi như chưa có hình nào. Tài khoản giáo viên tải mọi khối nên mất hết hình; học sinh chỉ tải khối mình (≤ ~300 hình) nên chưa bị, nhưng khối nào lớn lên sẽ bị.

## Quyết định đã chốt với thầy
- Làm bước "hỏi theo nhóm" trước; báo ✗ đỏ trên GitHub khi có hình dịch lỗi.
- Chưa làm: phân trang `ltt_topics` (mới 110 bài), kiểm tra ảnh trống (không có), gọi dịch hình ngay khi dán bài (để PR sau).

## Đã xong (đã commit)
- [x] Hàm `figRows(db, hashes)` hỏi theo nhóm `FIG_BATCH = 200`, bỏ mã trùng, gặp lỗi thì ném lỗi — `hoc-cung-cherry/lib/figcode.js`
- [x] Dùng `figRows` ở: `lib/topics.js` (tải bài cho app), `lib/figs.js` (tình trạng hình của một bài), `scripts/dung-hinh.mjs`, `scripts/ngan-hang.mjs`
- [x] `scripts/dung-hinh.mjs`: có hình dịch lỗi thì thoát mã 1 → GitHub Actions hiện ✗ đỏ
- [x] Kiểm tra tự động `tests/hinh-theo-nhom.test.mjs`

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy mở app bằng tài khoản giáo viên sau khi gộp và Vercel triển khai xong: hình phải hiện lại ở mọi khối.
- PR sau (đã bàn với thầy, chưa làm): (1) gọi GitHub dịch hình ngay khi bấm "Dán bài mới" vì lịch 15 phút của GitHub thực tế chạy 4–10 tiếng một lần; (2) lý thuyết từng màn chia theo ý thay vì theo số chữ (`client/lesson.js`, `lsChunks`, `lsSentences`); (3) công thức dài tự xuống dòng ở dấu "=" thay vì bị giấu trong thanh cuộn ngang (MathJax 3.2.2 không tự ngắt dòng).

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/figcode.js`
- `hoc-cung-cherry/lib/topics.js`
- `hoc-cung-cherry/lib/figs.js`
- `hoc-cung-cherry/scripts/dung-hinh.mjs`
- `hoc-cung-cherry/scripts/ngan-hang.mjs`
- `hoc-cung-cherry/tests/hinh-theo-nhom.test.mjs`

## Cách kiểm tra
- `npm test`: 42/42 đạt (có 3 kiểm tra mới).
- `FAKE_DB=1 SESSION_SECRET=… npx next build`: đạt.
- `FAKE_DB=1 … npx next start`, đăng nhập `thaylinh`/`matkhau123`, gọi `/api/sync`: trả 200, đủ bài.

## Lưu ý cho người tiếp quản
- Không ghi gì lên Supabase trong việc này (chỉ đọc để chẩn đoán).
- Mọi chỗ mới cần hỏi `ltt_figures` theo danh sách mã phải dùng `figRows`, không dùng `.in('hash', …)` trực tiếp.
