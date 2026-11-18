import { getAccount, json, accPublic } from '@/lib/session';
import { loadPlayer } from '@/lib/accounts';
export async function GET() {
  const a = await getAccount();
  if (!a) return json({ acc: null });
  return json({ acc: accPublic(a), data: a.role === 'student' ? await loadPlayer(a.id) : null, isDefault: a.is_default });
}
