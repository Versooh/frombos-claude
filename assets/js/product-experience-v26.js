// FROMBOS V26 — Product Experience Runtime
// Presentation-only final owner. No store writes, no network, no game-state automation.
const route=()=>location.hash.replace('#/','').split('?')[0]||'home';

function keepV26Last(){
  const link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(x=>x.href.includes('product-experience-v26.css'));
  if(link&&link!==document.head.lastElementChild)document.head.append(link);
}

function markRoute(){
  const r=route();
  document.body.classList.add('v26-product');
  document.body.dataset.v26Route=r;
  document.querySelector('.v26-shell')?.setAttribute('data-v26-route',r);
  document.querySelector('.v26-content')?.setAttribute('data-page',r);
}

function annotateSurfaces(){
  const selector=[
    '.v26-page-hero',
    '.v246-hero','.v246-quick','.v246-panel','.v246-work-card',
    '.v26-team-command','.v26-roster-card',
    '.v26-series-command','.v26-series-game','.v26-series-ledger',
    '.v26-data-manifest','.v26-source-card','.v26-settings-card',
    '.draft-command','.draft-team-panel','.draft-center-panel','.champion-select',
    '.v251-comp-card','.v22-comp-workspace','.v22-comp-block',
    '.fb-pool-hero','.fb-pool-card','.ci-browser','.ci-detail',
    '.v22-scout-workspace','.v22-scout-panel',
    '.performance-hero','.performance-center .card',
    '.report-hero','.reports-center .card',
    '.tactical-topline','.tb-panel','.tb-board-card',
    '.vod-command','.vod-player-stage','.vod-note-card',
    '.lab-hero','.intel-lab .card'
  ].join(',');
  document.querySelectorAll(selector).forEach(el=>{
    if(el.dataset.v26Surface)return;
    el.dataset.v26Surface='1';
  });
}

function bindPointerLight(){
  if(document.body.dataset.v26PointerBound==='1')return;
  document.body.dataset.v26PointerBound='1';
  document.addEventListener('pointermove',e=>{
    const el=e.target.closest?.('[data-v26-surface="1"]');
    if(!el)return;
    const r=el.getBoundingClientRect();
    const x=Math.max(0,Math.min(100,(e.clientX-r.left)/Math.max(1,r.width)*100));
    const y=Math.max(0,Math.min(100,(e.clientY-r.top)/Math.max(1,r.height)*100));
    el.style.setProperty('--v26-mx',x+'%');
    el.style.setProperty('--v26-my',y+'%');
  },{passive:true});
}

function apply(){
  keepV26Last();
  markRoute();
  annotateSurfaces();
  bindPointerLight();
}

let raf=0;
const schedule=()=>{
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;apply();});
};

window.addEventListener('hashchange',()=>{
  document.body.classList.add('v26-route-loading');
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:reduced?'auto':'smooth'}));
  setTimeout(()=>document.body.classList.remove('v26-route-loading'),460);
  schedule();
});
window.addEventListener('load',schedule);

const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();

window.FROMBOS_V26_PRODUCT_EXPERIENCE={apply,schedule};
