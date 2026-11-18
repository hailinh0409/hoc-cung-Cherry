const star=on=>`<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill="${on?'#ffd23f':'#0004'}" stroke="${on?'#d6a90b':'#fff3'}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
const stars=(n,of=3)=>`<span class="stars">${Array.from({length:of},(_,k)=>star(k<n)).join('')}</span>`;
const heart=`<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11.2C4 6.5 6.5 4 9.3 4c1.2 0 2.1.5 2.7 1.3C12.6 4.5 13.5 4 14.7 4 17.5 4 20 6.5 20 9.8 20 15.7 12 21 12 21z" fill="#ff5d6c" stroke="#fff" stroke-width="1.5"/></svg>`;
const backIco=`<svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
