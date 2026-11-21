# Tiến độ: Mốc chương cho Thi đấu + Kho Thi đấu theo chương

- Nhánh: `claude/kho-thi-dau` · PR: #15 (nháp)
- Người đang làm: Claude · Cập nhật lần cuối: 21/11/2026
- Trạng thái: đang làm

## Mục tiêu
Thầy (21/11): "OK, làm tất cả đề xuất trong đợt này" — gồm:
1. Mốc "đã học đến hết chương N" cho từng khối; Thi đấu chỉ rút câu của chương 1..N (cả câu cũ trong các bài lẫn câu trong Kho Thi đấu).
2. Mỗi trận 50% câu thuộc chương gần nhất (chương N), phần còn lại từ các chương trước.
3. Kho Thi đấu theo chương: chủ đề `phan = 'thi-dau'`, `chuong = 'k<khối>-c<số chương>'`, không hiện trên bản đồ, chỉ dùng cho Thi đấu. Mỗi lần nạp là một "đợt" mới ở trạng thái Nháp (duyệt từng đợt, câu cũ đã duyệt vẫn dùng bình thường).
4. Bài chưa gắn chương (Chủ đề bổ sung) luôn nằm trong Thi đấu, không phụ thuộc mốc.

## Quyết định đã chốt với thầy
- Tỷ lệ chương gần nhất: 50%.
- Chưa đặt mốc = mở mọi chương, không ưu tiên chương nào (giữ như cũ).
- Nạp kho: nút "Dán câu Thi đấu" (giáo viên), skill của Claude, hoặc `scripts/ngan-hang.mjs`.

## Đã xong (đã commit)
- [x] Giao diện: tab Thi đấu (mốc, kho theo chương, Dán câu Thi đấu, Duyệt), lọc mốc + 50% chương gần nhất, luật thi đấu
- [x] Máy chủ: bảng `ltt_settings` (đã tạo trên Supabase), API mốc, sync trả `moc`, topic route nhận `thi-dau`

## Còn lại
- [x] Bảng `ltt_settings` (lưu mốc) + `sql/ltt_settings.sql`; API `app/api/admin/settings/route.js`; sync trả `moc`
- [x] `app/api/admin/topic/route.js`: cho phép `phan = 'thi-dau'`, `chuong = k<k>-c<n>`
- [x] Client: `isKho`, `chapOf`, ẩn kho khỏi bản đồ / giao bài; lọc mốc + 50% chương gần nhất trong `startRank`
- [x] Ngân hàng câu hỏi → tab Thi đấu: chọn mốc, danh sách Kho Thi đấu theo chương, nút Dán câu Thi đấu, Duyệt
- [x] Luật thi đấu cho học sinh: ghi rõ chương đang mở
- [x] `docs/soan-bai.md` (+ hướng dẫn Gemini) mục Kho Thi đấu; `scripts/ngan-hang.mjs` nếu cần
- [ ] Kiểm tra (AGENTS.md mục 3)

## File liên quan
- `hoc-cung-cherry/client/app.js`, `client/real.js`, `client/app2.css`
- `hoc-cung-cherry/app/api/sync/route.js`, `app/api/admin/topic/route.js`, `app/api/admin/settings/route.js`
- `hoc-cung-cherry/sql/ltt_settings.sql`, `docs/soan-bai.md`

## Lưu ý cho người tiếp quản
- Thầy đã cho phép Claude làm việc trực tiếp với Supabase (21/11).
