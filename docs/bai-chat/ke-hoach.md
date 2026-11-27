# Kế hoạch: lý thuyết kiểu "chat với Cherry"

- Thầy Linh duyệt: 27/11/2026, qua hai bản thử `ban-thu-hinh-hoc.html` (Toán 7 Bài 9) và `ban-thu-dai-so.html` (Toán 7, quy tắc chuyển vế).
- **Phân công:** Codex viết mã · Gemini soạn nội dung bài · Claude chỉ đạo (lập kế hoạch, duyệt PR, duyệt bài, làm trang xem thử trên Artifact).
- Tài liệu đi kèm:
  - [`cu-phap.md`](cu-phap.md): cú pháp khối `baichat` (phần mới so với cú pháp bài giảng).
  - [`k7-chuyen-ve.tex`](k7-chuyen-ve.tex): bài mẫu, cũng là dữ liệu kiểm tra.
  - [`ban-thu-dai-so.html`](ban-thu-dai-so.html), [`ban-thu-hinh-hoc.html`](ban-thu-hinh-hoc.html): **chuẩn giao diện và hành vi**. Khi không rõ, làm giống bản thử. Mã máy chạy bài nằm cuối mỗi file (từ dòng `/* ---------- máy chạy bài`).
- Kế hoạch này **thay cho phần giao diện** của [`../bai-giang/ke-hoach.md`](../bai-giang/ke-hoach.md) (khung bài giảng có hình ghim). Bộ đọc `parseLesson` và hình mẫu `catTuyen` đã làm ở đợt đó **được dùng lại**. Các issue #52, #53, #54 của đợt cũ đóng lại, thay bằng các issue dưới đây.

## 1. Bài học trông như thế nào

Một bài là **một dòng chat cuộn dọc**. Cherry nhắn từng lượt; hình nằm **ngay trong lượt nhắn** (không ghim trên cùng). Học sinh trả lời bằng nút; câu trả lời hiện thành bong bóng bên phải.

- Thanh trên: nút ×, thanh tiến độ, nút **Tóm tắt**, nút **Mục lục**. Dòng nhỏ dưới thanh: tên phần đang xem.
- Lượt nhắn của Cherry: ảnh Cherry + cột gồm bong bóng lời (`\cherry`), thẻ hình, thẻ kiến thức hoặc câu hỏi, phản hồi.
- Trước lượt nhắn mới: ba chấm "Cherry đang soạn" 650 ms (tắt khi người dùng bật giảm chuyển động).
- Đầu mỗi phần: vạch ngăn "Phần k/n · Tên phần" và dòng "Cậu sẽ: …".
- Nút chính ở chân màn: "Tiếp tục", hoặc chữ nhắc việc khi chưa làm xong ("Chọn một đáp án", "Chạm vào hình"), "Xong phần k", "Vào làm bài".
- Bấm Tiếp tục ở lượt không có câu hỏi: hiện bong bóng của học sinh xoay vòng ("Tớ hiểu rồi", "Tiếp đi Cherry", "Tớ sẵn sàng rồi", "Được, tiếp nào").
- Lời khen khi đúng xoay vòng ("Giỏi quá, \ten!", "Chuẩn luôn!", "Cậu nhanh thật!", "Chính xác!"); khoảng một lần trong ba có tên.
- Cuối mỗi phần: Cherry hỏi "Xong phần k rồi, \ten! Cậu thấy phần này thế nào?", hai nút **Tớ hiểu rồi** / **Hơi rối, nhắc lại**. Nhắc lại thì Cherry nhắn `\nhaclai` của phần rồi đi tiếp.
- Hình thu nhỏ nổi: khi hình của lượt mới nhất đã cuộn khuất lên trên, góc phải hiện bản thu nhỏ; chạm vào thì cuộn về hình (`updatePip` trong bản thử).
- **Mục lục** (lớp phủ từ dưới lên): Mở đầu, các phần, Kết bài, kèm trạng thái. Chạm phần đã học thì cuộn tới vạch ngăn của phần đó. Phần chưa tới thì báo "Học tới phần đó thì mở nhé".
- **Trang tóm tắt** (lớp phủ toàn màn): tự ghép theo `cu-phap.md` mục 6. Mở được bất cứ lúc nào, cuộn tới phần đang học.
- Màn rộng: dòng chat rộng tối đa khoảng 620 px, căn giữa.
- Phân số, công thức: MathJax như phần còn lại của app. `\[…\]` hiện thành dòng riêng căn giữa (lớp `.eqc` trong bản thử đại số).

## 2. Quyết định đã chốt với thầy

1. Cherry xưng **tớ**, gọi học sinh bằng **tên riêng thật** (chữ cuối của `ACC.name`, không dùng biệt danh `nick`) hoặc **cậu**.
2. **Bài cũ:** viết lại hết rồi mới bật. Bản chat nằm trong khối `\begin{baichat}` **bên cạnh** khối `lythuyet` cũ của cùng chủ đề. Học sinh chỉ thấy bản chat khi thầy **bật kiểu chat cho cả khối lớp** đó. Trước khi bật, học sinh vẫn học bản cũ như hiện nay.
3. **Xem thử trước khi nạp:** Claude làm một trang trên Artifact. Người soạn dán bài vào, xem chạy y như trên app, sửa lỗi, rồi **sao chép và dán vào trang quản trị của app** như hiện nay. Trang xem thử **không** ghi lên app. Nạp lên app là học sinh dùng được ngay (nếu khối đã bật).
4. **Hình:** cả hai loại. Hình tĩnh vẽ TikZ (app dịch như cũ). Hình tương tác dùng **thư viện hình mẫu** (`cat-tuyen` đã có; thêm `can`, `dang-thuc`; sau này thêm dần).
5. Gemini soạn nội dung. Codex viết mã. Claude chỉ đạo và duyệt.
6. Công thức đứng riêng một dòng, căn giữa (`\[…\]`).
7. Câu hỏi sai thì **chọn lại** tới khi đúng; mỗi phương án sai có lời giải thích riêng.

## 3. Kiến trúc

### 3.1. Bộ đọc (`lib/latex.js`)

- `parseBank` đọc thêm khối `\begin{baichat}…\end{baichat}` (tối đa một khối) thành `chat`, cùng cấu trúc với `lesson` hiện có (`modau`, `parts[].screens[]`, `ketbai`), dùng lại `parseLesson`.
- Thêm vào bộ đọc màn (theo `cu-phap.md` mục 4):
  - môi trường `thu` → `{type:'quiz', label, quiz:{q, opts:[{text, ok, why}]}}`;
  - môi trường `tinh` liền nhau → một màn `calc` với `items` nhiều phương án;
  - `\thaotac` liền nhau → `{type:'act', acts:[{label, state, say, warn}]}`;
  - `\theobuoc{…}{…}…` gắn vào `\vidu` kế tiếp (`stepStates`);
  - `\saukhitra` gắn vào màn có tương tác đứng ngay trước, với mọi loại màn có tương tác;
  - `\thungay`, `\emtinh` cũ đổi sang cùng dạng `opts` để giao diện chỉ xử lý một dạng.
- Hình mẫu `can`, `dang-thuc`: đọc tham số và trạng thái theo `cu-phap.md` mục 5. Khóa số hạng `\d+[tp]\d+` được chấp nhận ở `\chamhinh`, `\nhac`, `to=`, khi hình của màn là `dang-thuc`.
- **Lỗi** (đỏ, chặn lưu): `thu`/`tinh` không có đúng một `\dung` hoặc có ít hơn 2 hay nhiều hơn 4 phương án; `\dung`/`\sai` thiếu giải thích; khóa số hạng không có trong hình; `\theobuoc` không đứng trước `\vidu` hoặc nhiều đối số hơn số bước.
- **Cảnh báo** (vàng): `$…$` có `=`, `<`, `>`, `\Rightarrow` trong câu chữ (ngoài nút phương án); không có `\ten` nào; phần không có câu hỏi nào; các cảnh báo cũ của bài giảng.
- Kiểm tra tự động mới `tests/bai-chat.test.mjs`:
  - `docs/bai-chat/k7-chuyen-ve.tex`: không lỗi, không cảnh báo; có modau; 3 phần; số màn từng phần **P1 = 4, P2 = 7, P3 = 3**; kết bài có 1 câu 4 phương án và 3 dòng `emdahoc`; màn `act` đầu có 2 nút; màn `calc` đầu của P3 có 2 câu và `ketluan`; `\theobuoc` của ví dụ P2 có 3 trạng thái; `\chamhinh` đọc đúng `nhac` cho `1t1`, `1p1`.
  - Nội dung `docs/bai-giang/k7-b9-bai-giang.tex` đặt trong `baichat` (thay tên khối khi chạy kiểm tra) cũng đọc không lỗi: các màn hình học cũ chạy được trong bài chat.
  - Các bài cũ trong `tests/` vẫn qua.

### 3.2. Giao diện (`client/chat.js`, `client/chat.css`, `client/hinhmau.js`)

- File mới `client/chat.js`: `renderChatLesson(root, topic, o)`, nhận dữ liệu `chat` từ bộ đọc. Tham số `o` giống `renderLessonMaterial` (`title`, `onClose`, `finish`, `teacherEdit`) và thêm `studentName`. Chuyển máy chạy bài của bản thử sang đây: `blockHTML`, `renderBlock`, `addBlock`, `next`, `say`, `meRow`, hỏi cuối phần, Mục lục, Tóm tắt, hình thu nhỏ nổi.
- Bản thử dựng sẵn từng màn bằng tay (mảng `SC`). Bản thật **dựng mảng màn từ dữ liệu `chat`**: Mở đầu → "Bài học hôm nay" → các màn của từng phần → màn kết bài.
- Khi nào lượt nhắn có hình: màn có `\hinhrieng`; hoặc màn có tương tác trên hình chung; hoặc màn có `\trangthai`; hoặc màn đầu tiên của phần có `\hinhchung`. Màn đọc thường không lặp lại hình chung.
- `client/hinhmau.js`: thêm `can(params, state)` theo `figScale` và `dangThuc(params, state, {tap})` theo `figEq` của bản thử đại số. Hai hình dùng cùng hệ màu với `catTuyen`.
- **Lưu tiến độ** trong `localStorage`, khóa `ltt-chat:<id chủ đề>`: vị trí lượt mới nhất và kết quả từng lượt đã làm. Mở lại bài thì dựng ngay các lượt cũ ở trạng thái đã làm xong, không có hiệu ứng, rồi cuộn tới lượt mới nhất. Học xong cả bài thì lần sau mở có thanh "Cậu đã học xong · Xem tóm tắt · Học lại từ đầu". Mọi lần đọc/ghi bọc `try/catch`.
- Giáo viên: nút **Sửa** như cũ; không bị khóa phần; Mục lục mở được mọi phần.

### 3.3. Gắn vào app

- **Công tắc từng khối:** khóa mới `bai_chat_khoi` trong bảng `ltt_settings` (mảng số khối, mặc định rỗng). Trang quản trị có mục "Lý thuyết kiểu chat": mỗi khối một dòng "Khối 7: 12/23 bài đã có bản chat", kèm nút bật/tắt.
- Học sinh khối đã bật mở lý thuyết: chủ đề có `baichat` → `renderChatLesson`; không có → bản cũ.
- Giáo viên luôn xem được cả hai: khi chủ đề có `baichat`, màn lý thuyết của giáo viên có nút chuyển "Bản chat / Bản cũ".
- **Dán bài chat:** trong cửa sổ Sửa lý thuyết, thêm thẻ "Bản chat". Dán khối `\begin{baichat}…\end{baichat}` vào thì app thay đúng khối đó trong `source` của chủ đề (chưa có thì chèn ngay sau khối `lythuyet`, hoặc sau `\chude`), giữ nguyên mọi thứ khác. Có xem trước bằng `renderChatLesson` và hiện lỗi/cảnh báo. Lưu bản cũ vào `ban_truoc` như cơ chế có sẵn.
- `dung-hinh.mjs` đã tìm `tikzpicture` ở mọi chỗ trong `source`, nên hình TikZ trong `baichat` được dịch như cũ. Thêm một kiểm tra khẳng định điều này.

### 3.4. Trang xem thử (để Claude đăng lên Artifact)

- Script mới `scripts/build-xem-thu.mjs` sinh **một file HTML tự chứa** `hoc-cung-cherry/xem-thu/index.html` từ **đúng mã của app**: bộ đọc `lib/latex.js`, `client/chat.js`, `client/chat.css`, `client/hinhmau.js`. Không được viết lại một bản riêng, để xem thử và app luôn giống nhau.
- Trang chỉ được tải từ ngoài: MathJax từ `cdnjs.cloudflare.com`, phông Google Fonts. Không gọi API của app (trang Artifact chặn mọi kết nối khác).
- Nội dung trang:
  - Ô dán bài (nhận cả chủ đề đầy đủ hoặc chỉ khối `baichat`), ô "Tên học sinh" (mặc định "An"), nút **Chạy thử**.
  - Danh sách lỗi đỏ và cảnh báo vàng, có số dòng; chạm vào thì nhảy tới dòng đó trong ô dán.
  - Khung điện thoại 390 × 844 chạy bài bằng `renderChatLesson`; nút **Làm lại từ đầu**.
  - Hình TikZ hiện thành khung xám "Hình TikZ, sẽ hiện sau khi nạp lên app". Hình mẫu hiện đầy đủ.
  - Nút **Sao chép khối baichat** để dán vào app.
  - Nhớ bản đang dán trong `localStorage` (bọc `try/catch`).
- GitHub Actions `kiem-tra.yml` chạy thêm `node scripts/build-xem-thu.mjs` để chắc chắn trang luôn dựng được.
- Sau khi PR gộp, **Claude** đăng file này lên Artifact và gửi link cho thầy và Gemini. Mỗi lần mã chat đổi, Claude đăng lại.

## 4. Các việc cho Codex, theo thứ tự

| Việc | Nội dung | Phụ thuộc |
|---|---|---|
| **G1** | Bộ đọc `baichat` + lệnh mới + hình mẫu `can`, `dang-thuc` (phần đọc tham số) + kiểm tra tự động (mục 3.1) | – |
| **G2** | Giao diện chat `client/chat.js`, `chat.css`, hình `can`, `dangThuc` (mục 1, 3.2). Kiểm tra tay bằng `k7-chuyen-ve.tex` và Bài 9 | G1 |
| **G3** | Gắn vào app: công tắc từng khối, dán bài chat, chuyển bản cho giáo viên (mục 3.3) | G2 |
| **G4** | Trang xem thử `scripts/build-xem-thu.mjs` (mục 3.4) | G2 (làm song song với G3 được) |

Mỗi việc là một nhánh `codex/<việc>`, một PR, kèm `docs/tien-do/<nhánh>.md` (AGENTS.md mục 7). Kiểm tra tay ở 390 × 844 và 1000 × 800; chụp màn hình từng loại lượt nhắn so với bản thử, dán vào PR.

## 5. Việc của Gemini và Claude

- **Claude** (sau khi G4 gộp): đăng trang xem thử lên Artifact; cập nhật `docs/gemini-skill-soan-bai.md` theo `cu-phap.md`; duyệt các PR của Codex.
- **Gemini** (bắt đầu được ngay, không cần chờ mã): soạn lại các bài theo `cu-phap.md`, **khối thầy chọn trước**, từng bài một. Bài đầu tiên: viết lại Bài 9 Toán 7 (`docs/bai-giang/k7-b9-bai-giang.tex`) sang khối `baichat` giọng tớ–cậu, và hoàn thiện Bài 4 Toán 7 (thêm phần "Thứ tự thực hiện các phép tính" vào `k7-chuyen-ve.tex`).
- **Quy trình một bài:** Gemini soạn → dán vào trang xem thử, sửa hết lỗi → gửi Claude duyệt (nội dung đúng SGK, giọng, phương án sai, công thức) → thầy dán vào app (thẻ "Bản chat") → khi đủ cả khối, thầy bật công tắc.

## 6. Không làm trong đợt này

- Đồng bộ tiến độ lý thuyết lên máy chủ.
- Tự động chuyển bài cũ sang dạng chat.
- Hình mẫu khác ngoài `cat-tuyen`, `can`, `dang-thuc` (thêm khi bài cần; Gemini báo Claude, Claude ghi đặc tả, Codex làm).
- Nút "Đưa thẳng lên app" trên trang xem thử.

## 7. Rủi ro

- **Xem thử khác app:** chỉ dựng trang xem thử từ đúng file của app (mục 3.4).
- **Bài cũ vỡ:** không đụng khối `lythuyet`, `renderLessonMaterial`; học sinh khối chưa bật không thấy gì thay đổi.
- **Bài dài:** khoảng 25–30 lượt nhắn. Lưu tiến độ để học sinh dừng giữa chừng được.
- **Tên học sinh:** chỉ dùng trên máy học sinh, không gửi đi đâu (AGENTS.md mục 6).
