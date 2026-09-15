// FROMBOS V24 — Tactical Editorial presentation controller
// Visual only. Does not mutate store, evidence, draft state, tactical geometry or competitive data.
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const preferredHome=['Jinx','Ahri','Kai\'Sa','Akali','Irelia','Riven','Yasuo'];
const asset=name=>CHAMPION_REGISTRY?.[name]||Object.values(CHAMPION_REGISTRY||{}).find(x=>x?.name===name)||null;
const clean=v=>String(v||'').trim();
const selectedChampion=()=>{
  const q=new URLSearchParams(location.hash.split('?')[1]||'');
  return clean(q.get('champion'))||clean(document.querySelector('[data-ci-champion].active,[data-ci-champion][aria-pressed="true"]')?.dataset.ciChampion)||'';
};
function homeChampion(){
  for(const name of preferredHome){const a=asset(name);if(a?.splash)return a;}
  return Object.values(CHAMPION_REGISTRY||{}).find(x=>x?.splash)||null;
}
function setSrc(img,src,name,priority=false){
  if(!img||!src)return;
  if(img.dataset.v24Src!==src){img.src=src;img.dataset.v24Src=src;}
  if(name)img.alt=name;
  img.decoding='async';img.referrerPolicy='no-referrer';
  if(priority){img.loading='eager';try{img.fetchPriority='high';}catch{}}
  else img.loading='lazy';
}
function applyRoute(){
  document.documentElement.style.colorScheme='light';
  document.body.classList.add('v24-editorial');
  document.body.dataset.v24Route=route();
}
function applyHome(){
  if(route()!=='home')return;
  const hero=document.querySelector('.content[data-page="home"] .hero');if(!hero)return;
  const a=homeChampion();if(a?.splash){hero.style.setProperty('--v24-home-art',`url("${String(a.splash).replace(/"/g,'%22')}")`);hero.dataset.v24Champion=a.name||'';}
  let source=hero.querySelector('.v24-hero-source');
  if(!source){source=document.createElement('span');source.className='v24-hero-source';hero.appendChild(source);}
  source.textContent=a?.name?`${a.name} · arte oficial Wild Rift`:'Arte oficial Wild Rift';
}
function championFromNode(node){
  if(!node)return'';
  return clean(node.dataset?.ciChampion)||clean(node.dataset?.champ)||clean(node.dataset?.champion)||clean(node.getAttribute?.('data-champion'))||clean(node.querySelector?.('b')?.textContent);
}
function upgradeChampionCards(){
  document.querySelectorAll('.ci-card[data-ci-champion]').forEach(card=>{const name=clean(card.dataset.ciChampion),a=asset(name);if(a?.portrait)setSrc(card.querySelector('img'),a.portrait,name);card.dataset.v24Media='portrait';});
  document.querySelectorAll('.draft-champ-card[data-champ],#tbChampGrid .tb-champ[data-champion]').forEach(card=>{const name=championFromNode(card),a=asset(name);if(a?.portrait)setSrc(card.querySelector('img'),a.portrait,name);});
  document.querySelectorAll('.champ-slot,.matchup-champ-pill,.pool-list .chip').forEach(node=>{const name=championFromNode(node);if(!name||name==='—')return;const a=asset(name);if(a?.portrait)setSrc(node.querySelector('img'),a.portrait,name);});
}
function upgradeChampionHero(){
  const name=selectedChampion();if(!name)return;const a=asset(name);if(!a)return;
  document.querySelectorAll('.ci-detail-portrait,.lab-portrait').forEach(img=>a.portrait&&setSrc(img,a.portrait,name,true));
  document.querySelectorAll('.ci-hero').forEach(hero=>{if(a.splash){hero.style.setProperty('--v24-champion-splash',`url("${String(a.splash).replace(/"/g,'%22')}")`);hero.dataset.v24Champion=name;}});
  document.querySelectorAll('.lab-hero').forEach(hero=>{if(a.splash){hero.style.setProperty('--v24-champion-splash',`url("${String(a.splash).replace(/"/g,'%22')}")`;}});
}
function normalizeEmptyDraftSlots(){
  document.querySelectorAll('.dr-slot-copy,.draft-slot-copy').forEach(copy=>{
    const text=clean(copy.textContent);if(!text||/^(empty|vazio|selecione|select champion)$/i.test(text)){copy.dataset.v24Empty='1';copy.setAttribute('aria-label','Slot vazio');}
  });
}
function markDossierModules(){
  document.querySelectorAll('.content .card,.content .panel').forEach((el,index)=>{if(el.dataset.v24Dossier)return;el.dataset.v24Dossier=String(index+1);});
  document.querySelectorAll('.v23-function-link').forEach(btn=>{btn.dataset.v24DossierTab='1';});
}
function improveMapPresentation(){
  const board=document.querySelector('#tbBoard');if(!board)return;board.dataset.v24ExactMap='preserved';
  const image=document.querySelector('#tbMapImage');if(image){image.setAttribute('preserveAspectRatio','xMidYMid meet');image.dataset.v24MapMedia='enhanced-presentation-only';}
}
function labelPage(){
  const head=document.querySelector('.page-head');if(!head||head.querySelector('.v24-page-note'))return;
  const note=document.createElement('span');note.className='v24-page-note';note.hidden=true;note.textContent=`FROMBOS Tactical Editorial · ${route()}`;head.appendChild(note);
}
let raf=0;
function apply(){
  applyRoute();applyHome();upgradeChampionCards();upgradeChampionHero();normalizeEmptyDraftSlots();markDossierModules();improveMapPresentation();labelPage();
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(schedule);
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();
window.FROMBOS_V24_TACTICAL_EDITORIAL={apply,schedule};
