-- Bảng báo lỗi câu hỏi (học sinh báo, giáo viên kiểm tra).
-- Thầy chạy MỘT LẦN trên Supabase: SQL Editor → dán toàn bộ file → Run. Chạy lại cũng không sao.
create table if not exists public.ltt_reports (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.ltt_accounts(id) on delete cascade,
  topic_slug text not null,                 -- mã chủ đề (ltt_topics.slug)
  qkey text not null,                       -- mã câu hỏi (qkeyOf trong lib/latex.js)
  kind text not null check (kind in ('de', 'dapan', 'khac')),  -- đề sai / đáp án, lời giải sai / lỗi khác
  note text not null default '',            -- học sinh ghi thêm (tối đa 300 kí tự)
  snap jsonb not null default '{}'::jsonb,  -- câu hỏi đúng như học sinh thấy (số đã thay tham số) và đáp án em chọn
  status text not null default 'moi' check (status in ('moi', 'xong')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists ltt_reports_status_idx on public.ltt_reports (status, created_at desc);
create index if not exists ltt_reports_account_idx on public.ltt_reports (account_id, created_at desc);
-- Giống các bảng ltt_* khác: bật RLS, không có policy; chỉ máy chủ (service role) đọc/ghi.
alter table public.ltt_reports enable row level security;
