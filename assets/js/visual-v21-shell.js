// FROMBOS V21 — visual shell enhancer.
// Presentation only: reads local workspace state and module metadata, never mutates competitive data.
import { MODULES } from './data.js';
import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const modFor=id=>MODULES.find(m=>m.id===id)||MODULES[0];

function enhanceBrand(){
  const brand=document.querySelector('.brand');
  if(!brand||brand.dataset.v21==='1') return;
  brand.dataset.v21='1';
  const oldMark=brand.querySelector('.brand-mark');
  if(oldMark) oldMark.outerHTML='<div class="v21-brand-symbol" aria-hidden="true"><span>F</span></div>';
  const copy=brand.querySelector('div:last-child');
  if(copy){
    copy.classList.add('v21-brand-copy');
    const small=copy.querySelector('small');
    if(small) small.textContent='Competitive Systems';
  }
}

function enhanceNav(){
  document.querySelectorAll('.nav-item').forEach(item=>{
    if(item.dataset.v21==='1') return;
    item.dataset.v21='1';
    const id=item.dataset.route||'';
    const mod=modFor(id);
    item.setAttribute('aria-label',mod?.label||id);
    item.title=mod?.label||id;
  });
}

function ensureTopStatus(){
  const top=document.querySelector('.topbar .top-actions');
  if(!top||top.querySelector('.v21-top-status')) return;
  const d=store.state?.draft||{};
  const wrap=document.createElement('div');
  wrap.className='v21-top-status';
  wrap.innerHTML=`
    <span class="v21-status-chip is-live"><i class="v21-status-dot"></i>workspace <b>ativo</b></span>
    <span class="v21-status-chip">game <b>G${Number(d.game||1)}</b></span>
    <span class="v21-status-chip">fearless <b>${d.fearless?'ON':'OFF'}</b></span>`;
  top.prepend(wrap);
}

function routeMeta(page){
  const d=store.state?.draft||{};
  const team=store.state?.team||{};
  const configured=Object.values(team.players||{}).filter(p=>p?.name||p?.pool?.length).length;
  return [
    ['time',team.name||'workspace'],
    ['roster',`${configured}/5`],
    ['game',`G${Number(d.game||1)}`],
    ...(page==='draft'||page==='series'?[['fearless',d.fearless?'ON':'OFF']]:[])
  ];
}

function ensureRouteStrip(){
  const page=route();
  if(page==='home') return;
  const content=document.querySelector('.content');
  const head=content?.querySelector(':scope > .page-head');
  if(!content||!head||content.querySelector(':scope > .v21-route-strip')) return;
  const mod=modFor(page);
  const strip=document.createElement('div');
  strip.className='v21-route-strip';
  strip.innerHTML=`
    <div class="v21-route-path"><span>${mod.group}</span><i></i><b>${mod.label}</b></div>
    <div class="v21-route-meta">${routeMeta(page).map(([k,v])=>`<span>${k} <strong>${String(v).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]))}</strong></span>`).join('')}</div>`;
  head.after(strip);
}

function enhanceHome(){
  if(route()!=='home') return;
  const hero=document.querySelector('.content > .hero');
  if(!hero||hero.dataset.v21==='1') return;
  hero.dataset.v21='1';
  const lead=hero.firstElementChild;
  if(lead&&!lead.querySelector('.v21-home-kicker')){
    const kicker=document.createElement('div');
    kicker.className='v21-home-kicker eyebrow';
    kicker.textContent='MATCH PREP / DRAFT / ANALYSIS / REVIEW';
    lead.prepend(kicker);
  }
}

function scope(){
  const page=route();
  document.body.classList.add('v21-ready');
  document.body.dataset.v21Page=page;
  const content=document.querySelector('.content');
  if(content) content.dataset.page=page;
}

function apply(){
  scope();
  enhanceBrand();
  enhanceNav();
  ensureTopStatus();
  ensureRouteStrip();
  enhanceHome();
}

const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe){
  runtime.subscribe(apply);
}else{
  let queued=false;
  const schedule=()=>{
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  };
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('load',schedule);
}

window.addEventListener('hashchange',()=>queueMicrotask(apply));
queueMicrotask(apply);
window.FROMBOS_VISUAL_V21={apply};
