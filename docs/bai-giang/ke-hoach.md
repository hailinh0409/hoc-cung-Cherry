# Kế hoạch: lý thuyết thành "bài giảng" (mục lục, phần, hình chung, chạm thử)

- Thầy Linh duyệt: 26/11/2026, qua bản thử Toán 7 Bài 9.
- Người lập kế hoạch: Claude. Người viết mã: **Codex**. Người soạn nội dung các bài khác: Gemini và Claude.
- Tài liệu đi kèm (trong thư mục này):
  - [`cu-phap.md`](cu-phap.md): cú pháp soạn mới, đặc tả hình mẫu `cat-tuyen`.
  - [`k7-b9-bai-giang.tex`](k7-b9-bai-giang.tex): Bài 9 viết bằng cú pháp mới, dùng làm dữ liệu kiểm tra và bài mẫu. 18 khung TikZ trong file đã dịch thử thành công bằng `xelatex` theo đúng `PREAMBLE` của `lib/figcode.js`.
  - [`ban-thu-bai9.html`](ban-thu-bai9.html): bản thử thầy đã bấm và duyệt. **Đây là chuẩn giao diện và hành vi**; khi không rõ, làm giống bản thử.

## 1. Vì sao làm

Các vấn đề thầy chỉ ra trên app hiện tại:

1. Màn mở đầu chỉ có Cherry và bong bóng thoại, không có hình, không hấp dẫn. SGK hay hơn vì có bài toán mở đầu.
2. Một hình dùng cho nhiều màn nhưng chỉ hiện ở một màn (Toán 7 Bài 9; issue #48).
3. Màn lý thuyết đã chia nhỏ nhưng **không có mục lục**, học sinh không biết bài có những gì.

Thầy đánh giá cao ba điểm của bản thử: **chạm vào góc** trên hình, **Thử ngay** (học sinh chủ động), **hình từng bước**. Thầy muốn mỗi bài giống **một tiết giảng**: lời Cherry thật sự dẫn dắt, học sinh không bị ngợp chữ và biết bài có gì cần học.

## 2. Quyết định đã chốt với thầy

- Nhịp của một bài: **Mở đầu** (bài toán SGK có hình và câu hỏi lớn) → **Bài học hôm nay** (mục lục, mục tiêu, thời gian) → các **Phần** → **Kết bài** (học sinh tự trả lời câu hỏi mở đầu, rồi xem "Em đã học", rồi nút "Vào làm bài").
- Mỗi phần theo nhịp **khám phá → chốt → ví dụ → Thử ngay trên hình mới**.
- **Mục lục** mở được ở mọi màn.
  - **Lần đầu học:** phần sau chỉ mở khi đã học xong phần trước.
  - **Ôn lại** (bài đã học xong): mở bài là thấy mục lục, mọi phần đều mở.
  - Mở lại một phần đang dở thì về **đúng màn đang học**.
- **Hình chung** của một phần được ghim ở trên, tô đúng chỗ đang nói tới, có nút thu gọn và nút phóng to. Màn có hình riêng thì ẩn hình chung. Trên màn rộng (≥ 760 px), hình nằm bên trái, chữ bên phải.
- **Nút Nhắc lại** mở tóm tắt của phần ngay tại chỗ, không rời màn đang học.
- **Lời Cherry:** một câu, ≤ 120 kí tự, là câu hỏi hoặc việc cần làm. Không có màn chỉ có chữ.
- **Đánh số góc theo SGK Hình 3.16 cho cả bài.** Bài tập SGK đánh số khác thì viết lại theo cách đánh số này. Thực hành vẽ dùng góc 60° của ê ke như SGK.
- Codex viết mã; Claude chỉ lập kế hoạch và xem lại (tiết kiệm token).
- Chỉ thầy gộp PR. Mỗi việc một nhánh, một PR, kèm `docs/tien-do/<nhánh>.md` (theo `AGENTS.md`).

## 3. Kiến trúc

### 3.1. Dữ liệu sau khi đọc (`lib/latex.js`)

`parseTopic(...)` hiện trả về `theory: items[]`, một danh sách phẳng. **Giữ nguyên `theory`** để các chỗ khác (tóm tắt, xem trước) không hỏng, và **thêm** `lesson`:

```js
lesson = {
  modau: { cherry, cauhoi, nutbuoc, fig } | null,
  parts: [ {
    title, goal, recap,            // recap: chuỗi LaTeX của \nhaclai (hoặc tự ghép)
    fig,                           // hình chung: { kind:'tikz'|'hinhbuoc'|'mau', src, mau?:{name, params} } | null
    screens: [ {
      type: 'read'|'vidu'|'quiz'|'tap'|'region'|'slide'|'calc'|'steps'|'lab'|'giaimau',
      kind?, title?, body?, sol?,  // như item cũ
      cherry?,                     // lời Cherry gắn với màn
      fig?,                        // hình riêng (\hinhrieng); null = dùng hình chung
      state?, after?,              // \trangthai, \saukhitra đã đọc thành object (xem 3.2)
      quiz?: { q, correct, wrong, explainCorrect, explainWrong },
      tap?: { prompt, ans, ok, hint, nhac:{B3:'…'} },
      region?: { prompt, key, ok }, slide?: { label, after },
      calc?: { items:[{q, correct, wrong, explainCorrect, explainWrong, state}], ketluan },
      toggle?: [{label, state},{label, state}]
    } ]
  } ],
  ketbai: { cherry, fig, quiz, emdahoc:[…] } | null,
  legacy: true|false               // true khi bài không có \phan (chạy theo mục 3 của cu-phap.md)
}
```

Trạng thái đọc thành object: `{to:{A1:'cam'}, do:{A1:'60°'}, so:'an'|'hien', vung:'giua', buoc:5}`.

**Lỗi soạn** (đưa vào `errors`, chặn lưu):
- thiếu đối số;
- `\chamhinh`, `\chamvung` hoặc `\truot` mà phần không có hình mẫu;
- khóa góc sai dạng;
- `\phan` không có màn nào;
- `ketbai` không có `\thungay`;
- `modau` không có hình.

**Cảnh báo** (mảng mới `warnings`, hiện màu vàng trong cửa sổ Dán bài và Sửa lý thuyết, **không chặn** lưu):
- `\cherry` dài hơn 120 kí tự;
- phần có hơn 10 màn;
- màn đọc không có hình;
- bài mới có `\phan` nhưng thiếu `modau` hoặc `ketbai`.

### 3.2. Hình (`lib/figcode.js` và giao diện)

- `figBlocks` **đã** tìm mọi `tikzpicture` và `hinhbuoc` ở bất kỳ đâu trong mã nguồn, kể cả trong `\hinhchung{…}`, `\hinhrieng{…}`, `modau`, `ketbai`. GitHub Actions dịch hình như cũ. Cần thêm một kiểm tra tự động khẳng định điều này với file `k7-b9-bai-giang.tex`: phải ra **18 khối**.
- Hình mẫu `\hinhmau{cat-tuyen}{…}` **không** đi qua TikZ, mà do giao diện vẽ bằng SVG. Mã vẽ đặt trong file mới `client/hinhmau.js`, lấy từ các hàm `figCut`, `figSign`, `figMN`, `figVD` trong bản thử và gộp thành **một** hàm `catTuyen(params, state, {tap})`. Thêm file này vào `scripts/build-app.mjs`.
- Màu: `cam #f28c28`, `lam #3b7be0`, `luc #2fa36b`, `tim #8b5cf6`, `do #e0475a`, độ đục vùng tô 0,33.

### 3.3. Giao diện (`client/lesson.js`, `client/lesson.css`)

Viết lại `renderLessonMaterial(root, t, o)` theo bản thử. Giữ nguyên tham số `o` (`start`, `title`, `onClose`, `finish`, `teacherEdit`) để `client/app.js` không phải đổi nhiều.

Khung màn, từ trên xuống:
1. Thanh trên: nút ×, thanh tiến độ (số màn đã xem trên tổng số màn), nút **Mục lục**.
2. Dòng phần: "Phần k/n · Tên phần", hoặc "Tên bài · Mở đầu / Kết bài".
3. Vùng hình: hình chung hoặc hình riêng; dòng nhỏ "Hình dùng chung cho phần k" / "Hình"; nút "Thu gọn ▴" / "▸ Hiện hình"; nút ⤢ phóng to (mở lớp phủ toàn màn). Trên điện thoại, hình cao tối đa 30% chiều cao; trên màn rộng thì thành cột trái, cao tối đa 62%.
4. Vùng chữ (cuộn được): bong bóng Cherry → nhãn loại → tiêu đề → nội dung → phần tương tác.
5. Chân: nút **Nhắc lại** (ẩn ở Mở đầu và Kết bài) + nút chính **Tiếp tục / Kiểm tra / Xong phần k / Bắt đầu phần 1 / Vào làm bài**.

Hành vi chi tiết của từng loại màn: làm như bản thử (hàm `render` trong `ban-thu-bai9.html`). Những điểm dễ làm sai:
- `\thungay`: chưa chọn thì nút Kiểm tra mờ. Sau Kiểm tra, tô xanh phương án đúng, tô đỏ phương án sai đã chọn, hiện giải thích; đúng hay sai đều đi tiếp được. Hình áp `\saukhitra`; nếu hình là `hinhbuoc` và không có `\saukhitra` thì chuyển sang bước cuối.
- `tap`: chạm sai thì tô đỏ góc vừa chạm và hiện lời `\nhac` (không có thì hiện gợi ý chung). Chạm đúng thì tô xanh cả hai góc và Cherry khen. Khi đang chờ chạm thì **không** có nút phóng to.
- `calc`: chọn sai thì hiện giải thích, 1,8 giây sau được chọn lại. Chọn đúng thì áp trạng thái của câu lên hình và hiện câu tiếp theo. Đúng hết thì hiện `\ketluan` trong bong bóng Cherry.
- `slide`: trượt nhóm bốn góc (tô bốn màu) từ điểm thứ nhất đến điểm thứ hai trong 1,4 giây (CSS `transform`), xong mới hiện chữ. Người dùng bật "giảm chuyển động" thì nhảy thẳng tới vị trí cuối.
- `vidu`: lời giải tách theo `\\`; nút "Xem lời giải (0/n)" → "Bước tiếp (k/n)". Xem hết mới đi tiếp.
- Hết một phần: hiện thông báo nhỏ "Xong phần k ✓" rồi sang màn đầu của phần sau.
- Mục lục: lớp phủ trượt từ dưới lên. Mỗi dòng ghi số phần, tên, trạng thái ("Đã xong · chạm để học lại", "Đang học · màn x/y" kèm thanh nhỏ, "Học xong phần trước để mở", hoặc mục tiêu của phần).

**Lưu tiến độ:** dùng `localStorage`, khóa `ltt-bg:<id chủ đề>`, giá trị `{pos:[…], done:[…], seen:[…]}`. Mọi lần đọc và ghi đều bọc `try/catch`. Học xong cả bài (kể cả Kết bài) thì lần sau mở bài vào chế độ **Ôn lại**. Đồng bộ lên máy chủ: **chưa làm** ở đợt này.

**Màn "Bài học hôm nay":** các thẻ phần **bấm được** để mở phần đó (theo luật khóa ở mục 2).

**Giáo viên:** nút **Sửa** (chức năng `teacherEdit` có sẵn) vẫn nằm ở thanh trên. Giáo viên không bị khóa phần.

## 4. Các việc, theo thứ tự

Mỗi việc là một issue trên GitHub, một nhánh, một PR. Các mũi tên chỉ thứ tự phụ thuộc.

| # | Việc | Phụ thuộc | Ước lượng |
|---|---|---|---|
| A (#49) | Bộ đọc cú pháp mới + dữ liệu `lesson` + kiểm tra tự động | – | 1 PR |
| B (#50) | Khung bài giảng mới trong giao diện (mục lục, phần, hình chung, Nhắc lại, mở đầu, kết bài, lưu tiến độ, màn rộng, bài cũ vẫn chạy). Thay cho issue #48 | A | 1–2 PR |
| C (#51) | Hình mẫu `cat-tuyen` + màn chạm góc, chạm vùng, trượt, em tính, chuyển trạng thái | A (làm song song với B được), ghép vào B | 1 PR |
| D (#52) | Công cụ giáo viên: xem trước cú pháp mới trong Dán bài và Sửa lý thuyết, cảnh báo màu vàng, mẫu khởi đầu mới, tóm tắt bài theo phần | B | 1 PR |
| E (#53) | Nạp Bài 9 thật lên app và kiểm tra trên điện thoại (**chờ thầy duyệt** mới ghi Supabase) | B, C | 1 PR + một lần ghi dữ liệu |
| F (#54) | Hướng dẫn soạn cho Gemini/Claude theo cú pháp mới | A | 1 PR (Claude có thể làm) |

### A. Bộ đọc

- Sửa `lib/latex.js`: mở rộng `parseTheory` (hoặc viết thêm `parseLesson` dùng chung các hàm `group`, `parseHinhBuoc`), thêm `warnings` vào kết quả `parseTopic`.
- Kiểm tra tự động mới `tests/bai-giang.test.mjs`, đọc `docs/bai-giang/k7-b9-bai-giang.tex`. Phải khẳng định:
  - Có modau với `cauhoi`; 4 phần tên đúng, mục tiêu đúng; kết bài có `thungay` và 4 dòng `emdahoc`.
  - Số màn từng phần: P1 = 8, P2 = 4, P3 = 6, P4 = 2 (cộng mở đầu, "Bài học hôm nay" và 2 màn kết bài là 24 màn, đúng như bản thử).
  - Màn `calc` đầu tiên của P2 có 2 câu và `ketluan`.
  - `\nhac` đọc đúng `{B3, B1, B4}` cho màn chạm thứ nhất.
  - Trạng thái `to=A1:cam,B3:cam; do=A1:60°` đọc thành object đúng.
  - `figBlocks` của file trả về 18 khối.
  - Không có lỗi và không có cảnh báo.
- Thêm vài kiểm tra cho bài cũ: một bài có `\loidan` và không có `\phan` cho ra `lesson.legacy === true` với số phần bằng số `\loidan`.
- Kiểm tra lỗi soạn: `\chamhinh` không có hình mẫu → lỗi; `\cherry` dài 200 kí tự → cảnh báo.

### B. Khung bài giảng

- `client/lesson.js`: `renderLessonMaterial` theo mục 3.3. Bài cũ đi qua `lesson.legacy`, tự lấy hình TikZ đầu tiên của phần làm hình chung (issue #48). Bài dựng sẵn `setLesson` (Toán 6 Bài 1) giữ nguyên.
- `client/lesson.css`: giao diện theo bản thử (kem `#fffaf2`, xanh `#149c8c`, nút chính cao 56 px, vùng chạm ≥ 44 px, chữ thân 16 px).
- Kiểm tra bằng tay (ghi kết quả vào PR) ở 390×844 và 1000×800, tài khoản học sinh và giáo viên. Dùng `FAKE_DB=1`, đưa nội dung `k7-b9-bai-giang.tex` vào dữ liệu giả hoặc dán qua cửa sổ Sửa lý thuyết.
  1. Lần đầu học: đi hết 24 màn.
  2. Mục lục: phần chưa học bị khóa; mở lại phần đang dở thì về đúng màn.
  3. Thu gọn hình, mở lại; phóng to hình.
  4. Nút Nhắc lại có nội dung đúng phần.
  5. Đóng bài, mở lại: tiến độ còn; học xong thì vào chế độ Ôn lại.
  6. Một bài cũ (Toán 6 Bài 4, Toán 7 Bài 9 bản cũ) vẫn học được, có mục lục.
- Chụp màn hình từng loại màn, đặt vào thư mục `docs/bai-giang/anh-kiem-tra/` hoặc dán vào PR.

### C. Hình mẫu và màn tương tác

- `client/hinhmau.js`: hàm `catTuyen` (mục 4 của cu-phap.md), dùng toạ độ của bản thử. Khóa góc theo đánh số Hình 3.16.
- Các loại màn `tap`, `region`, `slide`, `calc`, `toggle`: hành vi theo mục 3.3.
- Kiểm tra: so ảnh chụp màn hình với bản thử ở các màn P1-2, P1-4, P1-5, P1-7, P2-1, P3-2. Hình phải gần giống; số góc phải đúng vị trí theo SGK.

### D. Công cụ giáo viên

- Xem trước trong Dán bài và Sửa lý thuyết dùng `renderLessonMaterial` mới. Hiện `warnings` màu vàng, `errors` màu đỏ như cũ.
- Mẫu khởi đầu `TH_TPL` trong `client/app.js` đổi sang khung có `modau`, `\phan`, `ketbai`.
- Tóm tắt cả bài (`renderLessonSummary`) nhóm theo phần.

### E. Nạp Bài 9

- Chủ đề trên Supabase: `lop7-b9-goc-o-vi-tri-dac-biet-tia-phan-giac-cua-mot-goc`. **Chỉ thay khối `lythuyet`**, giữ nguyên các `\man`. Lưu bản cũ vào `ban_truoc` (cơ chế có sẵn của `scripts/ngan-hang.mjs`).
- **Hỏi thầy trước khi ghi.** Ghi xong thì chạy dịch hình (Actions "Tự dịch hình TikZ", chọn slug) và kiểm tra trên điện thoại.

### F. Hướng dẫn soạn

- Cập nhật `docs/soan-bai.md`, `docs/gemini-skill-soan-bai.md`, `docs/soan-man-tuong-tac.txt` theo mục 5 của `cu-phap.md`. Chép `k7-b9-bai-giang.tex` làm bài mẫu tham khảo.
- Skill `nap-bai-leo-thap` trong tài khoản Claude của thầy cập nhật qua Claude (không nằm trong repo).

## 5. Không làm trong đợt này

- Đồng bộ tiến độ lý thuyết lên máy chủ.
- Hình mẫu khác ngoài `cat-tuyen`: tam giác, trục số, đồ thị… thêm dần khi soạn tới bài cần.
- Soạn lại các bài khác theo cú pháp mới: Gemini làm sau, từng bài, theo `cu-phap.md`.
- Góc trong cùng phía (SGK Luyện tập 1b): thầy chưa yêu cầu.

## 6. Rủi ro và cách tránh

- **Bài cũ bị vỡ:** giữ `theory` cũ; bài không có `\phan` đi theo nhánh `legacy`; kiểm tra tay bài cũ (mục B).
- **Hình chung và `hinhbuoc` lệch bước:** mỗi màn tự đặt lại trạng thái (mục 4.3 của cu-phap.md), không mang theo trạng thái từ màn trước.
- **Màn hình nhỏ:** hình tối đa 30% chiều cao, có nút thu gọn; thử ở 360×640.
- **`localStorage` bị chặn** (chế độ riêng tư): bọc `try/catch`; không lưu được thì vẫn học được, chỉ mất tiến độ.
