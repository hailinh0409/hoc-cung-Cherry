import zlib from 'node:zlib';
import { admin } from '@/lib/supabase/admin';

// Ảnh SVG của hình TikZ đã dịch. Địa chỉ theo hash nội dung nên lưu đệm vĩnh viễn được.
export async function GET(_req, { params }) {
  const h = String(params.hash || '').replace(/\.svg$/, '');
  if (!/^[0-9a-f]{40}$/.test(h)) return new Response('Not found', { status: 404 });
  const { data } = await admin().from('ltt_figures').select('svgz').eq('hash', h).maybeSingle();
  if (!data?.svgz) return new Response('Not found', { status: 404 });
  let svg;
  try { svg = zlib.gunzipSync(Buffer.from(data.svgz, 'base64')); } catch { return new Response('Bad figure', { status: 500 }); }
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
