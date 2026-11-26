const setLesson = [
  {
    title: 'Quả nào vào giỏ?',
    guide: 'Giỏ A chỉ đựng quả màu đỏ. Em thử chọn một quả nhé!',
    visual: `<div class="lesson-choices" role="group" aria-label="Chọn một quả">
      <button type="button" data-visual="0" aria-pressed="true"><span aria-hidden="true">🍎</span>Táo đỏ</button>
      <button type="button" data-visual="1" aria-pressed="false"><span aria-hidden="true">🍌</span>Chuối vàng</button>
      <button type="button" data-visual="2" aria-pressed="false"><span aria-hidden="true">🍓</span>Dâu đỏ</button>
    </div><div class="lesson-basket" aria-hidden="true"><span data-illustration>🍎</span><b>Giỏ A</b></div>`,
    illustrations: ['🍎', '—', '🍓'],
    captions: ['Táo đỏ thuộc A vì táo này có màu đỏ.', 'Chuối vàng không thuộc A vì giỏ chỉ đựng quả đỏ.', 'Dâu đỏ thuộc A vì dâu này có màu đỏ.'],
    concept: 'Tập hợp và phần tử',
    explanation: 'Một tập hợp gồm những đối tượng được xác định rõ. Mỗi đối tượng trong tập hợp là một phần tử.',
    example: 'Gọi <i>a</i> là quả táo đỏ và <i>b</i> là quả chuối vàng. <b><i>a</i> ∈ A</b> đọc là “a thuộc A”. <b><i>b</i> ∉ A</b> đọc là “b không thuộc A”.',
    prompt: 'Gọi <i>d</i> là quả dâu đỏ. Em viết thế nào?',
    choices: ['<i>d</i> ∈ A', '<i>d</i> ∉ A'],
    correct: 0,
    feedback: ['Đúng rồi! Dâu có màu đỏ nên d thuộc A.', 'Em thử chạm vào quả dâu ở trên. Quả màu đỏ được vào giỏ A.']
  },
  {
    title: 'Cùng một nhóm, hai cách viết',
    guide: 'Chọn các số tự nhiên nhỏ hơn 4. Em có thể kể tên từng số hoặc nêu điều kiện chung.',
    visual: `<div class="lesson-numbers" role="img" aria-label="Các số 0, 1, 2, 3 thuộc B. Các số 4 và 5 ở ngoài tập hợp."><span>0　1　2　3</span> 4　5</div>
      <div class="lesson-choices" role="group" aria-label="Cách viết tập hợp">
        <button type="button" data-visual="0" aria-pressed="true">Liệt kê</button>
        <button type="button" data-visual="1" aria-pressed="false">Nêu điều kiện</button>
      </div>`,
    captions: ['B = {0; 1; 2; 3}', 'B = {x ∈ ℕ | x < 4}'],
    concept: 'Hai cách mô tả tập hợp',
    explanation: '<b>Liệt kê</b> là viết ra từng phần tử. <b>Nêu điều kiện</b> là chỉ ra tính chất chung của các phần tử.',
    example: 'B gồm các số tự nhiên nhỏ hơn 4. Trong cách viết <b>B = {<i>x</i> ∈ ℕ | <i>x</i> &lt; 4}</b>, ℕ là tập hợp số tự nhiên.',
    prompt: 'Nếu đổi thành “số tự nhiên nhỏ hơn hoặc bằng 4”, tập hợp có thêm số nào?',
    choices: ['Số 4', 'Số 5'],
    correct: 0,
    feedback: ['Đúng rồi! Điều kiện mới lấy cả 4, vì 4 bằng 4.', 'Số 5 vẫn ở ngoài. Dấu ≤ cho phép lấy thêm chính số 4.']
  }
];

function builtInLesson(t){
  // Bài Tập hợp dùng bản minh họa sẵn cho đến khi giáo viên nhập nội dung tương tác riêng.
  if(t?.khoi==='6'&&t.chuong==='k6-b1'&&!t.theory?.some(it=>['loidan','minhhoa','thungay'].includes(it.k)))return setLesson;
  return null;
}
function hasTheory(t){return Boolean(t?.theory?.length||builtInLesson(t))}
function theoryTopics(k){return mapItems(k).map(item=>item.t).filter(hasTheory)}

function theoryIndex(){
  const topics=theoryTopics(curK);
  overlay(`<h2>Lý thuyết lớp ${esc(curK)}</h2><div class="lesson-index">${topics.map((t,i)=>`<button type="button" class="btn alt" data-theory-topic="${i}">${esc(t.title)}</button>`).join('')}</div><button type="button" class="btn" id="theoryIndexClose">Về bản đồ</button>`);
  $('#theoryIndexClose').onclick=closeOvl;
  $$('#panel [data-theory-topic]').forEach(button=>button.onclick=()=>{closeOvl();theory(topics[Number(button.dataset.theoryTopic)])});
}

const placeNames=['đơn vị','chục','trăm','nghìn','chục nghìn','trăm nghìn','triệu','chục triệu','trăm triệu','tỷ','chục tỷ','trăm tỷ'];
const romanGroups=[['X',10],['IX',9],['V',5],['IV',4],['I',1]];
const groupedNumber=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f');

function authoredTheoryHTML(item){
  if(item.k==='hinhbuoc')return `<section class="theory-lab hb-lab">${tex(item.body)}</section>`;
  if(item.k==='thungay'){
    const answer=[item.correct,item.wrong],feedback=[item.explainCorrect,item.explainWrong];
    return `<div class="lesson-check authored-check"><h3>Thử ngay</h3><p>${tex(item.body)}</p><div class="lesson-choices" role="group" aria-label="Chọn đáp án">${shuffle([0,1]).map(i=>`<button type="button" data-response="${i}" aria-pressed="false">${tex(answer[i])}</button>`).join('')}</div><div class="lesson-feedback" aria-live="polite"></div>${feedback.map((text,i)=>`<template data-explanation="${i}">${tex(text)}</template>`).join('')}</div>`;
  }
  if(item.template==='gia-tri-theo-hang'){
    const digits=[...item.value];
    return `<section class="theory-lab" data-place="${item.value}"><h3>Giá trị theo hàng</h3><p>Chạm vào một chữ số trong <strong>${groupedNumber(item.value)}</strong>.</p><div class="place-cards lesson-choices" role="group" aria-label="Các chữ số">${digits.map((digit,i)=>`<button type="button" data-place-index="${i}" aria-pressed="false"><b>${digit}</b><small>${placeNames[digits.length-i-1]}</small></button>`).join('')}</div><div class="lab-feedback" aria-live="polite"></div></section>`;
  }
  if(item.template==='ghep-so-la-ma')return `<section class="theory-lab" data-roman="${item.value}"><h3>Ghép số La Mã</h3><p>Ghép các mảnh từ trái sang phải để viết số <strong>${item.value}</strong>.</p><div class="roman-built" aria-live="polite">Chưa có mảnh nào</div><div class="lesson-choices roman-options" role="group" aria-label="Các mảnh số La Mã">${[...romanGroups].reverse().map(([symbol,value])=>`<button type="button" data-roman-piece="${symbol}"><b>${symbol}</b><small>${value}</small></button>`).join('')}</div><div class="lab-feedback" aria-live="polite"></div><button type="button" data-roman-reset>Ghép lại</button></section>`;
  return '';
}

function bindAuthoredTheory(root){
  for(const card of root.querySelectorAll('.authored-check')){
    const buttons=card.querySelectorAll('[data-response]'),feedback=card.querySelector('.lesson-feedback');
    buttons.forEach(button=>button.onclick=()=>{
      buttons.forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
      const i=button.dataset.response;
      feedback.dataset.correct=String(i==='0');
      feedback.replaceChildren(card.querySelector(`[data-explanation="${i}"]`).content.cloneNode(true));
      typeset(feedback);
    });
  }
  for(const card of root.querySelectorAll('[data-place]')){
    const number=card.dataset.place,buttons=card.querySelectorAll('[data-place-index]'),feedback=card.querySelector('.lab-feedback');
    buttons.forEach(button=>button.onclick=()=>{
      buttons.forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
      const index=Number(button.dataset.placeIndex),digit=Number(number[index]),position=number.length-index-1;
      const unit=10**position,name=placeNames[position],value=groupedNumber(digit*unit),quantity=groupedNumber(number.slice(0,index+1));
      feedback.innerHTML=`<dl><div><dt>Chữ số hàng ${name}</dt><dd>${digit}</dd></div><div><dt>Giá trị của chữ số</dt><dd>${digit} × ${groupedNumber(unit)} = ${value}</dd></div><div><dt>Số ${name} trong ${groupedNumber(number)}</dt><dd>${quantity}</dd></div></dl>`;
    });
  }
  for(const card of root.querySelectorAll('[data-roman]')){
    const total=Number(card.dataset.roman),steps=[];
    let remaining=total;
    for(const [symbol,value] of romanGroups)while(remaining>=value){steps.push({symbol,value});remaining-=value}
    const output=card.querySelector('.roman-built'),feedback=card.querySelector('.lab-feedback'),buttons=card.querySelectorAll('[data-roman-piece]');
    let count=0;
    buttons.forEach(button=>button.onclick=()=>{
      if(count===steps.length)return;
      const step=steps[count];
      if(button.dataset.romanPiece!==step.symbol){
        feedback.textContent=`Thử lại nhé. Theo cách viết chuẩn, mảnh tiếp theo biểu diễn ${step.value}.`;
        return;
      }
      const chosen=steps.slice(0,++count),sum=chosen.reduce((n,part)=>n+part.value,0);
      output.textContent=chosen.map(part=>part.symbol).join('');
      feedback.textContent=count===steps.length?`${chosen.map(part=>part.value).join(' + ')} = ${total}. Vậy ${total} viết là ${output.textContent}.`:`Đã ghép được ${sum}. Còn ${total-sum}.`;
      if(count===steps.length)buttons.forEach(piece=>{piece.disabled=true});
    });
    card.querySelector('[data-roman-reset]').onclick=()=>{
      count=0;output.textContent='Chưa có mảnh nào';feedback.textContent='';buttons.forEach(piece=>{piece.disabled=false});
    };
  }
}

/* ---------- Lý thuyết từng màn (kiểu Duolingo, thầy duyệt 26/11/2026) ----------
   App tự chia khối lythuyet đã soạn thành từng màn nhỏ: mỗi màn một ý (khoảng 3 dòng),
   thanh tiến độ ở trên, nút Tiếp tục ở dưới, câu Thử ngay có dải đúng/sai. Không cần soạn lại bài. */
const LS_NOTE=['dinhnghia','quytac','congthuc','dinhly','tinhchat'];
const LS_MAX=160; // số kí tự chữ tối đa trên một màn (không tính công thức, hình)

// Tách nội dung theo \\ ở ngoài công thức $…$ và ngoài môi trường (hình TikZ, hình từng bước).
function lsLines(src){
  const s=String(src||''),out=[];let cur='',math=false,env=0,i=0;
  while(i<s.length){
    if(s.startsWith('\\begin{',i)){env++;cur+='\\begin{';i+=7;continue}
    if(s.startsWith('\\end{',i)){env=Math.max(0,env-1);cur+='\\end{';i+=5;continue}
    if(s[i]==='\\'&&s[i+1]==='\\'&&!math&&!env){out.push(cur.trim());cur='';i+=2;continue}
    if(s[i]==='\\'){cur+=s.slice(i,i+2);i+=2;continue}
    if(s[i]==='$')math=!math;
    cur+=s[i++];
  }
  out.push(cur.trim());
  return out.filter(Boolean).flatMap(l=>lsIsFig(l)||lsLen(l)<=LS_MAX?[l]:lsSentences(l));
}
// Đoạn quá dài (không có hình): tách theo câu, ở ngoài công thức.
function lsSentences(line){
  const out=[];let cur='',math=false;
  for(let i=0;i<line.length;i++){const c=line[i];
    if(c==='\\'){cur+=line.slice(i,i+2);i++;continue}
    if(c==='$')math=!math;
    cur+=c;
    if(!math&&/[.;:!?]/.test(c)&&line[i+1]===' '&&/[A-ZĐÀ-Ỹ$(0-9]/.test(line[i+2]||'')&&lsLen(cur)>25){out.push(cur.trim());cur=''}
  }
  if(cur.trim())out.push(cur.trim());
  return out;
}
const lsIsFig=line=>/\\begin\{(tikzpicture|hinhbuoc)\}/.test(line);
const lsLen=line=>line.replace(/\\begin\{(tikzpicture|hinhbuoc)\}[\s\S]*?\\end\{\1\}/g,'').replace(/\$([^$]*)\$/g,(_,m)=>'x'.repeat(Math.ceil(m.replace(/\\[a-zA-Z]+|[{}\s]/g,'').length*0.8)+1)).length;
// Gom các dòng thành từng màn: mỗi màn tối đa LS_MAX kí tự chữ; hình đi cùng đoạn chữ ngay trước nó rồi sang màn mới.
function lsChunks(src){
  const pages=[];let cur=[],len=0;
  for(const line of lsLines(src)){
    const fig=lsIsFig(line),l=lsLen(line);
    if(cur.length&&!fig&&len+l>LS_MAX){pages.push(cur);cur=[];len=0}
    cur.push(line);len+=l;
    if(fig){pages.push(cur);cur=[];len=0}
  }
  if(cur.length)pages.push(cur);
  return pages;
}
const lsTex=lines=>tex(lines.join('\\\\'));

// Hình TikZ được dịch với chữ cỡ 10pt, trên điện thoại trông nhỏ. Trong bài học từng màn, hình được phóng
// khoảng 1,5 lần (không quá bề ngang màn) để chữ trong hình gần bằng chữ bài học. Hình tĩnh có dòng "Chạm hình để phóng to".
const LS_FIG_SCALE=1.5;
function lsFitFigs(stage){
  const fit=img=>{const w=img.naturalWidth;if(!w)return;
    const host=img.closest('.hb-pic,.ls-opt,.ls-text,.ls-sol,.ls-q,.ls-lab')||stage,room=host.clientWidth-(img.closest('.hb-pic')?16:0);
    if(room>0)img.style.width=Math.min(room,Math.round(w*LS_FIG_SCALE))+'px'};
  stage.querySelectorAll('img.fig').forEach(img=>{
    if(!img.closest('.hb-pic,.ls-opt')&&!(img.nextElementSibling&&img.nextElementSibling.classList.contains('ls-zhint')))img.insertAdjacentHTML('afterend','<span class="ls-zhint">Chạm hình để phóng to</span>');
    if(img.complete&&img.naturalWidth)fit(img);else{img.loading='eager';img.addEventListener('load',()=>fit(img),{once:true})}});
}

// Danh sách màn của một bài từ các mục đã đọc (lib/latex.js parseTheory)
function lessonScreens(items){
  const S=[],groups=[];let g={items:[]};
  for(const it of items||[]){if(it.k==='loidan'&&g.items.length){groups.push(g);g={items:[]}}g.items.push(it)}
  if(g.items.length)groups.push(g);
  for(const grp of groups){
    let part=grp.items.find(it=>it.title)?.title||'',say='';
    const push=sc=>{S.push({part,say,...sc});say=''};
    for(const it of grp.items){
      if(it.title)part=it.title;
      // Lời Cherry dài thì đứng riêng một màn, để màn kiến thức sau đó gọn
      if(it.k==='loidan'){if(lsLen(it.body)>100)push({type:'read',html:'',intro:true});say=tex(it.body);if(S.at(-1)?.intro){S.at(-1).say=say;say=''}continue}
      if(LS_NOTE.includes(it.k)){
        lsChunks(it.body).forEach((lines,n)=>push({type:'read',kind:it.k,title:n?'':it.title,html:lsTex(lines)}));
        continue;
      }
      if(it.k==='luuy'){
        const lines=lsLines(it.body).flatMap(l=>lsIsFig(l)?[l]:lsSentences(l));
        for(let n=0;n<lines.length;n+=3)push({type:'read',kind:'luuy',title:n?'':'Cần nhớ',html:lines.slice(n,n+3).map(l=>`<div class="ls-note"><span aria-hidden="true">!</span><div>${tex(l)}</div></div>`).join('')});
        continue;
      }
      if(it.k==='vidu'){push({type:'vidu',html:tex(it.body),sol:tex(it.sol)});continue}
      if(it.k==='minhhoa'){push({type:'lab',html:authoredTheoryHTML(it)});continue}
      if(it.k==='hinhbuoc'){push({type:'lab',html:tex(it.body)});continue}
      if(it.k==='thungay'){push({type:'quiz',q:tex(it.body),opts:[{html:tex(it.correct),ok:true,ex:tex(it.explainCorrect)},{html:tex(it.wrong),ok:false,ex:tex(it.explainWrong)}]});continue}
    }
  }
  return S;
}
// Bài Tập hợp dựng sẵn (setLesson): mỗi trang thành 3 màn (chạm thử → khái niệm → thử ngay)
function builtInScreens(pages){
  return pages.flatMap(p=>[
    {type:'lab',part:p.concept,say:esc(p.guide),builtIn:p,html:`<div class="ls-builtin">${p.visual}<p class="lesson-caption" aria-live="polite">${esc(p.captions[0])}</p></div>`},
    {type:'read',part:p.concept,title:p.concept,html:`<p>${p.explanation}</p><div class="ls-eg"><b>Ví dụ</b><p>${p.example}</p></div>`},
    {type:'quiz',part:'Thử ngay',q:p.prompt,opts:p.choices.map((c,n)=>({html:c,ok:n===p.correct,ex:esc(p.feedback[n])}))}
  ]);
}
const LS_KIND={dinhnghia:'Định nghĩa',quytac:'Quy tắc',congthuc:'Công thức',dinhly:'Định lý',tinhchat:'Tính chất',luuy:'Lưu ý'};

// Vẽ bài học từng màn vào root. o: {start, title, onClose, finish(el,stats,api), teacherEdit}
function renderLessonMaterial(root,t,o={}){
  const builtIn=builtInLesson(t),screens=builtIn?builtInScreens(builtIn):lessonScreens(t.theory);
  root.classList.remove('lstep-host');
  if(!screens.length){root.innerHTML='<div class="tbox"><p>Bài này chưa có tóm tắt lý thuyết.</p></div>';typeset(root);return}
  root.classList.add('lstep-host');
  root.innerHTML=`<div class="lstep"><div class="ls-top">${o.onClose?'<button type="button" class="ls-x" aria-label="Thoát lý thuyết">×</button>':''}<div class="ls-prog" role="progressbar" aria-label="Tiến độ bài học"><b></b></div>${o.teacherEdit?'<button type="button" class="ls-ed">Sửa</button>':''}</div>
    <div class="ls-part"></div><div class="ls-stage" aria-live="polite"></div>
    <div class="ls-foot"><div class="ls-fb"><b></b><div></div></div><button type="button" class="ls-go">Tiếp tục</button></div></div>`;
  const box=root.firstElementChild,stage=box.querySelector('.ls-stage'),foot=box.querySelector('.ls-foot'),go=box.querySelector('.ls-go'),bar=box.querySelector('.ls-prog b');
  const quizN=screens.filter(x=>x.type==='quiz').length;
  let i=Math.min(Math.max(0,o.start||0),screens.length),state='read',pick=null,missed=new Set(),labCheck=null;
  if(o.onClose)box.querySelector('.ls-x').onclick=()=>{sfx.tap();o.onClose()};
  if(o.teacherEdit)box.querySelector('.ls-ed').onclick=()=>{sfx.tap();o.teacherEdit()};
  const ready=on=>{go.disabled=!on};
  function show(){
    box.dataset.i=i;foot.className='ls-foot';stage.scrollTop=0;pick=null;labCheck=null;
    bar.style.width=(i/screens.length*100)+'%';
    if(i>=screens.length)return finish();
    const sc=screens[i];
    box.querySelector('.ls-part').textContent=[o.title,sc.part].filter(Boolean).join(' · ');
    const say=sc.say?`<div class="ls-say"><div class="ls-girl" aria-hidden="true">${owlSVG}</div><div class="ls-bub">${sc.say}</div></div>`:'';
    let body='';
    if(sc.type==='read')body=`${sc.kind&&sc.title?`<span class="ls-kind" data-k="${sc.kind}">${LS_KIND[sc.kind]||''}</span>`:''}${sc.title?`<h2>${tex(sc.title)}</h2>`:''}<div class="ls-text">${sc.html}</div>`;
    if(sc.type==='vidu')body=`<span class="ls-kind" data-k="vidu">Ví dụ</span><div class="ls-text">${sc.html}</div><div class="ls-sol" hidden><b>Lời giải</b><div>${sc.sol}</div></div><p class="ls-center"><button type="button" class="ls-mini" data-sol>Xem lời giải</button></p>`;
    if(sc.type==='lab')body=`<div class="ls-lab">${sc.html}</div><p class="ls-hint">Chạm vào hình để khám phá</p>`;
    if(sc.type==='quiz')body=`<span class="ls-kind" data-k="thungay">Thử ngay</span><div class="ls-q">${sc.q}</div><div class="ls-opts">${shuffle(sc.opts.map((_,n)=>n)).map(n=>`<button type="button" class="ls-opt" data-o="${n}">${sc.opts[n].html}</button>`).join('')}</div>`;
    stage.innerHTML=sc.intro?`<div class="ls-screen ls-intro"><div class="ls-girl big" aria-hidden="true">${owlSVG}</div><div class="ls-bub">${sc.say}</div></div>`:`<div class="ls-screen">${say}${body}</div>`;
    state=sc.type==='quiz'?'answer':'read';go.textContent=sc.type==='quiz'?'Kiểm tra':'Tiếp tục';
    ready(sc.type==='read');
    if(sc.type==='vidu')stage.querySelector('[data-sol]').onclick=e=>{sfx.tap();stage.querySelector('.ls-sol').hidden=false;e.target.remove();ready(true);typeset(stage);lsFitFigs(stage)};
    if(sc.type==='quiz')stage.querySelectorAll('.ls-opt').forEach(b=>b.onclick=()=>{if(state!=='answer')return;sfx.tap();
      stage.querySelectorAll('.ls-opt').forEach(x=>x.classList.toggle('sel',x===b));pick=Number(b.dataset.o);ready(true)});
    if(sc.type==='lab')bindLab(sc);
    typeset(stage);lsFitFigs(stage);
  }
  // Màn khám phá: xong khi đã chạm (hình từng bước: khi tới bước cuối). Hình chưa dịch thì cho đi tiếp luôn.
  function bindLab(sc){
    if(sc.builtIn){
      const p=sc.builtIn,buttons=stage.querySelectorAll('[data-visual]');
      buttons.forEach((b,n)=>b.onclick=()=>{buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        stage.querySelector('.lesson-caption').textContent=p.captions[n];if(p.illustrations)stage.querySelector('[data-illustration]').textContent=p.illustrations[n];ready(true)});
      if(!buttons.length)ready(true);return;
    }
    bindAuthoredTheory(stage);
    const hbs=[...stage.querySelectorAll('.hb')];
    labCheck=()=>{if(hbs.length?hbs.every(w=>Number(w.dataset.k||0)>=w.querySelectorAll('.hb-pic img').length-1):true)ready(true)};
    if(hbs.length)stage.querySelector('.ls-hint').textContent='Chạm vào hình để xem từng bước';
    if(!stage.querySelector('button,.hb-pic'))ready(true);
  }
  stage.addEventListener('click',e=>{if(labCheck&&e.target.closest('button,.hb-pic'))setTimeout(labCheck,0)});
  // Chạm hình tĩnh: xem to toàn khung, kéo/phóng bằng hai ngón; chạm lần nữa hoặc × để đóng
  stage.addEventListener('click',e=>{const img=e.target.closest('img.fig');if(!img||img.closest('.hb-pic,.ls-opt'))return;sfx.tap();
    const z=document.createElement('div');z.className='ls-zoom';z.setAttribute('role','dialog');z.setAttribute('aria-label','Hình phóng to');
    z.innerHTML=`<button type="button" class="ls-zx" aria-label="Đóng">×</button><div class="ls-zin"><img src="${img.getAttribute('src')}" alt="${esc(img.alt||'Hình vẽ')}"></div>`;
    z.onclick=e=>{if(e.target.closest('.ls-zx')||!e.target.closest('img'))z.remove()};box.appendChild(z);
    // Hình hiện to gấp đôi cỡ gốc (ít nhất bằng bề ngang khung); kéo ngang/dọc để xem các phần
    const big=z.querySelector('.ls-zin img'),w=img.naturalWidth||0,inner=z.querySelector('.ls-zin');
    if(w){big.style.width=Math.max(inner.clientWidth-24,Math.round(w*2))+'px';inner.scrollLeft=(inner.scrollWidth-inner.clientWidth)/2}});
  function check(){
    const sc=screens[i],o2=sc.opts[pick],ok=o2.ok;
    state='fb';foot.className='ls-foot '+(ok?'ok':'no');
    foot.querySelector('.ls-fb b').textContent=ok?'✔ Chính xác!':'✘ Chưa đúng';
    const fb=foot.querySelector('.ls-fb div');fb.innerHTML=o2.ex||'';typeset(fb);
    stage.querySelector('.ls-opt.sel')?.classList.add(ok?'right':'wrong');
    go.textContent=ok?'Tiếp tục':'Thử lại';ready(true);
    if(ok)sfx.ok();else{sfx.no();missed.add(i)}
    try{navigator.vibrate&&navigator.vibrate(ok?20:[30,40,30])}catch(e){}
  }
  function finish(){
    box.querySelector('.ls-part').textContent='Hoàn thành';bar.style.width='100%';go.disabled=false;
    const stats={quiz:quizN,first:quizN-missed.size};
    const api={again:()=>{sfx.tap();i=0;missed.clear();go.onclick=next;show()},go};
    stage.innerHTML=`<div class="ls-screen ls-done"><div class="ls-girl big" aria-hidden="true">${owlSVG}</div><h2>Xong lý thuyết!</h2>${quizN?`<div class="ls-stat"><b>${stats.first}/${quizN}</b><span>câu Thử ngay đúng ngay lần đầu</span></div>`:''}<div class="ls-end"></div></div>`;
    go.textContent='Xem lại từ đầu';go.onclick=api.again;
    if(o.finish)o.finish(stage.querySelector('.ls-end'),stats,api);
    typeset(stage);sfx.win();
  }
  const next=()=>{if(go.disabled)return;
    if(state==='answer'&&pick!=null)return check();
    if(state==='fb'&&foot.classList.contains('no'))return show();
    sfx.tap();i++;show()};
  go.onclick=next;
  show();
}

// Xem lại lý thuyết khi đang làm bài: bản tóm tắt gọn trên một trang (không đi từng màn).
function renderLessonSummary(root,t){
  const builtIn=builtInLesson(t);
  const items=(t.theory||[]).filter(it=>!['loidan','minhhoa','thungay'].includes(it.k));
  root.innerHTML=items.length?theoryHTML(items):builtIn?builtIn.map(p=>`<div class="thc"><h3>${esc(p.concept)}</h3><div class="thb2">${p.explanation}<br>${p.example}</div></div>`).join(''):'<div class="tbox"><p>Bài này chưa có tóm tắt lý thuyết.</p></div>';
  typeset(root);
}

function openTheoryReview(t,returnLabel='Tiếp tục làm bài'){
  if(!hasTheory(t))return;
  const dialog=$('#theoryReview'),content=$('#reviewContent'),close=$('#reviewClose');
  const lesson=lessonOf(t);
  $('#theoryReviewTitle').textContent=lesson?lessonName(lesson):t.title;
  close.textContent=returnLabel;
  close.onclick=()=>dialog.close();
  dialog.showModal();
  renderLessonSummary(content,t);
  dialog.scrollTop=0;
}

$('#playTheory').innerHTML=bookSVG;
