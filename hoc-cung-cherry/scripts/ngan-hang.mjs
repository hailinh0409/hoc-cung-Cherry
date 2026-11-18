// Kéo / kiểm tra / đẩy ngân hàng câu hỏi (bảng ltt_topics) giữa Supabase và thư mục ngan-hang/ trên máy.
//   node --env-file=.env.local scripts/ngan-hang.mjs thongke [--khoi 7]      đếm số câu theo bài, theo mức
//   node --env-file=.env.local scripts/ngan-hang.mjs keo [--khoi 7]          kéo về ngan-hang/lop7/<slug>.tex
//   node --env-file=.env.local scripts/ngan-hang.mjs kiemtra [đường dẫn...]  chỉ kiểm tra cú pháp các file
//   node --env-file=.env.local scripts/ngan-hang.mjs day [đường dẫn...] [--thu] [--ep]
//        đẩy file đã sửa lên Supabase. --thu: chạy thử, không ghi. --ep: bỏ qua cảnh báo "có người sửa trên app".
// Quy ước: chủ đề MỚI luôn ở trạng thái nháp; chủ đề có sẵn giữ nguyên trạng thái. Không bao giờ xóa chủ đề.
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { parseBank, errorText } from '../lib/latex.js';
import { figBlocks } from '../lib/figcode.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'ngan-hang');
const [cmd, ...rest] = process.argv.slice(2);
const flag = n => rest.includes('--' + n);
const opt = n => { const i = rest.indexOf('--' + n); return i >= 0 ? rest[i + 1] : null; };
const paths = rest.filter((a, i) => !a.startsWith('--') && rest[i - 1] !== '--khoi');
const khoi = opt('khoi');
const sha1 = c => crypto.createHash('sha1').update(c, 'utf8').digest('hex');
const TYPES = { ex: 'tn', extf: 'ds', exfb: 'dien', exmatch: 'noi' };

if (!['thongke', 'keo', 'kiemtra', 'day'].includes(cmd)) {
  console.log('Lệnh: thongke | keo | kiemtra | day  (xem hướng dẫn đầu file scripts/ngan-hang.mjs)'); process.exit(1);
}
const db = (cmd === 'kiemtra') ? null : await (async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY. Tạo file .env.local từ .env.example rồi chạy với --env-file=.env.local'); process.exit(1);
  }
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
})();

const FIELDS = 'id,slug,title,grade,status,source,sort,nguon,phan,chuong,updated_at';
async function fetchTopics() {
  let q = db.from('ltt_topics').select(FIELDS).order('grade').order('sort').order('slug');
  if (khoi) q = q.eq('grade', khoi);
  const { data, error } = await q;
  if (error) { console.error(error.message); process.exit(1); }
  return data;
}
function count(src) {
  const P = parseBank(src), c = { m1: 0, m2: 0, m3: 0, m4: 0, tn: 0, ds: 0, dien: 0, noi: 0, tong: 0 };
  for (const l of P.levels) for (const q of l.qs) { c['m' + l.n] = (c['m' + l.n] || 0) + 1; c[TYPES[q.type]]++; c.tong++; }
  return { c, errors: P.errors };
}
const HEAD = /^(%%% (\w+): ?(.*)\n)+/;
function writeHeader(t) {
  return ['slug', 'grade', 'status', 'phan', 'chuong', 'sort', 'nguon', 'updated_at'].map(k => `%%% ${k}: ${t[k] ?? ''}`).join('\n') + '\n\n';
}
function readFileTopic(file) {
  let txt = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const meta = {};
  const m = txt.match(HEAD);
  if (m) { for (const l of m[0].split('\n')) { const x = l.match(/^%%% (\w+): ?(.*)$/); if (x) meta[x[1]] = x[2].trim(); } txt = txt.slice(m[0].length).replace(/^\n/, ''); }
  if (!meta.slug) meta.slug = basename(file, '.tex');
  if (!meta.grade) { const g = basename(dirname(file)).match(/^lop(\d+)$/); if (g) meta.grade = g[1]; }
  return { meta, source: txt };
}
function listTex(p) {
  if (!existsSync(p)) return [];
  if (statSync(p).isFile()) return p.endsWith('.tex') ? [p] : [];
  return readdirSync(p, { withFileTypes: true }).flatMap(e => listTex(join(p, e.name)));
}
const targets = () => (paths.length ? paths.map(p => resolve(p)) : [DIR]).flatMap(listTex);

if (cmd === 'thongke') {
  const rows = await fetchTopics(), tot = {};
  console.log('Khối | Mã bài | Trạng thái | M1 M2 M3 M4 | TN ĐS Điền Nối | Tổng | Tên');
  for (const t of rows) {
    const { c, errors } = count(t.source);
    const g = (tot[t.grade] ||= { tong: 0, m4: 0, bai: 0 }); g.tong += c.tong; g.m4 += c.m4; g.bai++;
    console.log(`${t.grade} | ${t.phan === 'on-tap' ? 'ôn tập' : (t.chuong || '-')} | ${t.status} | ${c.m1} ${c.m2} ${c.m3} ${c.m4} | ${c.tn} ${c.ds} ${c.dien} ${c.noi} | ${c.tong} | ${t.title}${errors.length ? '  ⚠ ' + errors.length + ' lỗi' : ''}`);
  }
  console.log('\nTổng theo khối:');
  for (const [k, v] of Object.entries(tot)) console.log(`  Khối ${k}: ${v.bai} chủ đề, ${v.tong} câu (trong đó Mức 4/Thi đấu: ${v.m4})`);
}

if (cmd === 'keo') {
  const rows = await fetchTopics();
  for (const t of rows) {
    const d = join(DIR, 'lop' + t.grade); mkdirSync(d, { recursive: true });
    writeFileSync(join(d, t.slug + '.tex'), writeHeader(t) + t.source);
  }
  console.log(`Đã kéo ${rows.length} chủ đề về ${DIR}`);
}

if (cmd === 'kiemtra' || cmd === 'day') {
  const files = targets();
  if (!files.length) { console.log('Không thấy file .tex nào.'); process.exit(0); }
  let ok = 0, skip = 0, bad = 0;
  for (const f of files) {
    const { meta, source } = readFileTopic(f), P = parseBank(source), name = basename(f);
    if (P.errors.length) { bad++; console.log(`✗ ${name}`); P.errors.forEach(e => console.log('    ' + errorText(e))); continue; }
    if (cmd === 'kiemtra') { ok++; const { c } = count(source); console.log(`✓ ${name}: ${c.tong} câu (M1 ${c.m1}, M2 ${c.m2}, M3 ${c.m3}, M4 ${c.m4})`); continue; }
    if (source.includes('$ltt$')) { bad++; console.log(`✗ ${name}: chứa chuỗi $ltt$`); continue; }
    const { data: cur, error } = await db.from('ltt_topics').select(FIELDS).eq('slug', meta.slug).maybeSingle();
    if (error) { bad++; console.log(`✗ ${name}: ${error.message}`); continue; }
    const row = { source, title: P.topic, sort: Number(meta.sort) || 0, nguon: meta.nguon || '', phan: meta.phan || 'dai-so', chuong: meta.chuong || null };
    let res;
    if (!cur) {
      if (!meta.grade) { bad++; console.log(`✗ ${name}: file mới cần dòng "%%% grade: 7" hoặc đặt trong thư mục lop7/`); continue; }
      if (flag('thu')) { console.log(`+ ${name}: SẼ TẠO MỚI (nháp)`); ok++; continue; }
      res = await db.from('ltt_topics').insert({ slug: meta.slug, grade: meta.grade, status: 'draft', ...row });
      if (!res.error) console.log(`+ ${name}: đã tạo mới (nháp)`);
    } else {
      if (meta.updated_at && cur.updated_at !== meta.updated_at && !flag('ep')) { skip++; console.log(`! ${name}: bản trên Supabase mới hơn bản đã kéo (có người sửa trên app?). Kéo lại hoặc dùng --ep để ghi đè.`); continue; }
      if (cur.source === source && cur.sort === row.sort && (cur.phan || 'dai-so') === row.phan && (cur.chuong || null) === row.chuong) { skip++; continue; }
      if (flag('thu')) { console.log(`~ ${name}: SẼ CẬP NHẬT (trạng thái giữ nguyên: ${cur.status})`); ok++; continue; }
      res = await db.from('ltt_topics').update({ ...row, ban_truoc: cur.source, updated_at: new Date().toISOString() }).eq('slug', meta.slug);
      if (!res.error) console.log(`~ ${name}: đã cập nhật (trạng thái giữ nguyên: ${cur.status})`);
    }
    if (res.error) { bad++; console.log(`✗ ${name}: ${res.error.message}`); continue; }
    ok++;
    const blocks = figBlocks(source);
    if (blocks.length) {
      const { data: have } = await db.from('ltt_figures').select('hash,error').in('hash', blocks.map(sha1));
      const done = new Set((have || []).filter(r => !r.error).map(r => r.hash));
      const miss = blocks.filter(b => !done.has(sha1(b))).length;
      if (miss) console.log(`    ⚠ ${miss} hình TikZ chưa dịch: chạy  node --env-file=.env.local scripts/dung-hinh.mjs ${meta.slug}`);
    }
  }
  console.log(`\nXong: ${ok} ${cmd === 'day' ? 'đã ghi' : 'hợp lệ'}, ${skip} bỏ qua, ${bad} lỗi.`);
  if (bad) process.exitCode = 1;
}
