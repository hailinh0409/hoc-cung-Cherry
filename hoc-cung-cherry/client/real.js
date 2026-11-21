/* ===================== BẢN APP THẬT: dữ liệu qua máy chủ ===================== */
let SERVERP=null,SESS=null,FIGS={};
const api=async(path,body,method)=>{const r=await fetch(path,{method:method||(body?'POST':'GET'),headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});
  let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw Object.assign(new Error((j&&j.error)||('Lỗi kết nối ('+r.status+')')),{status:r.status,data:j});return j};
const wrapDoc=x=>({id:x.id,exists:true,data:()=>x});
async function loadAll(){const j=await api('/api/sync');FIGS=j.figs||{};TOPICS=(j.topics||[]).map(t=>fromDoc(wrapDoc(t)));ASG=j.assignments||[];PLAYERS=j.players||[];ACCS=j.accounts||[];ACCS_DEL=j.removed||[];REPS=j.reports||[];MOC=j.moc||{}}
function softRefresh(){const on=$$('.scr.on')[0]?.id;if($('#ovl').classList.contains('on')||on==='play')return;
  if(BANKON&&!QE&&on==='track'){if(document.activeElement&&document.activeElement.id==='bkQ')return;return bank(true)}
  if(QE&&on==='track'){const t=TOPICS.find(x=>x.id===QE);if(t)qedit(t);return}
  if(on==='track'&&$('#trTitle').textContent.startsWith('Tài khoản'))return accounts();if(on==='track'&&$('#trTitle').textContent.startsWith('Câu báo lỗi'))return reportsPage();if(on==='track'&&$('#trTitle').textContent.startsWith('Theo dõi'))return track();refresh()}
const after=p=>p.then(r=>{loadAll().then(softRefresh).catch(()=>{});return r});
DB={doc:path=>{const i=path.indexOf('/'),c=path.slice(0,i),id=path.slice(i+1);return {
    update:v=>c==='settings'?after(api('/api/admin/settings',{action:'moc',...v})):c==='reports'?after(api('/api/admin/report',v)):c==='topics'?after(api('/api/admin/topic',{id,...v})):c==='accounts'?after(v.restore?api('/api/admin/accounts',{action:'restore',id}):v.mon?api('/api/admin/accounts',{action:'mon',id,mon:v.mon}):('ph' in v)&&v.isDefault?api('/api/admin/accounts',{action:'reset',id}):Promise.resolve()):Promise.resolve(),
    set:v=>c==='players'?api('/api/me/save',{doc:v}):Promise.resolve(),
    delete:()=>c==='assignments'?after(api('/api/admin/assign?id='+encodeURIComponent(id),null,'DELETE')):c==='players'?after(api('/api/admin/samples',{id})):c==='accounts'?after(api('/api/admin/accounts',{action:'remove',id})):Promise.resolve()}},
  collection:c=>({doc:()=>({set:v=>c==='reports'?api('/api/report',v):c==='topics'?api('/api/admin/topic',{action:'create',...v}).then(async r=>{await loadAll();return r}):c==='assignments'?after(api('/api/admin/assign',v)):c==='accounts'?after(api('/api/admin/accounts',{action:'create',name:v.name,khoi:v.khoi,mon:v.mon})):Promise.resolve()})})};
/* đối chiếu với máy chủ sau khi lưu: phần máy chủ không chấp nhận thì bỏ */
function reconcile(sent,r){if(!r||!P)return;if(r.xp<sent.xp)P.xp-=sent.xp-r.xp;if(r.lp<sent.lp)P.lp=Math.max(0,P.lp-(sent.lp-r.lp));
  for(const id of Object.keys(sent.own||{}))if(!r.own[id]){delete P.own[id];for(const [k,v] of Object.entries(P.eq))if(v===id)delete P.eq[k]}
  P.spent=r.spent+Math.max(0,(P.spent||0)-(sent.spent||0));save()}
/* hình TikZ đã dịch */
const TIKZ_RE=/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g;
const figSwap=s=>String(s??'').replace(TIKZ_RE,c=>{const k=c.replace(/(^|[^\\])%.*$/gm,'$1'),h=FIGS[k];return h?`@@FIG:${h}@@`:'@@FIG:none@@'});
const figImg=s=>s.replace(/@@FIG:([0-9a-f]{40}|none)@@/g,(_,h)=>h==='none'?'<span class="figmiss">Hình chưa dịch</span>':`<img class="fig" src="/hinh/${h}" alt="Hình vẽ" loading="lazy">`);

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
  try{await loadAll()}catch(e){return msgBox('Chưa tải được dữ liệu',esc(e.message))}DBSTATE='ok';
  if(TEACHER)enter({id:'gv',name:r.acc.name||'Giáo viên',khoi:'8',teacher:true});else enter(r.acc,r.isDefault)}
function start(){started=true;if(SESS){const s=SESS;SESS=null;onLogin(s)}else login()}
(async()=>{try{const me=await api('/api/me');if(me&&me.acc)SESS=me}catch(e){}DBSTATE='ok';if(!started)start();else if(!ACC&&SESS){const s=SESS;SESS=null;onLogin(s)}})();
setInterval(()=>{if(ACC&&!document.hidden)loadAll().then(softRefresh).catch(e=>{if(e.status===401){ACC=null;P=null;login('in','Phiên đăng nhập đã hết, em đăng nhập lại nhé.')}})},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ACC)loadAll().then(softRefresh).catch(()=>{})});
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});

/* đổi mật khẩu trong app: máy chủ kiểm tra mật khẩu cũ */
async function changePin(o,n){await api('/api/me/pin',{old:o,pin:n})}
