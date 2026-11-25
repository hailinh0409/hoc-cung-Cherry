-- Tự cập nhật ltt_topics.updated_at khi bài bị sửa mà người sửa quên đặt updated_at
-- (ví dụ trợ lý AI sửa thẳng bằng SQL). App dùng updated_at để biết khi nào máy học sinh
-- cần tải lại kho bài (PR giảm lưu lượng Supabase), nên cột này phải luôn đổi khi bài đổi.
-- Nếu câu lệnh UPDATE đã tự đặt updated_at (app, scripts/ngan-hang.mjs) thì giữ nguyên giá trị đó,
-- để phần chống ghi đè (so "base" với updated_at) của app vẫn khớp.
-- CHƯA CHẠY trên Supabase: thầy duyệt rồi chạy trong SQL Editor (hoặc nhờ Claude chạy).

create or replace function public.ltt_topics_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists ltt_topics_touch on public.ltt_topics;
create trigger ltt_topics_touch
  before update on public.ltt_topics
  for each row execute function public.ltt_topics_touch();
