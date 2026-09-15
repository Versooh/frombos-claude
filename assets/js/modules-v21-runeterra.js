// FROMBOS V21.2 — module presentation controller.
// No competitive metrics are created. Runtime-only UI state is not evidence.

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
let clock={elapsed:0,running:false,last:0,raf:0};

function fmt(seconds){const s=Math.max(0,Math.floor(seconds));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function renderClock(){const el=document.querySelector('.fb-draft-clock-display');if(el)el.textContent=fmt(clock.elapsed);}
function tick(now){if(!clock.running)return; if(!clock.last)clock.last=now;clock.elapsed+=(now-clock.last)/1000;clock.last=now;renderClock();clock.raf=requestAnimationFrame(tick);}
function startClock(){if(clock.running)return;clock.running=true;clock.last=0;clock.raf=requestAnimationFrame(tick);}
function pauseClock(){clock.running=false;clock.last=0;cancelAnimationFrame(clock.raf);}
function resetClock(){pauseClock();clock.elapsed=0;renderClock();}

function enhanceDraft(){
  if(route()!=='draft')return;const head=document.querySelector('.draft-stage-head');if(!head||head.querySelector('.fb-draft-clock'))return;
  const wrap=document.createElement('div');wrap.className='fb-draft-clock';wrap.innerHTML='<small>CRONÔMETRO LOCAL</small><span class="fb-draft-clock-display">00:00</span><button type="button" data-fb-clock="start" title="Iniciar">▶</button><button type="button" data-fb-clock="pause" title="Pausar">Ⅱ</button><button type="button" data-fb-clock="reset" title="Zerar">↺</button>';
  head.appendChild(wrap);wrap.querySelector('[data-fb-clock="start"]').onclick=startClock;wrap.querySelector('[data-fb-clock="pause"]').onclick=pauseClock;wrap.querySelector('[data-fb-clock="reset"]').onclick=resetClock;renderClock();
}

function enhanceTactical(){
  if(route()!=='tactical')return;const shell=document.querySelector('.tactical-shell');if(!shell||shell.querySelector('.fb-tactical-views'))return;
  shell.dataset.fbView='coach';const controls=document.createElement('div');controls.className='fb-tactical-views';controls.innerHTML='<div><button type="button" class="is-active" data-fb-tactical-view="coach">Coach View</button><button type="button" data-fb-tactical-view="map">Map View</button><button type="button" data-fb-tactical-view="vision">Vision View</button></div><small>Mapa e geometria preservados · ranges visuais = BOARD_VISUAL</small>';
  shell.prepend(controls);controls.querySelectorAll('[data-fb-tactical-view]').forEach(btn=>btn.onclick=()=>{shell.dataset.fbView=btn.dataset.fbTacticalView;controls.querySelectorAll('button').forEach(x=>x.classList.toggle('is-active',x===btn));});
  const labels={select:'Select',champion:'Champion',ward:'Ward',control:'Control Ward',arrow:'Arrow',pen:'Path',zone:'Zone',text:'Text',objective:'Objective',eraser:'Eraser'};
  shell.querySelectorAll('[data-tool]').forEach(btn=>{const label=labels[btn.dataset.tool];const b=btn.querySelector('b');if(label&&b)b.textContent=label;});
}

function enhanceVod(){
  if(route()!=='vod')return;const tools=document.querySelector('.vod-tools');if(!tools||tools.querySelector('.fb-vod-modebar'))return;
  const bar=document.createElement('div');bar.className='fb-vod-modebar';bar.innerHTML='<button type="button" class="is-active">Player</button><button type="button" data-fb-vod-jump="notes">Notas</button><button type="button" data-fb-vod-jump="drills">Drills</button><button type="button" data-fb-vod-jump="timeline">Timeline</button>';
  tools.prepend(bar);bar.querySelector('[data-fb-vod-jump="notes"]')?.addEventListener('click',()=>document.querySelector('.vod-note-entry')?.scrollIntoView({behavior:'smooth',block:'center'}));bar.querySelector('[data-fb-vod-jump="timeline"]')?.addEventListener('click',()=>document.querySelector('.vod-timeline')?.scrollIntoView({behavior:'smooth',block:'start'}));bar.querySelector('[data-fb-vod-jump="drills"]')?.addEventListener('click',()=>{location.hash='#/training';});
}

function enhanceScouting(){
  if(route()!=='scouting')return;const root=document.querySelector('.scouting-war-room');if(!root||root.dataset.fbV21==='1')return;root.dataset.fbV21='1';root.querySelector('.scout-command')?.setAttribute('aria-label','Scouting War Room');root.querySelector('.scout-unknown')?.setAttribute('aria-label','Unknowns de scouting sem evidência suficiente');
}

function enhanceTraining(){
  if(route()!=='training')return;const root=document.querySelector('.performance-center');if(!root||root.dataset.fbV21==='1')return;root.dataset.fbV21='1';root.querySelectorAll('.vod-training-drill').forEach(card=>card.setAttribute('aria-label','Drill de correção vinculado a evidência VOD'));
}
function enhanceReports(){if(route()!=='reports')return;document.querySelector('.reports-center')?.setAttribute('data-fb-v21','1');}
function enhanceComps(){if(route()!=='comps')return;document.querySelector('.comp-toolbar-v20')?.setAttribute('aria-label','Filtros do Composition Lab');}

function apply(){enhanceDraft();enhanceTactical();enhanceVod();enhanceScouting();enhanceTraining();enhanceReports();enhanceComps();}
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(apply);else window.addEventListener('load',apply);
window.addEventListener('hashchange',()=>{if(route()!=='draft')resetClock();queueMicrotask(apply);});
queueMicrotask(apply);
window.FROMBOS_MODULES_V21={apply,clock:{start:startClock,pause:pauseClock,reset:resetClock}};
