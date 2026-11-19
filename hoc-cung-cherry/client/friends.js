/* ---------- bạn bè: theo dõi, tìm kiếm, bảng tin ---------- */
let frTab='feed',frQ='',frK='';
const myFollow=()=>(P&&P.follow)||{};
const isFollow=id=>!!myFollow()[id];
const followersOf=id=>PLAYERS.filter(p=>p.id!==id&&p.follow&&p.follow[id]);
const followingOf=p=>Object.keys((p&&p.follow)||{}).filter(id=>PLAYERS.some(x=>x.id===id));
const newFollowers=()=>ACC&&!ACC.teacher?followersOf(ACC.id).filter(p=>(p.follow[ACC.id]||'')>(P.fseen||'')).length:0;
function toggleFollow(id){if(!P.follow)P.follow={};const on=!P.follow[id];if(on)P.follow[id]=new Date().toISOString();else delete P.follow[id];save();syncMine();sfx[on?'ok':'tap']();if(on)toast('Đã theo dõi! Hoạt động của bạn sẽ hiện trong <b>Bảng tin</b>.');return on}
const ago=iso=>{const m=(Date.now()-Date.parse(iso))/6e4;return m<1?'vừa xong':m<60?Math.floor(m)+' phút trước':m<1440?Math.floor(m/60)+' giờ trước':Math.floor(m/1440)+' ngày trước'};
function personRow(p,sub){const me=ACC&&p.id===ACC.id,f=isFollow(p.id),back=p.follow&&ACC&&p.follow[ACC.id],t=tierOf(p.lp);
  return `<div class="frow"><button class="fmain" data-p="${p.id}">${avatarOf(p,44)}<span class="bn"><b>${esc(p.nick||p.name||'?')}</b><small>${p.nick?esc(p.name)+' · ':''}Khối ${esc(p.khoi||'?')}${sub?' · '+sub:''}</small></span>
    <span class="fmeta">${emblem(t,22)}<i>${flame(!(p.st&&p.st.last_day),14)}${liveStreak(p.st||{},vnDay())}</i></span></button>
    ${me||!ACC||ACC.teacher?'':`<button class="fbtn${f?' on':''}" data-f="${p.id}">${f?'Đang theo dõi':back?'Theo dõi lại':'Theo dõi'}</button>`}</div>`}
function feedItems(){const ids=Object.keys(myFollow()),lim=Date.now()-14*864e5,out=[];
  for(const id of ids){const p=PLAYERS.find(x=>x.id===id);if(!p)continue;
    for(const [k,at] of Object.entries(p.ach||{})){const a=ACH.find(x=>x.id===k);if(a&&Date.parse(at)>lim)out.push({p,at,ico:medal(true,30),txt:`đạt thành tích <b>${esc(a.n)}</b>`})}
    for(const [k,b] of Object.entries(p.best||{})){if(!b||!b.t||Date.parse(b.t)<lim)continue;const [tid,i]=k.split('|'),t=TOPICS.find(x=>x.id===tid);if(!t)continue;
      out.push({p,at:b.t,ico:`<span class="fic">${star(1)}</span>`,txt:isDe(t)?`làm xong đề <b>${esc(t.title)}</b>`:`qua <b>Màn ${+i+1}</b> · ${esc(t.title)} ${'★'.repeat(b.st||0)}`})}
    for(const h of (p.hist||[]).slice(-5))if(h.d>0&&Date.parse(h.at)>lim)out.push({p,at:h.at,ico:emblem(tierOf(p.lp),28),txt:`thắng trận thi đấu <b>+${h.d}</b> điểm`});
    for(const [k,at] of Object.entries(p.own||{})){const it=ITEM[k];if(it&&typeof at==='string'&&Date.parse(at)>lim&&it.rar>=1)out.push({p,at,ico:`<span class="fic">🎁</span>`,txt:`sưu tầm <b>${esc(it.name)}</b> <i style="color:${RAR[it.rar].c};font-style:normal">${RAR[it.rar].n}</i>`})}}
  return out.sort((a,b)=>b.at.localeCompare(a.at)).slice(0,60)}
function friends(){show('friends');const me=ACC.id,fl=followingOf(P),fw=followersOf(me),nf=newFollowers();
  const tabs=[['feed','Bảng tin'],['following',`Đang theo dõi (${fl.length})`],['followers',`Người theo dõi (${fw.length})${nf?' ●':''}`],['search','Tìm bạn']];
  let body='';
  if(frTab==='feed'){const it=feedItems();body=it.length?it.map(x=>`<button class="fitem" data-p="${x.p.id}">${avatarOf(x.p,40)}<span class="ftx"><b>${esc(x.p.nick||x.p.name)}</b> ${x.txt}<small>${ago(x.at)}</small></span>${x.ico}</button>`).join('')
      :`<div class="empty"><div style="width:100px;margin:0 auto">${owlSVG}</div><p>${fl.length?'Bạn bè của em chưa có hoạt động mới trong 2 tuần qua.':'Em chưa theo dõi ai. Vào <b>Tìm bạn</b> để theo dõi các bạn trong CLB nhé!'}</p></div>`}
  if(frTab==='following')body=fl.length?fl.map(id=>personRow(PLAYERS.find(x=>x.id===id))).join(''):'<div class="tempty">Em chưa theo dõi ai.</div>';
  if(frTab==='followers'){body=fw.length?fw.sort((a,b)=>(b.follow[me]||'').localeCompare(a.follow[me]||'')).map(p=>personRow(p,(p.follow[me]||'')>(P.fseen||'')?'<em class="newb">mới</em>':ago(p.follow[me]))).join(''):'<div class="tempty">Chưa có ai theo dõi em. Chăm học, lên bậc cao là sẽ có nhiều bạn chú ý đó!</div>';
    if(nf){P.fseen=new Date().toISOString();save();syncMine()}}
  if(frTab==='search'){const q=plain(frQ);let L=PLAYERS.filter(p=>p.id!==me&&!p.mau&&(!frK||p.khoi===frK));
    if(q)L=L.filter(p=>plain(p.name).includes(q)||plain(p.nick||'').includes(q));else L=L.filter(p=>!isFollow(p.id)).sort((a,b)=>(b.khoi===ACC.khoi)-(a.khoi===ACC.khoi)||(b.xp||0)-(a.xp||0));
    body=`<div class="fsearch"><input class="name" id="fq" placeholder="Gõ tên hoặc nickname…" value="${esc(frQ)}" autocomplete="off"></div>
      <div class="seg sm">${['',...KHOI].map(k=>`<button data-fk="${k}" class="${k===frK?'on':''}">${k||'Tất cả'}</button>`).join('')}</div>
      <p class="tnote2">${q?`${L.length} kết quả`:'Gợi ý cho em'}</p>${L.slice(0,40).map(p=>personRow(p)).join('')||'<div class="tempty">Không tìm thấy bạn nào.</div>'}`}
  $('#frBody').innerHTML=`<div class="fhead">${avatarOf(P,56)}<div><b>${esc(P.nick||ACC.name)}</b><small><a data-ft="following">${fl.length} đang theo dõi</a> · <a data-ft="followers">${fw.length} người theo dõi</a></small></div></div>
    <div class="shtabs">${tabs.map(([k,n])=>`<button data-ft="${k}" class="${k===frTab?'on':''}">${n}</button>`).join('')}</div>${body}`;
  $$('#frBody [data-ft]').forEach(b=>b.onclick=()=>{sfx.tap();frTab=b.dataset.ft;friends()});
  $$('#frBody [data-fk]').forEach(b=>b.onclick=()=>{sfx.tap();frK=b.dataset.fk;friends()});
  $$('#frBody [data-p]').forEach(b=>b.onclick=()=>{sfx.tap();profFrom='friends';profile(b.dataset.p)});
  $$('#frBody [data-f]').forEach(b=>b.onclick=()=>{toggleFollow(b.dataset.f);const y=$('#frBody').scrollTop;friends();$('#frBody').scrollTop=y});
  const fq=$('#fq');if(fq){let tm;fq.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{frQ=fq.value;friends();const n=$('#fq');n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)}}
  $('#frBack').onclick=()=>{sfx.tap();subjects()}}
/* đổi mật khẩu ngay trong app (bản artifact: kiểm tra trên máy) */
async function changePin(o,n){const a=ACCS.find(x=>x.id===ACC.id);if(!a)throw new Error('Không tìm thấy tài khoản');
  if(await hashPin(a.salt,o)!==a.ph)throw new Error('Mật khẩu hiện tại chưa đúng.');await DB.doc('accounts/'+a.id).update({ph:await hashPin(a.salt,n),reset:false,isDefault:false})}
function pinForm(){overlay(`<h2>Đổi mật khẩu</h2><form id="pf" class="form"><label>Mật khẩu hiện tại${pinInput('pO')}</label><label>Mật khẩu mới (4 chữ số)${pinInput('pN','')}</label><label>Nhập lại mật khẩu mới${pinInput('pN2','')}</label><div id="pE"></div>
    <button class="btn" type="submit">Lưu mật khẩu mới</button></form><button class="btn alt" id="pC">Hủy</button>`);
  $$('#panel .pin').forEach(i=>i.oninput=()=>{i.value=i.value.replace(/\D/g,'').slice(0,4)});$('#pC').onclick=closeOvl;
  $('#pf').onsubmit=async e=>{e.preventDefault();const o=$('#pO').value,n=$('#pN').value,n2=$('#pN2').value,E=m=>$('#pE').innerHTML=`<div class="err">${m}</div>`;
    if(!pinOk(o)||!pinOk(n))return E('Mật khẩu gồm đúng 4 chữ số.');if(n!==n2)return E('Hai lần nhập mật khẩu mới chưa khớp.');if(n==='0000')return E('Em chọn mật khẩu khác 0000 nhé.');if(n===o)return E('Mật khẩu mới phải khác mật khẩu cũ.');
    try{await changePin(o,n);closeOvl();sfx.ok();toast('Đã đổi mật khẩu. Lần sau em đăng nhập bằng mật khẩu mới.')}catch(err){E(esc(err.message))}}}
