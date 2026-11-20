# Hướng dẫn soạn câu hỏi và lý thuyết (dùng chung cho Claude và Gemini)

Bản này chép từ quy trình soạn bài của Claude (skill `nap-bai-leo-thap`), để trợ lý nào cũng soạn đúng định dạng app. Nếu skill đổi, cập nhật file này theo.

## Ghi bài vào app khi KHÔNG có quyền vào Supabase (ví dụ Gemini)

**Cách nhanh nhất (không cần máy tính):** trợ lý trả về toàn bộ LaTeX của một bài trong một khối mã. Thầy mở app bằng tài khoản giáo viên → Toán → khối → bấm vào bài còn xám có nhãn **+ Dán bài** trên bản đồ → dán → *Kiểm tra và tạo bài nháp*. App tự gắn đúng mã bài, tự thêm `\chude` nếu thiếu, bỏ qua dấu ``` và các dòng `%%%`, báo lỗi cú pháp nếu có. Hình TikZ tự hiện sau khoảng 15 phút. Bài đã có trên bản đồ thì sửa ở *Cài đặt & sửa câu hỏi* → *LaTeX của chủ đề*.

**Đề ôn tập (không cần máy tính):** trợ lý trả về mỗi đề một khối mã. Thầy mở app bằng tài khoản giáo viên → Toán → khối → **Ôn tập** → **+ Tạo đề ôn tập mới** → nhập tên, chọn loại **Trắc nghiệm (TN)** hoặc **Tự luận (TL)** → *Tạo đề (nháp)* → **Sửa toàn bộ LaTeX** → xóa hết, dán khối mã của đề → *Lưu*. Xem lại rồi bấm ⚙ trên ô đề → *Duyệt cho học sinh*. Chi tiết cách soạn ở mục *Soạn đề ôn tập* cuối file.

**Cách dùng file (sửa hàng loạt, đề ôn tập):**

1. Mỗi bài là một file `.tex` trong `hoc-cung-cherry/ngan-hang/lop<khối>/<slug>.tex`. Đầu file có các dòng thông tin:
   ```
   %%% slug: lop6-b23-mo-rong-phan-so
   %%% grade: 6
   %%% phan: dai-so            (dai-so | hinh-hoc | thong-ke | on-tap)
   %%% chuong: k6-b23          (mã bài; đề ôn tập để trống)
   %%% sort: 230
   %%% nguon: Gemini
   ```
   Sửa bài đã có: thầy chạy `keo` trước để lấy bản mới nhất, rồi sửa đúng file đó (giữ nguyên các dòng `%%%`).
2. Thầy kiểm tra cú pháp bằng đúng bộ đọc của app: `node scripts/ngan-hang.mjs kiemtra ngan-hang` (trong thư mục `hoc-cung-cherry`).
3. Thầy chạy thử rồi đẩy lên: `node --env-file=.env.local scripts/ngan-hang.mjs day --thu`, sau đó bỏ `--thu`. Bài mới luôn ở trạng thái nháp; thầy duyệt trong app.
4. Có hình TikZ mới: **không cần làm gì**. GitHub Actions (`.github/workflows/tu-dich-hinh.yml`) cứ 15 phút tự dịch các hình chưa có SVG. Cần hình ngay: vào GitHub → Actions → *Tự dịch hình TikZ* → *Run workflow*, hoặc tự chạy trên máy `node --env-file=.env.local scripts/dung-hinh.mjs <slug>`. Hình báo lỗi thì sửa mã TikZ, lần chạy sau tự dịch lại.

Mã bài: Bài thường `k<khối>-b<số bài SGK>`; Luyện tập chung `k<khối>-c<chương>-lt<thứ tự>` (khối 6–9); Bài tập cuối chương `k<khối>-c<chương>-cc` (khối 10–12, SGK THPT không có Luyện tập chung). Số bài khối 10–12 đánh liên tục cả năm như SGK (ví dụ `k11-b18` = Luỹ thừa với số mũ thực). Danh sách đủ ở hằng `CURR` trong `hoc-cung-cherry/client/app.js`.

Mỗi bài cần: Mức 1 ít nhất 5 câu, Mức 2 ít nhất 5, Mức 3 ít nhất 3, Mức 4 (Thi đấu) 2–4 câu; câu Mức 1–3 bám sát SGK Kết nối tri thức; câu Mức 4 hóc búa, phân loại theo mức độ hiểu bài, không dùng kiểu "tính mẹo".

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
- **Đề ôn tập** (`phan = 'on-tap'`): soạn theo mục *Soạn đề ôn tập* ở cuối file (Phần 1 Trắc nghiệm, Phần 2 Tự luận).
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

## Soạn đề ôn tập: Phần 1 Trắc nghiệm (TN) và Phần 2 Tự luận (TL)

Mục **Ôn tập** của app có hai phần, xếp dạng lưới:
- **Phần 1 · Trắc nghiệm** (ô tím, đánh số TN1, TN2…): học sinh làm trên app, làm xong biết điểm ngay. Không có gợi ý.
- **Phần 2 · Tự luận** (ô cam, đánh số TL1, TL2…): app chỉ hiện đề bài và gợi ý; học sinh làm vào vở bài tập. Mỗi gợi ý mở lần đầu trừ 10 XP. Học sinh **không** thấy lời giải; giáo viên thấy.

App tự xếp đề vào phần nào theo dạng câu: đề có câu `extl` là đề tự luận. **Một đề chỉ thuộc một loại**: đề TN chỉ gồm `ex`, `extf`, `exfb`, `exmatch`; đề TL chỉ gồm `extl`. Trộn hai loại trong một đề thì app báo lỗi và không cho lưu.

### Khi thầy nhờ "soạn đề ôn …"
- Đề thi thật của học sinh khoảng **20% trắc nghiệm, 80% tự luận**. Thầy nhờ một đề ôn (ví dụ "đề ôn giữa kì I lớp 8 số 1") thì trả về **hai khối mã riêng**, cùng phạm vi kiến thức, cùng số thứ tự:
  1. `\chude{Đề ôn giữa kì I số 1 – Trắc nghiệm}` → thầy tạo đề loại TN.
  2. `\chude{Đề ôn giữa kì I số 1 – Tự luận}` → thầy tạo đề loại TL.
  Thầy chỉ nhờ một phần ("chỉ phần tự luận", "bài tập về nhà tự luận tuần 12") thì chỉ trả về phần đó.
- Hỏi lại thầy nếu chưa rõ: khối, phạm vi (những bài/chương nào), loại đề (giữa kì, cuối kì, thi vào 10, bài tập tuần).
- Mỗi đề dùng **một** `\man{1}{Đề}`. Không cần khối `lythuyet`.
- Nội dung bám chương trình Kết nối tri thức, diễn đạt bằng lời của mình. Câu khó phân loại theo **mức độ hiểu bài**, không dùng kiểu "tính mẹo".

### Phần 1 · Đề trắc nghiệm (TN)
- 12–20 câu trộn đủ dạng: khoảng một nửa `ex`, còn lại `extf`, `exfb`, `exmatch`. Trộn Đại số, Hình học (và Thống kê nếu có), xếp từ dễ đến khó như một đề kiểm tra.
- **Cần nhiều câu hóc búa hơn bài tập trên bản đồ**: khoảng 1/3 câu cơ bản, còn lại là câu vận dụng và vận dụng cao kết hợp nhiều bài, nhiều bước suy luận, dễ sai nếu hiểu chưa chắc.
- Không viết `\goiy` (đề TN không có gợi ý). Nên có `\loigiai` ngắn. Câu `ex` phải có `\sai{…}` ở mọi phương án sai, như bài trên bản đồ.
- Mẫu:
  ```latex
  \chude{Đề ôn giữa kì I số 1 – Trắc nghiệm}

  \man{1}{Đề}
  \begin{ex}
  Kết quả của phép tính $(x-2)(x+2)$ là
  \choice{$x^2+4$ \sai{Nhầm dấu: $(a-b)(a+b)=a^2-b^2$.}}{\True $x^2-4$}{$x^2-4x+4$ \sai{Đây là $(x-2)^2$.}}{$x^2+4x-4$ \sai{Nhân sai từng hạng tử.}}
  \loigiai{$(x-2)(x+2)=x^2-2^2=x^2-4$.}
  \end{ex}
  ... (các câu extf, exfb, exmatch)
  ```

### Phần 2 · Đề tự luận (TL)
- Mô phỏng **phần tự luận của đề thi thật**: 4–6 bài, mỗi bài một khối `extl`, có thể gồm nhiều ý a), b), c). Ghi điểm từng bài để học sinh quen barem, ví dụ `\textbf{Bài 1} (2,0 điểm).` Tổng điểm khoảng 8 điểm (phần tự luận của đề 10 điểm), hoặc 10 điểm nếu thầy nhờ đề tự luận hoàn toàn.
- Thứ tự gợi ý: bài tính toán / rút gọn → phương trình, bài toán thực tế → hình học (chứng minh, tính toán; có hình vẽ) → một bài cuối phân loại học sinh khá giỏi.
- **Gợi ý** `\goiy{…}`: mỗi bài 1–3 gợi ý, theo thứ tự từ chung đến cụ thể (gợi ý 1 chỉ hướng/kiến thức cần dùng, gợi ý 2 là bước đầu tiên hoặc hình phụ, gợi ý 3 là bước then chốt). Bài nhiều ý thì ghi rõ ý, ví dụ `\goiy{Ý b): xét hai tam giác $ABD$ và $ACE$.}` **Không lộ đáp số** trong gợi ý. Vì mỗi gợi ý tốn XP, gợi ý phải đáng giá, không viết gợi ý chung chung kiểu "Đọc kĩ đề".
- **Lời giải** `\loigiai{…}` (chỉ giáo viên thấy): trình bày đầy đủ như đáp án chấm thi, ghi điểm từng bước, ví dụ `… $\Rightarrow x=2$. (0,25 điểm)`. Thầy dùng để chấm vở học sinh.
- Xuống dòng bằng `\\` (đặt ngoài `$...$`). Chữ đậm: `\textbf{…}`. Không dùng `\item`, `enumerate`, bảng.
- Hệ phương trình, nhiều dòng công thức: dùng `$\begin{cases} x+y=5 \\ x-y=1 \end{cases}$` hoặc `aligned` bên trong `$...$` như LaTeX thường.
- Hình vẽ: đặt khối `tikzpicture` ngay trong đề bài. Bài hình học có hình trong đề thì vẽ đúng giả thiết, không vẽ thêm đường phụ của lời giải.
- Mẫu:
  ```latex
  \chude{Đề ôn giữa kì I số 1 – Tự luận}

  \man{1}{Đề}
  \begin{extl}
  \textbf{Bài 1} (2,0 điểm). Phân tích các đa thức sau thành nhân tử:\\
  a) $x^2-9$;\\
  b) $x^3-2x^2+x$.
  \goiy{Ý a): dùng hằng đẳng thức hiệu hai bình phương.}
  \goiy{Ý b): đặt nhân tử chung $x$ trước, phần còn lại là một hằng đẳng thức.}
  \loigiai{a) $x^2-9=(x-3)(x+3)$. (1,0 điểm)\\
  b) $x^3-2x^2+x=x(x^2-2x+1)$ (0,5 điểm) $=x(x-1)^2$. (0,5 điểm)}
  \end{extl}

  \begin{extl}
  \textbf{Bài 2} (1,5 điểm). Giải hệ phương trình $\begin{cases} x+y=5 \\ x-y=1 \end{cases}$
  \goiy{Cộng vế với vế hai phương trình để khử $y$.}
  \loigiai{Cộng vế: $2x=6\Rightarrow x=3$ (0,75 điểm). Thay vào: $y=2$ (0,5 điểm). Kết luận nghiệm $(3;2)$ (0,25 điểm).}
  \end{extl}
  ... (bài hình học có tikzpicture, bài phân loại)
  ```

### Tự kiểm tra đề trước khi gửi thầy
- Giải lại từng câu, từng bài; đáp án và lời giải khớp nhau; tổng điểm đúng như ghi.
- Đề TN không có câu `extl`; đề TL chỉ có `extl`.
- Mỗi `\begin{..}` có `\end{..}` cùng loại; ngoặc nhọn cân bằng; số dấu `$` chẵn; không có `\\` nằm sai chỗ làm vỡ công thức.
- Gợi ý không chứa đáp số.

