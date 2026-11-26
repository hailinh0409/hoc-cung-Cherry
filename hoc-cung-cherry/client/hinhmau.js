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
