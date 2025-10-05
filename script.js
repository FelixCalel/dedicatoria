// Helpers
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const rand = (min,max)=> Math.random()*(max-min)+min;

// Refs
const entryScreen = $('#entry-screen');
const enterBtn = $('#enter-btn');
const music = $('#background-music');
const canvas = $('#interactive-bg');
const ctx = canvas.getContext('2d');
const snap = $('#snap-container');
const btnScroll = $('#btnScroll');
const lyricsContainer = $('#lyrics-container');

// Resize canvas
function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resizeCanvas, {passive:true}); resizeCanvas();

// Dots
const dots = Array.from({length: 80}).map(()=> ({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, r:Math.random()*1.8+.4 }));
function drawDots(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for(const d of dots){
    d.x+=d.vx; d.y+=d.vy;
    if(d.x<0||d.x>canvas.width) d.vx*=-1;
    if(d.y<0||d.y>canvas.height) d.vy*=-1;
    ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(drawDots);
}
drawDots();

// Entry actions
function startExperience(){
  // Oculta solo el cartel; el resto ya está debajo con scroll-snap
  entryScreen.style.display='none';
  if(music.paused){ music.play().catch(()=>{}); }
  initLyrics();
}
enterBtn.addEventListener('click', (e)=>{ e.stopPropagation(); startExperience(); });
entryScreen.addEventListener('click', (e)=>{
  if(e.target.id==='enter-btn') return;
  startExperience();
});

// Scroll to dedicatoria
btnScroll?.addEventListener('click', ()=> { 
  document.getElementById('dedicatoria').scrollIntoView({behavior:'smooth', block: 'start'}); 
});

// Hearts
function spawnHeart(x,y){
  const h = document.createElement('div');
  h.className='heart';
  h.style.left = x+'px'; h.style.top = y+'px';
  h.style.setProperty('--dx', `${rand(-80,80)}px`);
  h.style.setProperty('--dy', `${rand(-120,-50)}px`);
  document.body.appendChild(h);
  setTimeout(()=>h.remove(), 1300);
}
function burst(x,y,n=14){ for(let i=0;i<n;i++) setTimeout(()=>spawnHeart(x+rand(-8,8), y+rand(-8,8)), i*45); }
let lastTap=0;
addEventListener('pointerdown', e=>{
  const tag=(e.target.tagName||'').toLowerCase();
  if(['button','a','audio'].includes(tag)) return;
  const x = e.clientX ?? e.touches?.[0]?.clientX; const y = e.clientY ?? e.touches?.[0]?.clientY; if(x==null||y==null) return;
  const now=Date.now(); if(now-lastTap<300){ burst(x,y); } else { spawnHeart(x,y); } lastTap=now;
},{passive:true});

// Reveal on scroll (IntersectionObserver)
const io = new IntersectionObserver((entries)=>{
  for(const e of entries){ if(e.isIntersecting) e.target.classList.add('visible'); }
},{ threshold:.15 });
$$('.reveal').forEach(el=> io.observe(el));

// Lyrics sync
const LYRICS = [
  { time: 5,  text: "No tengo un registro de días más brillantes" },
  { time: 9,  text: "Tu luz está sobre mí, puedo decir" },
  { time: 13, text: "No tengo parte, no tengo líneas" },
  { time: 17, text: "Pero te tengo a ti, y tú a mí, cariño" },
  { time: 25, text: "El agua está mojada y la luz es ligera" },
  { time: 29, text: "Me enojé y ahora estoy bien" },
  { time: 33, text: "Cuando llego a casa, cuando me calmo" },
  { time: 37, text: "Te tengo a ti, y tú a mí, cariño" },
  { time: 45, text: "Descansos de verano, tormentas de invierno" },
  { time: 49, text: "No me importa seguir adelante" },
  { time: 53, text: "Mientras vamos, viviendo, contentos de ser" },
  { time: 57, text: "Bueno, te tendré a ti, y tú a mí, cariño" }
];

function initLyrics(){
  lyricsContainer.innerHTML='';
  LYRICS.forEach((l,i)=>{
    const p=document.createElement('p'); p.id='line-'+i; p.textContent=l.text; lyricsContainer.appendChild(p);
  });
  let current=-1;
  function raf(){
    const t=music.currentTime||0; let idx=-1;
    for(let i=0;i<LYRICS.length;i++){ if(t>=LYRICS[i].time) idx=i; }
    if(idx!==-1 && idx!==current){
      current=idx;
      const all = $$('#lyrics-container p');
      all.forEach((el,i)=> el.classList.toggle('active', i===current));
      const active = $('#lyrics-container p.active');
      if(active){ lyricsContainer.scrollTo({ top: active.offsetTop-16, behavior:'smooth' }); }
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}
