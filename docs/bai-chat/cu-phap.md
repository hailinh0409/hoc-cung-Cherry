# Cú pháp bài chat với Cherry (khối `baichat`)

Thầy Linh duyệt kiểu học này ngày 27/11/2026, qua hai bản thử: hình học (Toán 7 Bài 9) và đại số (Toán 7, quy tắc chuyển vế). Tài liệu này dùng cho:

- **Codex** viết bộ đọc (`lib/latex.js`) và giao diện chat.
- **Gemini** soạn bài.
- **Claude** xem lại bài và chỉ đạo.

Bài chat dùng **lại gần hết** cú pháp bài giảng trong [`../bai-giang/cu-phap.md`](../bai-giang/cu-phap.md): `modau`, `\phan`, `\nhaclai`, `\hinhchung`, `\hinhrieng`, `\trangthai`, `\saukhitra`, `\cherry`, các lệnh màn, hình mẫu `cat-tuyen`. Tài liệu này chỉ ghi **phần khác và phần mới**. Có chỗ nào hai tài liệu nói khác nhau thì làm theo tài liệu này.

Bài mẫu đầy đủ: [`k7-chuyen-ve.tex`](k7-chuyen-ve.tex). Bản thử để bấm: [`ban-thu-dai-so.html`](ban-thu-dai-so.html), [`ban-thu-hinh-hoc.html`](ban-thu-hinh-hoc.html). Tải về rồi mở bằng trình duyệt. **Hai bản thử là chuẩn giao diện và hành vi.**

---

## 1. Khối `baichat` nằm cạnh khối `lythuyet` cũ

```
\chude{…}
\begin{lythuyet} … \end{lythuyet}     ← bản cũ, giữ nguyên cho tới khi bật kiểu chat cho cả khối
\begin{baichat}  … \end{baichat}      ← bản chat mới
\man{1} …                             ← câu hỏi, không đổi
```

- Một chủ đề có thể có cả hai khối. App chọn khối nào để hiện cho học sinh theo **công tắc từng khối lớp** (xem `ke-hoach.md` mục 2).
- Bên trong `baichat`, bố cục giống bài giảng: `modau` → các `\phan` → `ketbai`. Màn "Bài học hôm nay" do app tự thêm.
- **Mỗi lệnh màn là một lượt nhắn của Cherry** trong dòng chat. Lệnh gắn (`\cherry`, `\hinhrieng`, `\trangthai`, `\saukhitra`, `\theobuoc`) đặt ngay trước lệnh màn, riêng `\saukhitra` được đặt ngay sau.

## 2. Giọng nói: Cherry xưng "tớ", gọi học sinh bằng tên

- Cherry xưng **tớ**, gọi học sinh là **cậu** hoặc **tên riêng**. Ví dụ: "Chạm vào số hạng $+3$ xem nó đi đâu nhé, \ten!"
- `\ten` trong bất kỳ chữ nào của bài được thay bằng **tên riêng** của học sinh (chữ cuối của họ tên trong tài khoản: "Nguyễn Minh An" → "An"). Trang xem thử dùng tên đặt trong ô "Tên học sinh" (mặc định "An").
- Dùng `\ten` khoảng **3–6 lần một bài**: lời chào ở mở đầu, chỗ chuyển phần, lời khen sau câu khó, kết bài. Không dùng ở mọi câu.
- Bong bóng của học sinh (app tự sinh) cũng nói giọng bạn bè: "Tớ hiểu rồi", "Tiếp đi Cherry", "Hơi rối, nhắc lại giúp tớ".
- **Khung kiến thức** (định nghĩa, quy tắc, tính chất, ví dụ, trang tóm tắt) viết **giọng sách**, không xưng hô.

## 3. Công thức đứng riêng một dòng, căn giữa

- Phương trình, đẳng thức, phép tính có dấu `=`, `<`, `>`, `\Rightarrow` viết bằng `\[ … \]`. App hiện chúng trên dòng riêng, căn giữa.
- `$…$` trong câu chỉ dùng cho **một kí hiệu hoặc một số**: $x$, $+3$, $\dfrac{2}{3}$, $\widehat{A_1}$.
- Ngoại lệ: phương án trả lời trong nút bấm (`\dung`, `\sai`) được viết `$…$` có dấu bằng, vì cả nút là một công thức; app căn giữa chữ trong nút.
- Số thập phân trong `$…$` viết `5{,}1` để không có khoảng trắng sau dấu phẩy.
- **Cảnh báo tự động** (vàng, không chặn): `$…$` có `=`, `<`, `>` hoặc `\Rightarrow` nằm trong câu chữ (ngoài nút phương án).

## 4. Lệnh mới

### 4.1. Câu hỏi nhiều phương án, chọn lại khi sai: môi trường `thu`

```
\begin{thu}[Nhãn]{Câu hỏi, có thể có \[công thức\]}
\dung{phương án đúng}{giải thích khi chọn đúng}
\sai{phương án sai 1}{vì sao sai, chỉ đúng lỗi của phương án này}
\sai{phương án sai 2}{…}
\end{thu}
\saukhitra{trạng thái hình sau khi chọn đúng}      ← tuỳ chọn
```

- 2–4 phương án, đúng một `\dung`. App **xáo thứ tự** phương án.
- Chọn sai: hiện câu học sinh vừa chọn, lời giải thích của phương án đó, khóa phương án đó (tô đỏ), học sinh **chọn lại**. Chọn đúng: hiện lời khen ngẫu nhiên kèm giải thích đúng, áp `\saukhitra`.
- `[Nhãn]` tuỳ chọn, hiện thành nhãn nhỏ phía trên câu hỏi. Mặc định "Thử ngay". Hai nhãn hay dùng:
  - `[Nhắc nhanh]`: kiểm tra kiến thức cũ cần cho phần mới, đặt **đầu phần**.
  - `[Tự nhớ lại]`: học sinh nhớ lại ý chính không nhìn bài, đặt **cuối phần**.
  Câu có hai nhãn này **không cần hình**.
- Phương án sai phải đến từ **lỗi hay gặp** (quên đổi dấu, đổi dấu cả số không được chuyển, nhầm số đối với số nghịch đảo…), không bịa cho đủ số.
- `\thungay` cũ vẫn dùng được. Trong bài chat nó chạy như `thu` có 2 phương án.

### 4.2. Tính từng bước: môi trường `tinh`

```
\begin{tinh}{Câu nhỏ 1}
\dung{…}{…} \sai{…}{…} \sai{…}{…}
\end{tinh}
\saukhitra{…}
\begin{tinh}{Câu nhỏ 2}
…
\end{tinh}
\saukhitra{…}
\ketluan{Câu Cherry nói khi đúng hết}
```

- Các `tinh` **liền nhau** gộp thành một lượt nhắn có nhãn "Cậu tính". Câu sau chỉ hiện khi câu trước đúng. Chọn sai: hiện giải thích, 1,8 giây sau được chọn lại.
- `\saukhitra` sau mỗi `tinh` **cộng thêm** vào hình (thường để hiện thêm một dòng của hình `dang-thuc`).
- `\emtinh` cũ vẫn dùng được.

### 4.3. Nút thao tác trên hình: `\thaotac`

```
\thaotac[lech]{Nhãn nút 1}{trạng thái sau khi bấm}{lời Cherry sau khi bấm}
\thaotac{Nhãn nút 2}{trạng thái}{lời Cherry}
```

- Các `\thaotac` **liền nhau** gộp thành một lượt nhắn. Mỗi lần hiện **một** nút. Bấm xong: hình cộng thêm trạng thái, hiện lời Cherry, rồi hiện nút kế tiếp. Bấm hết mới đi tiếp.
- `[lech]` tô lời Cherry màu cam (một tình huống sai, ví dụ cân bị lệch). Không có thì tô xanh.
- Dùng cho khám phá: bớt quả cân, thêm một bước dựng hình, đổi vị trí…

### 4.4. Hình đổi theo bước lời giải: `\theobuoc`

```
\theobuoc{trạng thái khi hiện bước 1}{… bước 2}{… bước 3}
\vidu{đề}{bước 1 \\ bước 2 \\ bước 3}
```

Đặt ngay trước `\vidu`. Mỗi lần học sinh bấm "Bước tiếp", hình **cộng thêm** trạng thái của bước đó. Bước không đổi hình thì để `{}`.

### 4.5. `\saukhitra` dùng cho mọi màn có tương tác

Áp vào hình khi học sinh làm **đúng**: `thu`, `\thungay`, `\chamhinh`, `\chamvung`, mỗi câu `tinh`.

## 5. Hình mẫu mới

Hình mẫu do app tự vẽ bằng SVG (không qua TikZ), nên tô màu, chạm, đổi trạng thái được. Tham số và trạng thái dùng **chữ thường, không có `$…$`**; phân số viết `2/3`, số âm viết `-1/2`, số thập phân viết `5,1`. Trạng thái (`\trangthai`, `\saukhitra`, `\thaotac`, `\theobuoc`) dùng **cùng tên** với tham số và ghi đè tham số.

### 5.1. `can`: cân đĩa

```
\hinhmau{can}{trai=t:x + q*3; phai=q*7; nghieng=khong; ghichu=Cân thăng bằng}
```

| Tham số | Ý nghĩa |
|---|---|
| `trai`, `phai` | Vật trên đĩa trái, đĩa phải, cách nhau bằng ` + `. `q` quả cân nhỏ ghi số 1; `q*3` ba quả như thế. `k:5,1 kg` khối chữ nhật có nhãn. `t:x` túi có nhãn. `b:?` quả tròn có nhãn. |
| `nghieng` | `khong` (mặc định), `trai`, `phai`: đĩa nào thấp hơn. |
| `ghichu` | Dòng chữ trên cân; xanh khi thăng bằng, cam khi nghiêng. |

Vẽ theo hàm `figScale` trong `ban-thu-dai-so.html`.

### 5.2. `dang-thuc`: các dòng đẳng thức nối bằng mũi tên

```
\hinhmau{dang-thuc}{dong1=x + 3 = 7; dong2=x = 7 - 3; mui1=chuyển +3, đổi dấu}
```

| Tham số | Ý nghĩa |
|---|---|
| `dong1` … `dong4` | Một đẳng thức. Số hạng cách nhau bằng dấu cách; dấu `+`, `-` dính vào số hạng sau. App hiện `-` thành `−`, `2/3` thành phân số, chữ cái một kí tự in nghiêng. |
| `mui1` … `mui3` | Chữ cạnh mũi tên từ dòng k xuống dòng k+1. |

Trạng thái:

- `dong=k`: chỉ hiện k dòng đầu (mặc định hiện hết).
- `to=1t2:cam,2p2:cam`: tô số hạng. Khóa = **số dòng + `t` (vế trái) hoặc `p` (vế phải) + thứ tự số hạng trong vế**. `1t2` là số hạng thứ hai ở vế trái của dòng 1. Màu như `cat-tuyen`: `cam`, `lam`, `luc`, `tim`, `do`.

Chạm: `\chamhinh{yêu cầu}{1t2}{lời khen}{gợi ý}` với khóa số hạng; `\nhac{1p1}{…}` cho chỗ chạm sai hay gặp.

Vẽ theo hàm `figEq` trong `ban-thu-dai-so.html`: mỗi dòng là một thẻ bo góc, dấu `=` thẳng cột ở giữa, dòng quá dài thì thu nhỏ cho vừa.

## 6. Mở đầu, kết bài, cuối phần

- `modau`: `\cherry` (nên có `\ten`), `\cauhoi`, một hình. App tự thêm dòng "Học xong bài này, cậu sẽ tự trả lời được." dưới câu hỏi lớn.
- `ketbai`: `\cherry`, `\hinhrieng`, một `thu` (hoặc `\thungay`) trả lời câu hỏi mở đầu, `\emdahoc{…}{…}…`.
- **Cuối mỗi phần** app tự hỏi "Xong phần k rồi, \ten! Cậu thấy phần này thế nào?" với hai nút **Tớ hiểu rồi** và **Hơi rối, nhắc lại**. Nhắc lại thì hiện `\nhaclai` của phần, rồi đi tiếp. Người soạn không viết đoạn này.
- **Trang tóm tắt** do app tự ghép: câu hỏi mở đầu kèm câu trả lời đúng ở kết bài; mỗi phần gồm các khung kiến thức (kèm hình đúng trạng thái của màn đó) và các ví dụ với lời giải đầy đủ. Người soạn không viết trang này, nên **khung kiến thức phải tự đứng được khi đọc riêng**.

## 7. Quy tắc viết (Gemini làm theo, Claude dùng để duyệt)

1. Bám SGK Kết nối tri thức: đúng phạm vi, thuật ngữ, bài toán mở đầu, số liệu ví dụ; diễn đạt lại, không chép nguyên văn.
2. Bố cục: Mở đầu (bài toán SGK, có hình) → 2–4 phần → Kết bài trả lời câu hỏi mở đầu. Khoảng 25 giây một lượt nhắn; cả bài 6–12 phút.
3. Mỗi phần: **Nhắc nhanh** (nếu cần kiến thức cũ) → khám phá (học sinh làm trước: bấm, chạm, tính) → chốt kiến thức (≤ 3 dòng) → ví dụ (mỗi bước một dòng) → **Thử ngay trên tình huống mới** (ít nhất 2 câu, đổi vị trí/dạng: ví dụ $x$ ở vế phải, số âm, phân số) → **Tự nhớ lại**.
4. `\cherry`: một câu, ≤ 120 kí tự, là câu hỏi hoặc việc cần làm. Giọng tớ–cậu (mục 2).
5. Không có lượt nhắn chỉ có chữ, trừ `[Nhắc nhanh]`, `[Tự nhớ lại]`, "Bài học hôm nay", "Em đã học".
6. Mọi phương án sai có giải thích riêng, chỉ đúng lỗi đó, rồi gợi hướng sửa. Không nói "Sai rồi" suông.
7. Công thức đứng riêng dòng (mục 3).
8. Câu khó phân loại theo **mức độ hiểu bài**, không "tính mẹo".
9. Trước khi gửi thầy: dán bài vào **trang xem thử** (Artifact của Claude), sửa hết lỗi đỏ và cảnh báo vàng, tự bấm hết bài.
