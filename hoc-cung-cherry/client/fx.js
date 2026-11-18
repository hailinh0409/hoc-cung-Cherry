let ac=null,muted=store.get('ltt:mute',false);
function tone(fs,d=.12,type='triangle'){if(muted)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();
  fs.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;const t=ac.currentTime+i*d;
  g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+d*1.6);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d*1.7)})}catch(e){}}
const sfx={ok:()=>tone([660,880,1175]),no:()=>tone([220,165],.18,'sawtooth'),tap:()=>tone([520],.05),win:()=>tone([523,659,784,1047,1319],.13)};
const cv=$('#fx'),cx=cv.getContext('2d');let parts=[];
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(n=70,y=.4){if(calm)return;const r=cv.getBoundingClientRect();cv.width=r.width*2;cv.height=r.height*2;
  const cols=['#ffd23f','#ff7a59','#2fd18b','#fffaf2','#5ad1e6'];const go=!parts.length;
  for(let i=0;i<n;i++)parts.push({x:cv.width/2,y:cv.height*y,vx:(Math.random()-.5)*26,vy:-Math.random()*26-8,s:Math.random()*10+6,c:cols[i%5],r:Math.random()*6,life:90});
  if(go)requestAnimationFrame(tick)}
function tick(){cx.clearRect(0,0,cv.width,cv.height);parts=parts.filter(p=>p.life-->0);
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=1;p.vx*=.98;p.r+=.2;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);cx.restore()});
  if(parts.length)requestAnimationFrame(tick);else cx.clearRect(0,0,cv.width,cv.height)}
function floatText(txt,el){if(!el)return;const r=el.getBoundingClientRect(),a=$('#app').getBoundingClientRect();const f=document.createElement('div');
  f.className='float';f.textContent=txt;f.style.left=(r.left-a.left+r.width/2-40)+'px';f.style.top=(r.top-a.top)+'px';$('#app').appendChild(f);setTimeout(()=>f.remove(),1000)}

