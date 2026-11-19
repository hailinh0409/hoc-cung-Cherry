# Tiến độ: Nút "Dán bài mới" cho giáo viên

- Nhánh: `claude/dan-bai-moi` · PR: #8
- Người đang làm: Claude · Cập nhật lần cuối: 2026-11-19 22:40
- Trạng thái: xong, chờ thầy duyệt

## Mục tiêu
Thầy: "Tạo thêm nút 'Dán bài mới'". Giáo viên bấm vào bài chưa có câu hỏi trên bản đồ → dán LaTeX (Gemini soạn) → app tạo chủ đề nháp gắn đúng mã bài. Không cần chạy lệnh trên máy.

## Quyết định đã chốt với thầy
- Bài mới luôn ở trạng thái nháp; thầy duyệt trong app.
- Hình TikZ do GitHub Actions `tu-dich-hinh.yml` tự dịch (mỗi 15 phút), app không tự dịch.

## Đã xong (đã commit)
- [x] Mở nhánh, file tiến độ
- [x] Nút "+ Dán bài" ở bài chưa có câu hỏi + hộp dán (`client/app.js`, `public/app.html`)
- [x] Máy chủ: slug theo mã bài (`lop8-b2-da-thuc`), nhận `nguon` (`app/api/admin/topic/route.js`)
- [x] Cập nhật `docs/soan-bai.md`
- [x] Chạy thử bằng dữ liệu giả ở 390×844

## Đang làm dở
- Không còn

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3): npm test 9/9, next build OK

## File liên quan
<Danh sách file người tiếp quản cần đọc/sửa, mỗi dòng một đường dẫn. Gemini trên web không tự mở được GitHub, thầy sẽ đính kèm đúng các file này.>
- `AGENTS.md`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/client/real.js`
- `hoc-cung-cherry/app/api/admin/topic/route.js`
- `docs/soan-bai.md`

## Cách kiểm tra
FAKE_DB=1, giáo viên `thaylinh`/`matkhau123` → Toán → khối → bấm bài xám → Dán bài mới.

## Lưu ý cho người tiếp quản
Không ghi gì lên Supabase thật.
