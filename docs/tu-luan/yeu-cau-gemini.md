# Soạn bài Tự luận (chat cùng Cherry) — yêu cầu cho Gemini / Claude

Thầy chép **nguyên khối dưới đây** dán vào Gemini, thay dòng `[ĐIỀN …]`, rồi dán kết quả vào app: bản đồ → chặng **Tự luận** cuối chương → **+ Dán bài tự luận** → **Kiểm tra và xem trước** → lưu Nháp → bấm bài → **Duyệt**.

Cách nhanh hơn: trong app, bấm chặng Tự luận của chương → **Sao chép yêu cầu cho Gemini** (đã điền sẵn chương, mã bài và danh sách bài trong chương).

Bài mẫu hoàn chỉnh: [`mau-hinh-tiep-tuyen.tex`](mau-hinh-tiep-tuyen.tex) (hình học, lớp 9 chương 5), [`mau-dai-so-viete.tex`](mau-dai-so-viete.tex) (đại số, lớp 9 chương 6).

---

```text
Soạn MỘT bài tự luận cho chặng Tự luận của [ĐIỀN: Chương …, Toán …], SGK Kết nối tri thức, app Học cùng Cherry.
Học sinh giải cùng Cherry kiểu chat: mỗi bước Cherry nêu mục tiêu và hướng, học sinh viết vào vở (bí thì xin gợi ý), trả lời một câu kiểm tra nhỏ, rồi so vở với dòng trình bày mẫu. App không chấm vở.
Mã các bài trong chương: [ĐIỀN: ví dụ k9-b13 … k9-b17]

Đề bài thầy chọn (nếu trống thì tự chọn một bài tự luận 2–3 câu sát Luyện tập chung, câu cuối phân loại theo mức độ hiểu bài, không "tính mẹo"; chỉ dùng kiến thức đã học):
[DÁN ĐỀ BÀI Ở ĐÂY]

KẾT QUẢ: trả đúng MỘT khối mã, không giải thích xen giữa:
\chude{Tên bài ngắn}
\saubai{mã bài cuối cùng mà lời giải dùng tới, ví dụ k9-b16}
\begin{giaimau}
\de{đề bài, các câu cách nhau bằng \\}
(bài hình: MỘT hình \begin{tikzpicture}…\end{tikzpicture}; \hien{k}{…} hiện từ bước k, \phu{a}{b}{…} nét phụ chỉ ở bước a→b, \sang{k}{…} tô cam phần bước k dùng, bên trong \sang chỉ \draw/\fill không ghi màu)
\cau{Câu a}{yêu cầu của câu}
\doan{câu hỏi đoán hướng}{đúng}{sai}{vì sao đúng}{vì sao sai}[{sai 2}{vì sao sai 2}]   (1 câu ở bước then chốt của câu khó)
\buocgiai{mục tiêu ngắn}{dòng trình bày trong vở, mỗi dòng một \\}{vì sao: tên định lí/tính chất}
\huong{lời Cherry nêu hướng làm bước này, 1–2 câu, xưng tớ gọi cậu, KHÔNG nói đáp án}
\goiy{gợi ý 1}  \goiy{gợi ý 2}   (1–2 gợi ý, gợi ý sau rõ hơn gợi ý trước)
\kiemtra{câu hỏi kiểm tra kết quả bước}{đúng}{sai}{vì sao đúng}{vì sao sai}[{sai 2}{vì sao sai 2}]
   hoặc nhập số: \kiemtra{câu hỏi}{=đáp số}{vì sao đúng}[{đáp số sai hay gặp}{vì sao sai}]  (đáp số: số nguyên, thập phân hoặc phân số a/b)
… (lặp \buocgiai + \huong + \goiy + \kiemtra cho mọi bước; bước rất dễ có thể bỏ \kiemtra)
\nhanxet{chỗ hay mất điểm, chỗ phân loại}
\end{giaimau}
Quy ước: bước đếm từ 1 trong cả bài; ngoài $…$ chỉ viết chữ thường; công thức chính của dòng trình bày viết trong $…$ (dài thì xuống dòng bằng \\ trước dấu =); không dùng sơ đồ đi lên.

QUY TRÌNH SUY LUẬN VÀ KIỂM TRA (BẮT BUỘC, suy nghĩ chậm và kỹ):
1. Giải trọn bài ra nháp trước; giải lại bằng cách thứ hai hoặc thử lại (thay số, tính bằng Python nếu có). Hai cách phải khớp.
2. Sát chương trình: chỉ dùng kiến thức SGK Kết nối tri thức đã học đến bài ở \saubai; không dùng kiến thức lớp trên hay chương sau. Kí hiệu, cách gọi theo SGK.
3. Logic từng bước: mỗi bước suy ra được từ giả thiết và bước trước; không nhảy bước, không dùng điều cần chứng minh, không dựa vào "nhìn hình". Điều kiện nêu và đối chiếu đúng chỗ.
4. \huong chỉ chỉ hướng, không lộ dòng trình bày. \kiemtra hỏi KẾT QUẢ của chính bước đó (học sinh vừa viết xong); đáp án sai là lỗi học sinh hay mắc thật; lời giải thích nói đúng lỗi đó.
5. \doan: đáp án đúng thật sự dẫn tới lời giải; đáp án sai thật sự không đi được ở bước đó.
6. Hình: TÍNH tọa độ cho đúng mọi giả thiết (tiếp điểm, vuông góc, trung điểm, giao điểm), không ước lượng; mỗi \sang{k} tô đúng phần bước k dùng; số bước trong \hien, \phu, \sang khớp số \buocgiai. Hình rộng 5–7 cm, nhãn không đè nhau.
7. Đọc lại như một học sinh trung bình: mỗi bước một ý, câu ngắn; sửa chỗ khó hiểu, thiếu bước.
8. Sau khối mã: mục "Đã tự kiểm tra" (cách thứ hai/phép thử, phép tính kiểm tra hình, kiến thức dùng thuộc bài nào) và ghi rõ chỗ chưa chắc.
```

---

## Ghi chú cho người rà bài (Claude/thầy)

- `\huong`, `\goiy`, `\kiemtra` **phải đứng ngay sau** `\buocgiai` mà chúng thuộc về; app báo lỗi nếu đặt sai chỗ, `\kiemtra` thiếu lời giải thích, đáp số không phải số, hoặc quá 3 `\goiy`.
- Không có `\goiy` thì nút "Tớ bí rồi" dùng {vì sao} của `\buocgiai` làm gợi ý. Không có `\kiemtra` thì sau "Tớ viết xong" app hiện ngay dòng trình bày.
- Sơ đồ `\begin{sodo}` (nếu có) được app bỏ qua trong chặng Tự luận.
- Bài mẫu cũ (chỉ có `\buocgiai`, `\doan`) vẫn chạy được trong chặng Tự luận, chỉ thiếu lời dẫn và câu kiểm tra.
