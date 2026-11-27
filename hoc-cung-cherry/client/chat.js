import { parseHinhBuoc } from '../lib/latex.js';
import { can, catTuyen, dangThuc } from './hinhmau.js';

const CHAT_AVATAR=`<svg class="chat-avatar" viewBox="0 0 60 70" aria-hidden="true"><ellipse cx="30" cy="66" rx="16" ry="3" fill="#0001"/><path d="M14 64c0-12 7-18 16-18s16 6 16 18z" fill="#e8455a"/><circle cx="24" cy="54" r="1.6" fill="#fff"/><circle cx="35" cy="58" r="1.6" fill="#fff"/><circle cx="30" cy="34" r="15" fill="#ffe1cc"/><path d="M15 36c0-10 6-17 15-17s15 7 15 17c-3-5-8-7-15-7s-12 2-15 7z" fill="#7a3b1f"/><path d="M12 27c2-11 9-17 18-17s16 6 18 17c-5-4-11-5-18-5s-13 1-18 5z" fill="#e8455a"/><circle cx="22" cy="18" r="1.6" fill="#fff"/><circle cx="36" cy="16" r="1.6" fill="#fff"/><path d="M30 10c2-4 6-6 10-6" stroke="#2f8a3c" stroke-width="2" fill="none"/><path d="M38 4c3 0 5 2 6 4-3 1-5 0-6-4z" fill="#3fae4f"/><circle cx="46" cy="28" r="4" fill="#c81f3a"/><circle cx="25" cy="36" r="2.2" fill="#2a1a12"/><circle cx="35" cy="36" r="2.2" fill="#2a1a12"/><circle cx="21" cy="41" r="2.4" fill="#ffb3b8"/><circle cx="39" cy="41" r="2.4" fill="#ffb3b8"/><path d="M27 42q3 3 6 0" stroke="#a33" stroke-width="1.5" fill="none"/></svg>`;

const CHAT_LABELS = {
  dinhnghia: 'Định nghĩa', quytac: 'Quy tắc', congthuc: 'Công thức', dinhly: 'Định lý',
  tinhchat: 'Tính chất', nhanxet: 'Nhận xét', luuy: 'Lưu ý', vidu: 'Ví dụ',
};
const CHAT_ECHO = ['Tớ hiểu rồi', 'Tiếp đi Cherry', 'Tớ sẵn sàng rồi', 'Được, tiếp nào'];
const CHAT_FIGURES = { can, 'dang-thuc': dangThuc, 'cat-tuyen': catTuyen };
const CHAT_TIKZ = /\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g;
const chatEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

function chatHinhBuoc(figure) {
  return figure?.kind === 'hinhbuoc' ? parseHinhBuoc(figure.src) : null;
}

function chatExampleSteps(value) {
  const tokens = String(value || '').match(/\\\[[\s\S]*?\\\]|\$(?:\\.|[^$\\])*\$|\\\\|\\.|[^\\$]+|[$\\]/g) || [];
  const lines = [''];
  for (const token of tokens) {
    if (token === '\\\\') lines.push('');
    else lines[lines.length - 1] += token;
  }
  return lines.map(line => line.trim()).filter(Boolean);
}

function chatPlan(chat) {
  const lastPart = chat.parts.length + 1;
  const parts = [{ title: 'Mở đầu' }, ...chat.parts, { title: 'Kết bài' }];
  const screens = [];
  if (chat.modau) screens.push({ ...chat.modau, p: 0, type: 'opening', figure: chat.modau.fig });
  screens.push({ p: 0, type: 'contents' });
  for (const [index, part] of chat.parts.entries()) {
    part.screens.forEach((screen, i) => {
      const { type, fig, state, after, toggle, stepStates, calc } = screen;
      const useShared = !i || state || after || toggle || stepStates ||
        ['tap', 'region', 'act', 'slide', 'steps'].includes(type) || calc?.items.some(item => item.state || item.after);
      const figure = fig || (useShared ? part.fig : null);
      screens.push({ ...screen, p: index + 1, figure,
        steps: type === 'vidu' ? chatExampleSteps(screen.sol) : null,
        frames: chatHinhBuoc(figure),
      });
    });
    screens.push({ p: index + 1, type: 'recap' });
  }
  if (chat.ketbai) {
    const { fig, ...closing } = chat.ketbai;
    screens.push({ ...closing, p: lastPart, type: 'closing', figure: fig });
  } else {
    screens.push({ p: lastPart, type: 'closing' });
  }
  for (const sc of screens) {
    if (sc.type === 'opening') sc.frames = chatHinhBuoc(sc.figure);
  }
  return { parts, screens };
}

function chatMerge(base, change) {
  if (!change) return base;
  return { ...base, ...change, to: { ...base.to, ...change.to }, do: { ...base.do, ...change.do } };
}

function chatFigureState(sc, state) {
  let result = { ...sc.state };
  if (sc.toggle && Number.isInteger(state.toggle)) result = chatMerge(result, sc.toggle[state.toggle]?.state);
  if (sc.type === 'vidu') {
    for (const step of (sc.stepStates || []).slice(0, state.steps || 1)) result = chatMerge(result, step);
  }
  if (sc.type === 'act') {
    for (const act of sc.acts.slice(0, state.steps || 0)) result = chatMerge(result, act.state);
  }
  if (sc.type === 'calc') {
    for (const item of sc.calc.items.slice(0, state.steps || 0)) result = chatMerge(chatMerge(result, item.state), item.after);
  }
  if (state.hit) {
    const color = state.correct ? 'luc' : 'do';
    result = sc.type === 'tap' ? chatMerge(result, { to: { [state.hit]: color } }) :
      { ...result, vung: state.hit };
  }
  if (state.correct) result = chatMerge(result, sc.after);
  if (sc.type === 'steps' || sc.type === 'opening' && sc.nutbuoc) result.buoc = state.steps || 1;
  return result;
}

function chatOrder(length) {
  const items = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function chatStorage(topic, options) {
  const key = topic.id && options.persist !== false && !options.teacher ? 'ltt-chat:' + topic.id : '';
  const scope = 'account:' + (options.progressScope || '');
  let fingerprint = 0;
  for (const c of JSON.stringify(topic.chat)) fingerprint = (Math.imul(fingerprint, 31) + c.codePointAt(0)) | 0;
  function readAll() {
    return JSON.parse(localStorage.getItem(key) || '{}') || {};
  }
  return {
    read() {
      if (!key) return null;
      try {
        const saved = readAll()[scope];
        return saved?.fingerprint === fingerprint && Array.isArray(saved.visits) ? saved : null;
      } catch { return null; }
    },
    write(data) {
      if (!key) return;
      try {
        const saved = readAll();
        if (data) saved[scope] = { ...data, fingerprint };
        else delete saved[scope];
        if (Object.keys(saved).length) localStorage.setItem(key, JSON.stringify(saved));
        else localStorage.removeItem(key);
      } catch { /* Việc học vẫn hoạt động khi trình duyệt chặn bộ nhớ. */ }
    },
  };
}

export function renderChatLesson(root, topic, options = {}) {
  if (!topic.chat) return;
  const { parts, screens } = chatPlan(topic.chat);
  const lastPart = parts.length - 1;
  const name = String(options.studentName || '').trim().split(/\s+/).at(-1);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storage = chatStorage(topic, options);
  const saved = storage.read();
  let visits = saved?.visits.slice(0, screens.length) || [];
  let complete = Boolean(saved?.complete && visits.length === screens.length);
  let busy = false, focusedPart = 0, seenOptions = 0, toastTimer;
  const anchors = new Map(), rows = [];
  const title = options.title || topic.title || 'Chat với Cherry';
  const praise = ['Giỏi quá, \\ten!', 'Chuẩn luôn!', 'Cậu nhanh thật!', 'Chính xác!'];
  const partLabel = p => p === 0 || p === lastPart ? parts[p].title :
    'Phần ' + p + '/' + (lastPart - 1) + ' · ' + parts[p].title;
  const typeset = node => {
    if (options.typeset) options.typeset(node);
    else {
      const math = globalThis.MathJax;
      math?.startup?.promise?.then(() => node.isConnected && math.typesetPromise([node])).catch(() => {});
    }
  };
  const clearMath = node => globalThis.MathJax?.typesetClear?.([node]);
  const placeholder = () => '<div class="chat-placeholder">' +
    chatEscape(options.figurePlaceholder || 'Hình TikZ, sẽ hiện sau khi nạp lên app') + '</div>';
  const staticFigure = source => options.renderTikz?.(source) || placeholder();

  function text(value) {
    const source = String(value ?? '').replace(/\\ten\b/g, () => name || 'cậu');
    const tokens = /\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\)|\$(?:\\.|[^$\\])*\$|\\textbf\s*\{([^{}]*)\}|\\\\/g;
    let result = '', from = 0;
    for (const match of source.matchAll(tokens)) {
      const token = match[0];
      result += chatEscape(source.slice(from, match.index));
      if (token.startsWith('\\begin{tikzpicture}')) result += '<div class="chat-figure">' + staticFigure(token) + '</div>';
      else if (token.startsWith('\\[') || token.startsWith('$$')) result += '<div class="chat-math">' + chatEscape(token) + '</div>';
      else if (match[1] !== undefined) result += '<strong>' + text(match[1]) + '</strong>';
      else if (token === '\\\\') result += '<br>';
      else result += chatEscape(token);
      from = match.index + token.length;
    }
    return result + chatEscape(source.slice(from));
  }

  const bubble = (value, question = false) => `<div class="chat-bubble${question ? ' chat-question' : ''}">${text(value)}</div>`;
  const answer = value => `<div class="chat-answer">${text(value)}</div>`;
  const tag = (label, kind = '') => `<span class="chat-label" data-kind="${kind}">${chatEscape(label)}</span>`;
  const feedback = (value, style = '') => `<div class="chat-feedback"${style ? ' data-' + style : ''} role="status">${text(value)}</div>`;
  const action = (id, label, disabled = false) => `<button type="button" class="chat-action" data-${id}${disabled ? ' disabled' : ''}>${text(label)}</button>`;
  const activeScreen = () => screens[visits.length - 1];
  const setTitle = p => { focusedPart = p; current.textContent = partLabel(p); };
  const save = () => storage.write({ visits, complete });
  const scroll = (node, animation = true) => {
    if (!node) return;
    const top = node.getBoundingClientRect().top - feed.getBoundingClientRect().top + feed.scrollTop - 9;
    feed.scrollTo({ top: Math.max(0, top), behavior: animation && !reduced ? 'smooth' : 'instant' });
  };

  function figureHTML(sc, state, live = false) {
    const figure = sc.figure;
    if (!figure) return '';
    const view = chatFigureState(sc, state);
    const renderer = CHAT_FIGURES[figure.mau?.name];
    let html;
    if (renderer) {
      html = renderer(figure.mau.params, view, {
        tap: live && sc.type === 'tap' && !state.correct,
        region: live && sc.type === 'region' && !state.correct,
        slide: sc.type === 'slide' && (state.correct ? 'to' : true),
      });
    } else if (sc.frames) {
      const frame = sc.frames.frames[Math.max(0, Math.min(sc.frames.frames.length, view.buoc || 1) - 1)];
      html = frame ? staticFigure(frame) : placeholder();
    } else html = staticFigure(figure.src);
    return html ? `<div class="chat-figure">${html}</div>` : '';
  }

  function quizHTML(quiz, state, live, index, isCalc = false) {
    if (!quiz) return '';
    const id = 'q' + index;
    const attempts = state[id] || [];
    const order = state['order' + index] || (state['order' + index] = chatOrder(quiz.opts.length));
    const last = quiz.opts[attempts.at(-1)];
    const locked = attempts.includes(order.find(i => quiz.opts[i]?.ok));
    let content = bubble(quiz.q, true);
    if (last) {
      const intro = last.ok && state['praise' + index] ? state['praise' + index] + ' ' : '';
      const why = last.why.replace(/^(Đúng rồi|Đúng hướng|Chính xác|Chuẩn|Đúng)[!.:]?\s+/u, '');
      content += answer(last.text) + feedback(last.ok ? intro + why : last.why + ' Cậu thử lại nhé.', last.ok ? '' : 'wrong');
    }
    if (live && !locked) {
      for (const i of order) {
        const wrong = attempts.includes(i);
        const disabled = state.waiting || (wrong && !isCalc);
        content += `<button class="chat-choice" type="button" data-option="${index},${i}"${wrong ? ' data-wrong' : ''}${disabled ? ' disabled' : ''}>${text(quiz.opts[i].text)}</button>`;
      }
    }
    return content;
  }

  function knowledgeHTML(sc, count) {
    const label = tag(CHAT_LABELS[sc.kind || sc.type] || 'Kiến thức', sc.kind || sc.type);
    let body = sc.body || '';
    if (sc.steps?.length) body = body.replace(CHAT_TIKZ, '');
    const title = sc.title ? '<h2>' + text(sc.title) + '</h2>' : '';
    const steps = sc.steps?.length ? '<ol class="chat-steps">' +
      sc.steps.slice(0, count).map(line => '<li>' + text(line) + '</li>').join('') + '</ol>' : '';
    return `<div class="chat-knowledge">${label}${title}<div>${text(body)}</div>${steps}</div>`;
  }

  function blockHTML(sc, state, live) {
    let html = sc.cherry ? bubble(sc.cherry) : '';
    html += figureHTML(sc, state, live);
    if (sc.type === 'opening') {
      html += bubble(sc.cauhoi, true) + bubble('Học xong bài này, cậu sẽ tự trả lời được.');
      if (sc.nutbuoc && sc.frames?.caps.length) {
        if (state.steps > 1) html += bubble(sc.frames.caps[state.steps - 1]);
        if (live && state.steps !== sc.frames.caps.length) html += action('frame', sc.nutbuoc);
      }
    }
    if (sc.type === 'contents') {
      html += bubble('Bài học hôm nay', true) + '<div class="chat-knowledge"><ol>' +
        parts.slice(1, -1).map(part => '<li>' + text(part.title) + '</li>').join('') + '</ol></div>';
    }
    if (['read', 'vidu'].includes(sc.type)) {
      const count = state.steps || 1;
      html += knowledgeHTML(sc, count);
      if (live && count < (sc.steps?.length || 0)) html += action('step', 'Bước tiếp');
    }
    if (sc.type === 'tap' || sc.type === 'region') {
      const prompt = sc.tap || sc.region;
      html += bubble(prompt.prompt, true);
      if (state.correct) html += feedback(prompt.ok);
      else if (state.hit) html += feedback(prompt.nhac?.[state.hit] || prompt.hint || 'Nhìn lại hình rồi chạm lần nữa nhé.', 'wrong');
    }
    if (sc.type === 'quiz' || sc.type === 'closing') {
      if (sc.quiz) html += tag(sc.label || 'Thử ngay') + quizHTML(sc.quiz, state, live, 0);
      if (sc.emdahoc?.length && (!sc.quiz || state.correct)) {
        html += '<div class="chat-knowledge"><h2>Cậu đã học</h2><ul>' +
          sc.emdahoc.map(item => '<li>' + text(item) + '</li>').join('') + '</ul></div>';
      }
    }
    if (sc.type === 'calc') {
      html += tag('Cậu tính');
      const count = state.steps || 0;
      for (const [index, quiz] of sc.calc.items.entries()) {
        if (index > count) break;
        html += quizHTML(quiz, state, live && index === count, index, true);
      }
      if (count === sc.calc.items.length && sc.calc.ketluan) html += feedback(sc.calc.ketluan);
    }
    if (sc.type === 'act') {
      const count = state.steps || 0;
      for (const act of sc.acts.slice(0, count)) html += answer(act.label) + feedback(act.say, act.warn ? 'warn' : '');
      if (live && sc.acts[count]) html += action('step', sc.acts[count].label);
    }
    if (sc.type === 'steps' && sc.frames) {
      const index = (state.steps || 1) - 1;
      html += tag('Hình từng bước') + bubble('Bước ' + (index + 1) + '/' + sc.frames.caps.length + '. ' + sc.frames.caps[index]);
      if (live && index) html += action('back-frame', 'Bước trước');
      if (live && index + 1 < sc.frames.caps.length) html += action('frame', 'Bước sau');
    }
    if (sc.type === 'slide') {
      html += state.correct ? feedback(sc.slide.after) : live ? action('slide', sc.slide.label, state.waiting) : '';
    }
    if (sc.toggle) {
      sc.toggle.forEach((choice, i) => {
        if (live) html += `<button class="chat-action" type="button" data-toggle="${i}" aria-pressed="${state.toggle === i}">${text(choice.label)}</button>`;
      });
    }
    if (sc.type === 'recap') {
      html += bubble('Xong phần ' + sc.p + ' rồi, ' + (name || 'cậu') + '! Cậu thấy phần này thế nào?', true);
      if (state.recap) html += answer('Hơi rối, nhắc lại giúp tớ') + bubble(parts[sc.p].recap || 'Mở Tóm tắt để xem các ý chính nhé.');
    }
    if (sc.type === 'lab') html += options.renderLab?.(sc) || '';
    if (sc.type === 'giaimau') {
      const clean = sc.body.replace(/\\(?:begin|end)\{giaimau\}/g, '').replace(CHAT_TIKZ, '');
      const prompt = clean.match(/\\de\s*\{([^{}]*)\}/)?.[1];
      if (prompt) html += bubble(prompt);
    }
    if (state.echo) html += answer(state.echo);
    return html;
  }

  const turn = html => `<div class="chat-turn">${CHAT_AVATAR}<div class="chat-col">${html}</div></div>`;
  root.innerHTML = `<div class="cherry-chat" role="region" aria-label="${chatEscape(title)}">
    <div class="chat-top">
      ${options.onClose ? '<button class="chat-close" type="button" data-close aria-label="Đóng lý thuyết">×</button>' : ''}
      <div class="chat-progress" role="progressbar" aria-label="Tiến độ bài học" aria-valuemin="0" aria-valuemax="100"><b></b></div>
      <button type="button" data-summary>Tóm tắt</button>
      <button type="button" data-toc>Mục lục</button>
      ${options.teacherEdit ? '<button type="button" data-edit>Sửa</button>' : ''}
      ${options.onOldVersion ? '<button type="button" data-old-version>Bản cũ</button>' : ''}
    </div>
    <div class="chat-current"></div>
    <div class="chat-finished" hidden>Cậu đã học xong <button type="button" data-summary>Xem tóm tắt</button><button type="button" data-reset>Học lại từ đầu</button></div>
    <div class="chat-feed"><div class="chat-stream" role="log" aria-label="Trò chuyện với Cherry"></div></div>
    <button type="button" class="chat-pip" aria-label="Cuộn về hình" hidden></button>
    <div class="chat-dock"><button class="chat-recap-button" type="button" data-recap hidden>Hơi rối, nhắc lại</button><button type="button" data-next>Tiếp tục</button></div>
    <dialog class="chat-pane chat-toc-pane" aria-label="Mục lục"></dialog>
    <dialog class="chat-pane chat-summary-pane" aria-label="Tóm tắt"></dialog>
    <div class="chat-toast" role="status" hidden></div>
  </div>`;
  const shell = root.firstElementChild;
  const $ = selector => shell.querySelector(selector);
  const feed = $('.chat-feed'), stream = $('.chat-stream'), current = $('.chat-current');
  const next = $('[data-next]'), recap = $('[data-recap]'), pip = $('.chat-pip');
  const toc = $('.chat-toc-pane'), summary = $('.chat-summary-pane'), toast = $('.chat-toast');
  const finished = $('.chat-finished'), progress = $('.chat-progress');
  let pipFigure = null;

  function ready(sc, state) {
    if (sc.quiz || ['tap', 'region', 'slide'].includes(sc.type)) return !!state.correct;
    if (sc.type === 'calc') return state.steps === sc.calc.items.length;
    if (sc.type === 'act') return state.steps === sc.acts.length;
    if (sc.type === 'vidu') return (state.steps || 1) >= sc.steps.length;
    if (sc.type === 'steps' && sc.frames) return (state.steps || 1) === sc.frames.caps.length || state.viewedFrames;
    if (sc.type === 'opening' && sc.nutbuoc && sc.frames) return state.steps === sc.frames.caps.length;
    if (sc.toggle) return state.toggles?.length === sc.toggle.length;
    return true;
  }

  function dock() {
    const sc = activeScreen(), state = visits.at(-1);
    if (!sc) return;
    const enabled = ready(sc, state);
    next.disabled = busy || !enabled;
    recap.hidden = busy || sc.type !== 'recap' || Boolean(state.recap);
    const hints = {
      quiz: 'Chọn một đáp án', closing: 'Chọn một đáp án', tap: 'Chạm vào hình',
      region: 'Chạm vào hình', calc: 'Trả lời để tiếp tục', steps: 'Xem hết các bước',
      vidu: 'Xem hết lời giải', act: 'Làm từng thao tác', slide: 'Thử di chuyển hình',
      opening: 'Khám phá hình',
    };
    const endsPart = screens[visits.length]?.type === 'recap';
    next.textContent = busy ? 'Cherry đang soạn…' : !enabled ? (hints[sc.type] || 'Khám phá hình') :
      sc.type === 'closing' ? (options.finish ? 'Vào làm bài' : 'Xong bài') :
      sc.type === 'recap' && !state.recap ? 'Tớ hiểu rồi' : endsPart ? 'Xong phần ' + sc.p : 'Tiếp tục';
    const completion = complete ? 100 : Math.round((visits.length - 1 + Number(enabled)) / screens.length * 100);
    progress.setAttribute('aria-valuenow', String(completion));
    progress.firstElementChild.style.width = completion + '%';
    finished.hidden = !complete;
  }

  function updatePip() {
    const figure = rows.at(-1)?.querySelector('.chat-figure');
    const above = figure && figure.getBoundingClientRect().bottom < feed.getBoundingClientRect().top + 5;
    pip.hidden = !above;
    if (!above || figure === pipFigure) return;
    pipFigure = figure;
    const graphic = figure.querySelector('svg,img')?.cloneNode(true);
    pip.replaceChildren(document.createTextNode('Hình · chạm để xem'));
    if (!graphic) return;
    for (const node of graphic.querySelectorAll('.cat-hit')) node.remove();
    for (const node of [graphic, ...graphic.querySelectorAll('[id]')]) node.removeAttribute('id');
    graphic.setAttribute('aria-hidden', 'true');
    pip.appendChild(graphic);
  }

  function render(index, focus) {
    const sc = screens[index], state = visits[index], row = rows[index];
    const column = row.querySelector('.chat-col');
    clearMath(column);
    column.innerHTML = blockHTML(sc, state, index === visits.length - 1 && !state.final);
    if (sc.type === 'lab') options.bindLab?.(column);
    typeset(column);
    if (focus) {
      const replacement = column.querySelector(focus);
      (replacement || next).focus({ preventScroll: true });
    }
    updatePip();
  }

  function append(index) {
    const sc = screens[index];
    if (!anchors.has(sc.p)) {
      const separator = document.createElement('div');
      separator.className = 'chat-separator';
      separator.innerHTML = '<span>' + text(partLabel(sc.p)) +
        (parts[sc.p].goal ? '<small>Cậu sẽ: ' + text(parts[sc.p].goal) + '</small>' : '') + '</span>';
      anchors.set(sc.p, separator);
      stream.appendChild(separator);
    }
    stream.insertAdjacentHTML('beforeend', turn(''));
    rows.push(stream.lastElementChild);
    render(index);
    setTitle(sc.p);
    dock();
    save();
  }

  function addNext() {
    const index = visits.length;
    if (index >= screens.length) return;
    const add = () => {
      busy = false;
      visits.push({});
      append(index);
      scroll(anchors.get(screens[index].p) === rows[index].previousElementSibling
        ? rows[index].previousElementSibling : rows[index]);
    };
    if (reduced) return add();
    busy = true;
    dock();
    stream.insertAdjacentHTML('beforeend', turn('<div class="chat-bubble chat-dots" role="status" aria-label="Cherry đang soạn"><i></i><i></i><i></i></div>'));
    const typing = stream.lastElementChild;
    scroll(typing);
    setTimeout(() => {
      typing.remove();
      if (shell.isConnected) add();
    }, 650);
  }

  function refresh({ scrollToEnd = false, focus } = {}) {
    render(visits.length - 1, focus);
    dock();
    save();
    if (scrollToEnd) scroll(rows.at(-1).querySelector('.chat-col').lastElementChild);
  }

  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
  }

  function change(event, keyboard = false) {
    const target = event.target.closest('[data-option],[data-step],[data-toggle],[data-frame],[data-back-frame],[data-slide],.cat-hit');
    if (!target || busy || !rows.at(-1)?.contains(target) || target.disabled || visits.at(-1).final) return;
    if (keyboard) event.preventDefault();
    const sc = activeScreen(), state = visits.at(-1);
    if (target.dataset.option !== undefined) {
      const [index, choice] = target.dataset.option.split(',').map(Number);
      const quiz = sc.calc?.items[index] || sc.quiz;
      const picked = quiz.opts[choice];
      (state['q' + index] ||= []).push(choice);
      if (picked.ok) {
        const praiseIndex = seenOptions++ % praise.length;
        state['praise' + index] = praise[praiseIndex];
        if (sc.calc) state.steps = index + 1;
        else state.correct = true;
      } else if (sc.calc) {
        state.waiting = true;
        setTimeout(() => {
          delete state.waiting;
          if (shell.isConnected && state === visits.at(-1)) refresh({ focus: '[data-option]:not(:disabled)' });
        }, 1800);
      }
      refresh({ scrollToEnd: true, focus: '[data-option]:not(:disabled)' });
    } else if (target.matches('.cat-hit')) {
      const key = target.dataset.angle || target.dataset.region;
      state.hit = key;
      state.correct = key === (sc.tap?.ans || sc.region?.key);
      refresh({ scrollToEnd: state.correct, focus: state.correct ? '[data-none]' : '.cat-hit[data-' +
        (sc.tap ? 'angle' : 'region') + '="' + CSS.escape(key) + '"]' });
    } else if (target.dataset.toggle !== undefined) {
      state.toggle = Number(target.dataset.toggle);
      state.toggles = [...new Set([...(state.toggles || []), state.toggle])];
      refresh({ focus: `[data-toggle="${state.toggle}"]` });
    } else if (target.hasAttribute('data-slide')) {
      const moving = rows.at(-1).querySelector('.cat-slide');
      state.waiting = true;
      target.disabled = true;
      if (moving && !reduced) moving.style.transform = `translate(${moving.dataset.dx}px,${moving.dataset.dy}px)`;
      setTimeout(() => {
        delete state.waiting;
        state.correct = true;
        if (shell.isConnected && state === visits.at(-1)) refresh({ scrollToEnd: true, focus: '[data-none]' });
      }, reduced || !moving ? 0 : 1400);
    } else {
      const back = target.hasAttribute('data-back-frame');
      state.steps = (state.steps || (sc.type === 'act' ? 0 : 1)) + (back ? -1 : 1);
      if (sc.frames?.caps.length === state.steps) state.viewedFrames = true;
      refresh({ scrollToEnd: true, focus: '[data-step],[data-frame],[data-back-frame]' });
    }
  }

  function finishState(sc, state) {
    const completeQuiz = (quiz, index) => {
      const correct = quiz.opts.findIndex(option => option.ok);
      const attempts = state['q' + index] ||= [];
      if (attempts.at(-1) !== correct) attempts.push(correct);
    };
    if (sc.quiz) {
      completeQuiz(sc.quiz, 0);
      state.correct = true;
    }
    if (sc.type === 'tap' || sc.type === 'region') {
      state.hit = sc.tap?.ans || sc.region?.key;
      state.correct = true;
    }
    if (sc.type === 'calc') {
      sc.calc.items.forEach(completeQuiz);
      state.steps = sc.calc.items.length;
    }
    if (sc.type === 'vidu') state.steps = sc.steps.length;
    if (sc.type === 'act') state.steps = sc.acts.length;
    if (sc.frames) state.steps = sc.frames.caps.length;
    if (sc.type === 'slide') state.correct = true;
    state.final = true;
  }

  function showToc() {
    toc.innerHTML = '<header><h2>Mục lục</h2><button type="button" data-dismiss>Đóng</button></header>' +
      '<div class="chat-pane-scroll"><div class="chat-summary-inner">' + parts.map((part, p) => {
        const reached = anchors.has(p), done = activeScreen().p > p || complete;
        return `<button type="button" class="chat-toc-item" data-part="${p}" ${focusedPart === p ? 'aria-current="step"' : ''}
          aria-disabled="${!reached && !options.teacher}"><b>${done ? '✓' : (p || '★')}</b><span>${text(partLabel(p))}
          <small>${done ? 'Đã xong' : reached ? 'Đang học' : 'Chưa tới'}</small></span></button>`;
      }).join('') + '</div></div>';
    toc.showModal();
  }

  function summaryHTML() {
    const correct = topic.chat.ketbai?.quiz?.opts.find(option => option.ok);
    const section = (p, body) => `<section data-section="${p}"><h3>${text(partLabel(p))}</h3>${body}</section>`;
    const opening = screens.find(sc => sc.type === 'opening');
    const start = opening ? figureHTML(opening, {}) + bubble(opening.cauhoi, true) +
      (correct ? feedback(correct.text + ' ' + correct.why) : '') : '';
    const content = parts.slice(1, -1).map((part, i) => {
      const p = i + 1;
      const included = screens.filter(sc => sc.p === p && ['read', 'vidu'].includes(sc.type));
      const material = included.map(sc => {
        const state = { steps: sc.steps?.length || 0 };
        return figureHTML(sc, state) + knowledgeHTML(sc, state.steps);
      }).join('');
      return section(p, material || (part.recap ? bubble(part.recap) : ''));
    }).join('');
    const closing = topic.chat.ketbai?.emdahoc;
    const end = closing?.length ? section(lastPart, '<ul>' + closing.map(item => '<li>' + text(item) + '</li>').join('') + '</ul>') : '';
    return (start ? section(0, start) : '') + content + end;
  }

  function showSummary() {
    clearMath(summary);
    summary.innerHTML = '<header><h2>Tóm tắt</h2><button type="button" data-dismiss>Đóng</button></header>' +
      '<div class="chat-pane-scroll"><div class="chat-summary-inner">' + summaryHTML() + '</div></div>';
    summary.showModal();
    typeset(summary);
    summary.querySelector(`[data-section="${focusedPart}"]`)?.scrollIntoView({ block: 'start' });
  }

  function restart() {
    clearMath(stream);
    stream.replaceChildren();
    visits = [{}];
    complete = false;
    seenOptions = 0;
    rows.length = 0;
    anchors.clear();
    storage.write(null);
    append(0);
    feed.scrollTop = 0;
  }

  shell.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.hasAttribute('data-close')) options.onClose?.();
    else if (target.hasAttribute('data-edit')) options.teacherEdit?.();
    else if (target.hasAttribute('data-old-version')) options.onOldVersion?.();
    else if (target.hasAttribute('data-summary')) showSummary();
    else if (target.hasAttribute('data-toc')) showToc();
    else if (target.hasAttribute('data-dismiss')) target.closest('dialog').close();
    else if (target.hasAttribute('data-reset')) restart();
    else if (target === pip) scroll(rows.at(-1)?.querySelector('.chat-figure'));
    else if (target.dataset.part !== undefined) {
      const p = Number(target.dataset.part);
      toc.close();
      if (!anchors.has(p) && !options.teacher) return notify('Học tới phần đó thì mở nhé');
      if (busy) return;
      if (!anchors.has(p)) {
        while (activeScreen().p < p) {
          finishState(activeScreen(), visits.at(-1));
          render(visits.length - 1);
          visits.push({});
          append(visits.length - 1);
        }
      }
      setTitle(p);
      scroll(anchors.get(p));
    }
  });
  stream.addEventListener('click', change);
  stream.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.cat-hit')) change(event, true);
  });
  next.onclick = () => {
    if (busy) return;
    const sc = activeScreen(), state = visits.at(-1);
    if (!ready(sc, state)) return;
    if (sc.type === 'closing') {
      complete = true;
      state.final = true;
      refresh();
      options.finish?.();
      return;
    }
    if (sc.type === 'recap' && !state.recap) state.echo = 'Tớ hiểu rồi';
    else if (!sc.quiz && !['act', 'calc', 'tap', 'region', 'recap'].includes(sc.type)) state.echo = CHAT_ECHO[(visits.length - 1) % CHAT_ECHO.length];
    state.final = true;
    refresh();
    addNext();
  };
  recap.onclick = () => {
    if (busy || activeScreen().type !== 'recap') return;
    visits.at(-1).recap = true;
    refresh({ scrollToEnd: true });
  };
  feed.addEventListener('scroll', () => {
    updatePip();
    const cutoff = feed.getBoundingClientRect().top + feed.clientHeight * .32;
    let p = 0;
    for (const [part, anchor] of anchors) {
      if (anchor.getBoundingClientRect().top > cutoff) break;
      p = part;
    }
    if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 4) p = activeScreen().p;
    setTitle(p);
  }, { passive: true });
  if (!visits.length) restart();
  else {
    for (const [i, state] of visits.entries()) {
      delete state.waiting;
      if (i < visits.length - 1 || complete) state.final = true;
      append(i);
    }
    scroll(rows.at(-1), false);
    updatePip();
  }
  if (options.openSummary) showSummary();
  return { restart, showSummary };
}
