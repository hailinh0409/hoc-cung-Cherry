# Hướng dẫn chung cho trợ lý AI (Claude, Gemini, …)

App **Học cùng Cherry** (CLB Toán - Anh NGỌC LINH) được nhiều trợ lý AI cùng xây dựng. Mọi trợ lý đọc file này trước khi sửa mã. `CLAUDE.md` và `GEMINI.md` chỉ trỏ về đây, để hai bên luôn dùng chung một bộ quy tắc.

Chủ dự án: **thầy Phan Hải Linh** (GitHub `hailinh0409`). Thầy là người duy nhất gộp (merge) vào `main`.

## 1. Cách phối hợp

- **Không đẩy thẳng lên `main`.** Mỗi việc là một nhánh và một pull request (PR):
  - Claude: nhánh `claude/<việc>`; Gemini: nhánh `gemini/<việc>`.
  - Tiêu đề PR và commit viết tiếng Việt, nói rõ thay đổi gì cho thầy và học sinh.
- **Một việc, một trợ lý.** Trước khi bắt đầu, xem các PR đang mở và các issue trên GitHub. Nếu việc đó đang có PR của trợ lý kia, không làm song song; góp ý trong PR đó.
- **Xem chéo.** Khi thầy nhờ, trợ lý này đọc PR của trợ lý kia và góp ý bằng bình luận trong PR (lỗi, chỗ chưa khớp quy tắc). Không tự sửa đè lên nhánh của bên kia.
- **Bắt đầu từ `main` mới nhất.** Luôn tạo nhánh từ `origin/main` vừa tải về. Không dựa vào bản sao cũ trên máy thầy (ổ D) hay bản sao cũ của chính mình.
- Mỗi PR ghi rõ: đã thay đổi gì, đã kiểm tra thế nào (lệnh đã chạy, kết quả), còn gì chưa làm.

## 2. Cấu trúc mã (thư mục `hoc-cung-cherry/`)

- `client/` — giao diện một trang (`app.js`, `real.js`, `body.html`, `head.html`, `app1.css`, `app2.css`, …).
  **Không sửa trực tiếp `public/app.html` và `lib/items.js`**: hai file này được sinh bằng `node scripts/build-app.mjs`. Sửa `client/` xong phải chạy lệnh này và commit cả file sinh ra.
- `app/api/` — máy chủ Next.js (đăng nhập, đồng bộ, lưu tiến độ, chức năng giáo viên).
- `lib/` — dùng chung: `latex.js` (bộ đọc câu hỏi LaTeX, dùng cả ở máy chủ, giao diện và script), `params.js` (câu có tham số), `srs.js` (lịch ôn), `validate.js` (chống gian lận), `topics.js`, `figcode.js` (hình TikZ).
- `scripts/` — `build-app.mjs`, `ngan-hang.mjs` (kéo/đẩy ngân hàng câu hỏi), `dung-hinh.mjs` và `dich_hinh.py` (dịch TikZ sang SVG), `create-teacher.mjs`.
- `tests/` — `npm test`; `fakedb.cjs` + `seed.json` là cơ sở dữ liệu giả để chạy thử.

## 3. Kiểm tra bắt buộc trước khi mở PR

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

- Một chủ đề = một bài học SGK Kết nối tri thức; cột `chuong` là mã bài (`k6-b8`, `k6-c2-lt1`). Đề ôn tập: `phan = 'on-tap'`.
- Dạng câu: `ex` (trắc nghiệm, đúng một `\True`), `extf` (đúng/sai), `exfb` (điền đáp số, chỉ số nguyên/thập phân/phân số), `exmatch` (nối ý). Mức `\man{1..4}`; Mức 4 không có trên bản đồ.
- Tóm tắt lý thuyết: khối `\begin{lythuyet}…\end{lythuyet}` ngay sau `\chude`, với `\dinhnghia`, `\quytac`, `\congthuc`, `\dinhly`, `\tinhchat` `{tiêu đề}{nội dung}`, `\luuy{…}`, `\vidu{đề}{lời giải}`. Ngoài `$…$` không dùng lệnh LaTeX (trừ `\\`).
- Câu hỏi và lý thuyết bám SGK nhưng **diễn đạt bằng lời của mình**, không chép nguyên văn sách.
- Câu khó phân loại theo **mức độ hiểu bài**, không dùng kiểu "tính mẹo".
- Chủ đề mới luôn ở trạng thái nháp (`draft`); chỉ thầy duyệt cho học sinh.

## 6. Học sinh là trẻ em (lớp 6–9)

- Mọi tính năng AI cho học sinh phải tuân thủ điều khoản của nhà cung cấp về người dùng dưới 18 tuổi. Hiện **Gemini API (Google AI Studio) không cho dùng trong ứng dụng hướng tới người dưới 18 tuổi**; Claude API cho phép nếu có các biện pháp an toàn. Kiểm tra lại điều khoản trước khi tích hợp bất kỳ mô hình nào vào app.
- Không gửi tên hay thông tin cá nhân của học sinh cho dịch vụ AI.

## 7. Viết cho thầy

Thầy không phải lập trình viên chuyên nghiệp. Mô tả PR và tin nhắn viết tiếng Việt, ngắn, nói rõ thầy cần bấm gì hay kiểm tra gì; tránh thuật ngữ khi không cần.
