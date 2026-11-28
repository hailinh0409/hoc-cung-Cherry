/* ---------- dạng mới: Sắp xếp lời giải (exsx) và Sơ đồ phân tích đi lên (exsd) ----------
   Chạm ô trống (dòng lời giải / ô sơ đồ) rồi chạm khối ở kho bên dưới để điền; chạm lại ô đang sáng để gỡ khối.
   Bản đồ: phải đúng hết mới tính đúng. Thi đấu: được điểm theo tỉ lệ dòng/ô đúng (G.frac). */
const SD_SLOT_S=20,SX_EXTRA_S=20; // giây cộng thêm khi Thi đấu: mỗi ô trống của sơ đồ / mỗi câu sắp xếp
const isQ2=q=>q&&(q.type==='exsx'||q.type==='exsd');
const q2Slots=q=>q.type==='exsd'?q.hid.length+q.hidc.length:q.steps.length;
const tsP=el=>window.__mjReady?MathJax.typesetPromise([el]).catch(()=>{}).then(()=>mathFit(el)):Promise.resolve();
const sdById=q=>Object.fromEntries(q.nodes.map(n=>[n.id,n]));
const sdOrder=q=>{const out=[],root=q.nodes.find(n=>!n.p),walk=n=>{out.push(n);q.nodes.filter(c=>c.p===n.id).forEach(walk)};if(root)walk(root);return out};

function q2Init(q){
  if(q.type==='exsx'){let id=0;const bl=[...q.steps.map((s,i)=>({t:s.t,k:'s',i})),...(q.bad||[]).filter(b=>!q.steps.some(s=>s.t===b.t)).map(b=>({t:b.t,k:'x',why:b.why||''}))];
    G.q2={blocks:shuffle(bl).map(b=>({...b,id:id++})),place:q.steps.map(()=>null),sel:null};return}
  const order=sdOrder(q),hid=new Set(q.hid),hidc=new Set(q.hidc),slots=[];
  order.forEach(n=>{if(hid.has(n.id))slots.push({key:'n'+n.id,kind:'n',id:n.id});if(hidc.has(n.id))slots.push({key:'c'+n.id,kind:'c',id:n.id})});
  const dedup=a=>a.filter(b=>!b.trap||!a.some(x=>!x.trap&&x.t===b.t));
  const nb=order.filter(n=>hid.has(n.id)).map(n=>({t:n.t,k:'n',nid:n.id})).concat((q.bad||[]).map(b=>({t:b.t,k:'n',why:b.why||'',trap:1})));
  const cb=order.filter(n=>hidc.has(n.id)).map(n=>({t:n.c,k:'c',nid:n.id})).concat((q.badc||[]).map(b=>({t:b.t,k:'c',why:b.why||'',trap:1})));
  let id=0;const nblk=shuffle(dedup(nb)).map(b=>({...b,id:id++})),cblk=shuffle(dedup(cb)).map(b=>({...b,id:id++}));
  G.q2={slots,nblk,cblk,fill:{},sel:(slots.find(s=>s.kind==='n')||slots[0]||{}).key||null}}
const q2Blk=id=>{const S=G.q2;return (S.blocks||S.nblk.concat(S.cblk)).find(b=>b.id===id)};

/* ---- sơ đồ: HTML (dùng cho màn làm bài, lời giải đúng, xem đáp án). v = {txt(key), cls(key), src(n), hl, live} ---- */
function sdHTML(q,v){const by=sdById(q),hid=new Set(q.hid),hidc=new Set(q.hidc),kids=id=>q.nodes.some(c=>c.p===id),H=k=>v.hl&&v.hl.has(k)?' hl':'';let h='';
  const slot=(key,cc,empty)=>{const t=v.txt(key),tg=v.live?'button':'span';return `<${tg} class="sd-slot${cc?' cc':''} ${t!=null?'full':'empty'} ${v.cls(key)||''}${v.live&&G.q2&&G.q2.sel===key?' sel':''}${H(key)}" data-s="${key}">${t!=null?tex(t):empty}</${tg}>`};
  q.nodes.forEach(n=>{const leaf=!kids(n.id),src=hid.has(n.id)?v.src(n):n;
    const box=`<div class="sd-tb${hid.has(n.id)?' hs':''}" data-tb="${esc(n.id)}" data-par="${esc(n.p)}">${hid.has(n.id)?slot('n'+n.id,false,'?'):tex(n.t)}</div>`;
    const why=hidc.has(n.id)?slot('c'+n.id,true,'? căn cứ'):(src&&src.c?`<span class="sd-chip${H('c'+n.id)}">${tex(src.c)}</span>`:'');
    h+=`<div class="sd-node" data-node="${esc(n.id)}">${box}${leaf&&why?`<div class="sd-lr">${why}</div>`:''}</div>`;
    if(!leaf)h+=`<div class="sd-jn" data-jn="${esc(n.id)}">${why||(hid.has(n.id)&&!src?'<span class="sd-pend">…</span>':'<span class="sd-dot"></span>')}</div>`});
  return `<div class="sd-box"><div class="sd-tw"><div class="sd-sz"><div class="sd-ti"><svg class="sd-ar"></svg>${h}</div></div></div><button class="sd-eg l" aria-label="Xem nhánh bên trái">‹</button><button class="sd-eg r" aria-label="Xem nhánh bên phải">›</button></div><div class="sd-panh">⟷ Vuốt ngang để xem các nhánh hai bên</div>`}
// Sơ đồ đã điền đúng hết (lời giải đúng / xem đáp án)
function sdFull(q,hl){const by=sdById(q);return sdHTML(q,{txt:k=>{const n=by[k.slice(1)];return k[0]==='n'?n.t:n.c},cls:()=>'',src:n=>n,hl,live:false})}

/* ---- xếp cây nhánh ngang: kết luận ở trên, các ô cần có ở dưới, mũi tên đi lên.
   Mỗi nhánh con đặt sát nhánh bên cạnh nhất có thể, chỉ cần không chồng nhau ở cùng một tầng. ---- */
function sdPlace(ti){const GAP=14,VG=24,PAD=6;ti.style.width='2000px';
  const E={},J={},Wd={},dep={},par={},ids=[];
  ti.querySelectorAll('.sd-node').forEach(e=>{const id=e.dataset.node;ids.push(id);E[id]=e;J[id]=ti.querySelector(`.sd-jn[data-jn="${CSS.escape(id)}"]`);par[id]=e.querySelector('.sd-tb').dataset.par||'';
    Wd[id]=Math.max(e.offsetWidth,J[id]?J[id].offsetWidth:0)});
  const kids=id=>ids.filter(c=>par[c]===id),root=ids.find(id=>!par[id]);if(!root)return;
  const ht=k=>{const c=kids(k);return c.length?1+Math.max(...c.map(ht)):0};
  // nhánh lá đứng cạnh nhau, nhánh sâu nằm về một phía để mũi tên ngắn và không cắt nhau
  const order=id=>{const ks=kids(id),lv=ks.filter(k=>!ht(k)),dp=ks.filter(k=>ht(k));if(!dp.length||!lv.length)return ks;
    const before=lv.slice(0,Math.ceil(lv.length/2)),after=lv.slice(before.length);return dp.length===1?[...before,...dp,...after]:[...lv,...dp]};
  const lay=(id,d)=>{dep[id]=d;const half=Wd[id]/2,ks=order(id);if(!ks.length)return{pos:{[id]:0},L:[-half],R:[half]};
    const subs=ks.map(k=>lay(k,d+1)),offs=[];let L=null,R=null;
    subs.forEach(sb=>{if(!L){offs.push(0);L=sb.L.slice();R=sb.R.slice();return}
      let off=-Infinity;for(let k=0;k<Math.min(R.length,sb.L.length);k++)off=Math.max(off,R[k]+GAP-sb.L[k]);offs.push(off);
      sb.L.forEach((v,k)=>{L[k]=k<L.length?Math.min(L[k],v+off):v+off;R[k]=k<R.length?Math.max(R[k],sb.R[k]+off):sb.R[k]+off})});
    const mid=(offs[0]+offs[offs.length-1])/2,pos={[id]:0};subs.forEach((sb,i)=>{for(const x in sb.pos)pos[x]=sb.pos[x]+offs[i]-mid});
    return{pos,L:[-half,...L.map(v=>v-mid)],R:[half,...R.map(v=>v-mid)]}};
  const r=lay(root,0),minL=Math.min(...r.L),maxR=Math.max(...r.R),nd=Math.max(...Object.values(dep))+1,BH=Array(nd).fill(0),JH=Array(nd).fill(0);
  ids.forEach(id=>{BH[dep[id]]=Math.max(BH[dep[id]],E[id].offsetHeight);if(J[id])JH[dep[id]]=Math.max(JH[dep[id]],J[id].offsetHeight)});
  const Y=[PAD];for(let d=0;d<nd-1;d++)Y.push(Y[d]+BH[d]+VG+JH[d]+VG);
  ids.forEach(id=>{const x=r.pos[id]-minL+PAD,d=dep[id],e=E[id];e.style.left=(x-e.offsetWidth/2)+'px';e.style.top=Y[d]+'px';
    if(J[id]){J[id].style.left=(x-J[id].offsetWidth/2)+'px';J[id].style.top=(Y[d]+BH[d]+VG)+'px'}});
  ti.style.width=(maxR-minL+2*PAD)+'px';ti.style.height=(Y[nd-1]+BH[nd-1]+PAD)+'px'}
function sdArrow(x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,h=9,w=5.5,bx=x2-ux*h,by=y2-uy*h;
  return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}"/><polygon points="${x2},${y2} ${bx-uy*w},${by+ux*w} ${bx+uy*w},${by-ux*w}"/>`}
function sdLayOne(wrap){const sz=wrap.firstElementChild,ti=sz.firstElementChild,svg=ti.querySelector('svg.sd-ar');if(!wrap.clientWidth)return;ti.style.transform='none';sdPlace(ti);
  // đo bằng offset (không bị ảnh hưởng bởi hiệu ứng phóng to/thu nhỏ của khung chứa)
  const R=e=>{let l=0,t=0,x=e;while(x&&x!==ti){l+=x.offsetLeft;t+=x.offsetTop;x=x.offsetParent}return{l,t,w:e.offsetWidth,h:e.offsetHeight}};let p='';
  ti.querySelectorAll('.sd-jn').forEach(j=>{const id=j.dataset.jn,tb=ti.querySelector(`.sd-tb[data-tb="${CSS.escape(id)}"]`);if(!tb)return;const T=R(tb),J=R(j),cx=J.l+J.w/2;
    p+=sdArrow(cx,J.t-3,T.l+T.w/2,T.t+T.h+3);
    ti.querySelectorAll(`.sd-tb[data-par="${CSS.escape(id)}"]`).forEach(k=>{const K=R(k),kx=K.l+K.w/2,ex=cx+Math.max(-J.w/2+8,Math.min(J.w/2-8,(kx-cx)*.25));p+=sdArrow(kx,K.t-3,ex,J.t+J.h+3)})});
  const W=ti.offsetWidth,H=ti.offsetHeight;svg.setAttribute('width',W);svg.setAttribute('height',H);svg.innerHTML=p;
  // vừa màn thì thu nhỏ; quá rộng (nhỏ hơn 70%) thì giữ 70% và cho vuốt ngang, mở ra ở giữa (ngay dưới kết luận)
  let s=Math.min(1,(wrap.clientWidth-8)/W);const pan=s<.7;if(pan)s=.7;const box=wrap.parentElement;box.classList.toggle('pan',pan);
  ti.style.transform=`scale(${s})`;sz.style.width=W*s+'px';sz.style.height=H*s+'px';
  if(pan&&!wrap.dataset.c){wrap.dataset.c=1;wrap.scrollLeft=(wrap.scrollWidth-wrap.clientWidth)/2}
  const edge=()=>{const mx=wrap.scrollWidth-wrap.clientWidth;box.classList.toggle('L',pan&&wrap.scrollLeft>4);box.classList.toggle('R',pan&&wrap.scrollLeft<mx-4)};
  wrap.onscroll=()=>{if(wrap.closest('#stage')&&G&&G.q2)G.q2.sx=wrap.scrollLeft;edge()};edge();
  box.querySelector('.sd-eg.l').onclick=()=>wrap.scrollBy({left:-wrap.clientWidth*.6,behavior:'smooth'});
  box.querySelector('.sd-eg.r').onclick=()=>wrap.scrollBy({left:wrap.clientWidth*.6,behavior:'smooth'})}
function sdLay(root){if(!root||!root.querySelectorAll)return;root.querySelectorAll('.sd-tw').forEach(w=>{try{sdLayOne(w)}catch(e){}})}
if(window.ResizeObserver){let lw=0;new ResizeObserver(()=>{const w=document.body.clientWidth;if(w!==lw){lw=w;sdLay(document.body)}}).observe(document.body)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>sdLay(document.body));

/* ---- màn làm bài ---- */
function q2Area(q){const S=G.q2,mk=S.mark||{};
  if(q.type==='exsx')return `<div class="sx-lbl">Lời giải (${S.place.filter(x=>x!=null).length}/${S.place.length} dòng)</div><ol class="sx-sol">${S.place.map((b,i)=>{const B=b!=null?q2Blk(b):null;
    return `<li><button class="sx-ln ${B?'full':'empty'} ${mk[i]||''}${S.sel===i&&!G.done?' sel':''}" data-ln="${i}"><span class="n">${i+1}</span><span class="t">${B?tex(B.t):'Chạm một khối ở kho để điền'}</span></button></li>`}).join('')}</ol>`;
  const by=sdById(q);
  return `<div class="sx-lbl">Sơ đồ: có các ô dưới thì suy ra ô trên</div>`+sdHTML(q,{live:!G.done,cls:k=>mk[k]||'',hl:null,
    txt:k=>S.fill[k]!=null?q2Blk(S.fill[k]).t:null,src:n=>{const F=S.fill['n'+n.id],B=F!=null?q2Blk(F):null;return B&&!B.trap?by[B.nid]:null}})}
function q2Dock(q){if(G.done)return '';const S=G.q2;
  if(q.type==='exsx'){const used=new Set(S.place.filter(x=>x!=null));
    return `<div class="q2kho"><p class="tip">Chạm khối để điền vào dòng trống (hoặc dòng đang sáng). Chạm lại dòng đang sáng để gỡ khối.</p><h3>Kho khối · có khối sai lẫn vào</h3><div class="blks">${S.blocks.map(b=>`<button class="blk${used.has(b.id)?' used':''}" data-b="${b.id}">${tex(b.t)}</button>`).join('')}</div><button class="btn" id="q2chk" ${S.place.every(x=>x!=null)?'':'disabled'}>Kiểm tra</button></div>`}
  const used=new Set(Object.values(S.fill)),sk=S.sel&&S.sel[0],kind=sk||((S.slots.find(x=>S.fill[x.key]==null)||S.slots[0]||{}).kind);
  const grp=(arr,k,title)=>arr.length?`<h3>${title}${kind===k?'<span class="need">ô đang sáng cần</span>':''}</h3><div class="blks${kind!==k?' off':''}">${arr.map(b=>`<button class="blk${k==='c'?' cc':''}${used.has(b.id)?' used':''}" data-b="${b.id}">${tex(b.t)}</button>`).join('')}</div>`:'';
  return `<div class="q2kho"><p class="tip">Chạm một ô để chọn, chạm lại ô đang sáng để gỡ khối ra.</p>${kind==='c'?grp(S.cblk,'c','Căn cứ')+grp(S.nblk,'n','Mệnh đề'):grp(S.nblk,'n','Mệnh đề')+grp(S.cblk,'c','Căn cứ')}<button class="btn" id="q2chk" ${S.slots.every(s=>S.fill[s.key]!=null)?'':'disabled'}>Kiểm tra</button></div>`}
function q2Draw(){const q=cur(),a=$('#q2a'),d=$('#dock');if(!a)return;const st=$('#stage'),y=st.scrollTop,sx=G.q2.sx;
  if(window.__mjReady&&MathJax.typesetClear)try{MathJax.typesetClear([a,d])}catch(e){}
  a.innerHTML=q2Area(q);d.innerHTML=q2Dock(q);q2Bind(q);
  const fix=()=>{sdLay(a);const w=a.querySelector('.sd-tw');if(w&&sx!=null)w.scrollLeft=sx;st.scrollTop=y};fix();
  Promise.all([tsP(a),tsP(d)]).then(fix)}
function q2Bind(q){const S=G.q2;
  $$('#q2a [data-ln]').forEach(b=>b.onclick=()=>{if(G.done)return;sfx.tap();const i=+b.dataset.ln;if(S.place[i]!=null&&S.sel===i){S.place[i]=null;S.sel=null}else S.sel=S.sel===i?null:i;q2Draw()});
  $$('#q2a button[data-s]').forEach(b=>b.onclick=()=>{if(G.done)return;sfx.tap();const k=b.dataset.s;if(S.fill[k]!=null&&S.sel===k)delete S.fill[k];else S.sel=k;q2Draw()});
  $$('#dock [data-b]').forEach(b=>b.onclick=()=>{if(G.done)return;sfx.tap();const B=q2Blk(+b.dataset.b);
    if(q.type==='exsx'){const i=S.sel!=null?S.sel:S.place.indexOf(null);if(i>=0){S.place[i]=B.id;S.sel=null}}
    else{const s=S.slots.find(s=>s.key===S.sel&&s.kind===B.k)||S.slots.find(s=>s.kind===B.k&&S.fill[s.key]==null);if(!s)return;S.fill[s.key]=B.id;
      const nx=S.slots.find(x=>x.kind===s.kind&&S.fill[x.key]==null)||S.slots.find(x=>S.fill[x.key]==null);S.sel=nx?nx.key:null}
    q2Draw()});
  const c=$('#q2chk');if(c)c.onclick=()=>q2Check(q)}

/* ---- chấm ---- */
function q2Check(q){const S=G.q2,wrong=[];let ok=0,tot=0,right='';S.mark={};
  if(q.type==='exsx'){const runs=[];q.steps.forEach((s,i)=>{const r=runs[runs.length-1];if(r&&s.g&&r.g===s.g)r.e=i;else runs.push({g:s.g,s:i,e:i})});
    const runOf=i=>runs.findIndex(r=>r.s<=i&&i<=r.e);
    S.place.forEach((id,i)=>{const B=q2Blk(id);tot++;const good=B.k==='s'&&runOf(B.i)===runOf(i);S.mark[i]=good?'ok':'no';if(good){ok++;return}
      const r=runs[runOf(B.i)];wrong.push(B.k==='x'?`Dòng ${i+1}: <span class="q2b">${tex(B.t)}</span> là khối sai.${B.why?' '+tex(B.why):''}`:`Dòng ${i+1}: <span class="q2b">${tex(B.t)}</span> đúng nhưng phải ở dòng ${r.s===r.e?r.s+1:(r.s+1)+' hoặc '+(r.e+1)}.`)});
    G.ansTxt=S.place.map((id,i)=>(i+1)+') '+q2Blk(id).t).join('; ');right=sxRight(q)}
  else{const by=sdById(q),nodeOk={},hl=new Set(),groups={};
    // các ô lá cùng ô cha được đổi chỗ cho nhau
    S.slots.filter(s=>s.kind==='n').forEach(s=>{const n=by[s.id],leaf=!q.nodes.some(c=>c.p===n.id),g=leaf?'L'+n.p:'N'+n.id;(groups[g]=groups[g]||[]).push(s)});
    Object.values(groups).forEach(ss=>{const need=ss.map(s=>by[s.id].t);ss.forEach(s=>{const B=q2Blk(S.fill[s.key]);tot++;const j=!B.trap?need.indexOf(B.t):-1,good=j>=0;
      if(good){need.splice(j,1);ok++;nodeOk[s.id]=B.nid}S.mark[s.key]=good?'ok':'no';
      if(!good){if(!B.trap)hl.add('n'+B.nid);wrong.push(B.trap?`<span class="q2b">${tex(B.t)}</span> là khối sai.${B.why?' '+tex(B.why):''}`:`<span class="q2b">${tex(B.t)}</span> đúng nhưng đặt nhầm ô. Chỗ đúng của nó được tô viền vàng trong sơ đồ đúng.`)}})});
    S.slots.filter(s=>s.kind==='c').forEach(s=>{const B=q2Blk(S.fill[s.key]);tot++;const occ=nodeOk[s.id]||s.id,exp=by[occ].c,good=!B.trap&&B.t===exp;
      S.mark[s.key]=good?'ok':'no';if(good){ok++;return}if(!B.trap)hl.add('c'+B.nid);
      wrong.push(B.trap?`Căn cứ <span class="q2b">${tex(B.t)}</span> chưa đúng.${B.why?' '+tex(B.why):''}`:`Căn cứ <span class="q2b">${tex(B.t)}</span> đặt nhầm chỗ (ô này cần: ${tex(exp)}). Chỗ đúng của nó được tô viền vàng.`)});
    G.ansTxt=S.slots.map(s=>'ô '+s.key+': '+q2Blk(S.fill[s.key]).t).join('; ');right=sdFull(q,hl)}
  const all=ok===tot;G.done=true;G.frac=tot?ok/tot:0;$('#qc').classList.add('lock');if(G.mode==='rank')S.mark={}; // Thi đấu: không tô đúng/sai trong trận
  q2Draw();
  result(all,$('#q2a'),all?'':whyBox(wrong)+`<div class="q2r">Đúng ${ok}/${tot} ${q.type==='exsx'?'dòng':'ô'}${G.mode==='rank'&&ok?` · được ${Math.round(100*G.frac)}% điểm câu`:''}. ${q.type==='exsx'?'Lời giải đúng:':'Sơ đồ đúng:'}</div>${right}`)}
function sxRight(q){const runs={};q.steps.forEach((s,i)=>{if(s.g)(runs[s.g]=runs[s.g]||[]).push(i+1)});
  return `<ol class="sx-sol">${q.steps.map((s,i)=>`<li><div class="sx-ln full"><span class="n">${i+1}</span><span class="t">${tex(s.t)}</span></div></li>`).join('')}</ol>`+
    Object.values(runs).filter(r=>r.length>1).map(r=>`<div class="q2r">Dòng ${r.join(', ')} đổi chỗ cho nhau được.</div>`).join('')}
// Xem đáp án (câu đã lưu, sửa câu, báo lỗi, hết giờ)
function q2Answer(q){const w=x=>x?`<div class="vw">↳ ${tex(x)}</div>`:'';
  const bad=(xs,lab)=>(xs||[]).map(b=>`<div class="va">${lab}: ${tex(b.t)}${w(b.why)}</div>`).join('');
  return q.type==='exsx'?sxRight(q)+bad(q.bad,'Khối sai'):sdFull(q,null)+bad(q.bad,'Mệnh đề sai')+bad(q.badc,'Căn cứ sai')}
