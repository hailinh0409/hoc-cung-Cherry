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

## Soạn hàng loạt theo chương bằng Gemini (tiết kiệm token Claude)

1. App → giáo viên → Toán → khối → trên biển tên chương bấm **✦ Soạn bằng Gemini** → **Sao chép chương** (có thể sửa lời nhờ trước khi chép). App chép phần lý thuyết của mọi bài thường trong chương, mỗi bài mở đầu bằng `%%% bai: <slug>` (bài chưa có: `%%% bai: <mã bài>`).
2. Dán vào Gemini. Gemini trả một khối mã cùng định dạng (xem `docs/gemini-skill-soan-bai.md` mục 7b).
3. **Dán kết quả** → **Kiểm tra** → xem trước từng bài → **Lưu**. App chỉ thay khối `lythuyet` của bài đã có (câu hỏi được khóa, giữ nguyên trạng thái duyệt; bài đang giao thì học sinh thấy ngay); bài chưa có thì tạo bài nháp.
4. Khoảng 15 phút sau bấm **Kiểm tra hình của chương**. Hình lỗi: **Sao chép lỗi hình cho Gemini** → dán vào Gemini → dán kết quả lại như bước 3.

## Hình từng bước

`\begin{hinhbuoc}` + một `tikzpicture` (phần hiện từ bước k bọc `\hien{k}{…}`) + mỗi bước một `\loibuoc{…}` + `\end{hinhbuoc}`. Cú pháp và quy tắc: `docs/gemini-skill-soan-bai.md` mục 3.7b. GitHub Actions dịch mỗi bước thành một khung riêng (mã khung `\lttbuoc{k}` + hình, xem `lib/latex.js` `hbFrame`).

## Bài giải mẫu từng bước, Bài mẫu theo chương, hướng dẫn tự luận

Cú pháp `\begin{giaimau}` (ví dụ dài trong lý thuyết, Bài mẫu theo chương) và `\begin{huongdan}` (gợi ý từng bước trong `extl` của đề Ôn tập tự luận), cách dùng `\doan`, `\buocgiai`, sơ đồ `sodo`, hình theo bước `\hien`/`\phu`/`\sang`: xem `docs/gemini-skill-soan-bai.md` mục 3.9. Mẫu: `docs/mau/giaimau-tiep-tuyen.tex`, `docs/mau/bai-mau-chuong.tex`, `docs/mau/huongdan-tu-luan.tex`. Mẫu lệnh nhờ soạn: `docs/soan-bai-mau.txt`.

- **Bài mẫu** = chủ đề `phan = 'bai-mau'`, `chuong = 'k<khối>-c<chương>'`, nội dung `\chude` + `\saubai{mã bài}` + một khối `giaimau`, không có `lythuyet`, không có `\man`. Thầy dán bằng nút **Bài mẫu → + Dán bài mẫu** trên biển tên chương (Claude có Supabase: chèn chủ đề `status = 'draft'`, slug dạng `lop9-c5-mau-…`).
- **Bắt buộc với mọi bài tự luận, bài giải mẫu, hướng dẫn: suy luận chậm và kỹ, tự kiểm tra trước khi trả** (giải trọn ra nháp và giải lại bằng cách thứ hai hoặc thử lại; chỉ dùng kiến thức SGK Kết nối tri thức đã học đến bài ở `\saubai`; mỗi bước suy ra được từ bước trước và "Vì sao?" nêu đúng định lý; đáp án sai của `\doan` phải thật sự không đi được; ô con của sơ đồ đủ để suy ra ô cha; tọa độ hình được **tính** cho đúng giả thiết; đọc lại như học sinh trung bình khá; ghi "Đã tự kiểm tra" và chỗ chưa chắc trong phần báo lại). Chi tiết: mục 3.9 *Quy trình suy luận và kiểm tra*.

## Kho Thi đấu theo chương (câu chỉ dùng cho Thi đấu)

Thi đấu rút câu Mức 1–4 của mọi bài **đã duyệt** của khối, cộng thêm **Kho Thi đấu theo chương**. Giáo viên đặt **mốc** "đã học hết Chương N" cho từng khối (Ngân hàng câu hỏi → tab Thi đấu): Thi đấu chỉ dùng câu của Chương 1..N, khoảng một nửa số câu mỗi trận thuộc Chương N. Chưa đặt mốc = mở mọi chương. Bài chưa gắn chương luôn được dùng.

- Kho là một chủ đề với `phan = 'thi-dau'`, `chuong = 'k<khối>-c<số chương>'` (ví dụ `k8-c3`), **không có** khối `lythuyet`, **không có** câu `extl`. Không hiện trên bản đồ.
- Mỗi lần nạp là **một đợt mới** (chủ đề mới, trạng thái nháp), tên `\chude{Kho Thi đấu · Chương 3. Tứ giác · đợt 2}`, `slug` dạng `lop8-c3-kho-thi-dau-...-dot-2`, `sort = chương*100 + đợt`. Không sửa đợt cũ đã duyệt để thêm câu (thêm câu vào đợt đã duyệt thì câu mới vào trận ngay, không qua bước duyệt).
- Nội dung: chủ yếu `\man{3}{Vận dụng}` và `\man{4}{Vận dụng cao}` (Mức 1–2 đã có sẵn trong các bài). Dùng đủ 4 dạng `ex`, `extf`, `exfb`, `exmatch`, có `\sai`/`\saithuong` và `\loigiai`. Câu phân loại theo mức độ hiểu bài, không dùng kiểu "tính mẹo". Mỗi câu làm được trong 1–3 phút. Kiến thức chỉ trong chương đó và các chương trước.
- **Gemini / không có quyền Supabase:** trả về một khối mã chỉ gồm các `\man{..}` và câu hỏi. Thầy mở app → Ngân hàng câu hỏi → tab **Thi đấu** → chọn khối → **+ Dán câu Thi đấu** → chọn chương → dán. App tự đặt tên đợt, tự thêm `\man{4}` nếu thiếu, báo lỗi cú pháp. Thầy bấm **Duyệt** cạnh đợt đó.
- **Claude (có Supabase):** chèn chủ đề như mục ghi Supabase của skill, với `phan = 'thi-dau'`, `chuong = 'k8-c3'`, `status = 'draft'`; đếm đợt đã có bằng `select count(*) from ltt_topics where phan = 'thi-dau' and chuong = 'k8-c3'`.
- **File:** `%%% phan: thi-dau` và `%%% chuong: k8-c3` rồi đẩy bằng `scripts/ngan-hang.mjs` như bài thường.

## Định dạng và kiểm tra

**Bài thường soạn lý thuyết tương tác theo mặc định, trong cùng một khối mã với bài tập (dán một lần bằng + Dán bài):** dùng [mẫu lệnh chung cho Gemini/Claude](soan-man-tuong-tac.txt), skill `nap-bai-leo-thap` (Claude) và [skill soạn bài của Gemini](gemini-skill-soan-bai.md). Mỗi bài 2–4 mục học, mỗi mục gồm `\loidan` → giải thích → minh họa (`\minhhoa` nếu có mẫu đúng, nếu không thì TikZ hoặc ví dụ) → `\vidu` → `\thungay`; các lệnh này đặt bên trong khối `lythuyet`. Mỗi `\loidan` mở một mục học mới. App tự chia lý thuyết thành từng màn ngắn (xem *Viết cho màn học từng màn* bên dưới). Giữ nguyên phần `\man` khi bổ sung tương tác cho bài đã có.

### Quy trình một lần (Claude và Gemini dùng chung skill `nap-bai-leo-thap`)

- **Bài mới:** thầy chỉ nói "soạn bài …". Trợ lý soạn **một khối mã duy nhất** gồm `\chude`, khối `lythuyet` tương tác, rồi `\man{1}`…`\man{4}`. Có Supabase thì ghi thẳng (nháp); không có thì trả khối mã (kèm các dòng `%%%`) để thầy dán một lần bằng **+ Dán bài**. Không soạn lý thuyết riêng rồi bài tập sau.
- **Bài đã có chỉ có tóm tắt hoặc hình tĩnh (lớp 6 hiện tại):** trợ lý chỉ thay khối `lythuyet` bằng bản tương tác, giữ nguyên từ `\man{1}` đến hết bài. Thầy dán vào **Học lý thuyết → Sửa lý thuyết** (hoặc trợ lý có Supabase thì ghi lại `source`).
- **Luyện tập chung, Bài tập cuối chương, đề ôn tập, Kho Thi đấu:** không có lý thuyết.
- **Chia mục học:** mỗi bài 2–4 mục (mỗi `\loidan` mở một mục), mỗi mục một ý chính, theo khuôn `\loidan` → giải thích (`\dinhnghia`/`\quytac`/`\congthuc`/`\dinhly`/`\tinhchat`, thêm `\luuy`) → minh họa → `\vidu` → `\thungay` (kiểm tra bằng một ví dụ mới).
- **Chọn minh họa theo thứ tự:** `\minhhoa` khi đúng mẫu đã hỗ trợ (hiện chỉ `gia-tri-theo-hang` và `ghep-so-la-ma`, về số tự nhiên; không dùng cho bài khác) → hình TikZ ngay trong nội dung mục → ví dụ cụ thể có số liệu. Cần thao tác mà chưa có mẫu thì **không tự chế lệnh**; ghi mẫu còn thiếu vào phần báo lại.
- TikZ trong lý thuyết dùng chung đường dịch hình với câu hỏi (Actions dịch mỗi 15 phút).
- **Viết cho màn học từng màn (từ 26/11/2026):** app tự chia khối `lythuyet` thành từng màn ngắn kiểu Duolingo (thanh tiến độ, nút Tiếp tục), mỗi màn khoảng 160 kí tự chữ, theo dấu xuống dòng `\\`. Cú pháp không đổi, nhưng viết sao cho mỗi màn tròn một ý:
  - **Mỗi dòng `\\` 1–2 câu**, tối đa khoảng 150 kí tự. Không viết một đoạn dài liền; ý mới thì xuống dòng.
  - **`\loidan` 1–2 câu (dưới khoảng 100 kí tự)** để hiện thành bong bóng Cherry ngay trên màn kiến thức. Lời dẫn dài hơn bị tách thành một màn riêng.
  - **`\luuy` mỗi ý một câu** (mỗi câu thành một dòng "!" trong màn *Cần nhớ*, 3 dòng một màn).
  - **Lời giải `\vidu` mỗi bước một dòng `\\`.** Học sinh bấm *Xem lời giải* mới đi tiếp.
  - **Tiêu đề mục** (`\dinhnghia{Tên}{…}`…) hiện ở dòng trên cùng của màn ("Tên bài · Tên mục"): đặt ngắn, rõ.
  - **Mỗi mục học có một `\thungay`**: đây là màn duy nhất học sinh phải trả lời; bài không có `\thungay` chỉ còn màn đọc.
  - Hình đặt ngay sau câu nó minh họa (cùng dòng `\\`), xem quy tắc hình ở mục hình vẽ.

**Bài mẫu lớp 6:** mở bài **Cách ghi số tự nhiên** bằng tài khoản giáo viên, chọn **Học lý thuyết → Sửa lý thuyết** rồi dán [khối LaTeX của bài mẫu](vi-du/k6-b2-ly-thuyet.tex). Thử chạm chữ số 4, ghép XXIV và chọn cả hai đáp án trong phần xem trước. Sau khi lưu, kiểm tra lại với vai trò học sinh. Lưu qua cửa sổ này để giữ nguyên phần câu hỏi của bài.

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
- **Tóm tắt lý thuyết** `\begin{lythuyet}…\end{lythuyet}`: một khối, đặt ngay sau `\chude`, trước `\man{1}`. Mục: `\dinhnghia`, `\quytac`, `\congthuc`, `\dinhly`, `\tinhchat` dạng `{tiêu đề}{nội dung}`; `\luuy{nội dung}`; `\vidu{đề}{lời giải}`. Gồm định nghĩa, quy tắc, công thức, định lý/tính chất của bài, 1 mục lưu ý lỗi hay gặp và 1–2 ví dụ ngắn; app tự chia thành từng màn ngắn nên mỗi dòng `\\` chỉ 1–2 câu (xem *Viết cho màn học từng màn*). Bám đúng nội dung, kí hiệu và cách gọi của SGK Kết nối tri thức nhưng **diễn đạt bằng lời của mình**, không chép nguyên văn SGK; không lấn sang bài sau. Xuống dòng bằng `\\`. Ngoài `$...$` chỉ viết chữ thường (không dùng `\quad`, `\dots`, `\ `…, vì app không dịch lệnh ngoài công thức); không dùng `%` (viết `\%`).
- `ex` trắc nghiệm: 4 phương án, đúng **một** phương án có `\True`.
- `extf` đúng/sai: 4 ý, `\True` ở các ý đúng; học sinh phải đúng cả 4 ý mới được tính đúng.
- `exfb` điền đáp số: học sinh gõ bằng bàn phím số `0–9`, `−`, dấu phẩy, `/` — đáp số chỉ là số nguyên, thập phân (dấu phẩy) hoặc phân số `a/b`, **không** dùng căn hay biểu thức chữ. Nhiều cách viết cùng giá trị cách nhau bằng `;` (app tự coi `0,5` và `1/2` là bằng nhau). Đáp số là phân số thì đề ghi rõ "(viết dạng phân số a/b)".
- `exmatch` nối ý: 3–4 cặp, mỗi vế ngắn để vừa màn hình điện thoại dọc.
- **Sắp xếp lời giải** `exsx` (học sinh chạm khối ở kho để điền từng dòng lời giải; kho có lẫn khối sai):
  ```latex
  \begin{exsx}
  Tìm $x$, biết $\dfrac{2}{3}x-\dfrac{1}{2}=\dfrac{5}{6}$. Sắp xếp các bước thành lời giải đúng.
  \buoc{$\dfrac{2}{3}x=\dfrac{5}{6}+\dfrac{1}{2}$}
  \buoc{$\dfrac{2}{3}x=\dfrac{4}{3}$}
  \buoc{$x=\dfrac{4}{3}:\dfrac{2}{3}$}
  \buoc{$x=2$}
  \nhieu{$\dfrac{2}{3}x=\dfrac{5}{6}-\dfrac{1}{2}$}{Chuyển vế phải đổi dấu: $-\dfrac12$ thành $+\dfrac12$.}
  \nhieu{$x=\dfrac{4}{3}\cdot\dfrac{2}{3}$}{Tìm thừa số chưa biết: lấy tích chia cho thừa số đã biết, không nhân.}
  \loigiai{Vậy $x=2$.}
  \end{exsx}
  ```
  - Viết `\buoc{…}` đúng thứ tự, 3–6 bước, mỗi bước ngắn (một đẳng thức hoặc một câu) để vừa màn hình điện thoại.
  - Các bước **liền nhau** đổi chỗ được cho nhau (ví dụ tính hai ngoặc) thì gắn cùng nhãn: `\buoc[1]{…}` `\buoc[1]{…}`. Bước không có nhãn có vị trí cố định.
  - `\nhieu{khối sai}{vì sao sai}`: 1–3 khối sai, mỗi khối là một **lỗi hay gặp có thật** (quên đổi dấu, nhầm phép tính, sai quy tắc), lời giải thích nói đúng chỗ hiểu sai. Khối sai không được trùng chữ với một bước đúng.
  - Dùng được tham số `%@` và `{{…}}` trong đề, `\buoc`, `\nhieu`.
- **Sơ đồ phân tích đi lên** `exsd` (cây chứng minh: kết luận ở trên, các ô "cần có" ở dưới, mũi tên đi lên; học sinh điền các ô mệnh đề và căn cứ bị ẩn):
  ```latex
  \begin{exsd}
  Cho $\triangle ABC$ có $AB=AC$, $M$ là trung điểm của $BC$. Chứng minh $AM\perp BC$.
  \nut{1}{$AM\perp BC$}{hai góc kề bù bằng nhau nên mỗi góc bằng $90^\circ$}
  \nut{2}[1]{$\widehat{AMB}=\widehat{AMC}$}{hai góc tương ứng}
  \nut{3}[2]{$\triangle AMB=\triangle AMC$}{c.c.c}
  \nut{4}[3]{$AB=AC$}{giả thiết}
  \nut{5}[3]{$MB=MC$}{$M$ là trung điểm $BC$}
  \nut{6}[3]{$AM$ là cạnh chung}{}
  \an{3}
  \anly{2,3}
  \nhieu{$\triangle AMB=\triangle CMA$}{Viết sai thứ tự đỉnh tương ứng: $B\leftrightarrow C$ nên phải viết $\triangle AMB=\triangle AMC$.}
  \nhieuly{c.g.c}{Muốn dùng c.g.c phải có góc xen giữa bằng nhau, ở đây mới có ba cặp cạnh.}
  \end{exsd}
  ```
  - `\nut{số}[ô cha]{mệnh đề}{căn cứ}`: ô cha là ô được suy ra từ ô này. Đúng **một** ô kết luận (không có `[ô cha]`). Căn cứ là lý do của chính ô đó (định lý, trường hợp bằng nhau, "giả thiết"…), viết ngắn; để trống `{}` khi hiển nhiên (cạnh chung).
  - 4–9 ô. Mỗi mệnh đề ngắn (khoảng một đẳng thức) để sơ đồ vừa điện thoại; sơ đồ quá rộng học sinh phải vuốt ngang.
  - `\an{2,3}` ẩn mệnh đề của các ô đó (không ẩn ô kết luận), `\anly{3}` ẩn căn cứ (chỉ ô có căn cứ). Thường ẩn 1–3 mệnh đề và 1–3 căn cứ; ẩn nhiều quá thì câu thành đoán mò.
  - `\nhieu{mệnh đề sai}{vì sao}` và `\nhieuly{căn cứ sai}{vì sao}`: 1–3 mỗi loại, là lỗi hay gặp (sai thứ tự đỉnh, dùng điều cần chứng minh làm căn cứ, nhầm trường hợp bằng nhau, nhầm góc tương ứng). Không trùng chữ với ô đúng.
  - Các ô lá cùng một ô cha đổi chỗ cho nhau được (app tự chấm). Hợp với chứng minh hình học, cũng dùng được cho chuỗi suy luận đại số. Hình học nên có hình TikZ trong đề.
- **Dùng ở đâu, chấm thế nào:** hai dạng này dùng được ở mọi mức của bản đồ, Kho Thi đấu và đề ôn tập Trắc nghiệm (không trộn vào đề tự luận `extl`, không đặt trong `lythuyet`). Hợp nhất ở Mức 2–3: mỗi bài hình học có chứng minh nên có 1–2 câu `exsd`, bài giải phương trình/tính toán nhiều bước nên có 1–2 câu `exsx`; không lạm dụng (một lượt bài chỉ 8 câu). Bản đồ: phải đúng hết mới tính đúng. Thi đấu: được điểm theo tỉ lệ dòng/ô đúng; câu sắp xếp +20 giây, câu sơ đồ +20 giây mỗi ô trống.
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
- **Hình vẽ:** viết thẳng `\begin{tikzpicture}...\end{tikzpicture}` ở bất kỳ chỗ nào (đề, phương án, vế nối ý, lời giải), không bọc trong `$...$` hay môi trường `center`/`figure`. Dùng được tikz, tkz-euclide, pgfplots và các thư viện `calc, angles, quotes, arrows.meta, patterns, intersections, through`; chữ tiếng Việt trong hình hiển thị đúng. Không dùng `\input`, hình ảnh ngoài, hoặc gói khác ngoài danh sách. Vẽ cho màn hình điện thoại: mỗi hình một khối riêng, nhãn điểm rõ ràng; có thể dùng cách vẽ quen thuộc của skill hinh-ve-tikz.
  - **Hình cho màn học từng màn (điện thoại dọc, từ 26/11/2026):** mỗi màn lý thuyết chỉ một ý, app ghép hình với đoạn chữ **ngay trước nó** (cùng dòng `\\`) vào một màn rồi sang màn mới, và tự phóng hình khoảng 1,5 lần cho chữ trong hình bằng chữ bài học (học sinh chạm hình để xem to hơn). Vì vậy:
    - Bề ngang hình **5–7 cm** (tối đa 8 cm). Hình rộng hơn bị thu lại cho vừa màn, chữ trong hình nhỏ đi. Hình cao hơn rộng thì tốt; nội dung dàn hàng ngang dài thì xếp thành hai hàng.
    - **Nhãn không được đè nhau.** Ước lượng mỗi chữ rộng khoảng 0,2 cm; hai nhãn đặt cạnh nhau cách nhau ít nhất 0,3 cm. Nhãn dài xuống dòng: `node[below, align=center] {$3\in A$\\(nằm trong $A$)}`.
    - Chữ trong hình **ngắn** (tên điểm, số, kí hiệu, 2–4 từ). Câu giải thích viết ở chữ ngoài hình, không nhét vào hình.
    - Mỗi hình minh họa **một ý**, đặt ngay sau câu nó minh họa. Hình nhiều phần, nhiều nhãn: tách thành hình từng bước (`hinhbuoc`).
    - Không dùng `scale` nhỏ hơn 0.8 để ép hình nhỏ lại (chữ không co theo nên dễ đè); thu tọa độ thay vì thu tỉ lệ.

3. **Số lượng và mức độ (mỗi bài học).** Mỗi bài học thường kèm khối `lythuyet` (bài Luyện tập chung và đề ôn tập không cần). Thầy nhờ "soạn lý thuyết cho …" thì chỉ thêm khối `lythuyet` vào bài đã có: đọc `source` mới nhất, chèn khối sau dòng `\chude`, giữ nguyên câu hỏi và trạng thái; bài chưa có trong Supabase thì tạo chủ đề mới chỉ có `\chude` + `lythuyet` (nháp, đúng mã bài). Mỗi mức là một kho để app rút ngẫu nhiên mỗi lần làm, nên cần nhiều hơn số câu rút ra: Mức 1 ít nhất 5 câu, Mức 2 ít nhất 5, Mức 3 ít nhất 3, Mức 4 (cho Thi đấu, không bắt buộc) 2–4 câu. **Câu Mức 1–3 là bài tập về nhà: bám sát SGK** — đúng kiến thức, dạng bài và độ khó của phần lí thuyết, ví dụ, luyện tập và bài tập cuối bài trong SGK Kết nối tri thức (có thể đổi số, đổi ngữ cảnh), không lấn sang bài sau, không đưa bài nâng cao/HSG vào bản đồ. Trộn nhiều dạng trong mỗi mức. Mức 1 Nhận biết, Mức 2 Thông hiểu, Mức 3 Vận dụng, Mức 4 Vận dụng cao. Một lượt bài khoảng 10 phút (8 câu), nên câu Mức 3 không quá dài. Tên `\chude{...}` là tên bài trong SGK (ví dụ `\chude{Quan hệ chia hết và tính chất}`). Thầy nhờ soạn cả chương thì tạo mỗi bài một chủ đề riêng.
- **Câu Mức 4 (Thi đấu) phải thật sự hóc búa**: cấp độ vượt SGK, hướng tới phân loại học sinh khá giỏi (kết hợp nhiều kiến thức, bài toán ngược, biện luận, tìm điều kiện, chứng minh dạng trắc nghiệm/đúng-sai), vẫn làm được trong 1–3 phút. Cần nhiều câu Mức 4 cho mỗi chương hơn trước vì Thi đấu dùng kho này nhiều.
- Câu mức 3–4 và câu khó trong đề ôn tập phân loại theo **mức độ hiểu bài** (hiểu bản chất, phát hiện lỗi sai, điều kiện xác định, biện luận…), **không** dùng kiểu "tính mẹo" (so sánh cùng số mũ, chữ số tận cùng, nhân–trừ vế để tính tổng lũy thừa, tổng sai phân…).
- Phương án nhiễu của trắc nghiệm nên là lỗi sai thường gặp của học sinh.

4. **Tự kiểm tra trước khi ghi** (bắt buộc; với câu có tham số thì thử vài bộ số cụ thể, kể cả trường hợp biên, và kiểm tra đáp án theo công thức):
- Tính lại đáp án từng câu; với đúng/sai kiểm tra từng ý.
- Khối `lythuyet` (nếu có): kiểm tra lại từng công thức, ví dụ và lời giải; mỗi mục đủ số cặp `{…}`; số dấu `$` chẵn.
- Mỗi `ex` có đúng một `\True`, mỗi phương án sai có `\sai{…}` đúng nội dung; mỗi `exfb` có `\shortans` gõ được bằng bàn phím số; mỗi `\begin{..}` có `\end{..}` cùng loại; ngoặc nhọn cân bằng.
- Mỗi `exsx` có ít nhất 2 `\buoc`, nhãn `[..]` chỉ gắn cho các bước liền nhau thật sự đổi chỗ được; mỗi `exsd` có đúng một ô kết luận, mọi `[ô cha]` có thật, `\an`/`\anly` chỉ nhắc ô có thật, không ẩn ô kết luận, `\anly` chỉ cho ô có căn cứ; khối sai không trùng chữ với khối đúng; đọc lại cả chuỗi suy luận (mỗi ô cha suy ra được từ đúng các ô con và căn cứ của nó).
- Mã LaTeX **không được chứa chuỗi `$ltt$`** (dùng làm dấu bọc khi ghi).

