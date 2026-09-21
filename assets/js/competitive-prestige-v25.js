// FROMBOS V25 — Competitive Prestige Runtime
// Presentation-only ownership layer. No store writes, no remote data, no game-state automation.
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const assets=()=>Object.values(CHAMPION_REGISTRY||{});
const byName=name=>CHAMPION_REGISTRY?.[name]||assets().find(x=>x?.name===name)||null;
const HERO={
  home:['Jinx','Ahri'],team:['Jinx','Ahri'],comps:['Orianna','Yasuo'],draft:['Yasuo','Ahri'],
  series:['Ahri','Jinx'],tactical:['Twisted Fate','Lee Sin'],vod:['Jinx',"Kai'Sa"],
  champions:['Ahri','Akali'],matchups:['Akali','Galio'],builds:['Ahri','Jinx'],
  scouting:['Lee Sin','Ahri'],training:['Irelia','Yasuo'],reports:['Orianna','Ahri'],
  competitive:['Yasuo','Ahri'],data:['Twisted Fate','Orianna'],settings:['Ahri','Jinx'],meta:['Ahri','Yasuo']
};
function hero(routeName){
  for(const name of HERO[routeName]||HERO.home){const a=byName(name);if(a?.splash||a?.portrait)return a;}
  return assets().find(x=>x?.splash)||assets().find(x=>x?.portrait)||null;
}
function keepStyleLast(){
  const link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(x=>x.href.includes('competitive-prestige-v25.css'));
  if(link&&link!==document.head.lastElementChild)document.head.append(link);
}
function enhancePageHero(){
  const r=route(),a=hero(r),src=a?.splash||a?.portrait;
  document.querySelectorAll('.page-head').forEach(head=>{
    head.classList.add('v25-page-hero');
    head.dataset.v25Page=r;
    if(src)head.style.setProperty('--v25-page-art','url("'+src+'")');
    if(!head.querySelector('.v25-page-art')){
      const art=document.createElement('div');art.className='v25-page-art';art.setAttribute('aria-hidden','true');head.append(art);
    }
    if(!head.querySelector('.v25-page-ornament')){
      const ornament=document.createElement('div');ornament.className='v25-page-ornament';ornament.innerHTML='<span>PLAY</span><span>ANALYZE</span><span>EVOLVE</span>';head.append(ornament);
    }
  });
}
function reveal(){
  const selector=[
    '.v246-hero','.v246-quick','.v246-panel','.v246-work-card',
    '.draft-command','.draft-team-panel','.draft-center-panel','.champion-select',
    '.v22-comp-workspace','.v22-comp-block','.fb-pool-card','.fb-meta-lab',
    '.v22-scout-workspace','.v22-scout-panel','.performance-center .card',
    '.reports-center .card','.tactical-shell .card','.tb-board-card',
    '.vod-pro .card','.ci-card','.lab-card'
  ].join(',');
  document.querySelectorAll(selector).forEach((el,i)=>{
    if(el.dataset.v25Reveal)return;
    el.dataset.v25Reveal='1';
    el.style.setProperty('--v25-delay',String(Math.min(i,10)*28)+'ms');
    el.classList.add('v25-reveal');
  });
}
function tagImageRatios(){
  document.querySelectorAll('.fb-pool-art img,.ci-art img,.draft-champ-art img,.dr-slot-portrait,.v22-comp-portrait,.v22-comp-chain-img').forEach(img=>{
    img.classList.add('v25-champion-media');
    img.setAttribute('decoding','async');
  });
}
function markRoute(){
  document.body.classList.add('v25-prestige');
  document.body.dataset.v25Route=route();
  document.querySelector('.v25-shell')?.setAttribute('data-v25-route',route());
  document.querySelector('.v25-content')?.setAttribute('data-page',route());
}
function bindEscape(){
  if(document.body.dataset.v25Esc==='1')return;
  document.body.dataset.v25Esc='1';
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const drawer=document.querySelector('#sidebar.v25-drawer.open');
    if(drawer){
      drawer.classList.remove('open');document.body.classList.remove('v25-drawer-open');
      document.querySelector('#menuToggle')?.setAttribute('aria-expanded','false');
    }
  });
}
function apply(){
  keepStyleLast();markRoute();enhancePageHero();tagImageRatios();reveal();bindEscape();
}
let raf=0;
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
window.addEventListener('hashchange',()=>{
  document.body.classList.add('v25-route-changing');
  setTimeout(()=>document.body.classList.remove('v25-route-changing'),220);
  schedule();
});
window.addEventListener('load',schedule);
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();
window.FROMBOS_V25_PRESTIGE={apply,schedule};
