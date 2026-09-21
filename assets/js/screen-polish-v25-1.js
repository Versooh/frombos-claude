// FROMBOS V25.1 — Screen-by-Screen Polish Runtime
// Presentation-only. Keeps the V25.1 refinement layer last and annotates screen surfaces.
const route=()=>location.hash.replace('#/','').split('?')[0]||'home';

function keepPolishLast(){
  const link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(x=>x.href.includes('screen-polish-v25-1.css'));
  if(link&&link!==document.head.lastElementChild)document.head.append(link);
}

function annotate(){
  const r=route();
  document.body.dataset.v251Route=r;
  document.querySelector('.v25-content')?.setAttribute('data-v251-screen',r);
  const map={
    home:['.v246-hero','.v246-quick-grid','.v246-series','.v246-draft','.v246-pool','.v246-scout','.v246-comps','.v246-work-grid'],
    draft:['.draft-command','.draft-arena','.champion-select'],
    comps:['.v251-comp-card','.v22-comp-workspace'],
    team:['.fb-pool-hero','.fb-meta-lab'],
    champions:['.champion-intelligence','.ci-browser','.ci-detail'],
    scouting:['.v22-scout-workspace'],
    training:['.performance-center','.performance-hero','.objective-trainer','.vision-trainer','.performance-vod-bridge'],
    reports:['.reports-center','.report-hero','.report-metrics','.reports-grid'],
    tactical:['.tactical-topline','.tactical-grid','.tb-board-card'],
    vod:['.vod-command','.vod-session-strip','.vod-layout'],
    matchups:['.intel-lab','.lab-hero'],
    builds:['.intel-lab','.lab-hero']
  };
  (map[r]||[]).forEach((selector,group)=>{
    document.querySelectorAll(selector).forEach((el,index)=>{
      el.dataset.v251Polished='1';
      el.style.setProperty('--v251-index',String(index+group));
    });
  });
}

function apply(){
  document.body.classList.add('v251-screen-polish');
  keepPolishLast();
  annotate();
}

let raf=0;
const schedule=()=>{
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;apply();});
};
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();

window.FROMBOS_V25_1_SCREEN_POLISH={apply,schedule};
