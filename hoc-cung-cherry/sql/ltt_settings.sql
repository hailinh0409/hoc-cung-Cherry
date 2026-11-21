-- Cài đặt chung của app (giáo viên chỉnh). Đã chạy trên Supabase ngày 21/11/2026 (migration ltt_settings).
-- key 'moc_thi_dau': {"6": 2, "8": 3} = khối 6 đã học hết Chương 2, khối 8 hết Chương 3.
--   Thi đấu chỉ rút câu của các chương 1..N; khối không có trong đối tượng = mở mọi chương.
create table if not exists public.ltt_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.ltt_settings enable row level security;
