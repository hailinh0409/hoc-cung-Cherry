# Cài Antigravity để Gemini làm việc trên repo (máy Windows của thầy)

Làm một lần, khoảng 20–30 phút. Antigravity là công cụ lập trình của Google chạy Gemini, thay cho Jules và Gemini CLI.

## 1. Cài các công cụ nền (bỏ qua bước nào máy đã có)

Mở **PowerShell** (bấm Start, gõ "PowerShell") rồi chạy lần lượt:

```powershell
winget install -e --id Git.Git
winget install -e --id OpenJS.NodeJS.LTS
winget install -e --id Google.Antigravity
```

Nếu lệnh cuối báo không tìm thấy, tải bộ cài ở https://antigravity.google/download (chọn Windows) và cài như phần mềm thường.
Cài xong thì **đóng PowerShell rồi mở lại**.

## 2. Lấy mã mới nhất từ GitHub (thư mục mới, không dùng bản cũ ở `D:\hoc-cung-cherry`)

```powershell
cd D:\
git clone https://github.com/hailinh0409/hoc-cung-Cherry.git Cherry-GitHub
cd D:\Cherry-GitHub
git config user.name "Gemini (Antigravity)"
git config user.email "hailinh0409@users.noreply.github.com"
```

Lần đầu Git đẩy mã lên, một cửa sổ đăng nhập GitHub sẽ hiện ra: thầy đăng nhập tài khoản `hailinh0409` và bấm cho phép. Chỉ cần làm một lần.

## 3. Mở Antigravity

1. Mở Antigravity, chọn **Sign in with Google**, đăng nhập tài khoản Gmail cá nhân.
2. Chọn chế độ có hỏi lại trước khi chạy lệnh (Review-driven / Assisted), không chọn chế độ tự chạy hoàn toàn.
3. **Open Folder** → chọn `D:\Cherry-GitHub`.
4. Antigravity tự đọc `GEMINI.md`, `AGENTS.md` và `.agents/rules/` trong repo.

## 4. Giao việc

Gõ yêu cầu vào khung trò chuyện của Antigravity, ví dụ:

```
Đọc AGENTS.md. Tạo nhánh gemini/<tên-việc> từ main mới nhất (git pull trước).
Việc cần làm: <mô tả>.
Làm xong: chạy các lệnh kiểm tra ở AGENTS.md mục 3, commit, đẩy nhánh lên GitHub.
Không đẩy lên main. Báo lại cho tôi đường link để mở pull request.
```

Tiếp quản việc dở của Claude: dùng câu lệnh mẫu trong `docs/gemini-tiep-quan.md` (bước 3).

Mở pull request: vào trang repo trên GitHub, bấm **Compare & pull request** ở nhánh vừa đẩy (hoặc nhờ Claude mở giúp).

## 5. Trước mỗi lần giao việc mới

Trong Antigravity (hoặc PowerShell ở `D:\Cherry-GitHub`): `git checkout main` rồi `git pull`, để Gemini luôn làm trên bản mới nhất.
