// Dịch các hình TikZ còn thiếu thành SVG và lưu lên Supabase (bảng ltt_figures).
// Cần: TeX Live có xelatex; pdftocairo (poppler) hoặc dvisvgm (có sẵn trong TeX Live).
//   node --env-file=.env.local scripts/dung-hinh.mjs              (mọi chủ đề)
//   node --env-file=.env.local scripts/dung-hinh.mjs lop8-hinh-chu-nhat   (một chủ đề theo slug)
import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { figBlocks, wrapFigure } from '../lib/figcode.js';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const sha1 = c => crypto.createHash('sha1').update(c, 'utf8').digest('hex');
const has = cmd => { try { execFileSync(cmd, ['-v'], { stdio: 'ignore' }); return true; } catch (e) { return e.code !== 'ENOENT'; } };
const usePdf = has('pdftocairo');

function compile(block) {
  const dir = mkdtempSync(join(tmpdir(), 'ltt-'));
  writeFileSync(join(dir, 'h.tex'), wrapFigure(block));
  try {
    execFileSync('xelatex', ['-interaction=nonstopmode', '-halt-on-error', ...(usePdf ? [] : ['-no-pdf']), 'h.tex'], { cwd: dir, stdio: 'pipe', timeout: 60000 });
  } catch {
    const log = existsSync(join(dir, 'h.log')) ? readFileSync(join(dir, 'h.log'), 'utf8') : '';
    const m = log.split('\n').findIndex(l => l.startsWith('!'));
    return { error: m >= 0 ? log.split('\n').slice(m, m + 3).join(' ').slice(0, 300) : 'Lỗi biên dịch TikZ' };
  }
  if (usePdf) execFileSync('pdftocairo', ['-svg', 'h.pdf', 'h.svg'], { cwd: dir });
  else execFileSync('dvisvgm', ['--no-fonts', '--exact-bbox', '-o', 'h.svg', 'h.xdv'], { cwd: dir, stdio: 'ignore' });
  return { svgz: zlib.gzipSync(readFileSync(join(dir, 'h.svg')), { level: 9 }).toString('base64') };
}

const slug = process.argv[2];
let q = db.from('ltt_topics').select('slug,title,source');
if (slug) q = q.eq('slug', slug);
const { data: topics, error } = await q;
if (error) { console.error(error.message); process.exit(1); }
let made = 0, failed = 0;
for (const t of topics) {
  const blocks = figBlocks(t.source);
  if (!blocks.length) continue;
  const { data: have } = await db.from('ltt_figures').select('hash,error').in('hash', blocks.map(sha1));
  const ok = new Set((have || []).filter(r => !r.error).map(r => r.hash));
  for (const b of blocks.filter(b => !ok.has(sha1(b)))) {
    const r = compile(b);
    await db.from('ltt_figures').delete().eq('hash', sha1(b));
    const { error: e2 } = await db.from('ltt_figures').insert({ tikz: b, svgz: r.svgz || null, error: r.error || null });
    if (e2 || r.error) { failed++; console.log(`✗ ${t.slug}: ${e2?.message || r.error}`); } else { made++; console.log(`✓ ${t.slug}: đã dịch 1 hình`); }
  }
}
console.log(`Xong: ${made} hình mới, ${failed} hình lỗi.`);
