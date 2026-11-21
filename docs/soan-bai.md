# Hướng dẫn soạn câu hỏi và lý thuyết (dùng chung cho Claude và Gemini)

Bản này chép từ quy trình soạn bài của Claude (skill `nap-bai-leo-thap`), để trợ lý nào cũng soạn đúng định dạng app. Nếu skill đổi, cập nhật file này theo.

## Ghi bài vào app khi KHÔNG có quyền vào Supabase (ví dụ Gemini)

**Cách nhanh nhất (không cần máy tính):** trợ lý trả về toàn bộ LaTeX của một bài trong một khối mã. Thầy mở app bằng tài khoản giáo viên → Toán → khối → bấm vào bài còn xám có nhãn **+ Dán bài** trên bản đồ → dán → *Kiểm tra và tạo bài nháp*. App tự gắn đúng mã bài, tự thêm `\chude` nếu thiếu, bỏ qua dấu ``` và các dòng `%%%`, báo lỗi cú pháp nếu có. Hình TikZ tự hiện sau khoảng 15 phút. Bài đã có trên bản đồ thì sửa ở *Cài đặt & sửa câu hỏi* → *LaTeX của chủ đề*.

**Cách dùng file (sửa hàng loạt, đề ôn tập):**

1. Mỗi bài là một file `.tex` trong `hoc-cung-cherry/ngan-hang/lop<khối>/<slug>.tex`. Đầu file có các dòng thông tin:
   ```
   %%% slug: lop6-b23-mo-rong-phan-so
   %%% grade: 6
   %%% phan: dai-so            (dai-so | hinh-hoc | thong-ke | on-tap | thi-dau)
   %%% chuong: k6-b23          (mã bài; đề ôn tập để trống; Kho Thi đấu là mã chương k6-c2)
   %%% sort: 230
   %%% nguon: Gemini
   ```
   Sửa bài đã có: thầy chạy `keo` trước để lấy bản mới nhất, rồi sửa đúng file đó (giữ nguyên các dòng `%%%`).
2. Thầy kiểm tra cú pháp bằng đúng bộ đọc của app: `node scripts/ngan-hang.mjs kiemtra ngan-hang` (trong thư mục `hoc-cung-cherry`).
3. Thầy chạy thử rồi đẩy lên: `node --env-file=.env.local scripts/ngan-hang.mjs day --thu`, sau đó bỏ `--thu`. Bài mới luôn ở trạng thái nháp; thầy duyệt trong app.
4. Có hình TikZ mới: **không cần làm gì**. GitHub Actions (`.github/workflows/tu-dich-hinh.yml`) cứ 15 phút tự dịch các hình chưa có SVG. Cần hình ngay: vào GitHub → Actions → *Tự dịch hình TikZ* → *Run workflow*, hoặc tự chạy trên máy `node --env-file=.env.local scripts/dung-hinh.mjs <slug>`. Hình báo lỗi thì sửa mã TikZ, lần chạy sau tự dịch lại.

Mã bài: Bài thường `k<khối>-b<số bài SGK>`; Luyện tập chung `k<khối>-c<chương>-lt<thứ tự>` (khối 6–9); Bài tập cuối chương `k<khối>-c<chương>-cc` (khối 10–12, SGK THPT không có Luyện tập chung). Số bài khối 10–12 đánh liên tục cả năm như SGK (ví dụ `k11-b18` = Luỹ thừa với số mũ thực). Danh sách đủ ở hằng `CURR` trong `hoc-cung-cherry/client/app.js`.

Mỗi bài cần: Mức 1 ít nhất 5 câu, Mức 2 ít nhất 5, Mức 3 ít nhất 3, Mức 4 (Thi đấu) 2–4 câu; câu Mức 1–3 bám sát SGK Kết nối tri thức; câu Mức 4 hóc búa, phân loại theo mức độ hiểu bài, không dùng kiểu "tính mẹo".

## Kho Thi đấu theo chương (câu chỉ dùng cho Thi đấu)

Thi đấu rút câu Mức 1–4 của mọi bài **đã duyệt** của khối, cộng thêm **Kho Thi đấu theo chương**. Giáo viên đặt **mốc** "đã học hết Chương N" cho từng khối (Ngân hàng câu hỏi → tab Thi đấu): Thi đấu chỉ dùng câu của Chương 1..N, khoảng một nửa số câu mỗi trận thuộc Chương N. Chưa đặt mốc = mở mọi chương. Bài chưa gắn chương luôn được dùng.

- Kho là một chủ đề với `phan = 'thi-dau'`, `chuong = 'k<khối>-c<số chương>'` (ví dụ `k8-c3`), **không có** khối `lythuyet`, **không có** câu `extl`. Không hiện trên bản đồ.
- Mỗi lần nạp là **một đợt mới** (chủ đề mới, trạng thái nháp), tên `\chude{Kho Thi đấu · Chương 3. Tứ giác · đợt 2}`, `slug` dạng `lop8-c3-kho-thi-dau-...-dot-2`, `sort = chương*100 + đợt`. Không sửa đợt cũ đã duyệt để thêm câu (thêm câu vào đợt đã duyệt thì câu mới vào trận ngay, không qua bước duyệt).
- Nội dung: chủ yếu `\man{3}{Vận dụng}` và `\man{4}{Vận dụng cao}` (Mức 1–2 đã có sẵn trong các bài). Dùng đủ 4 dạng `ex`, `extf`, `exfb`, `exmatch`, có `\sai`/`\saithuong` và `\loigiai`. Câu phân loại theo mức độ hiểu bài, không dùng kiểu "tính mẹo". Mỗi câu làm được trong 1–3 phút. Kiến thức chỉ trong chương đó và các chương trước.
- **Gemini / không có quyền Supabase:** trả về một khối mã chỉ gồm các `\man{..}` và câu hỏi. Thầy mở app → Ngân hàng câu hỏi → tab **Thi đấu** → chọn khối → **+ Dán câu Thi đấu** → chọn chương → dán. App tự đặt tên đợt, tự thêm `\man{4}` nếu thiếu, báo lỗi cú pháp. Thầy bấm **Duyệt** cạnh đợt đó.
- **Claude (có Supabase):** chèn chủ đề như mục ghi Supabase của skill, với `phan = 'thi-dau'`, `chuong = 'k8-c3'`, `status = 'draft'`; đếm đợt đã có bằng `select count(*) from ltt_topics where phan = 'thi-dau' and chuong = 'k8-c3'`.
- **File:** `%%% phan: thi-dau` và `%%% chuong: k8-c3` rồi đẩy bằng `scripts/ngan-hang.mjs` như bài thường.

## Định dạng và kiểm tra

2. **Soạn LaTeX đúng định dạng app** — một khối mã cho một chủ đề:
```latex
\chude{Tên chủ đề}

\begin{lythuyet}
\dinhnghia{Tên khái niệm}{Nội dung, công thức trong $...$}
\quytac{Tên quy tắc}{Nội dung \\ dòng mới}
\congthuc{...}{...}   \dinhly{...}{...}   \tinhchat{...}{...}
\luuy{Lỗi hay gặp}
\vidu{Đề ví dụ}{Lời giải}
\end{lythuyet}

\man{1}{Nhận biết}
\begin{ex}
Đề bài có công thức $...$
\choice{$..$ \sai{vì sao sai}}{\True $..$}{$..$ \sai{..}}{$..$ \sai{..}}
\loigiai{...}
\end{ex}

\man{2}{Thông hiểu}
\begin{extf}
Đề dẫn. Mỗi khẳng định sau đúng hay sai?
\choiceTF{\True ý đúng}{ý sai}{\True ý đúng}{ý sai}
\loigiai{...}
\end{extf}

\man{3}{Vận dụng}
\begin{exfb}
Đề bài ...
\shortans{5/2;2,5}
\saithuong{5}{vì sao học sinh hay ra 5}
\loigiai{...}
\end{exfb}

\man{4}{Vận dụng cao}   % không có trên bản đồ, dùng cho Thi đấu
\begin{exmatch}
Nối mỗi ... với ...
\pair{$vế trái$}{$vế phải$}
\pair{..}{..}
\end{exmatch}
```
- **Tóm tắt lý thuyết** `\begin{lythuyet}…\end{lythuyet}`: một khối, đặt ngay sau `\chude`, trước `\man{1}`. Mục: `\dinhnghia`, `\quytac`, `\congthuc`, `\dinhly`, `\tinhchat` dạng `{tiêu đề}{nội dung}`; `\luuy{nội dung}`; `\vidu{đề}{lời giải}`. Gồm định nghĩa, quy tắc, công thức, định lý/tính chất của bài, 1 mục lưu ý lỗi hay gặp và 1–2 ví dụ ngắn; gọn trong 1–2 màn hình điện thoại (khoảng 4–6 mục). Bám đúng nội dung, kí hiệu và cách gọi của SGK Kết nối tri thức nhưng **diễn đạt bằng lời của mình**, không chép nguyên văn SGK; không lấn sang bài sau. Xuống dòng bằng `\\`. Ngoài `$...$` chỉ viết chữ thường (không dùng `\quad`, `\dots`, `\ `…, vì app không dịch lệnh ngoài công thức); không dùng `%` (viết `\%`).
- `ex` trắc nghiệm: 4 phương án, đúng **một** phương án có `\True`.
- `extf` đúng/sai: 4 ý, `\True` ở các ý đúng; học sinh phải đúng cả 4 ý mới được tính đúng.
- `exfb` điền đáp số: học sinh gõ bằng bàn phím số `0–9`, `−`, dấu phẩy, `/` — đáp số chỉ là số nguyên, thập phân (dấu phẩy) hoặc phân số `a/b`, **không** dùng căn hay biểu thức chữ. Nhiều cách viết cùng giá trị cách nhau bằng `;` (app tự coi `0,5` và `1/2` là bằng nhau). Đáp số là phân số thì đề ghi rõ "(viết dạng phân số a/b)".
- `exmatch` nối ý: 3–4 cặp, mỗi vế ngắn để vừa màn hình điện thoại dọc.
- **Đề tự luận** (Ôn tập, Phần 2 · Tự luận, đánh số TL1, TL2…): tạo một đề ôn tập riêng (`phan = 'on-tap'`) chỉ gồm các câu `extl`, **không trộn** với câu trắc nghiệm/đúng sai/điền số/nối ý (trộn là báo lỗi). Học sinh làm vào vở; app chỉ hiện đề và gợi ý, mỗi gợi ý mở lần đầu trừ 10 XP trong Ví XP. `\loigiai` (nếu có) chỉ giáo viên thấy.
  ```latex
  \chude{Đề thi thử tự luận học kì I}
  \man{1}{Đề}
  \begin{extl}
  Bài 1 (1,5 điểm). a) ...\\ b) ...
  \goiy{Hướng làm: dùng kiến thức nào.}
  \goiy{Bước đầu tiên, không lộ đáp số.}
  \loigiai{... (chỉ giáo viên thấy)}
  \end{extl}
  ```
  Mỗi `extl` là một bài của đề (có thể gồm nhiều ý a, b, c); viết 1–3 gợi ý, gợi ý trước chỉ hướng, gợi ý sau cụ thể hơn, không lộ đáp số.
- `\loigiai` không bắt buộc nhưng nên có ở mức 3–4 (học sinh xem khi làm sai).
- **Báo lỗi theo đáp án sai** (hiện ngay khi học sinh chọn sai, trong khung *Vì sao chưa đúng?*): **mọi câu `ex` mới phải có**, nên có ở `extf` và `exfb`.
  - `ex`: đặt `\sai{…}` ngay trong phương án sai, ví dụ `\choice{$-5$ \sai{Quên đổi dấu khi bỏ ngoặc: $-(a-b)=-a+b$.}}{\True $5$}{…}{…}`. Không đặt `\sai` trong phương án `\True`.
  - `extf`: đặt `\sai{…}` trong ý; hiện khi học sinh đánh giá sai ý đó (ý đúng mà chọn S, ý sai mà chọn Đ), nên viết lời giải thích vì sao ý đó đúng/sai.
  - `exfb`: thêm `\saithuong{đáp số sai hay gặp}{vì sao sai}` (viết nhiều lần được); học sinh gõ đúng số đó thì hiện lời giải thích. Dùng được tham số: `\saithuong{{{2*a}}}{…}`.
  - Cách viết: 1–2 câu, nói đúng **chỗ hiểu sai** (quên đổi dấu, nhầm công thức, thiếu điều kiện…) và nhắc lại quy tắc đúng; không chỉ ghi "Sai rồi" hay chép lại đáp án. Vì thế phương án nhiễu nên là lỗi sai thường gặp có thật.
  - Thêm hoặc sửa `\sai`/`\saithuong` cho câu cũ **không** làm mất lịch ôn của học sinh.
- **Gợi ý từng bước** `\goiy{...}`: đặt trong câu, viết nhiều lần theo thứ tự (gợi ý 1 rồi gợi ý 2). Học sinh bấm mở từng gợi ý, mỗi gợi ý trừ 30 điểm của câu. Câu mức 3–4 nên có 1–2 gợi ý: gợi ý 1 chỉ hướng (dùng kiến thức nào), gợi ý 2 là bước đầu tiên; **không được lộ đáp số/đáp án**. Mức 1–2 thường không cần gợi ý.
- **Câu có tham số** (mỗi lần làm ra số khác, dùng cho ôn tập và "câu tương tự" khi học sinh làm sai). Khai báo bằng các dòng `%@` ngay trong môi trường câu hỏi:
  ```latex
  \begin{exfb}
  %@ a = ngaunhien(2, 9)
  %@ b = chon(-3, -2, 2, 3)
  %@ dieukien: a != abs(b)
  Tính $({{a}}{{+b}})^2$.
  \goiy{Dùng hằng đẳng thức $(x+y)^2=x^2+2xy+y^2$.}
  \shortans{{{(a+b)^2}}}
  \loigiai{$({{a}}{{+b}})^2={{(a+b)^2}}$.}
  \end{exfb}
  ```
  Hàm: `ngaunhien(a,b)` (số nguyên trong [a;b]), `chon(...)`, `ps(p,q)` (phân số tối giản, in ra `\dfrac`), `abs`, `min`, `max`, `ucln`, `bcnn`, `sqrt`, `tron(x, d)`; toán tử `+ - * / % ^`, so sánh `== != < > <= >=`, `&&`, `||`. Số thập phân trong biểu thức viết bằng dấu chấm (`0.5`). Trong đề viết `{{biểu thức}}`; `{{+b}}` luôn in kèm dấu (dùng khi viết `x{{+b}}`). Đáp số `\shortans{{{...}}}` tự in dạng app chấm được (phân số `a/b`, thập phân dấu phẩy). Dùng `dieukien` để loại bộ số xấu (mẫu bằng 0, hai phương án trùng nhau, đáp số quá lớn…). Với trắc nghiệm có tham số, mọi phương án phải luôn khác nhau với mọi bộ số hợp lệ. **Không dùng tham số bên trong hình TikZ.** Nên dùng tham số cho các câu tính toán mức 1–3 (khoảng một nửa số câu).
- Công thức trong `$...$`. Không dùng bảng, `\item`, `\section`, macro riêng của ex_test (`\vg`, `\hoac`, `\heva`…) — app hiển thị công thức bằng MathJax chuẩn.
- **Đề ôn tập** (`phan = 'on-tap'`): dùng một `\man{1}{Đề}` chứa 10–20 câu trộn Đại số, Hình học (và Thống kê nếu có), thứ tự từ dễ đến khó như một đề kiểm tra. **Khác bản đồ, đề ôn tập cần nhiều câu hóc búa**: khoảng 1/3 câu cơ bản, phần còn lại là câu vận dụng và vận dụng cao kết hợp nhiều bài/chương, nhiều bước suy luận, dễ sai nếu hiểu chưa chắc; không cần `\goiy` vì học sinh làm đề không có gợi ý, nhưng nên có `\loigiai`.
- **Hình vẽ:** viết thẳng `\begin{tikzpicture}...\end{tikzpicture}` ở bất kỳ chỗ nào (đề, phương án, vế nối ý, lời giải), không bọc trong `$...$` hay môi trường `center`/`figure`. Dùng được tikz, tkz-euclide, pgfplots và các thư viện `calc, angles, quotes, arrows.meta, patterns, intersections, through`; chữ tiếng Việt trong hình hiển thị đúng. Không dùng `\input`, hình ảnh ngoài, hoặc gói khác ngoài danh sách. Vẽ cho màn hình điện thoại: rộng khoảng 6–8 cm, mỗi hình một khối riêng, nhãn điểm rõ ràng; có thể dùng cách vẽ quen thuộc của skill hinh-ve-tikz.

3. **Số lượng và mức độ (mỗi bài học).** Mỗi bài học thường kèm khối `lythuyet` (bài Luyện tập chung và đề ôn tập không cần). Thầy nhờ "soạn lý thuyết cho …" thì chỉ thêm khối `lythuyet` vào bài đã có: đọc `source` mới nhất, chèn khối sau dòng `\chude`, giữ nguyên câu hỏi và trạng thái; bài chưa có trong Supabase thì tạo chủ đề mới chỉ có `\chude` + `lythuyet` (nháp, đúng mã bài). Mỗi mức là một kho để app rút ngẫu nhiên mỗi lần làm, nên cần nhiều hơn số câu rút ra: Mức 1 ít nhất 5 câu, Mức 2 ít nhất 5, Mức 3 ít nhất 3, Mức 4 (cho Thi đấu, không bắt buộc) 2–4 câu. **Câu Mức 1–3 là bài tập về nhà: bám sát SGK** — đúng kiến thức, dạng bài và độ khó của phần lí thuyết, ví dụ, luyện tập và bài tập cuối bài trong SGK Kết nối tri thức (có thể đổi số, đổi ngữ cảnh), không lấn sang bài sau, không đưa bài nâng cao/HSG vào bản đồ. Trộn nhiều dạng trong mỗi mức. Mức 1 Nhận biết, Mức 2 Thông hiểu, Mức 3 Vận dụng, Mức 4 Vận dụng cao. Một lượt bài khoảng 10 phút (8 câu), nên câu Mức 3 không quá dài. Tên `\chude{...}` là tên bài trong SGK (ví dụ `\chude{Quan hệ chia hết và tính chất}`). Thầy nhờ soạn cả chương thì tạo mỗi bài một chủ đề riêng.
- **Câu Mức 4 (Thi đấu) phải thật sự hóc búa**: cấp độ vượt SGK, hướng tới phân loại học sinh khá giỏi (kết hợp nhiều kiến thức, bài toán ngược, biện luận, tìm điều kiện, chứng minh dạng trắc nghiệm/đúng-sai), vẫn làm được trong 1–3 phút. Cần nhiều câu Mức 4 cho mỗi chương hơn trước vì Thi đấu dùng kho này nhiều.
- Câu mức 3–4 và câu khó trong đề ôn tập phân loại theo **mức độ hiểu bài** (hiểu bản chất, phát hiện lỗi sai, điều kiện xác định, biện luận…), **không** dùng kiểu "tính mẹo" (so sánh cùng số mũ, chữ số tận cùng, nhân–trừ vế để tính tổng lũy thừa, tổng sai phân…).
- Phương án nhiễu của trắc nghiệm nên là lỗi sai thường gặp của học sinh.

4. **Tự kiểm tra trước khi ghi** (bắt buộc; với câu có tham số thì thử vài bộ số cụ thể, kể cả trường hợp biên, và kiểm tra đáp án theo công thức):
- Tính lại đáp án từng câu; với đúng/sai kiểm tra từng ý.
- Khối `lythuyet` (nếu có): kiểm tra lại từng công thức, ví dụ và lời giải; mỗi mục đủ số cặp `{…}`; số dấu `$` chẵn.
- Mỗi `ex` có đúng một `\True`, mỗi phương án sai có `\sai{…}` đúng nội dung; mỗi `exfb` có `\shortans` gõ được bằng bàn phím số; mỗi `\begin{..}` có `\end{..}` cùng loại; ngoặc nhọn cân bằng.
- Mã LaTeX **không được chứa chuỗi `$ltt$`** (dùng làm dấu bọc khi ghi).

