# Tiến độ: Thi đấu không lộ đáp án, Hỏi thầy, làm lại Câu sai bằng câu thay thế

- Nhánh: `claude/thi-dau-an-dap-an-cau-sai-thay-the` · PR: (xem PR nháp cùng tên nhánh)
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu
Mọi thay đổi nằm trong `hoc-cung-cherry/client/app.js` (Thi đấu: `result`, `finish`, `rankReview`; Câu sai: `startReview`, `pickTwin`, `recordQ`), `lib/srs.js` (`nextReview`), `app/api/report/route.js` (Hỏi thầy). Chạy `node scripts/build-app.mjs && npm test` trong `hoc-cung-cherry/`.

## Mục tiêu
Học sinh làm đi làm lại, nhớ đáp án mà không biết cách làm (có em ~1000 câu đúng trên kho vài trăm câu). Thầy chốt (28/11/2026):

## Quyết định đã chốt với thầy
- **Thi đấu không hiện đáp án.** Trong trận không hiện đúng/sai, không hiện đáp án, lời giải. Chỉ sau khi làm xong và nộp mới hiện bảng kết quả: mỗi câu ✅/❌, đề, phương án em chọn; **không có đáp án đúng, không có lời giải**. Cuộn xem lại được, có lọc "Chỉ xem câu sai". Áp dụng cả bài kiểm tra thăng hạng.
- Câu đúng/sai nhiều ý trong Thi đấu chỉ tính đúng khi đúng hết; chấm cả câu, không chấm từng ý.
- **Câu sai trong Thi đấu (kể cả bài kiểm tra thăng hạng) không vào Câu sai.** Câu sai chỉ gồm câu từ Bản đồ kho báu và Ôn tập. Luật khóa Thi đấu (>10 câu sai khóa, ≤5 mở) chỉ tính các câu này.
- **Lưu câu Thi đấu:** được lưu, nhưng không kèm đáp án/lời giải. Mỗi câu đã lưu có nút **Hỏi thầy**: gửi câu lên tài khoản giáo viên; thầy xem danh sách câu được hỏi, sắp theo số em hỏi.
- **Làm lại Câu sai bằng câu thay thế, chỉ cần đúng 1 lần.** Không đưa lại câu cũ. Thứ tự chọn: câu khác cùng bài, cùng mức chưa gặp → cùng bài, cùng mức chưa làm đúng → cùng bài, mức cao hơn rồi mức khác → (câu có tham số) chính câu đó đổi số → đường cùng: câu cũ, đảo phương án, chỉ mở sau 1 ngày. Đúng thì câu ra khỏi Câu sai; sai thì hiện lời giải câu thay thế, câu vẫn ở lại, lần sau đổi câu khác.

## Đã xong (đã commit)
- [ ] (đang làm)

## Còn lại
- [ ] Thi đấu: ẩn đúng/sai và đáp án trong trận; bảng kết quả cuối trận
- [ ] Thi đấu: không ghi câu sai vào Câu sai; bỏ điều kiện "làm lại câu sai bài kiểm tra trước"
- [ ] Lưu câu Thi đấu không kèm đáp án; Hỏi thầy (học sinh) + trang "Câu hỏi thầy" (giáo viên)
- [ ] Câu sai: câu thay thế, đúng 1 lần là xong
- [ ] Sửa chữ hướng dẫn, luật thi đấu
- [ ] Kiểm tra (AGENTS.md mục 3), chạy thử giao diện 390×844

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/lib/srs.js`
- `hoc-cung-cherry/app/api/report/route.js`
- `hoc-cung-cherry/tests/core.test.mjs`

## Cách kiểm tra
(điền khi xong)

## Lưu ý cho người tiếp quản
- Không cần đổi cấu trúc bảng: "Hỏi thầy" dùng bảng `ltt_reports` có sẵn (kind `khac`, `snap.hoi = true`) để không phải chạy SQL.
