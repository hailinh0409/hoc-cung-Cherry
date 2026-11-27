import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const bundle = paths => paths.map(path => read(path).replace(/^import .*$\n?/gm, '').replace(/^export (default )?/gm, '')).join('\n');
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const parser = bundle(['lib/params.js', 'lib/latex.js', 'lib/chat-source.js']);
const renderer = bundle(['lib/params.js', 'lib/latex.js', 'client/hinhmau.js', 'client/chat.js']);
const chatCss = read('client/chat.css');

const frameHead = `<!doctype html><html lang="vi"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap">
<style>html,body,#stage{width:100%;height:100%;margin:0}${chatCss}</style>
<div id="stage"></div>
<script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']]},startup:{typeset:false},options:{enableMenu:false}};</script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-chtml.js"></script>`;

function preview() {
  const source = document.querySelector('#source');
  const name = document.querySelector('#student');
  const status = document.querySelector('#status');
  const diagnostics = document.querySelector('#diagnostics');
  const viewport = document.querySelector('#viewport');
  const copy = document.querySelector('#copy');
  const restart = document.querySelector('#restart');
  const frame = document.querySelector('#phone');
  const key = 'ltt-xem-thu-baichat';
  let block = '', lastValid = null;

  try { source.value = localStorage.getItem(key) || ''; } catch { /* Có thể bật trang ở chế độ riêng tư. */ }

  function remember() {
    try { localStorage.setItem(key, source.value); } catch { /* Trang vẫn chạy khi bộ nhớ bị chặn. */ }
  }

  function start() {
    if (!lastValid) return;
    const parameters = JSON.stringify(lastValid).replace(/</g, '\\u003c');
    frame.srcdoc = FRAME_HEAD + '<script>' + CHAT_RENDERER +
      '\nconst run=' + parameters + ';\nrenderChatLesson(document.querySelector("#stage"),' +
      '{chat:run.chat,title:"Bài xem thử"},{studentName:run.name,persist:false});<' + '/script></html>';
    viewport.hidden = false;
  }

  function showDiagnostics(errors, warnings) {
    diagnostics.replaceChildren();
    const seen = new Set();
    for (const [className, entries] of [['error', errors], ['warning', warnings]]) {
      for (const item of entries) {
        const key = className + ':' + errorText(item);
        if (seen.has(key)) continue;
        seen.add(key);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = errorText(item);
        button.onclick = () => {
          const rows = source.value.split('\n');
          const start = rows.slice(0, item.line - 1).reduce((n, row) => n + row.length + 1, 0);
          source.focus();
          source.setSelectionRange(start, start + (rows[item.line - 1] || '').length);
          const style = getComputedStyle(source);
          source.scrollTop = Math.max(0, (item.line - 2) * parseFloat(style.lineHeight) - source.clientHeight * .2);
        };
        diagnostics.appendChild(button);
      }
    }
  }

  function run() {
    remember();
    const result = inspectChatSource(source.value);
    showDiagnostics(result.errors, result.warnings);
    if (!result.chat || result.errors.length) {
      block = '';
      lastValid = null;
      viewport.hidden = copy.disabled = restart.disabled = true;
      frame.removeAttribute('srcdoc');
      status.textContent = 'Sửa các lỗi trước khi chạy thử.';
      return;
    }
    block = result.block;
    lastValid = { chat: result.chat, name: name.value.trim() || 'An' };
    copy.disabled = restart.disabled = false;
    status.textContent = result.warnings.length ? 'Chạy thử được. Hãy xem các cảnh báo.' : 'Bản xem thử đã sẵn sàng.';
    start();
  }

  function changed() {
    remember();
    copy.disabled = true;
    lastValid = null;
    restart.disabled = true;
    if (source.value) status.textContent = 'Bấm Chạy thử để cập nhật.';
  }

  source.addEventListener('input', changed);
  name.addEventListener('input', () => {
    if (lastValid) lastValid.name = name.value.trim() || 'An';
  });
  document.querySelector('#run').onclick = run;
  restart.onclick = start;
  copy.onclick = async () => {
    if (!block || !lastValid) return;
    try {
      await navigator.clipboard.writeText(block);
      status.textContent = 'Đã sao chép khối baichat.';
    } catch {
      const buffer = document.createElement('textarea');
      buffer.value = block;
      buffer.setAttribute('aria-label', 'Khối baichat');
      buffer.style.position = 'fixed';
      buffer.style.left = '-9999px';
      document.body.appendChild(buffer);
      buffer.select();
      const ok = document.execCommand('copy');
      buffer.remove();
      copy.focus();
      status.textContent = ok ? 'Đã sao chép khối baichat.' : 'Trình duyệt chưa cho sao chép. Hãy sao chép trong ô LaTeX.';
    }
  };
  if (source.value) run();
}

const css = `
:root {color-scheme:light;background:#f5f3ed;color:#14323a;font:16px/1.45 system-ui,sans-serif}
* {box-sizing:border-box}
[hidden] {display:none!important}
body {margin:0}
main {max-width:1180px;margin:auto;padding:22px 16px}
h1 {font-size:clamp(25px,4vw,38px);line-height:1.1;margin:0 0 16px}
.layout {display:grid;grid-template-columns:minmax(0,1fr) minmax(0,390px);gap:22px;align-items:start}
section {min-width:0}
.editor {background:white;border:1px solid #ddd7c9;border-radius:16px;padding:16px}
label {font-weight:650;display:block;margin-bottom:5px}
textarea,input {background:#fffcf5;border:1px solid #aba68f;border-radius:10px;padding:9px;color:inherit}
textarea {width:100%;height:350px;resize:vertical;font:14px/21px ui-monospace,Consolas,monospace;tab-size:2}
input {width:min(100%,300px);font:inherit}
.controls {display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
button {border:1px solid #126d63;background:white;color:#126d63;border-radius:10px;font:600 15px/1.2 system-ui;min-height:42px;padding:7px 11px;cursor:pointer}
button:disabled {border-color:#a4aaa6;color:#6f746e;cursor:default}
#run {background:#087c6f;color:white}
#status {min-height:1.35em;margin:10px 0 0}
#diagnostics button {display:block;text-align:left;width:100%;margin-top:7px}
#diagnostics .error {background:#fdecee;color:#8a1f2d;border-color:#c66a7a}
#diagnostics .warning {background:#fff4cd;color:#654700;border-color:#dec585}
#phone {display:block;width:390px;max-width:100%;height:844px;border:0;box-shadow:0 0 0 1px #d6cdbb;border-radius:15px;background:#fffaf2}
:focus-visible {outline:3px solid #bb610a;outline-offset:2px}
@media(max-width:760px){.layout{grid-template-columns:1fr}#phone{margin:auto}}
`;

const html = `<!doctype html>
<!-- Sinh từ scripts/build-xem-thu.mjs và mã bài chat của app. -->
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Xem thử bài chat với Cherry</title><style>${css}</style></head>
<body><main><h1>Xem thử bài chat với Cherry</h1>
<div class="layout">
<section class="editor" aria-label="Soạn và kiểm tra bài">
<label for="source">LaTeX chủ đề hoặc khối baichat</label>
<textarea id="source" spellcheck="false"></textarea>
<label for="student">Tên học sinh</label><input id="student" type="text" value="An" maxlength="80" autocomplete="off">
<div class="controls"><button type="button" id="run">Chạy thử</button><button type="button" id="copy" disabled>Sao chép khối baichat</button><button type="button" id="restart" disabled>Làm lại từ đầu</button></div>
<p id="status" role="status"></p><div id="diagnostics" aria-label="Lỗi và cảnh báo"></div>
</section>
<section id="viewport" aria-label="Khung điện thoại 390 × 844" hidden>
<iframe id="phone" title="Bài chat với Cherry" sandbox="allow-scripts"></iframe>
</section></div></main>
<script>${parser}
const FRAME_HEAD=${json(frameHead)};
const CHAT_RENDERER=${json(renderer)};
(${preview.toString()})();
</script></body></html>
`;
const output = new URL('../xem-thu/', import.meta.url);
mkdirSync(output, { recursive: true });
writeFileSync(new URL('index.html', output), html, 'utf8');
console.log('Đã tạo xem-thu/index.html');
