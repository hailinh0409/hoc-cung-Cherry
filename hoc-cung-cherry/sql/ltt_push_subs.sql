-- Thông báo bài tập về máy học sinh (Web Push).
-- Mỗi dòng là một máy (trình duyệt/app đã cài) của một học sinh đã bấm "Bật thông báo".
-- Khóa VAPID (để ký thông báo) được máy chủ tự tạo lần đầu và lưu trong ltt_settings, key = 'vapid'.
create table if not exists public.ltt_push_subs (
  endpoint text primary key,                -- địa chỉ nhận thông báo của máy (do trình duyệt cấp)
  account_id uuid not null references public.ltt_accounts(id) on delete cascade,
  sub jsonb not null,                       -- toàn bộ PushSubscription (endpoint + khóa mã hóa)
  created_at timestamptz not null default now(),
  last_nhac timestamptz                     -- lần cuối gửi lời nhắc bài chưa xong tới máy này
);
create index if not exists ltt_push_subs_account on public.ltt_push_subs(account_id);
-- Giống các bảng khác: bật RLS, không có policy, chỉ máy chủ (service role) đọc/ghi được.
alter table public.ltt_push_subs enable row level security;
