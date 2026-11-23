<script>
{
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};

/*@@LIB@@*/
function parseTopic(raw){const P=parseBank(raw);return {title:P.topic,levels:P.levels,errors:P.errors.map(errorText),theory:P.theory}}

/* ---------- hằng số ---------- */
const GRADES=[{k:'6',c:'#ff7a59',d:'#e85a3a'},{k:'7',c:'#3aa8e0',d:'#2584b8'},{k:'8',c:'#ffd23f',d:'#d6a90b',dark:1},{k:'9',c:'#ff5d8f',d:'#d93e70'},{k:'10',c:'#5cc96b',d:'#3a9e4a'},{k:'11',c:'#9b6dff',d:'#7448d6'},{k:'12',c:'#ff9f1c',d:'#d67b00'}];
const KHOI=GRADES.map(g=>g.k);
const PHAN={'dai-so':{name:'Đại số',c:'#3aa8e0',d:'#2584b8'},'hinh-hoc':{name:'Hình học',c:'#2fb787',d:'#1f8a63'},'thong-ke':{name:'Thống kê & Xác suất',c:'#ff9f1c',d:'#d97f00'},'on-tap':{name:'Ôn tập',c:'#8d7bff',d:'#6a57e0'},'thi-dau':{name:'Kho Thi đấu',c:'#ef3b55',d:'#c22a40'}};
const TIERS=[{n:'Đồng',lp:0,c:'#c08457',d:'#8a5a33'},{n:'Bạc',lp:100,c:'#c3ced6',d:'#8a9aa6'},{n:'Vàng',lp:200,c:'#ffd23f',d:'#c99a08'},{n:'Bạch Kim',lp:350,c:'#4fd1c5',d:'#2a9d93'},
  {n:'Kim Cương',lp:500,c:'#6aa8ff',d:'#3f78d6'},{n:'Cao Thủ',lp:700,c:'#b36bff',d:'#8442d6'},{n:'Đại Cao Thủ',lp:900,c:'#ff5d6c',d:'#c8323f'},{n:'Thách Đấu',lp:1200,c:'#ffb800',d:'#b97f00'}];
const tierOf=lp=>{let t=0;TIERS.forEach((x,i)=>{if((lp||0)>=x.lp)t=i});return t};
const TYPE={ex:'Trắc nghiệm',extf:'Đúng / Sai',exfb:'Điền đáp số',exmatch:'Nối ý',exsx:'Sắp xếp lời giải',exsd:'Sơ đồ đi lên',extl:'Tự luận'};
const HINT_XP=10; // mỗi gợi ý tự luận mở lần đầu trừ 10 XP trong Ví XP (khớp HINT_XP ở lib/validate.js)
const MODE={so:'Làm lại câu sai',one:'Câu đã lưu',rank:'Thi đấu',de:'Ôn tập'};
const RANK_TIME=[30,45,60,90],RANK_PTS=[10,15,20,30],RANK_PICK=[3,3,2,2],RANK_BY_TIER=[[8,2,0,0],[6,4,0,0],[5,5,0,0],[5,3,2,0],[3,3,4,0],[0,5,5,0],[0,3,5,2],[0,0,6,4]];
const MPC=[['#ffe1d6','#ff7a59'],['#d8eeff','#2b9bd6'],['#e8e0ff','#8d7bff'],['#d6f7e6','#1fa86b'],['#fff1c2','#e0a100'],['#ffe0ec','#e84a8a']];

/* ---------- kho dữ liệu ---------- */
let TOPICS=[],ACCS=[],ACCS_DEL=[],REPS=[],MOC={},PLAYERS=[],ASG=[],TEACHER=false,DBSTATE='loading',DB=null;
let ACC=null,P=null,curK='',curPhan='',curT=null,profFrom='grades';
const newP=()=>({xp:0,lp:0,matches:0,hist:[],st:{},best:{},score:{},pt:{},rev:{},saved:{},wst:{},stats:{correct:0,maxCombo:0,levels:0,perfect:0,top:0,cleared:0,chests:0},own:{},eq:{},spent:0,dq:null,wk:{},season:'',seasons:[],fails:{},lvt:{},ccl:{},tut:0,follow:{},fseen:'',rseen:{},ach:{},avatar:0,nick:'',tlh:{}});
function fromDoc(d){const v=d.data()||{};const P=parseTopic(v.text);
  return {id:d.id,khoi:String(v.khoi||'?'),phan:PHAN[v.phan]?v.phan:'dai-so',title:v.title||P.title||d.id,status:v.trangthai||'nhap',order:Number(v.thutu)||0,levels:P.levels,errors:P.errors,nguon:v.nguon||'',chuong:v.chuong||'',raw:v.text||'',prev:v.banTruoc||'',upd:v.capnhat||'',theory:P.theory||null}}
// \\ ngoài công thức = xuống dòng; trong $...$, $$...$$, \(...\), \[...\] giữ nguyên (cases, aligned, ma trận cần \\)
const brOut=s=>s.replace(/(\\\$|\$\$[\s\S]*?\$\$|\$(?:\\[\s\S]|[^$\\])*\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])|\\\\/g,(m,keep)=>keep?m:'<br>');
const tex=s=>brOut(esc(s)).replace(/\\textbf\{([^}]*)\}/g,'<b>$1</b>').replace(/&quot;/g,'"');
const typeset=el=>{if(window.__mjReady)MathJax.typesetPromise([el]).catch(()=>{}).then(()=>sdLay(el));requestAnimationFrame(()=>sdLay(el));if(el&&el.querySelector&&el.querySelector('.sd-tw'))setTimeout(()=>sdLay(el),500)};

/* ---------- âm thanh & hiệu ứng ---------- */
@@FX@@
function toast(html){const t=$('#toast');t.innerHTML=/^\s*<svg/.test(html)?html:'<span>'+html+'</span>';t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),3200)}

/* ---------- hình vẽ ---------- */
@@SVG@@
@@ART@@
const flame=(off,sz=26)=>`<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" style="flex:none"><path d="M12 2c1 3.5 5.5 6 5.5 11a5.5 5.5 0 01-11 0c0-2.4 1.2-4 2.5-5.2.2 1.7 1 2.8 2.2 3.3C10.6 8 11 5 12 2z" fill="${off?'#5f7d82':'#ff7a59'}"/><path d="M12 12c.6 1.6 2.6 2.6 2.6 4.6a2.6 2.6 0 01-5.2 0c0-1.2.6-2 1.3-2.6.2.8.6 1.2 1.1 1.4-.2-1.2 0-2.4.2-3.4z" fill="${off?'#9fb5b8':'#ffd23f'}"/></svg>`;
const shieldSVG=`<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="#3aa8e0"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
const bookmark=on=>`<svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 3h12v18l-6-4-6 4z" fill="${on?'#ffd23f':'none'}" stroke="${on?'#c99a08':'#5f7d82'}" stroke-width="2" stroke-linejoin="round"/></svg>`;
function emblem(t,sz=48){const T=TIERS[t];const gem=t>=4;return `<svg viewBox="0 0 64 64" width="${sz}" height="${sz}" class="emb"><path d="M32 3l25 14v30L32 61 7 47V17z" fill="${T.d}"/><path d="M32 8l20 11.5v25L32 56 12 44.5v-25z" fill="${T.c}"/>
  ${gem?`<path d="M32 18l10 10-10 18-10-18z" fill="#fff" opacity=".85"/>`:`<path d="M32 19l4 8.5 9 1.2-6.6 6.3 1.7 9L32 39.7 23.9 44l1.7-9-6.6-6.3 9-1.2z" fill="#fff" opacity=".85"/>`}
  ${t===7?`<path d="M18 9l6 7 8-10 8 10 6-7-2 12H20z" fill="#fff3b0" stroke="${T.d}" stroke-width="1.5"/>`:''}</svg>`}
$('#sky').innerHTML=Array.from({length:34},()=>`<i style="left:${Math.random()*100}%;top:${Math.random()*70}%;animation-delay:${Math.random()*3}s"></i>`).join('');

/* ---------- chương trình cả năm: mỗi chặng là một bài trong SGK Kết nối tri thức ---------- */
/* mỗi chương: [tên, phần, [các bài]]; 'LT' = Luyện tập chung (THCS); 'CC' = Bài tập cuối chương (THPT không có Luyện tập chung); số bài đánh liên tục cả năm như SGK */
const CURR={
 '6':[['Tập hợp các số tự nhiên','dai-so',['Tập hợp','Cách ghi số tự nhiên','Thứ tự trong tập hợp các số tự nhiên','Phép cộng và phép trừ số tự nhiên','Phép nhân và phép chia số tự nhiên','LT','Luỹ thừa với số mũ tự nhiên','Thứ tự thực hiện các phép tính','LT']],
  ['Tính chia hết trong tập hợp các số tự nhiên','dai-so',['Quan hệ chia hết và tính chất','Dấu hiệu chia hết','Số nguyên tố','LT','Ước chung. Ước chung lớn nhất','Bội chung. Bội chung nhỏ nhất','LT']],
  ['Số nguyên','dai-so',['Tập hợp các số nguyên','Phép cộng và phép trừ số nguyên','Quy tắc dấu ngoặc','LT','Phép nhân số nguyên','Ước và bội của một số nguyên','LT']],
  ['Một số hình phẳng trong thực tiễn','hinh-hoc',['Hình tam giác đều. Hình vuông. Hình lục giác đều','Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân','Chu vi và diện tích của một số tứ giác đã học','LT']],
  ['Tính đối xứng của hình phẳng trong tự nhiên','hinh-hoc',['Hình có trục đối xứng','Hình có tâm đối xứng','LT']],'HK1',
  ['Phân số','dai-so',['Mở rộng phân số. Phân số bằng nhau','So sánh phân số. Hỗn số dương','LT','Phép cộng và phép trừ phân số','Phép nhân và phép chia phân số','Hai bài toán về phân số','LT']],
  ['Số thập phân','dai-so',['Số thập phân','Tính toán với số thập phân','Làm tròn và ước lượng','Một số bài toán về tỉ số và tỉ số phần trăm','LT']],
  ['Những hình hình học cơ bản','hinh-hoc',['Điểm và đường thẳng','Điểm nằm giữa hai điểm. Tia','Đoạn thẳng. Độ dài đoạn thẳng','Trung điểm của đoạn thẳng','LT','Góc','Số đo góc','LT']],
  ['Dữ liệu và xác suất thực nghiệm','thong-ke',['Dữ liệu và thu thập dữ liệu','Bảng thống kê và biểu đồ tranh','Biểu đồ cột','Biểu đồ cột kép','LT','Kết quả có thể và sự kiện trong trò chơi, thí nghiệm','Xác suất thực nghiệm','LT']]],
 '7':[['Số hữu tỉ','dai-so',['Tập hợp các số hữu tỉ','Cộng, trừ, nhân, chia số hữu tỉ','LT','Luỹ thừa với số mũ tự nhiên của một số hữu tỉ','Thứ tự thực hiện các phép tính. Quy tắc chuyển vế','LT']],
  ['Số thực','dai-so',['Làm quen với số thập phân vô hạn tuần hoàn','Số vô tỉ. Căn bậc hai số học','Tập hợp các số thực','LT']],
  ['Góc và đường thẳng song song','hinh-hoc',['Góc ở vị trí đặc biệt. Tia phân giác của một góc','Hai đường thẳng song song và dấu hiệu nhận biết','Tiên đề Euclid. Tính chất của hai đường thẳng song song','Định lí và chứng minh định lí','LT']],
  ['Tam giác bằng nhau','hinh-hoc',['Tổng các góc trong một tam giác','Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất của tam giác','LT','Trường hợp bằng nhau thứ hai và thứ ba của tam giác','LT','Các trường hợp bằng nhau của tam giác vuông','Tam giác cân. Đường trung trực của đoạn thẳng','LT']],
  ['Thu thập và biểu diễn dữ liệu','thong-ke',['Thu thập và phân loại dữ liệu','Biểu đồ hình quạt tròn','Biểu đồ đoạn thẳng','LT']],'HK1',
  ['Tỉ lệ thức và đại lượng tỉ lệ','dai-so',['Tỉ lệ thức','Tính chất của dãy tỉ số bằng nhau','LT','Đại lượng tỉ lệ thuận','Đại lượng tỉ lệ nghịch','LT']],
  ['Biểu thức đại số và đa thức một biến','dai-so',['Biểu thức đại số','Đa thức một biến','Phép cộng và phép trừ đa thức một biến','LT','Phép nhân đa thức một biến','Phép chia đa thức một biến','LT']],
  ['Làm quen với biến cố và xác suất của biến cố','thong-ke',['Làm quen với biến cố','Làm quen với xác suất của biến cố','LT']],
  ['Quan hệ giữa các yếu tố trong một tam giác','hinh-hoc',['Quan hệ giữa góc và cạnh đối diện trong một tam giác','Quan hệ giữa đường vuông góc và đường xiên','Quan hệ giữa ba cạnh của một tam giác','LT','Sự đồng quy của ba đường trung tuyến, ba đường phân giác trong một tam giác','Sự đồng quy của ba đường trung trực, ba đường cao trong một tam giác','LT']],
  ['Một số hình khối trong thực tiễn','hinh-hoc',['Hình hộp chữ nhật và hình lập phương','Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác','LT']]],
 '8':[['Đa thức','dai-so',['Đơn thức','Đa thức','Phép cộng và phép trừ đa thức','LT','Phép nhân đa thức','Phép chia đa thức cho đơn thức','LT']],
  ['Hằng đẳng thức đáng nhớ và ứng dụng','dai-so',['Hiệu hai bình phương. Bình phương của một tổng hay một hiệu','Lập phương của một tổng. Lập phương của một hiệu','Tổng và hiệu hai lập phương','LT','Phân tích đa thức thành nhân tử','LT']],
  ['Tứ giác','hinh-hoc',['Tứ giác','Hình thang cân','LT','Hình bình hành','Hình chữ nhật','Hình thoi và hình vuông','LT']],
  ['Định lí Thalès','hinh-hoc',['Định lí Thalès trong tam giác','Đường trung bình của tam giác','Tính chất đường phân giác của tam giác','LT']],
  ['Dữ liệu và biểu đồ','thong-ke',['Thu thập và phân loại dữ liệu','Biểu diễn dữ liệu bằng bảng, biểu đồ','Phân tích số liệu thống kê dựa vào biểu đồ','LT']],'HK1',
  ['Phân thức đại số','dai-so',['Phân thức đại số','Tính chất cơ bản của phân thức đại số','LT','Phép cộng và phép trừ phân thức đại số','Phép nhân và phép chia phân thức đại số','LT']],
  ['Phương trình bậc nhất và hàm số bậc nhất','dai-so',['Phương trình bậc nhất một ẩn','Giải bài toán bằng cách lập phương trình','LT','Khái niệm hàm số và đồ thị của hàm số','Hàm số bậc nhất và đồ thị của hàm số bậc nhất','Hệ số góc của đường thẳng','LT']],
  ['Mở đầu về tính xác suất của biến cố','thong-ke',['Kết quả có thể và kết quả thuận lợi','Cách tính xác suất của biến cố bằng tỉ số','Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng','LT']],
  ['Tam giác đồng dạng','hinh-hoc',['Hai tam giác đồng dạng','Ba trường hợp đồng dạng của hai tam giác','LT','Định lí Pythagore và ứng dụng','Các trường hợp đồng dạng của hai tam giác vuông','Hình đồng dạng','LT']],
  ['Một số hình khối trong thực tiễn','hinh-hoc',['Hình chóp tam giác đều','Hình chóp tứ giác đều','LT']]],
 '9':[['Phương trình và hệ hai phương trình bậc nhất hai ẩn','dai-so',['Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn','Giải hệ hai phương trình bậc nhất hai ẩn','LT','Giải bài toán bằng cách lập hệ phương trình']],
  ['Phương trình và bất phương trình bậc nhất một ẩn','dai-so',['Phương trình quy về phương trình bậc nhất một ẩn','Bất đẳng thức và tính chất','LT','Bất phương trình bậc nhất một ẩn']],
  ['Căn bậc hai và căn bậc ba','dai-so',['Căn bậc hai và căn thức bậc hai','Khai căn bậc hai với phép nhân và phép chia','LT','Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai','Căn bậc ba và căn thức bậc ba','LT']],
  ['Hệ thức lượng trong tam giác vuông','hinh-hoc',['Tỉ số lượng giác của góc nhọn','Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng','LT']],
  ['Đường tròn','hinh-hoc',['Mở đầu về đường tròn','Cung và dây của một đường tròn','Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên','LT','Vị trí tương đối của đường thẳng và đường tròn','Vị trí tương đối của hai đường tròn','LT']],'HK1',
  ['Hàm số y = ax² (a ≠ 0). Phương trình bậc hai một ẩn','dai-so',['Hàm số y = ax² (a ≠ 0)','Phương trình bậc hai một ẩn','LT','Định lí Viète và ứng dụng','Giải bài toán bằng cách lập phương trình','LT']],
  ['Tần số và tần số tương đối','thong-ke',['Bảng tần số và biểu đồ tần số','Bảng tần số tương đối và biểu đồ tần số tương đối','LT','Bảng tần số, tần số tương đối ghép nhóm và biểu đồ']],
  ['Xác suất của biến cố trong một số mô hình xác suất đơn giản','thong-ke',['Phép thử ngẫu nhiên và không gian mẫu','Xác suất của biến cố liên quan tới phép thử','LT']],
  ['Đường tròn ngoại tiếp và đường tròn nội tiếp','hinh-hoc',['Góc nội tiếp','Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác','LT','Tứ giác nội tiếp','Đa giác đều','LT']],
  ['Một số hình khối trong thực tiễn','hinh-hoc',['Hình trụ và hình nón','Hình cầu','LT']]],
 '10':[['Mệnh đề và tập hợp','dai-so',['Mệnh đề','Tập hợp và các phép toán trên tập hợp','CC']],
  ['Bất phương trình và hệ bất phương trình bậc nhất hai ẩn','dai-so',['Bất phương trình bậc nhất hai ẩn','Hệ bất phương trình bậc nhất hai ẩn','CC']],
  ['Hệ thức lượng trong tam giác','hinh-hoc',['Giá trị lượng giác của một góc từ 0° đến 180°','Hệ thức lượng trong tam giác','CC']],
  ['Vectơ','hinh-hoc',['Các khái niệm mở đầu','Tổng và hiệu của hai vectơ','Tích của một vectơ với một số','Vectơ trong mặt phẳng toạ độ','Tích vô hướng của hai vectơ','CC']],
  ['Các số đặc trưng của mẫu số liệu không ghép nhóm','thong-ke',['Số gần đúng và sai số','Các số đặc trưng đo xu thế trung tâm','Các số đặc trưng đo độ phân tán','CC']],'HK1',
  ['Hàm số, đồ thị và ứng dụng','dai-so',['Hàm số','Hàm số bậc hai','Dấu của tam thức bậc hai','Phương trình quy về phương trình bậc hai','CC']],
  ['Phương pháp toạ độ trong mặt phẳng','hinh-hoc',['Phương trình đường thẳng','Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách','Đường tròn trong mặt phẳng toạ độ','Ba đường conic','CC']],
  ['Đại số tổ hợp','thong-ke',['Quy tắc đếm','Hoán vị, chỉnh hợp và tổ hợp','Nhị thức Newton','CC']],
  ['Tính xác suất theo định nghĩa cổ điển','thong-ke',['Biến cố và định nghĩa cổ điển của xác suất','Thực hành tính xác suất theo định nghĩa cổ điển','CC']]],
 '11':[['Hàm số lượng giác và phương trình lượng giác','dai-so',['Giá trị lượng giác của góc lượng giác','Công thức lượng giác','Hàm số lượng giác','Phương trình lượng giác cơ bản','CC']],
  ['Dãy số. Cấp số cộng và cấp số nhân','dai-so',['Dãy số','Cấp số cộng','Cấp số nhân','CC']],
  ['Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm','thong-ke',['Mẫu số liệu ghép nhóm','Các số đặc trưng đo xu thế trung tâm','CC']],
  ['Quan hệ song song trong không gian','hinh-hoc',['Đường thẳng và mặt phẳng trong không gian','Hai đường thẳng song song','Đường thẳng và mặt phẳng song song','Hai mặt phẳng song song','Phép chiếu song song','CC']],
  ['Giới hạn. Hàm số liên tục','dai-so',['Giới hạn của dãy số','Giới hạn của hàm số','Hàm số liên tục','CC']],'HK1',
  ['Hàm số mũ và hàm số lôgarit','dai-so',['Luỹ thừa với số mũ thực','Lôgarit','Hàm số mũ và hàm số lôgarit','Phương trình, bất phương trình mũ và lôgarit','CC']],
  ['Quan hệ vuông góc trong không gian','hinh-hoc',['Hai đường thẳng vuông góc','Đường thẳng vuông góc với mặt phẳng','Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng','Hai mặt phẳng vuông góc','Khoảng cách','Thể tích','CC']],
  ['Các quy tắc tính xác suất','thong-ke',['Biến cố hợp, biến cố giao, biến cố độc lập','Công thức cộng xác suất','Công thức nhân xác suất cho hai biến cố độc lập','CC']],
  ['Đạo hàm','dai-so',['Định nghĩa và ý nghĩa của đạo hàm','Các quy tắc tính đạo hàm','Đạo hàm cấp hai','CC']]],
 '12':[['Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số','dai-so',['Tính đơn điệu và cực trị của hàm số','Giá trị lớn nhất và giá trị nhỏ nhất của hàm số','Đường tiệm cận của đồ thị hàm số','Khảo sát sự biến thiên và vẽ đồ thị của hàm số','Ứng dụng đạo hàm và khảo sát hàm số để giải quyết một số vấn đề liên quan đến thực tiễn','CC']],
  ['Vectơ và hệ trục toạ độ trong không gian','hinh-hoc',['Vectơ trong không gian','Hệ trục toạ độ trong không gian','Biểu thức toạ độ của các phép toán vectơ','CC']],
  ['Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm','thong-ke',['Khoảng biến thiên và khoảng tứ phân vị','Phương sai và độ lệch chuẩn','CC']],'HK1',
  ['Nguyên hàm và tích phân','dai-so',['Nguyên hàm','Tích phân','Ứng dụng hình học của tích phân','CC']],
  ['Phương pháp toạ độ trong không gian','hinh-hoc',['Phương trình mặt phẳng','Phương trình đường thẳng trong không gian','Công thức tính góc trong không gian','Phương trình mặt cầu','CC']],
  ['Xác suất có điều kiện','thong-ke',['Xác suất có điều kiện','Công thức xác suất toàn phần và công thức Bayes','CC']]]};
/* chủ đề mẫu có sẵn được gắn vào bài tương ứng */
const ALIAS={'lop6-uoc-va-boi':'k6-b11','lop7-so-huu-ti':'k7-b1','lop8-hang-dang-thuc':'k8-b6','lop9-can-bac-hai':'k9-b7'};
/* danh sách phẳng: {hk} | {ch:{n,title,phan}} | {id,num,title,lt,ch} */
const currOf=k=>{const out=[];let num=0,cn=0;for(const c of CURR[k]||[]){if(c==='HK1'){out.push({hk:1});continue}
  cn++;const ch={n:cn,title:c[0],phan:c[1]};out.push({ch});let lt=0;
  for(const b of c[2]){if(b==='LT'){lt++;out.push({id:`k${k}-c${cn}-lt${lt}`,num:0,title:'Luyện tập chung',lt:true,coin:'LT',ch})}else if(b==='CC'){out.push({id:`k${k}-c${cn}-cc`,num:0,title:'Bài tập cuối chương',lt:true,coin:'ÔT',ch})}else{num++;out.push({id:`k${k}-b${num}`,num,title:b,ch})}}}return out};
const lessonName=L=>L.lt?`${L.title} · Chương ${L.ch.n}`:`Bài ${L.num}. ${L.title}`;
function mapItems(k){const all=gradeTopics(k).filter(t=>!isDe(t)&&!isTL(t)&&!isKho(t)),used=new Set(),items=[];
  for(const c of currOf(k)){if(!c.id){items.push(c);continue}
    const ts=all.filter(t=>!used.has(t)&&((t.chuong||ALIAS[t.id])===c.id));ts.forEach(t=>used.add(t));
    if(ts.length)ts.forEach((t,i)=>items.push({L:c,t,sub:ts.length>1?i+1:0}));else items.push({L:c,t:null})}
  const rest=all.filter(t=>!used.has(t));if(rest.length){items.push({ch:{n:0,title:'Chủ đề bổ sung',phan:'dai-so'}});rest.forEach(t=>items.push({L:{id:'',num:0,title:t.title,ch:null},t}))}
  return items}
/* ---------- tiến độ ---------- */
const save=()=>{if(ACC)store.set('ltt:p:'+ACC.id,P)};
const key=(t,i)=>t.id+'|'+i;
const GV=()=>TEACHER&&!!ACC&&!!ACC.teacher;
const bestOf=(t,i)=>(P&&P.best[key(t,i)])||0;
const isDe=t=>t.phan==='on-tap';
const isKho=t=>t.phan==='thi-dau'; // Kho Thi đấu theo chương: không hiện trên bản đồ, chỉ dùng cho Thi đấu
/* chương của một chủ đề (số chương SGK) và mốc Thi đấu "đã học hết chương N" của khối; null = chưa gắn chương */
const CURC={},currC=k=>CURC[k]||(CURC[k]=currOf(k));
const chapsOf=k=>currC(k).filter(c=>c.hk||c.ch&&!c.id);
const chapTitle=(k,n)=>{const c=chapsOf(k).find(x=>x.ch&&x.ch.n===n);return c?c.ch.title:''};
function chapOf(t){if(isKho(t)){const m=/^k\d+-c(\d+)$/.exec(t.chuong||'');return m?+m[1]:null}
  const id=t.chuong||ALIAS[t.id];if(!id)return null;const c=currC(t.khoi).find(x=>x.id===id);return c&&c.ch?c.ch.n:null}
const mocOf=k=>Number(MOC&&MOC[k])||0;
const chRange=m=>m===1?'Chương 1':`Chương 1–${m}`;
const inMoc=t=>{const m=mocOf(t.khoi),c=chapOf(t);return !m||c==null||c<=m};
const isTL=t=>isTLBank(t.levels); // đề tự luận: học sinh làm vào vở, app chỉ có đề và gợi ý
const nMan=t=>1; // mỗi bài (hoặc đề) là một chặng
const MAN_NAME=['Nhận biết','Thông hiểu','Vận dụng'];
const LESSON_PLAN=[3,3,2]; // số câu mức 1, 2, 3 trong một bài (khoảng 10 phút)
const topicStars=t=>{let s=0;for(let i=0;i<nMan(t);i++)s+=bestOf(t,i);return s};
const topicPassed=t=>{let s=0;for(let i=0;i<nMan(t);i++)if(bestOf(t,i)>0)s++;return s};
const visible=t=>GV()?true:(t.status==='giao'&&!t.errors.length);
const gradeTopics=k=>TOPICS.filter(t=>t.khoi===k&&visible(t)).sort((a,b)=>(a.status==='an')-(b.status==='an')||a.order-b.order||a.title.localeCompare(b.title,'vi'));
const hasQ=t=>t.levels.some(l=>l.qs.length); // bài chỉ có lý thuyết thì không tính vào đường đi
const routeTopics=k=>mapItems(k).filter(x=>x.t&&hasQ(x.t)).map(x=>x.t);
const deTopics=k=>gradeTopics(k).filter(isDe);
const deDone=t=>!!(P.pt&&P.pt[key(t,0)]);
function topicOpen(ts,j){const t=ts[j];return j===0||GV()||!!asgFor(t)||topicPassed(t)>0||topicPassed(ts[j-1])>=1}
const lvlOpen=(ts,j,i)=>topicOpen(ts,j)&&(i===0||GV()||bestOf(ts[j],i-1)>0);
const G0=k=>GRADES.find(g=>g.k===k)||GRADES[0];
const level=xp=>Math.floor(Math.sqrt((xp||0)/60))+1;
const lvBounds=l=>[60*(l-1)**2,60*l**2];

function show(id){$$('.scr').forEach(s=>s.classList.toggle('on',s.id===id));const g=curK?G0(curK):GRADES[0];
  $('#app').style.setProperty('--kc',g.c);$('#app').style.setProperty('--kd',g.d);$('#app').style.setProperty('--kt',g.dark?'#4a3300':'#fff');
  const u=$('#'+id+' [data-ubar]');if(u)ubar(u);window.scrollTo(0,0)}
function overlay(html){$('#panel').innerHTML=html;$('#ovl').classList.add('on');typeset($('#panel'))}
const closeOvl=()=>$('#ovl').classList.remove('on');
function msgBox(t,m){overlay(`<h2>${t}</h2><p>${m}</p><button class="btn" id="eo">Đóng</button>`);$('#eo').onclick=closeOvl}

/* ---------- thanh trên cùng: avatar, tên, chuỗi, XP ---------- */
function ubar(el){if(!ACC||!P){el.innerHTML='';return}
  const today=vnDay(),S=P.st||{},sk=liveStreak(S,today),learned=S.last_day===today,lv=level(P.xp),[a,b]=lvBounds(lv),id=$$('.scr.on')[0]?.id;
  const back=['grades','anh','area','journey','ontap','redo','ranked','theory','tlde'].includes(id);
  el.innerHTML=`${back?`<button class="ico" data-back aria-label="Quay lại">${backIco}</button>`:''}
   <button class="me" data-me>${avatarOf(P,40)}<span><b>${esc(P.nick||ACC.name)}</b><small>Cấp ${lv} · ${P.xp} XP</small><i class="xpb"><i style="width:${Math.min(100,(P.xp-a)/(b-a)*100)}%"></i></i></span></button>
   <div class="stk${learned?'':' off'}" title="Chuỗi ngày học">${flame(!learned,26)}<b>${sk}</b><span class="shl">${shieldSVG.repeat(S.shields??1)}</span></div>`;
  el.querySelector('[data-me]').onclick=()=>{sfx.tap();profFrom=id;profile(ACC.id)};
  const bk=el.querySelector('[data-back]');if(bk)bk.onclick=()=>{sfx.tap();id==='grades'||id==='anh'?subjects():id==='area'||id==='journey'?grades():id==='tlde'?onTap():journey()}}

/* ---------- đăng nhập ---------- */
const normName=s=>String(s||'').normalize('NFC').toLowerCase().replace(/\s+/g,' ').trim();
const plain=s=>normName(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');
async function hashPin(salt,pin){const s=salt+':'+pin;try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  catch(e){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return 'x'+h}}
const pinOk=p=>/^\d{4}$/.test(p);
function findAcc(name,khoi){const n=normName(name),p=plain(name);let m=ACCS.filter(a=>normName(a.name)===n);if(!m.length)m=ACCS.filter(a=>plain(a.name)===p);if(khoi)m=m.filter(a=>a.khoi===khoi);return m}
const pinInput=(id,ph='••••')=>`<input class="pin" id="${id}" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="${ph}">`;
function bindPins(){$$('#lwrap .pin').forEach(i=>i.oninput=()=>{i.value=i.value.replace(/\D/g,'').slice(0,4)})}
let fails=store.get('ltt:fails',{n:0,until:0});
function login(view='in',msg=''){show('login');const w=$('#lwrap');
  const head=`<div class="lhead"><div style="width:120px;margin:0 auto">${owlSVG}</div><h1>Học cùng Cherry</h1><div class="credit2">CLB Toán - Anh <b>NGỌC LINH</b></div></div>`;
  const note=DBSTATE==='off'?'<div class="err">Chưa mở được kho dữ liệu (cần đăng nhập Claude).</div>':DBSTATE!=='ok'?'<div class="lnote">Đang tải danh sách học sinh…</div>':'';
  if(view==='in')w.innerHTML=`${head}<form id="lf" class="lform">${note}
     <label>Họ và tên<input class="name" id="lName" autocomplete="name" placeholder="Ví dụ: Nguyễn Văn An"></label>
     <div id="lKhoi"></div>
     <label>Mật khẩu (4 chữ số)${pinInput('lPin')}</label>
     ${msg?`<div class="err">${msg}</div>`:''}
     <button class="btn" type="submit">Vào chơi</button>
     <div class="llinks"><button type="button" id="lChg">Đổi mật khẩu</button><button type="button" id="lForgot">Quên mật khẩu</button></div>
     ${TEACHER?'<button type="button" class="btn alt" id="lTeach">Vào chế độ giáo viên</button>':''}</form>`;
  if(view==='chg')w.innerHTML=`${head}<form id="lf" class="lform"><h2>Đổi mật khẩu</h2>
     <label>Họ và tên<input class="name" id="lName" autocomplete="name"></label><div id="lKhoi"></div>
     <label>Mật khẩu cũ${pinInput('lOld')}</label><label>Mật khẩu mới (4 chữ số)${pinInput('lNew','')}</label><label>Nhập lại mật khẩu mới${pinInput('lNew2','')}</label>
     ${msg?`<div class="err">${msg}</div>`:''}<button class="btn" type="submit">Đổi mật khẩu</button><button type="button" class="btn alt" id="lBack">Quay lại đăng nhập</button></form>`;
  if(view==='forgot')w.innerHTML=`${head}<form id="lf" class="lform"><h2>Quên mật khẩu</h2><p class="lnote">Nhập họ và tên, app sẽ báo thầy. Thầy đặt lại mật khẩu về <b>0000</b> rồi em đăng nhập và đổi mật khẩu mới.</p>
     <label>Họ và tên<input class="name" id="lName" autocomplete="name"></label><div id="lKhoi"></div>
     ${msg?`<div class="err">${msg}</div>`:''}<button class="btn" type="submit">Báo thầy</button><button type="button" class="btn alt" id="lBack">Quay lại đăng nhập</button></form>`;
  bindPins();
  const pickK=()=>{const m=findAcc($('#lName').value);const box=$('#lKhoi');
    if(m.length>1)box.innerHTML=`<label>Có ${m.length} bạn trùng tên, chọn khối của em<select class="name" id="lK">${m.map(a=>`<option value="${a.khoi}">Khối ${a.khoi}</option>`).join('')}</select></label>`;else box.innerHTML=''};
  $('#lName').oninput=pickK;
  const who=()=>{const m=findAcc($('#lName').value,$('#lK')?.value);return m.length===1?m[0]:null};
  $('#lChg')&&($('#lChg').onclick=()=>login('chg'));$('#lForgot')&&($('#lForgot').onclick=()=>login('forgot'));$('#lBack')&&($('#lBack').onclick=()=>login('in'));
  $('#lTeach')&&($('#lTeach').onclick=()=>enter({id:'gv',name:'Giáo viên',khoi:'8',teacher:true}));
  $('#lf').onsubmit=async e=>{e.preventDefault();if(DBSTATE!=='ok')return;
    const a=who();if(!a){sfx.no();return login(view,$('#lName').value.trim()?'Không tìm thấy họ tên này. Em gõ đúng họ tên đầy đủ có dấu nhé.':'Em nhập họ và tên.')}
    if(view==='forgot'){try{await DB.doc('accounts/'+a.id).update({reset:true,resetAt:new Date().toISOString()})}catch(e){}
      return msgBox('Đã báo thầy','Khi thầy đặt lại, mật khẩu của em là <b>0000</b>.'),login('in')}
    if(Date.now()<fails.until)return login(view,`Sai quá nhiều lần. Em thử lại sau ${Math.ceil((fails.until-Date.now())/1000)} giây.`);
    const old=view==='in'?$('#lPin').value:$('#lOld').value;
    if(!pinOk(old))return login(view,'Mật khẩu gồm đúng 4 chữ số.');
    if(await hashPin(a.salt,old)!==a.ph){fails.n++;if(fails.n>=5){fails={n:0,until:Date.now()+60000}}store.set('ltt:fails',fails);sfx.no();return login(view,'Sai mật khẩu. Nếu quên, bấm "Quên mật khẩu" để báo thầy.')}
    fails={n:0,until:0};store.set('ltt:fails',fails);
    if(view==='chg'){const n1=$('#lNew').value,n2=$('#lNew2').value;
      if(!pinOk(n1))return login('chg','Mật khẩu mới phải gồm đúng 4 chữ số.');if(n1!==n2)return login('chg','Hai lần nhập mật khẩu mới chưa khớp.');
      if(n1==='0000')return login('chg','Em chọn mật khẩu khác 0000 nhé.');
      try{await DB.doc('accounts/'+a.id).update({ph:await hashPin(a.salt,n1),reset:false,isDefault:false})}catch(e){return login('chg','Chưa lưu được, em thử lại.')}
      sfx.ok();return msgBox('Đã đổi mật khẩu','Lần sau em đăng nhập bằng mật khẩu mới.'),login('in')}
    enter(a,old==='0000')}}

function enter(a,isDefault){ACC={id:a.id,name:a.name,khoi:a.khoi,teacher:!!a.teacher,mon:a.teacher?['toan','anh']:monOf(a)};store.set('ltt:acc',ACC);
  P=Object.assign(newP(),store.get('ltt:p:'+ACC.id,{}));const doc=PLAYERS.find(x=>x.id===ACC.id);if(doc)mergeP(doc);
  if(!P.nick)P.nick='';curK=ACC.khoi;if(!ACC.teacher)checkSeason();save();sfx.win();
  if(!ACC.teacher&&isDefault){subjects();overlay(`<h2>Đổi mật khẩu nhé!</h2><p>Mật khẩu của em đang là <b>0000</b>. Em nên đổi sang 4 chữ số khác để bạn khác không vào nhầm.</p><button class="btn" id="dc">Đổi ngay</button><button class="btn alt" id="dl">Để sau</button>`);
    $('#dc').onclick=()=>{closeOvl();logout('chg')};$('#dl').onclick=closeOvl}
  else subjects()}
function logout(view){ACC=null;P=null;store.del('ltt:acc');login(view||'in')}

/* ---------- chọn khối ---------- */
/* ---------- chọn môn ---------- */
const MON={toan:{n:'Toán',c:'#ff7a59',d:'#e85a3a',ico:`<svg viewBox="0 0 64 64" width="64" height="64"><rect x="8" y="8" width="48" height="48" rx="12" fill="#fff" opacity=".25"/><path d="M20 22h12M26 16v12M36 22h10M20 42l10 10M30 42L20 52M36 44h10M36 50h10" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>`},
  anh:{n:'Tiếng Anh',c:'#3aa8e0',d:'#2584b8',ico:`<svg viewBox="0 0 64 64" width="64" height="64"><rect x="8" y="8" width="48" height="48" rx="12" fill="#fff" opacity=".25"/><path d="M16 46l9-28h4l9 28M19.5 36h15" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 30c3-3 9-3 9 3v13M51 38c-7-1-11 1-11 4.5 0 4 6 5 11 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`}};
const monOf=a=>Array.isArray(a&&a.mon)&&a.mon.length?a.mon:['toan'];
const hasMon=m=>!!ACC&&(ACC.teacher||(ACC.mon||['toan']).includes(m));
function subjects(){show('subj');
  $('#subjBody').innerHTML=`<div class="shead"><div style="width:96px">${owlSVG}</div><div><h1>Chào ${esc((P.nick||ACC.name).split(' ').slice(-1)[0])}!</h1><p>Hôm nay em học môn nào?</p></div></div>
   <div class="mons">${Object.entries(MON).map(([k,m],i)=>{const on=hasMon(k);return `<button class="mon${on?'':' off'}" data-m="${k}" style="--c:${m.c};--d:${m.d};animation-delay:${i*.1}s" ${on?'':'aria-disabled="true"'}>
     ${m.ico}<b>${m.n}</b><span>${on?(k==='anh'?'Sắp ra mắt':'Vào học ›'):'Chưa đăng kí'}</span>${on?'':'<i class="mlock">'+lockSVG+'</i>'}</button>`}).join('')}
    ${GV()?'':`<button class="mon shopm" id="sShop" style="animation-delay:${Object.keys(MON).length*.1}s"><span class="shav">${avatarOf(P,64)}</span><b>Cửa hàng<small>Ví ${bal()} XP · đã sưu tầm ${Object.keys(P.own||{}).length}/${ITEMS.length}</small></b><span>Mua sắm ›</span></button>`}</div>
   ${GV()?'':`<button class="frtile" id="sFr"><span class="frava">${followingOf(P).slice(0,4).map(id=>avatarOf(PLAYERS.find(x=>x.id===id),34)).join('')||avatarOf(P,34)}</span><span><b>Bạn bè</b><small>${followingOf(P).length} đang theo dõi · ${followersOf(ACC.id).length} người theo dõi</small></span>${newFollowers()?`<i class="dot">${newFollowers()} mới</i>`:'<i class="go">›</i>'}</button>`}
   ${GV()?`<div class="foot"><button class="btn alt" id="sBank">Ngân hàng câu hỏi</button><button class="btn alt" id="sRep">Câu báo lỗi${REPS.some(r=>!r.done)?` (${repGroups(false).length}) ●`:''}</button><button class="btn alt" id="sAcc">Tài khoản học sinh${ACCS.some(a=>a.reset)?' ●':''}</button><button class="btn alt" id="sOut">Thoát</button></div>`:`<div class="foot"><button class="btn alt" id="sOut">Đăng xuất</button></div>`}`;
  $$('#subjBody .mon').forEach(b=>b.onclick=()=>{const m=b.dataset.m;
    if(!hasMon(m)){sfx.no();b.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:300});return toast(`Em chưa đăng kí môn ${MON[m].n}. Em hỏi thầy để đăng kí nhé.`)}
    sfx.tap();m==='toan'?grades():anh()});
  $('#sShop')&&($('#sShop').onclick=()=>{sfx.tap();shopFrom='subj';shop()});
  $('#sFr')&&($('#sFr').onclick=()=>{sfx.tap();frTab=newFollowers()?'followers':'feed';friends()});
  $('#sAcc')&&($('#sAcc').onclick=()=>{sfx.tap();accounts()});$('#sRep')&&($('#sRep').onclick=()=>{sfx.tap();reportsPage()});$('#sBank')&&($('#sBank').onclick=()=>{sfx.tap();bank()});$('#sOut').onclick=()=>{sfx.tap();logout()}}
function anh(){show('anh');$('#anhBody').innerHTML=`<div class="empty"><div style="width:130px;margin:0 auto">${owlSVG}</div><h2 style="margin-top:8px">Tiếng Anh</h2><p>Bản đồ môn Tiếng Anh đang được chuẩn bị. Cherry sẽ báo em khi mở nhé!</p></div>`}

function grades(){show('grades');
  $('#gsub').textContent=`Khối của em: ${ACC.khoi}. Chọn khu vực để vào học.`;
  $('#ggrid').innerHTML=GRADES.map((g,i)=>{const ts=routeTopics(g.k);const st=ts.reduce((s,t)=>s+topicStars(t),0),mx=ts.reduce((s,t)=>s+nMan(t)*3,0);
    return `<button class="gtile${ACC.khoi===g.k?' mine':''}" data-k="${g.k}" style="--c:${g.c};--d:${g.d};--t:${g.dark?'#4a3300':'#fff'};animation-delay:${i*.08}s">
      <span class="gk">Khối</span><span class="gn">${g.k}</span><span class="gm">${ts.length} chủ đề</span><span class="gs">${star(1)} ${st}/${mx}</span>${ACC.khoi===g.k?'<span class="gme">Khối của em</span>':''}</button>`}).join('');
  $$('#ggrid .gtile').forEach(b=>b.onclick=()=>{sfx.tap();curK=b.dataset.k;area()});
  $('#gteach').innerHTML=''}

/* ---------- khu vực khối: 5 phần ---------- */
const fmtDue=d=>new Date(d).toLocaleString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
function asgStatus(a,ptOf){const t=TOPICS.find(x=>x.id===a.topicId);const need=Math.max(1,Math.min(a.levels,t?nMan(t):a.levels));let passed=0,last=null;
  for(let l=0;l<need;l++){const p=ptOf(a.topicId+'|'+l);if(!p)continue;passed++;if(!last||p>last)last=p}
  const complete=passed>=need;return {need,passed,complete,late:!!a.due&&complete&&last>a.due,overdue:!!a.due&&!complete&&Date.now()>Date.parse(a.due)}}
function dueLabel(a,s){if(s.complete)return s.late?'Xong (muộn)':'Đã xong';if(!a.due)return 'Không hạn';if(s.overdue)return 'Quá hạn';const h=(Date.parse(a.due)-Date.now())/36e5;return h<24?`Còn ${Math.max(1,Math.round(h))} giờ`:`Còn ${Math.ceil(h/24)} ngày`}
const myPt=k=>(P.pt&&P.pt[k])||(P.best[k]>0?'1970':null);
const asgFor=t=>ASG.filter(a=>a.topicId===t.id&&a.khoi===t.khoi).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9'))[0];
function counts(){const ix=qIndex();let nb=0;for(const [k,r] of Object.entries(P.rev||{}))if(ix[k]&&r.in_notebook)nb++;return {nb,saved:Object.keys(P.saved||{}).length}}
// Khu vực khối = bản đồ kho báu (các mục khác thu gọn thành biểu tượng nhỏ ở góc bản đồ)
function area(){journey()}
let JOPEN='';
const JICO={
  ontap:'<svg viewBox="0 0 24 24" width="28" height="28"><path d="M5 4h10l4 4v12H5z" fill="#fff"/><path d="M15 4v4h4" fill="#d9d2ff"/><path d="M8 11h8M8 14h8M8 17h5" stroke="#6a57e0" stroke-width="1.8" stroke-linecap="round"/></svg>',
  redo:'<svg viewBox="0 0 24 24" width="28" height="28"><path d="M19 12a7 7 0 11-2.05-4.95" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M19 4v5h-5" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  asg:'<svg viewBox="0 0 24 24" width="26" height="26"><rect x="5" y="4" width="14" height="17" rx="2" fill="#fff"/><rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="#ffd23f"/><path d="M8.5 13l2.3 2.3 4.7-5" stroke="#2584b8" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  track:'<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 19V11M10 19V6M15 19v-6M20 19V9" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'};
function jdock(){const el=$('#jdock');if(!el)return;const g=G0(curK),c=counts(),T=TIERS[tierOf(P.lp)],de=deTopics(curK),mine=g.k===ACC.khoi&&!ACC.teacher;
  const pend=x=>x.filter(t=>{const a=asgFor(t);return a&&!asgStatus(a,myPt).complete}).length,pd=pend(de);
  const q=mine?dq():null,qleft=q?q.ids.filter(id=>!q.c[id]).length+(q.ids.every(id=>q.c[id])&&!q.chest?1:0):0;
  const items=[
    mine&&{k:'quest',n:'Nhiệm vụ',ico:chestSVG(q.chest,34),c:'#ffb703',d:'#d98e00',badge:qleft,
      big:()=>questCard()+classCard()},
    {k:'ontap',n:'Ôn tập',ico:JICO.ontap,c:'#8d7bff',d:'#6a57e0',badge:pd,
      big:()=>`<button class="ptile wide" data-go="ontap" style="--c:#8d7bff;--d:#6a57e0">${JICO.ontap.replace(/28/g,'56')}<div><b>Ôn tập</b><span>${de.length} đề · đã làm ${de.filter(deDone).length}${pd?` · ${pd} đề thầy giao`:''}</span></div><i class="go">Vào ›</i></button>`},
    {k:'redo',n:'Câu sai',ico:JICO.redo,c:'#ff7a59',d:'#e85a3a',badge:c.nb,
      big:()=>`<button class="ptile wide" data-go="redo" style="--c:#ff7a59;--d:#e85a3a">${JICO.redo.replace(/28/g,'56')}<div><b>Làm lại câu sai</b><span>${c.nb} câu sai · ${c.saved} câu đã lưu</span></div><i class="go">Vào ›</i></button>`},
    {k:'ranked',n:'Thi đấu',ico:emblem(tierOf(P.lp),38),c:'#20374a',d:'#120f24',bd:T.c,
      big:()=>`<button class="ptile wide rk" data-go="ranked" style="--c:${T.c};--d:${T.d}">${emblem(tierOf(P.lp),56)}<div><b>Thi đấu</b><span>${T.n} · ${P.lp||0} điểm</span></div><i class="go">Vào trận ›</i></button>`},
    GV()&&{k:'asg',n:'Giao bài',ico:JICO.asg,c:'#3aa8e0',d:'#2584b8',act:asgForm},
    GV()&&{k:'track',n:'Theo dõi',ico:JICO.track,c:'#2fb787',d:'#1f8a63',act:track}].filter(Boolean);
  if(!items.some(x=>x.k===JOPEN&&x.big))JOPEN='';
  const op=items.find(x=>x.k===JOPEN);
  el.innerHTML=(op?`<div class="jshade" data-close></div><div class="jpanel"><button class="jx" data-close aria-label="Thu gọn">×</button>${op.big()}</div>`:'')+
    `<div class="jbtns">${items.map(x=>`<button class="jbtn${x.k===JOPEN?' on':''}" data-j="${x.k}" style="--c:${x.c};--d:${x.d}${x.bd?';--b:'+x.bd:''}" aria-label="${x.n}"><i class="jico">${x.ico}</i><small>${x.n}</small>${x.badge?`<em>${x.badge>99?'99+':x.badge}</em>`:''}</button>`).join('')}</div>`;
  $$('#jdock [data-j]').forEach(b=>b.onclick=()=>{sfx.tap();const x=items.find(y=>y.k===b.dataset.j);if(x.act){JOPEN='';x.act();return}JOPEN=JOPEN===x.k?'':x.k;jdock()});
  $$('#jdock [data-close]').forEach(b=>b.onclick=()=>{sfx.tap();JOPEN='';jdock()});
  $$('#jdock [data-go]').forEach(b=>b.onclick=()=>{sfx.tap();JOPEN='';({ontap:onTap,redo,ranked})[b.dataset.go]()});
  if(op&&op.k==='quest')bindQuest();
  typeset(el)}

/* ---------- bản đồ kho báu: Đại số + Hình học xen kẽ ---------- */
const chestSVG=(open,sz=60)=>`<svg viewBox="0 0 64 56" width="${sz}" height="${sz*56/64}" class="chest">${open?'<path d="M10 20L32 4 54 20" fill="#ffd23f" opacity=".5"/><circle cx="32" cy="14" r="9" fill="#ffe98a"/>':''}
 <rect x="6" y="24" width="52" height="28" rx="4" fill="#a0592a"/><rect x="6" y="24" width="52" height="7" fill="#7d4219"/>
 ${open?'<path d="M6 24l6-16h40l6 16z" fill="#c0703a"/><circle cx="24" cy="22" r="4" fill="#ffd23f"/><circle cx="34" cy="20" r="4.5" fill="#ffe14d"/><circle cx="42" cy="23" r="3.5" fill="#ffd23f"/>':'<path d="M6 24c0-12 8-18 26-18s26 6 26 18z" fill="#c0703a"/><path d="M6 24c0-12 8-18 26-18s26 6 26 18" stroke="#7d4219" stroke-width="2" fill="none"/>'}
 <rect x="27" y="26" width="10" height="12" rx="2" fill="#ffd23f" stroke="#c99a08" stroke-width="1.5"/><circle cx="32" cy="31" r="1.8" fill="#7d4219"/>
 <path d="M14 24v28M50 24v28" stroke="#ffd23f" stroke-width="3"/></svg>`;
const lockSVG='<svg width="26" height="26" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3" fill="#b9a27a"/><path d="M8 10V7a4 4 0 018 0v3" stroke="#b9a27a" stroke-width="2.6" fill="none"/></svg>';
const palm=(x,y,f)=>`<svg class="deco" style="left:${x}px;top:${y}px${f?';transform:scaleX(-1)':''}" width="54" height="64" viewBox="0 0 54 64"><path d="M27 62c2-16 2-30-2-42" stroke="#8a5a2b" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M25 20c-8-8-18-8-22-2 8-2 14 0 22 2zM25 20c4-10 14-14 22-10-8 0-14 4-22 10zM25 20c-12-2-20 6-20 14 4-8 10-12 20-14zM25 20c10-4 20 2 22 10-6-6-12-8-22-10z" fill="#4fae4a"/></svg>`;
const xmark=(x,y)=>`<svg class="deco" style="left:${x}px;top:${y}px" width="26" height="26" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="#c0392b" stroke-width="3.5" stroke-linecap="round"/></svg>`;
const wave=(x,y)=>`<svg class="deco" style="left:${x}px;top:${y}px" width="44" height="14" viewBox="0 0 44 14"><path d="M2 8q5-6 10 0t10 0 10 0 10 0" stroke="#5aa6b8" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
const flag=(x,y,txt)=>`<div class="hkflag" style="top:${y}px"><svg width="40" height="52" viewBox="0 0 40 52"><path d="M6 50V4" stroke="#6e3c16" stroke-width="3.5" stroke-linecap="round"/><path d="M7 5h26l-6 8 6 8H7z" fill="#ef3b55"/></svg><b>${txt}</b></div>`;
function journey(){show('journey');jdock();if(curK===ACC.khoi&&!ACC.teacher&&!P.tut)setTimeout(tutorial,400);const items=mapItems(curK),ts=items.filter(x=>x.t&&hasQ(x.t)).map(x=>x.t),el=$('#tmap');
  if(!items.length){el.innerHTML=`<div class="empty dark"><div style="width:110px;margin:0 auto">${owlSVG}</div><p>Khối ${curK} chưa có bản đồ.</p></div>`;return}
  const W=Math.min(el.clientWidth||390,480),BAN=86,STEP=112,TOP=210,BOT=90,HKH=96;
  const H=BOT+TOP+items.reduce((s,x)=>s+(x.hk?HKH:x.ch&&!x.L?BAN+30:STEP),0);
  let y=H-BOT,pts=[],html='',deco='',cur=null,k=0,ni=0;
  const chStat=ch=>{const L=items.filter(x=>x.L&&x.L.ch===ch);const has=L.filter(x=>x.t);return {n:L.length,done:has.filter(x=>topicPassed(x.t)>0).length,st:has.reduce((s,x)=>s+topicStars(x.t),0),has:has.length}};
  items.forEach(x=>{
    if(x.hk){const fy=y-HKH/2;pts.push([W/2,fy]);html+=flag(W/2,fy,'Hết học kì I · Sang học kì II');y-=HKH;return}
    if(x.ch&&!x.L){const c=x.ch,by=y-BAN/2,odd=k++%2,ph=PHAN[c.phan]||PHAN['dai-so'],S=chStat(c);pts.push([W/2,by]);
      deco+=(odd?palm(W-60,by-80,1):palm(8,by-84))+wave(odd?20:W-70,by+34);
      html+=`<div class="plank${S.has?'':' wait'}" style="top:${by}px;--c:${ph.c}"><span class="ptag">${ph.name}</span>${c.n?`<span class="cno">Chương ${c.n}</span>`:''}<b>${esc(c.title)}</b>
        <span class="pinfo">${S.has?`${star(1)} ${S.st}/${S.has*3} · đã qua ${S.done}/${S.n} bài`:'Sắp mở · đang chờ câu hỏi'}</span></div>`;
      y-=BAN+30;return}
    const L=x.L,t=x.t,side=[.3,.7,.62,.38][ni++%4],x2=side*W,ny=y-STEP/2;pts.push([x2,ny]);
    const lab=`<span class="tlab"><b>${L.lt?L.title:L.num?'Bài '+L.num:'Bổ sung'}</b>${L.lt?'':`<i>${esc(t&&!L.num?t.title:L.title)}</i>`}</span>`;
    if(!t){const gv=GV()&&L.id;html+=`<${gv?'button':'div'} class="tnode ghost${x2<W/2?' l':' r'}"${gv?` data-gl="${esc(L.id)}"`:''} style="left:${x2}px;top:${ny}px"><span class="coin">${L.lt?L.coin:L.num||'?'}</span>${lab}${gv?'<em class="hwn st">+ Dán bài</em>':''}</${gv?'button':'div'}>`;y-=STEP;return}
    if(!hasQ(t)){html+=`<button class="tnode ghost thy${x2<W/2?' l':' r'}" data-th="${esc(t.id)}" style="left:${x2}px;top:${ny}px"><span class="coin">${L.lt?L.coin:L.num||'?'}</span>${lab}<i class="thb">${bookSVG}</i>${GV()&&t.status!=='giao'?`<em class="hwn st">${({nhap:'Nháp',an:'Đã ẩn'})[t.status]||t.status}</em>`:''}</button>`;y-=STEP;return}
    const j=ts.indexOf(t),lo=topicOpen(ts,j),b=bestOf(t,0),a=asgFor(t),as=a&&asgStatus(a,myPt),st=!lo?'lock':b?'done':'open';
    if(st==='open'&&!cur)cur={x:x2,y:ny};
    html+=`<button class="tnode ${st}${x2<W/2?' l':' r'}" data-t="${j}" style="left:${x2}px;top:${ny}px"><span class="coin">${st==='lock'?lockSVG:L.lt?L.coin:L.num||'★'}</span>${lab}${stars(b)}${t.theory?`<i class="thb">${bookSVG}</i>`:''}
      ${a&&!as.complete?`<em class="hwn ${as.overdue?'late':''}">Thầy giao · ${dueLabel(a,as)}</em>`:''}${GV()&&t.status!=='giao'?`<em class="hwn st">${({nhap:'Nháp',an:'Đã ẩn'})[t.status]||t.status}</em>`:''}</button>`;
    y-=STEP});
  const allDone=ts.length>0&&ts.every(t=>topicPassed(t)>0)&&!items.some(x=>x.L&&x.L.id&&!x.t),cy=y-TOP/2+20;pts.push([W/2,cy+78]);
  if(!cur)cur=ts.length?{x:W/2,y:cy}:{x:pts[1]?pts[1][0]:W/2,y:pts[1]?pts[1][1]:H-200};
  let d=`M${pts[0][0]} ${pts[0][1]}`;for(let q=1;q<pts.length;q++){const p=pts[q-1],n=pts[q];d+=` C${p[0]} ${p[1]-STEP*.42} ${n[0]} ${n[1]+STEP*.42} ${n[0]} ${n[1]}`}
  el.innerHTML=`<div class="tmapin" style="height:${H}px;width:${W}px"><svg class="tpath" width="${W}" height="${H}"><path d="${d}" stroke="#8a5a2b" stroke-width="4" fill="none" stroke-dasharray="2 11" stroke-linecap="round"/></svg>
    ${deco}${xmark(W/2+52,cy-44)}<div class="tchest" style="top:${cy}px">${chestSVG(allDone,104)}<b>${allDone?'Đã mở kho báu!':'Kho báu cuối năm'}</b><small>Qua mọi bài của lớp ${curK} để mở</small></div>
    <div class="tstart" style="top:${H-34}px">Khởi hành · Lớp ${curK}</div>
    <svg class="deco compass" style="left:${W-78}px;top:${H-96}px" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#f6e7c4" stroke="#8a5a2b" stroke-width="2"/><path d="M32 8l5 24-5 24-5-24z" fill="#c0392b"/><path d="M8 32l24-5 24 5-24 5z" fill="#8a5a2b"/><text x="32" y="7" font-size="8" text-anchor="middle" fill="#8a5a2b" font-weight="700">B</text></svg>
    ${html}<div class="girl" style="left:${cur.x+(cur.x<W/2?66:-66)}px;top:${cur.y+30}px">${owlSVG}</div></div>`;
  el.scrollTop=Math.max(0,cur.y-el.clientHeight*.55);
  $$('#tmap .tnode[data-t]').forEach(n=>n.onclick=()=>{const j=+n.dataset.t,t=ts[j];sfx.tap();
    if(GV()){overlay(`<h2 style="font-size:24px">${esc(t.title)}</h2><button class="btn" id="g1">Chơi thử</button><button class="btn alt" id="g2">Cài đặt & sửa câu hỏi</button><button class="btn alt" id="g3">Đóng</button>`);
      $('#g1').onclick=()=>{closeOvl();curT=t;startLevel()};$('#g2').onclick=()=>{closeOvl();tOpts(t)};$('#g3').onclick=closeOvl;return}
    if(!topicOpen(ts,j)){n.animate([{transform:'translate(-50%,-50%) translateX(-6px)'},{transform:'translate(-50%,-50%) translateX(6px)'},{transform:'translate(-50%,-50%)'}],{duration:300});
      return toast('Qua bài trước để mở bài này nhé.')}
    curT=t;startLevel()});
  $$('#tmap .tnode.thy').forEach(b=>b.onclick=()=>{sfx.tap();const t=TOPICS.find(x=>x.id===b.dataset.th);if(!t)return;
    if(GV()){overlay(`<h2 style="font-size:24px">${esc(t.title)}</h2><p>Bài này mới có lý thuyết, chưa có câu hỏi.</p><button class="btn" id="g1">Xem lý thuyết</button><button class="btn alt" id="g2">Cài đặt & sửa</button><button class="btn alt" id="g3">Đóng</button>`);
      $('#g1').onclick=()=>{closeOvl();theory(t)};$('#g2').onclick=()=>{closeOvl();tOpts(t)};$('#g3').onclick=closeOvl;return}
    theory(t)});
  $$('#tmap .tnode.ghost:not(.thy)').forEach(b=>b.onclick=()=>{sfx.tap();const L=b.dataset.gl&&currOf(curK).find(c=>c.id===b.dataset.gl);
    if(GV()&&L)return pasteNew(L);toast(GV()?'Bài này chưa có câu hỏi.':'Bài này thầy đang chuẩn bị câu hỏi. Em làm các bài khác trước nhé!')})}

/* ---------- Dán bài mới (giáo viên): tạo chủ đề nháp cho bài chưa có câu hỏi ---------- */
// Nhận LaTeX do Gemini/Claude soạn; bỏ dấu ``` và các dòng %%% của file ngân hàng; thiếu \chude thì lấy tên bài SGK.
const cleanPaste=v=>String(v||'').replace(/\r/g,'').split('\n').filter(l=>!/^\s*```/.test(l)&&!/^\s*%%%/.test(l)).join('\n').trim();
function pasteNew(L){const k=curK,name=L.lt?lessonName(L):L.title;
  overlay(`<h2 style="font-size:24px">Dán bài mới</h2><p class="tnote">${esc(lessonName(L))} · Khối ${k}<br>Dán toàn bộ LaTeX của bài (lý thuyết và câu hỏi). Bài mới ở trạng thái <b>Nháp</b>; hình TikZ tự hiện sau khoảng 15 phút.</p>
    <textarea class="code" id="pn" spellcheck="false" placeholder="\\chude{${esc(name)}}"></textarea><div id="pnErr"></div>
    <button class="btn" id="pnS">Kiểm tra và tạo bài nháp</button><button class="btn alt" id="pnC">Hủy</button>`);
  $('#pnC').onclick=closeOvl;
  $('#pnS').onclick=async()=>{let text=cleanPaste($('#pn').value);const er=m=>{$('#pnErr').innerHTML=`<div class="err">${m}</div>`};
    if(!text)return er('Thầy dán nội dung bài vào ô trên.');
    if(!/\\chude\s*\{/.test(text))text=`\\chude{${name.replace(/[{}\\]/g,'')}}\n\n`+text;
    const P=parseTopic(text);if(P.errors.length)return er(P.errors.map(esc).join('<br>'));
    const nq=P.levels.reduce((s,l)=>s+l.qs.length,0);if(!nq&&!P.theory)return er('Chưa thấy câu hỏi hay lý thuyết nào trong nội dung đã dán.');
    if(TOPICS.some(t=>t.khoi===k&&t.chuong===L.id))return er('Bài này vừa có chủ đề (có thể do máy khác tạo). Thầy đóng hộp này để tải lại bản đồ.');
    const nf=(text.match(/\\begin\{tikzpicture\}/g)||[]).length,idx=currOf(k).filter(c=>c.id).findIndex(c=>c.id===L.id);
    $('#pnS').disabled=true;
    try{await DB.collection('topics').doc().set({title:P.title||name,khoi:k,phan:L.ch.phan,chuong:L.id,text,thutu:(idx+1)*10,nguon:'Dán bài mới (giáo viên)'});
      closeOvl();sfx.ok();toast(`Đã tạo bài nháp: ${nq} câu${P.theory?' + lý thuyết':''}${nf?` · ${nf} hình đang chờ dịch`:''}.`);journey()}
    catch(e){$('#pnS').disabled=false;er(esc(e&&e.message||'Lỗi kết nối'))}}}

/* ---------- tóm tắt lý thuyết của bài ---------- */
const bookSVG='<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.3-5.5-1.3-9 .7-3.5-2-6.5-2-9-.7z" fill="#fff" stroke="#2584b8" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 6v13.7" stroke="#2584b8" stroke-width="1.6"/></svg>';
const THK={dinhnghia:['Định nghĩa','#3aa8e0'],quytac:['Quy tắc','#2fb787'],congthuc:['Công thức','#ffb703'],dinhly:['Định lý','#8d7bff'],tinhchat:['Tính chất','#8d7bff'],luuy:['Lưu ý','#ef3b55'],vidu:['Ví dụ','#7a9399']};
function theoryHTML(items){let nv=0;return (items||[]).map(it=>{const [n,c]=THK[it.k]||['',  '#7a9399'];
  if(it.k==='vidu'){nv++;return `<div class="thc vd" style="--c:${c}"><span class="thk">Ví dụ ${nv}</span><div class="thb2">${tex(it.body)}</div><details><summary>Xem lời giải</summary><div class="thb2">${tex(it.sol)}</div></details></div>`}
  return `<div class="thc" style="--c:${c}"><span class="thk">${n}</span>${it.title?`<h3>${tex(it.title)}</h3>`:''}<div class="thb2">${tex(it.body)}</div></div>`}).join('')}
let thT=null;
function theory(t){thT=t;curT=t;show('theory');const L=lessonOf(t),q=hasQ(t);
  $('#thBody').innerHTML=`<div class="thhead"><span>${bookSVG} Tóm tắt lý thuyết</span><h1>${esc(L?lessonName(L):t.title)}</h1>${L&&L.ch?`<small>Chương ${L.ch.n} · ${esc(L.ch.title)}</small>`:''}</div>
   ${theoryHTML(t.theory)||'<div class="tbox"><p>Bài này chưa có tóm tắt lý thuyết.</p></div>'}
   <div class="thend">${q?'<button class="btn" id="thGo">Làm bài ngay</button>':`<p class="tnote2">${GV()?'Bài này chưa có câu hỏi.':'Bài này thầy đang chuẩn bị câu hỏi.'}</p>`}${GV()?'<button class="btn alt" id="thEd">Sửa lý thuyết</button>':''}<button class="btn alt" id="thBack">Về bản đồ</button></div>`;
  typeset($('#thBody'));
  $('#thGo')&&($('#thGo').onclick=()=>{sfx.tap();curT=t;startLevel()});$('#thEd')&&($('#thEd').onclick=()=>{sfx.tap();editTheory(t)});$('#thBack').onclick=()=>{sfx.tap();thT=null;journey()}}
const TH_TPL='\\begin{lythuyet}\n\\dinhnghia{Tên khái niệm}{Nội dung, công thức viết trong $...$}\n\\quytac{Tên quy tắc}{Nội dung}\n\\luuy{Lỗi hay gặp}\n\\vidu{Đề ví dụ}{Lời giải}\n\\end{lythuyet}';
function editTheory(t){t=TOPICS.find(x=>x.id===t.id)||t;const m=t.raw.match(/\\begin\{lythuyet\}[\s\S]*?\\end\{lythuyet\}/);
  overlay(`<h2 style="font-size:24px">Lý thuyết · ${esc(t.title)}</h2><textarea class="code" id="tx" spellcheck="false">${esc(m?m[0]:TH_TPL)}</textarea>
    <p class="tnote" style="text-align:left">Mục: <b>\\dinhnghia</b>, <b>\\quytac</b>, <b>\\congthuc</b>, <b>\\dinhly</b>, <b>\\tinhchat</b> dạng {tiêu đề}{nội dung}; <b>\\luuy{…}</b>; <b>\\vidu{đề}{lời giải}</b>. Xuống dòng: <b>\\\\</b>.</p>
    <div class="qpv thpv" id="tpv"></div><button class="btn" id="tS">Lưu lý thuyết</button>${m?'<button class="btn alt" id="tD">Xóa lý thuyết</button>':''}<button class="btn alt" id="tC">Hủy</button>`);
  const pv=()=>{const v=$('#tx').value,P=parseBank('\\chude{x}\n'+v);let h=P.errors.length?`<div class="err">${P.errors.map(e=>esc(errorText(e))).join('<br>')}</div>`:'';
    if(!/\\begin\{lythuyet\}[\s\S]*\\end\{lythuyet\}/.test(v))h=`<div class="err">Cần bọc trong \\begin{lythuyet} … \\end{lythuyet}</div>`;
    $('#tpv').innerHTML=h+theoryHTML(P.theory);typeset($('#tpv'));return !h};
  let tm=null;$('#tx').oninput=()=>{clearTimeout(tm);tm=setTimeout(pv,500)};pv();$('#tC').onclick=closeOvl;
  const put=blk=>{let text;if(m)text=t.raw.replace(m[0],()=>blk);else{const c=t.raw.match(/\\chude\s*\{[^}]*\}[^\n]*\n?/);const at=c?c.index+c[0].length:0;text=t.raw.slice(0,at)+(blk?'\n'+blk+'\n\n':'')+t.raw.slice(at)}
    return text.replace(/\n{3,}/g,'\n\n')};
  $('#tS').onclick=()=>{if(!pv())return;const text=put($('#tx').value.trim());if(parseTopic(text).errors.length>t.errors.length)return $('#tpv').insertAdjacentHTML('afterbegin','<div class="err">Lưu như vậy làm bài phát sinh lỗi.</div>');
    saveText(t,text,'Đã lưu lý thuyết.').then(()=>{const x=TOPICS.find(y=>y.id===t.id)||t;x.theory=parseTopic(x.raw).theory;if($$('.scr.on')[0]?.id==='theory')theory(x)})};
  $('#tD')&&($('#tD').onclick=()=>saveText(t,put(''),'Đã xóa lý thuyết.').then(()=>{const x=TOPICS.find(y=>y.id===t.id)||t;x.theory=null;if($$('.scr.on')[0]?.id==='theory')theory(x)}))}

/* ---------- ôn tập: lưới đề, Phần 1 trắc nghiệm (TN), Phần 2 tự luận (TL) ---------- */
const ICO_TN='<svg viewBox="0 0 24 24" width="34" height="34"><rect x="4" y="3" width="16" height="18" rx="3" fill="#fff"/><circle cx="8.5" cy="8.5" r="1.8" fill="#8d7bff"/><circle cx="8.5" cy="13" r="1.8" fill="none" stroke="#8d7bff" stroke-width="1.4"/><circle cx="8.5" cy="17.5" r="1.8" fill="none" stroke="#8d7bff" stroke-width="1.4"/><path d="M12 8.5h5M12 13h5M12 17.5h4" stroke="#b9aefc" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICO_TL='<svg viewBox="0 0 24 24" width="34" height="34"><path d="M4 4.5c3-1 5.5-.6 8 1v15c-2.5-1.6-5-2-8-1z" fill="#fff"/><path d="M20 4.5c-3-1-5.5-.6-8 1v15c2.5-1.6 5-2 8-1z" fill="#ffe7c2"/><path d="M6.3 9h3.6M6.3 12h3.6M14 9h3.6" stroke="#f08a24" stroke-width="1.4" stroke-linecap="round"/><path d="M13.5 17.5l5.8-7.3 1.8 1.4-5.8 7.3-2.3.9z" fill="#f08a24"/></svg>';
function deTile(t,lab,i){const a=asgFor(t),as=a&&asgStatus(a,myPt),tl=isTL(t),done=deDone(t),sc=P.score[key(t,0)];
  return `<div class="dtile${tl?' tl':''}" style="animation-delay:${i*.04}s"><button class="dtmain" data-de="${t.id}">
    ${a&&!as.complete?`<em class="dbadge ${as.overdue?'late':''}">Thầy giao</em>`:''}<i class="dtico">${tl?ICO_TL:ICO_TN}</i><b>${lab}</b><small>${esc(t.title)}</small>
    <span class="dst">${tl?(done?'✓ Đã làm':'Làm vào vở'):(sc!=null?sc+'%':'Chưa làm')}</span>
    ${GV()?`<span class="chip ${t.status}">${({nhap:'Nháp',giao:'Đã duyệt',an:'Đã ẩn'})[t.status]}${t.errors.length?' · lỗi':''}</span>`:''}</button>
    ${GV()?`<button class="dtset" data-ds="${t.id}" aria-label="Cài đặt">⚙</button>`:''}</div>`}
function onTap(){show('ontap');const de=deTopics(curK),tn=de.filter(t=>!isTL(t)),tl=de.filter(isTL);
  const sect=(h,sub,list,pre,c)=>`<div class="dsect" style="--c:${c}"><b>${h}</b><span>${sub}</span></div>`+
    (list.length?`<div class="dgrid">${list.map((t,i)=>deTile(t,pre+(i+1),i)).join('')}</div>`:`<div class="tbox dnone">${DBSTATE==='ok'?'Chưa có đề nào ở phần này.':'Đang tải…'}</div>`);
  $('#ontapBody').innerHTML=`<div class="phead" style="--c:#8d7bff;--d:#6a57e0"><b>Ôn tập</b><span>Đề tổng hợp để ôn thi. Phần 1 làm ngay trên app, Phần 2 làm vào vở.</span></div>`+
    sect('Phần 1 · Trắc nghiệm','Trắc nghiệm, đúng/sai, trả lời ngắn, nối ý. Làm xong biết điểm ngay.',tn,'TN','#8d7bff')+
    sect('Phần 2 · Tự luận',`Làm bài vào vở bài tập. Mỗi gợi ý mở lần đầu trừ ${HINT_XP} XP.`,tl,'TL','#f08a24')+
    (GV()?`<button class="btn alt" id="deNew" style="margin-top:14px">+ Tạo đề ôn tập mới</button>`:'');
  const byId=id=>de.find(t=>t.id===id);
  $$('#ontapBody [data-de]').forEach(b=>b.onclick=()=>{sfx.tap();const t=byId(b.dataset.de),lab=(isTL(t)?'TL':'TN')+((isTL(t)?tl:tn).indexOf(t)+1);
    if(isTL(t))return tlDe(t,lab);
    const n=t.levels.reduce((s,l)=>s+l.qs.length,0);
    overlay(`<h2>${lab} · ${esc(t.title)}</h2><p>${n} câu · không có gợi ý, không giới hạn tim. Làm xong mới xem điểm.</p><button class="btn" id="dGo">Bắt đầu làm đề</button><button class="btn alt" id="dNo">Để sau</button>`);
    $('#dGo').onclick=()=>{closeOvl();startDe(t)};$('#dNo').onclick=closeOvl});
  $$('#ontapBody [data-ds]').forEach(b=>b.onclick=()=>{sfx.tap();tOpts(byId(b.dataset.ds))});
  $('#deNew')&&($('#deNew').onclick=()=>{sfx.tap();bankNewDe(curK,d=>{closeOvl();sfx.ok();qedit(d)})})}

/* ---------- đề tự luận: đề bài + gợi ý (mua bằng XP), học sinh làm vào vở ---------- */
let tlT=null,tlLab='';const TLQ={};
function tlQs(t){return t.levels.flatMap(l=>l.qs).map(q=>{if(!q.params)return q;if(!TLQ[q.key])try{TLQ[q.key]=instantiate(q)}catch(e){TLQ[q.key]=q}return {...TLQ[q.key],key:q.key}})}
function tlDe(t,lab){tlT=t;if(lab)tlLab=lab;show('tlde');const qs=tlQs(t),gv=GV(),k=key(t,0),done=P.pt&&P.pt[k],a=asgFor(t),as=a&&asgStatus(a,myPt);P.tlh=P.tlh||{};
  $('#tlBody').innerHTML=`<div class="phead" style="--c:#f08a24;--d:#c96a0c"><b>${esc(tlLab)} · ${esc(t.title)}</b><span>${qs.length} câu tự luận. Em làm bài vào vở bài tập, trình bày đầy đủ như khi đi thi.</span></div>
   ${a?`<div class="tbox"><span class="chip hwc ${as.complete?'giao':as.overdue?'late':'nhap'}">Thầy giao · ${dueLabel(a,as)}</span>${a.note?` <small>${esc(a.note)}</small>`:''}</div>`:''}
   <div class="tbox tlwal">${gv?'<b>Giáo viên xem được mọi gợi ý và lời giải, không bị trừ XP.</b>':`Bí quá thì mở gợi ý. Mỗi gợi ý mở lần đầu trừ <b>${HINT_XP} XP</b>, gợi ý đã mở thì xem lại miễn phí.<br>Ví XP của em: <b id="tlBal">${fmtXP(bal())}</b> XP`}</div>`+
   qs.map((q,i)=>{const nh=(q.hints||[]).length,u=gv?nh:Math.min(nh,P.tlh[q.key]||0);
     return `<div class="tbox tlq"><span class="tag">Câu ${i+1}</span><div class="stem">${tex(q.stem)}</div>
      ${(q.hints||[]).slice(0,u).map((h,j)=>`<div class="vh"><b>Gợi ý ${j+1}.</b> ${tex(h)}</div>`).join('')}
      ${u<nh?`<button class="btn sm tlh" data-h="${i}" ${bal()<HINT_XP?'disabled':''}>💡 Mở gợi ý ${u+1}/${nh} · −${HINT_XP} XP</button>${bal()<HINT_XP?'<small class="tnote">Ví XP chưa đủ để mở gợi ý.</small>':''}`:nh?'':'<small class="tnote">Câu này không có gợi ý.</small>'}
      ${gv&&q.sol?`<div class="sol"><b>Lời giải (chỉ giáo viên thấy).</b> ${tex(q.sol)}</div>`:''}${canReport({...q,tid:t.id})?`<div class="tlrp">${repBtn(q,'rpT'+i)}</div>`:''}</div>`}).join('')+
   (gv?`<button class="btn alt" id="tlEd">✎ Sửa đề này</button>`:done?`<div class="tbox tldone">✓ Em đã đánh dấu làm xong ngày ${new Date(done).toLocaleDateString('vi-VN')}.</div>`:`<button class="btn big" id="tlOk">Em đã làm xong vào vở</button>`);
  typeset($('#tlBody'));
  $$('#tlBody [data-h]').forEach(b=>b.onclick=()=>{sfx.tap();const q=qs[+b.dataset.h],u=P.tlh[q.key]||0;if(bal()<HINT_XP)return;
    overlay(`<h2>Mở gợi ý ${u+1}?</h2><p>Gợi ý này trừ <b>${HINT_XP} XP</b> trong Ví XP (còn ${fmtXP(bal())} XP). Em đã thử tự làm chưa?</p><button class="btn" id="hY">Mở gợi ý</button><button class="btn alt" id="hN">Để em thử thêm</button>`);
    $('#hN').onclick=closeOvl;$('#hY').onclick=()=>{closeOvl();if(bal()<HINT_XP)return;P.tlh[q.key]=u+1;P.spent=(P.spent||0)+HINT_XP;save();syncMine();toast(`Đã mở gợi ý · <b>−${HINT_XP} XP</b>`);tlDe(t)}});
  $$('#tlBody .rpb').forEach((b,i)=>{const q=qs.find(x=>x.key===b.dataset.k);if(q)b.onclick=e=>reportQ({...q,tid:t.id,title:t.title},e.currentTarget)});
  $('#tlEd')&&($('#tlEd').onclick=()=>{sfx.tap();qedit(t)});
  $('#tlOk')&&($('#tlOk').onclick=()=>{sfx.ok();P.pt[k]=new Date().toISOString();if(P.best[k]==null)P.best[k]=0;save();syncMine();toast('Giỏi lắm! Nhớ mang vở cho thầy xem nhé.');tlDe(t)})}
function startDe(t){curT=t;let qs;try{qs=t.levels.flatMap((l,li)=>l.qs.map(q=>inst(q,{tid:t.id,level:li,title:t.title})))}catch(e){return msgBox('Câu hỏi lỗi',esc(e.message))}
  if(!qs.length)return msgBox('Đề trống','Đề này chưa có câu hỏi.');
  newG('de',qs,{t});hud();show('play');renderQ()}

/* ---------- giáo viên: cài đặt chủ đề / đề ---------- */
function tOpts(t){overlay(`<h2 style="font-size:26px">${esc(t.title)}</h2><div class="form">
   <div><span class="chip ${t.status}">${({nhap:'Nháp',giao:'Đã duyệt',an:'Đã ẩn'})[t.status]}</span> <small>${t.levels.reduce((a,l)=>a+l.qs.length,0)} câu · ${t.levels.length} mức${t.nguon?' · '+esc(t.nguon):''}</small></div>
   ${t.errors.length?`<div class="err">${t.errors.map(esc).join('<br>')}</div>`:''}
   <label>Thuộc phần<select class="name" id="oPh">${Object.entries(PHAN).map(([k,v])=>`<option value="${k}" ${k===t.phan?'selected':''}>${v.name}${k==='on-tap'?' (đề)':''}</option>`).join('')}</select></label>
   ${isKho(t)?`<label>Chương<select class="name" id="oCh">${chapsOf(t.khoi).filter(c=>c.ch).map(c=>`<option value="k${t.khoi}-c${c.ch.n}" ${t.chuong===`k${t.khoi}-c${c.ch.n}`?'selected':''}>Chương ${c.ch.n}. ${esc(c.ch.title)}</option>`).join('')}</select></label>`:`<label>Bài trên bản đồ<select class="name" id="oCh"><option value="">Chủ đề bổ sung (cuối bản đồ)</option>${currOf(t.khoi).filter(c=>c.ch&&!c.id).map(c=>`<optgroup label="Chương ${c.ch.n}. ${esc(c.ch.title)}">${currOf(t.khoi).filter(x=>x.id&&x.ch===c.ch).map(x=>`<option value="${x.id}" ${(t.chuong||ALIAS[t.id])===x.id?'selected':''}>${esc(x.lt?'Luyện tập chung':'Bài '+x.num+'. '+x.title)}</option>`).join('')}</optgroup>`).join('')}</select></label>`}
   <label>Thứ tự nếu nhiều chủ đề cùng một bài<input class="name" id="oOrd" type="number" value="${t.order}"></label>
   <button class="btn" id="oSave">Lưu</button>${t.status!=='giao'?`<button class="btn" id="oGiao" ${t.errors.length?'disabled':''}>Duyệt cho học sinh</button>`:''}${t.status!=='an'?`<button class="btn alt" id="oAn">Ẩn khỏi học sinh</button>`:''}
   <button class="btn" id="oQ">Sửa câu hỏi</button><button class="btn alt" id="oC">Đóng</button></div>`);
  const up=async v=>{try{const r=await DB.doc('topics/'+t.id).update({...v,capnhat:new Date().toISOString()});if(r&&r.updated_at)t.upd=r.updated_at;sfx.ok();closeOvl()}catch(e){msgBox('Chưa lưu được',esc(e&&e.message||'Lỗi kết nối'))}};
  $('#oSave').onclick=()=>up({phan:$('#oPh').value,chuong:$('#oCh').value,thutu:Number($('#oOrd').value)||0});
  $('#oGiao')&&($('#oGiao').onclick=()=>up({trangthai:'giao'}));$('#oAn')&&($('#oAn').onclick=()=>up({trangthai:'an'}));$('#oC').onclick=closeOvl;$('#oQ').onclick=()=>{closeOvl();qedit(t)}}

/* ---------- làm lại câu sai + câu đã lưu ---------- */
let redoTab='sai';
function qIndex(){const ix={};for(const t of TOPICS){if(!visible(t)||t.khoi!==(ACC?.khoi||curK))continue;t.levels.forEach((l,li)=>l.qs.forEach(q=>{ix[q.key]={q,t,li}}))}return ix}
function redo(){show('redo');const ix=qIndex(),wr=Object.entries(P.rev||{}).filter(([k,r])=>ix[k]&&r.in_notebook),sv=Object.entries(P.saved||{}).sort((a,b)=>b[1].at.localeCompare(a[1].at));
  const byT={};wr.forEach(([k])=>{const t=ix[k].t.title;byT[t]=(byT[t]||0)+1});
  $('#redoBody').innerHTML=`<div class="phead" style="--c:#ff7a59;--d:#e85a3a"><b>Làm lại câu sai</b><span>Đúng lại ở 2 ngày khác nhau thì câu được gạch khỏi danh sách.${ACC&&!ACC.teacher?` Còn <b>${nbOpen()}</b> câu chưa làm lại đúng lần nào${P.rlock?' (Thi đấu đang khóa đến khi về 0)':''}.`:''}</span></div>
   <div class="seg"><button data-tab="sai" class="${redoTab==='sai'?'on':''}">Câu sai (${wr.length})</button><button data-tab="luu" class="${redoTab==='luu'?'on':''}">Đã lưu (${sv.length})</button></div>
   ${redoTab==='sai'?(wr.length?`<button class="btn big" id="rGo">Làm lại ${Math.min(10,wr.length)} câu</button><div class="tbox">${Object.entries(byT).map(([t,n])=>`<div class="row2"><span>${esc(t)}</span><b>${n} câu</b></div>`).join('')}</div>`
      :`<div class="empty"><div style="width:90px;margin:0 auto">${owlSVG}</div><p>Chưa có câu sai nào cần làm lại. Giỏi lắm!</p></div>`)
    :(sv.length?sv.map(([id,s])=>`<button class="svcard" data-sv="${id}"><span class="tag tt">${esc(s.title)}</span><div class="stem clamp">${tex(s.q.stem)}</div><small>Lưu ${new Date(s.at).toLocaleDateString('vi-VN')}</small></button>`).join('')
      :`<div class="empty"><p>Chưa lưu câu nào. Khi làm bài, bấm nút ${bookmark(false)} để lưu câu cùng lời giải.</p></div>`)}`;
  typeset($('#redoBody'));
  $$('#redoBody [data-tab]').forEach(b=>b.onclick=()=>{sfx.tap();redoTab=b.dataset.tab;redo()});
  $('#rGo')&&($('#rGo').onclick=()=>{sfx.tap();startReview()});
  $$('#redoBody [data-sv]').forEach(b=>b.onclick=()=>{sfx.tap();viewSaved(b.dataset.sv)})}
function answerHTML(q){
  const w=x=>x?`<div class="vw">↳ ${tex(x)}</div>`:'';
  if(q.type==='ex')return q.opts.map((o,i)=>`<div class="va${o.ok?' y':''}">${'ABCDEF'[i]}. ${tex(o.t)}${o.ok?' ✓':''}${w(o.why)}</div>`).join('');
  if(q.type==='extf')return q.items.map((o,i)=>`<div class="va">${'abcdef'[i]}) ${tex(o.t)} — <b class="${o.ok?'y':'n'}">${o.ok?'Đúng':'Sai'}</b>${w(o.why)}</div>`).join('');
  if(isQ2(q))return q2Answer(q);
  if(q.type==='extl')return `<div class="va">Tự luận: học sinh làm vào vở${q.hints?` · ${q.hints.length} gợi ý`:' · chưa có gợi ý'}</div>`;
  if(q.type==='exfb')return `<div class="va y">Đáp số: ${tex(q.ans.join(' hoặc '))}</div>`+(q.traps||[]).map(x=>`<div class="va">Nếu ghi ${tex(x.a)}${w(x.why)}</div>`).join('');
  return q.pairs.map((p,i)=>`<div class="va"><span class="mdot" style="background:${MPC[i%MPC.length][1]}"></span>${tex(p[0])} ⟶ ${tex(p[1])}</div>`).join('')}
function viewSaved(id){const s=P.saved[id];if(!s)return;
  overlay(`<div class="viewq"><span class="tag tt">${esc(s.title)}</span><div class="stem">${tex(s.q.stem)}</div><div class="vans">${answerHTML(s.q)}</div>
    ${s.q.hints?s.q.hints.map((h,i)=>`<div class="vh"><b>Gợi ý ${i+1}.</b> ${tex(h)}</div>`).join(''):''}${s.q.sol?`<div class="sol"><b>Lời giải.</b> ${tex(s.q.sol)}</div>`:''}</div>
    <button class="btn" id="vT">Làm thử lại</button><button class="btn alt" id="vD">Bỏ lưu</button><button class="btn alt" id="vC">Đóng</button>`);
  $('#vC').onclick=closeOvl;$('#vD').onclick=()=>{delete P.saved[id];save();syncMine();closeOvl();redo()};
  $('#vT').onclick=()=>{closeOvl();const q=JSON.parse(JSON.stringify(s.q));newG('one',[{...q,title:s.title}],{});hud();show('play');renderQ()}}

/* ---------- thi đấu ---------- */
function ranked(){show('ranked');const t=tierOf(P.lp),T=TIERS[t],N=TIERS[t+1],lp=P.lp||0,lk=rankLock(),SO=seasonOf();
  $('#rankedBody').innerHTML=`<div class="rcard" style="--c:${T.c};--d:${T.d}">${emblem(t,110)}<h2>${T.n}</h2><div class="rlp">${lp} điểm</div>
     ${N?`<div class="rnext"><i style="width:${(lp-T.lp)/(N.lp-T.lp)*100}%"></i></div><small>Còn ${N.lp-lp} điểm để lên ${N.n}</small>`:'<small>Bậc cao nhất!</small>'}</div>
   ${lk?`<div class="tbox rlock"><b>Thi đấu đang tạm khóa</b><div>Em còn <b>${lk} câu sai</b> chưa làm lại đúng. Dọn sạch kho câu sai rồi vào trận nhé: hiểu chắc bài cũ thì thi đấu mới lên hạng bền.</div></div><button class="btn big co" id="rFix">Làm lại câu sai (${lk})</button>`:`<button class="btn big" id="rPlay">Vào trận</button>`}
   <p class="tnote2">Hôm nay đã cộng ${Math.min(RANK_DAY_CAP,lpdE().g)}/${RANK_DAY_CAP} điểm thi đấu · ${esc(SO.name)}, còn ${SO.left} ngày.</p>
   <div class="tbox rules"><b>Luật thi đấu</b><div>• Mỗi mùa ${SEASON_DAYS} ngày. Sang mùa mới mọi người bắt đầu lại từ 0 điểm, thành tích mùa cũ lưu ở trang cá nhân.</div><div>• Có hơn ${NB_LOCK} câu sai chưa làm lại đúng thì tạm khóa Thi đấu, dọn sạch kho câu sai mới mở lại.</div><div>• Mỗi ngày cộng tối đa ${RANK_DAY_CAP} điểm thi đấu.</div><div>• Mỗi trận 10 câu của khối ${ACC.khoi}, không có gợi ý. Bậc ${T.n}: ${(RANK_BY_TIER[t]||RANK_PICK).map((n,i)=>n?n+' câu mức '+(i+1):'').filter(Boolean).join(', ')}. Bậc càng cao câu càng khó.</div>${mocOf(ACC.khoi)?`<div>• Đang thi kiến thức ${chRange(mocOf(ACC.khoi))} (đến chương ${esc(chapTitle(ACC.khoi,mocOf(ACC.khoi)))}). Khoảng một nửa số câu thuộc chương mới học nhất.</div>`:''}<div>• Câu đã gặp ở trận trước sẽ không ra lại; câu cùng dạng thì được đổi số.</div><div>• Thời gian mỗi câu: mức 1: 30 giây, mức 2: 45 giây, mức 3: 60 giây, mức 4: 90 giây. Hết giờ tính là sai.</div><div>• Đúng càng nhanh càng nhiều điểm trận. Bậc ${T.n} cần đạt ${Math.round(rankTarget(t)*100)}% điểm trận tối đa mới được cộng điểm; bậc càng cao mức chuẩn càng cao.</div><div>• Thưởng chính xác: đúng 10/10 câu +6, 9/10 +4, 8/10 +2.</div><div>• Câu sắp xếp lời giải, sơ đồ: đúng một phần được điểm theo số dòng/ô đúng.</div></div>
   <button class="btn alt" id="rBoard">Bảng xếp hạng</button>
   ${(P.hist||[]).length?`<h2 class="sect">Trận gần đây</h2><div class="tbox">${P.hist.slice(-6).reverse().map(h=>`<div class="row2"><span>${new Date(h.at).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${h.c}/${h.n} câu · ${h.s} điểm trận</span><b class="${h.d>=0?'y':'n'}">${h.d>=0?'+':''}${h.d}</b></div>`).join('')}</div>`:''}`;
  $('#rPlay')&&($('#rPlay').onclick=()=>{sfx.tap();startRank()});$('#rFix')&&($('#rFix').onclick=()=>{sfx.tap();redoTab='sai';redo()});$('#rBoard').onclick=()=>{sfx.tap();boardT=null;board()}}
/* Thi đấu: không lặp câu với cùng một người chơi.
   P.rseen[key] = "số trận|mã đề đã ra" — ưu tiên câu chưa gặp; câu có tham số gặp lại thì bắt buộc đổi số;
   câu cố định đã gặp chỉ dùng khi kho cạn, và lấy câu gặp lâu nhất. */
const hashS=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return (h>>>0).toString(36)};
function rankRank(x){const v=(P.rseen||{})[x.q.key];if(v==null)return 0;const m=+String(v).split('|')[0]||0;return (x.q.params?1e6:2e6)+m}
function rankPick(pools,want,used=new Set()){const picks=[];
  // ok(x): được phép lấy ở lượt này; lần 1 chỉ câu chưa gặp hoặc câu có tham số (đổi số), lần 2 mới tới câu cố định đã gặp
  const take=(li,n,ok)=>{const c=shuffle(pools[li].filter(x=>!used.has(x.q.key)&&ok(x))).sort((a,b)=>rankRank(a)-rankRank(b));
    for(const x of c){if(n<=0)break;used.add(x.q.key);picks.push(x);n--}return n};
  const fresh=x=>rankRank(x)<2e6,any=()=>true,near=[0,-1,1,-2,2,-3,3],top=want.reduce((m,n,i)=>n?i:m,0);
  want.forEach((n,i)=>{let left=n;
    // chỉ mượn câu chưa gặp ở mức liền kề để trận không bị dễ/khó bất thường; kho cạn hẳn mới lặp câu gặp lâu nhất
    for(const [ok,ds] of [[fresh,[0,-1,1]],[any,near]])for(const d of ds){if(left<=0)break;const j=i+d;if(j>=0&&j<=top)left=take(j,left,ok)}}); // không mượn câu khó hơn mức cao nhất của bậc
  return picks.sort((a,b)=>a.li-b.li)}
function rankInst(x){const old=String((P.rseen||{})[x.q.key]||'').split('|')[1];let q;
  for(let k=0;k<8;k++){q=inst(x.q,{tid:x.t.id,level:x.li,title:x.t.title});if(!x.q.params||!old||hashS(q.stem)!==old)break}
  delete q.hints;q.raw=null;q.rh=hashS(q.stem);return q}
function rankSeen(qs){const r=P.rseen||(P.rseen={}),m=P.matches||0;qs.forEach(q=>{if(q.key)r[q.key]=m+'|'+q.rh});
  const ks=Object.keys(r);if(ks.length>1500)ks.sort((a,b)=>(+String(r[a]).split('|')[0])-(+String(r[b]).split('|')[0])).slice(0,ks.length-1500).forEach(k=>delete r[k])}
/* Mốc chương: chỉ rút câu của chương 1..N (bài chưa gắn chương luôn được dùng);
   có mốc thì khoảng một nửa số câu thuộc chương N, phần còn lại từ các chương trước; thiếu thì bù từ toàn kho. */
function rankPools(k){const m=mocOf(k),P4=()=>[[],[],[],[]],all=P4(),rec=P4(),old=P4();
  for(const t of TOPICS){if(t.khoi!==k||t.status!=='giao'||t.errors.length||isDe(t)||!inMoc(t))continue;const c=chapOf(t);
    t.levels.forEach((l,i)=>{const L=Math.min(3,Math.max(0,(Number(l.n)||i+1)-1));l.qs.forEach(q=>{if(q.type==='extl')return;const x={q,t,li:L};all[L].push(x);(m&&c===m?rec:old)[L].push(x)})})}
  return {m,all,rec,old}}
const cntLv=(ps,i)=>ps.filter(x=>Math.min(3,x.li)===i).length;
function rankMix(R,want){if(!R.m)return rankPick(R.all,want);
  const used=new Set(),tot=want.reduce((a,b)=>a+b,0),wr=want.map(n=>Math.floor(n/2));let more=Math.round(tot/2)-wr.reduce((a,b)=>a+b,0);
  want.forEach((n,i)=>{if(more>0&&n%2){wr[i]++;more--}});
  const pr=rankPick(R.rec,wr,used),po=rankPick(R.old,want.map((n,i)=>Math.max(0,n-cntLv(pr,i))),used).slice(0,tot-pr.length),got=[...pr,...po];
  // còn thiếu: bù từ toàn kho theo mức còn hụt, rồi (kho quá mỏng) lấy câu khó hơn mức của bậc
  const fill=w=>{const need=tot-got.length;if(need>0)got.push(...rankPick(R.all,w,used).slice(0,need))};
  fill(want.map((n,i)=>Math.max(0,n-cntLv(got,i))));fill([0,0,0,tot-got.length]);
  return got.sort((a,b)=>a.li-b.li)}
function startRank(){if(ACC.teacher&&!TEACHER)return;if(rankLock())return ranked();const R=rankPools(ACC.khoi);
  const total=R.all.reduce((s,p)=>s+p.length,0);if(total<4)return msgBox('Chưa đủ câu hỏi','Khối này cần thêm chủ đề đã giao để mở thi đấu.');
  const picks=rankMix(R,RANK_BY_TIER[tierOf(P.lp)]||RANK_PICK);
  let qs;try{qs=picks.map(x=>rankInst(x))}catch(e){return msgBox('Câu hỏi lỗi',esc(e.message))}
  newG('rank',qs,{});hud();show('play');$('#stage').innerHTML='';$('#dock').innerHTML='';
  overlay(`${emblem(tierOf(P.lp),80)}<h2>Sẵn sàng?</h2><p>${qs.length} câu · không gợi ý · có giới hạn thời gian. Thoát giữa trận vẫn bị tính kết quả.</p><button class="btn" id="go">Bắt đầu trận</button><button class="btn alt" id="gb">Để sau</button>`);
  $('#go').onclick=()=>{sfx.tap();closeOvl();G.started=true;rankSeen(qs);save();renderQ()};$('#gb').onclick=()=>{closeOvl();ranked()}}
let boardT=null,boardTab='rank',boardK='mine';
function board(){show('board');const me=ACC.id,ses=seasonName();
  const meDoc={...(PLAYERS.find(p=>p.id===me)||{}),id:me,name:ACC.name,khoi:ACC.khoi,nick:P.nick,avatar:P.avatar,eq:P.eq,lp:P.lp||0,wk:P.wk,season:P.season,matches:P.matches};
  const all=[...PLAYERS.filter(p=>p.id!==me),...(ACC.teacher?[]:[meDoc])];
  const tabs=`<div class="seg"><button data-bt="rank" class="${boardTab==='rank'?'on':''}">Thi đấu · ${esc(ses)}</button><button data-bt="week" class="${boardTab==='week'?'on':''}">Tiến bộ tuần</button></div>`;
  if(boardTab==='week'){const w=weekId(),rows=all.filter(p=>p.wk&&p.wk.w===w&&(p.wk.xp||0)>0&&(boardK==='all'||(boardK==='friends'?(p.id===ACC.id||isFollow(p.id)):p.khoi===(ACC.khoi||curK)))).sort((a,b)=>(b.wk.xp||0)-(a.wk.xp||0));
    if(!ACC.teacher&&rows[0]&&rows[0].id===me&&(P.wk.xp||0)>=300&&boardK==='mine'&&!P.stats.weekTop){P.stats.weekTop=1;save();syncMine()}
    $('#boardBody').innerHTML=tabs+`<div class="seg sm"><button data-bk="mine" class="${boardK==='mine'?'on':''}">Khối ${esc(ACC.khoi||curK)}</button>${ACC.teacher?'':`<button data-bk="friends" class="${boardK==='friends'?'on':''}">Bạn bè</button>`}<button data-bk="all" class="${boardK==='all'?'on':''}">Toàn CLB</button></div>
      <p class="tnote2">XP kiếm được từ thứ Hai tuần này. Ai cũng có cơ hội đứng đầu, làm mới mỗi tuần!</p>`+
      (rows.length?rows.map((p,i)=>`<button class="brow${p.id===me?' me':''}${i<3?' top'+i:''}" data-p="${p.id}"><span class="bno">${i<3?['🥇','🥈','🥉'][i]:i+1}</span>${avatarOf(p,36)}<span class="bn"><b>${esc(p.nick||p.name||'?')}</b><small>Khối ${esc(p.khoi||'?')} · ${p.wk.c||0} câu đúng</small></span><b class="blp">+${p.wk.xp}</b></button>`).join(''):'<div class="tempty">Tuần này chưa ai kiếm XP. Em mở màn đầu tiên nhé!</div>')}
  else{const ps=all.filter(p=>(p.lp>0||p.id===me||p.matches)&&(!p.season||p.season===ses));const myT=tierOf(P.lp);if(boardT==null)boardT=myT;
    const cnt=TIERS.map((_,i)=>ps.filter(p=>tierOf(p.lp)===i).length);
    const rows=ps.filter(p=>tierOf(p.lp)===boardT).sort((a,b)=>(b.lp||0)-(a.lp||0)),T=TIERS[boardT],N=TIERS[boardT+1];
    $('#boardBody').innerHTML=tabs+`<div class="tgrid">${TIERS.map((x,i)=>i).reverse().map(i=>`<button class="tt${i===boardT?' on':''}" data-t="${i}" style="--c:${TIERS[i].c};--d:${TIERS[i].d}">${emblem(i,36)}<b>${TIERS[i].n}</b><small>${cnt[i]} bạn</small>${i===myT&&!ACC.teacher?'<i>Em</i>':''}</button>`).join('')}</div>
     <div class="tier" style="--c:${T.c};--d:${T.d}"><div class="thd">${emblem(boardT,40)}<b>${T.n}</b><small>${T.lp}${N?'–'+(N.lp-1):'+'} điểm · ${rows.length} bạn</small></div>
      ${rows.map((p,i)=>`<button class="brow${p.id===me?' me':''}" data-p="${p.id}"><span class="bno">${i+1}</span>${avatarOf(p,36)}<span class="bn"><b>${esc(p.nick||p.name||'?')}</b>${titleOf(p)?`<em class="ttl">${esc(titleOf(p))}</em>`:''}<small>${p.nick?esc(p.name)+' · ':''}Khối ${esc(p.khoi||'?')}${p.mau?' · mẫu':''}</small></span><b class="blp">${p.lp||0}</b></button>`).join('')||'<div class="tempty">Chưa có bạn nào ở bậc này.</div>'}</div>`}
  $('#boardBody').innerHTML+=(GV()&&PLAYERS.some(p=>p.mau)?'<button class="btn sm alt" id="clrMau" style="margin:14px auto">Xóa dữ liệu mẫu</button>':'');
  $$('#boardBody [data-bt]').forEach(b=>b.onclick=()=>{sfx.tap();boardTab=b.dataset.bt;board()});
  $$('#boardBody [data-bk]').forEach(b=>b.onclick=()=>{sfx.tap();boardK=b.dataset.bk;board()});
  $$('#boardBody [data-t]').forEach(b=>b.onclick=()=>{sfx.tap();boardT=+b.dataset.t;board()});
  $$('#boardBody [data-p]').forEach(b=>b.onclick=()=>{sfx.tap();profFrom='board';profile(b.dataset.p)});
  $('#clrMau')&&($('#clrMau').onclick=async()=>{for(const p of PLAYERS.filter(p=>p.mau)){try{await DB.doc('players/'+p.id).delete()}catch(e){}}})}
$('#bBack').onclick=()=>{sfx.tap();ranked()};

/* ---------- trang cá nhân + thành tích ---------- */
const ACH=[
  {id:'col10',n:'Nhà sưu tầm',d:'Có 10 vật phẩm',t:p=>Object.keys(p.own||{}).length>=10},
  {id:'col50',n:'Tủ đồ khổng lồ',d:'Có 50 vật phẩm',t:p=>Object.keys(p.own||{}).length>=50},
  {id:'col150',n:'Bảo tàng Cherry',d:'Có 150 vật phẩm',t:p=>Object.keys(p.own||{}).length>=150},
  {id:'chest7',n:'Chăm làm nhiệm vụ',d:'Mở 7 rương nhiệm vụ',t:p=>(p.stats.chests||0)>=7},
  {id:'start',n:'Khởi hành',d:'Qua màn đầu tiên',t:p=>p.stats.levels>=1},
  {id:'combo5',n:'Liên hoàn 5',d:'Đúng 5 câu liên tiếp',t:p=>p.stats.maxCombo>=5},
  {id:'combo10',n:'Liên hoàn 10',d:'Đúng 10 câu liên tiếp',t:p=>p.stats.maxCombo>=10},
  {id:'combo20',n:'Không thể cản',d:'Đúng 20 câu liên tiếp',t:p=>p.stats.maxCombo>=20},
  {id:'perfect',n:'Hoàn hảo',d:'Qua một màn không sai câu nào',t:p=>p.stats.perfect>=1},
  {id:'top',n:'Lên đỉnh tháp',d:'Qua mức cuối của một chủ đề',t:p=>p.stats.top>=1},
  {id:'c100',n:'100 câu đúng',d:'Tổng cộng 100 câu đúng',t:p=>p.stats.correct>=100},
  {id:'c500',n:'500 câu đúng',d:'Tổng cộng 500 câu đúng',t:p=>p.stats.correct>=500},
  {id:'fix10',n:'Sửa sai',d:'Gạch được 10 câu khỏi danh sách câu sai',t:p=>p.stats.cleared>=10},
  {id:'s7',n:'Bền bỉ 7 ngày',d:'Chuỗi 7 ngày học',t:p=>(p.st.best_streak||0)>=7},
  {id:'s30',n:'Bền bỉ 30 ngày',d:'Chuỗi 30 ngày học',t:p=>(p.st.best_streak||0)>=30},
  {id:'gold',n:'Lên Vàng',d:'Đạt bậc Vàng trong thi đấu',t:p=>(p.lp||0)>=200},
  {id:'dia',n:'Lên Kim Cương',d:'Đạt bậc Kim Cương',t:p=>(p.lp||0)>=500},
  {id:'chal',n:'Thách Đấu',d:'Đạt bậc Thách Đấu',t:p=>(p.lp||0)>=1200}];
const medal=(on,sz=40)=>`<svg viewBox="0 0 40 40" width="${sz}" height="${sz}"><path d="M12 2h6l2 10h-8zM22 2h6l-2 10h-6z" fill="${on?'#ff7a59':'#55707a'}"/><circle cx="20" cy="25" r="12" fill="${on?'#ffd23f':'#3d5a63'}" stroke="${on?'#c99a08':'#2c464e'}" stroke-width="2.5"/><path d="M20 18l2.1 4.3 4.7.6-3.4 3.2.9 4.6L20 28.4l-4.3 2.3.9-4.6-3.4-3.2 4.7-.6z" fill="${on?'#fff':'#55707a'}"/></svg>`;
function checkAch(){let n=0;for(const a of ACH)if(!P.ach[a.id]&&a.t(P)){P.ach[a.id]=new Date().toISOString();n++;setTimeout(()=>toast(`${medal(true,32)}<span><b>Thành tích mới!</b><br>${a.n}</span>`),900*n)}if(n){save();syncMine()}}
function profile(id){show('profile');const own=ACC&&id===ACC.id;const p=own?{...P,name:ACC.name,khoi:ACC.khoi}:(PLAYERS.find(x=>x.id===id)||{});
  const st=p.st||{},t=tierOf(p.lp),T=TIERS[t],lv=level(p.xp),[a,b]=lvBounds(lv),ach=p.ach||{},stats=p.stats||{};
  $('#profBody').innerHTML=`<div class="pcard"><button class="pava" ${own?'id="pAva"':''}>${avatarOf(p,96)}${own?'<i>Đổi</i>':''}</button>
     <h2>${esc(p.nick||p.name)}</h2>${titleOf(p)?`<div class="ttlb">${esc(titleOf(p))}</div>`:''}<div class="preal">${esc(p.name||'')} · Khối ${esc(p.khoi||'?')}</div><div class="pfol"><a data-pf="following">${followingOf(p).length} đang theo dõi</a> · <a data-pf="followers">${followersOf(id).length} người theo dõi</a></div>${!own&&ACC&&!ACC.teacher?`<button class="fbtn big${isFollow(id)?' on':''}" id="pFol">${isFollow(id)?'Đang theo dõi':p.follow&&p.follow[ACC.id]?'Theo dõi lại':'Theo dõi'}</button>`:''}${own?'<div class="pbtns"><button class="btn sm alt" id="pNick">Đặt nickname</button><button class="btn sm" id="pShop">Tủ đồ & cửa hàng</button></div>':`<small class="pcol">Bộ sưu tập: ${Object.keys(p.own||{}).length} vật phẩm</small>`}</div>
   <div class="pstats"><div>${flame(!st.last_day,26)}<b>${liveStreak(st,vnDay())}</b><small>chuỗi ngày (kỷ lục ${st.best_streak||0})</small></div>
     <div><span class="lvb">${lv}</span><b>${p.xp||0}</b><small>XP · cấp ${lv}</small><i class="xpb"><i style="width:${Math.min(100,((p.xp||0)-a)/(b-a)*100)}%"></i></i></div>
     <div style="--c:${T.c}">${emblem(t,30)}<b>${p.lp||0}</b><small>${T.n} · ${p.matches||0} trận</small></div></div>
   <div class="tbox"><div class="row2"><span>Câu làm đúng</span><b>${stats.correct||0}</b></div><div class="row2"><span>Chuỗi đúng dài nhất</span><b>${stats.maxCombo||0}</b></div><div class="row2"><span>Bài đã qua</span><b>${stats.levels||0}</b></div></div>
   <h2 class="sect">Thành tích (${Object.keys(ach).length}/${ACH.length})</h2>
   <div class="achs">${ACH.map(x=>`<div class="ach${ach[x.id]?' on':''}">${medal(!!ach[x.id])}<b>${x.n}</b><small>${x.d}</small></div>`).join('')}</div>
   ${(p.seasons||[]).length?`<h2 class="sect">Các mùa thi đấu</h2><div class="tbox">${p.seasons.slice().reverse().map(x=>`<div class="row2"><span>${esc(x.s)}</span><b>${TIERS[tierOf(x.lp)].n} · ${x.lp}</b></div>`).join('')}</div>`:''}
   ${own?`<h2 class="sect">Tài khoản của em</h2><div class="tbox"><div class="row2"><span>Họ và tên<br><small>Theo đăng kí với thầy, không đổi được</small></span><b>${esc(ACC.name)}</b></div><div class="row2"><span>Khối · Môn</span><b>${esc(ACC.khoi||'')} · ${(ACC.mon||['toan']).map(m=>MON[m].n).join(', ')}</b></div>${ACC.teacher?'':`<div class="row2"><span>Mật khẩu</span><button class="btn sm alt" id="pPin">Đổi mật khẩu</button></div>`}<div class="row2"><span>Âm thanh</span><button class="btn sm alt" id="pSnd">${muted?'Đang tắt · Bật':'Đang bật · Tắt'}</button></div></div>`:''}
   ${own&&!ACC.teacher?'<button class="btn alt" id="pOut" style="margin-top:14px">Đăng xuất</button>':''}`;
  $('#pBack').onclick=()=>{sfx.tap();(({board,area,grades,subj:subjects,anh,journey,ontap:onTap,redo,ranked,shop,friends})[profFrom]||area)()};
  $$('#profBody [data-pf]').forEach(b=>b.onclick=()=>{if(!own||ACC.teacher)return;sfx.tap();frTab=b.dataset.pf;friends()});
  $('#pFol')&&($('#pFol').onclick=()=>{toggleFollow(id);profile(id)});
  if(!own)return;
  $('#pPin')&&($('#pPin').onclick=()=>{sfx.tap();pinForm()});
  $('#pAva').onclick=()=>{overlay(`<h2>Chọn avatar</h2><div class="avas">${ANIMALS.map((a,i)=>`<button data-a="${i}" class="${i===P.avatar?'on':''}">${avatar(i,64,P.eq)}<small>${a.n}</small></button>`).join('')}</div><button class="btn alt" id="ac">Đóng</button>`);
    $$('#panel [data-a]').forEach(b=>b.onclick=()=>{P.avatar=+b.dataset.a;save();syncMine();closeOvl();profile(id)});$('#ac').onclick=closeOvl};
  $('#pNick').onclick=()=>{overlay(`<h2>Nickname</h2><p>Bạn bè thấy nickname cùng họ tên thật của em.</p><form id="nf"><input class="name" id="nm" maxlength="20" value="${esc(P.nick)}" placeholder="Ví dụ: Cherry 8A"><button class="btn" type="submit">Lưu</button></form><button class="btn alt" id="nc">Hủy</button>`);
    $('#nc').onclick=closeOvl;$('#nf').onsubmit=e=>{e.preventDefault();P.nick=$('#nm').value.trim().slice(0,20);save();syncMine();closeOvl();profile(id)}};
  $('#pShop').onclick=()=>{sfx.tap();shopFrom='profile';shop()};$('#pSnd').onclick=()=>{setMute(!muted);profile(id)};
  $('#pOut')&&($('#pOut').onclick=()=>logout())}

/* ---------- XP, tuần, mùa giải ---------- */
function weekId(){const t=vnDay(),d=new Date(t+'T00:00:00Z');return addDays(t,-((d.getUTCDay()+6)%7))}
function wkE(){const w=weekId();if(!P.wk||P.wk.w!==w)P.wk={w,xp:0,c:0,lv:0};return P.wk}
function addXP(n){P.xp=(P.xp||0)+n;wkE().xp+=n}
const bal=()=>Math.max(0,(P.xp||0)-(P.spent||0));
const titleOf=p=>{const id=p&&p.eq&&p.eq.title;return id&&ITEM[id]?ITEM[id].name:''};
function checkSeason(){const s=seasonName();if(!P.season){P.season=s;return}if(P.season===s)return;
  P.seasons=[...(P.seasons||[]),{s:P.season,lp:P.lp||0}].slice(-12);const old=P.lp||0;P.lp=0;P.season=s;P.lpd=null;
  setTimeout(()=>msgBox(`${s} bắt đầu!`,`${old?`Mùa trước em đạt <b>${TIERS[tierOf(old)].n}</b> (${old} điểm), đã lưu vào trang cá nhân. `:''}Mỗi mùa kéo dài ${SEASON_DAYS} ngày, mọi người cùng bắt đầu lại từ <b>0 điểm</b>.`),800)}
/* Thi đấu: câu sai chưa làm lại đúng lần nào. Quá NB_LOCK câu thì khóa; khóa rồi phải dọn về 0 mới mở lại. */
function nbOpen(){const ix=qIndex();return Object.entries(P.rev||{}).filter(([k,r])=>ix[k]&&r.in_notebook&&!(r.nb_hits>0)).length}
function rankLock(){if(!ACC||ACC.teacher)return 0;const n=nbOpen();if(n>NB_LOCK)P.rlock=1;else if(!n&&P.rlock){P.rlock=0;save()}return P.rlock?n:0}
function lpdE(){const d=vnDay();if(!P.lpd||P.lpd.d!==d)P.lpd={d,g:0};return P.lpd}

/* ---------- âm thanh ---------- */
const sndIco=()=>muted?`<svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 9l5 6M21 9l-5 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`:`<svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
function setMute(v){muted=v;store.set('ltt:mute',v);$('#snd').innerHTML=sndIco();if(!v)sfx.tap()}
$('#snd').innerHTML=sndIco();

/* ---------- nhiệm vụ hằng ngày ---------- */
const QUESTS=[{id:'man',n:'Qua 1 bài trên bản đồ',t:1},{id:'sao3',n:'Đạt 3 sao ở một bài',t:1},{id:'dung10',n:'Trả lời đúng 10 câu',t:10},{id:'chuoi5',n:'Đúng liên tiếp 5 câu',t:5},
  {id:'sua3',n:'Làm đúng 3 câu trong Làm lại câu sai',t:3},{id:'rank',n:'Chơi 1 trận thi đấu',t:1},{id:'kogoiy',n:'Qua 1 bài không dùng gợi ý',t:1},{id:'de',n:'Làm xong 1 đề ôn tập',t:1}];
function dq(){const d=vnDay();if(!P.dq||P.dq.d!==d){let pool=QUESTS.map(q=>q.id);const k=ACC.khoi;
    if(counts().nb<3)pool=pool.filter(x=>x!=='sua3');if(!deTopics(k).length)pool=pool.filter(x=>x!=='de');if(!routeTopics(k).length)pool=pool.filter(x=>!['man','sao3','kogoiy'].includes(x));
    let h=7;for(const ch of d+ACC.id)h=(h*31+ch.charCodeAt(0))>>>0;const ids=[];while(ids.length<3&&pool.length){ids.push(pool.splice(h%pool.length,1)[0]);h=(Math.floor(h/7)+101)>>>0}
    P.dq={d,ids,p:{},c:{},chest:false};save()}return P.dq}
function qev(id,n=1,max=false){if(!P||!ACC||ACC.teacher)return;const q=dq();if(!q.ids.includes(id))return;const Q=QUESTS.find(x=>x.id===id),old=q.p[id]||0;
  q.p[id]=Math.min(Q.t,max?Math.max(old,n):old+n);if(old<Q.t&&q.p[id]>=Q.t)setTimeout(()=>toast(`${chestSVG(false,30)}<span><b>Xong nhiệm vụ!</b><br>${Q.n}. Về khu vực để nhận thưởng.</span>`),1300)}
function questCard(){const q=dq(),all=q.ids.every(id=>q.c[id]);
  return `<div class="qcard"><div class="qhd"><b>Nhiệm vụ hôm nay</b><small>Làm mới lúc 0 giờ</small></div>
   ${q.ids.map(id=>{const Q=QUESTS.find(x=>x.id===id),p=q.p[id]||0,done=p>=Q.t;return `<div class="qrow2${q.c[id]?' got':''}"><div class="qtx"><span>${Q.n}</span><i class="qbar"><i style="width:${p/Q.t*100}%"></i></i></div>${q.c[id]?'<span class="qok">✓</span>':done?`<button class="btn sm" data-claim="${id}">+30 XP</button>`:`<small>${p}/${Q.t}</small>`}</div>`}).join('')}
   <button class="qchest${all&&!q.chest?' ready':''}" id="qChest" ${all&&!q.chest?'':'disabled'}>${chestSVG(q.chest,46)}<span>${q.chest?'Đã mở rương hôm nay. Mai quay lại nhé!':all?'Mở rương thưởng!':'Nhận đủ 3 nhiệm vụ để mở rương'}</span></button></div>`}
function bindQuest(){$$('#jdock [data-claim]').forEach(b=>b.onclick=()=>{const q=dq(),id=b.dataset.claim;if(q.c[id])return;q.c[id]=1;addXP(30);sfx.ok();floatText('+30 XP',b);save();syncMine();setTimeout(area,500)});
  $('#qChest')&&($('#qChest').onclick=()=>{const q=dq();if(q.chest||!q.ids.every(id=>q.c[id]))return;q.chest=true;P.stats.chests=(P.stats.chests||0)+1;addXP(80);
    const pool=ITEMS.filter(x=>!x.special&&x.price<900&&!P.own[x.id]);let gift=null;if(pool.length&&Math.random()<.35){gift=pool[Math.random()*pool.length|0];P.own[gift.id]=new Date().toISOString()}
    save();syncMine();checkAch();sfx.win();confetti(140,.35);
    overlay(`${chestSVG(true,110)}<h2>Rương nhiệm vụ!</h2><p>Em nhận được <b>+80 XP</b>${gift?` và vật phẩm <b>${esc(gift.name)}</b>!`:'.'}</p>${gift&&gift.slot!=='title'?`<div style="display:flex;justify-content:center;margin:6px 0">${avatar(P.avatar,96,{...P.eq,[gift.slot]:gift.id})}</div>`:''}
      ${gift?'<button class="btn" id="cW">Mặc thử ngay</button>':''}<button class="btn alt" id="cC">Tuyệt!</button>`);
    $('#cC').onclick=()=>{closeOvl();area()};$('#cW')&&($('#cW').onclick=()=>{P.eq[gift.slot]=gift.id;save();syncMine();closeOvl();area()})})}

/* ---------- thử thách cả lớp (theo tuần) ---------- */
function classCard(){const w=weekId(),k=ACC.khoi,mates=PLAYERS.filter(p=>p.khoi===k&&!p.mau&&p.id!==ACC.id);
  const sum=mates.reduce((s,p)=>s+(p.wk&&p.wk.w===w?p.wk.c||0:0),0)+(wkE().c||0),goal=Math.max(100,25*(mates.length+1)),done=sum>=goal,got=P.ccl[w];
  setTimeout(()=>{$('#ccB')&&($('#ccB').onclick=()=>{if(P.ccl[w])return;P.ccl[w]=1;addXP(150);save();syncMine();sfx.win();confetti(120,.4);toast('Cả khối giỏi quá! Em nhận <b>+150 XP</b>.');setTimeout(area,600)})},0);
  return `<div class="ccard"><div class="qhd"><b>Thử thách cả khối ${esc(k)}</b><small>Tuần này</small></div><p>Cả khối cùng làm đúng <b>${goal}</b> câu để mỗi bạn nhận <b>150 XP</b>.</p>
    <div class="ccbar"><i style="width:${Math.min(100,sum/goal*100)}%"></i><span>${sum}/${goal} câu</span></div>${done?(got?'<div class="qok2">Đã nhận thưởng tuần này ✓</div>':'<button class="btn sm" id="ccB">Nhận 150 XP</button>'):`<small>Em đã góp ${wkE().c||0} câu.</small>`}</div>`}

/* ---------- hướng dẫn lần đầu ---------- */
function tutorial(){const S=[['Chào em, mình là Cherry!','Mình sẽ đồng hành cùng em cả năm học. Mỗi ngày học một chút là đủ để giỏi lên nhiều đó!'],
  ['Hành trình kho báu','Bản đồ gồm mọi chương của cả năm. Mỗi chương có 3 màn: Nhận biết, Thông hiểu, Vận dụng. Qua màn 2 là mở được chương tiếp theo.'],
  ['Nhiệm vụ hôm nay','Mỗi ngày có 3 nhiệm vụ nhỏ. Xong cả 3 được mở rương, có khi còn được tặng đồ!'],
  ['Cửa hàng Cherry','Mọi XP em kiếm được dùng để mua mũ, kính, khung, nền và danh hiệu cho avatar. Có hàng trăm món để sưu tầm!'],
  ['Thi đấu và bảng tiến bộ','Thi đấu để leo bậc từ Đồng lên Thách Đấu. Bảng Tiến bộ tuần làm mới mỗi thứ Hai, ai chăm cũng có thể đứng đầu.']];let i=0;
  const go=()=>{overlay(`<div style="width:110px;margin:0 auto">${owlSVG}</div><h2 style="font-size:28px">${S[i][0]}</h2><p>${S[i][1]}</p><div class="tdots">${S.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join('')}</div><button class="btn" id="tn">${i<S.length-1?'Tiếp':'Bắt đầu thôi!'}</button>${i<S.length-1?'<button class="btn alt" id="ts">Bỏ qua</button>':''}`);
    $('#tn').onclick=()=>{sfx.tap();if(++i<S.length)go();else end()};$('#ts')&&($('#ts').onclick=end)};
  const end=()=>{P.tut=1;save();syncMine();closeOvl()};go()}

/* ---------- cửa hàng ---------- */
let shopTab='hat',shopF='all',tryEq=null,shopSel=null,shopFrom='subj';
const fmtXP=n=>Number(n).toLocaleString('vi-VN');
function shop(){show('shop');if(!tryEq)tryEq={...(P.eq||{})};const own=P.own||{},nOwn=Object.keys(own).length;
  const list=ITEMS.filter(x=>shopTab==='special'?x.special:x.slot===shopTab&&!x.special).filter(x=>shopF==='all'||(shopF==='own')===!!own[x.id]);
  const sel=shopSel&&ITEM[shopSel];
  $('#shopBody').innerHTML=`<div class="shhead"><div class="shprev">${avatar(P.avatar,112,tryEq)}</div><div class="shinfo"><b>${esc(P.nick||ACC.name)}</b>${tryEq.title&&ITEM[tryEq.title]?`<em class="ttl">${esc(ITEM[tryEq.title].name)}</em>`:''}
      <div class="wallet"><span>Ví XP</span><b>${fmtXP(bal())}</b></div><small>Đã sưu tầm ${nOwn}/${ITEMS.length} · đã tiêu ${fmtXP(P.spent||0)} XP</small><i class="hbar"><i style="width:${nOwn/ITEMS.length*100}%"></i></i></div></div>
   <div class="shtabs">${SLOTS.map(([k,n])=>`<button data-st="${k}" class="${k===shopTab?'on':''}">${n}</button>`).join('')}</div>
   <div class="seg sm">${[['all','Tất cả'],['no','Chưa có'],['own','Đã có']].map(([k,n])=>`<button data-sf="${k}" class="${k===shopF?'on':''}">${n}</button>`).join('')}</div>
   <div class="shgrid">${list.map(x=>{const o=!!own[x.id],on=P.eq&&P.eq[x.slot]===x.id,R=RAR[x.rar||0],ok=x.special&&x.cond&&x.cond(P);
     return `<button class="shit${x.id===shopSel?' sel':''}${o?' own':''}" data-it="${x.id}" style="--r:${R.c}">${x.slot==='title'?`<span class="shtt">${esc(x.name)}</span>`:avatar(P.avatar,62,{[x.slot]:x.id})}
       <span class="shn">${esc(x.name)}</span><span class="shp">${on?'Đang dùng':o?'Đã có':x.special?(ok?'Nhận được!':'🔒 '+esc(x.txt)):fmtXP(x.price)+' XP'}</span><i class="rdot">${R.n}</i></button>`}).join('')||'<div class="tempty">Chưa có món nào ở mục này.</div>'}</div>
   <div style="height:120px"></div>`;
  const bar=$('#shopBar');
  if(sel){const o=!!own[sel.id],on=P.eq&&P.eq[sel.slot]===sel.id,R=RAR[sel.rar||0],ok=sel.special&&sel.cond&&sel.cond(P),need=sel.price-bal();
    bar.innerHTML=`<div class="sbinfo"><b>${esc(sel.name)}</b><small style="color:${R.c}">${R.n}${sel.special?' · '+esc(sel.txt):''}</small></div>
      ${on?'<button class="btn alt" id="sbA">Bỏ ra</button>':o?'<button class="btn" id="sbA">Dùng</button>':sel.special?(ok?'<button class="btn" id="sbA">Nhận miễn phí</button>':'<button class="btn" disabled>Chưa mở khóa</button>'):need>0?`<button class="btn" disabled>Thiếu ${fmtXP(need)} XP</button>`:`<button class="btn" id="sbA">Mua · ${fmtXP(sel.price)} XP</button>`}`;bar.classList.add('on');
    $('#sbA')&&($('#sbA').onclick=()=>{if(on){delete P.eq[sel.slot];tryEq={...P.eq}}
      else if(o){P.eq[sel.slot]=sel.id;tryEq={...P.eq}}
      else if(sel.special){P.own[sel.id]=new Date().toISOString();P.eq[sel.slot]=sel.id;tryEq={...P.eq};sfx.win();confetti(100,.3)}
      else{if(bal()<sel.price)return;P.spent=(P.spent||0)+sel.price;P.own[sel.id]=new Date().toISOString();P.eq[sel.slot]=sel.id;tryEq={...P.eq};sfx.win();confetti(80,.3);toast(`Đã mua <b>${esc(sel.name)}</b>!`)}
      save();syncMine();checkAch();shop()})}else bar.classList.remove('on');
  $$('#shopBody [data-st]').forEach(b=>b.onclick=()=>{sfx.tap();shopTab=b.dataset.st;shopSel=null;tryEq={...P.eq};shop()});
  $$('#shopBody [data-sf]').forEach(b=>b.onclick=()=>{sfx.tap();shopF=b.dataset.sf;shop()});
  $$('#shopBody [data-it]').forEach(b=>b.onclick=()=>{sfx.tap();const x=ITEM[b.dataset.it];shopSel=x.id;tryEq={...P.eq,[x.slot]:x.id};const y=$('#shopBody').scrollTop;shop();$('#shopBody').scrollTop=y});
  $('#shBack').onclick=()=>{sfx.tap();shopSel=null;tryEq=null;$('#shopBar').classList.remove('on');shopFrom==='profile'?profile(ACC.id):shopFrom==='subj'?subjects():area()}}

/* ---------- giáo viên: chú ý, báo cáo phụ huynh, thời gian màn ---------- */
function teacherExtra(kh,st,ix){const today=vnDay(),real=st.filter(v=>!v.mau);
  const idle=real.map(v=>{const d=v.st&&v.st.last_day;return {v,d:d?dayDiff(d,today):999}}).filter(x=>x.d>=3).sort((a,b)=>b.d-a.d);
  const stuck=[];for(const v of real)for(const [k,n] of Object.entries(v.fails||{})){if(n<3)continue;const b=v.best&&v.best[k];if(b&&b.st>0)continue;const [tid,lv]=k.split('|'),t=TOPICS.find(x=>x.id===tid);if(t)stuck.push({v,t,lv:+lv,n})}
  const tm={};for(const v of real)for(const [k,x] of Object.entries(v.lvt||{})){const g=tm[k]||(tm[k]={n:0,s:0});g.n+=x.n;g.s+=x.s}
  const tms=Object.entries(tm).map(([k,g])=>{const [tid,lv]=k.split('|'),t=TOPICS.find(x=>x.id===tid);return t&&t.khoi===kh?{t,lv:+lv,avg:g.s/g.n,n:g.n}:null}).filter(Boolean).sort((a,b)=>b.avg-a.avg);
  const mm=s=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
  return `<h2 class="sect">Cần chú ý</h2><div class="tbox">${idle.length||stuck.length?
     idle.map(x=>`<div class="row2"><span>${esc(x.v.name)}</span><b class="n">${x.d>=999?'Chưa học lần nào':`Nghỉ ${x.d} ngày`}</b></div>`).join('')+
     stuck.map(x=>`<div class="row2"><span>${esc(x.v.name)}<br><small>${esc(x.t.title)}</small></span><b class="n">Hết tim ${x.n} lần</b></div>`).join('')
    :'<p class="tnote">Chưa có em nào nghỉ từ 3 ngày hoặc kẹt màn.</p>'}</div>
   <h2 class="sect">Thời gian trung bình mỗi bài</h2><div class="tbox">${tms.length?tms.slice(0,12).map(x=>`<div class="row2"><span>${esc(x.t.title)}<br><small>${x.n} lượt</small></span><b class="${x.avg>600?'n':''}">${mm(x.avg)}</b></div>`).join('')+'<p class="tnote">Đỏ: quá 10 phút, nên bớt câu hoặc chia nhỏ bài.</p>':'<p class="tnote">Chưa có dữ liệu.</p>'}</div>`}
function parentReport(v){const w=weekId(),wk=v.wk&&v.wk.w===w?v.wk:{xp:0,c:0,lv:0},today=vnDay(),A=ASG.filter(a=>a.khoi===v.khoi);
  const ptOf=k=>{const b=v.best&&v.best[k];return b&&b.st>0?(b.t||'1970'):null};
  const lines=[`BÁO CÁO TUẦN · Học cùng Cherry`,`Học sinh: ${v.name} (khối ${v.khoi})`,`Tuần từ ${w.split('-').reverse().join('/')}`,``,
    `• Điểm kinh nghiệm tuần này: ${wk.xp||0} XP (${wk.c||0} câu đúng, qua ${wk.lv||0} màn)`,
    `• Chuỗi ngày học: ${liveStreak(v.st||{},today)} ngày (kỷ lục ${(v.st||{}).best_streak||0})`,
    `• Thi đấu: bậc ${TIERS[tierOf(v.lp)].n} (${v.lp||0} điểm)`,
    `• Câu sai cần làm lại: ${Object.values(v.rev||{}).filter(r=>r.in_notebook).length} câu`,
    ...(A.length?[`• Bài thầy giao:`,...A.slice(-5).map(a=>{const t=TOPICS.find(x=>x.id===a.topicId),s=asgStatus(a,ptOf);return `   - ${t?t.title:'?'}: ${s.complete?(s.late?'xong (muộn)':'đã xong'):s.overdue?'quá hạn, chưa xong':`đang làm ${s.passed}/${s.need} màn`}`})]:[]),
    ``,`Nhận xét của thầy: `];
  overlay(`<h2 style="font-size:26px">Báo cáo phụ huynh</h2><p>Thầy sửa nhận xét rồi bấm sao chép để gửi qua Zalo.</p><textarea class="code light" id="rp">${esc(lines.join('\n'))}</textarea><button class="btn" id="rpC">Sao chép</button><button class="btn alt" id="rpX">Đóng</button>`);
  $('#rpX').onclick=closeOvl;$('#rpC').onclick=async()=>{const t=$('#rp');try{await navigator.clipboard.writeText(t.value);toast('Đã sao chép báo cáo.')}catch(e){t.select();document.execCommand&&document.execCommand('copy');toast('Đã chọn sẵn, thầy nhấn giữ để sao chép.')}}}

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
      out.push({p,at:b.t,ico:`<span class="fic">${star(1)}</span>`,txt:isDe(t)?`làm xong đề <b>${esc(t.title)}</b>`:`qua bài <b>${esc(t.title)}</b> ${'★'.repeat(b.st||0)}`})}
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
  if(frTab==='search'){const q=plain(frQ);let L=PLAYERS.filter(p=>p.id!==me&&(!frK||p.khoi===frK));
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

/* ---------- chơi ---------- */
let G=null,TM=null;
const cur=()=>G.twin||G.qs[G.k];
function inst(q,meta){const x=instantiate(q);return {...x,key:q.key,raw:q.params?q:null,...meta}}
function newG(mode,qs,extra){clearInterval(TM);G={mode,qs,k:0,hearts:mode==='man'?3:99,score:0,combo:0,miss:0,t0:Date.now(),twin:null,twinUsed:{},hu:0,over:false,...extra};
  $('#hearts').style.display=mode==='man'?'':'none';$('#modeLbl').style.display=mode==='man'?'none':'';$('#modeLbl').textContent=MODE[mode]||'';$('#timer').style.display=mode==='rank'?'':'none'}
function buildMan(t){const out=[],used=new Set();
  LESSON_PLAN.forEach((n,m)=>shuffle((t.levels[m]||{qs:[]}).qs).slice(0,n).forEach(q=>{out.push({q,m});used.add(q)}));
  const want=LESSON_PLAN.reduce((a,b)=>a+b,0),extra=[];for(let m=0;m<3;m++)((t.levels[m]||{}).qs||[]).forEach(q=>{if(!used.has(q))extra.push({q,m})});
  shuffle(extra).slice(0,Math.max(0,want-out.length)).forEach(x=>out.push(x));
  return out.sort((a,b)=>a.m-b.m)}
const lessonOf=t=>{const it=mapItems(t.khoi).find(x=>x.t===t||x.t&&x.t.id===t.id);return it&&it.L&&it.L.id?it.L:null};
function startLevel(i=0){const t=curT,items=buildMan(t),L=lessonOf(t);
  if(!items.length)return msgBox('Bài trống','Bài này chưa có câu hỏi.');
  try{newG('man',items.map(x=>inst(x.q,{tid:t.id,level:x.m,title:t.title})),{t,i:0});hud()}catch(e){return msgBox('Câu hỏi lỗi',esc(e.message))}
  show('play');$('#stage').innerHTML='';$('#dock').innerHTML='';
  const cnt=[0,1,2].map(m=>items.filter(x=>x.m===m).length);
  overlay(`<div class="lvlcard"><p style="margin:0">${L&&L.ch?'Chương '+L.ch.n+' · '+esc(L.ch.title):esc(t.title)}</p><div class="num">${L?(L.lt?L.coin:L.num):'★'}</div><h2 style="font-size:26px">${esc(L?(L.title):t.title)}</h2>
    <p>${items.length} câu, khó dần: ${cnt[0]} nhận biết · ${cnt[1]} thông hiểu · ${cnt[2]} vận dụng<br>3 tim, hết tim vẫn được hồi để làm tiếp.</p><button class="btn" id="go">Bắt đầu</button>${t.theory?`<button class="btn alt thbtn" id="th">${bookSVG} Tóm tắt lý thuyết</button><small class="thnote">Trong lúc làm bài không mở được lý thuyết, em đọc trước nhé.</small>`:''}</div>`);
  $('#go').onclick=()=>{sfx.tap();closeOvl();renderQ()};$('#th')&&($('#th').onclick=()=>{sfx.tap();closeOvl();G=null;theory(t)})}
function startReview(){const ix=qIndex();const e=Object.entries(P.rev||{}).filter(([k,r])=>ix[k]&&r.in_notebook).sort((a,b)=>(a[1].nb_hits>0)-(b[1].nb_hits>0)||a[1].due.localeCompare(b[1].due)).slice(0,10);
  if(!e.length)return msgBox('Làm lại câu sai','Chưa có câu sai nào cần làm lại.');
  let items;try{items=shuffle(e.map(([k])=>{const {q,t,li}=ix[k];return inst(q,{tid:t.id,level:li,title:t.title})}))}catch(err){return msgBox('Câu hỏi lỗi',esc(err.message))}
  newG('so',items,{});hud();show('play');$('#stage').innerHTML='';$('#dock').innerHTML='';renderQ()}
function hud(){$('#progB').style.width=(G.k/G.qs.length*100)+'%';
  $('#hearts').innerHTML=G.hearts>50?'':[0,1,2].map(i=>heart.replace('<svg',`<svg class="${i<G.hearts?'':'lost'}"`)).join('');
  $('#qnum').textContent=`Câu ${Math.min(G.k+1,G.qs.length)}/${G.qs.length}`;$('#score').textContent=G.score+' điểm';
  $('#combo').textContent=G.combo>=2?`Chuỗi đúng ×${G.combo}`:''}
function isSaved(q){return Object.values(P.saved||{}).some(s=>s.k===q.key&&s.q.stem===q.stem)}
function toggleSave(q,btn){const ex=Object.entries(P.saved||{}).find(([,s])=>s.k===q.key&&s.q.stem===q.stem);
  if(ex)delete P.saved[ex[0]];else{if(Object.keys(P.saved).length>=60)return toast('Đã lưu tối đa 60 câu. Em bỏ bớt câu cũ nhé.');
    const {raw,...q2}=q;P.saved[(q.key||'q')+'-'+Date.now().toString(36)]={k:q.key,title:q.title||(G.t&&G.t.title)||'',q:q2,at:new Date().toISOString()};toast(`${bookmark(true)}<span>Đã lưu câu hỏi và lời giải vào <b>Làm lại câu sai › Đã lưu</b></span>`)}
  save();syncMine();if(btn)btn.innerHTML=bookmark(isSaved(q))+(btn.dataset.lbl?' '+(isSaved(q)?'Đã lưu':'Lưu câu này'):'')}
function renderQ(){hud();const q=cur();const st=$('#stage');$('#dock').innerHTML='';st.scrollTop=0;G.done=false;G.hu=0;G.ansTxt=null;G.frac=0;
  const nh=['man','so','one'].includes(G.mode)&&q.hints?q.hints.length:0;
  let h=`<div class="card${G.twin?' twin':''}" id="qc"><div class="ctop"><span class="tag">${G.twin?'Câu tương tự':TYPE[q.type]}</span>${G.mode!=='man'?`<span class="tag tt">${esc(q.title)}</span>`:''}
    ${nh?`<button class="hintbtn" id="hintB">Gợi ý (${nh})${G.mode==='man'?' · −30 điểm':''}</button>`:''}${GV()&&q.tid?`<button class="savebtn" id="editB" aria-label="Sửa câu này">✎</button>`:''}<button class="savebtn" id="saveB" aria-label="Lưu câu hỏi">${bookmark(isSaved(q))}</button></div>
    <div class="stem">${tex(q.stem)}</div><div class="hints" id="hintsBox" style="display:none"></div>`;
  if(q.type==='ex'){G.opts=shuffle(q.opts);h+=`<div class="opts">${G.opts.map((o,i)=>`<button class="opt" data-i="${i}" style="animation-delay:${.08*i+.1}s"><span class="k">${'ABCDEF'[i]}</span><span class="ot">${tex(o.t)}</span></button>`).join('')}</div>`}
  if(q.type==='extf'){G.tf=q.items.map(()=>null);h+=`<div class="tf">${q.items.map((it,i)=>`<div class="tfrow" style="animation-delay:${.07*i}s"><div class="lbl"><b>${'abcdef'[i]})</b> ${tex(it.t)}</div><div class="tfb"><button class="t" data-i="${i}" data-v="1">Đ</button><button class="f" data-i="${i}" data-v="0">S</button></div></div>`).join('')}</div>`}
  if(q.type==='exfb'){G.typed='';h+=`<div class="ansbox" id="ab"></div>`}
  if(q.type==='exmatch'){G.L=q.pairs.map((p,i)=>({t:p[0],i}));G.R=shuffle(q.pairs.map((p,i)=>({t:p[1],i})));G.link={};G.sel=null;const wide=q.pairs.some(p=>p[0].length>18||p[1].length>18);
    h+=`<div class="mgrid${wide?' stack':''}"><div class="mcol">${G.L.map((x,j)=>`<button class="mi" data-s="L" data-j="${j}" style="animation-delay:${.07*j}s"><span class="tx">${tex(x.t)}</span></button>`).join('')}</div>
     <div class="mcol">${G.R.map((x,j)=>`<button class="mi" data-s="R" data-j="${j}" style="animation-delay:${.07*j+.1}s"><span class="tx">${tex(x.t)}</span></button>`).join('')}</div></div>
     <div class="hint">Chạm một ô bên trái, rồi chạm ô bên phải để nối; cặp đã nối cùng màu. Chạm lại để bỏ nối.</div>`}
  if(isQ2(q))h+=`<div id="q2a"></div>`;
  st.innerHTML=h+'</div>';typeset(st);if(isQ2(q)){q2Init(q);q2Draw()}
  $('#editB')&&($('#editB').onclick=()=>{const t=TOPICS.find(x=>x.id===q.tid);if(!t)return;const bs=qBlocks(t.raw),b=bs.findIndex(x=>!x.man&&parseOne(x.raw).q?.key===q.key);if(b<0)return toast('Không tìm thấy câu này trong chủ đề (có thể đã được sửa).');editQ(t,b)});
  $('#saveB').onclick=e=>{sfx.tap();toggleSave(q,e.currentTarget)};
  if(nh)$('#hintB').onclick=()=>{if(G.done)return;sfx.tap();G.hu=Math.min(G.hu+1,nh);G.htot=(G.htot||0)+1;const box=$('#hintsBox');box.style.display='';
    box.innerHTML=q.hints.slice(0,G.hu).map((x,i)=>`<div><b>Gợi ý ${i+1}.</b> ${tex(x)}</div>`).join('');typeset(box);
    const left=nh-G.hu;if(left)$('#hintB').textContent=`Gợi ý (${left})${G.mode==='man'?' · −30 điểm':''}`;else $('#hintB').remove()};
  if(q.type==='ex')$$('#stage .opt').forEach(b=>b.onclick=()=>answerMC(b));
  if(q.type==='extf'){$$('#stage .tfb button').forEach(b=>b.onclick=()=>{if(G.done)return;sfx.tap();const i=+b.dataset.i;G.tf[i]=b.dataset.v==='1';
      b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));$('#tchk').disabled=G.tf.some(x=>x===null)});
    $('#dock').innerHTML=`<div class="chk"><button class="btn" id="tchk" disabled>Kiểm tra</button></div>`;$('#tchk').onclick=checkTF}
  if(q.type==='exfb'){$('#dock').innerHTML=`<div class="pad">${['7','8','9','⌫','4','5','6','−','1','2','3','/','0',',','OK'].map(k=>`<button data-k="${k}" class="${k==='OK'?'go':''}">${k==='OK'?'Kiểm tra':k}</button>`).join('')}</div>`;
    $$('#dock button').forEach(b=>b.onclick=()=>keyIn(b.dataset.k))}
  if(q.type==='exmatch'){$$('#stage .mi').forEach(b=>b.onclick=()=>tapMatch(b));
    $('#dock').innerHTML=`<div class="chk"><button class="btn" id="mchk" disabled>Kiểm tra</button></div>`;$('#mchk').onclick=checkMatch}
  if(G.mode==='rank')startTimer(q)}
function startTimer(q){clearInterval(TM);const lim=(RANK_TIME[Math.min(3,q.level||0)]+(q.type==='exmatch'||q.type==='extf'?15:0)+(q.type==='exsd'?SD_SLOT_S*q2Slots(q):q.type==='exsx'?SX_EXTRA_S:0))*1000;G.lim=lim;G.qt0=Date.now();
  const tick=()=>{const left=Math.max(0,lim-(Date.now()-G.qt0));$('#timerB').style.width=(left/lim*100)+'%';$('#timer').classList.toggle('low',left<10000);$('#modeLbl').textContent=Math.ceil(left/1000)+' giây';
    if(left<=0&&!G.done){clearInterval(TM);G.done=true;G.ansTxt='(hết giờ, chưa trả lời)';$('#qc').classList.add('lock');result(false,null,'<b>Hết giờ!</b><div class="vans">'+answerHTML(cur())+'</div>',true)}};tick();TM=setInterval(tick,200)}
const whyBox=xs=>xs.length?`<div class="loi"><b>Vì sao chưa đúng?</b>${xs.map(x=>`<div>${x}</div>`).join('')}</div>`:'';
function answerMC(b){if(G.done)return;G.done=true;const o=G.opts[+b.dataset.i];G.ansTxt=o.t;$('#qc').classList.add('lock');
  const okI=G.opts.findIndex(x=>x.ok);$$('#qc .opt')[okI].classList.add('ok');
  if(!o.ok)b.classList.add('no');result(o.ok,b,o.ok?'':whyBox(o.why?[tex(o.why)]:[])+`Đáp án đúng: <b>${'ABCDEF'[okI]}</b>. ${tex(G.opts[okI].t)}`)}
function checkTF(){G.done=true;const q=cur();$('#qc').classList.add('lock');const rows=$$('#qc .tfrow');let all=true;
  q.items.forEach((it,i)=>{const ok=G.tf[i]===it.ok;all=all&&ok;rows[i].classList.add(ok?'ok':'no')});G.ansTxt=q.items.map((it,i)=>`${'abcdef'[i]}) ${G.tf[i]?'Đúng':'Sai'}`).join('; ');
  const ws=q.items.map((it,i)=>G.tf[i]!==it.ok&&it.why?`<b>${'abcdef'[i]})</b> ${tex(it.why)}`:'').filter(Boolean);
  result(all,$('#tchk'),all?'':whyBox(ws)+'Đáp án đúng: '+q.items.map((it,i)=>`<b>${'abcdef'[i]}) ${it.ok?'Đúng':'Sai'}</b>`).join(' &nbsp; '))}
const norm=s=>s.replace(/\s/g,'').replace(/−/g,'-').replace(/,/g,'.');
function val(s){s=norm(s);if(/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)){const [a,b]=s.split('/').map(Number);return b?a/b:NaN}return /^-?\d*\.?\d+$/.test(s)?Number(s):NaN}
function same(a,b){const x=val(a),y=val(b);return !isNaN(x)&&!isNaN(y)?Math.abs(x-y)<1e-9:norm(a)===norm(b)}
function keyIn(k){const ab=$('#ab');if(!ab||G.done)return;sfx.tap();
  if(k==='OK'){if(!G.typed)return;G.done=true;G.ansTxt=G.typed;const q=cur();const ok=q.ans.some(a=>same(G.typed,a));ab.classList.add(ok?'ok':'no');
    const tr=!ok&&(q.traps||[]).find(x=>same(G.typed,x.a));
    result(ok,ab,ok?'':whyBox(tr?[tex(tr.why)]:[])+`Đáp số đúng: <b>${tex(q.ans[0])}</b>`);return}
  if(k==='⌫')G.typed=G.typed.slice(0,-1);else if(G.typed.length<12)G.typed+=k;ab.textContent=G.typed}
function tapMatch(b){if(G.done)return;sfx.tap();const s=b.dataset.s,j=+b.dataset.j;
  if(s==='L'){if(G.link[j]!=null){delete G.link[j];G.sel=null}else G.sel=G.sel===j?null:j}
  else{const owner=Object.keys(G.link).find(k=>G.link[k]===j);if(owner!=null)delete G.link[owner];else if(G.sel!=null){G.link[G.sel]=j;G.sel=null}}
  paintMatch();$('#mchk').disabled=Object.keys(G.link).length<G.L.length}
function paintMatch(){const it=$$('#stage .mi');it.forEach(e=>{e.classList.remove('sel');e.style.background='';e.style.boxShadow=''});
  const L=it.filter(e=>e.dataset.s==='L'),R=it.filter(e=>e.dataset.s==='R');
  if(G.sel!=null)L[G.sel].classList.add('sel');
  Object.keys(G.link).map(Number).sort((a,b)=>a-b).forEach((l,n)=>{const [bg,bd]=MPC[n%MPC.length];[L[l],R[G.link[l]]].forEach(e=>{e.style.background=bg;e.style.boxShadow=`0 4px 0 ${bd}55,inset 0 0 0 3px ${bd}`})})}
function checkMatch(){G.done=true;G.ansTxt=G.L.map((x,l)=>x.t+' ⟶ '+(G.link[l]!=null?G.R[G.link[l]].t:'?')).join('; ');$('#qc').classList.add('lock');const it=$$('#stage .mi');const L=it.filter(e=>e.dataset.s==='L'),R=it.filter(e=>e.dataset.s==='R');let all=true;
  Object.entries(G.link).forEach(([l,r])=>{const ok=G.L[l].i===G.R[r].i;all=all&&ok;[L[l],R[r]].forEach(e=>{e.style.boxShadow='';e.classList.add(ok?'ok':'no')})});
  result(all,$('#mchk'),all?'':'Cách nối đúng:'+G.L.map((x,i)=>`<div class="va"><span class="mdot" style="background:${MPC[i%MPC.length][1]}"></span>${tex(x.t)} ⟶ ${tex(G.R.find(y=>y.i===x.i).t)}</div>`).join(''))}

@@Q2@@
// Ghi nhận: lịch ôn / câu sai / thống kê / XP
function recordQ(q,ok){if(!q.key)return;const today=vnDay();
  const prev=P.rev[q.key],nx=nextReview(prev||null,ok,today);if(nx){if(prev&&prev.in_notebook&&!nx.in_notebook)P.stats.cleared++;P.rev[q.key]={...nx,tid:q.tid,level:q.level}}
  else if(ok&&prev&&prev.in_notebook&&!prev.nb_hits)P.rev[q.key]={...prev,nb_hits:1}; // đã đúng trước đó trong ngày rồi sai: làm lại đúng vẫn tính là đã sửa
  const w=P.wst[q.key]||{n:0,w:0,tid:q.tid};w.n++;if(!ok)w.w++;w.d=today;P.wst[q.key]=w;
  if(ok){P.stats.correct++;addXP(G.mode==='rank'?5:10);wkE().c++;qev('dung10');if(G.mode==='so')qev('sua3')}save();syncMine()}
function bumpStreak(){const nx=nextStreak(P.st||{},vnDay());if(!nx)return null;const {shieldUsed,...p}=nx;P.st=p;save();syncMine();return nx}
function sheetOpen(ok,title,why,q,btns){const sh=$('#sheet');sh.className='sheet '+(ok?'ok':'no');
  sh.innerHTML=`<div class="sbody"><h2>${title}</h2>${why?`<div class="why">${why}</div>`:''}${q.sol?`<div class="sol"><b>Lời giải.</b> ${tex(q.sol)}</div>`:''}</div>
    <div class="sbtns"><div class="srow"><button class="btn alt sv" id="svB" data-lbl="1">${bookmark(isSaved(q))} ${isSaved(q)?'Đã lưu':'Lưu câu này'}</button>${canReport(q)?repBtn(q):''}</div>${btns}</div>`;
  typeset(sh);requestAnimationFrame(()=>sh.classList.add('on'));$('#svB').onclick=e=>{sfx.tap();toggleSave(q,e.currentTarget)};
  $('#rpB')&&($('#rpB').onclick=e=>reportQ(q,e.currentTarget,{ok,ans:G.ansTxt}));return sh}
/* ---------- báo lỗi câu hỏi (học sinh) ---------- */
const MYREP=new Set();
const REPK={de:'Đề bài sai',dapan:'Đáp án hoặc lời giải sai',khac:'Lỗi khác (hình, chữ, …)'};
const flagSVG='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 21V4m0 0h11l-2 4 2 4H5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const canReport=q=>!GV()&&q&&q.key&&q.tid&&typeof api==='function';
const repBtn=(q,id='rpB')=>`<button class="btn alt sv rpb${MYREP.has(q.key)?' sent':''}" id="${id}" data-k="${esc(q.key)}">${flagSVG} ${MYREP.has(q.key)?'Đã báo lỗi':'Báo lỗi'}</button>`;
function reportQ(q,btn,extra){sfx.tap();let kind='';
  overlay(`<h2>Báo lỗi câu hỏi</h2><p>Em thấy câu này sai ở đâu? Thầy sẽ kiểm tra và sửa lại.</p>${MYREP.has(q.key)?'<p class="tnote">Em đã báo câu này rồi. Gửi lại sẽ cập nhật lý do và ghi chú.</p>':''}
    <div class="rpk">${Object.entries(REPK).map(([k,v])=>`<button data-rk="${k}">${v}</button>`).join('')}</div>
    <textarea class="name ta" id="rpN" maxlength="300" placeholder="Em ghi thêm vì sao (không bắt buộc). Ví dụ: đáp số đúng phải là 12"></textarea>
    <div class="err" id="rpE" style="display:none"></div><button class="btn" id="rpS" disabled>Gửi cho thầy</button><button class="btn alt" id="rpC">Huỷ</button>`);
  $$('#panel [data-rk]').forEach(b=>b.onclick=()=>{sfx.tap();kind=b.dataset.rk;$$('#panel [data-rk]').forEach(x=>x.classList.toggle('on',x===b));$('#rpS').disabled=false});
  $('#rpC').onclick=closeOvl;
  $('#rpS').onclick=async()=>{const s=$('#rpS');if(!kind||s.disabled)return;s.disabled=true;s.textContent='Đang gửi…';
    const {raw,...q2}=q,snap={type:q2.type,stem:q2.stem,opts:q2.opts,items:q2.items,ans:q2.ans,traps:q2.traps,pairs:q2.pairs,hints:q2.hints,sol:q2.sol,level:q2.level,title:q2.title,...(extra||{})};
    try{await DB.collection('reports').doc().set({tid:q.tid,qkey:q.key,kind,note:$('#rpN').value,snap});MYREP.add(q.key);closeOvl();sfx.ok();toast('Đã gửi cho thầy. Cảm ơn em!');
      if(btn){btn.classList.add('sent');btn.innerHTML=flagSVG+' Đã báo lỗi'}}
    catch(e){s.disabled=false;s.textContent='Gửi cho thầy';const er=$('#rpE');er.style.display='';er.textContent=e.message||'Chưa gửi được, em thử lại.'}}}
function result(ok,el,why,timeout){clearInterval(TM);const q=cur();recordQ(q,ok);
  if(G.twin){const healed=ok&&G.mode==='man'&&G.hearts<3;if(healed)G.hearts++;hud();ok?(sfx.ok(),confetti(40,.45)):sfx.no();$('#dock').innerHTML='';
    const sh=sheetOpen(ok,ok?(healed?'Đúng rồi! Hồi 1 tim':'Đúng rồi!'):'Chưa đúng rồi',why,q,`<button class="btn ${ok?'':'co'}" id="nx">${G.over?'Xem kết quả':'Câu tiếp theo'}</button>`);
    $('#nx').onclick=()=>{sfx.tap();sh.classList.remove('on');G.twin=null;G.over?finish():renderQ()};return}
  let pts=0;
  if(ok){G.combo++;P.stats.maxCombo=Math.max(P.stats.maxCombo,G.combo);qev('chuoi5',G.combo,true);
    if(G.mode==='rank'){const lv=Math.min(3,q.level||0),left=Math.max(0,G.lim-(Date.now()-G.qt0));pts=Math.round(RANK_PTS[lv]*(1+0.5*left/G.lim))}
    else pts=G.mode==='man'?Math.max(40,100+20*Math.min(G.combo-1,5)-30*G.hu):100;
    G.score+=pts;sfx.ok();confetti(50,.45);if(el)floatText('+'+pts,el)}
  else{// Thi đấu, câu sắp xếp / sơ đồ đúng một phần: được điểm theo tỉ lệ dòng/ô đúng
    if(G.mode==='rank'&&G.frac>0){const lv=Math.min(3,q.level||0),left=Math.max(0,G.lim-(Date.now()-G.qt0));pts=Math.round(RANK_PTS[lv]*(1+0.5*left/G.lim)*G.frac);G.score+=pts;if(pts&&el)floatText('+'+pts,el)}
    G.combo=0;G.miss++;if(G.mode==='man'&&G.hearts<50)G.hearts--;sfx.no();navigator.vibrate&&navigator.vibrate(120)}
  $('#dock').innerHTML='';const wi=G.k;G.k++;hud();checkAch();
  const out=!ok&&G.hearts<=0;G.needRevive=out;G.over=G.k>=G.qs.length;if(out){const fk=key(G.t,G.i);P.fails[fk]=(P.fails[fk]||0)+1;save()}
  const canTwin=!ok&&!G.over&&G.mode==='man'&&q.raw&&!G.twinUsed[wi];
  const praise=['Chính xác!','Tuyệt vời!','Quá đỉnh!','Giỏi lắm!'];
  const sh=sheetOpen(ok,ok?praise[Math.random()*4|0]+(G.mode==='rank'?` +${pts}`:''):timeout?'Hết giờ!':out?'Hết tim rồi!':pts>0?`Đúng một phần +${pts}`:'Chưa đúng rồi',timeout?why:why,q,
    `${canTwin?`<button class="btn" id="tw">Thử câu tương tự${G.hearts<3?' (đúng được hồi 1 tim)':''}</button>`:''}<button class="btn ${ok?'':'co'}" id="nx">${out?'Tiếp tục':G.over?(G.mode==='man'?'Hoàn thành màn':'Xem kết quả'):'Câu tiếp theo'}</button>`);
  if(canTwin)$('#tw').onclick=()=>{sfx.tap();G.twinUsed[wi]=1;try{G.twin=inst(q.raw,{tid:q.tid,level:q.level,title:q.title})}catch(e){return}sh.classList.remove('on');renderQ()};
  $('#nx').onclick=()=>{sfx.tap();sh.classList.remove('on');G.needRevive?revive():G.over?finish():renderQ()}}
function revive(){overlay(`<div style="width:96px;margin:0 auto">${owlSVG}</div><h2>Hết tim rồi!</h2><p>Không sao, Cherry hồi lại 3 tim để em làm tiếp từ câu sau. Qua màn kiểu này được tối đa 1 sao.</p><button class="btn" id="rv1">Hồi 3 tim, làm tiếp</button><button class="btn alt" id="rv2">Chơi lại từ đầu</button><button class="btn alt" id="rv3">Về bản đồ</button>`);
  $('#rv1').onclick=()=>{closeOvl();G.hearts=3;G.revived=true;G.needRevive=false;hud();G.over?finish():renderQ()};$('#rv2').onclick=()=>{closeOvl();startLevel(G.i)};$('#rv3').onclick=()=>{closeOvl();journey()}}

function streakLine(s){return s?`<div class="streakup">${flame(false,22)} <b>Chuỗi ${s.streak} ngày!</b>${s.shieldUsed?' Lá chắn đã giữ chuỗi cho em.':' Mai nhớ quay lại nhé.'}</div>`:''}
function finish(){clearInterval(TM);const sec=Math.round((Date.now()-G.t0)/1000),tm=`<div><b>${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</b>thời gian</div>`,nOk=G.qs.length-G.miss;
  if(G.mode==='rank'){qev('rank');const t0=tierOf(P.lp),mx=G.qs.reduce((s,q)=>s+RANK_PTS[Math.min(3,q.level||0)]*1.5,0),RD=rankDelta({score:G.score,max:mx,correct:nOk,n:G.qs.length,tier:t0}),L=lpdE();
    let d=RD.d,capped=false;if(d>0){const room=Math.max(0,RANK_DAY_CAP-L.g);if(d>room){d=room;capped=true}L.g+=d}
    const before=P.lp||0;P.lp=Math.max(0,before+d);d=P.lp-before;P.matches=(P.matches||0)+1;P.hist=[...(P.hist||[]),{at:new Date().toISOString(),s:G.score,c:nOk,n:G.qs.length,d}].slice(-20);
    const s=bumpStreak();save();syncMine();checkAch();const t1=tierOf(P.lp);if(t1>t0){sfx.win();confetti(160,.3)}
    overlay(`${emblem(t1,90)}<h2>${t1>t0?'Lên '+TIERS[t1].n+'!':t1<t0?'Xuống '+TIERS[t1].n:d>=0?'Thắng điểm!':'Cố lên!'}</h2>
      <div class="lpd ${d>=0?'up':'down'}">${d>=0?'+':''}${d} điểm</div><p>${TIERS[t1].n} · ${P.lp} điểm</p>
      <div class="stat"><div><b>${G.score}</b>điểm trận</div><div><b>${nOk}/${G.qs.length}</b>câu đúng</div>${tm}</div>
      <p style="font-size:14px">${RD.bonus?`Thưởng chính xác <b>+${RD.bonus}</b>. `:''}${capped?`Hôm nay em đã đạt trần <b>+${RANK_DAY_CAP}</b> điểm, mai thi tiếp nhé!`:''}</p>${streakLine(s)}
      ${rankLock()?`<p class="tnote">Em đang có hơn ${NB_LOCK} câu sai chưa làm lại. Dọn kho câu sai để mở lại Thi đấu.</p><button class="btn" id="r4">Làm lại câu sai</button>`:'<button class="btn" id="r1">Trận nữa</button>'}<button class="btn alt" id="r2">Bảng xếp hạng</button><button class="btn alt" id="r3">Về thi đấu</button>`);
    $('#r1')&&($('#r1').onclick=()=>{closeOvl();startRank()});$('#r4')&&($('#r4').onclick=()=>{closeOvl();redoTab='sai';redo()});$('#r2').onclick=()=>{closeOvl();boardT=null;board()};$('#r3').onclick=()=>{closeOvl();ranked()};return}
  if(G.mode==='de'){qev('de');const t=G.t,k=key(t,0),pc=Math.round(nOk/G.qs.length*100),st=pc>=90?3:pc>=70?2:pc>=50?1:0;
    if(st>(P.best[k]||0))P.best[k]=st;if(pc>(P.score[k]??-1))P.score[k]=pc;P.pt[k]=P.pt[k]||new Date().toISOString();
    const s=bumpStreak();save();syncMine();checkAch();if(st>=2){sfx.win();confetti(120,.3)}
    overlay(`<h2>${pc>=90?'Xuất sắc!':pc>=70?'Làm tốt lắm!':pc>=50?'Đạt rồi!':'Cố gắng thêm nhé!'}</h2><p>${esc(t.title)}</p><div class="bigstars">${[1,2,3].map(x=>star(x<=st)).join('')}</div>
     <div class="stat"><div><b>${pc}%</b>điểm</div><div><b>${nOk}/${G.qs.length}</b>câu đúng</div>${tm}</div>${streakLine(s)}
     <p style="font-size:14px">Câu sai đã được đưa vào <b>Làm lại câu sai</b>.</p><button class="btn" id="r2">Làm lại đề</button><button class="btn alt" id="r3">Về danh sách đề</button>`);
    $('#r2').onclick=()=>{closeOvl();startDe(t)};$('#r3').onclick=()=>{closeOvl();onTap()};return}
  if(G.mode!=='man'){const s=G.mode==='so'&&G.qs.length>=3?bumpStreak():null;if(s)sfx.win();
    overlay(`<h2>${G.mode==='one'?'Xong!':'Xong lượt làm lại!'}</h2><p>${MODE[G.mode]}</p><div class="stat"><div><b>${nOk}/${G.qs.length}</b>câu đúng</div>${tm}</div>${streakLine(s)}
     <button class="btn" id="r3">Về danh sách</button>`);$('#r3').onclick=()=>{closeOvl();redo()};return}
  const {t,i}=G,pass=G.hearts>0;const st=pass?(G.revived?1:G.miss===0?3:G.miss===1?2:1):0;const k=key(t,i);let s=null;
  const lt=P.lvt[k]||{n:0,s:0};P.lvt[k]={n:lt.n+1,s:lt.s+sec};
  if(pass){qev('man');if(st===3)qev('sao3');if(!G.htot)qev('kogoiy');wkE().lv++;const rt=routeTopics(t.khoi);if(!P.stats.treasure&&rt.length&&rt.every(x=>x===t||topicPassed(x)>=1)&&!mapItems(t.khoi).some(x=>x.L&&x.L.id&&!x.t))P.stats.treasure=1}
  if(pass){const first=!(P.best[k]>0);if(st>(P.best[k]||0))P.best[k]=st;if(G.score>(P.score[k]||0))P.score[k]=G.score;P.pt[k]=P.pt[k]||new Date().toISOString();
    if(first){P.stats.levels++;addXP(20*st)}if(st===3)P.stats.perfect++;if(i===nMan(t)-1)P.stats.top++;
    save();sfx.win();confetti(140,.3);s=bumpStreak();syncMine();checkAch()}
  const rt=routeTopics(t.khoi),nj=rt.findIndex(x=>x.id===t.id)+1,nt=pass&&nj>0&&nj<rt.length&&topicOpen(rt,nj)?rt[nj]:null,L0=lessonOf(t);
  overlay(`<h2>${pass?(st===3?'Hoàn hảo!':'Qua bài!'):'Thử lại nhé!'}</h2><p>${esc(L0?lessonName(L0):t.title)}</p>
   <div class="bigstars">${[1,2,3].map(x=>star(x<=st)).join('')}</div>
   <div class="stat"><div><b>${G.score}</b>điểm</div><div><b>${nOk}/${G.qs.length}</b>câu đúng</div>${tm}</div>${streakLine(s)}
   ${nt?`<button class="btn" id="r1">Bài tiếp theo ›</button>`:''}
   ${!pass||st<3?`<button class="btn ${pass?'alt':''}" id="r2">Làm lại bài này</button>`:''}${t.theory&&(!pass||st<3)?`<button class="btn alt thbtn" id="r4">${bookSVG} Xem lại lý thuyết</button>`:''}<button class="btn alt" id="r3">Về bản đồ</button>`);
  $('#r4')&&($('#r4').onclick=()=>{closeOvl();theory(t)});
  $('#r1')&&($('#r1').onclick=()=>{closeOvl();curT=nt;startLevel()});$('#r2')&&($('#r2').onclick=()=>{closeOvl();startLevel(i)});$('#r3').onclick=()=>{closeOvl();journey()}}
$('#quit').onclick=()=>{const m=G&&G.mode;overlay(`<h2>Thoát?</h2><p>${m==='rank'?'Thoát giữa trận: các câu chưa làm tính là sai.':m==='man'||m==='de'?'Kết quả lượt này sẽ không được lưu.':'Các câu đã làm vẫn được ghi nhận.'}</p><button class="btn co" id="q1">Thoát</button><button class="btn alt" id="q2">Làm tiếp</button>`);
  $('#q1').onclick=()=>{closeOvl();$('#sheet').classList.remove('on');clearInterval(TM);
    if(m==='rank'&&G.started){G.miss+=G.qs.length-G.k;G.k=G.qs.length;finish();return}
    m==='man'?journey():m==='rank'?ranked():m==='de'?onTap():redo()};$('#q2').onclick=closeOvl};
$('#snd').onclick=()=>setMute(!muted);

/* ---------- giáo viên ---------- */
function accounts(){show('track');$('#trTitle').textContent='Tài khoản học sinh';const req=ACCS.filter(a=>a.reset);
  $('#trk').innerHTML=`<div class="tbox"><b>Thêm học sinh</b><p class="tnote">Mỗi dòng: <b>Họ và tên; khối; môn</b>. Môn ghi <b>Toán</b>, <b>Anh</b> hoặc <b>Toán Anh</b>; bỏ trống là Toán. Mật khẩu mặc định 0000.</p>
     <textarea class="name ta" id="aLines" placeholder="Nguyễn Văn An; 8; Toán&#10;Trần Thị Bình; 8; Toán Anh&#10;Lê Minh; 7; Anh"></textarea><button class="btn sm" id="aAdd">Tạo tài khoản</button><div id="aMsg"></div></div>
   ${req.length?`<div class="tbox warn"><b>Xin đặt lại mật khẩu (${req.length})</b>${req.map(a=>`<div class="row2"><span>${esc(a.name)} · khối ${a.khoi}</span><button class="btn sm" data-reset="${a.id}">Đặt lại 0000</button></div>`).join('')}</div>`:''}
   ${KHOI.map(k=>{const L=ACCS.filter(a=>a.khoi===k).sort((a,b)=>a.name.localeCompare(b.name,'vi'));return L.length?`<div class="tbox"><b>Khối ${k} (${L.length})</b>${L.map(a=>`<div class="row2 acc"><span>${esc(a.name)}${a.isDefault!==false?' <small>(mật khẩu 0000)</small>':''}<span class="mtg">${Object.entries(MON).map(([m,x])=>`<button class="mt${monOf(a).includes(m)?' on':''}" data-acc="${a.id}" data-mon="${m}" style="--c:${x.c}">${x.n}</button>`).join('')}</span></span><span class="abtn"><button class="btn sm alt" data-reset="${a.id}">Đặt lại 0000</button><button class="btn sm del" data-del="${a.id}">Xoá</button></span></div>`).join('')}</div>`:''}).join('')}
   ${ACCS_DEL.length?`<details class="tbox adel"><summary><b>Tài khoản đã xoá (${ACCS_DEL.length})</b></summary><p class="tnote">Tiến độ của các em vẫn được giữ. Bấm Khôi phục nếu lỡ xoá nhầm.</p>${[...ACCS_DEL].sort((a,b)=>a.khoi-b.khoi||a.name.localeCompare(b.name,'vi')).map(a=>`<div class="row2"><span>${esc(a.name)} · khối ${esc(a.khoi)}</span><button class="btn sm alt" data-restore="${a.id}">Khôi phục</button></div>`).join('')}</details>`:''}`;
  $('#trBack').onclick=()=>{sfx.tap();subjects()};
  $('#aAdd').onclick=async()=>{const lines=$('#aLines').value.split('\n').map(s=>s.trim()).filter(Boolean);let ok=0,bad=[];
    for(const l of lines){const [n,k,mm]=l.split(/[;,\t]/).map(s=>(s||'').trim());const pm=plain(mm||''),mon=[...(!pm||/toan/.test(pm)?['toan']:[]),...(/anh/.test(pm)?['anh']:[])];if(!mon.length){bad.push(l+' (môn?)');continue}if(!n||!/^(6|7|8|9|1[0-2])$/.test(k||'')){bad.push(l);continue}
      if(findAcc(n,k).some(a=>normName(a.name)===normName(n))){bad.push(l+' (đã có)');continue}
      const salt=Math.random().toString(36).slice(2,10);try{await DB.collection('accounts').doc().set({name:n.replace(/\s+/g,' '),khoi:k,salt,ph:await hashPin(salt,'0000'),isDefault:true,reset:false,mon,created:new Date().toISOString()});ok++}catch(e){bad.push(l)}}
    $('#aMsg').innerHTML=`<div class="okbox">Đã tạo ${ok} tài khoản.</div>${bad.length?`<div class="err">Không tạo được: ${bad.map(esc).join('; ')}</div>`:''}`};
  $$('#trk [data-mon]').forEach(b=>b.onclick=async()=>{const a=ACCS.find(x=>x.id===b.dataset.acc),m=b.dataset.mon,cur=monOf(a),nx=cur.includes(m)?cur.filter(x=>x!==m):[...cur,m];
    if(!nx.length)return toast('Mỗi tài khoản cần ít nhất một môn.');try{await DB.doc('accounts/'+a.id).update({mon:nx});sfx.tap()}catch(e){msgBox('Chưa lưu được',esc(e.message))}});
  $$('#trk [data-reset]').forEach(b=>b.onclick=async()=>{const a=ACCS.find(x=>x.id===b.dataset.reset);try{await DB.doc('accounts/'+a.id).update({ph:await hashPin(a.salt,'0000'),reset:false,isDefault:true});toast(`Đã đặt lại mật khẩu của ${esc(a.name)} về 0000`)}catch(e){msgBox('Chưa lưu được',esc(e.message))}});
  $$('#trk [data-del]').forEach(b=>b.onclick=()=>{const a=ACCS.find(x=>x.id===b.dataset.del);if(!a)return;sfx.tap();
    overlay(`<h2>Xoá tài khoản?</h2><p>Xoá tài khoản của <b>${esc(a.name)}</b> (khối ${esc(a.khoi)})? Em ấy sẽ không đăng nhập được nữa và không còn hiện trên bảng xếp hạng.</p><p class="tnote">Tiến độ vẫn được giữ; thầy khôi phục được ở mục <b>Tài khoản đã xoá</b> cuối trang.</p><button class="btn del" id="dY">Xoá tài khoản</button><button class="btn alt" id="dN">Huỷ</button>`);
    $('#dN').onclick=closeOvl;
    $('#dY').onclick=async()=>{const y=$('#dY');if(y.disabled)return;y.disabled=true;y.textContent='Đang xoá…';
      try{await DB.doc('accounts/'+a.id).delete();closeOvl();toast(`Đã xoá tài khoản của ${esc(a.name)}`)}catch(e){msgBox('Chưa xoá được',esc(e.message))}}});
  $$('#trk [data-restore]').forEach(b=>b.onclick=async()=>{const a=ACCS_DEL.find(x=>x.id===b.dataset.restore);if(!a||b.disabled)return;b.disabled=true;
    try{await DB.doc('accounts/'+a.id).update({restore:true});toast(`Đã khôi phục tài khoản của ${esc(a.name)}`)}catch(e){b.disabled=false;msgBox('Chưa khôi phục được',esc(e.message))}})}
/* báo lỗi câu hỏi: nhóm theo câu (nhiều bạn báo cùng một câu) */
function repGroups(done){const m=new Map();for(const r of REPS.filter(x=>!!x.done===done)){const k=r.tid+'|'+r.qkey;if(!m.has(k))m.set(k,[]);m.get(k).push(r)}return [...m.values()]}
const vnTime=s=>{const d=new Date(s);return isNaN(d)?'':d.toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})};
function reportsPage(){show('track');$('#trTitle').textContent='Câu báo lỗi';const open=repGroups(false),done=repGroups(true);
  const card=(g,gi)=>{const r0=g[0],s=r0.snap||{},t=TOPICS.find(x=>x.id===r0.tid),cnt={};g.forEach(r=>cnt[r.kind]=(cnt[r.kind]||0)+1);let ans='';try{ans=answerHTML(s)}catch(e){}
    return `<div class="tbox rpc"><div class="rph"><b>${esc(t?t.title:s.title||r0.tid)}</b><small>${[t?`Khối ${esc(t.khoi)}`:'',s.level!=null?`Mức ${s.level+1}`:''].filter(Boolean).join(' · ')}</small></div>
      <div class="rpchips">${Object.entries(cnt).map(([k,n])=>`<span class="chip late">${REPK[k]||k}${n>1?` ×${n}`:''}</span>`).join('')}</div>
      <div class="stem">${tex(s.stem||'')}</div>${ans?`<div class="vans">${ans}</div>`:''}${s.sol?`<details><summary>Lời giải</summary><div class="sol">${tex(s.sol)}</div></details>`:''}
      <div class="rpwho">${g.map(r=>`<div><b>${esc(r.name)}</b>${r.khoi?` · khối ${esc(r.khoi)}`:''} · <small>${vnTime(r.at)}</small>${r.snap&&r.snap.ans!=null?`<br><small>Em trả lời: ${tex(String(r.snap.ans))}${r.snap.ok===true?' (đúng)':r.snap.ok===false?' (sai)':''}</small>`:''}${r.note?`<div class="rpn">“${esc(r.note)}”</div>`:''}</div>`).join('')}</div>
      <div class="rpbt"><button class="btn sm" data-rq="${gi}">✎ Sửa câu này</button><button class="btn sm alt" data-rd="${gi}">✓ Đã xử lý</button></div></div>`};
  $('#trk').innerHTML=(open.length?`<div class="tbox"><b>Học sinh báo ${open.length} câu</b><p class="tnote">Bấm <b>Sửa câu này</b> để sửa, xong bấm <b>Đã xử lý</b>. Câu không có lỗi cũng bấm <b>Đã xử lý</b>.</p></div>`+open.map(card).join('')
    :`<div class="tbox"><b>Chưa có câu nào bị báo lỗi.</b><p class="tnote">Học sinh bấm <b>Báo lỗi</b> ở bảng kết quả sau mỗi câu (hoặc dưới mỗi câu tự luận). Câu được báo sẽ hiện ở đây.</p></div>`)+
    (done.length?`<details class="tbox adel"><summary><b>Đã xử lý gần đây (${done.length})</b></summary>${done.map((g,gi)=>{const r0=g[0],t=TOPICS.find(x=>x.id===r0.tid);
      return `<div class="row2"><span>${esc(t?t.title:r0.tid)}<br><small>${esc(String((r0.snap||{}).stem||'').replace(/\$/g,'').slice(0,70))}… · ${g.length} lượt báo</small></span><button class="btn sm alt" data-ro="${gi}">Mở lại</button></div>`}).join('')}</details>`:'');
  typeset($('#trk'));$('#trBack').onclick=()=>{sfx.tap();subjects()};
  const act=async(g,action,msg,b)=>{if(b.disabled)return;b.disabled=true;try{await DB.doc('reports/'+g[0].id).update({action,ids:g.map(r=>r.id)});toast(msg)}catch(e){b.disabled=false;msgBox('Chưa lưu được',esc(e.message))}};
  $$('#trk [data-rd]').forEach(b=>b.onclick=()=>{sfx.tap();act(open[+b.dataset.rd],'done','Đã đánh dấu xử lý xong',b)});
  $$('#trk [data-ro]').forEach(b=>b.onclick=()=>{sfx.tap();act(done[+b.dataset.ro],'reopen','Đã mở lại',b)});
  $$('#trk [data-rq]').forEach(b=>b.onclick=()=>{sfx.tap();const r0=open[+b.dataset.rq][0],t=TOPICS.find(x=>x.id===r0.tid);if(!t)return toast('Không tìm thấy bài này (có thể đã bị xoá).');
    const bs=qBlocks(t.raw),i=bs.findIndex(x=>!x.man&&parseOne(x.raw).q?.key===r0.qkey);
    if(i<0){toast('Câu này đã được sửa hoặc đổi nội dung. Mở danh sách câu của bài để tìm.');return qedit(t)}editQ(t,i)})}
function asgForm(){const ts=gradeTopics(curK).filter(t=>t.status==='giao'&&!t.errors.length&&!isKho(t));const mine=ASG.filter(a=>a.khoi===curK).sort((a,b)=>(b.created||'').localeCompare(a.created||'')).slice(0,10);
  const d=new Date(Date.now()+3*864e5),p=x=>String(x).padStart(2,'0'),dv=`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T21:00`;
  overlay(`<h2>Giao bài khối ${curK}</h2>${ts.length?`<div class="form">
    <label>Chủ đề<select class="name" id="fT">${ts.map(t=>`<option value="${t.id}">${esc(PHAN[t.phan].name)} · ${esc(t.title)}</option>`).join('')}</select></label>
    <label>Phải qua<select class="name" id="fL"></select></label>
    <label class="chkl"><input type="checkbox" id="fH" checked> Có hạn nộp</label>
    <label id="fDw">Hạn nộp<input class="name" type="datetime-local" id="fD" value="${dv}"></label>
    <label>Ghi chú<input class="name" id="fN" placeholder="Không bắt buộc"></label>
    <button class="btn" id="fS">Giao bài</button></div>`:'<p>Khối này chưa có chủ đề nào đã duyệt.</p>'}
    ${mine.length?`<div class="cert" style="margin-top:12px">${mine.map(a=>`<div class="row"><span>${esc((TOPICS.find(t=>t.id===a.topicId)||{}).title||'?')}<br><small>${a.due?'Hạn '+fmtDue(a.due):'Không hạn'}</small></span><button class="btn sm alt" data-del="${a.id}">Xóa</button></div>`).join('')}</div>`:''}
    <button class="btn alt" id="fC">Đóng</button>`);
  const setL=()=>{const t=ts.find(x=>x.id===$('#fT').value),n=nMan(t);$('#fL').innerHTML=isDe(t)?'<option value="1">Làm đề 1 lần</option>':n===1?'<option value="1">Hoàn thành bài</option>':Array.from({length:n},(_,i)=>`<option value="${i+1}" ${i===n-1?'selected':''}>${i===n-1&&n>1?`Cả ${n} màn`:i?`Màn 1 → ${i+1}`:'Màn 1'}</option>`).join('')};
  if(ts.length){setL();$('#fT').onchange=setL;$('#fH').onchange=()=>{$('#fDw').style.display=$('#fH').checked?'':'none'};
    $('#fS').onclick=async()=>{try{await DB.collection('assignments').doc().set({khoi:curK,topicId:$('#fT').value,levels:+$('#fL').value,due:$('#fH').checked?new Date($('#fD').value).toISOString():null,note:$('#fN').value.trim(),created:new Date().toISOString()});sfx.ok();closeOvl();area()}catch(e){msgBox('Chưa lưu được',esc(e.message))}}}
  $$('#panel [data-del]').forEach(b=>b.onclick=async()=>{try{await DB.doc('assignments/'+b.dataset.del).delete();asgForm()}catch(e){msgBox('Chưa lưu được',esc(e.message))}});
  $('#fC').onclick=closeOvl}
function track(){show('track');$('#trTitle').textContent='Theo dõi khối '+curK;const kh=curK,ix={},today=vnDay();
  for(const t of TOPICS){if(t.khoi!==kh)continue;t.levels.forEach((l,li)=>l.qs.forEach(q=>{ix[q.key]={q,t,li}}))}
  const st=PLAYERS.filter(v=>v.khoi===kh).sort((a,b)=>(a.name||'').localeCompare(b.name||'','vi'));
  const A=ASG.filter(a=>a.khoi===kh).sort((a,b)=>(a.created||'').localeCompare(b.created||'')).slice(-6);
  const ptOf=v=>k=>{const b=v.best&&v.best[k];return b&&b.st>0?(b.t||'1970'):null};
  const agg={};for(const v of st)for(const [k,w] of Object.entries(v.wst||{})){if(!w.d||w.d<addDays(today,-14))continue;const g=agg[k]||(agg[k]={n:0,w:0,who:0});g.n+=w.n;g.w+=w.w;if(w.w)g.who++}
  const hard=Object.entries(agg).filter(([k,g])=>g.n>=3&&g.w>0&&ix[k]).sort((a,b)=>b[1].w/b[1].n-a[1].w/a[1].n||b[1].w-a[1].w).slice(0,8);
  $('#trk').innerHTML=`<div class="tbox"><div class="scrollx"><table class="trk"><thead><tr><th>Học sinh</th><th>Chuỗi</th><th>Rank</th>${A.map(a=>`<th>${esc(((TOPICS.find(t=>t.id===a.topicId)||{}).title||'?').slice(0,14))}<div class="th2">${a.due?fmtDue(a.due):'không hạn'}</div></th>`).join('')}<th>Câu sai</th></tr></thead>
    <tbody>${st.map(v=>`<tr><td class="nm"><button class="lnk" data-rp="${v.id}">${esc(v.name||'?')}</button>${v.mau?' <small>(mẫu)</small>':''}</td><td>${liveStreak(v.st||{},today)||'—'}</td><td>${TIERS[tierOf(v.lp)].n}</td>${A.map(a=>{const s=asgStatus(a,ptOf(v));const c=s.complete?(s.late?'late':'ok'):s.overdue?'miss':'part';return `<td class="cell ${c}">${s.complete?(s.late?'Muộn':'✓'):s.passed+'/'+s.need}</td>`}).join('')}<td>${Object.values(v.rev||{}).filter(r=>r.in_notebook).length}</td></tr>`).join('')}</tbody></table></div>
    ${st.length?'':'<p>Chưa có học sinh khối này chơi.</p>'}<p class="tnote">✓ đúng hạn · Muộn: xong sau hạn · a/b: đã qua a trên b màn · đỏ: quá hạn chưa xong. Bấm tên học sinh để tạo báo cáo gửi phụ huynh.</p></div>
   ${teacherExtra(kh,st,ix)}
   <h2 class="sect">Câu khối ${kh} sai nhiều nhất (14 ngày)</h2>
   ${hard.length?hard.map(([k,g])=>{const {q,t,li}=ix[k];let q2=q;try{q2=instantiate(q)}catch(e){}
     return `<div class="tbox hq"><div class="hqh"><span class="chip nhap">${Math.round(g.w/g.n*100)}% sai</span><span class="chip">${g.w}/${g.n} lượt · ${g.who} em</span><small>${esc(t.title)} · mức ${li+1}</small></div><div class="stem">${tex(q2.stem)}</div><div class="vans">${answerHTML(q2)}</div><button class="btn sm alt" data-eq="${t.id}|${k}" style="margin-top:8px">✎ Sửa câu này</button></div>`}).join('')
     :'<div class="tbox"><p>Chưa đủ dữ liệu (cần ít nhất 3 lượt trả lời mỗi câu).</p></div>'}`;
  typeset($('#trk'));$('#trBack').onclick=()=>{sfx.tap();area()};$$('#trk [data-rp]').forEach(b=>b.onclick=()=>parentReport(PLAYERS.find(p=>p.id===b.dataset.rp)));
  $$('#trk [data-eq]').forEach(b=>b.onclick=()=>{const [tid,k]=b.dataset.eq.split('|'),t=TOPICS.find(x=>x.id===tid),bs=qBlocks(t.raw),i=bs.findIndex(x=>!x.man&&parseOne(x.raw).q?.key===k);if(i<0)return toast('Không tìm thấy câu này.');editQ(t,i)})}


/* ---------- giáo viên: sửa câu hỏi ---------- */
function qBlocks(text){const out=[],re=/\\man\s*\{([^}]*)\}\s*\{([^}]*)\}|\\begin\{(ex|extf|exfb|exmatch|extl|exsx|exsd)\}[\s\S]*?\\end\{\3\}/g;let m,lv=-1;
  while((m=re.exec(text))){if(m[1]!==undefined){lv++;out.push({man:true,lv,n:m[1].trim(),name:m[2].trim(),start:m.index,end:m.index+m[0].length})}
    else out.push({lv:Math.max(lv,0),type:m[3],start:m.index,end:m.index+m[0].length,raw:m[0]})}
  return out}
function parseOne(raw){const P=parseBank('\\chude{x}\n\\man{1}{x}\n'+raw);const n=(raw.match(/\\begin\{(ex|extf|exfb|exmatch|extl|exsx|exsd)\}/g)||[]).length;
  const errs=P.errors.map(e=>e.msg);if(n!==1)errs.push(n?'Mỗi lần chỉ sửa một câu (một cặp \\begin…\\end).':'Chưa có \\begin{ex|extf|exfb|exmatch|extl}…\\end{…}.');
  return {q:P.levels[0]&&P.levels[0].qs[0],errors:errs}}
const QT={ex:'\\begin{ex}\nĐề bài\n\\choice{$A$ \\sai{Vì sao A sai}}{\\True $B$}{$C$ \\sai{Vì sao C sai}}{$D$ \\sai{Vì sao D sai}}\n\\goiy{Gợi ý}\n\\loigiai{Lời giải}\n\\end{ex}',
  extf:'\\begin{extf}\nĐề bài. Mỗi khẳng định sau đúng hay sai?\n\\choiceTF{\\True Ý a}{Ý b}{\\True Ý c}{Ý d}\n\\loigiai{Lời giải}\n\\end{extf}',
  exfb:'\\begin{exfb}\nĐề bài\n\\shortans{đáp số}\n\\saithuong{đáp số sai hay gặp}{Vì sao sai}\n\\loigiai{Lời giải}\n\\end{exfb}',
  extl:'\\begin{extl}\nĐề bài tự luận (học sinh làm vào vở).\n\\goiy{Gợi ý 1: hướng làm}\n\\goiy{Gợi ý 2: bước tiếp theo}\n\\end{extl}',
  exsx:'\\begin{exsx}\nĐề bài. Sắp xếp các bước thành lời giải đúng.\n\\buoc{Bước 1}\n\\buoc[1]{Bước 2 (đổi chỗ được với bước 3)}\n\\buoc[1]{Bước 3}\n\\buoc{Bước 4}\n\\nhieu{Khối sai}{Vì sao sai}\n\\loigiai{Lời giải}\n\\end{exsx}',
  exsd:'\\begin{exsd}\nĐề bài. Chứng minh ...\n\\nut{1}{Kết luận}{căn cứ của kết luận}\n\\nut{2}[1]{Ô cần có để suy ra ô 1}{căn cứ}\n\\nut{3}[2]{Giả thiết}{giả thiết}\n\\nut{4}[2]{Điều đã biết}{căn cứ}\n\\an{2}\n\\anly{2}\n\\nhieu{Mệnh đề sai}{Vì sao sai}\n\\nhieuly{Căn cứ sai}{Vì sao sai}\n\\end{exsd}',
  exmatch:'\\begin{exmatch}\nNối mỗi ý ở cột trái với ý đúng ở cột phải.\n\\pair{trái 1}{phải 1}\n\\pair{trái 2}{phải 2}\n\\pair{trái 3}{phải 3}\n\\end{exmatch}'};
let QE=null;
function qedit(t){QE=t.id;t=TOPICS.find(x=>x.id===QE)||t;show('track');$('#trTitle').textContent='Sửa câu hỏi';const bs=qBlocks(t.raw);let no=0;
  $('#trk').innerHTML=`<div class="tbox"><b>${esc(t.title)}</b><p class="tnote">Bấm <b>Sửa</b> để chỉnh LaTeX của từng câu, có xem trước trước khi lưu. Mức 4 chỉ dùng cho Thi đấu.</p>
     ${t.errors.length?`<div class="err">Chủ đề đang có lỗi:<br>${t.errors.map(esc).join('<br>')}</div>`:''}
     <div class="tbtns2" style="margin:8px 0 0"><button class="btn sm alt" id="qTh">${t.theory?'Sửa lý thuyết':'+ Thêm lý thuyết'}</button><button class="btn sm alt" id="qAll">Sửa toàn bộ LaTeX</button>${t.prev?'<button class="btn sm alt" id="qUndo">Hoàn tác lần lưu trước</button>':''}</div></div>`+
   bs.map((b,i)=>{if(b.man)return `<h2 class="sect">Mức ${esc(b.n)} · ${esc(b.name)}<button class="btn sm" data-add="${b.lv}">+ Thêm câu</button></h2>`;
     const {q,errors}=parseOne(b.raw);let q2=q;try{if(q)q2=instantiate(q)}catch(e){}no++;
     return `<div class="tbox qrow${errors.length?' bad':''}"><div class="hqh"><span class="chip">Câu ${no}</span><span class="chip nhap">${TYPE[b.type]}</span>${q&&q.params?'<span class="chip">có tham số</span>':''}${q&&q.hints?`<span class="chip">${q.hints.length} gợi ý</span>`:''}</div>
       ${errors.length?`<div class="err">${errors.map(esc).join('<br>')}</div>`:''}${q2?`<div class="stem">${tex(q2.stem)}</div><div class="vans">${answerHTML(q2)}</div>`:''}
       <div class="qbtn"><button class="btn sm" data-e="${i}">✎ Sửa</button><button class="btn sm alt" data-d="${i}">Xóa</button></div></div>`}).join('')+
   (bs.some(b=>b.man)?'':`<div class="tbox"><button class="btn sm" data-add="0">+ Thêm câu</button></div>`);
  typeset($('#trk'));$('#trBack').onclick=()=>{sfx.tap();QE=null;BANKON?bank(true):journeyOr()};
  $$('#trk [data-e]').forEach(b=>b.onclick=()=>{sfx.tap();editQ(t,+b.dataset.e)});
  $$('#trk [data-add]').forEach(b=>b.onclick=()=>{sfx.tap();editQ(t,null,+b.dataset.add)});
  $$('#trk [data-d]').forEach(b=>b.onclick=()=>{const blk=bs[+b.dataset.d];overlay(`<h2>Xóa câu này?</h2><p>Câu sẽ bị xóa khỏi chủ đề. Thầy có thể bấm "Hoàn tác lần lưu trước" nếu xóa nhầm.</p><button class="btn co" id="dy">Xóa</button><button class="btn alt" id="dn">Thôi</button>`);
    $('#dn').onclick=closeOvl;$('#dy').onclick=()=>saveText(t,t.raw.slice(0,blk.start).replace(/[ \t]*\n?$/,'')+t.raw.slice(blk.end),'Đã xóa câu.')});
  $('#qTh').onclick=()=>{sfx.tap();editTheory(t)};
  $('#qAll').onclick=()=>{overlay(`<h2>LaTeX của chủ đề</h2><textarea class="code" id="qa" spellcheck="false">${esc(t.raw)}</textarea><div id="qaErr"></div><button class="btn" id="qaS">Lưu</button><button class="btn alt" id="qaC">Hủy</button>`);
    $('#qaC').onclick=closeOvl;$('#qaS').onclick=()=>{const v=$('#qa').value,P=parseTopic(v);if(P.errors.length){$('#qaErr').innerHTML=`<div class="err">${P.errors.map(esc).join('<br>')}</div>`;return}saveText(t,v,'Đã lưu chủ đề.')}};
  $('#qUndo')&&($('#qUndo').onclick=()=>saveText(t,t.prev,'Đã hoàn tác.'))}
function journeyOr(){const t=TOPICS.find(x=>x.id===curT?.id);if(t&&isDe(t))onTap();else journey()}
async function saveText(t,text,msg){try{const r=await DB.doc('topics/'+t.id).update({text,banTruoc:t.raw,capnhat:new Date().toISOString(),base:t.upd});if(r&&r.updated_at){t.upd=r.updated_at;t.prev=t.raw;t.raw=text;t.theory=parseTopic(text).theory||null}closeOvl();sfx.ok();toast(msg);const on=$$('.scr.on')[0]?.id;if(QE&&on==='track')qedit(TOPICS.find(x=>x.id===QE)||t);else if(BANKON&&on==='track')bank(true)}
  catch(e){msgBox('Chưa lưu được',esc(e&&e.message||'Lỗi kết nối'));if(e&&e.status===409&&typeof loadAll==='function')loadAll().then(()=>{const on=$$('.scr.on')[0]?.id;if(on!=='track')return;if(QE){const x=TOPICS.find(y=>y.id===QE);if(x)qedit(x)}else if(BANKON)bank(true)}).catch(()=>{})}}
function editQ(t,bi,lvNew){const bs=qBlocks(t.raw),b=bi!=null?bs[bi]:null;let raw=b?b.raw:QT.ex;
  overlay(`<h2 style="font-size:26px">${b?'Sửa câu hỏi':'Thêm câu mới'}</h2>${b?'':`<div class="seg qtype">${Object.entries(TYPE).map(([k,v])=>`<button data-qt="${k}" class="${k==='ex'?'on':''}">${v}</button>`).join('')}</div>`}
    <textarea class="code" id="qx" spellcheck="false">${esc(raw)}</textarea>
    <p class="tnote" style="text-align:left">Đáp án đúng đánh dấu <b>\\True</b>. Báo lỗi khi chọn sai: <b>\\sai{…}</b> trong phương án/ý, câu điền số dùng <b>\\saithuong{đáp số sai}{vì sao}</b>. Gợi ý: <b>\\goiy{…}</b>, lời giải: <b>\\loigiai{…}</b>. Tham số: dòng <b>%@ a = ngaunhien(2,9)</b> rồi dùng <b>{{a}}</b>.</p>
    <div class="qpv" id="qpv"></div><button class="btn" id="qS">Lưu câu</button><button class="btn alt" id="qC">Hủy</button>`);
  const pv=()=>{const {q,errors}=parseOne($('#qx').value);let h='';
    if(errors.length)h=`<div class="err">${errors.map(esc).join('<br>')}</div>`;
    else{let q2=q;try{q2=instantiate(q)}catch(e){}h=`<div class="pvh">Xem trước${q.params?' (một bộ số ngẫu nhiên)':''}</div><div class="stem">${tex(q2.stem)}</div><div class="vans">${answerHTML(q2)}</div>${q2.hints?q2.hints.map((x,i)=>`<div class="vh"><b>Gợi ý ${i+1}.</b> ${tex(x)}</div>`).join(''):''}${q2.sol?`<div class="sol"><b>Lời giải.</b> ${tex(q2.sol)}</div>`:''}`}
    $('#qpv').innerHTML=h;typeset($('#qpv'));return !errors.length};
  let tm=null;$('#qx').oninput=()=>{clearTimeout(tm);tm=setTimeout(pv,500)};pv();
  $$('#panel [data-qt]').forEach(x=>x.onclick=()=>{$$('#panel [data-qt]').forEach(y=>y.classList.toggle('on',y===x));$('#qx').value=QT[x.dataset.qt];pv()});
  $('#qC').onclick=closeOvl;
  $('#qS').onclick=()=>{if(!pv())return;const v=$('#qx').value.trim();let text;
    if(b)text=t.raw.slice(0,b.start)+v+t.raw.slice(b.end);
    else if(typeof lvNew==='string')text=t.raw.replace(/\s*$/,'')+'\n\n'+lvNew+'\n'+v+'\n';
    else{const nx=bs.find(x=>x.man&&x.lv===lvNew+1);const at=nx?nx.start:t.raw.length;text=t.raw.slice(0,at).replace(/\s*$/,'')+'\n'+v+'\n\n'+t.raw.slice(at)}
    if(parseTopic(text).errors.length>t.errors.length){$('#qpv').insertAdjacentHTML('afterbegin','<div class="err">Lưu câu này làm chủ đề phát sinh lỗi, thầy kiểm tra lại.</div>');return}
    saveText(t,text,b?'Đã lưu câu hỏi.':'Đã thêm câu mới.')}}

/* ---------- Ngân hàng câu hỏi (chỉ giáo viên) ---------- */
let BANKON=false;const BK={tab:'all',k:'',bai:'',man:'',type:'',st:'',q:'',lim:25,tdOpen:false,cur:[]};
const BK_ST={nhap:'Nháp',giao:'Đã duyệt',an:'Đã ẩn'},BK_MAN=['','Nhận biết','Thông hiểu','Vận dụng','Vận dụng cao'];
const bankLessons=k=>{const r=routeTopics(k),rest=TOPICS.filter(t=>t.khoi===k&&!isDe(t)&&!r.includes(t));return [...r,...rest]};
const bankDes=k=>TOPICS.filter(t=>t.khoi===k&&isDe(t)).sort((a,b)=>a.order-b.order||a.title.localeCompare(b.title,'vi'));
function bankItems(k){const out=[];for(const t of [...bankLessons(k),...bankDes(k)]){let n=1;
  qBlocks(t.raw).forEach((b,bi)=>{if(b.man){n=Number(b.n)||b.lv+1;return}out.push({t,bi,b,n})})}return out}
function bank(keep){const y=keep?window.scrollY:0,sy=keep?$('#trk').scrollTop:0;BANKON=true;QE=null;
  if(!BK.k)BK.k=curK||(ACC&&ACC.khoi)||'8';
  show('track');$('#trTitle').textContent='Ngân hàng câu hỏi';
  const ks=[...new Set([...KHOI,...TOPICS.map(t=>t.khoi)])].filter(k=>/^\d+$/.test(k)).sort((a,b)=>a-b);
  $('#trk').innerHTML=`<div class="seg">${[['all','Tất cả câu'],['td','Thi đấu'],['de','Ôn tập']].map(([v,l])=>`<button data-tab="${v}" class="${BK.tab===v?'on':''}">${l}</button>`).join('')}</div>
    <div class="seg sm">${ks.map(k=>`<button data-k="${k}" class="${BK.k===k?'on':''}">Khối ${k}</button>`).join('')}</div>`+
    (BK.tab==='de'?bankDeHTML():(BK.tab==='td'?tdTopHTML(BK.k):'')+bankFilterHTML()+'<div id="bkSum"></div><div id="bkList"></div>');
  $('#trBack').onclick=()=>{sfx.tap();BANKON=false;subjects()};
  $$('#trk [data-tab]').forEach(b=>b.onclick=()=>{sfx.tap();BK.tab=b.dataset.tab;BK.lim=25;BK.bai='';bank()});
  $$('#trk [data-k]').forEach(b=>b.onclick=()=>{sfx.tap();BK.k=b.dataset.k;BK.bai='';BK.lim=25;bank()});
  if(BK.tab==='de')bindDe();else{if(BK.tab==='td')bindTdTop(BK.k);bindBankFilters();bankList()}
  if(keep){window.scrollTo(0,y);$('#trk').scrollTop=sy}}
function bankFilterHTML(){const td=BK.tab==='td',ls=bankLessons(BK.k),des=bankDes(BK.k);
  const sel=(id,cur,opts)=>`<select class="name" id="${id}">${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(cur)===String(v)?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const lab=t=>(t.chuong?t.chuong.replace(/^k\d+-/,'').toUpperCase()+' · ':'')+t.title;
  if(BK.bai&&!ls.concat(td?[]:des).some(t=>t.id===BK.bai))BK.bai='';
  const lvFrom=m=>{const i=RANK_BY_TIER.findIndex(r=>r[m]>0);return i<0?'chưa dùng':'từ bậc '+((TIERS[i]||{}).n||i+1)};
  return `<div class="tbox">${td?`<p class="tnote" style="margin:0 0 8px">Kho Thi đấu khối ${BK.k}: mọi câu Mức 1–4 của các bài và Kho Thi đấu <b>đã duyệt</b>, không lỗi, không tính đề ôn tập${mocOf(BK.k)?`, chỉ trong ${chRange(mocOf(BK.k))}`:''}. Bài nháp, ẩn hoặc sau mốc chưa vào kho. Mức 3 dùng ${lvFrom(2)}, Mức 4 dùng ${lvFrom(3)}.</p>`:''}
    <div class="bkgrid">${sel('bkBai',BK.bai,[['','Tất cả bài'],...ls.map(t=>[t.id,lab(t)]),...(td?[]:des.map(t=>[t.id,'Ôn tập · '+t.title]))])}
    ${sel('bkMan',BK.man,[['','Mọi mức'],['1','Mức 1'],['2','Mức 2'],['3','Mức 3'],['4','Mức 4']])}
    ${sel('bkType',BK.type,[['','Mọi dạng'],...Object.entries(TYPE)])}${td?'':sel('bkSt',BK.st,[['','Mọi trạng thái bài'],...Object.entries(BK_ST)])}</div>
    <input class="name" id="bkQ" placeholder="Tìm chữ trong đề, đáp án, lời giải…" value="${esc(BK.q)}"></div>`}
function bindBankFilters(){const on=(id,k)=>{const el=$('#'+id);if(el)el.onchange=()=>{BK[k]=el.value;BK.lim=25;bankList()}};
  on('bkBai','bai');on('bkMan','man');on('bkType','type');on('bkSt','st');let tm=null;
  $('#bkQ').oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{BK.q=$('#bkQ').value;BK.lim=25;bankList()},300)}}
function bankList(){const td=BK.tab==='td',qq=plain(BK.q),all=bankItems(BK.k);let it=all;
  if(td)it=it.filter(x=>!isDe(x.t)&&x.t.status==='giao'&&!x.t.errors.length&&inMoc(x.t));
  if(BK.bai)it=it.filter(x=>x.t.id===BK.bai);
  if(BK.man)it=it.filter(x=>String(x.n)===BK.man);
  if(BK.type)it=it.filter(x=>x.b.type===BK.type);
  if(!td&&BK.st)it=it.filter(x=>x.t.status===BK.st);
  if(qq)it=it.filter(x=>plain(x.b.raw).includes(qq));
  const c={},ty={};it.forEach(x=>{c[x.n]=(c[x.n]||0)+1;ty[x.b.type]=(ty[x.b.type]||0)+1});
  const bt=BK.bai&&TOPICS.find(t=>t.id===BK.bai),addN=isDe(bt||{})?1:(Number(BK.man)||(td?4:1));
  $('#bkSum').innerHTML=`<p class="bksum"><b>${it.length} câu</b> · M1 ${c[1]||0} · M2 ${c[2]||0} · M3 ${c[3]||0} · M4 ${c[4]||0} · ${Object.entries(TYPE).map(([k,v])=>`${v} ${ty[k]||0}`).join(' · ')}</p>`+
    (bt?`<button class="btn sm" id="bkAdd">+ Thêm câu ${isDe(bt)?'vào đề':'Mức '+addN} · ${esc(bt.title)}</button>`:'')+(td?bankTdTable(all):'');
  BK.cur=it.slice(0,BK.lim);
  $('#bkList').innerHTML=(BK.cur.length?BK.cur.map(bankCard).join(''):'<div class="tbox"><p>Không có câu nào khớp bộ lọc.</p></div>')+
    (it.length>BK.lim?`<button class="btn alt" id="bkMore">Xem thêm (còn ${it.length-BK.lim} câu)</button>`:'');
  typeset($('#bkList'));
  $('#bkAdd')&&($('#bkAdd').onclick=()=>{sfx.tap();bankAdd(bt,addN)});
  $('#bkMore')&&($('#bkMore').onclick=()=>{BK.lim+=25;bankList()});
  const td0=$('#trk details.bktd');td0&&(td0.ontoggle=()=>{BK.tdOpen=td0.open});
  $$('#trk [data-ta]').forEach(b=>b.onclick=()=>{sfx.tap();bankAdd(TOPICS.find(t=>t.id===b.dataset.ta),4)});
  const X=b=>BK.cur[+b.dataset.i];
  $$('#bkList [data-be]').forEach(b=>b.onclick=()=>{sfx.tap();const x=X(b);editQ(x.t,x.bi)});
  $$('#bkList [data-bo]').forEach(b=>b.onclick=()=>{sfx.tap();qedit(X(b).t)});
  $$('#bkList [data-bc]').forEach(b=>b.onclick=()=>{sfx.tap();bankCopy(X(b))});
  $$('#bkList [data-bd]').forEach(b=>b.onclick=()=>{const x=X(b);overlay(`<h2>Xóa câu này?</h2><p>Câu sẽ bị xóa khỏi <b>${esc(x.t.title)}</b>. Thầy có thể vào bài đó bấm "Hoàn tác lần lưu trước" nếu xóa nhầm.</p><button class="btn co" id="dy">Xóa</button><button class="btn alt" id="dn">Thôi</button>`);
    $('#dn').onclick=closeOvl;$('#dy').onclick=()=>saveText(x.t,x.t.raw.slice(0,x.b.start).replace(/[ \t]*\n?$/,'')+x.t.raw.slice(x.b.end),'Đã xóa câu.')})}
function bankCard(x,i){const {q,errors}=parseOne(x.b.raw);let q2=q;try{if(q)q2=instantiate(q)}catch(e){}
  return `<div class="tbox qrow${errors.length?' bad':''}"><div class="hqh"><span class="chip ${x.t.status}">${esc(x.t.title)}</span><span class="chip">${isDe(x.t)?'Đề ôn tập':'Mức '+x.n}</span><span class="chip nhap">${TYPE[x.b.type]}</span>${q&&q.params?'<span class="chip">có tham số</span>':''}${q&&q.hints?`<span class="chip">${q.hints.length} gợi ý</span>`:''}</div>
    ${errors.length?`<div class="err">${errors.map(esc).join('<br>')}</div>`:''}${q2?`<div class="stem">${tex(q2.stem)}</div><div class="vans">${answerHTML(q2)}</div>`:''}
    <div class="qbtn"><button class="btn sm" data-be data-i="${i}">✎ Sửa</button><button class="btn sm alt" data-bc data-i="${i}">Chép vào đề…</button><button class="btn sm alt" data-bo data-i="${i}">Mở bài</button><button class="btn sm alt" data-bd data-i="${i}">Xóa</button></div></div>`}
function bankTdTable(all){const ls=bankLessons(BK.k);if(!ls.length)return '';const tot={},m4={};all.forEach(x=>{if(isDe(x.t))return;tot[x.t.id]=(tot[x.t.id]||0)+1;if(x.n===4)m4[x.t.id]=(m4[x.t.id]||0)+1});
  const inK=t=>t.status==='giao'&&!t.errors.length&&inMoc(t),out=ls.filter(t=>!inK(t)).length;
  return `<details class="tbox bktd" ${BK.tdOpen?'open':''}><summary><b>Các bài của khối</b> <small>(${ls.length-out} bài trong kho${out?`, ${out} bài chưa vào kho`:''})</small></summary>
    ${ls.map(t=>`<div class="row2"><span>${esc(t.title)} <small>${inK(t)?`${tot[t.id]||0} câu · Mức 4: ${m4[t.id]||0}`:`chưa vào kho (${t.errors.length?'có lỗi':t.status!=='giao'?BK_ST[t.status]||t.status:'sau mốc chương'})`}</small></span><button class="btn sm${(m4[t.id]||0)<2?'':' alt'}" data-ta="${t.id}">+ Mức 4</button></div>`).join('')}</details>`}
/* tab Thi đấu: mốc chương + Kho Thi đấu theo chương */
const khoOf=k=>TOPICS.filter(t=>t.khoi===k&&isKho(t)).sort((a,b)=>(chapOf(a)||0)-(chapOf(b)||0)||a.order-b.order);
function tdTopHTML(k){const m=mocOf(k),ks=khoOf(k),cnt=t=>{const c=[0,0,0,0];t.levels.forEach((l,i)=>c[Math.min(3,Math.max(0,(Number(l.n)||i+1)-1))]+=l.qs.length);return c};
  const byCh={};ks.forEach(t=>{const c=chapOf(t)||0;(byCh[c]=byCh[c]||[]).push(t)});
  return `<div class="tbox"><b>Mốc Thi đấu khối ${k}</b><p class="tnote">Thi đấu chỉ ra câu của các chương đã học. Có mốc thì khoảng một nửa số câu mỗi trận thuộc chương mới học nhất. Bài chưa gắn chương luôn được dùng.</p>
    <div class="mocr"><select class="name" id="mocS"><option value="0">Chưa đặt mốc · mở mọi chương</option>${chapsOf(k).map(c=>c.hk?'<option disabled>──── Hết học kì I ────</option>':`<option value="${c.ch.n}" ${m===c.ch.n?'selected':''}>Đã học hết Chương ${c.ch.n}. ${esc(c.ch.title)}</option>`).join('')}</select><button class="btn sm" id="mocB">Lưu mốc</button></div></div>
   <div class="tbox"><b>Kho Thi đấu theo chương</b><p class="tnote">Câu chỉ dùng cho Thi đấu, không hiện trên bản đồ. Mỗi lần dán là một đợt mới ở trạng thái Nháp, thầy duyệt xong mới vào trận.</p>
    <div class="qbtn"><button class="btn sm" id="khoAdd">+ Dán câu Thi đấu</button></div>
    ${Object.keys(byCh).sort((a,b)=>a-b).map(c=>`<div class="khoc"><b>Chương ${c}. ${esc(chapTitle(k,+c))}</b>${m&&+c>m?' <small class="nmoc">sau mốc, chưa dùng</small>':''}
      ${byCh[c].map(t=>{const n=cnt(t);return `<div class="row2"><span>${esc(t.title.replace(/^Kho Thi đấu · Chương \d+\.?[^·]*·\s*/,''))}<br><small><span class="chip ${t.status}">${BK_ST[t.status]||t.status}${t.errors.length?' · có lỗi':''}</span> ${n.reduce((a,b)=>a+b,0)} câu · M1–2: ${n[0]+n[1]} · M3: ${n[2]} · M4: ${n[3]}</small></span>
        <span class="abtn">${t.status!=='giao'&&!t.errors.length?`<button class="btn sm" data-kg="${t.id}">Duyệt</button>`:''}<button class="btn sm alt" data-ke="${t.id}">Sửa</button></span></div>`}).join('')}</div>`).join('')||'<p class="tnote">Chưa có câu nào trong Kho Thi đấu.</p>'}</div>`}
function bindTdTop(k){
  $('#mocB').onclick=async()=>{const b=$('#mocB');if(b.disabled)return;b.disabled=true;const n=+$('#mocS').value;
    try{await DB.doc('settings/moc').update({khoi:k,chuong:n});MOC=Object.assign({},MOC);if(n)MOC[k]=n;else delete MOC[k];sfx.ok();toast(n?`Khối ${k}: Thi đấu dùng ${chRange(n)}.`:`Khối ${k}: Thi đấu mở mọi chương.`);bank(true)}
    catch(e){b.disabled=false;msgBox('Chưa lưu được',esc(e.message))}};
  $('#khoAdd').onclick=()=>{sfx.tap();pasteKho(k)};
  $$('#trk [data-kg]').forEach(b=>b.onclick=async()=>{const t=TOPICS.find(x=>x.id===b.dataset.kg);if(!t||b.disabled)return;b.disabled=true;
    try{await DB.doc('topics/'+t.id).update({trangthai:'giao',capnhat:new Date().toISOString()});sfx.ok();toast('Đã duyệt, câu đã vào kho Thi đấu.')}catch(e){b.disabled=false;msgBox('Chưa lưu được',esc(e.message))}});
  $$('#trk [data-ke]').forEach(b=>b.onclick=()=>{sfx.tap();const t=TOPICS.find(x=>x.id===b.dataset.ke);if(t)tOpts(t)})}
function pasteKho(k){const m=mocOf(k),chs=chapsOf(k).filter(c=>c.ch);
  overlay(`<h2 style="font-size:24px">Dán câu Thi đấu</h2><p class="tnote">Khối ${k}. Dán các câu (\\man{3}, \\man{4} và \\begin{ex}…). Không có \\man thì app coi tất cả là Mức 4. Đợt mới ở trạng thái <b>Nháp</b>.</p>
    <label>Chương<select class="name" id="kcS">${chs.map(c=>`<option value="${c.ch.n}" ${(m||1)===c.ch.n?'selected':''}>Chương ${c.ch.n}. ${esc(c.ch.title)}</option>`).join('')}</select></label>
    <textarea class="code" id="kcT" spellcheck="false" placeholder="\\man{4}{Vận dụng cao}&#10;\\begin{ex}&#10;...&#10;\\end{ex}"></textarea><div id="kcE"></div>
    <button class="btn" id="kcB">Kiểm tra và tạo đợt nháp</button><button class="btn alt" id="kcC">Hủy</button>`);
  $('#kcC').onclick=closeOvl;
  $('#kcB').onclick=async()=>{const er=x=>{$('#kcE').innerHTML=`<div class="err">${x}</div>`};let body=cleanPaste($('#kcT').value).replace(/^\s*\\chude\s*\{[^}]*\}\s*/,'');
    if(!body)return er('Thầy dán câu hỏi vào ô trên.');
    if(/\\begin\{lythuyet\}/.test(body))return er('Kho Thi đấu không cần phần lý thuyết, thầy bỏ khối lythuyet đi.');
    if(/\\begin\{extl\}/.test(body))return er('Câu tự luận (extl) không dùng được trong Thi đấu.');
    if(!/\\man\s*\{/.test(body))body='\\man{4}{Vận dụng cao}\n'+body;
    const n=+$('#kcS').value,d=khoOf(k).filter(t=>chapOf(t)===n).length+1,title=`Kho Thi đấu · Chương ${n}. ${chapTitle(k,n)} · đợt ${d}`.replace(/[{}\\]/g,'');
    const text=`\\chude{${title}}\n\n${body}\n`,P=parseTopic(text);if(P.errors.length)return er(P.errors.map(esc).join('<br>'));
    const nq=P.levels.reduce((a,l)=>a+l.qs.length,0);if(!nq)return er('Chưa thấy câu hỏi nào.');
    $('#kcB').disabled=true;
    try{await DB.collection('topics').doc().set({title,khoi:k,phan:'thi-dau',chuong:`k${k}-c${n}`,text,thutu:n*100+d,nguon:'Dán câu Thi đấu (giáo viên)'});
      closeOvl();sfx.ok();toast(`Đã tạo đợt ${d} chương ${n}: ${nq} câu (nháp).`);bank(true)}
    catch(e){$('#kcB').disabled=false;er(esc(e&&e.message||'Lỗi kết nối'))}}}
function bankAdd(t,n){if(!t)return;const m=qBlocks(t.raw).find(b=>b.man&&Number(b.n)===n);
  if(m)editQ(t,null,m.lv);else editQ(t,null,`\\man{${n}}{${BK_MAN[n]||'Mức '+n}}`)}
function bankCopy(x){const des=bankDes(x.t.khoi).filter(d=>d!==x.t);
  overlay(`<h2>Chép câu vào đề ôn tập</h2><p>Chọn đề khối ${x.t.khoi}. Câu được thêm vào cuối đề, bài gốc giữ nguyên.</p>
    ${des.map((d,i)=>`<button class="btn alt" data-cd="${i}">${esc(d.title)} <small>(${BK_ST[d.status]||''})</small></button>`).join('')||'<p class="tnote">Khối này chưa có đề ôn tập nào.</p>'}
    <button class="btn" id="cNew">+ Tạo đề mới rồi chép vào</button><button class="btn alt" id="cC">Hủy</button>`);
  $('#cC').onclick=closeOvl;$('#cNew').onclick=()=>bankNewDe(x.t.khoi,d=>bankPaste(x,d));
  $$('#panel [data-cd]').forEach(b=>b.onclick=()=>bankPaste(x,des[+b.dataset.cd]))}
function bankPaste(x,d){const blk=x.b.raw.trim();if(d.raw.includes(blk)){closeOvl();return toast('Câu này đã có trong đề.')}
  const text=d.raw.replace(/\s*$/,'')+'\n\n'+blk+'\n';if(parseTopic(text).errors.length>d.errors.length)return msgBox('Chưa chép được','Chép câu này làm đề phát sinh lỗi.');
  saveText(d,text,'Đã chép vào '+esc(d.title)+'.')}
function bankNewDe(k,then){overlay(`<h2>Tạo đề ôn tập mới</h2><div class="form"><label>Tên đề<input class="name" id="nT" placeholder="Ví dụ: Đề ôn giữa học kì I số 1"></label>
    <label>Khối<select class="name" id="nK">${KHOI.map(x=>`<option ${x===k?'selected':''}>${x}</option>`).join('')}</select></label>
    <label>Loại đề<select class="name" id="nL"><option value="tn">Phần 1 · Trắc nghiệm (TN)</option><option value="tl">Phần 2 · Tự luận (TL)</option></select></label><div id="nE"></div>
    <button class="btn" id="nS">Tạo đề (nháp)</button><button class="btn alt" id="nC">Hủy</button></div>`);
  $('#nC').onclick=closeOvl;$('#nS').onclick=async()=>{const title=$('#nT').value.trim(),khoi=$('#nK').value;if(!title){$('#nE').innerHTML='<div class="err">Thầy nhập tên đề.</div>';return}
    $('#nS').disabled=true;try{const tl=$('#nL').value==='tl',r=await DB.collection('topics').doc().set({title,khoi,phan:'on-tap',...(tl?{text:`\\chude{${title.replace(/[{}\\]/g,'')}}\n\n\\man{1}{Đề}\n${QT.extl}\n`}:{})});const d=r&&TOPICS.find(t=>t.id===r.id);
      if(then&&d){then(d);return}closeOvl();sfx.ok();toast('Đã tạo đề '+esc(title)+'.');BK.tab='de';BK.k=khoi;bank()}catch(e){$('#nS').disabled=false;$('#nE').innerHTML=`<div class="err">${esc(e&&e.message||'Lỗi kết nối')}</div>`}}}
function bankDeHTML(){const des=bankDes(BK.k);
  return `<div class="tbox"><b>Đề ôn tập khối ${BK.k}</b><p class="tnote">Đề mới ở trạng thái Nháp. Ghép đề bằng nút <b>Chép vào đề…</b> ở thẻ Tất cả câu hoặc Thi đấu, hoặc mở đề để soạn câu mới.</p><div class="qbtn"><button class="btn sm" id="bkNew">+ Tạo đề mới</button></div></div>`+
   (des.length?des.map((t,i)=>{const ty={};qBlocks(t.raw).filter(b=>!b.man).forEach(b=>ty[b.type]=(ty[b.type]||0)+1);const n=Object.values(ty).reduce((s,v)=>s+v,0);
     return `<div class="tbox"><div class="hqh"><span class="chip ${t.status}">${BK_ST[t.status]||t.status}${t.errors.length?' · lỗi':''}</span></div><b>${esc(t.title)}</b>
       <p class="tnote">${n} câu${n?' · '+Object.entries(ty).map(([k,v])=>TYPE[k]+' '+v).join(' · '):''}</p>
       <div class="qbtn"><button class="btn sm" data-dq="${i}">Sửa câu hỏi</button><button class="btn sm alt" data-dl="${i}">Xem dạng danh sách</button><button class="btn sm alt" data-ds="${i}">⚙ Cài đặt</button></div></div>`}).join('')
   :`<div class="tbox"><p>Khối ${BK.k} chưa có đề ôn tập nào.</p></div>`)}
function bindDe(){const des=bankDes(BK.k);$('#bkNew').onclick=()=>{sfx.tap();bankNewDe(BK.k)};
  $$('#trk [data-dq]').forEach(b=>b.onclick=()=>{sfx.tap();qedit(des[+b.dataset.dq])});
  $$('#trk [data-dl]').forEach(b=>b.onclick=()=>{sfx.tap();BK.tab='all';BK.bai=des[+b.dataset.dl].id;BK.man='';BK.lim=25;bank()});
  $$('#trk [data-ds]').forEach(b=>b.onclick=()=>{sfx.tap();tOpts(des[+b.dataset.ds])})}

/* ---------- đồng bộ dữ liệu cá nhân ---------- */
let syncT=null,wq=Promise.resolve();
function syncMine(){if(!DB||!ACC||ACC.teacher||DBSTATE!=='ok')return;clearTimeout(syncT);syncT=setTimeout(()=>{syncT=null;pushMine()},1200)}
function pushMine(){if(!DB||!ACC||ACC.teacher||DBSTATE!=='ok')return;wq=wq.then(async()=>{const lim=addDays(vnDay(),-30),w={};for(const [k,v] of Object.entries(P.wst||{}))if(v.d>=lim)w[k]=v;
  const doc={name:ACC.name,khoi:ACC.khoi,nick:P.nick||'',avatar:P.avatar||0,xp:P.xp||0,lp:P.lp||0,matches:P.matches||0,hist:P.hist||[],st:P.st||{},stats:P.stats,ach:P.ach,
    best:Object.fromEntries(Object.entries(P.best).map(([k,s])=>[k,{st:s,s:P.score[k]||0,t:P.pt[k]||null}])),rev:P.rev,saved:P.saved,wst:w,eq:P.eq||{},own:P.own||{},spent:P.spent||0,dq:P.dq,wk:P.wk||{},season:P.season||'',seasons:P.seasons||[],fails:P.fails||{},lvt:P.lvt||{},ccl:P.ccl||{},tut:P.tut||0,follow:P.follow||{},fseen:P.fseen||'',rseen:P.rseen||{},tlh:P.tlh||{},lpd:P.lpd||null,capnhat:new Date().toISOString()};
  await DB.doc('players/'+ACC.id).set(doc)}).catch(()=>{})}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&syncT){clearTimeout(syncT);syncT=null;pushMine()}});
function mergeP(d){
  if(d.rev&&Object.keys(d.rev).length>Object.keys(P.rev||{}).length)P.rev=d.rev;
  if(d.saved&&Object.keys(d.saved).length>Object.keys(P.saved||{}).length)P.saved=d.saved;
  if(d.st&&(d.st.last_day||'')>(P.st.last_day||''))P.st=d.st;
  for(const f of ['xp','lp','matches'])if((d[f]||0)>(P[f]||0)&&!(f==='lp'&&d.season&&P.season&&d.season!==P.season))P[f]=d[f];
  if(d.lpd&&d.lpd.d===vnDay()&&(!P.lpd||P.lpd.d!==d.lpd.d||(d.lpd.g||0)>(P.lpd.g||0)))P.lpd=d.lpd;
  if(d.hist&&d.hist.length>(P.hist||[]).length)P.hist=d.hist;
  if(d.nick&&!P.nick)P.nick=d.nick;if(d.avatar!=null&&!P.avatar)P.avatar=d.avatar;
  if(d.ach)for(const [k,v] of Object.entries(d.ach))if(!P.ach[k])P.ach[k]=v;
  if(d.stats)for(const [k,v] of Object.entries(d.stats))if((v||0)>(P.stats[k]||0))P.stats[k]=v;
  if(d.best)for(const [k,b] of Object.entries(d.best)){if((b.st||0)>(P.best[k]||0))P.best[k]=b.st;if((b.s||0)>(P.score[k]||0))P.score[k]=b.s;if(b.t&&!P.pt[k])P.pt[k]=b.t}
  if(d.own)for(const [k,v] of Object.entries(d.own))if(!P.own[k])P.own[k]=v;
  if((d.spent||0)>(P.spent||0))P.spent=d.spent;if(d.eq&&!Object.keys(P.eq||{}).length)P.eq=d.eq;
  if(d.wk&&d.wk.w&&(!P.wk||!P.wk.w||d.wk.w>P.wk.w||(d.wk.w===P.wk.w&&(d.wk.xp||0)>(P.wk.xp||0))))P.wk=d.wk;
  if(d.dq&&d.dq.d===vnDay()&&(!P.dq||P.dq.d!==d.dq.d))P.dq=d.dq;
  if(d.season&&!P.season)P.season=d.season;if(d.seasons&&d.seasons.length>(P.seasons||[]).length)P.seasons=d.seasons;
  for(const f of ['fails','lvt','ccl'])if(d[f])for(const [k,v] of Object.entries(d[f]))if(!P[f][k])P[f][k]=v;
  if(d.tut)P.tut=1;if(d.follow&&!Object.keys(P.follow||{}).length)P.follow=d.follow;if((d.fseen||'')>(P.fseen||''))P.fseen=d.fseen;
  if(d.tlh){P.tlh=P.tlh||{};for(const [k,v] of Object.entries(d.tlh))if((v||0)>(P.tlh[k]||0))P.tlh[k]=v}
  if(d.rseen){P.rseen=P.rseen||{};for(const [k,v] of Object.entries(d.rseen)){const a=+String(v).split('|')[0],b=+String(P.rseen[k]||'').split('|')[0];if(P.rseen[k]==null||a>b)P.rseen[k]=v}}
  save()}

/* ---------- mở đầu ---------- */
if(window.__TEST)window.__T={get G(){return G},cur};
$('#imas').innerHTML=owlSVG;$('#brand').innerHTML=[...$('#brand').textContent].map((c,i)=>c==='|'?'<br>':`<span style="animation-delay:${.3+i*.04}s">${c===' '?'&nbsp;':c}</span>`).join('');
let started=false;
function start(){started=true;const a=store.get('ltt:acc',null);
  if(a&&(a.teacher?TEACHER:ACCS.some(x=>x.id===a.id))){enter(ACCS.find(x=>x.id===a.id)||a,false)}else if(DBSTATE==='ok'||DBSTATE==='off')login();else login()}
$('#intro').onclick=()=>{sfx.win();start()};
function refresh(){const on=$$('.scr.on')[0]?.id;
  if(on==='login'&&!$('#lName')?.value)login();else if(on==='grades')grades();else if(on==='subj')subjects();else if(on==='shop')shop();else if(on==='friends'&&!$('#fq'))friends();else if(on==='area')area();else if(on==='journey')journey();else if(on==='theory'&&thT){const x=TOPICS.find(y=>y.id===thT.id);if(x)theory(x)}else if(on==='ontap')onTap();else if(on==='tlde'&&tlT){const x=TOPICS.find(y=>y.id===tlT.id);if(x)tlDe(x)}else if(on==='redo')redo();else if(on==='ranked')ranked();else if(on==='board')board();
}
(async()=>{if(!window.claude||!claude.use){DBSTATE='off';refresh();return}
  const tm=setTimeout(()=>{if(DBSTATE==='loading'){DBSTATE='slow';refresh()}},10000);
  try{const u=await claude.use('user');TEACHER=!!(u&&await u.canEdit())}catch(e){}
  DB=await claude.use('db');if(!DB){clearTimeout(tm);DBSTATE='off';refresh();return}
  let got=0;const ready=()=>{if(++got===3){clearTimeout(tm);DBSTATE='ok';const a=store.get('ltt:acc',null);if(started&&!ACC&&a&&(a.teacher?TEACHER:ACCS.some(x=>x.id===a.id)))enter(ACCS.find(x=>x.id===a.id)||a,false);else refresh()}};
  DB.collection('topics').onSnapshot(s=>{TOPICS=s.docs.filter(d=>d.exists).map(fromDoc);if(got<3)ready();else if(QE&&$$('.scr.on')[0]?.id==='track'&&!$('#ovl').classList.contains('on'))qedit(TOPICS.find(x=>x.id===QE)||{id:QE,raw:'',errors:[],title:''});else refresh()},()=>{DBSTATE='off';refresh()});
  DB.collection('accounts').onSnapshot(s=>{ACCS=s.docs.filter(d=>d.exists).map(d=>({...d.data(),id:d.id}));if(got<3)ready();else{const on=$$('.scr.on')[0]?.id;if(on==='track'&&$('#trTitle').textContent.startsWith('Tài khoản'))accounts();else if(on==='subj')subjects()}},()=>{});
  let pl0=true;DB.collection('players').onSnapshot(s=>{PLAYERS=s.docs.filter(d=>d.exists).map(d=>({...d.data(),id:d.id}));if(pl0){pl0=false;if(ACC&&!ACC.teacher){const d=PLAYERS.find(x=>x.id===ACC.id);if(d)mergeP(d)}ready();return}const on=$$('.scr.on')[0]?.id;if(on==='board')board();else if(on==='track'&&$('#trTitle').textContent.startsWith('Theo dõi'))track()},()=>{});
  DB.collection('assignments').onSnapshot(s=>{ASG=s.docs.filter(d=>d.exists).map(d=>({...d.data(),id:d.id}));const on=$$('.scr.on')[0]?.id;if(['area','journey','ontap'].includes(on))refresh()},()=>{})})();
}
</script>
</body>
</html>
