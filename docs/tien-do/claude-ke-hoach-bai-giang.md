# Tiến độ: Kế hoạch "bài giảng" (mục lục, phần, hình chung, chạm thử) — bàn giao cho Codex

- Nhánh: `claude/ke-hoach-bai-giang` · PR: (PR mở từ nhánh này)
- Người đang làm: Claude (lập kế hoạch) → Codex (viết mã) · Cập nhật lần cuối: 26/11/2026 16:10
- Trạng thái: xong phần kế hoạch, chờ thầy duyệt PR; việc viết mã chia thành các issue A–F cho Codex

## Bắt đầu từ đâu
Đọc `docs/bai-giang/ke-hoach.md` (mục 3 kiến trúc, mục 4 các việc), rồi `docs/bai-giang/cu-phap.md`. Mở `docs/bai-giang/ban-thu-bai9.html` bằng trình duyệt để thấy giao diện chuẩn. Bắt đầu bằng issue A (bộ đọc) với dữ liệu `docs/bai-giang/k7-b9-bai-giang.tex`.

## Mục tiêu
Thầy (26/11/2026): "Lời dẫn của Cherry phải thực sự dẫn dắt học sinh, học sinh không ngợp bởi chữ. Học sinh biết bài này có những gì cần học… màn học nên được thiết kế giống như một bài giảng." Thầy duyệt bản thử Bài 9 và yêu cầu "lên kế hoạch và hướng dẫn tất cả những gì cần làm và bàn giao lên Github, thật chi tiết… để Codex lo phần viết mã".

## Quyết định đã chốt với thầy
Xem `docs/bai-giang/ke-hoach.md` mục 2. Tóm tắt: Mở đầu (bài toán SGK có hình) → Bài học hôm nay → các Phần (khám phá → chốt → ví dụ → Thử ngay trên hình mới) → Kết bài; Mục lục khóa phần khi học lần đầu, nhớ màn đang dở; hình chung ghim theo phần; Nhắc lại; Cherry 1 câu ≤ 120 kí tự; đánh số góc theo SGK Hình 3.16; Codex viết mã.

## Đã xong (đã commit)
- [x] `docs/bai-giang/ke-hoach.md`: kế hoạch, kiến trúc, việc A–F, tiêu chí nghiệm thu
- [x] `docs/bai-giang/cu-phap.md`: cú pháp soạn mới + đặc tả hình mẫu `cat-tuyen`
- [x] `docs/bai-giang/k7-b9-bai-giang.tex`: Bài 9 bằng cú pháp mới (18 khung TikZ dịch thử thành công bằng xelatex với PREAMBLE của app)
- [x] `docs/bai-giang/ban-thu-bai9.html`: bản thử thầy đã duyệt (24 màn)
- [x] `AGENTS.md`: thêm dòng trỏ tới kế hoạch
- [x] Các issue cho Codex: A #49, B #50, C #51, D #52, E #53, F #54; issue #48 được thay bằng #50

## Đang làm dở
Không có (phần của Claude).

## Việc tiếp theo
- Thầy gộp PR này để tài liệu lên `main`.
- Codex làm theo thứ tự issue A → B (+ C song song) → D → E → F.
- Claude xem lại PR của Codex khi thầy nhờ.

## Còn lại
- [ ] #49 → #50 (+ #51 song song) → #52 → #53 → #54

## File liên quan
- `AGENTS.md`
- `docs/bai-giang/ke-hoach.md`
- `docs/bai-giang/cu-phap.md`
- `docs/bai-giang/k7-b9-bai-giang.tex`
- `docs/bai-giang/ban-thu-bai9.html`
- `hoc-cung-cherry/lib/latex.js`, `hoc-cung-cherry/lib/figcode.js`
- `hoc-cung-cherry/client/lesson.js`, `hoc-cung-cherry/client/lesson.css`, `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/scripts/build-app.mjs`

## Cách kiểm tra
Phần này chỉ có tài liệu. Đã dịch thử 18 khung TikZ của bài mẫu bằng `figBlocks` + `wrapFigure` + xelatex + pdftocairo: 18/18 thành công. Bản thử chạy 24 màn ở 390×844 và 1000×800, không có lỗi trang.

## Lưu ý cho người tiếp quản
- Không ghi gì lên Supabase. Nạp Bài 9 thật (issue E) phải hỏi thầy trước.
- Bản thử vẽ hình bằng SVG trong trang. Trên app, chỉ hình mẫu `cat-tuyen` vẽ bằng SVG; các hình khác dùng TikZ (dịch qua GitHub Actions).
- Bản thử chưa có hình mẫu cho cửa sổ "Bài học hôm nay" có ước lượng thời gian: app tự tính khoảng 25 giây một màn.
