// Ghép giao diện (thư mục client/) thành public/app.html, và sinh lib/items.js cho máy chủ.
//   node scripts/build-app.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const R = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const strip = s => s.replace(/^import .*$\n?/gm, '').replace(/^export (default )?/gm, '');
const must = (s, a, b) => { if (!s.includes(a)) throw new Error('Không tìm thấy đoạn cần thay: ' + a.slice(0, 60)); return s.replace(a, b); };

const lib = ['lib/params.js', 'lib/latex.js', 'lib/srs.js'].map(f => strip(R(f))).join('\n');
const head0 = R('client/head.html');
let head = head0.slice(0, head0.indexOf('</style>'));
const mj = head0.slice(head0.indexOf('</style>'), head0.indexOf('<!-- ====='));
head = head.replace(/<title>[^<]*<\/title>/, '<title>Học cùng Cherry</title>')
  .replace('<head>', '<head>\n<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#0b4654"><link rel="apple-touch-icon" href="/apple-icon.png"><link rel="icon" href="/icon.svg" type="image/svg+xml">');
const css = R('client/app1.css') + R('client/app2.css') + `
.gvlink{margin-top:4px;font-size:13px;color:#7a9399;text-decoration:underline;align-self:center}
.figmiss{display:inline-block;padding:6px 10px;border-radius:8px;background:#fff3c4;color:#7a5a00;font-size:13px}
img.fig{display:block;max-width:100%;height:auto;margin:8px auto;background:#fff;border-radius:8px}
.btn[disabled]{opacity:.6}`;

let js = R('client/app.js');
js = must(js, '/*@@LIB@@*/', lib);
js = must(js, '@@FX@@', R('client/fx.js'));
js = must(js, '@@SVG@@', R('client/svg.js'));
js = must(js, '@@ART@@', R('client/art.js') + R('client/items.js'));
js = must(js, "function login(view='in',msg=''){", "function login_artifact(view='in',msg=''){");
js = must(js, 'function start(){', 'function start_artifact(){');
js = must(js, "const doc=PLAYERS.find(x=>x.id===ACC.id);if(doc)mergeP(doc);", "const doc=SERVERP||PLAYERS.find(x=>x.id===ACC.id);SERVERP=null;if(doc)mergeP(doc);");
js = must(js, 'function logout(view){ACC=null;', "function logout(view){api('/api/auth/logout',{}).catch(()=>{});TEACHER=false;ACC=null;");
js = must(js, 'const tex=s=>esc(s)', 'const tex=s=>figImg(esc(figSwap(s)))');
js = must(js, "await DB.doc('players/'+ACC.id).set(doc)}", "const r=await DB.doc('players/'+ACC.id).set(doc);reconcile(doc,r)}");
js = must(js, "$('#intro').onclick=()=>{sfx.win();start()};", "$('#intro').onclick=()=>{sfx.win();start()};\n" + R('client/real.js'));
const a = js.indexOf("(async()=>{if(!window.claude");
const b = js.lastIndexOf('})();', js.lastIndexOf('</script>'));
if (a < 0 || b < a) throw new Error('Không tìm thấy khối khởi động artifact');
js = js.slice(0, a) + js.slice(b + 5);

writeFileSync(new URL('../public/app.html', import.meta.url), head + css + mj + R('client/body.html') + js);
writeFileSync(new URL('../lib/items.js', import.meta.url), '// SINH TỰ ĐỘNG từ client/items.js bởi scripts/build-app.mjs. Không sửa trực tiếp.\n' + R('client/items.js') + '\nexport { ITEMS, ITEM, SPECIAL, SLOTS, RAR };\n');
console.log('Đã tạo public/app.html và lib/items.js');
