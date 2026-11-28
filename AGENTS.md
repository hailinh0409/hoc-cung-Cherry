# Hướng dẫn chung cho trợ lý AI (Claude, Gemini, …)

App **Học cùng Cherry** (CLB Toán - Anh NGỌC LINH) được nhiều trợ lý AI cùng xây dựng. Mọi trợ lý đọc file này trước khi sửa mã. `CLAUDE.md` và `GEMINI.md` chỉ trỏ về đây, để hai bên luôn dùng chung một bộ quy tắc.

Khi Claude tiếp quản phần lý thuyết, đọc [Bàn giao lý thuyết tương tác](docs/ban-giao-ly-thuyet-tuong-tac.md) để nắm trạng thái đã triển khai, cú pháp soạn bài và cách kiểm tra.

**Lý thuyết kiểu chat với Cherry (thầy duyệt 27/11/2026, thay cho giao diện bài giảng có hình ghim):** kế hoạch và việc cho Codex: [docs/bai-chat/ke-hoach.md](docs/bai-chat/ke-hoach.md); cú pháp khối `baichat`: [docs/bai-chat/cu-phap.md](docs/bai-chat/cu-phap.md); bài mẫu: [docs/bai-chat/k7-chuyen-ve.tex](docs/bai-chat/k7-chuyen-ve.tex). Phân công: Codex viết mã, Gemini soạn bài, Claude chỉ đạo và duyệt.

**Chặng Tự luận trên bản đồ (thầy duyệt 28/11/2026):** bài tự luận giải cùng Cherry kiểu chat, nằm sau bài cuối mỗi chương, rương mở khi làm trọn 2 bài. Bài là chủ đề Bài mẫu (`giaimau` + `\huong`, `\goiy`, `\kiemtra`). Yêu cầu soạn để chép cho Gemini: [docs/tu-luan/yeu-cau-gemini.md](docs/tu-luan/yeu-cau-gemini.md); bàn giao: [docs/tien-do/claude-tu-luan-chat.md](docs/tien-do/claude-tu-luan-chat.md).

**Bài giảng kiểu mới (thầy duyệt 26/11/2026):** lý thuyết có Mở đầu → Mục lục → các Phần → Kết bài, hình chung theo phần, chạm thử trên hình. Kế hoạch và các việc cho người viết mã: [docs/bai-giang/ke-hoach.md](docs/bai-giang/ke-hoach.md); cú pháp soạn: [docs/bai-giang/cu-phap.md](docs/bai-giang/cu-phap.md); bài mẫu Toán 7 Bài 9: [docs/bai-giang/k7-b9-bai-giang.tex](docs/bai-giang/k7-b9-bai-giang.tex).

Chủ dự án: **thầy Phan Hải Linh** (GitHub `hailinh0409`). Thầy là người duy nhất gộp (merge) vào `main`.

## 1. Cách phối hợp

- **Không đẩy thẳng lên `main`.** Mỗi việc là một nhánh và một pull request (PR):
  - Claude: nhánh `claude/<việc>`; Gemini: nhánh `gemini/<việc>`.
  - Tiêu đề PR và commit viết tiếng Việt, nói rõ thay đổi gì cho thầy và học sinh.
- **Một việc, một trợ lý.** Trước khi bắt đầu, xem các PR đang mở và các issue trên GitHub. Nếu việc đó đang có PR của trợ lý kia, không làm song song; góp ý trong PR đó.
- **Xem chéo.** Khi thầy nhờ, trợ lý này đọc PR của trợ lý kia và góp ý bằng bình luận trong PR (lỗi, chỗ chưa khớp quy tắc). Không tự sửa đè lên nhánh của bên kia, **trừ khi thầy giao tiếp quản** (mục 7).
- **Bắt đầu từ `main` mới nhất.** Luôn tạo nhánh từ `origin/main` vừa tải về. Không dựa vào bản sao cũ trên máy thầy (ổ D) hay bản sao cũ của chính mình.
- Mỗi PR ghi rõ: đã thay đổi gì, đã kiểm tra thế nào (lệnh đã chạy, kết quả), còn gì chưa làm.

## 2. Cấu trúc mã (thư mục `hoc-cung-cherry/`)

- `client/` — giao diện một trang (`app.js`, `real.js`, `body.html`, `head.html`, `app1.css`, `app2.css`, …).
  **Không sửa trực tiếp `public/app.html` và `lib/items.js`**: hai file này được sinh bằng `node scripts/build-app.mjs`. Sửa `client/` xong phải chạy lệnh này và commit cả file sinh ra.
- `app/api/` — máy chủ Next.js (đăng nhập, đồng bộ, lưu tiến độ, chức năng giáo viên).
- `lib/` — dùng chung: `latex.js` (bộ đọc câu hỏi LaTeX, dùng cả ở máy chủ, giao diện và script), `params.js` (câu có tham số), `srs.js` (lịch ôn), `validate.js` (chống gian lận), `topics.js`, `figcode.js` (hình TikZ).
- `scripts/` — `build-app.mjs`, `ngan-hang.mjs` (kéo/đẩy ngân hàng câu hỏi), `dung-hinh.mjs` và `dich_hinh.py` (dịch TikZ sang SVG; GitHub Actions `tu-dich-hinh.yml` tự chạy `dung-hinh.mjs` mỗi 15 phút, nên trợ lý **không cần tự dịch hình**), `create-teacher.mjs`.
- `tests/` — `npm test`; `fakedb.cjs` + `seed.json` là cơ sở dữ liệu giả để chạy thử.

## 3. Kiểm tra bắt buộc trước khi mở PR

GitHub tự chạy các bước dưới đây cho mọi lần đẩy mã và mọi PR (`.github/workflows/kiem-tra.yml`); dấu ✓ hoặc ✗ hiện ngay trên PR. Vercel tự chạy `scripts/build-app.mjs` khi triển khai (`npm run build`), nên người sửa trên web không cần tự ghép `public/app.html`.

```bash
cd hoc-cung-cherry
npm ci
node scripts/build-app.mjs          # nếu có sửa client/
npm test
FAKE_DB=1 SESSION_SECRET=<chuỗi ≥32 kí tự> npx next build
```

Có sửa giao diện thì chạy thử bằng dữ liệu giả (`FAKE_DB=1 … npx next start`, tài khoản giáo viên mẫu `thaylinh` / `matkhau123`) ở cỡ màn hình điện thoại (khoảng 390×844), cả tài khoản học sinh lẫn giáo viên, và ghi kết quả vào PR.

## 4. Dữ liệu (Supabase, project `bmfysidpeyzxkgmfzdcl`)

- Bảng `ltt_topics` (câu hỏi, lý thuyết) và `ltt_figures` (hình đã dịch): được đọc/ghi khi soạn bài.
- Bảng tài khoản và tiến độ (`ltt_accounts`, `ltt_players`, `ltt_assignments`, …): **chỉ đụng khi thầy yêu cầu rõ ràng**, và không bao giờ xóa dữ liệu học sinh.
- Thay đổi cấu trúc bảng (thêm bảng, thêm cột): viết thành file SQL trong PR để thầy duyệt, không tự chạy trên Supabase thật.
- **Không đụng** project `pknuqhniararjldazhbi` (app bài tập cũ).
- **Không bao giờ commit khóa bí mật** (`SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, khóa API AI). Khóa đặt trong Vercel và `.env.local` (đã có trong `.gitignore`).

## 5. Câu hỏi và lý thuyết (LaTeX trong `ltt_topics.source`)

- Một chủ đề = một bài học SGK Kết nối tri thức; cột `chuong` là mã bài (`k6-b8`, `k6-c2-lt1`; khối 10–12 không có Luyện tập chung mà có Bài tập cuối chương `k10-c4-cc`). Đề ôn tập: `phan = 'on-tap'`.
- Dạng câu: `ex` (trắc nghiệm, đúng một `\True`), `extf` (đúng/sai), `exfb` (điền đáp số, chỉ số nguyên/thập phân/phân số), `exmatch` (nối ý), `exsx` (sắp xếp lời giải: `\buoc`, `\nhieu`), `exsd` (sơ đồ phân tích đi lên: `\nut`, `\an`, `\anly`, `\nhieu`, `\nhieuly`), `extl` (tự luận: chỉ đề + `\goiy`, chỉ dùng trong đề ôn tập riêng, không trộn với dạng khác). Mức `\man{1..4}`; Mức 4 không có trên bản đồ.
- Báo lỗi theo đáp án sai: `\sai{…}` trong phương án/ý sai (`ex`, `extf`), `\saithuong{đáp số sai}{vì sao}` cho `exfb`. Câu `ex` mới phải có `\sai` ở mọi phương án sai (chi tiết: `docs/soan-bai.md`).
- Tóm tắt lý thuyết: khối `\begin{lythuyet}…\end{lythuyet}` ngay sau `\chude`, với `\dinhnghia`, `\quytac`, `\congthuc`, `\dinhly`, `\tinhchat` `{tiêu đề}{nội dung}`, `\luuy{…}`, `\vidu{đề}{lời giải}`. Ngoài `$…$` không dùng lệnh LaTeX (trừ `\\`).
- Khi soạn màn có tương tác, dùng [mẫu soạn màn chung](docs/soan-man-tuong-tac.txt) cho `\loidan`, `\minhhoa` và `\thungay`. Khi nâng cấp một màn đã có, giữ nguyên nội dung từ `\man{1}` đến hết bài.
- **Bám sát SGK Toán Kết nối tri thức.** Đúng khối, đúng bài, đúng phạm vi kiến thức. Dùng thuật ngữ và ký hiệu quen thuộc trong sách, diễn đạt bằng lời của mình và không chép nguyên văn.
- **Mỗi bài phải trực quan và tương tác hơn trang SGK thông thường, để học sinh mức trung bình cũng theo kịp.** Dẫn vào bằng ví dụ cụ thể, giải thích từng bước và dùng hình minh họa hoặc thao tác phù hợp để học sinh thấy vì sao. Cho học sinh thử ngay và phản hồi rõ lỗi sai. Kiểm tra bằng một ví dụ mới để xem học sinh có tự áp dụng hoặc giải thích được ý chính hay không.
- Câu khó phân loại theo **mức độ hiểu bài**, không dùng kiểu "tính mẹo".
- Chủ đề mới luôn ở trạng thái nháp (`draft`); chỉ thầy duyệt cho học sinh.

## 6. Học sinh là trẻ em (lớp 6–12, đều dưới 18 tuổi)

- Mọi tính năng AI cho học sinh phải tuân thủ điều khoản của nhà cung cấp về người dùng dưới 18 tuổi. Hiện **Gemini API (Google AI Studio) không cho dùng trong ứng dụng hướng tới người dưới 18 tuổi**; Claude API cho phép nếu có các biện pháp an toàn. Kiểm tra lại điều khoản trước khi tích hợp bất kỳ mô hình nào vào app.
- Không gửi tên hay thông tin cá nhân của học sinh cho dịch vụ AI.

## 7. Bàn giao khi một trợ lý dừng giữa chừng

Trợ lý nào cũng có thể dừng đột ngột (hết lượt dùng, hết bộ nhớ hội thoại, mất kết nối). Vì vậy **việc dở phải nằm trên GitHub, không nằm trong cuộc trò chuyện**:

- **Mọi thay đổi đều có bản bàn giao, kể cả việc nhỏ một bước** (sửa một lỗi, đổi một dòng chữ). Mỗi PR phải kèm file `docs/tien-do/<tên-nhánh>.md` đã điền đủ, đặc biệt mục *Bắt đầu từ đâu* và *Việc tiếp theo*, để trợ lý khác (Claude, Gemini, Codex) đọc là làm tiếp được mà không cần cuộc trò chuyện cũ. PR không có bản bàn giao thì chưa coi là xong.
- **Ngay khi bắt đầu một việc nhiều bước:** tạo nhánh, chép `docs/tien-do/MAU.md` thành `docs/tien-do/<tên-nhánh>.md` (thay `/` bằng `-`), điền mục tiêu và các bước dự kiến, commit, đẩy lên, mở **pull request nháp (Draft)**.
- **Sau mỗi bước nhỏ:** commit, đẩy lên, cập nhật file tiến độ (đã xong, đang làm dở chỗ nào, còn lại gì). Không để thay đổi chưa commit quá lâu.
- **Quyết định thầy đã chốt trong chat** (ví dụ "không mở lý thuyết lúc làm bài") phải ghi vào mục *Quyết định đã chốt* của file tiến độ, vì trợ lý tiếp quản không đọc được cuộc trò chuyện.
- **Dữ liệu đã ghi lên Supabase** trong lúc làm (bảng, slug) phải ghi vào file tiến độ.
- **File liên quan:** liệt kê các file người tiếp quản cần đọc hoặc sửa, vì Gemini trên web chỉ đọc được file thầy đính kèm.
- **Tiếp quản:** khi thầy giao, trợ lý kia làm tiếp trên **cùng nhánh, cùng PR**, đọc file tiến độ trước, ghi "Người đang làm" là mình, và tiếp tục cập nhật file đó. Không làm lại phần đã xong nếu không thấy lỗi.
- **Xong việc:** đánh dấu trạng thái "xong, chờ thầy duyệt", chuyển PR từ Draft sang Ready. File bàn giao **giữ lại sau khi gộp, không xóa**: đó là nhật ký để trợ lý sau biết việc đã làm, lý do, và chỗ còn dở.
- **Trước khi đẩy thêm commit vào một PR, kiểm tra PR đó còn mở.** Nếu thầy đã gộp, tạo nhánh mới từ `main` và mở PR mới cho phần thêm (bài học 25/11/2026: bản sửa lỗi Chuyên Toán bị đẩy vào PR #28 đã gộp nên không lên app).
- **Bắt đầu một việc mới:** đọc các file mới nhất trong `docs/tien-do/` (sắp theo ngày cập nhật) để biết việc gần đây và chỗ còn dở.

Hướng dẫn cho thầy: `docs/gemini-tiep-quan.md`. Hướng dẫn soạn câu hỏi, lý thuyết cho trợ lý không có quyền vào Supabase: `docs/soan-bai.md`.

## 8. Viết cho thầy

Thầy không phải lập trình viên chuyên nghiệp. Mô tả PR và tin nhắn viết tiếng Việt, ngắn, nói rõ thầy cần bấm gì hay kiểm tra gì; tránh thuật ngữ khi không cần.
