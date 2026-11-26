# Tiến độ: Cập nhật hướng dẫn soạn bài cho màn học từng màn

- Nhánh: `claude/huong-dan-soan-tung-man` · PR: (PR mở từ nhánh này)
- Người đang làm: Claude · Cập nhật lần cuối: 26/11/2026
- Trạng thái: xong, chờ thầy duyệt

## Bắt đầu từ đâu
Chỉ sửa tài liệu và câu nhờ Gemini (`GEM_ASK`), không đổi cú pháp. Sau PR #38/#39 (lý thuyết từng màn, hình co giãn), hướng dẫn soạn còn câu cũ (nút chọn mục, cột minh họa, "gọn 1–2 màn hình") và chưa dặn cách viết cho màn ngắn.

## Mục tiêu
Thầy hỏi có cần viết lại skill của Claude và Gemini để đổi cách soạn bài không; Claude trả lời chỉ cần sửa vài đoạn, thầy: "Đồng ý".

## Quyết định đã chốt với thầy
- Không viết lại skill từ đầu; cú pháp giữ nguyên; chỉ thêm quy tắc "Viết cho màn học từng màn" và bỏ câu cũ.

## Đã xong (đã commit)
- [x] Quy tắc *Viết cho màn học từng màn*: mỗi dòng `\\` 1–2 câu (≈150 kí tự), `\loidan` 1–2 câu (<≈100 kí tự), `\luuy` mỗi ý một câu, lời giải `\vidu` mỗi bước một dòng, tiêu đề mục ngắn (hiện ở dòng trên cùng), mỗi mục có một `\thungay`, hình đặt ngay sau câu nó minh họa — thêm vào `docs/gemini-skill-soan-bai.md` (mục Lý thuyết tương tác), `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`.
- [x] Bỏ câu cũ: "tên nút chọn là tiêu đề đầu tiên", "app hiện ở cột minh họa", "gọn trong 1–2 màn hình điện thoại".
- [x] `GEM_ASK` (`hoc-cung-cherry/client/app.js`, nút "Sao chép chương cho Gemini"): thêm quy tắc viết từng màn và nhờ viết lại mục cũ còn là đoạn dài.
- [x] Skill `nap-bai-leo-thap` của Claude (trên tài khoản thầy, Gemini dùng chung): Claude gửi thẻ đề xuất sửa trong chat (gộp quy tắc viết từng màn + quy tắc hình); thầy bấm lưu.

## Đang làm dở
Không có.

## Việc tiếp theo
- Thầy lưu thẻ đề xuất skill; nếu Gemini dùng bản skill tải lên riêng thì tải lại bản mới cho Gemini.
- Bài lý thuyết tĩnh cũ (lớp 7 b1–b7, lớp 8 b3–b13, lớp 10) cần thêm `\loidan` + `\thungay`: dùng nút "Sao chép chương cho Gemini".

## Còn lại
- [x] Chạy kiểm tra (AGENTS.md mục 3)

## File liên quan
- `docs/gemini-skill-soan-bai.md`, `docs/soan-bai.md`, `docs/soan-man-tuong-tac.txt`
- `hoc-cung-cherry/client/app.js` (`GEM_ASK`)

## Cách kiểm tra
`node scripts/build-app.mjs`, `npm test` 33/33.

## Lưu ý cho người tiếp quản
Con số 160 kí tự/màn lấy từ `LS_MAX` trong `client/lesson.js`; đổi hằng đó thì sửa lại các tài liệu này.
