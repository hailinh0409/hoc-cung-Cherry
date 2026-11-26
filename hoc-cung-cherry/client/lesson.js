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
function hasTheory(t){return Boolean(t?.lesson?.parts.length||t?.theory?.length||builtInLesson(t))}
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
// Chia theo Ý, không theo số chữ (thầy chốt 26/11/2026): mỗi mục (định nghĩa, quy tắc, lưu ý…) giữ trọn một màn.
// Chỉ khi mục dài quá LS_MAX mới chia, và chỉ chia ở chỗ người soạn xuống dòng \\; màn sau giữ nhãn, tiêu đề + "(tiếp)".
// Một dòng \\ dài hơn LS_MAX (hiếm) mới tách theo câu, và không bao giờ tách sau dấu hai chấm.
const LS_MAX=320; // số kí tự chữ tối đa trên một màn (không tính công thức, hình); khoảng nửa màn hình điện thoại

// Tách nội dung theo \\ ở ngoài công thức $…$ và ngoài môi trường (hình TikZ, hình từng bước).
function lsLines(src,splitLong=true){
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
  return out.filter(Boolean).flatMap(l=>!splitLong||lsIsFig(l)||lsLen(l)<=LS_MAX?[l]:lsSentences(l));
}
// Đoạn quá dài (không có hình): tách theo câu, ở ngoài công thức. Không tách sau ":" (sau đó là ví dụ/liệt kê của chính câu ấy).
function lsSentences(line){
  const out=[];let cur='',math=false;
  for(let i=0;i<line.length;i++){const c=line[i];
    if(c==='\\'){cur+=line.slice(i,i+2);i++;continue}
    if(c==='$')math=!math;
    cur+=c;
    if(!math&&/[.;!?]/.test(c)&&line[i+1]===' '&&/[A-ZĐÀ-Ỹ$(0-9]/.test(line[i+2]||'')&&lsLen(cur)>25){out.push(cur.trim());cur=''}
  }
  if(cur.trim())out.push(cur.trim());
  return out;
}
const lsIsFig=line=>/\\begin\{(tikzpicture|hinhbuoc)\}/.test(line);
const lsLen=line=>line.replace(/\\begin\{(tikzpicture|hinhbuoc)\}[\s\S]*?\\end\{\1\}/g,'').replace(/\$([^$]*)\$/g,(_,m)=>'x'.repeat(Math.ceil(m.replace(/\\[a-zA-Z]+|[{}\s]/g,'').length*0.8)+1)).length;
// Gom các dòng thành từng màn: mỗi màn tối đa LS_MAX kí tự chữ; hình đi cùng đoạn chữ ngay trước nó rồi sang màn mới.
function lsChunks(src,lines=lsLines(src)){
  const pages=[];let cur=[],len=0;
  for(const line of lines){
    const fig=lsIsFig(line),l=lsLen(line);
    if(cur.length&&!fig&&len+l>LS_MAX){pages.push(cur);cur=[];len=0}
    cur.push(line);len+=l;
    if(fig){pages.push(cur);cur=[];len=0}
  }
  if(cur.length)pages.push(cur);
  return pages;
}
const LS_LOOK=/^(hãy |cùng |em |mình )?(xem|quan sát|nhìn|theo dõi|chạm|kéo|bấm|thử)/i;
const lsTex=lines=>tex(lines.join('\\\\'));

// Hình co giãn theo màn hình điện thoại (thầy chốt 26/11/2026): lấp đầy bề ngang khung nhưng không cao quá
// một phần chiều cao vùng nội dung (để còn chỗ cho chữ), và không phóng quá 2,5 lần cỡ gốc (hình rất nhỏ khỏi to
// bất thường). Tự tính lại khi xoay máy hoặc đổi cỡ cửa sổ. Hình tĩnh có dòng "Chạm hình để phóng to".
const LS_FIG_MAX=2.5;
function lsFitFig(img,stage){
  const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h||!stage.clientHeight)return;
  const hb=img.closest('.hb-pic'),opt=img.closest('.ls-opt');
  const host=hb||opt||img.closest('.gm-fig,.ls-text,.ls-sol,.ls-q,.ls-lab')||stage;
  const room=host.clientWidth-(hb?16:0);
  // hình từng bước là nội dung chính của màn nên được cao hơn; hình trong phương án nhỏ lại
  // máy xoay ngang: vùng nội dung thấp, cho hình cao gần hết khung (học sinh cuộn xuống đọc tiếp)
  const wideScreen=stage.clientWidth>stage.clientHeight;
  const pin=img.closest('.gm-fig');
  const maxH=stage.clientHeight*(wideScreen?(opt?0.5:pin?0.6:0.9):pin?0.34:hb?0.6:opt?0.25:0.5);
  let W=Math.min(room,w*LS_FIG_MAX);
  if(W*h/w>maxH)W=maxH*w/h;
  if(W>0)img.style.width=Math.round(W)+'px';
}
function lsFitFigs(stage){
  stage.querySelectorAll('img.fig').forEach(img=>{
    if(!img.closest('.hb-pic,.ls-opt,.gm-fig')&&!(img.nextElementSibling&&img.nextElementSibling.classList.contains('ls-zhint')))img.insertAdjacentHTML('afterend','<span class="ls-zhint">Chạm hình để phóng to</span>');
    if(img.complete&&img.naturalWidth)lsFitFig(img,stage);else{img.loading='eager';img.addEventListener('load',()=>lsFitFig(img,stage),{once:true})}});
}

// Danh sách màn của một bài từ các mục đã đọc (lib/latex.js parseTheory)
function lessonScreens(items,pinLegacy=false){
  const S=[],groups=[];let g={items:[]};
  for(const it of items||[]){if(it.k==='loidan'&&g.items.length){groups.push(g);g={items:[]}}g.items.push(it)}
  if(g.items.length)groups.push(g);
  for(const grp of groups){
    const group={title:grp.items.find(it=>it.title)?.title||'',recap:''};
    const notes=grp.items.filter(it=>LS_NOTE.includes(it.k)||it.k==='luuy');
    const readsWithoutFigures=notes.filter(it=>LS_NOTE.includes(it.k))
      .map(it=>it.body.replace(/\\begin\{(tikzpicture|hinhbuoc)\}[\s\S]*?\\end\{\1\}/g,'').trim()).filter(Boolean);
    if(pinLegacy)group.recap=readsWithoutFigures.join(' \\\\ ');
    const authoredCount=grp.items.filter(it=>it.k!=='loidan').length;
    const multi=authoredCount>1||notes.some(it=>lsChunks(it.body).length>1)||grp.items.some(it=>it.k==='loidan'&&lsLen(it.body)>100);
    const source=pinLegacy&&multi?notes.find(it=>lessonTokens(it.body).some(tok=>tok.name==='tikzpicture'&&tok.closed)):null;
    const figure=source?lessonTokens(source.body).find(tok=>tok.name==='tikzpicture'&&tok.closed):null;
    let part=group.title,say='',labSay='';
    const push=sc=>{
      const shared=figure&&!sc.ownFigure&&!sc.gm&&sc.type!=='lab';
      S.push({part,say,...sc,group,figure:shared?{kind:'tikz',src:figure.raw}:null,shared:Boolean(shared)});
      say='';
    };
    const pushLab=sc=>{if(labSay)say=say?say+' '+labSay:labSay;labSay='';push(sc)};
    const hasLab=grp.items.some(it=>it.k==='hinhbuoc'||it.k==='minhhoa');
    for(const item of grp.items){
      const it=item===source?{...item,body:item.body.slice(0,figure.start)+item.body.slice(figure.end)}:item;
      if(it.title)part=it.title;
      if(it.k==='loidan'){
        // Câu cuối mời "Xem/Quan sát/Chạm…" mà mục có hình từng bước, minh họa: câu đó đi theo màn hình,
        // để Cherry nói "Xem cách chuyển nhé!" đúng lúc hình hiện ra (lỗi Bài 1 Tập hợp 26/11/2026).
        let body=it.body;
        if(hasLab){const sn=lsSentences(body),last=sn.at(-1)||'';
          if(sn.length>1&&LS_LOOK.test(last)){labSay=tex(last);body=sn.slice(0,-1).join(' ')}}
        // Lời Cherry dài thì đứng riêng một màn, để màn kiến thức sau đó gọn
        if(lsLen(body)>100)push({type:'read',html:'',intro:true});say=tex(body);if(S.at(-1)?.intro){S.at(-1).say=say;say=''}continue}
      if(LS_NOTE.includes(it.k)){
        lsChunks(it.body).forEach((lines,n)=>push({type:'read',kind:it.k,title:it.title?(n?it.title+' (tiếp)':it.title):'',cont:n>0,html:lsTex(lines),ownFigure:lines.some(lsIsFig)}));
        continue;
      }
      if(it.k==='luuy'){
        // Mỗi dòng \\ người soạn viết là một dòng "!"; không tự tách câu (câu dẫn và ví dụ của nó phải đi cùng nhau)
        lsChunks(it.body).forEach((lines,n)=>push({type:'read',kind:'luuy',title:n?'Cần nhớ (tiếp)':'Cần nhớ',cont:n>0,html:lines.map(l=>`<div class="ls-note"><span aria-hidden="true">!</span><div>${tex(l)}</div></div>`).join(''),ownFigure:lines.some(lsIsFig)}));
        continue;
      }
      if(it.k==='vidu'){push({type:'vidu',html:tex(it.body),sol:tex(it.sol),ownFigure:lsIsFig(it.body)||lsIsFig(it.sol)});continue}
      if(it.k==='minhhoa'){pushLab({type:'lab',html:authoredTheoryHTML(it)});continue}
      if(it.k==='hinhbuoc'){pushLab({type:'lab',html:tex(it.body)});continue}
      if(it.k==='giaimau'){gmScreens(it.body).forEach((sc,n)=>push(n?sc:{...sc,say:say||undefined}));continue}
      if(it.k==='thungay'){push({type:'quiz',q:tex(it.body),ownFigure:[it.body,it.correct,it.wrong,it.explainCorrect,it.explainWrong].some(lsIsFig),opts:[{html:tex(it.correct),ok:true,ex:tex(it.explainCorrect)},{html:tex(it.wrong),ok:false,ex:tex(it.explainWrong)}]});continue}
    }
  }
  return S;
}
// Bài giải mẫu từng bước (\begin{giaimau}, cú pháp ở lib/latex.js): mỗi mục một màn, hình ghim ở trên
// đổi khung theo màn (khung đã dịch, khóa trong FIGS là gmFrame). Đề bài xem lại được ở mọi màn.
function gmImg(code){if(!code)return '';const h=FIGS[code];return h?`<img class="fig" src="/hinh/${h}" alt="Hình vẽ">`:'<span class="figmiss">Hình chưa dịch</span>'}
function gmScreens(raw){
  const g=parseGiaiMau(raw),ctx={de:tex(g.de),full:gmImg(g.full)},S=[],tot={};
  let cur='Bài giải mẫu';
  for(const it of g.items){if(it.k==='cau')cur=it.title;if(it.k==='buocgiai')tot[cur]=(tot[cur]||0)+1}
  S.push({type:'read',kind:'giaimau',gm:ctx,part:'Bài giải mẫu',title:'Đề bài',fig:ctx.full,
    html:ctx.de+'<p class="ls-hint">Mỗi câu được giải từng bước. Có lúc Cherry hỏi em nên làm gì tiếp, em thử đoán trước khi xem nhé.</p>'});
  cur='Bài giải mẫu';const cnt={};
  for(const it of g.items){
    const fig=gmImg(it.frame),base={gm:ctx,fig};
    if(it.k==='cau'){cur=it.title;S.push({...base,type:'read',kind:'gmcau',part:cur,title:it.title,html:tex(it.body)})}
    if(it.k==='doan')S.push({...base,type:'quiz',doan:true,part:cur,q:tex(it.q),opts:it.opts.map(o=>({html:tex(o.t),ok:o.ok,ex:tex(o.ex)}))});
    if(it.k==='buocgiai'){cnt[cur]=(cnt[cur]||0)+1;S.push({...base,type:'gmstep',part:cur,no:`Bước ${cnt[cur]}/${tot[cur]}`,goal:tex(it.goal),html:lsLines(it.body).map(l=>`<p>${tex(l)}</p>`).join(''),why:tex(it.why)})}
    if(it.k==='sodo')S.push({...base,type:'tree',part:cur,nodes:it.nodes});
    if(it.k==='nhanxet')S.push({...base,type:'read',kind:'nhanxet',part:cur,title:'Nhận xét',html:lsLines(it.body).map(l=>`<p>${tex(l)}</p>`).join('')});
  }
  return S;
}
// Sơ đồ phân tích đi lên: các \nut theo thứ tự trước-sau, cấp 1 là gốc; vẽ nhánh ngang, chạm ô để mở nhánh con
function gmTreeHTML(nodes){
  const root={c:[]},st=[root];
  for(const n of nodes){const x={...n,c:[]};while(st.length>n.lv)st.pop();st[st.length-1].c.push(x);st.push(x)}
  const li=(n,top)=>`<li${top?'':' class="hide"'}><span class="gm-node${top?' root':''}${n.c.length?' can':''}">${tex(n.t)}${n.note?`<small>${tex(n.note)}</small>`:''}</span>${n.c.length?`<ul>${n.c.map(c=>li(c)).join('')}</ul>`:''}</li>`;
  return `<div class="gm-tree"><ul>${root.c.map(n=>li(n,true)).join('')}</ul></div>`;
}

// Bài Tập hợp dựng sẵn (setLesson): mỗi trang thành 3 màn (chạm thử → khái niệm → thử ngay)
function builtInScreens(pages){
  return pages.flatMap(p=>[
    {type:'lab',part:p.concept,say:esc(p.guide),builtIn:p,html:`<div class="ls-builtin">${p.visual}<p class="lesson-caption" aria-live="polite">${esc(p.captions[0])}</p></div>`},
    {type:'read',part:p.concept,title:p.concept,html:`<p>${p.explanation}</p><div class="ls-eg"><b>Ví dụ</b><p>${p.example}</p></div>`},
    {type:'quiz',part:'Thử ngay',q:p.prompt,opts:p.choices.map((c,n)=>({html:c,ok:n===p.correct,ex:esc(p.feedback[n])}))}
  ]);
}
const LS_KIND={dinhnghia:'Định nghĩa',quytac:'Quy tắc',congthuc:'Công thức',dinhly:'Định lý',tinhchat:'Tính chất',luuy:'Lưu ý',giaimau:'Bài giải mẫu',gmcau:'Yêu cầu',nhanxet:'Nhận xét'};

// Vẽ bài học từng màn vào root. o: {start, title, onClose, finish(el,stats,api), teacherEdit}
function renderLegacyLessonMaterial(root,t,o={}){
  const builtIn=builtInLesson(t),screens=builtIn?builtInScreens(builtIn):lessonScreens(t.theory);
  root.classList.remove('lstep-host');
  if(!screens.length){root.innerHTML='<div class="tbox"><p>Bài này chưa có tóm tắt lý thuyết.</p></div>';typeset(root);return}
  root.classList.add('lstep-host');
  root.innerHTML=`<div class="lstep"><div class="ls-top">${o.onClose?'<button type="button" class="ls-x" aria-label="Thoát lý thuyết">×</button>':''}<div class="ls-prog" role="progressbar" aria-label="Tiến độ bài học"><b></b></div>${o.teacherEdit?'<button type="button" class="ls-ed">Sửa</button>':''}</div>
    <div class="ls-part"></div><div class="ls-stage" aria-live="polite"></div>
    <div class="ls-foot"><div class="ls-fb"><b></b><div></div></div><button type="button" class="ls-go">Tiếp tục</button></div></div>`;
  const box=root.firstElementChild,stage=box.querySelector('.ls-stage'),foot=box.querySelector('.ls-foot'),go=box.querySelector('.ls-go'),bar=box.querySelector('.ls-prog b');
  const quizN=screens.filter(x=>x.type==='quiz').length;
  if(window.ResizeObserver){let t=0;new ResizeObserver(()=>{clearTimeout(t);t=setTimeout(()=>{stage.querySelectorAll('img.fig').forEach(img=>img.complete&&lsFitFig(img,stage));mathFit(stage)},80)}).observe(stage)}
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
    if(sc.type==='gmstep')body=`<span class="ls-kind" data-k="buoc">${sc.no}</span><div class="gm-goal">${sc.goal}</div><div class="ls-text">${sc.html}</div>${sc.why?`<div class="gm-why"><button type="button">Vì sao? ▾</button><div hidden>${sc.why}</div></div>`:''}`;
    if(sc.type==='tree')body=`<span class="ls-kind" data-k="sodo">Phân tích đi lên</span><p class="gm-tip">Muốn có điều ở trên, cần những gì ở dưới? Chạm ô viền cam để mở nhánh.</p>${gmTreeHTML(sc.nodes)}`;
    if(sc.type==='quiz')body=`<span class="ls-kind" data-k="${sc.doan?'doan':'thungay'}">${sc.doan?'Em đoán bước tiếp theo':'Thử ngay'}</span><div class="ls-q">${sc.q}</div><div class="ls-opts">${shuffle(sc.opts.map((_,n)=>n)).map(n=>`<button type="button" class="ls-opt" data-o="${n}">${sc.opts[n].html}</button>`).join('')}</div>`;
    if(sc.gm)body=`<div class="gm-fig">${sc.fig||''}<button type="button" class="gm-debtn">Đề bài</button></div>`+body;
    stage.innerHTML=sc.intro?`<div class="ls-screen ls-intro"><div class="ls-girl big" aria-hidden="true">${owlSVG}</div><div class="ls-bub">${sc.say}</div></div>`:`<div class="ls-screen">${say}${body}</div>`;
    state=sc.type==='quiz'?'answer':'read';go.textContent=sc.type==='quiz'?'Kiểm tra':'Tiếp tục';
    ready(sc.type==='read'||sc.type==='gmstep');
    if(sc.type==='gmstep'){const b=stage.querySelector('.gm-why button');if(b)b.onclick=()=>{sfx.tap();const d=b.nextElementSibling;d.hidden=!d.hidden;b.textContent=d.hidden?'Vì sao? ▾':'Vì sao? ▴';if(!d.hidden)typeset(d)}}
    if(sc.type==='tree')stage.querySelectorAll('.gm-node.can').forEach(n=>n.onclick=()=>{sfx.tap();n.parentElement.querySelectorAll(':scope>ul>li').forEach(li=>li.classList.remove('hide'));n.classList.remove('can');if(!stage.querySelector('.gm-tree li.hide'))ready(true)});
    if(sc.gm)stage.querySelector('.gm-debtn').onclick=()=>{sfx.tap();const z=document.createElement('div');z.className='ls-zoom gm-sheet';z.setAttribute('role','dialog');z.setAttribute('aria-label','Đề bài');
      z.innerHTML=`<button type="button" class="ls-zx" aria-label="Đóng">×</button><div class="gm-sheetin"><h2>Đề bài</h2><div class="ls-text">${sc.gm.de}</div>${sc.gm.full}</div>`;
      z.querySelector('.ls-zx').onclick=()=>z.remove();box.appendChild(z);typeset(z);lsFitFigs(z.querySelector('.gm-sheetin'))};
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
    // Hình hiện to gấp khoảng 1,8 lần cỡ đang thấy (ít nhất bằng bề ngang khung); kéo ngang/dọc để xem các phần
    const big=z.querySelector('.ls-zin img'),w=img.naturalWidth||0,inner=z.querySelector('.ls-zin');
    if(w){big.style.width=Math.max(inner.clientWidth-24,Math.round(img.getBoundingClientRect().width*1.8))+'px';inner.scrollLeft=(inner.scrollWidth-inner.clientWidth)/2}});
  function check(){
    const sc=screens[i],o2=sc.opts[pick],ok=o2.ok;
    state='fb';foot.className='ls-foot '+(ok?'ok':'no');
    foot.querySelector('.ls-fb b').textContent=ok?'✔ Chính xác!':sc.doan?'✘ Chưa phải hướng này':'✘ Chưa đúng';
    const fb=foot.querySelector('.ls-fb div');fb.innerHTML=o2.ex||'';typeset(fb);
    stage.querySelector('.ls-opt.sel')?.classList.add(ok?'right':'wrong');
    go.textContent=ok?(sc.doan?'Xem bước giải':'Tiếp tục'):(sc.doan?'Chọn lại':'Thử lại');ready(true);
    if(ok)sfx.ok();else{sfx.no();missed.add(i)}
    try{navigator.vibrate&&navigator.vibrate(ok?20:[30,40,30])}catch(e){}
  }
  function finish(){
    box.querySelector('.ls-part').textContent='Hoàn thành';bar.style.width='100%';go.disabled=false;
    const stats={quiz:quizN,first:quizN-missed.size};
    const api={again:()=>{sfx.tap();i=0;missed.clear();go.onclick=next;show()},go};
    stage.innerHTML=`<div class="ls-screen ls-done"><div class="ls-girl big" aria-hidden="true">${owlSVG}</div><h2>${o.doneTitle||'Xong lý thuyết!'}</h2>${quizN?`<div class="ls-stat"><b>${stats.first}/${quizN}</b><span>câu trả lời đúng ngay lần đầu</span></div>`:''}<div class="ls-end"></div></div>`;
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

function lectureTex(value){
  return tex(value).replace(/(\$\$[\s\S]*?\$\$|\$(?:\\[\s\S]|[^$\\])*\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])|\\textbf\s*\{([^{}]*)\}/g,
    (_, math, bold) => math || '<strong>' + bold + '</strong>');
}

function lectureReadHTML(value){
  const blocks=[], bullets=[];
  const flush=()=>{
    if(!bullets.length)return;
    blocks.push('<ul class="ls-reading-list">'+bullets.map(line=>'<li>'+lectureTex(line)+'</li>').join('')+'</ul>');
    bullets.length=0;
  };
  for(const line of lsLines(value,false)){
    if(/^•\s+/.test(line))bullets.push(line.replace(/^•\s+/,''));
    else{
      flush();
      blocks.push('<div class="ls-reading-line">'+lectureTex(line)+'</div>');
    }
  }
  flush();
  return blocks.join('');
}

function lectureQuiz(quiz){
  return {
    type:'quiz', q:lectureTex(quiz.q),
    opts:[
      {html:lectureTex(quiz.correct), ok:true, ex:lectureTex(quiz.explainCorrect)},
      {html:lectureTex(quiz.wrong), ok:false, ex:lectureTex(quiz.explainWrong)},
    ],
  };
}

function lectureScreen(sc){
  const base={...sc, say:sc.cherry ? lectureTex(sc.cherry) : '', figure:sc.fig};
  if(sc.type==='read')return [{...base, html:lectureReadHTML(sc.body)}];
  if(sc.type==='quiz')return [{...base, ...lectureQuiz(sc.quiz)}];
  if(sc.type==='vidu')return [{...base, html:lectureTex(sc.body), solution:lsLines(sc.sol,false).map(lectureTex)}];
  if(sc.type==='lab')return [{...base, html:authoredTheoryHTML({template:sc.template,value:sc.value})}];
  if(sc.type==='giaimau')return gmScreens(sc.body).map((item,i)=>({...item,say:i?'':base.say}));
  return [base];
}

function lecturePlan(t){
  const lesson=t.lesson, modern=Boolean(lesson&&!lesson.legacy);
  const screens=[], sections=[];
  const add=(name, items, info={})=>{
    if(!items.length)return;
    const section=sections.length;
    sections.push({name, first:screens.length, last:screens.length+items.length-1, ...info});
    screens.push(...items.map(sc=>({...sc,section})));
  };

  if(lesson?.modau){
    const {cherry,cauhoi,nutbuoc,fig}=lesson.modau;
    add('Mở đầu',[{type:'opening',title:cauhoi,say:cherry?lectureTex(cherry):'',figure:fig,nutbuoc}],{opening:true});
  }

  const oldScreens=modern?[]:lessonScreens(t.theory,true);
  const oldParts=[...new Set(oldScreens.map(sc=>sc.group))];
  const outline=modern||oldParts.length>1?screens.length:-1;
  if(outline>=0)screens.push({type:'outline',section:-1});

  if(modern){
    lesson.parts.forEach((part,i)=>{
      const items=part.screens.flatMap(lectureScreen).map(sc=>{
        const own=sc.figure||sc.gm||sc.type==='lab'||lsIsFig(sc.body||'')||
          (sc.type==='quiz'&&[sc.quiz.q,sc.quiz.correct,sc.quiz.wrong,sc.quiz.explainCorrect,sc.quiz.explainWrong].some(lsIsFig))||
          (sc.type==='vidu'&&lsIsFig(sc.sol||''));
        return own?sc:{...sc,figure:part.fig,shared:Boolean(part.fig)};
      });
      add(part.title,items,{number:i+1,recap:part.recap,goal:part.goal});
    });
  }else{
    oldParts.forEach((part,i)=>{
      add(part.title||'Lý thuyết',oldScreens.filter(sc=>sc.group===part),{number:i+1,recap:part.recap});
    });
  }
  const parts=sections.filter(section=>section.number);
  const closing=lesson?.ketbai;
  if(closing){
    const quiz=closing.quiz?[{...lectureQuiz(closing.quiz),figure:closing.fig,
      say:closing.cherry?lectureTex(closing.cherry):''}]:[];
    add('Kết bài',[...quiz,{type:'end',bullets:closing.emdahoc}],{closing:true});
  }else if(parts.length){
    screens.push({type:'end',section:-1,bullets:[]});
  }
  return {modern,screens,sections,parts,outline};
}

function lectureProgress(value,screens,sections){
  const validScreen=i=>Number.isInteger(i)&&i>=0&&i<screens.length;
  const savedPos=Array.isArray(value?.pos)?value.pos:[];
  const savedDone=Array.isArray(value?.done)?value.done:[];
  return {
    pos:sections.map(({first,last},j)=>validScreen(savedPos[j])&&savedPos[j]>=first&&savedPos[j]<=last?savedPos[j]:first),
    done:Array.from({length:sections.length+1},(_,j)=>savedDone[j]===true),
    seen:[...new Set(Array.isArray(value?.seen)?value.seen.filter(validScreen):[])],
  };
}

function renderLessonMaterial(root,t,o={}){
  root._lectureDispose?.();
  if(((!t.lesson||t.lesson.legacy)&&builtInLesson(t))||o.doneTitle||(t.theory?.length&&t.theory.every(it=>it.k==='giaimau')&&!t.lesson)){
    return renderLegacyLessonMaterial(root,t,o);
  }
  const plan=lecturePlan(t);
  if(!plan.parts.length)return renderLegacyLessonMaterial(root,t,o);
  renderLecture(root,t,o,plan);
}

function lectureGeometryState(base,update){
  return {...base,...update,to:{...base.to,...update?.to},do:{...base.do,...update?.do}};
}

function bindLectureGeometry(sc,stage,pin,go,state,options,repaint,nextLabel){
  const screen=stage.firstElementChild,feedback=screen.querySelector('.ls-geometry-note');
  const announce=(html,style='')=>{
    feedback.innerHTML=html;
    feedback.className=('ls-geometry-note ls-answer-note '+style).trim();
    feedback.hidden=false;
    typeset(feedback);
  };
  const setState=update=>Object.assign(state,lectureGeometryState(state,update));
  const label=()=>{go.textContent=nextLabel();go.disabled=false};
  const stillHere=()=>screen.isConnected&&stage.firstElementChild===screen;

  if(sc.type==='tap'||sc.type==='region'){
    go.disabled=true;
    const angles=sc.type==='tap';
    const prompt=angles?sc.tap:sc.region, correctKey=angles?prompt.ans:prompt.key;
    const keyOf=hit=>angles?hit.dataset.angle:hit.dataset.region;
    let answered=false;
    const handle=hit=>{
      if(answered)return;
      const key=keyOf(hit);
      if(angles)state.to={...sc.state?.to};
      if(key===correctKey){
        answered=true;
        if(angles){
          const base=Object.fromEntries(Object.entries(state.to).map(([id,color])=>[id,color==='cam'?'luc':color]));
          state.to={...base,[key]:'luc'};
        }else state.vung=key;
        options.tap=false;
        options.region=false;
        announce(lectureTex(prompt.ok),'ok');
        sfx.ok();
        label();
      }else{
        if(angles)state.to[key]='do';
        announce(lectureTex(angles?(prompt.nhac[key]||prompt.hint):'Em quan sát hai đường thẳng rồi chạm lại nhé.'),'no');
        sfx.no();
      }
      repaint();
      if(!answered)[...pin.querySelectorAll('.cat-hit')].find(el=>keyOf(el)===key)?.focus({preventScroll:true});
      else go.focus({preventScroll:true});
    };
    pin.onclick=event=>{const hit=event.target.closest('.cat-hit');if(hit)handle(hit)};
    pin.onkeydown=event=>{
      const hit=event.target.closest('.cat-hit');
      if(hit&&(event.key==='Enter'||event.key===' ')){event.preventDefault();handle(hit)}
    };
    return;
  }
  if(sc.type==='slide'){
    const button=screen.querySelector('.ls-slide-start');
    go.disabled=true;
    button.onclick=()=>{
      const moving=pin.querySelector('.cat-slide');
      button.disabled=true;
      options.slide='to';
      const done=()=>{
        if(!stillHere()||!feedback.hidden)return;
        announce(lectureTex(sc.slide.after),'ok');
        label();
      };
      if(!moving||matchMedia('(prefers-reduced-motion: reduce)').matches){
        repaint();
        done();
        return;
      }
      moving.addEventListener('transitionend',done,{once:true});
      moving.style.transform='translate('+moving.dataset.dx+'px,'+moving.dataset.dy+'px)';
      setTimeout(done,1500);
    };
    return;
  }
  if(sc.type==='calc'){
    const target=screen.querySelector('.ls-calc');
    let index=0;
    go.disabled=true;
    function nextQuestion(){
      const item=sc.calc.items[index];
      if(!item){
        target.replaceChildren();
        if(sc.calc.ketluan)announce(lectureTex(sc.calc.ketluan),'ok');
        label();
        return;
      }
      const answers=[{html:item.correct,ok:true,feedback:item.explainCorrect},{html:item.wrong,ok:false,feedback:item.explainWrong}];
      target.innerHTML=`<div class="ls-q">${lectureTex(item.q)}</div><div class="ls-opts" role="group" aria-label="Các phương án">${shuffle([0,1]).map(n=>
        `<button type="button" class="ls-opt" data-calc="${n}">${lectureTex(answers[n].html)}</button>`).join('')}</div>`;
      const buttons=[...target.querySelectorAll('button')];
      const evaluate=button=>{
        const answer=answers[Number(button.dataset.calc)];
        buttons.forEach(b=>b.disabled=true);
        button.classList.add(answer.ok?'right':'wrong');
        announce(lectureTex(answer.feedback),answer.ok?'ok':'no');
        if(answer.ok){
          setState(item.state);
          repaint();
          sfx.ok();
          index++;
          nextQuestion();
        }else{
          sfx.no();
          setTimeout(()=>{
            if(!stillHere())return;
            buttons.forEach(b=>b.disabled=false);
            button.classList.remove('wrong');
            button.focus({preventScroll:true});
          },1800);
        }
      };
      buttons.forEach(button=>button.onclick=()=>evaluate(button));
      typeset(target);
    }
    nextQuestion();
    return;
  }
  const buttons=[...screen.querySelectorAll('[data-figure-state]')];
  const visited=new Set();
  const select=i=>{
    visited.add(i);
    const next=lectureGeometryState(sc.state||{},sc.toggle[i].state);
    Object.assign(state,next);
    buttons.forEach((b,index)=>{
      b.classList.toggle('sel',i===index);
      b.setAttribute('aria-pressed',String(i===index));
    });
    repaint();
    go.disabled=visited.size<buttons.length;
  };
  buttons.forEach((button,i)=>button.onclick=()=>select(i));
  select(0);
}

function lectureImageReady(image){
  return image.decode?image.decode():new Promise((resolve,reject)=>{
    if(image.complete){image.naturalWidth?resolve():reject();return}
    image.addEventListener('load',resolve,{once:true});
    image.addEventListener('error',reject,{once:true});
  });
}

function lectureScreenImages(content, markup){
  const found=new Map();
  for(const image of content.querySelectorAll('img.fig')){
    const url=image.getAttribute('src');
    if(!/^\/hinh\/[0-9a-f]{40}$/.test(url||''))continue;
    image.loading='eager';
    found.set(url,image);
  }
  for(const html of markup){
    for(const match of (html||'').matchAll(/src="(\/hinh\/[0-9a-f]{40})"/g)){
      if(found.has(match[1]))continue;
      const image=new Image();
      image.src=match[1];
      found.set(match[1],image);
    }
  }
  return [...found.values()];
}

function renderLecture(root,t,o,plan){
  const {modern,screens,sections,parts,outline}=plan;
  const title=o.title||t.title||'Bài học';
  const abilityToSkip=Boolean(o.teacherEdit||o.teacher||!o.onClose);
  const storageKey=t.id&&!abilityToSkip?'ltt-bg:'+t.id:null;
  const progress=lectureProgress(storageKey?store.get(storageKey,null):null,screens,sections);
  const review=()=>progress.done[sections.length];
  const folded=new Set(), missed=new Set();
  const quizCount=screens.filter(sc=>sc.type==='quiz').length;
  const savedScreen=progress.seen.at(-1);
  let i=Math.min(screens.length-1,Math.max(0,o.start??(review()&&outline>=0?outline:savedScreen??0)));
  if(!abilityToSkip&&!review()&&screens[i].section>=0&&!unlocked(screens[i].section))i=0;
  let noticeTimer, screenLoadTimer, loadingVersion=0;

  root.classList.add('lstep-host');
  root.innerHTML=`<div class="lstep ls-lecture">
    <div class="ls-top">
      ${o.onClose?'<button type="button" class="ls-x" aria-label="Thoát lý thuyết">×</button>':''}
      <div class="ls-prog" role="progressbar" aria-label="Tiến độ bài học" aria-valuemin="0" aria-valuemax="${screens.length}"><b></b></div>
      <button type="button" class="ls-ed ls-toc">Mục lục</button>
      ${o.teacherEdit?'<button type="button" class="ls-ed ls-edit">Sửa</button>':''}
    </div>
    <div class="ls-part"></div>
    <div class="ls-content"><aside class="ls-pin" hidden></aside><div class="ls-stage"></div>
      <div class="ls-loading" hidden><p role="status"></p><button type="button" class="ls-mini" hidden>Thử lại</button></div>
    </div>
    <div class="ls-foot"><div class="ls-actions"><button type="button" class="ls-mini ls-recall" hidden>Nhắc lại</button>
      <button type="button" class="ls-go"></button></div></div>
    <div class="ls-notice" role="status" hidden></div>
  </div>`;
  const box=root.firstElementChild, children=selector=>box.querySelector(selector);
  const bar=children('.ls-prog'), stage=children('.ls-stage'), pin=children('.ls-pin'), go=children('.ls-go');
  const recall=children('.ls-recall'), toc=children('.ls-toc'), notice=children('.ls-notice'), content=children('.ls-content');
  const save=()=>{if(storageKey)store.set(storageKey,progress)};
  const loading=children('.ls-loading'), actions=children('.ls-actions');
  function advanceLabel(){
    const section=sections[screens[i].section];
    return section?.number&&section.last===i?'Xong phần '+section.number:'Tiếp tục';
  }

  function unlocked(index){
    if(abilityToSkip||review()||index===0)return true;
    const before=sections[index-1];
    return progress.done[index-1]||Number(progress.pos[index])>sections[index].first||
      progress.seen.some(at=>screens[at]?.section===index)||
      (!before?.number&&!before?.opening);
  }

  function announce(message){
    notice.textContent=message;
    notice.hidden=false;
    clearTimeout(noticeTimer);
    noticeTimer=setTimeout(()=>{notice.hidden=true},1800);
  }

  function remember(){
    progress.seen=progress.seen.filter(at=>at!==i);
    progress.seen.push(i);
    const section=screens[i].section;
    if(section>=0)progress.pos[section]=i;
    if(screens[i].type==='end'){
      if(section>=0)progress.done[section]=true;
      if(sections.every((_,idx)=>progress.done[idx]))progress.done[sections.length]=true;
    }
    save();
    bar.setAttribute('aria-valuenow',progress.seen.length);
    bar.firstElementChild.style.width=progress.seen.length/screens.length*100+'%';
  }

  function goto(index,focus=true){
    i=index;
    show();
    if(focus)stage.querySelector('.ls-screen')?.focus({preventScroll:true});
  }

  function advance(){
    const index=screens[i].section, section=sections[index];
    if(section?.last===i){
      progress.done[index]=true;
      save();
      if(section.number)announce('Xong phần '+section.number+' ✓');
    }
    if(i+1<screens.length){sfx.tap();goto(i+1)}
  }

  function sectionCards(indices,short=false){
    return indices.map(index=>{
      const section=sections[index], lock=!unlocked(index), done=progress.done[index];
      const position=progress.pos[index]-section.first+1, total=section.last-section.first+1;
      const current=screens[i].section===index;
      const inProgress=!done&&!lock&&(current||progress.seen.includes(progress.pos[index]));
      const description=short&&section.goal?'Em sẽ: '+section.goal:
        done?'Đã xong · chạm để học lại':lock?'Học xong phần trước để mở':
        inProgress?'Đang học · màn '+position+'/'+total:section.goal||'';
      return `<button type="button" class="ls-card${done?' ls-card-done':''}" data-section="${index}"
        ${lock?'aria-disabled="true"':''} ${current?'aria-current="step"':''}>
        <span class="ls-card-no" aria-hidden="true">${done?'✓':section.number|| (section.opening?'★':'⚑')}</span>
        <span><strong>${lectureTex(section.name)}</strong>${description?`<small>${short&&lock?'Học xong phần trước để mở. ':''}${lectureTex(description)}</small>`:''}
        ${!short&&inProgress?`<progress max="${total}" value="${position}" aria-label="Tiến độ phần"></progress>`:''}</span>
      </button>`;
    }).join('');
  }

  function openSection(index){
    if(!unlocked(index)){announce('Học xong phần trước để mở');return false}
    goto(progress.done[index]?sections[index].first:progress.pos[index]);
    return true;
  }

  function sheet(label,html,extra=''){
    const dialog=document.createElement('dialog');
    dialog.className='ls-sheet '+extra;
    dialog.setAttribute('aria-label',label);
    dialog.innerHTML=`<div class="ls-sheet-content"><button type="button" class="ls-sheet-close" aria-label="Đóng">×</button>${html}</div>`;
    dialog.querySelector('button').onclick=()=>dialog.close();
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    dialog.addEventListener('close',()=>dialog.remove(),{once:true});
    box.append(dialog);
    dialog.showModal();
    typeset(dialog);
    return dialog;
  }

  toc.onclick=()=>{
    const dialog=sheet('Mục lục',`<h3>Mục lục · ${esc(title)}</h3><div class="ls-cards">${sectionCards(sections.map((_,n)=>n))}</div>
      ${abilityToSkip||review()?'':'<p class="ls-hint">Học xong một phần để mở phần tiếp theo.</p>'}`);
    dialog.querySelectorAll('[data-section]').forEach(button=>{
      button.onclick=()=>{
        const index=Number(button.dataset.section);
        if(!unlocked(index))return;
        dialog.close();
        openSection(index);
      };
    });
  };
  if(o.onClose)children('.ls-x').onclick=()=>{root._lectureDispose?.();o.onClose()};
  if(o.teacherEdit)children('.ls-edit').onclick=o.teacherEdit;
  stage.addEventListener('click',event=>{
    const img=event.target.closest('img.fig');
    if(!img||img.closest('.hb-pic,.ls-opt'))return;
    const src=img.getAttribute('src');
    sheet('Hình phóng to','<h3>Hình</h3><div class="ls-picture-full"><img class="fig" src="'+esc(src)+'" alt="'+esc(img.alt)+'"></div>','ls-sheet-zoom');
  });
  recall.onclick=()=>{
    const section=sections[screens[i].section];
    if(!section?.recap)return;
    sheet('Nhắc lại',`<h3>Nhắc lại · ${lectureTex(section.name)}</h3><div class="ls-text">${lectureTex(section.recap)}</div>`);
  };

  function showWhenReady(images,version){
    if(!images.length){remember();return}
    const status=loading.querySelector('p'), retry=loading.querySelector('button');
    const disabled=go.disabled;
    let loaded=0;
    const setMessage=()=>{status.textContent='Đang tải hình cho màn này… '+loaded+'/'+images.length};
    function fail(){
      if(version!==loadingVersion)return;
      loadingVersion++;
      clearTimeout(screenLoadTimer);
      status.textContent='Chưa tải đủ hình cho màn này.';
      retry.hidden=false;
    }
    content.dataset.loading='true';
    stage.inert=true;
    pin.inert=true;
    actions.inert=true;
    go.disabled=true;
    retry.hidden=true;
    retry.onclick=show;
    loading.hidden=false;
    setMessage();
    screenLoadTimer=setTimeout(fail,15000);
    Promise.all(images.map(image=>lectureImageReady(image).then(()=>{
      if(version===loadingVersion){loaded++;setMessage()}
    }))).then(()=>{
      if(version!==loadingVersion)return;
      clearTimeout(screenLoadTimer);
      loading.hidden=true;
      delete content.dataset.loading;
      stage.inert=false;
      pin.inert=false;
      actions.inert=false;
      go.disabled=disabled;
      remember();
    },fail);
  }

  function show(){
    const version=++loadingVersion;
    clearTimeout(screenLoadTimer);
    loading.hidden=true;
    delete content.dataset.loading;
    stage.inert=false;
    pin.inert=false;
    actions.inert=false;
    const sc=screens[i], section=sections[sc.section];
    box.dataset.i=i;
    children('.ls-part').textContent=section?.number?
      'Phần '+section.number+'/'+parts.length+' · '+section.name:
      title+' · '+(section?.name||(review()?'Ôn lại':sc.type==='end'?'Hoàn thành':'Bài học hôm nay'));
    recall.hidden=!section?.recap||sc.type==='end';
    stage.scrollTop=0;
    go.disabled=false;
    go.textContent=advanceLabel();
    go.onclick=advance;

    const picture=sc.figure;
    const parsedFrames=picture?.kind==='hinhbuoc'?parseHinhBuoc(picture.src):null;
    const frames=parsedFrames?.frames.length?parsedFrames:null;
    const currentState={...sc.state};
    const canDraw=picture?.kind==='mau'&&picture.mau?.name==='cat-tuyen';
    const modelOptions={
      tap:canDraw&&sc.type==='tap',
      region:canDraw&&sc.type==='region',
      slide:canDraw&&sc.type==='slide'?'from':false,
    };
    pin.onclick=null;
    pin.onkeydown=null;
    let frame=Math.min(frames?.frames.length||1,Math.max(1,currentState.buoc||1));
    const activeFold=section?.number?sc.section:i+sections.length;
    const animateFrame=sc.type==='opening'||sc.type==='steps';
    const staticImage=picture?.kind==='tikz'?lectureTex(picture.src):'';
    const stepImage=()=>gmImg(frames.frames[frame-1]);
    const frameMarkup=()=>`<div class="ls-frames">${frames.frames.map((key,index)=>
      `<div class="ls-frame-pic" aria-hidden="${index+1!==frame}">${gmImg(key)}</div>`).join('')}</div>`;

    function paintPin(){
      pin.hidden=!picture;
      content.classList.toggle('ls-has-pin',Boolean(picture));
      if(!picture){pin.replaceChildren();return}
      const isFolded=folded.has(activeFold);
      const body=frames?frameMarkup():canDraw?catTuyen(picture.mau.params,currentState,modelOptions):staticImage;
      const canZoom=!modelOptions.tap&&!modelOptions.region&&(frames||body.startsWith('<img')||canDraw);
      pin.innerHTML=`<div class="ls-pin-bar"><span>${sc.shared?'Hình dùng chung cho phần '+section.number:'Hình'}</span>
        <button type="button" class="ls-pin-fold" aria-expanded="${!isFolded}">${isFolded?'▸ Hiện hình':'Thu gọn ▴'}</button></div>
        <div class="ls-picture" ${isFolded?'hidden':''}>${body}${canZoom?'<button type="button" class="ls-pin-zoom" aria-label="Phóng to hình">⤢</button>':''}</div>`;
      const pictureBox=pin.querySelector('.ls-picture'), fold=pin.querySelector('.ls-pin-fold');
      const zoomButton=pin.querySelector('.ls-pin-zoom');
      if(frames&&zoomButton)zoomButton.hidden=!FIGS[frames.frames[frame-1]];
      if(zoomButton)zoomButton.onclick=()=>{
        sheet('Hình phóng to',`<h3>Hình</h3><div class="ls-picture-full">${frames?stepImage():body}</div>`,'ls-sheet-zoom');
      };
      pictureBox.addEventListener('click',event=>{if(event.target.closest('img.fig'))zoomButton?.click()});
      fold.onclick=()=>{
        const show=pictureBox.hidden;
        if(show)folded.delete(activeFold);else folded.add(activeFold);
        pictureBox.hidden=!show;
        fold.setAttribute('aria-expanded',String(show));
        fold.textContent=show?'Thu gọn ▴':'▸ Hiện hình';
      };
    }
    paintPin();

    const framePages=[...pin.querySelectorAll('.ls-frame-pic')];
    const frameLoads=framePages.map(page=>{
      const image=page.querySelector('img');
      const load={ready:!image};
      if(!image)return load;
      if(page.getAttribute('aria-hidden')==='false')image.fetchPriority='high';
      // Giải mã ngay khi màn xuất hiện. Nếu chạm sớm, giữ khung cũ đến khi khung mới sẵn sàng.
      load.promise=lectureImageReady(image).catch(()=>{
        page.innerHTML='<span class="figmiss">Không tải được hình</span>';
      }).then(()=>{load.ready=true});
      return load;
    });
    let frameRequest=0;
    function setFrame(index,onShown){
      const ticket=++frameRequest, page=framePages[index-1], load=frameLoads[index-1];
      if(!page)return;
      const show=()=>{
        if(ticket!==frameRequest||!page.isConnected)return;
        if(index!==frame){
          framePages[frame-1].setAttribute('aria-hidden','true');
          page.setAttribute('aria-hidden','false');
          frame=index;
        }
        const zoom=pin.querySelector('.ls-pin-zoom');
        if(zoom)zoom.hidden=!page.querySelector('img');
        onShown?.();
      };
      if(load.ready)show();else load.promise.then(show);
    }

    const label=sc.type==='vidu'?'Ví dụ':sc.type==='quiz'?(sc.doan?'Em đoán bước tiếp theo':'Thử ngay'):LS_KIND[sc.kind];
    const heading=label?`<span class="ls-kind" data-k="${sc.kind|| (sc.type==='quiz'?'thungay':'vidu')}">${label}</span>`:'';
    const speech=sc.say?`<div class="ls-say"><div class="ls-girl" aria-hidden="true">${owlSVG}</div><div class="ls-bub">${sc.say}</div></div>`:'';
    const optionalGuide=modern&&sc.type==='quiz'&&Boolean(speech);
    const mainTitle=sc.title?`<h2>${lectureTex(sc.title)}</h2>`:'';
    let body='';
    if(sc.type==='outline'){
      const count=parts.length,minutes=Math.max(1,Math.round(screens.length*25/60));
      const indices=parts.map(part=>sections.indexOf(part));
      body=`<h2>${review()?'Ôn lại':'Bài học hôm nay'}</h2><p class="ls-outline-info">${count} phần · khoảng ${minutes} phút</p>
        <div class="ls-cards">${sectionCards(indices,true)}</div>`;
    }else if(sc.type==='end'){
      body=`<h2>Em đã học${sc.bullets.length?'':' xong!'}</h2>${sc.bullets.length?
        `<ul class="ls-bullets">${sc.bullets.map(text=>`<li>${lectureTex(text)}</li>`).join('')}</ul>`:''}<div class="ls-end"></div>`;
    }else if(sc.type==='quiz'){
      const order=shuffle(sc.opts.map((_,n)=>n));
      body=`<div class="ls-q">${sc.q}</div><div class="ls-opts" role="group" aria-label="Các phương án">${order.map(n=>
        `<button type="button" class="ls-opt" data-option="${n}" aria-pressed="false">${sc.opts[n].html}</button>`).join('')}</div>
        <div class="ls-answer-note" role="status" hidden></div>`;
    }else if(sc.type==='vidu'){
      const steps=sc.solution||[sc.sol];
      body=`<div class="ls-text">${sc.html}</div><div class="ls-answer-steps">${steps.map(step=>`<div class="ls-sol" hidden>${step}</div>`).join('')}</div>
        <p class="ls-center"><button type="button" class="ls-mini ls-reveal">Xem lời giải (0/${steps.length})</button></p>`;
    }else if(sc.type==='opening'||sc.type==='steps'){
      body=frames?`<div class="ls-frame-actions"><button type="button" class="ls-mini ls-frame-back">Lùi</button>
        <button type="button" class="ls-mini ls-frame-next"></button></div>
        <div class="ls-frame-caption" aria-live="polite"></div>`:'';
    }else if(sc.type==='lab'){
      body=`<div class="ls-lab">${sc.html}</div><p class="ls-hint">Chạm vào hình để khám phá</p>`;
    }else if(sc.type==='gmstep'){
      body=`<span class="ls-kind" data-k="buoc">${sc.no}</span><div class="gm-goal">${sc.goal}</div>
        <div class="ls-text">${sc.html}</div>${sc.why?`<details class="gm-why"><summary>Vì sao?</summary><div>${sc.why}</div></details>`:''}`;
    }else if(sc.type==='tree'){
      body=`<p class="gm-tip">Chạm ô viền cam để mở nhánh.</p>${gmTreeHTML(sc.nodes)}`;
    }else if(['tap','region','slide','calc'].includes(sc.type)){
      const prompt=sc.tap?.prompt||sc.region?.prompt;
      body=`${prompt&&prompt!==sc.cherry?`<p>${lectureTex(prompt)}</p>`:''}${canDraw?(sc.type==='calc'?'<div class="ls-calc"></div>':
          sc.type==='slide'?`<p class="ls-center"><button type="button" class="ls-mini ls-slide-start">${lectureTex(sc.slide.label)} ↓</button></p>`:
          ''):'<p class="ls-hint">Màn này cần hình minh họa. Em có thể đi tiếp.</p>'}
        <div class="ls-geometry-note ls-answer-note" role="status" hidden></div>`;
    }else{
      body=`<div class="ls-text">${sc.html||''}</div>${canDraw&&sc.toggle?`<div class="ls-opts ls-toggles" role="group" aria-label="Đổi trạng thái hình">${sc.toggle.map((item,index)=>
          `<button type="button" class="ls-opt" data-figure-state="${index}" aria-pressed="false">${lectureTex(item.label)}</button>`).join('')}</div>`:''}`;
    }
    if(sc.gm)body=`<div class="gm-fig">${sc.fig||''}<button type="button" class="gm-debtn">Đề bài</button></div>`+body;
    const guide=optionalGuide?`<details class="ls-optional-guide"><summary>Lời dẫn của Cherry</summary>${speech}</details>`:'';
    stage.innerHTML=`<div class="ls-screen" tabindex="-1">${optionalGuide?'':speech}${heading}${mainTitle}${body}${guide}</div>`;
    if(canDraw&&(sc.toggle||['tap','region','slide','calc'].includes(sc.type))){
      bindLectureGeometry(sc,stage,pin,go,currentState,modelOptions,paintPin,advanceLabel);
    }

    if(sc.type==='outline'){
      go.textContent=review()?'Ôn lại phần 1':'Bắt đầu phần 1';
      go.onclick=()=>openSection(sections.indexOf(parts[0]));
      stage.querySelectorAll('[data-section]').forEach(button=>button.onclick=()=>openSection(Number(button.dataset.section)));
    }
    if(sc.type==='end'){
      go.textContent=o.finish?'Vào làm bài':'Xem lại mục lục';
      const again=()=>{missed.clear();goto(0)};
      go.onclick=()=>outline<0?again():goto(outline);
      if(o.finish)o.finish(stage.querySelector('.ls-end'),{quiz:quizCount,first:quizCount-missed.size},{again,go,lecture:true});
    }
    if(sc.type==='quiz'){
      let selected=null;
      const options=[...stage.querySelectorAll('[data-option]')];
      go.textContent='Kiểm tra';
      go.disabled=true;
      options.forEach(button=>button.onclick=()=>{
        selected=Number(button.dataset.option);
        options.forEach(b=>{b.classList.toggle('sel',b===button);b.setAttribute('aria-pressed',String(b===button))});
        go.disabled=false;
      });
      go.onclick=()=>{
        const answer=sc.opts[selected];
        if(!answer)return;
        const message=stage.querySelector('.ls-answer-note'), correct=answer.ok;
        if(correct)sfx.ok();else{sfx.no();missed.add(i)}
        if(frames){
          setFrame(Math.min(frames.frames.length,Math.max(1,sc.after?.buoc??(sc.after?frame:frames.frames.length))));
        }else if(canDraw&&sc.after){
          Object.assign(currentState,lectureGeometryState(currentState,sc.after));
          paintPin();
        }
        options.forEach(button=>{
          button.disabled=true;
          const option=sc.opts[Number(button.dataset.option)];
          button.classList.toggle('right',option.ok);
          button.classList.toggle('wrong',!option.ok&&option===answer);
        });
        message.classList.add(correct?'ok':'no');
        message.innerHTML=`<strong>${correct?'Chính xác!':'Chưa đúng'}</strong><div>${answer.ex||''}</div>`;
        message.hidden=false;
        typeset(message);
        if(message.getBoundingClientRect().bottom>stage.getBoundingClientRect().bottom)message.scrollIntoView({block:'nearest'});
        go.textContent=!correct&&(!modern||sc.doan)?'Thử lại':advanceLabel();
        go.onclick=!correct&&(!modern||sc.doan)?show:advance;
      };
    }
    if(sc.type==='vidu'){
      const steps=[...stage.querySelectorAll('.ls-sol')], reveal=stage.querySelector('.ls-reveal');
      let opened=0;
      go.disabled=steps.length>0;
      reveal.onclick=()=>{
        const step=steps[opened++];
        step.hidden=false;
        typeset(step);
        lsFitFigs(stage);
        reveal.hidden=opened===steps.length;
        reveal.textContent='Bước tiếp ('+opened+'/'+steps.length+')';
        go.disabled=opened<steps.length;
        if(go.disabled)reveal.scrollIntoView({block:'nearest'});else go.focus({preventScroll:true});
      };
    }
    if(animateFrame&&frames){
      const back=stage.querySelector('.ls-frame-back'), next=stage.querySelector('.ls-frame-next');
      const caption=stage.querySelector('.ls-frame-caption'), count=frames.frames.length;
      const renderStep=()=>{
        caption.innerHTML=`<strong>Bước ${frame}/${count}</strong><div>${lectureTex(frames.caps[frame-1]||'')}</div>`;
        typeset(caption);
        back.disabled=frame<=1;
        next.disabled=frame>=count;
        next.textContent=sc.nutbuoc?sc.nutbuoc+' ('+(frame-1)+'/'+Math.max(0,count-1)+')':'Bước sau ›';
        go.disabled=frame<count&&frames.frames.every(key=>FIGS[key]);
      };
      back.onclick=()=>setFrame(frame-1,renderStep);
      next.onclick=()=>setFrame(frame+1,renderStep);
      renderStep();
    }
    if(sc.type==='lab'){
      bindAuthoredTheory(stage);
      const lab=stage.querySelector('.ls-lab'), hbs=[...lab.querySelectorAll('.hb')];
      go.disabled=Boolean(lab.querySelector('button,.hb-pic'));
      lab.addEventListener('click',event=>{
        if(event.target.closest('button,.hb-pic')){
          const current=i;
          queueMicrotask(()=>{
            if(current===i&&hbs.every(w=>Number(w.dataset.k||0)>=w.querySelectorAll('.hb-pic img').length-1))go.disabled=false;
          });
        }
      });
    }
    if(sc.type==='tree'){
      go.disabled=Boolean(stage.querySelector('.gm-node.can'));
      stage.querySelectorAll('.gm-node.can').forEach(node=>node.onclick=()=>{
        node.parentElement.querySelectorAll(':scope>ul>li').forEach(li=>li.classList.remove('hide'));
        node.classList.remove('can');
        go.disabled=Boolean(stage.querySelector('.gm-tree li.hide'));
      });
    }
    stage.querySelector('.gm-debtn')?.addEventListener('click',()=>sheet('Đề bài',`<h3>Đề bài</h3><div>${sc.gm.de}</div>${sc.gm.full}`));
    typeset(stage);
    lsFitFigs(stage);
    // Chỉ lấy hình thuộc màn này và các phần có thể mở ngay trên màn.
    const extras=[sc.gm?.de,sc.gm?.full,...(sc.opts||[]).map(option=>option.ex)];
    if(animateFrame&&frames)extras.push(...frames.caps.map(lectureTex));
    if(canDraw){
      const feedback=[sc.tap?.ok,sc.tap?.hint,...Object.values(sc.tap?.nhac||{}),
        sc.region?.ok,sc.slide?.after,sc.calc?.ketluan,...(sc.calc?.items||[]).flatMap(item=>[
          item.q,item.correct,item.wrong,item.explainCorrect,item.explainWrong
        ])];
      extras.push(...feedback.filter(Boolean).map(lectureTex));
    }
    showWhenReady(o.onClose?lectureScreenImages(content,extras):[],version);
  }

  const resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>{
    if(stage.clientWidth){stage.querySelectorAll('img.fig').forEach(img=>{if(img.complete)lsFitFig(img,stage)});mathFit(stage)}
  }):null;
  resize?.observe(stage);
  root._lectureDispose=()=>{loadingVersion++;resize?.disconnect();clearTimeout(noticeTimer);clearTimeout(screenLoadTimer)};
  show();
}

// Xem lại lý thuyết khi đang làm bài: bản tóm tắt gọn trên một trang (không đi từng màn).
function renderLessonSummary(root,t){
  const builtIn=builtInLesson(t);
  const items=(t.theory||[]).filter(it=>!['loidan','minhhoa','thungay','giaimau'].includes(it.k));
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
