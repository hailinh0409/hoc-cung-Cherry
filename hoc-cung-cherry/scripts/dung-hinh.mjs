// Dịch các hình TikZ còn thiếu thành SVG và lưu lên Supabase (bảng ltt_figures).
// Cần: TeX Live có xelatex; pdftocairo (poppler) hoặc dvisvgm (có sẵn trong TeX Live).
//   node --env-file=.env.local scripts/dung-hinh.mjs              (mọi chủ đề)
//   node --env-file=.env.local scripts/dung-hinh.mjs lop8-hinh-chu-nhat   (một chủ đề theo slug)
// Tùy chọn (dùng cho GitHub Actions tự dịch hình, .github/workflows/tu-dich-hinh.yml):
//   --dem        chỉ đếm số hình cần dịch, không dịch (không cần TeX); ghi `can_dich=<số>` vào GITHUB_OUTPUT nếu có
//   --bo-qua-loi bỏ qua hình đã dịch lỗi trước đó (mã TikZ chưa sửa thì dịch lại vẫn lỗi)
import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { figBlocks, wrapFigure } from '../lib/figcode.js';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const sha1 = c => crypto.createHash('sha1').update(c, 'utf8').digest('hex');
const has = cmd => { try { execFileSync(cmd, ['-v'], { stdio: 'ignore' }); return true; } catch (e) { return e.code !== 'ENOENT'; } };
const args = process.argv.slice(2);
const countOnly = args.includes('--dem'), skipErr = args.includes('--bo-qua-loi');
const usePdf = !countOnly && has('pdftocairo');

// pic {angle = ...} và {right angle = ...} chỉ nhận điểm có tên. Trợ lý AI hay viết toạ độ
// ({(2.4,1.1)}--A--...) làm xelatex báo "No shape named `(2.4,1.1)'". Đặt tên tạm cho các toạ độ đó
// ngay sau \begin{tikzpicture}[...]. Mã hình lưu trong bài giữ nguyên (khóa hash không đổi).
const PT = String.raw`(?:\{\s*\([^()]*\)\s*\}|\([^()]*\)|[A-Za-z0-9_']+)`;
const ANG = new RegExp(String.raw`((?:right\s+)?angle\s*=\s*)(${PT}\s*--\s*${PT}\s*--\s*${PT})`, 'g');
export function fixAngles(b) {
  const defs = []; let n = 0;
  const out = b.replace(ANG, (all, head, body) => head + body.split(/\s*--\s*/).map(p => {
    const c = p.trim().replace(/^\{\s*|\s*\}$/g, '');
    if (!/^\(.*\)$/.test(c)) return p.trim();
    const inner = c.slice(1, -1).trim();
    if (!/[,:]/.test(inner)) return inner; // (A) → A
    const name = `cqgoc${++n}`; defs.push(`\\coordinate (${name}) at ${c};`); return name;
  }).join('--'));
  if (!defs.length) return b;
  const m = out.match(/\\begin\{tikzpicture\}\s*/); if (!m) return b;
  let i = m.index + m[0].length;
  if (out[i] === '[') { let d = 0; for (; i < out.length; i++) { if (out[i] === '[') d++; else if (out[i] === ']' && --d === 0) { i++; break; } } }
  return out.slice(0, i) + '\n' + defs.join('\n') + '\n' + out.slice(i);
}

function compile(block) {
  const dir = mkdtempSync(join(tmpdir(), 'ltt-'));
  writeFileSync(join(dir, 'h.tex'), wrapFigure(fixAngles(block)));
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

const slug = args.find(a => !a.startsWith('--'));
let q = db.from('ltt_topics').select('slug,title,source');
if (slug) q = q.eq('slug', slug);
const { data: topics, error } = await q;
if (error) { console.error(error.message); process.exit(1); }
let made = 0, failed = 0, todo = 0;
for (const t of topics) {
  const blocks = figBlocks(t.source);
  if (!blocks.length) continue;
  const { data: have } = await db.from('ltt_figures').select('hash,error').in('hash', blocks.map(sha1));
  const ok = new Set((have || []).filter(r => skipErr || !r.error).map(r => r.hash));
  const need = blocks.filter(b => !ok.has(sha1(b)));
  todo += need.length;
  if (countOnly) { if (need.length) console.log(`• ${t.slug}: ${need.length} hình chưa dịch`); continue; }
  for (const b of need) {
    const r = compile(b);
    await db.from('ltt_figures').delete().eq('hash', sha1(b));
    const { error: e2 } = await db.from('ltt_figures').insert({ tikz: b, svgz: r.svgz || null, error: r.error || null });
    if (e2 || r.error) { failed++; console.log(`✗ ${t.slug}: ${e2?.message || r.error}`); } else { made++; console.log(`✓ ${t.slug}: đã dịch 1 hình`); }
  }
}
if (countOnly) {
  console.log(`Cần dịch: ${todo} hình.`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `can_dich=${todo}\n`);
} else console.log(`Xong: ${made} hình mới, ${failed} hình lỗi.`);
