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

function authoredLessonPages(items){
  if(!items?.some(it=>['loidan','minhhoa','thungay'].includes(it.k)))return [];
  const groups=[];
  let group={guide:null,items:[]};
  for(const item of items){
    if(item.k==='loidan'){
      if(group.guide||group.items.length)groups.push(group);
      group={guide:item.body,items:[]};
    }else group.items.push(item);
  }
  groups.push(group);
  return groups.map(({guide,items},i)=>{
    const visuals=items.filter(it=>it.k==='minhhoa'||it.k==='hinhbuoc');
    const checks=items.filter(it=>it.k==='thungay');
    const notes=items.filter(it=>it.k!=='minhhoa'&&it.k!=='hinhbuoc'&&it.k!=='thungay');
    const label=notes.find(it=>it.title)?.title||`Ý ${i+1}`;
    return {label,title:label,guide:guide?tex(guide):'',visual:visuals.map(authoredTheoryHTML).join(''),
      notes:theoryHTML(notes),checks:checks.map(authoredTheoryHTML).join('')};
  });
}

function builtInPageHTML(p){
  return {label:p.concept,title:p.title,guide:esc(p.guide),
    visual:`${p.visual}<p class="lesson-caption" aria-live="polite">${esc(p.captions[0])}</p>`,
    notes:`<h3>${esc(p.concept)}</h3><p>${p.explanation}</p><h3>Ví dụ</h3><p>${p.example}</p>`,
    checks:`<div class="lesson-check"><h3>Thử ngay</h3><p>${p.prompt}</p><div class="lesson-choices" role="group" aria-label="Chọn đáp án">${p.choices.map((choice,n)=>`<button type="button" data-lesson-answer="${n}" aria-pressed="false">${choice}</button>`).join('')}</div><p class="lesson-feedback" aria-live="polite"></p></div>`};
}

function renderLessonMaterial(root,t){
  const builtIn=builtInLesson(t),pages=builtIn?builtIn.map(builtInPageHTML):authoredLessonPages(t.theory);
  const summary=(!pages.length||builtIn)?theoryHTML(t.theory):'';
  if(!pages.length){
    root.innerHTML=summary||'<div class="tbox"><p>Bài này chưa có tóm tắt lý thuyết.</p></div>';
    typeset(root);
    return;
  }
  const navigation=pages.length>1?`<nav class="lesson-nav" aria-label="Nội dung bài học">${pages.map((p,i)=>`<button type="button" data-lesson-page="${i}" ${i===0?'aria-current="step"':''}>${esc(p.label)}</button>`).join('')}</nav>`:'';
  root.innerHTML=navigation+pages.map((p,i)=>`<section class="lesson-page" aria-label="${esc(p.label)}" ${i===0?'':'hidden'}>
    ${p.guide?`<div class="lesson-guide"><div aria-hidden="true">${owlSVG}</div><div><b>Cherry</b><h2>${esc(p.title)}</h2><div>${p.guide}</div></div></div>`:''}
    ${p.visual||p.notes?`<div class="lesson-explore${p.visual&&p.notes?' lesson-explore--split':''}">
      ${p.visual?`<div class="lesson-visual${builtIn?'':' lesson-visual--authored'}">${p.visual}</div>`:''}
      ${p.notes?`<div class="lesson-notes">${p.notes}</div>`:''}
    </div>`:''}
    ${p.checks}
  </section>`).join('')+ (summary?`<details class="lesson-summary"><summary>Xem tóm tắt đầy đủ</summary>${summary}</details>`:'');

  const tabs=[...root.querySelectorAll('[data-lesson-page]')];
  const sections=[...root.querySelectorAll('.lesson-page')];
  tabs.forEach((tab,i)=>tab.onclick=()=>{
    tabs.forEach((item,n)=>{if(n===i)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current')});
    sections.forEach((section,n)=>{section.hidden=n!==i});
    typeset(sections[i]);
  });
  if(builtIn)sections.forEach((section,i)=>{
    const page=builtIn[i];
    const bindChoices=(selector,handle)=>{
      const buttons=section.querySelectorAll(selector);
      buttons.forEach((button,n)=>button.onclick=()=>{
        buttons.forEach(item=>item.setAttribute('aria-pressed',String(button===item)));
        handle(n);
      });
    };
    bindChoices('[data-visual]',n=>{
      section.querySelector('.lesson-caption').textContent=page.captions[n];
      if(page.illustrations)section.querySelector('[data-illustration]').textContent=page.illustrations[n];
    });
    bindChoices('[data-lesson-answer]',n=>{
      const correct=n===page.correct,feedback=section.querySelector('.lesson-feedback');
      feedback.dataset.correct=String(correct);
      feedback.textContent=page.feedback[n];
    });
  });
  bindAuthoredTheory(root);
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
  renderLessonMaterial(content,t);
  dialog.scrollTop=0;
}

$('#playTheory').innerHTML=bookSVG;
