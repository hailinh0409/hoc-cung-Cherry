window.__cherryUp=1;
/* ===================== BẢN APP THẬT: dữ liệu qua máy chủ ===================== */
let SERVERP=null,SESS=null,FIGS={};
const api=async(path,body,method)=>{const r=await fetch(path,{method:method||(body?'POST':'GET'),headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});
  let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw Object.assign(new Error((j&&j.error)||('Lỗi kết nối ('+r.status+')')),{status:r.status,data:j});return j};
const wrapDoc=x=>({id:x.id,exists:true,data:()=>x});
let topicVersion = '', lastCatalog = 0, lastSync = 0, lastPlayers = 0, syncSequence = 0;
// Danh sách người chơi (bảng xếp hạng, bạn bè, theo dõi) chỉ tải lại sau mỗi 10 phút để giảm lưu lượng Supabase.
const PLAYERS_EVERY = 10 * 60000;
async function loadAll(force = false) {
  const sequence = ++syncSequence;
  // Phiên bản bài đã gồm cả hình đã dịch, nên chỉ tải lại kho bài khi bài hoặc hình thật sự đổi.
  // Dự phòng: 3 giờ tải lại hẳn một lần, phòng khi bài bị sửa thẳng trên Supabase mà không đổi updated_at.
  const version = !force && Date.now() - lastCatalog < 3 * 3600000 ? topicVersion : '';
  const withPlayers = force || Date.now() - lastPlayers >= PLAYERS_EVERY;
  const q = [version ? 'topics=' + encodeURIComponent(version) : '', withPlayers ? '' : 'players=0'].filter(Boolean).join('&');
  const j = await api('/api/sync' + (q ? '?' + q : ''));
  if (sequence !== syncSequence) return;
  specialAccess = j.specialAccess === true;
  if (Array.isArray(j.topics)) {
    TOPICS = j.topics.map(t => fromDoc(wrapDoc(t)));
    FIGS = j.figs || {};
    topicVersion = j.topicVersion || '';
    lastCatalog = Date.now();
  }
  ASG=j.assignments||[]; MOC=j.moc||{}; BAI_CHAT_KHOI=chatGrades(j.chatGrades);
  if (Array.isArray(j.players)) { PLAYERS=j.players; ACCS=j.accounts||[]; ACCS_DEL=j.removed||[]; REPS=j.reports||[]; lastPlayers = Date.now(); }
  lastSync = Date.now();
}
function softRefresh(){const on=$$('.scr.on')[0]?.id;if($('#ovl').classList.contains('on')||on==='play')return;
  if(BANKON&&!QE&&on==='track'){if(document.activeElement&&document.activeElement.id==='bkQ')return;return bank(true)}
  if(QE&&on==='track'){const t=TOPICS.find(x=>x.id===QE);if(t)qedit(t);return}
  if(on==='track'&&$('#trTitle').textContent.startsWith('Tài khoản'))return accounts();if(on==='track'&&$('#trTitle').textContent.startsWith('Câu báo lỗi'))return reportsPage();if(on==='track'&&$('#trTitle').textContent.startsWith('Theo dõi'))return track();refresh()}
const after=p=>p.then(r=>{lastPlayers=0;loadAll().then(softRefresh).catch(()=>{});return r});
DB={doc:path=>{const i=path.indexOf('/'),c=path.slice(0,i),id=path.slice(i+1);return {
    update:v=>c==='settings'?after(api('/api/admin/settings',{action:id==='chat'?CHAT_SETTING_KEY:'moc',...v})):c==='reports'?after(api('/api/admin/report',v)):c==='topics'?after(api('/api/admin/topic',{id,...v})):c==='accounts'?after(v.restore?api('/api/admin/accounts',{action:'restore',id}):v.mon?api('/api/admin/accounts',{action:'mon',id,mon:v.mon}):('ph' in v)&&v.isDefault?api('/api/admin/accounts',{action:'reset',id}):Promise.resolve()):Promise.resolve(),
    set:v=>c==='players'?api('/api/me/save',{doc:v}):Promise.resolve(),
    delete:()=>c==='assignments'?after(api('/api/admin/assign?id='+encodeURIComponent(id),null,'DELETE')):c==='players'?after(api('/api/admin/samples',{id})):c==='accounts'?after(api('/api/admin/accounts',{action:'remove',id})):Promise.resolve()}},
  collection:c=>({doc:()=>({set:v=>c==='reports'?api('/api/report',v):c==='topics'?api('/api/admin/topic',{action:'create',...v}).then(async r=>{await loadAll();return r}):c==='assignments'?after(api('/api/admin/assign',v)):c==='accounts'?after(api('/api/admin/accounts',{action:'create',name:v.name,khoi:v.khoi,mon:v.mon})):Promise.resolve()})})};
/* đối chiếu với máy chủ sau khi lưu: phần máy chủ không chấp nhận thì bỏ */
function reconcile(sent,r){if(!r||!P)return;if(r.xp<sent.xp)P.xp-=sent.xp-r.xp;if(r.lp<sent.lp)P.lp=Math.max(0,P.lp-(sent.lp-r.lp));
  for(const id of Object.keys(sent.own||{}))if(!r.own[id]){delete P.own[id];for(const [k,v] of Object.entries(P.eq))if(v===id)delete P.eq[k]}
  P.spent=r.spent+Math.max(0,(P.spent||0)-(sent.spent||0));save()}
/* hình TikZ đã dịch */
const TIKZ_RE=/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g;
// Hình từng bước (\begin{hinhbuoc}): mỗi bước là một khung đã dịch, khóa trong FIGS là hbFrame(tikz,k) (lib/latex.js).
// HBS chỉ sống trong một lần gọi tex(): figSwap ghi, figImg đọc ngay sau đó.
let HBS=[];
const figSwap=s=>{HBS=[];return String(s??'').replace(HINHBUOC,(_,b)=>{const h=parseHinhBuoc(b);HBS.push({hs:h.frames.map(f=>FIGS[f]),caps:h.caps});return `@@HB:${HBS.length-1}@@`})
  .replace(TIKZ_RE,c=>{const k=c.replace(/(^|[^\\])%.*$/gm,'$1'),h=FIGS[k];return h?`@@FIG:${h}@@`:'@@FIG:none@@'})};
const hbHTML=x=>{if(!x||!x.caps.length)return '';const n=x.caps.length;
  if(x.hs.some(h=>!h))return '<span class="figmiss">Hình từng bước chưa dịch xong</span>';
  return `<div class="hb"><div class="hb-pic" role="button" tabindex="0" aria-label="Chạm để xem bước tiếp theo">${x.hs.map((h,i)=>`<img class="fig${i?'':' on'}" src="/hinh/${h}" alt="Hình bước ${i+1}">`).join('')}<span class="hb-hint">chạm để tiếp ›</span></div>`+
    `<div class="hb-dots" aria-hidden="true">${x.caps.map((_,i)=>`<i${i?'':' class="on"'}></i>`).join('')}</div>`+
    `<div class="hb-cap" aria-live="polite"><b>Bước 1/${n}</b><span>${brOut(esc(x.caps[0]))}</span></div>${x.caps.map(c=>`<template>${brOut(esc(c))}</template>`).join('')}`+
    `<div class="hb-btns"><button type="button" class="hb-prev" disabled>‹ Lùi</button><button type="button" class="hb-next">Tiếp ›</button></div></div>`};
const figImg=s=>s.replace(/@@HB:(\d+)@@/g,(_,i)=>hbHTML(HBS[+i])).replace(/@@FIG:([0-9a-f]{40}|none)@@/g,(_,h)=>h==='none'?'<span class="figmiss">Hình chưa dịch</span>':`<img class="fig" src="/hinh/${h}" alt="Hình vẽ" loading="lazy">`);
function hbGo(w,k){const imgs=[...w.querySelectorAll('.hb-pic img')],n=imgs.length;k=(k+n)%n;w.dataset.k=k;
  imgs.forEach((im,i)=>im.classList.toggle('on',i===k));[...w.querySelectorAll('.hb-dots i')].forEach((d,i)=>d.classList.toggle('on',i<=k));
  const cap=w.querySelector('.hb-cap');cap.querySelector('b').textContent=`Bước ${k+1}/${n}`;cap.querySelector('span').innerHTML=w.querySelectorAll('template')[k].innerHTML;typeset(cap);
  w.querySelector('.hb-prev').disabled=k===0;w.querySelector('.hb-next').textContent=k===n-1?'Xem lại từ đầu ↺':'Tiếp ›';w.querySelector('.hb-hint').hidden=k===n-1}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.hb-pic,.hb-next,.hb-prev');if(!b)return;const w=b.closest('.hb'),k=Number(w.dataset.k||0),n=w.querySelectorAll('.hb-pic img').length;
  if(b.classList.contains('hb-prev'))return k>0&&hbGo(w,k-1);if(b.classList.contains('hb-pic')&&k===n-1)return;sfx.tap();hbGo(w,k+1)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('hb-pic')){e.preventDefault();e.target.click()}});

/* đăng nhập qua máy chủ */
function login(view='in',msg='',pre={}){show('login');const w=$('#lwrap');
  const head=`<div class="lhead"><div style="width:120px;margin:0 auto">${owlSVG}</div><h1>Học cùng Cherry</h1><div class="credit2">CLB Toán - Anh <b>NGỌC LINH</b></div></div>`;
  const nm=`<label>Họ và tên<input class="name" id="lName" autocomplete="name" placeholder="Ví dụ: Nguyễn Văn An" value="${esc(pre.name||'')}"></label>
     ${pre.choose?`<label>Có nhiều bạn trùng tên, em chọn khối<select class="name" id="lK">${pre.choose.map(k=>`<option value="${k}" ${k===pre.khoi?'selected':''}>Khối ${k}</option>`).join('')}</select></label>`:''}`;
  const err=msg?`<div class="err">${msg}</div>`:'';
  if(view==='in')w.innerHTML=`${head}<form id="lf" class="lform">${nm}<label>Mật khẩu (4 chữ số)${pinInput('lPin')}</label>${err}
     <button class="btn" type="submit">Vào học</button><div class="llinks"><button type="button" id="lChg">Đổi mật khẩu</button><button type="button" id="lForgot">Quên mật khẩu</button></div>
     <button type="button" class="gvlink" id="lGv">Giáo viên đăng nhập</button></form>`;
  if(view==='chg')w.innerHTML=`${head}<form id="lf" class="lform"><h2>Đổi mật khẩu</h2>${nm}
     <label>Mật khẩu cũ${pinInput('lOld')}</label><label>Mật khẩu mới (4 chữ số)${pinInput('lNew','')}</label><label>Nhập lại mật khẩu mới${pinInput('lNew2','')}</label>${err}
     <button class="btn" type="submit">Đổi mật khẩu</button><button type="button" class="btn alt" id="lBack">Quay lại đăng nhập</button></form>`;
  if(view==='forgot')w.innerHTML=`${head}<form id="lf" class="lform"><h2>Quên mật khẩu</h2><p class="lnote">Nhập họ và tên, app sẽ báo thầy. Thầy đặt lại mật khẩu về <b>0000</b> rồi em đăng nhập và đổi mật khẩu mới.</p>${nm}${err}
     <button class="btn" type="submit">Báo thầy</button><button type="button" class="btn alt" id="lBack">Quay lại đăng nhập</button></form>`;
  if(view==='gv')w.innerHTML=`${head}<form id="lf" class="lform"><h2>Giáo viên</h2><label>Tên đăng nhập<input class="name" id="gU" autocomplete="username" autocapitalize="off"></label>
     <label>Mật khẩu<input class="name" id="gP" type="password" autocomplete="current-password"></label>${err}<button class="btn" type="submit">Đăng nhập</button><button type="button" class="btn alt" id="lBack">Quay lại</button></form>`;
  bindPins();
  $('#lChg')&&($('#lChg').onclick=()=>login('chg','',{name:$('#lName').value}));$('#lForgot')&&($('#lForgot').onclick=()=>login('forgot','',{name:$('#lName').value}));
  $('#lBack')&&($('#lBack').onclick=()=>login('in'));$('#lGv')&&($('#lGv').onclick=()=>login('gv'));
  if($('#lName'))$('#lName').oninput=()=>{const k=$('#lK');if(k)k.parentNode.remove()};
  const btn=$('#lf button[type=submit]');
  $('#lf').onsubmit=async e=>{e.preventDefault();if(btn.disabled)return;btn.disabled=true;btn.textContent='Đang kiểm tra…';
    const name=$('#lName')?.value.trim(),khoi=$('#lK')?.value,P0={name,khoi};
    try{
      if(view==='gv'){const r=await api('/api/auth/teacher',{username:$('#gU').value,password:$('#gP').value});return onLogin(r)}
      if(!name)return login(view,'Em nhập họ và tên.');
      if(view==='forgot'){const r=await api('/api/auth/forgot',{name,khoi});if(r.choose)return login(view,'',{...P0,choose:r.choose});msgBox('Đã báo thầy','Khi thầy đặt lại, mật khẩu của em là <b>0000</b>.');return login('in','',P0)}
      if(view==='chg'){const o=$('#lOld').value,n1=$('#lNew').value,n2=$('#lNew2').value;
        if(!pinOk(o)||!pinOk(n1))return login('chg','Mật khẩu gồm đúng 4 chữ số.',P0);if(n1!==n2)return login('chg','Hai lần nhập mật khẩu mới chưa khớp.',P0);
        const r=await api('/api/auth/pin',{name,khoi,old:o,pin:n1});if(r.choose)return login('chg','Có nhiều bạn trùng tên, em chọn khối rồi nhập lại.',{...P0,choose:r.choose});
        sfx.ok();msgBox('Đã đổi mật khẩu','Lần sau em đăng nhập bằng mật khẩu mới.');return login('in','',P0)}
      const pin=$('#lPin').value;if(!pinOk(pin))return login('in','Mật khẩu gồm đúng 4 chữ số.',P0);
      const r=await api('/api/auth/login',{name,khoi,pin});if(r.choose)return login('in','Có nhiều bạn trùng tên, em chọn khối rồi nhập lại mật khẩu.',{...P0,choose:r.choose});
      onLogin(r)
    }catch(err){sfx.no();login(view,esc(err.message),{...P0,choose:$('#lK')?[...$('#lK').options].map(o=>o.value):undefined})}}}
async function onLogin(r){TEACHER=r.acc.role==='teacher';SERVERP=r.data||null;
  topicVersion=''; lastCatalog=0;
  try{await loadAll(true)}catch(e){return msgBox('Chưa tải được dữ liệu',esc(e.message))}DBSTATE='ok';
  if(TEACHER)enter({id:'gv',name:r.acc.name||'Giáo viên',khoi:'8',teacher:true});else enter(r.acc,r.isDefault)}
function start(){started=true;if(SESS){const s=SESS;SESS=null;onLogin(s)}else login()}
(async()=>{try{const me=await api('/api/me');if(me&&me.acc)SESS=me}catch(e){}DBSTATE='ok';if(!started)start();else if(!ACC&&SESS){const s=SESS;SESS=null;onLogin(s)}})();
let refreshing = false;
async function refreshVisible() {
  if (!ACC || document.hidden || refreshing || Date.now() - lastSync < 45000) return;
  refreshing = true;
  const account = ACC;
  try { await loadAll(); if (ACC === account) softRefresh(); }
  catch (e) { if (e.status === 401 && ACC === account) { ACC=null; P=null; login('in','Phiên đăng nhập đã hết, em đăng nhập lại nhé.'); } }
  finally { refreshing = false; }
}
setInterval(refreshVisible, 60000);
document.addEventListener('visibilitychange', refreshVisible);
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});

/* đổi mật khẩu trong app: máy chủ kiểm tra mật khẩu cũ */
async function changePin(o,n){await api('/api/me/pin',{old:o,pin:n})}

/* ---------- thông báo bài tập (Web Push) ----------
   Học sinh bấm "Bật thông báo" ở màn chọn môn → máy gửi địa chỉ nhận thông báo lên /api/push.
   Máy chủ báo ngay khi thầy giao bài (app/api/admin/assign) và nhắc mỗi tối nếu chưa làm (scripts/nhac-bai.mjs). */
const pushOK=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
// an: không hiện gì · ios: iPhone chưa thêm app vào Màn hình chính · hoi: chưa bật · chan: em đã chặn · bat: đã bật
function pushState(){if(!ACC||ACC.teacher)return 'an';if(!pushOK())return isIOS()&&!standalone()?'ios':'an';const p=Notification.permission;return p==='granted'?'bat':p==='denied'?'chan':'hoi'}
const b64u=s=>{const r=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(r,c=>c.charCodeAt(0))};
const sameKey=(a,b)=>{if(!a)return false;a=new Uint8Array(a);return a.length===b.length&&a.every((x,i)=>x===b[i])};
async function pushSubscribe(){const reg=await navigator.serviceWorker.ready,{publicKey}=await api('/api/push'),key=b64u(publicKey);
  let sub=await reg.pushManager.getSubscription();
  if(sub&&!sameKey(sub.options&&sub.options.applicationServerKey,key)){await sub.unsubscribe().catch(()=>{});sub=null}
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
  await api('/api/push',{sub:sub.toJSON()});return sub}
async function pushOn(){if(Notification.permission!=='granted'&&await Notification.requestPermission()!=='granted')return false;await pushSubscribe();return true}
// Đăng nhập lại trên máy đã bật: cập nhật để thông báo về đúng tài khoản đang dùng máy này.
function pushRefresh(){if(pushState()==='bat')pushSubscribe().catch(()=>{})}
// Đăng xuất: máy này thôi nhận thông báo của tài khoản vừa thoát.
async function pushForget(){try{if(!pushOK())return;const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();if(sub)await api('/api/push',{endpoint:sub.endpoint},'DELETE')}catch(e){}}
function pushCard(){const s=pushState();
  if(s==='hoi')return `<div class="pushcard"><span class="pushico" aria-hidden="true">🔔</span><span><b>Bật thông báo bài tập</b><small>Cherry báo ngay khi thầy giao bài và nhắc em nếu chưa làm.</small></span><button class="btn" id="pushOn">Bật</button></div>`;
  if(s==='ios')return `<div class="pushcard"><span class="pushico" aria-hidden="true">🔔</span><span><b>Nhận thông báo bài tập trên iPhone</b><small>Mở app bằng Safari, bấm nút Chia sẻ <b>⬆︎</b> → <b>Thêm vào MH chính</b>. Sau đó mở app từ biểu tượng Cherry và bấm Bật thông báo.</small></span></div>`;
  if(s==='chan')return `<div class="pushcard off"><span class="pushico" aria-hidden="true">🔕</span><span><b>Thông báo đang bị chặn</b><small>Em vào Cài đặt của máy (hoặc biểu tượng ổ khóa cạnh địa chỉ web) để cho phép thông báo từ Học cùng Cherry.</small></span></div>`;
  return ''}
function bindPushCard(){const b=$('#pushOn');if(!b)return;b.onclick=async()=>{sfx.tap();b.disabled=true;
  try{if(await pushOn()){sfx.ok();toast('Đã bật thông báo. Thầy giao bài là máy em sẽ báo!')}else toast('Em chưa cho phép thông báo.')}
  catch(e){b.disabled=false;return msgBox('Chưa bật được thông báo','Máy em chưa kết nối được dịch vụ thông báo. Em kiểm tra mạng rồi bấm Bật lại nhé.')}
  const c=b.closest('.pushcard');if(c)c.outerHTML=pushCard()}}
