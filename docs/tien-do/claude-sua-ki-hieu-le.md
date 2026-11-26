# Tiến độ: Sửa lỗi kí hiệu đứng một mình ($\in$, $\notin$) hiện "vuốt ngang để xem hết"

- Nhánh: `claude/sua-ki-hieu-le` · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026 14:10
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Đã sửa xong. Hàm `mathFit` trong `hoc-cung-cherry/client/app.js`, phần (c) thu nhỏ công thức.

## Mục tiêu
Thầy chụp màn Toán 6 Bài 1 sau khi gộp PR #46: trong câu "thuộc ($\in$) và không thuộc ($\notin$)", mỗi kí hiệu bị đẩy xuống dòng riêng kèm dòng "↔ vuốt ngang để xem hết".

## Nguyên nhân
MathJax vẽ kí hiệu quan hệ đứng một mình kèm khoảng trống hai bên tràn ra ngoài khung nhỏ của nó (đo được scrollWidth 17 > clientWidth 11). `mathFit` (PR #46) so công thức với khung của CHÍNH nó nên tưởng là tràn, thu nhỏ và gắn dòng gợi ý (display:block) → xuống dòng.

## Đã xong (đã commit)
- [x] `mathFit` so bề rộng công thức với bề rộng khối chữ chứa nó (khối cha không phải inline, trừ lề trong). Chỉ thu nhỏ/gợi ý khi công thức thật sự rộng hơn dòng.

## Quyết định đã chốt với thầy
- Giữ các quyết định của PR #46 (xem `claude-ly-thuyet-theo-y.md`).

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy mở lại Bài 1 Tập hợp trên điện thoại: (∈), (∉) nằm trong câu, không còn "vuốt ngang".
- Việc còn treo từ PR #46: thêm bước $=100+85$ vào lưu ý Bài 4; dịch hình ngay khi dán bài; cập nhật skill `nap-bai-leo-thap`.

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/client/app.js`

## Cách kiểm tra
- `npm test` 40/40; build app đạt.
- Chrome 390×844 với lời dẫn và ví dụ Bài 1 thật: kí hiệu $\in$, $\notin$ không bị đánh dấu thu nhỏ; tổng 7 phân số vẫn thu nhỏ vừa khung; chuỗi 135+248+… vẫn dàn bước.

## Lưu ý cho người tiếp quản
Không ghi gì lên Supabase. Khi đo công thức có tràn hay không, luôn so với bề rộng dòng chứa nó, không dùng clientWidth của mjx-container.
