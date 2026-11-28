# Tiến độ: Chặng Tự luận trên bản đồ (bài tự luận chat cùng Cherry)

- Nhánh: `claude/tu-luan-chat` · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 28/11/2026
- Trạng thái: đang làm

## Bắt đầu từ đâu
Bài tự luận dùng lại chủ đề Bài mẫu (`phan = 'bai-mau'`, khối `\begin{giaimau}`), thêm ba lệnh tùy chọn sau mỗi `\buocgiai`: `\huong`, `\goiy`, `\kiemtra` (`lib/latex.js`, `parseGiaiMau`). Giao diện chat: `client/tuluan.js`, `client/tuluan.css`. Chặng trên bản đồ và rương: `client/app.js` (tìm `Chặng Tự luận`).

## Mục tiêu
Thầy (28/11/2026): dạng Toán tự luận có Cherry hướng dẫn từng bước theo phong cách chat. Thầy chọn bản thử 1 (không sơ đồ đi lên): https://claude.ai/artifact/GSpC2Z72PKK78VqkwA1aEg . "Yêu cầu Claude tự triển khai luôn phần này, cú pháp cho Gemini cũng viết để tôi chỉ cần copy."

## Quyết định đã chốt với thầy
- Bài tự luận là **một chặng riêng trên bản đồ**, đứng **giữa Luyện tập chung (bài cuối chương) và chương mới**; bên cạnh có **rương kho báu nhỏ**.
- **Số bài mở**: thầy tự thêm (mặc định nên 2 bài: bài 1 vừa sức, bài 2 có ý phân loại).
- **Rương mở khi làm trọn 2 bài bất kỳ** trong chặng (đi hết mọi ý; dùng gợi ý vẫn tính). Rương đã mở không bị lấy lại khi thầy thêm bài.
- **Không khóa đường đi**: bỏ qua chặng tự luận vẫn sang chương mới được, chỉ không có quà.
- **Không báo điểm** tự luận; tài khoản giáo viên **chỉ thấy đánh dấu** em nào đã làm.
- Kiểu chat **bản thử 1, không sơ đồ đi lên**: mỗi bước Cherry nêu mục tiêu và hướng → học sinh viết vào vở (bí thì xin gợi ý) → câu kiểm tra nhỏ (2 lần thử) → hiện dòng trình bày mẫu để so với vở. Hình ghim trên cùng, phần đang dùng tô cam.
- Công thức trong chat tự luận không cắt nhỏ, không thu nhỏ (khác `mathBreak`/`mathFit` của màn cũ).
- Cherry xưng "tớ" – "cậu", gọi học sinh bằng tên thật.

## Đã xong (đã commit)
- (chưa)

## Đang làm dở
- Bộ đọc + giao diện chat + chặng trên bản đồ.

## Việc tiếp theo
- (điền khi xong)

## Còn lại
- [ ] `lib/latex.js`: `\huong`, `\goiy`, `\kiemtra` trong `giaimau` + test
- [ ] `client/tuluan.js`, `client/tuluan.css`: chạy bài kiểu chat, lưu tiến độ theo câu
- [ ] Bản đồ: chặng Tự luận + rương; bỏ nút "Bài mẫu" trên biển chương
- [ ] Giáo viên: đánh dấu trong Theo dõi khối
- [ ] Hướng dẫn soạn cho Gemini (`docs/tu-luan/`), cập nhật yêu cầu chép cho Gemini trong app
- [ ] Chạy kiểm tra (AGENTS.md mục 3) và ghi kết quả vào PR

## File liên quan
- `AGENTS.md`
- `hoc-cung-cherry/lib/latex.js`
- `hoc-cung-cherry/client/tuluan.js`, `hoc-cung-cherry/client/tuluan.css`
- `hoc-cung-cherry/client/app.js`
- `hoc-cung-cherry/scripts/build-app.mjs`

## Cách kiểm tra
(điền khi xong)

## Lưu ý cho người tiếp quản
- Không ghi gì lên Supabase.
