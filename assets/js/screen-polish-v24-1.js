// FROMBOS V24.1 — Screen Polish controller
// Presentation only: no store writes, no competitive state mutation, no API/network data fetches.
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const clean=v=>String(v??'').trim();
const asset=name=>CHAMPION_REGISTRY?.[name]||Object.values(CHAMPION_REGISTRY||{}).find(x=>x?.name===name)||null;

function ensureStyles(){
  if(document.querySelector('link[data-v241-screen-polish]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='assets/css/screen-polish-v24-1.css?v=24.1';link.dataset.v241ScreenPolish='1';
  document.head.appendChild(link);
}

function selectedChampion(){
  const q=new URLSearchParams(location.hash.split('?')[1]||'');
  return clean(q.get('champion'))||clean(document.querySelector('[data-ci-champion][aria-current="true"]')?.dataset.ciChampion)||'';
}

function applyRoot(){
  document.documentElement.style.colorScheme='light';
  document.body.classList.add('v24-1-polish');
  document.body.dataset.v241Route=route();
  const content=document.querySelector('.content');if(content)content.dataset.v241Screen=route();
}

function markCurrentNav(){
  document.querySelectorAll('.nav-item[data-route]').forEach(item=>{
    const active=item.dataset.route===route();
    if(active)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-v23-go],[data-fb-go]').forEach(item=>{
    const target=item.dataset.v23Go||item.dataset.fbGo||'';
    if(target===route())item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');
  });
}

function improveChampionMedia(){
  const name=selectedChampion();
  if(name){
    const a=asset(name);
    if(a?.splash){
      document.querySelectorAll('.ci-hero,.lab-hero').forEach(hero=>{
        hero.style.setProperty('--v24-champion-splash',`url("${String(a.splash).replace(/"/g,'%22')}")`);
        hero.dataset.v241Champion=name;
      });
    }
  }
  document.querySelectorAll('[data-ci-champion]').forEach(card=>{
    const champion=clean(card.dataset.ciChampion),a=asset(champion);if(!a)return;
    card.title=champion;
    const img=card.querySelector('img');if(img){img.decoding='async';img.loading='lazy';img.alt=champion;}
  });
  document.querySelectorAll('.draft-champ-card[data-champ]').forEach(card=>{
    const champion=clean(card.dataset.champ);card.title=champion;
    const img=card.querySelector('img');if(img){img.decoding='async';img.loading='lazy';img.alt=champion;}
  });
}

function markDraftState(){
  document.querySelectorAll('.dr-slot').forEach(slot=>{
    const value=clean(slot.querySelector('.dr-slot-copy b')?.textContent);
    slot.classList.toggle('v241-empty',!value||value==='—');
  });
  document.querySelectorAll('.draft-seq-row').forEach(row=>{
    const value=clean(row.querySelector('strong')?.textContent);
    row.classList.toggle('v241-empty',!value||value==='—');
  });
}

function improveDossierSemantics(){
  document.querySelectorAll('.v22-comp-panel,.v22-comp-block,.v22-scout-panel,.ci-tabs .intel-state').forEach((panel,index)=>{
    panel.dataset.v241Dossier=String(index+1);
  });
  document.querySelectorAll('.v22-scout-evidence-row,[data-status]').forEach(row=>{
    if(row.dataset.status)row.setAttribute('aria-label',`${clean(row.textContent)} · ${row.dataset.status}`);
  });
}

function improveTacticalPresentation(){
  const board=document.querySelector('#tbBoard');
  if(board){board.dataset.v241Presentation='exact-map-preserved';board.setAttribute('role','img');}
  document.querySelectorAll('.tb-tool[data-tool]').forEach(tool=>{
    const label=clean(tool.querySelector('b')?.textContent)||tool.dataset.tool;
    tool.setAttribute('aria-label',label);
  });
}

function responsiveDensity(){
  const w=window.innerWidth;
  document.body.dataset.v241Density=w<521?'phone':w<821?'compact':w<1121?'tablet':'desktop';
}

function apply(){
  ensureStyles();applyRoot();markCurrentNav();improveChampionMedia();markDraftState();improveDossierSemantics();improveTacticalPresentation();responsiveDensity();
}

let raf=0;
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('load',schedule);
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(schedule);
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();

window.FROMBOS_V24_1_SCREEN_POLISH={apply,schedule};
