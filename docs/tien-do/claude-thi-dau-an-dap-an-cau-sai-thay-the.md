# Tiến độ: Thi đấu không lộ đáp án, Hỏi thầy, làm lại Câu sai bằng câu thay thế

- Nhánh: `claude/thi-dau-an-dap-an-cau-sai-thay-the` · PR: #75
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã làm xong, đang chờ thầy thử và gộp. Mọi thay đổi giao diện nằm trong `hoc-cung-cherry/client/app.js`:
- Thi đấu: `rankAnswered`, `rankReview`, `myAnsHTML`, `tdToggle`, `viewTd`.
- Câu sai: `nbList`, `pickTwin`, `startReview`, `recordQ`.
- Giáo viên: `reportsPage(true)`.

Phần lịch ôn nằm ở `lib/srs.js` (`nextReview`, `redoResult`), phần Hỏi thầy ở `app/api/report/route.js`. Lệnh chạy thử: `cd hoc-cung-cherry && node scripts/build-app.mjs && npm test`.

## Mục tiêu
Học sinh làm đi làm lại nhiều lần, nhớ luôn đáp án mà không biết cách làm. Có em làm tới khoảng 1000 câu đúng trong khi kho chỉ có vài trăm câu.

## Quyết định đã chốt với thầy (28/11/2026)
- **Thi đấu không hiện đáp án.**
  - Trong trận không hiện đúng/sai, không hiện đáp án hay lời giải. Điểm và chuỗi đúng cũng ẩn, không có âm thanh đúng/sai.
  - Sau khi nộp, học sinh xem lại được: mỗi câu ✅/❌, đề bài và phương án em đã chọn. Không có đáp án đúng, không có lời giải. Có lọc "Chỉ câu sai".
  - Áp dụng cho cả bài kiểm tra thăng hạng.
- Câu đúng/sai nhiều ý trong Thi đấu chỉ tính đúng khi đúng hết, chấm cho cả câu.
- **Câu sai trong Thi đấu (kể cả bài kiểm tra thăng hạng) không vào Câu sai.** Câu sai chỉ gồm câu từ Bản đồ kho báu và Ôn tập. Luật khóa Thi đấu (trên 10 câu thì khóa, còn 5 câu trở xuống thì mở) chỉ tính các câu này.
- **Lưu câu Thi đấu:** được lưu, nhưng không kèm đáp án hay lời giải. Mỗi câu đã lưu có nút **Hỏi thầy**. Thầy xem danh sách câu được hỏi, câu nhiều em hỏi nhất ở trên cùng.
- **Làm lại Câu sai bằng câu thay thế, chỉ cần đúng 1 lần.** App không đưa lại câu cũ mà chọn theo thứ tự:
  1. câu khác cùng bài, cùng mức mà em chưa gặp;
  2. câu cùng mức mà em đã gặp nhưng chưa làm đúng lần nào;
  3. câu cùng bài ở mức cao hơn, rồi mức thấp hơn (vẫn theo điều kiện chưa gặp hoặc chưa đúng);
  4. chính câu gốc, nếu câu đó có tham số (đổi số);
  5. đường cùng: câu gốc, đảo phương án, chỉ mở lại sau 1 ngày.

  Làm đúng thì câu ra khỏi Câu sai. Làm sai thì hiện lời giải của câu thay thế, câu gốc ở lại và lần sau đổi câu khác.

## Đã xong (đã commit)
- [x] Thi đấu chấm thầm (`rankAnswered`), bỏ tô xanh/đỏ ở mọi dạng câu, kể cả sắp xếp và sơ đồ (`q2.js`). Hết giờ thì nộp luôn.
- [x] Trang "Xem lại bài làm" sau trận và sau bài kiểm tra thăng hạng, thêm nút "Xem lại bài làm gần nhất" ở màn Thi đấu. Bài làm lưu trên máy (localStorage `ltt:rlast:<id>`), không gửi lên máy chủ để tiết kiệm lưu lượng.
- [x] Câu Thi đấu không ghi vào lịch ôn và Câu sai. Bỏ điều kiện "làm lại câu sai của bài kiểm tra trước" (`P.prw` không còn dùng).
- [x] Lưu câu Thi đấu (`td:1` trong `P.saved`): giao diện chỉ hiện đề, câu em đã chọn và ✅/❌. Có nút Hỏi thầy, không có "Làm thử lại".
- [x] Hỏi thầy dùng bảng `ltt_reports` có sẵn (`kind='khac'`, `snap.hoi=true`, `snap.my` = câu trả lời của em), nên **không phải chạy SQL**. Giáo viên có nút "Câu học sinh hỏi" ở màn chọn môn.
- [x] Câu sai: `pickTwin` chọn câu thay thế, `redoResult` gạch câu sau 1 lần đúng. Làm đúng lại chính câu cũ ở bản đồ hay đề ôn tập không còn gạch câu khỏi Câu sai (`nextReview`).
- [x] Sửa chữ hướng dẫn và luật Thi đấu.
- [x] Thêm test `tests/cau-sai.test.mjs`.

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy thử trên điện thoại:
  1. Đánh một trận Thi đấu: trong trận không thấy đúng/sai; nộp xong bấm "Xem lại bài làm".
  2. Lưu một câu rồi bấm Hỏi thầy.
  3. Vào Làm lại câu sai, kiểm tra có nhãn "Câu mới cùng bài".
  4. Đăng nhập giáo viên, mở "Câu học sinh hỏi".
- Ý tưởng đã bàn nhưng chưa làm:
  - khuôn đổi số cho các dạng tính toán (để luôn có câu thay thế mới);
  - gắn nhãn dạng cho câu;
  - XP giảm dần khi làm lại câu đã đúng;
  - bảng cho giáo viên xem thời gian trung bình mỗi câu, để phát hiện em thuộc đáp án.
- Bài nào ít câu ở mỗi mức sẽ hay rơi vào bước 5 (chờ 1 ngày), nên nhờ Gemini soạn thêm câu cho những bài đó.

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/q2.js`
- `hoc-cung-cherry/client/real.js`
- `hoc-cung-cherry/client/app2.css`
- `hoc-cung-cherry/lib/srs.js`
- `hoc-cung-cherry/app/api/report/route.js`
- `hoc-cung-cherry/tests/cau-sai.test.mjs`

## Cách kiểm tra
- `node scripts/build-app.mjs`, `npm test`: 56/56 đạt.
- `FAKE_DB=1 SESSION_SECRET=… npx next build`: đạt.
- Chạy thử FAKE_DB ở 390×844 bằng Playwright, tài khoản học sinh "Nguyễn Văn An" khối 8, mật khẩu 0000:
  - Thi đấu 10 câu đủ các dạng (trắc nghiệm, đúng/sai, điền số, nối ý, sắp xếp, sơ đồ): trong trận không tô đúng/sai.
  - Bảng kết quả và trang Xem lại hiển thị đúng; Câu sai vẫn là 0 sau trận.
  - Lưu câu, Hỏi thầy: giáo viên `thaylinh` / `matkhau123` thấy câu trong "Câu học sinh hỏi", kèm đáp án và lời giải cho thầy.
  - Làm sai một màn bản đồ: có 5 câu trong Câu sai; Làm lại ra câu khác cùng bài (nhãn "Câu mới cùng bài"), sai thì hiện lời giải câu đó.
- Ảnh: `docs/tien-do/anh/thi-dau-xem-lai.jpg`, `thi-dau-hoi-thay.jpg`, `cau-sai-cau-thay-the.jpg`, `giao-vien-cau-hoc-sinh-hoi.jpg`.

## Lưu ý cho người tiếp quản
- Không ghi gì lên Supabase thật, không đổi cấu trúc bảng.
- Dữ liệu câu hỏi (cả đáp án) vẫn được tải về máy học sinh như trước. Việc "không lộ đáp án" là ở giao diện.
- Câu sai cũ do Thi đấu ghi vào trước bản này vẫn còn trong sổ nếu là câu của bài trên bản đồ, và sẽ được làm lại bằng câu thay thế. Câu thuộc Kho Thi đấu bị lọc khỏi sổ (`nbList`).
