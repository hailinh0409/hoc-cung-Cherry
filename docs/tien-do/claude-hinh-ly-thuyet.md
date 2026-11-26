# Tiến độ: Hình vẽ cho cách học lý thuyết từng màn

- Nhánh: `claude/hinh-ly-thuyet` · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt (riêng hình Bài 1 lớp 6 cần thầy dán bản sửa, xem dưới)

## Bắt đầu từ đâu
Sau PR #38 (lý thuyết từng màn), thầy gửi ảnh màn Bài 1: hình nhỏ (chỉ chiếm 1/3 bề ngang trên điện thoại), nhãn "3 ∈ A (nằm trong A)" và "4 ∉ A (nằm ngoài A)" đè nhau, phần dưới màn trống. Mã chính: `lsFitFigs` và đoạn "Chạm hình tĩnh" trong `hoc-cung-cherry/client/lesson.js`; CSS `.ls-zoom`, `.ls-zhint` cuối `client/lesson.css`.

## Mục tiêu
Thầy: "Với cách học lý thuyết mới, hình vẽ cần có sự thay đổi để tối ưu hiển thị."

## Quyết định đã chốt với thầy
- (Claude chọn, thầy có thể đổi) Hình trong bài học từng màn được phóng 1,5 lần cỡ gốc (không quá bề ngang màn); chạm hình tĩnh để xem to gấp đôi cỡ gốc, kéo/phóng bằng ngón tay.

## Đã xong (đã commit)
- [x] `lsFitFigs`: phóng hình 1,5 lần (hằng `LS_FIG_SCALE`), không quá bề ngang khung; áp cho hình trong chữ, lời giải ví dụ, đề Thử ngay, hình từng bước. Hình tĩnh có dòng "Chạm hình để phóng to".
- [x] Chạm hình tĩnh → lớp xem hình to (gấp đôi cỡ gốc, cuộn/phóng được), nút × hoặc chạm ra ngoài để đóng. Hình từng bước vẫn chạm để sang bước.
- [x] Quy tắc vẽ hình cho điện thoại dọc (5–7 cm, nhãn ngắn không đè, nhãn dài xuống dòng bằng `align=center` + `\\`, câu giải thích để ngoài hình, đặt hình ngay sau câu nó minh họa, không `scale` < 0.8): `docs/gemini-skill-soan-bai.md` mục 3.7, `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`, câu nhờ Gemini trong nút "Sao chép chương cho Gemini" (`GEM_ASK`, `client/app.js`).

## Đang làm dở
- Hình Bài 1 lớp 6 (`lop6-b1-tap-hop`): Claude định sửa thẳng trên Supabase nhưng bị hệ thống quyền chặn, **chưa sửa**. Bản sửa (thay 4 dòng trong hình của `\dinhnghia{Tập hợp và phần tử}`):
  ```
  \node[draw=red, thick, fill=red!12, circle, inner sep=2pt] (p4) at (5.2,0.1) {$4$};
  \draw[->, teal, thick] (2.15,-0.65) -- (2.15,-1.15) node[below, align=center] {$3\in A$\\(nằm trong $A$)};
  \draw[->, red, thick] (5.2,-0.35) -- (5.2,-1.15) node[below, align=center] {$4\notin A$\\(nằm ngoài $A$)};
  ```
  Thầy dán qua *Học lý thuyết → Sửa* (hoặc cho phép Claude ghi Supabase). Hình mới tự dịch sau khoảng 15 phút.

## Việc tiếp theo
- Rà các hình cũ trong lý thuyết (rộng quá 8 cm, nhãn đè): dùng nút "Sao chép chương cho Gemini" từng chương (câu nhờ đã có yêu cầu sửa hình cũ).
- Có thể thêm cảnh báo tự động "hình rộng quá 8 cm" trong "Kiểm tra hình của chương" (đọc kích thước SVG).

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/lesson.js`, `hoc-cung-cherry/client/lesson.css`, `hoc-cung-cherry/client/app.js` (`GEM_ASK`)
- `docs/gemini-skill-soan-bai.md`, `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`

## Cách kiểm tra
- `node scripts/build-app.mjs`, `npm test` 33/33, `FAKE_DB=1 … npx next build`: đạt.
- Chạy thử 390×844 với dữ liệu giả (tạm đưa lý thuyết Bài 1 và một hình SVG 220pt vào `tests/seed.json`, đã trả lại): hình rộng 350px (trước khoảng 230px), chữ trong hình gần bằng chữ bài; chạm hình mở lớp xem to, nút × đóng; không lỗi JavaScript.

## Lưu ý cho người tiếp quản
- Skill `nap-bai-leo-thap` của Claude (bản trên tài khoản thầy) cần thêm cùng quy tắc hình; Claude đã đề xuất bản sửa skill trong chat, thầy lưu ở thẻ đề xuất.
- Không ghi gì lên Supabase trong việc này.
