# Tiến độ: Lý thuyết từng màn (kiểu Duolingo) cho toàn bộ app

- Nhánh: `claude/ly-thuyet-tung-man` · PR: #38
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã xong. Mã chính: `hoc-cung-cherry/client/lesson.js` (từ `/* ---------- Lý thuyết từng màn` đến `openTheoryReview`): `lsLines`/`lsChunks` chia chữ, `lessonScreens` dựng danh sách màn, `renderLessonMaterial(root,t,o)` vẽ và điều khiển. Màn lý thuyết gọi nó trong `theory()` của `client/app.js`. CSS: cuối `client/lesson.css` (lớp `.ls-*`).

## Mục tiêu
Thầy (26/11/2026) so màn lý thuyết của Cherry với Duolingo, thấy chữ nhỏ, nhiều và dày. Sau khi xem bản mẫu Bài 1 (https://claude.ai/artifact/NM6kCLsF8U2KxkXkg38WYk): "Tuyệt vời, toàn bộ lý thuyết trong app sẽ tiến hành thế này".

## Quyết định đã chốt với thầy
- Mỗi màn một ý (khoảng 3 dòng), thanh tiến độ ở trên, nút "Tiếp tục" cố định ở dưới; câu Thử ngay có nút "Kiểm tra", dải xanh "Chính xác!" / dải đỏ "Chưa đúng" kèm giải thích, sai thì "Thử lại".
- Nền sáng thống nhất (kem), chữ thân bài 19px, lời Cherry là bong bóng thoại; bỏ tiêu đề lặp.
- Kết thúc: số câu Thử ngay đúng ngay lần đầu + "Xem tóm tắt cả bài" + nút "Luyện tập cả bài".
- App **tự chia** lý thuyết đã soạn, không bắt Gemini soạn lại.

## Đã xong (đã commit)
- [x] Bộ chia màn (`client/lesson.js`):
  - `\loidan` → bong bóng Cherry ở màn kế tiếp; lời dẫn dài (>100 kí tự) đứng riêng một màn có Cherry to.
  - `\dinhnghia`, `\quytac`, `\congthuc`, `\dinhly`, `\tinhchat` → chia theo `\\` (ngoài công thức và ngoài hình), mỗi màn tối đa ~160 kí tự chữ (công thức tính gần đúng theo độ dài); đoạn dài không có `\\` thì tách theo câu; hình TikZ đi cùng đoạn chữ ngay trước nó.
  - `\luuy` → màn "Cần nhớ", mỗi câu một dòng có dấu "!", tối đa 3 dòng một màn.
  - `\vidu` → màn Ví dụ, phải bấm "Xem lời giải" mới đi tiếp.
  - `\minhhoa`, hình từng bước → màn khám phá, phải chạm (hình từng bước: tới bước cuối) mới đi tiếp; hình chưa dịch thì cho đi tiếp luôn.
  - `\thungay` → màn câu hỏi 2 lựa chọn (đảo thứ tự), Kiểm tra/Thử lại.
  - Bài Tập hợp dựng sẵn (`setLesson`, chỉ dùng khi bài chưa có nội dung tương tác) → mỗi trang thành 3 màn.
- [x] Nhãn phần ở trên: "Tên bài · tiêu đề mục đang học".
- [x] `theory()` (`client/app.js`): toàn màn hình, nút × về bản đồ, giáo viên có nút "Sửa" ở trên; giữ đúng màn đang xem khi dữ liệu làm mới (sửa lỗi PR #36 vẫn giữ).
- [x] Xem trước trong ô sửa lý thuyết và trong "Dán cả chương" hiện đúng kiểu từng màn (khung cao 640px).
- [x] Nút xem lại lý thuyết khi đang làm bài (`openTheoryReview`) hiện **bản tóm tắt gọn một trang** (`renderLessonSummary`), không bắt đi lại từng màn.

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy mở vài bài trên điện thoại thật (bài có hình đã dịch, bài lớp 7–8 chỉ có lý thuyết tĩnh) xem độ dài mỗi màn.
- Các bài chỉ có lý thuyết tĩnh (lớp 7 b1–b7, lớp 8 b3–b13, lớp 10…) hiện chỉ có màn đọc + ví dụ, chưa có màn Thử ngay. Nên nhờ Gemini thêm `\loidan` và `\thungay` (1–2 câu mỗi mục) cho các bài này.
- Có thể cập nhật hướng dẫn soạn (`docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`): mỗi dòng `\\` nên ngắn (1–2 câu) vì app chia màn theo dòng.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/client/lesson.css`
- `hoc-cung-cherry/client/app.js` (hàm `theory`)
- `docs/tien-do/anh/ly-thuyet-tung-man.jpg` (ảnh chụp 390×844)

## Cách kiểm tra
- `node scripts/build-app.mjs`, `npm test` (33/33), `FAKE_DB=1 … npx next build`: đạt.
- Chạy `FAKE_DB=1 … npx next start`, cỡ 390×844, đưa tạm lý thuyết thật của Bài 1 lớp 6 (lop6-b1-tap-hop) và Bài 1 lớp 7 (lý thuyết tĩnh) vào `tests/seed.json` (đã trả lại như cũ, không commit):
  - Học sinh: đi hết 12 màn Bài 1, đúng/sai ở Thử ngay, Xem lời giải, hình từng bước, màn kết thúc, nút Luyện tập cả bài. Không có lỗi JavaScript.
  - Giáo viên: nút Sửa ở trên, xem trước trong ô sửa, hủy sửa vẫn ở đúng màn; Chơi thử → nút xem lý thuyết hiện bản tóm tắt.
- Kiểm tra cách chia màn bằng Node trên Bài 1 lớp 6, Bài 1 lớp 7, Bài 1 lớp 8 (đơn thức).

## Lưu ý cho người tiếp quản
- `renderLessonMaterial(root,t,o)` giờ là bộ từng màn; đừng dùng nó cho chỗ cần tóm tắt, dùng `renderLessonSummary`.
- Muốn đổi độ dài mỗi màn: hằng `LS_MAX` trong `client/lesson.js`.
- Không ghi gì lên Supabase trong việc này (chỉ đọc lý thuyết để thử).
