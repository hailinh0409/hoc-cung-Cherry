# Cú pháp bài giảng (khối `lythuyet` kiểu mới)

Thầy Linh duyệt ngày 26/11/2026. Tài liệu này dùng cho hai việc:

- **Bộ đọc** (`lib/latex.js`, hàm `parseTheory`): biết phải đọc những lệnh nào và trả về dữ liệu ra sao.
- **Người soạn bài** (Gemini, Claude): biết viết một bài giảng như thế nào.

Bài mẫu đầy đủ: [`k7-b9-bai-giang.tex`](k7-b9-bai-giang.tex). Bản thử để xem và bấm: [`ban-thu-bai9.html`](ban-thu-bai9.html). Tải file về rồi mở bằng trình duyệt, hoặc xem bản trên artifact mà thầy đã duyệt.

---

## 1. Bố cục một bài

```
\begin{lythuyet}
  \begin{modau} … \end{modau}        ← Mở đầu: bài toán có hình + câu hỏi lớn (bắt buộc với bài mới)
  \phan{Tên phần}{Mục tiêu}           ← Phần 1
    \nhaclai{…}  \hinhchung{…}        ← (tuỳ chọn) tóm tắt cho nút Nhắc lại, hình dùng chung của phần
    … các màn …
  \phan{…}{…}                         ← Phần 2, 3, … (nên 3–4 phần, mỗi phần 4–9 màn)
    … các màn …
  \begin{ketbai} … \end{ketbai}       ← Kết bài: trả lời câu hỏi mở đầu + "Em đã học"
\end{lythuyet}
```

Giữa màn **Mở đầu** và **Phần 1**, app tự thêm màn **"Bài học hôm nay"**. Màn này liệt kê các `\phan` cùng mục tiêu của từng phần và ước lượng thời gian (khoảng 25 giây một màn, làm tròn tới phút). Người soạn không viết màn này.

**Mục lục** gồm: Mở đầu, các Phần, Kết bài.

## 2. Một màn = một lệnh màn

Mỗi màn được tạo bởi **đúng một lệnh màn**. Các **lệnh gắn** đặt ngay trước lệnh màn và áp dụng cho màn đó.

### Lệnh màn

| Lệnh | Màn hiện ra | Học sinh phải làm gì để đi tiếp |
|---|---|---|
| `\dinhnghia{tiêu đề}{nội dung}` (cũng như `\quytac`, `\congthuc`, `\dinhly`, `\tinhchat`) | Màn đọc có nhãn màu (đã có) | Không phải làm gì |
| `\nhanxet{tiêu đề}{nội dung}` | Màn đọc, nhãn "Nhận xét" (mới) | Không phải làm gì |
| `\luuy{nội dung}` | Màn "Cần nhớ" (đã có) | Không phải làm gì |
| `\vidu{đề}{lời giải}` | Đề bài. Lời giải **hiện từng dòng `\\`** khi bấm "Xem lời giải" / "Bước tiếp" (đổi so với hiện nay) | Xem hết các bước |
| `\thungay{câu}{đúng}{sai}{giải đúng}{giải sai}` | Câu hỏi 2 phương án (đã có) | Bấm Kiểm tra (đúng hay sai đều đi tiếp được) |
| `\chamhinh{yêu cầu}{khóa đáp án}{lời khen}{gợi ý chung}` theo sau là các `\nhac{khóa}{lời nhắc}` | Chạm vào một góc trên **hình mẫu** (mục 4) | Chạm đúng |
| `\chamvung{yêu cầu}{khóa vùng}{lời khen}` | Chạm vào một vùng trên hình mẫu | Chạm đúng vùng |
| `\truot{nhãn nút}{lời sau khi trượt}` | Nút trượt bốn góc ở điểm thứ nhất xuống điểm thứ hai (hình mẫu `cat-tuyen`) | Bấm trượt |
| `\emtinh{câu}{đúng}{sai}{giải đúng}{giải sai}{trạng thái khi đúng}`. Nhiều `\emtinh` **liền nhau** gộp thành **một màn**; có thể thêm `\ketluan{…}` ngay sau | Học sinh tính từng câu nhỏ, đúng xong câu trước mới hiện câu sau. Chọn sai thì thấy giải thích, 2 giây sau được chọn lại | Đúng hết các câu |
| `\xemtungbuoc` | Xem hình chung của phần (một `hinhbuoc`) từng bước, có lời của từng bước | Đến bước cuối |
| `\begin{hinhbuoc}…\end{hinhbuoc}` đứng riêng | Hình từng bước (đã có) | Đến bước cuối |
| `\minhhoa{mẫu}{giá trị}`, `\begin{giaimau}…\end{giaimau}` | Như hiện nay | Như hiện nay |

### Lệnh gắn (áp dụng cho lệnh màn ngay sau)

| Lệnh | Ý nghĩa |
|---|---|
| `\cherry{lời}` | Bong bóng Cherry trên màn đó. **Một câu, ≤ 120 kí tự**, là một **câu hỏi hoặc một việc cần làm trên hình đang thấy**. `\loidan{…}` cũ được hiểu như `\cherry`. |
| `\hinhrieng{hình}` | Màn này dùng hình riêng (TikZ, `hinhbuoc` hoặc `\hinhmau`), ẩn hình chung. |
| `\trangthai{…}` | Trạng thái của hình (chung hoặc riêng) trên màn này: tô màu, số đo, vùng, bước (mục 4.3). |
| `\saukhitra{…}` | Trạng thái **thêm** vào hình sau khi học sinh bấm Kiểm tra (`\thungay`). Nếu hình là `hinhbuoc` và không có `\saukhitra`, sau Kiểm tra hình **tự chuyển sang bước cuối**. |
| `\chuyen{nhãn 1}{trạng thái 1}{nhãn 2}{trạng thái 2}` | Hai nút chuyển trạng thái hình ngay trên màn đọc (ví dụ "Cặp so le trong" / "Cặp đồng vị"). Học sinh phải xem cả hai mới đi tiếp. |

### Lệnh của phần

| Lệnh | Ý nghĩa |
|---|---|
| `\phan{tên}{mục tiêu}` | Bắt đầu một phần. Mục tiêu viết theo khung *Kiến thức, kĩ năng* của SGK; app hiện thành "Em sẽ: …". |
| `\nhaclai{…}` | Nội dung của nút **Nhắc lại** trong phần, tối đa 3 dòng `\\`. Không có lệnh này thì app tự ghép nội dung các mục `\dinhnghia`, `\quytac`, `\congthuc`, `\dinhly`, `\tinhchat` của phần. |
| `\hinhchung{hình}` | Hình dùng chung cho mọi màn của phần, ghim ở trên, trừ màn có `\hinhrieng` hoặc màn có hình riêng sẵn (`hinhbuoc` đứng riêng, `\minhhoa`, `giaimau`). |

### Mở đầu và kết bài

```
\begin{modau}
\cherry{…}                      % lời dẫn
\cauhoi{Câu hỏi lớn của bài}    % hiện thành tiêu đề lớn; kết bài sẽ trả lời câu này
\nutbuoc{Đặt ê ke}              % (tuỳ chọn) nhãn nút bước tiếp của hinhbuoc (mặc định "Bước sau")
<một hình: tikzpicture | hinhbuoc | \hinhmau{…}{…}>
\end{modau}

\begin{ketbai}
\cherry{…}
\hinhrieng{…}                   % thường là hình mở đầu, có tô màu câu trả lời
\thungay{câu hỏi mở đầu}{đúng}{sai}{giải đúng}{giải sai}
\emdahoc{dòng 1}{dòng 2}{dòng 3}{dòng 4}   % 2–5 dòng "Em đã học"; màn cuối có nút "Vào làm bài"
\end{ketbai}
```

## 3. Bài cũ (chưa có `\phan`) vẫn chạy

- Không có `\phan`: mỗi `\loidan` mở một phần, tên phần là tiêu đề đầu tiên trong nhóm, không có mục tiêu. Không có `\loidan`: cả bài là một phần.
- Không có `modau`, `ketbai`: bỏ qua hai màn đó; vẫn có "Bài học hôm nay" nếu có từ 2 phần trở lên.
- Không có `\hinhchung`: app lấy **hình TikZ tĩnh đầu tiên** trong nội dung các mục đọc của phần làm hình chung. Đây là việc của issue #48.
- `\loidan` nằm giữa phần được hiểu như `\cherry` cho màn kế tiếp. Lời dài hơn 120 kí tự vẫn tách thành màn Cherry riêng như hiện nay.

## 4. Hình mẫu `\hinhmau{tên}{tham số}`

Hình mẫu **do app tự vẽ bằng SVG** (không qua TikZ), nên tô màu, chạm và trượt được, và **không cần dịch hình**. Trước mắt chỉ có một mẫu: `cat-tuyen`.

### 4.1. Mẫu `cat-tuyen`: một đường thẳng cắt hai đường thẳng

Tham số (cách nhau bằng `;`, đều không bắt buộc):

| Tham số | Mặc định | Ý nghĩa |
|---|---|---|
| `duong=a,b,c` | `a,b,c` | Tên hai đường thẳng bị cắt và đường cắt. Viết `x-y` để ghi tên ở hai đầu (trái-phải; với đường cắt thì trên-dưới), ví dụ `duong=x-y,x'-y',z-z'`. |
| `diem=A,B` | `A,B` | Tên giao điểm trên đường thứ nhất và đường thứ hai. |
| `song-song=1` | `0` | Hai đường thẳng bị cắt song song (`1`) hoặc hơi lệch như SGK Hình 3.16 (`0`). |
| `c=phai` | `trai` | Đầu trên của đường cắt nghiêng về bên trái (Hình 3.16) hoặc bên phải (Hình 3.17, 3.21). |

**Đánh số góc cố định theo SGK Hình 3.16** tại mỗi giao điểm: **trên-trái 2, trên-phải 3, dưới-trái 1, dưới-phải 4**. Khóa góc = tên điểm + số, ví dụ `A1`, `B3`, `P1`, `Q3`.

- So le trong: `X1`–`Y3` và `X4`–`Y2`.
- Đồng vị: `Xk`–`Yk`.

Vùng: `giua` (giữa hai đường bị cắt), `tren` (trên đường thứ nhất), `duoi` (dưới đường thứ hai).

### 4.2. Hình vẽ cụ thể

Toạ độ, độ dày nét và cỡ chữ lấy theo bản thử `ban-thu-bai9.html` (hàm `figCut`, `figSign`, `figMN`, `figVD`):

- `song-song=0`: hai đường bị cắt từ (−2,8; 2,3)–(3,3; 2,75) và (−2,8; 0,3)–(3,3; −0,12).
- `song-song=1`: hai đường bị cắt là y = 2 và y = 0.
- Đường cắt nối (−0,85; 3,75) với (1,75; −1,5) khi `c=trai`; lấy đối xứng qua trục dọc khi `c=phai`.
- Số góc đặt cách giao điểm 0,38 đơn vị, ở giữa góc. Số đo đặt cách 0,86 đơn vị. Tên điểm đặt cách 1,0 đơn vị, theo hướng 98°.
- Vùng chạm của mỗi góc là hình quạt bán kính 1,0 đơn vị, đủ lớn cho ngón tay.

### 4.3. Trạng thái (`\trangthai`, `\saukhitra`, đối số cuối của `\emtinh`, các trạng thái của `\chuyen`)

Các mục cách nhau bằng `;`:

- `to=A1:cam,B3:cam` tô góc. Màu: `cam`, `lam`, `luc`, `tim`, `do`.
- `do=A1:60°,B3:60°` ghi số đo trên hình.
- `so=an` / `so=hien` ẩn hoặc hiện số 1–4 của các góc (mặc định `hien`).
- `vung=giua` tô vàng vùng giữa.
- `buoc=k` với hình `hinhbuoc`: hiện bước thứ k.

Trạng thái của một màn **bắt đầu lại từ trạng thái gốc**, không mang theo từ màn trước. `\saukhitra` và đối số cuối của `\emtinh` thì **cộng thêm** vào trạng thái đang có.

## 5. Quy tắc viết cho người soạn (Gemini, Claude)

1. **Bám SGK Kết nối tri thức:** đúng phạm vi, đúng thuật ngữ, đúng tên hình. Diễn đạt lại, không chép nguyên văn. Dùng **một cách đánh số góc cho cả bài** (mục 4.1); bài tập SGK đánh số khác thì viết lại theo cách đánh số này.
2. **Mở đầu** dùng bài toán mở đầu của SGK, có hình. Câu hỏi lớn phải được trả lời ở **kết bài**.
3. **Mỗi phần theo nhịp:** khám phá (học sinh làm trước: chạm, trượt, tính, xem từng bước) → chốt kiến thức (tối đa 3 dòng) → ví dụ (lời giải mỗi bước một dòng) → **Thử ngay trên hình mới**, không dùng lại hình vừa học.
4. **Cherry:** một câu, ≤ 120 kí tự, là một câu hỏi hoặc một việc cần làm trên hình. Không dùng Cherry trên mọi màn, chỉ ở chỗ chuyển ý và chỗ cần học sinh làm gì đó.
5. **Không có màn chỉ có chữ.** Màn nào cũng có hình (chung hoặc riêng), trừ màn "Bài học hôm nay" và "Em đã học".
6. **Câu sai phải có giải thích riêng** (`\thungay` đối số 5, `\nhac` cho từng góc sai hay gặp).
7. **Ngoài `$…$` chỉ viết chữ thường**, được dùng `\textbf{…}` và `\\`. Không dùng `%` trong nội dung (viết `\%`).
8. Dạng câu phân loại theo **mức độ hiểu bài**, không dùng kiểu "tính mẹo".
