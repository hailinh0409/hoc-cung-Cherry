const CAT_COLORS={cam:'#f28c28',lam:'#3b7be0',luc:'#2fa36b',tim:'#8b5cf6',do:'#e0475a'};
const CAT_NUMBERS=[3,2,1,4];
const CAT_SCALE=56;
const catEsc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function catIntersection([a,b],[c,d]){
  const x=b[0]-a[0],y=b[1]-a[1],u=d[0]-c[0],v=d[1]-c[1];
  const fraction=((c[0]-a[0])*v-(c[1]-a[1])*u)/(x*v-y*u);
  return [a[0]+x*fraction,a[1]+y*fraction];
}

function catAngles(point,rays){
  const boundaries=rays.map(([x,y])=>Math.atan2(y-point[1],x-point[0]));
  for(let i=1;i<boundaries.length;i++){
    while(boundaries[i]<boundaries[i-1])boundaries[i]+=2*Math.PI;
  }
  return boundaries.map((from,i)=>({from,to:boundaries[i+1]??boundaries[0]+2*Math.PI,number:CAT_NUMBERS[i]}));
}

function catText(x,y,value,kind){
  return `<text class="cat-${kind}" x="${x}" y="${y}" dy=".35em" text-anchor="middle">${catEsc(value)}</text>`;
}

export function catTuyen(params={},state={}, {tap=false,region=false,slide=false}={}){
  const [a,b,c]=params.duong||['a','b','c'];
  const [A,B]=params.diem||['A','B'];
  const isParallel=String(params['song-song'])==='1', direction=params.c==='phai'?-1:1;
  const lines=isParallel?[[[-2.8,2],[3.3,2]],[[-2.8,0],[3.3,0]]]:
    [[[-2.8,2.3],[3.3,2.75]],[[-2.8,.3],[3.3,-.12]]];
  const cut=[[-.85*direction,3.75],[1.75*direction,-1.5]];
  const vertices=lines.map((line,i)=>{
    const point=catIntersection(line,cut);
    return {point,name:[A,B][i],angles:catAngles(point,[line[1],cut[0],line[0],cut[1]])};
  });
  const pointX=x=>Number(((x+3.1)*CAT_SCALE).toFixed(1));
  const pointY=y=>Number(((4.05-y)*CAT_SCALE).toFixed(1));
  const XY=([x,y])=>[pointX(x),pointY(y)];
  const vector=(origin,radius,theta)=>XY([origin[0]+radius*Math.cos(theta),origin[1]+radius*Math.sin(theta)]);
  const pointList=points=>points.map(p=>XY(p).join(',')).join(' ');

  function sector(point,{from,to},radius){
    const [cx,cy]=XY(point), [sx,sy]=vector(point,radius,from), [ex,ey]=vector(point,radius,to);
    const r=radius*CAT_SCALE;
    return `M${cx} ${cy}L${sx} ${sy}A${r} ${r} 0 ${to-from>Math.PI?1:0} 0 ${ex} ${ey}Z`;
  }

  function drawAngle(vertex,angle,{number,color,value}){
    const {point}=vertex,{from,to}=angle, middle=(from+to)/2;
    let out=color?`<path d="${sector(point,angle,.55)}" fill="${color}" fill-opacity=".33" stroke="${color}" stroke-width="2"/>`:'';
    if(number){
      const [x,y]=vector(point,.38,middle);
      out+=`<g fill="${color||'#111'}">${catText(x,y,angle.number,'number')}</g>`;
    }
    if(value){
      const [x,y]=vector(point,.86,middle);
      out+=`<g fill="${color||CAT_COLORS.do}">${catText(x,y,value,'value')}</g>`;
    }
    return out;
  }

  const [top,bottom]=lines;
  const regions={
    tren:[[-2.8,4.05],[3.3,4.05],top[1],top[0]],
    giua:[top[0],top[1],bottom[1],bottom[0]],
    duoi:[bottom[0],bottom[1],[3.3,-1.75],[-2.8,-1.75]],
  };
  let out=state.vung&&regions[state.vung]?`<polygon points="${pointList(regions[state.vung])}" fill="#ffe08a" fill-opacity=".5"/>`:'';
  for(const [start,end] of [...lines,cut]){
    const [x1,y1]=XY(start),[x2,y2]=XY(end);
    out+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  for(const vertex of vertices){
    for(const angle of vertex.angles){
      const key=vertex.name+angle.number;
      out+=drawAngle(vertex,angle,{number:state.so!=='an'&&(!slide||vertex!==vertices[0]),
        color:CAT_COLORS[state.to?.[key]],value:state.do?.[key]});
    }
    const [x,y]=XY(vertex.point), [nx,ny]=vector(vertex.point,1,98*Math.PI/180);
    out+=`<circle cx="${x}" cy="${y}" r="4.5"/>${catText(nx+10,ny,vertex.name,'label')}`;
  }
  for(const [index, [start,end]] of [...lines,cut].entries()){
    const [first,last]=[a,b,c][index].split('-'),[x1,y1]=XY(start),[x2,y2]=XY(end);
    const cutLine=index===2;
    out+=catText(x1+(cutLine?12:-6),y1+(cutLine?4:-14),first,'label');
    if(last)out+=catText(x2+(cutLine?-12:6),y2+(cutLine?-4:14),last,'label');
  }

  if(slide){
    const [from,to]=vertices,[x1,y1]=XY(from.point),[x2,y2]=XY(to.point);
    const moving=from.angles.map(angle=>drawAngle(from,angle,{number:true,color:Object.values(CAT_COLORS)[angle.number-1]})).join('');
    out+=`<g class="cat-slide" data-dx="${x2-x1}" data-dy="${y2-y1}"${slide==='to'?` style="transform:translate(${x2-x1}px,${y2-y1}px)"`: ''}>${moving}</g>`;
  }
  if(tap){
    for(const vertex of vertices){
      for(const angle of vertex.angles){
        const key=catEsc(vertex.name+angle.number);
        out+=`<path class="cat-hit" data-angle="${key}" d="${sector(vertex.point,angle,1)}" fill="transparent" tabindex="0" role="button" aria-label="Góc ${key}"/>`;
      }
    }
  }
  if(region){
    const regionLabels={tren:'Phía trên đường thứ nhất',giua:'Giữa hai đường thẳng',duoi:'Phía dưới đường thứ hai'};
    for(const [key,points] of Object.entries(regions)){
      out+=`<polygon class="cat-hit" data-region="${key}" points="${pointList(points)}" fill="transparent" tabindex="0" role="button" aria-label="${regionLabels[key]}"/>`;
    }
  }
  return `<svg viewBox="0 0 395 325" role="${tap||region?'group':'img'}" aria-label="${catEsc('Đường thẳng '+c+' cắt '+a+' và '+b+' tại '+A+' và '+B)}">
    <style>.cat-label{font:italic 19px "Times New Roman",serif}.cat-number{font:16px "Times New Roman",serif}.cat-value{font:700 13.5px Nunito,sans-serif}</style>${out}</svg>`;
}

const CHAT_FIG_INK='#14323a';
function scaleItem(it,x,y,w,h){
  if(it.k==='w')return `<circle cx="${x}" cy="${y}" r="11" fill="#9fb4c2" stroke="#4d6372" stroke-width="1.5"/><text x="${x}" y="${y}" dy=".35em" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="Be Vietnam Pro">${catEsc(it.label||'1')}</text>`;
  if(it.k==='big')return `<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="7" fill="#9fb4c2" stroke="#4d6372" stroke-width="1.5"/><text x="${x}" y="${y}" dy=".35em" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Be Vietnam Pro">${catEsc(it.label)}</text>`;
  if(it.k==='pom')return `<circle cx="${x}" cy="${y}" r="22" fill="#d7e87a" stroke="#8aa536" stroke-width="2"/><path d="M${x} ${y-22}q6 -10 14 -8q-4 8 -14 8" fill="#4fa34a"/><text x="${x}" y="${y+2}" dy=".35em" text-anchor="middle" font-size="22" font-weight="700" fill="${CHAT_FIG_INK}" font-family="Be Vietnam Pro">${catEsc(it.label||'?')}</text>`;
  return `<path d="M${x-18} ${y+20}q-6 -22 8 -30l-2 -8h24l-2 8q14 8 8 30z" fill="#f2b14a" stroke="#b9770e" stroke-width="2"/><text x="${x}" y="${y+8}" text-anchor="middle" font-size="22" font-style="italic" font-family="Times New Roman" fill="${CHAT_FIG_INK}">${catEsc(it.label||'x')}</text>`;
}
function drawScale(o={}){
  const cx=210,py=60,half=140,a=(({bal:0,L:-9,R:9})[o.tilt||'bal'])*Math.PI/180;
  const Lx=cx-half*Math.cos(a),Ly=py-half*Math.sin(a),Rx=cx+half*Math.cos(a),Ry=py+half*Math.sin(a);
  const dims=it=>it.k==='w'?[24,24]:it.k==='big'?[70,28]:it.k==='pom'?[46,46]:[44,40];
  const pan=(ex,ey,items)=>{
    const p2=ey+80;let g=`<line x1="${ex}" y1="${ey}" x2="${ex-52}" y2="${p2}" stroke="#7a5a2f" stroke-width="2"/><line x1="${ex}" y1="${ey}" x2="${ex+52}" y2="${p2}" stroke="#7a5a2f" stroke-width="2"/>`;
    const rows=[];let row=[],wr=0;
    items.forEach(it=>{const[w,h]=dims(it);if(row.length&&wr+w+4>108){rows.push(row);row=[];wr=0}row.push({it,w,h});wr+=w+4});if(row.length)rows.push(row);
    let y=p2-3;
    rows.forEach(r=>{const rh=Math.max(...r.map(q=>q.h)),tw=r.reduce((t,q)=>t+q.w+4,-4);let x=ex-tw/2;r.forEach(q=>{g+=scaleItem(q.it,x+q.w/2,y-q.h/2,q.w,q.h);x+=q.w+4});y-=rh+3});
    return g+`<path d="M${ex-60} ${p2}A60 24 0 0 0 ${ex+60} ${p2}Z" fill="#efe3c6" stroke="#9a7b4f" stroke-width="2.5"/>`};
  let s=`<polygon points="140,238 280,238 258,216 162,216" fill="#d9c7a0" stroke="#9a7b4f" stroke-width="2"/><rect x="203" y="${py}" width="14" height="${216-py}" fill="#b08d5a"/>`;
  s+=pan(Lx,Ly,o.L||[])+pan(Rx,Ry,o.R||[]);
  s+=`<line x1="${Lx}" y1="${Ly}" x2="${Rx}" y2="${Ry}" stroke="#7a5a2f" stroke-width="9" stroke-linecap="round"/><circle cx="${cx}" cy="${py}" r="10" fill="#b08d5a" stroke="#7a5a2f" stroke-width="2"/>`;
  if(o.note)s+=`<text x="210" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="${(o.tilt||'bal')==='bal'?'#1f8a57':'#c2410c'}" font-family="Be Vietnam Pro">${catEsc(o.note)}</text>`;
  return `<svg viewBox="0 0 420 250" role="img" aria-label="${catEsc(o.label||'Cân đĩa')}">${s}</svg>`;
}
function drawEquation(o={}){
  const rows=o.rows||[],cx=210,RH=58,AG=32,y0=14;
  const H=y0+rows.length*(RH+AG)-AG+14;
  const parse=t=>{const m=t.match(/^([+−])?(.+)$/);return{sg:m[1]||'',b:m[2]}};
  const isFr=b=>/^\d+\/\d+$/.test(b);
  const bodyW=b=>isFr(b)?Math.max(...b.split('/').map(z=>z.length))*15+8:b.length*16+2;
  const tw=t=>{const p=parse(t);return(p.sg?30:0)+bodyW(p.b)+12};
  const draw=(t,x,y,c,key)=>{const p=parse(t),w=tw(t),col=c||CHAT_FIG_INK;let g='',xx=x;
    if(p.sg){g+=`<text x="${xx+13}" y="${y}" dy=".35em" text-anchor="middle" font-size="26" font-weight="600" fill="${col}" font-family="Be Vietnam Pro">${p.sg}</text>`;xx+=30}
    const bw=bodyW(p.b);
    if(isFr(p.b)){const[n,d]=p.b.split('/');g+=`<text x="${xx+bw/2}" y="${y-12}" text-anchor="middle" font-size="20" fill="${col}" font-family="Times New Roman">${n}</text><line x1="${xx}" x2="${xx+bw}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="2"/><text x="${xx+bw/2}" y="${y+18}" text-anchor="middle" font-size="20" fill="${col}" font-family="Times New Roman">${d}</text>`}
    else g+=`<text x="${xx+bw/2}" y="${y}" dy=".35em" text-anchor="middle" font-size="28" ${/^[a-z]$/.test(p.b)?'font-style="italic"':''} font-family="Times New Roman" fill="${col}" font-weight="${c?700:400}">${catEsc(p.b)}</text>`;
    if(o.tap&&key)g+=`<rect class="cat-hit" data-angle="${key}" tabindex="0" role="button" aria-label="${catEsc(t)}" x="${x-4}" y="${y-28}" width="${w}" height="56" rx="10" fill="transparent"><title>${catEsc(t)}</title></rect>`;
    return g};
  let s='';
  rows.forEach((r,i)=>{const yc=y0+i*(RH+AG)+RH/2;
    s+=`<rect x="12" y="${yc-RH/2}" width="396" height="${RH}" rx="14" fill="#fffaf2" stroke="#ece3d1" stroke-width="2"/>`;
    const L=r.l||[],Rr=r.r||[],totL=L.reduce((t,z)=>t+tw(z),0),totR=Rr.reduce((t,z)=>t+tw(z),0),kk=Math.min(1,186/(30+Math.max(totL,totR)));
    s+=`<g transform="translate(${cx} ${yc}) scale(${kk.toFixed(3)}) translate(${-cx} ${-yc})">`;let x=cx-30-totL;
    L.forEach((t,j)=>{s+=draw(t,x,yc,CAT_COLORS[o.colors?.[`${i+1}t${j+1}`]],`${i+1}t${j+1}`);x+=tw(t)});
    s+=`<text x="${cx}" y="${yc}" dy=".35em" text-anchor="middle" font-size="30" fill="${CHAT_FIG_INK}" font-family="Be Vietnam Pro">=</text>`;
    x=cx+30;Rr.forEach((t,j)=>{s+=draw(t,x,yc,CAT_COLORS[o.colors?.[`${i+1}p${j+1}`]],`${i+1}p${j+1}`);x+=tw(t)});s+='</g>';
    if(i<rows.length-1){const ya=yc+RH/2+3,yb=ya+AG-6;
      s+=`<path d="M${cx} ${ya}V${yb}" stroke="#149c8c" stroke-width="2.5" fill="none"/><path d="M${cx-6} ${yb-6}L${cx} ${yb}L${cx+6} ${yb-6}" stroke="#149c8c" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      if((o.arrows||[])[i])s+=`<text x="${cx+14}" y="${ya+AG/2-1}" dy=".35em" font-size="13" font-weight="600" fill="#0f7a6e" font-family="Be Vietnam Pro">${catEsc(o.arrows[i])}</text>`}
  });
  return `<svg viewBox="0 0 420 ${H}" role="${o.tap?'group':'img'}" aria-label="${catEsc(o.label||'Đẳng thức')}">${s}</svg>`;
}

export function can(params = {}, state = {}) {
  const values = { ...params, ...state };
  const side = items => (items || []).flatMap(({ kind, count, label }) => {
    if (kind === 'q') return count <= 12
      ? Array.from({ length: count }, () => ({ k: 'w' }))
      : [{ k: 'big', label: count + ' × 1' }];
    return [{ k: { k: 'big', t: 'bag', b: 'pom' }[kind], label }];
  });
  const L = side(values.trai), R = side(values.phai);
  const describe = items => items.map(item => item.label || '1').join(', ') || 'trống';
  return drawScale({
    L, R, tilt: { trai: 'L', phai: 'R' }[values.nghieng], note: values.ghichu,
    label: 'Cân đĩa. Trái: ' + describe(L) + '. Phải: ' + describe(R),
  });
}

export function dangThuc(params = {}, state = {}, { tap = false } = {}) {
  const values = { ...params, ...state, to: { ...params.to, ...state.to } };
  const rows = [];
  for (let i = 1; i <= (values.dong || 4); i++) {
    const row = values['dong' + i];
    if (!row) break;
    const [l, r] = row.map(side => side.map(term => term.replace(/^-/, '−')));
    rows.push({ l, r });
  }
  if (!rows.length) return '';
  return drawEquation({
    rows, colors: values.to, tap, arrows: [values.mui1, values.mui2, values.mui3],
    label: rows.map(({ l, r }) => l.join(' ') + ' = ' + r.join(' ')).join('. '),
  });
}
