import { admin } from '@/lib/supabase/admin';
import { needTeacher, json, fail } from '@/lib/session';
import { figStatus } from '@/lib/figs';

// Tình trạng hình TikZ của một số bài (giáo viên): đã dịch, đang chờ dịch, dịch lỗi (kèm thông báo lỗi).
// Dùng cho bộ công cụ "Soạn bằng Gemini" của từng chương trên bản đồ (nút "Sao chép lỗi hình").
export async function POST(req) {
  if (!(await needTeacher())) return fail('Chỉ giáo viên', 403);
  const b = await req.json().catch(() => ({}));
  const slugs = Array.isArray(b.slugs) ? [...new Set(b.slugs.map(String))].slice(0, 40) : [];
  if (!slugs.length) return json({ topics: [] });
  const { data, error } = await admin().from('ltt_topics').select('slug,title,source').in('slug', slugs);
  if (error) return fail('Chưa đọc được bài', 500);
  const topics = [];
  for (const t of data || []) {
    const { list } = await figStatus(t.source);
    topics.push({
      slug: t.slug, title: t.title, total: list.length,
      ok: list.filter(f => f.ok).length,
      wait: list.filter(f => !f.ok && !f.error).length,
      errors: list.filter(f => f.error).map(f => ({ code: f.code, error: f.error })),
    });
  }
  return json({ topics });
}
