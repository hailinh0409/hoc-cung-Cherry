# Tiến độ: Hình mẫu cát tuyến và thao tác trên hình

- Nhánh: `codex/hinh-cat-tuyen-vao-main` · Issue #51
- Mã gốc từ PR #58 đã gộp vào nhánh `codex/khung-bai-giang`. PR này đưa lại đúng phần mã đó vào `main` sau PR #57.
- Người đang làm: Codex · Cập nhật: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu

Xem `docs/bai-giang/cu-phap.md` mục 4, hàm `catTuyen` trong `client/hinhmau.js` và `bindLectureGeometry` trong `client/lesson.js`.

## Mục tiêu

Vẽ hình cát tuyến bằng SVG và cho học sinh chạm góc, chạm vùng, trượt, tính từng bước và đổi trạng thái hình.

## Quyết định đã chốt

- Đánh số theo SGK Hình 3.16: trên trái 2, trên phải 3, dưới trái 1, dưới phải 4.
- Vùng chạm là hình quạt bán kính 1 đơn vị. Ẩn nút phóng to khi đang chờ chạm.
- Trượt trong 1,4 giây. Khi thiết bị giảm chuyển động, hiện ngay vị trí sau.
- Mỗi màn bắt đầu từ trạng thái riêng. Kiểm tra câu hỏi và đáp đúng câu Em tính bổ sung trạng thái theo cú pháp.

## Đã xong (đã commit)

- [x] Vẽ SVG với nhãn đường, giao điểm, hướng đường cắt, số góc, tô màu, số đo và vùng. Thao tác dùng được bằng chạm và bàn phím.
- [x] Tích hợp năm dạng thao tác và cập nhật hình sau Thử ngay.
- [x] Có ba kiểm thử tự động bổ sung và ảnh đối chiếu ở 390×844.

## Đang làm dở

Không có trong phạm vi #51.

## Việc tiếp theo

Sau khi PR đưa phần C vào `main` được gộp, làm công cụ giáo viên #52. Việc nạp bài thật #53 cần thầy duyệt trước.

## Còn lại

- [x] Chạy kiểm tra theo AGENTS.md.
- [ ] Thầy duyệt và gộp PR đưa phần C vào `main`.

## File liên quan

- `hoc-cung-cherry/client/hinhmau.js`
- `hoc-cung-cherry/client/lesson.js`
- `hoc-cung-cherry/tests/hinh-mau.test.mjs`
- `docs/bai-giang/anh-kiem-tra/hinh-cat-tuyen-390x844.jpg`

## Cách kiểm tra

- GitHub Actions đạt 47/47 kiểm thử, ghép giao diện, kiểm tra cú pháp và build Next.js với `FAKE_DB=1`.
- Chrome 390×844 kiểm tra đủ 24 màn ở vai trò học sinh mô phỏng. Các màn đếm 8 góc, chạm vùng giữa, chạm sai B3 rồi đúng B2 bằng bàn phím, trượt và giảm chuyển động, chạm góc đồng vị, Em tính 60°/120°, đổi hình dấu hiệu và ví dụ 70° đều đạt.
- Ảnh chụp vùng SVG dùng Bài 9 mẫu trong app đã ghép. Các khung TikZ và phiên đăng nhập trong phép thử trình duyệt dùng dữ liệu mô phỏng.

## Lưu ý cho người tiếp quản

Chưa ghi dữ liệu Supabase.
