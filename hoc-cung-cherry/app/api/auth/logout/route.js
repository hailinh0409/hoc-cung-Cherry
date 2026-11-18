import { clearSession, json } from '@/lib/session';
export async function POST() { clearSession(); return json({ ok: true }); }
