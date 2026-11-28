import { parseGiaiMau, GIAIMAU } from '../lib/latex.js';

/* ---------- Chặng Tự luận: giải bài tự luận cùng Cherry kiểu chat (thầy duyệt 28/11/2026, bản thử 1) ----------
   Nội dung là khối \begin{giaimau} của chủ đề Bài mẫu (cú pháp ở lib/latex.js), thêm \huong, \goiy, \kiemtra sau mỗi \buocgiai.
   Mỗi bước: Cherry nêu mục tiêu và hướng → học sinh viết vào vở (bí thì xin gợi ý) → câu kiểm tra nhỏ (2 lần thử)
   → hiện dòng trình bày mẫu để so với vở. Hình ghim trên cùng (thu nhỏ/phóng to được), phần đang dùng tô cam.
   Sơ đồ đi lên trong giaimau được bỏ qua (thầy chọn không dùng). Công thức không cắt, không thu nhỏ.
   options: studentName, figImg(code)→html, typeset(node), start (số câu đã xong, để làm tiếp), firstTime (lần đầu làm trọn → có ⭐),
            onProgress(soCauXong, tongSoCau), onFinish({xp, first, n}), onClose(), sfx {tap, ok, no}, teacher */
const TL_PRAISE = ['Chuẩn luôn!', 'Đúng rồi!', 'Giỏi quá!', 'Chính xác!'];
const TL_CHECKS = ['Sau mỗi kết luận có ghi lý do (tính chất, định lí nào)', 'Điểm, đoạn vẽ thêm có câu “Gọi …” trước khi dùng', 'Điều kiện (nếu có) được ghi và đối chiếu', 'Cuối mỗi câu có câu kết luận “Vậy …”'];
const tlEsc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Chữ có công thức: thoát HTML ngoài công thức, giữ nguyên $…$, $$…$$, \[…\] cho MathJax; \\ xuống dòng; \textbf{…} in đậm
function tlText(value) {
  const src = String(value ?? '');
  const re = /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?:\\.|[^$\\])*\$|\\textbf\s*\{([^{}]*)\}|\\\\/g;
  let out = '', from = 0;
  for (const m of src.matchAll(re)) {
    out += tlEsc(src.slice(from, m.index));
    const t = m[0];
    if (t === '\\\\') out += '<br>';
    else if (m[1] !== undefined) out += '<b>' + tlText(m[1]) + '</b>';
    else if (t.startsWith('$$') || t.startsWith('\\[')) out += '<span class="tl-eq">' + tlEsc(t) + '</span>';
    else out += tlEsc(t);
    from = m.index + t.length;
  }
  return out + tlEsc(src.slice(from));
}
const tlLines = v => String(v ?? '').split(/\\\\/).map(s => s.trim()).filter(Boolean);
const tlPara = v => tlLines(v).map(l => `<p>${tlText(l)}</p>`).join('');
// Trộn phương án cố định theo nội dung câu hỏi (cùng câu luôn cùng thứ tự)
function tlShuffle(arr, seed) {
  let h = 2166136261; for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const a = arr.map((x, i) => ({ x, i })); for (let i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ i, 16777619); const j = (h >>> 0) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const tlNum = v => { const x = String(v).replace(/\s/g, '').replace(',', '.').replace(/^[a-zA-Z]+=/, ''); const f = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(x); return f ? Number(f[1]) / Number(f[2]) : x === '' ? NaN : Number(x); };
const tlSame = (a, b) => Number.isFinite(a) && Math.abs(a - b) < 1e-9;
export function tuLuanSource(raw) { const m = [...String(raw || '').matchAll(GIAIMAU)][0]; return m ? m[1] : ''; }
export function tuLuanInfo(raw) { const g = parseGiaiMau(tuLuanSource(raw)); return { cau: Math.max(1, g.items.filter(x => x.k === 'cau').length), steps: g.steps, errors: g.errors }; }

export function renderTuLuan(root, topic, options = {}) {
  const run = (root._tlRun = (root._tlRun || 0) + 1), alive = () => { if (root._tlRun !== run) throw 'tl-abort'; };
  const g = parseGiaiMau(tuLuanSource(topic.raw)), name = String(options.studentName || '').trim().split(/\s+/).at(-1) || 'cậu';
  const figOf = code => (code && options.figImg ? options.figImg(code) : '');
  const sfx = options.sfx || {};
  const avatar = typeof CHAT_AVATAR === 'string' ? CHAT_AVATAR : '';
  const cauItems = g.items.filter(x => x.k === 'cau'), nCau = Math.max(1, cauItems.length);
  const totStep = {}; { let c = 0; for (const it of g.items) { if (it.k === 'cau') c++; if (it.k === 'buocgiai') totStep[c] = (totStep[c] || 0) + 1; } }
  root.innerHTML = `<div class="tl">
    <div class="tl-top"><button type="button" class="tl-x" aria-label="Thoát">×</button><div class="tl-prog" aria-label="Tiến độ"><b></b></div><span class="tl-xp">⭐ 0</span><button type="button" class="tl-mini" data-de>Đề</button><button type="button" class="tl-mini" data-sol>Lời giải</button></div>
    <div class="tl-part">${tlEsc(topic.title || 'Bài tự luận')}</div>
    <div class="tl-body"><div class="tl-pin" hidden><div class="tl-pinbar"><span>Hình vẽ · phần đang dùng tô cam</span><span><button type="button" data-small>Thu nhỏ</button><button type="button" data-big>Phóng to</button></span></div><div class="tl-pinfig"></div></div>
    <div class="tl-feed" aria-live="polite"></div></div>
    <div class="tl-foot"></div></div>`;
  const $q = s => root.querySelector(s);
  const feed = $q('.tl-feed'), foot = $q('.tl-foot'), pin = $q('.tl-pin'), pinFig = $q('.tl-pinfig');
  let xp = 0, last = '', curFig = '', first = 0, nGuess = 0;
  const lines = [];
  const typeset = node => {
    if (options.typeset) return Promise.resolve(options.typeset(node)).then(scroll);
    const M = globalThis.MathJax;
    if (M && M.typesetPromise && (globalThis.__mjReady || M.startup?.document)) return M.typesetPromise([node]).then(scroll).catch(() => {});
    setTimeout(() => node.isConnected && typeset(node), 300);
  };
  const scroll = () => { feed.scrollTop = feed.scrollHeight; };
  const sleep = ms => new Promise(r => setTimeout(r, ms)).then(alive);
  const setXP = n => { xp = Math.max(0, xp + n); const e = $q('.tl-xp'); e.textContent = '⭐ ' + xp; if (n) { e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); } };
  function turn(who) {
    const d = document.createElement('div');
    if (who === 'me') { d.className = 'tl-me-row'; feed.appendChild(d); last = 'me'; return d; }
    const cont = last === 'c'; d.className = 'tl-turn'; d.innerHTML = (cont ? '<span></span>' : avatar) + '<div class="tl-col"></div>';
    feed.appendChild(d); last = 'c'; return d.querySelector('.tl-col');
  }
  async function cherry(html, cls = '') {
    const col = turn('c'), b = document.createElement('div'); b.className = 'tl-bub'; b.innerHTML = '<div class="tl-dots"><i></i><i></i><i></i></div>';
    col.appendChild(b); scroll();
    await sleep(Math.min(850, 280 + html.replace(/<[^>]+>|\$[^$]*\$/g, 'xx').length * 4));
    b.className = 'tl-bub ' + cls; b.innerHTML = html; typeset(b); scroll(); return b;
  }
  function block(html) { const col = turn('c'), d = document.createElement('div'); d.innerHTML = html; col.appendChild(d); typeset(d); scroll(); return d; }
  function me(html) { const r = turn('me'); r.innerHTML = `<div class="tl-me">${html}</div>`; typeset(r); scroll(); }
  function divider(t) { const d = document.createElement('div'); d.className = 'tl-div'; d.innerHTML = `<span>${t}</span>`; feed.appendChild(d); last = ''; }
  function buttons(list) {
    return new Promise(res => {
      foot.innerHTML = '';
      list.forEach((b, k) => { const e = document.createElement('button'); e.type = 'button'; e.className = 'tl-go' + (b.alt ? ' alt' : ''); e.innerHTML = b.t;
        e.onclick = () => { if (root._tlRun !== run) return; sfx.tap?.(); foot.innerHTML = ''; res(k); }; foot.appendChild(e); });
    });
  }
  function askMC(opts, dis) {
    return new Promise(res => {
      let pick = null; const col = turn('c'), box = document.createElement('div'); box.className = 'tl-opts';
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'tl-go'; btn.textContent = 'Kiểm tra'; btn.disabled = true;
      opts.forEach(({ x, i }) => { const e = document.createElement('button'); e.type = 'button'; e.className = 'tl-opt'; e.innerHTML = tlText(x.t); e.dataset.i = i;
        if (dis.has(i)) { e.disabled = true; e.classList.add('off'); }
        e.onclick = () => { if (box.dataset.done) return; box.querySelectorAll('.tl-opt').forEach(y => y.classList.toggle('sel', y === e)); pick = i; btn.disabled = false; };
        box.appendChild(e); });
      col.appendChild(box); typeset(box); scroll(); foot.innerHTML = '';
      btn.onclick = () => { if (root._tlRun !== run || pick == null) return; box.dataset.done = 1; box.querySelectorAll('.tl-opt').forEach(y => { y.disabled = true; });
        foot.innerHTML = ''; res({ i: pick, el: box.querySelector(`[data-i="${pick}"]`) }); };
      foot.appendChild(btn);
    });
  }
  function askNum() {
    return new Promise(res => {
      const col = turn('c'), w = document.createElement('div'); w.className = 'tl-num';
      w.innerHTML = '<input inputmode="decimal" autocomplete="off" placeholder="Nhập đáp số, ví dụ 3/2" aria-label="Đáp số">'; col.appendChild(w); scroll();
      const inp = w.querySelector('input'), btn = document.createElement('button'); btn.type = 'button'; btn.className = 'tl-go'; btn.textContent = 'Kiểm tra'; btn.disabled = true; foot.innerHTML = '';
      inp.oninput = () => { btn.disabled = !inp.value.trim(); };
      const go = () => { if (root._tlRun !== run || !inp.value.trim()) return; inp.disabled = true; foot.innerHTML = ''; res({ raw: inp.value.trim(), v: tlNum(inp.value) }); };
      btn.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); }; foot.appendChild(btn);
      setTimeout(() => inp.focus({ preventScroll: true }), 60);
    });
  }
  // Câu hỏi (đoán hướng hoặc kiểm tra bước): 2 lần thử, sai thì giải thích theo đúng đáp án đã chọn
  async function check(c, gain, label = '') {
    await cherry(label + tlText(c.q), 'q');
    const dis = new Set(), order = c.type === 'mc' ? tlShuffle(c.opts, c.q) : null;
    for (let a = 0; a < 2; a++) {
      if (c.type === 'mc') {
        const r = await askMC(order, dis), o = c.opts[r.i]; me(tlText(o.t));
        if (o.ok) { r.el.classList.add('ok'); sfx.ok?.(); setXP(gain[a]); await cherry(`✔ ${TL_PRAISE[(xp >> 1) % 4]} ${tlText(o.ex)}`, 'ok'); return a === 0; }
        r.el.classList.add('no'); sfx.no?.(); dis.add(r.i); await cherry('✘ ' + tlText(o.ex), 'no');
      } else {
        const r = await askNum(); me(tlEsc(r.raw));
        if (tlSame(r.v, c.ans)) { sfx.ok?.(); setXP(gain[a]); await cherry(`✔ ${TL_PRAISE[(xp >> 1) % 4]} ${tlText(c.ex)}`, 'ok'); return a === 0; }
        sfx.no?.(); const w = c.wrong.find(x => tlSame(r.v, x.v));
        await cherry('✘ ' + (w ? tlText(w.ex) : 'Chưa đúng. Cậu xem lại bước này trong vở nhé.'), 'no');
      }
      if (a === 0) await cherry('Cậu thử lại một lần nữa nhé.');
    }
    if (c.type === 'mc') { const r = c.opts.find(o => o.ok); await cherry(`Đáp án đúng là: ${tlText(r.t)}. ${tlText(r.ex)}`); }
    else await cherry(`Đáp án đúng là ${tlText(c.ansText)}. ${tlText(c.ex)}`);
    return false;
  }
  function setFig(code) {
    if (!g.tikz || !code || code === curFig) return; curFig = code; pinFig.innerHTML = figOf(code);
    if (!pin.hidden) { pin.classList.remove('flash'); void pin.offsetWidth; pin.classList.add('flash'); }
  }
  const solCard = (body, why) => `<div class="tl-sol"><span class="tl-lb">✍️ Trình bày trong vở</span>${tlPara(body)}${why ? `<details><summary>Vì sao?</summary><p>${tlText(why)}</p></details>` : ''}</div>`;
  function sheetSol() {
    if (!lines.length) return '<p>Chưa có bước nào.</p>';
    let h = '', cur = null; for (const l of lines) { if (l.cau !== cur) { cur = l.cau; if (cur) h += `<h4>${tlText(cur)}</h4>`; } h += tlPara(l.body); } return `<div class="tl-sheetsol">${h}</div>`;
  }
  function sheet(title, html) {
    const s = document.createElement('div'); s.className = 'tl-sheet'; s.innerHTML = `<div><button type="button" class="tl-close" aria-label="Đóng">×</button><h3>${title}</h3>${html}</div>`;
    s.onclick = e => { if (e.target === s || e.target.closest('.tl-close')) s.remove(); }; root.querySelector('.tl').appendChild(s); typeset(s);
  }
  $q('.tl-x').onclick = () => { root._tlRun++; options.onClose?.(); };
  $q('[data-de]').onclick = () => sheet('Đề bài', `<div>${tlText(g.de)}</div>${g.full ? `<div class="tl-figcard">${figOf(g.full)}</div>` : ''}`);
  $q('[data-sol]').onclick = () => sheet('Tờ lời giải', sheetSol());
  $q('[data-small]').onclick = e => { const s = pin.classList.toggle('small'); e.target.textContent = s ? 'Phóng vừa' : 'Thu nhỏ'; };
  $q('[data-big]').onclick = () => { const d = document.createElement('div'); d.className = 'tl-big'; d.innerHTML = `<button type="button" class="tl-close" aria-label="Đóng">×</button>${figOf(curFig)}`;
    d.querySelector('.tl-close').onclick = () => d.remove(); root.querySelector('.tl').appendChild(d); };

  async function play(start) {
    const bar = $q('.tl-prog b');
    await cherry(`Chào ${tlEsc(name)}! Hôm nay tụi mình giải bài này cùng nhau nhé. Cậu đọc kỹ đề trước đã.`);
    block(`<div class="tl-card"><span class="tl-kind">Đề bài</span><div>${tlText(g.de)}</div></div>`);
    if (g.full) block(`<div class="tl-figcard">${figOf(g.full)}</div>`);
    if (start > 0 && start < nCau) {
      await cherry(`Lần trước cậu đã làm xong ${start}/${nCau} câu. Mình làm tiếp nhé?`);
      if (await buttons([{ t: `Làm tiếp ${tlEsc(cauItems[start]?.title || '')}` }, { t: 'Làm lại từ đầu', alt: 1 }])) start = 0;
      me(start ? 'Làm tiếp thôi!' : 'Làm lại từ đầu!');
    } else {
      start = 0;
      await cherry('Mỗi bước, tớ nêu hướng làm, cậu <b>viết vào vở</b>, rồi tớ hỏi một câu nhỏ để kiểm tra. Bí thì bấm “Tớ bí rồi” nhé.');
      await buttons([{ t: 'Tớ đọc đề xong rồi' }]); me('Tớ đọc đề xong rồi!');
    }
    let c = 0, cauName = '', no = 0;
    for (let i = 0; i < g.items.length; i++) {
      const it = g.items[i]; bar.style.width = (i / g.items.length * 100) + '%';
      if (it.k === 'cau') { if (c > 0 && c > start) options.onProgress?.(c, nCau); c++; cauName = it.title; no = 0; }
      if (c - 1 < start && cauItems.length) { if (it.k === 'buocgiai') lines.push({ cau: cauName, body: it.body }); continue; } // câu đã xong lần trước
      if (it.k === 'cau') {
        divider(tlText(it.title)); $q('.tl-part').innerHTML = tlEsc(topic.title || '') + ' · ' + tlText(it.title); typeset($q('.tl-part'));
        setFig(it.frame);
        if (g.tikz && pin.hidden) { pin.hidden = false; await cherry('Tớ ghim hình lên trên cùng rồi. Đến bước nào, phần đang dùng sẽ sáng màu cam. Cần chỗ đọc rộng hơn thì bấm “Thu nhỏ”.'); }
        await cherry(`<b>${tlText(it.title)}.</b> ${tlText(it.body)}`); await sleep(200);
      } else if (it.k === 'doan') {
        setFig(it.frame); nGuess++;
        if (await check({ type: 'mc', q: it.q, opts: it.opts }, [5, 2], '🤔 <b>Đoán thử:</b> ')) first++;
      } else if (it.k === 'nhanxet') {
        await cherry(`<b>Nhận xét.</b> ${tlPara(it.body)}`);
      } else if (it.k === 'buocgiai') {
        no++; setFig(it.frame);
        if (g.tikz && pin.hidden) pin.hidden = false;
        await cherry(`<span class="tl-step">Bước ${no}${totStep[c] ? '/' + totStep[c] : ''}</span><br><b>${tlText(it.goal)}</b>${it.lead ? `<p>${tlText(it.lead)}</p>` : ''}`);
        await cherry('Cậu viết bước này vào vở nhé. Xong thì bấm <b>Tớ viết xong</b>.');
        const ladder = it.hints && it.hints.length ? it.hints : (it.why ? [it.why] : []);
        let h = 0, shown = false;
        for (;;) {
          const opts = [{ t: 'Tớ viết xong ✍️' }];
          if (h < ladder.length) opts.push({ t: h ? 'Vẫn bí · −2⭐' : 'Tớ bí rồi · −2⭐', alt: 1 }); else opts.push({ t: 'Cho tớ xem bước này', alt: 1 });
          const k = await buttons(opts);
          if (k === 0) { me('Tớ viết xong rồi!'); break; }
          if (h >= ladder.length) { me('Cho tớ xem bước này'); shown = true; break; }
          me(h ? 'Vẫn bí…' : 'Tớ bí rồi…'); setXP(-2);
          await cherry(`💡 <b>Gợi ý ${h + 1}:</b> ${tlText(ladder[h])}`, 'hint'); h++;
        }
        lines.push({ cau: cauName, body: it.body });
        if (shown) {
          await cherry('Không sao, bước này trình bày thế này nhé. Cậu chép vào vở rồi đọc lại xem vì sao lại viết như vậy:');
          block(solCard(it.body, it.why)); await buttons([{ t: 'Tớ chép xong rồi' }]); me('Tớ chép xong rồi!'); continue;
        }
        if (it.check) await check(it.check, [10, 4]);
        else { setXP(3); await cherry('Bước này không có câu hỏi, cậu được +3⭐ vì đã tự viết.'); }
        await cherry('Cậu so vở của mình với cách trình bày này nhé:');
        block(solCard(it.body, it.why)); await buttons([{ t: 'Tiếp tục' }]);
      }
    }
    bar.style.width = '100%'; divider('Hoàn thành'); if (g.full) setFig(g.full);
    const firstTime = options.firstTime !== false && !options.teacher;
    options.onProgress?.(nCau, nCau);
    options.onFinish?.({ xp: firstTime ? xp : 0, first, n: nGuess });
    await cherry(firstTime ? `Xong cả bài rồi, ${tlEsc(name)}! Cậu được <b>⭐ ${xp}</b>.` : `Xong cả bài rồi, ${tlEsc(name)}! Bài này cậu đã làm trọn trước đây nên lần này không cộng thêm ⭐ nhé.`);
    await cherry('Đây là lời giải hoàn chỉnh, cậu so từng dòng với vở nhé:');
    block(`<div class="tl-card"><span class="tl-kind">Lời giải</span>${sheetSol()}</div>`);
    await cherry('Trước khi gấp vở, cậu tự kiểm lại theo danh sách này:');
    block(`<div class="tl-card"><span class="tl-kind">Tự kiểm vở</span><ul class="tl-ticks">${TL_CHECKS.map(x => `<li><label><input type="checkbox">${tlEsc(x)}</label></li>`).join('')}</ul></div>`);
    const k = await buttons([{ t: options.doneLabel || 'Về chặng Tự luận' }, { t: 'Làm lại từ đầu', alt: 1 }]);
    if (k === 0) { root._tlRun++; options.onClose?.(); } else renderTuLuan(root, topic, { ...options, start: 0, firstTime: false });
  }
  play(Math.max(0, Math.min(Number(options.start) || 0, nCau))).catch(e => { if (e !== 'tl-abort') console.error(e); });
  return { dispose() { root._tlRun++; } };
}
