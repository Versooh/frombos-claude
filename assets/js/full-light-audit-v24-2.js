// FROMBOS V24.2 — Full Light Audit controller
// Presentation-only. No store writes, no competitive data mutation, no network/API data access.

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';

function ensureStyles(){
  if(document.querySelector('link[data-v242-full-light]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href='assets/css/full-light-audit-v24-2.css?v=24.2';link.dataset.v242FullLight='1';
  document.head.appendChild(link);
}

function applyRoot(){
  document.documentElement.style.colorScheme='light';
  document.body.classList.add('v24-2-light-audit');
  document.body.dataset.v242Route=route();
}

function markOperationalSurfaces(){
  const groups={
    vod:'.vod-pro',training:'.performance-center,.training-planner-v16',reports:'.reports-center',meta:'.v22-meta-command',series:'.v22-series-command','match-center':'.match-center-v18',team:'.team-ops-v17'
  };
  const selector=groups[route()];if(!selector)return;
  document.querySelectorAll(selector).forEach(node=>node.dataset.v242Surface='light-owned');
}

function improveDenseTables(){
  document.querySelectorAll('.source-row,.rpt-row,.rpt-head,.activity-list article,.v22-scout-evidence-row').forEach(row=>row.dataset.v242DenseRow='1');
  document.querySelectorAll('.report-metric,.mc-kpis>div,.ops-kpis>div,.tp-kpis>div,.performance-kpis>div').forEach(metric=>metric.dataset.v242Metric='1');
}

function improveVodSemantics(){
  const stage=document.querySelector('.vod-player-stage');if(stage)stage.dataset.v242MediaSurface='video-only-dark';
  document.querySelectorAll('.vod-note-card').forEach((card,index)=>{card.dataset.v242Note=String(index+1);});
}

function improveSeriesSemantics(){
  document.querySelectorAll('.v22-series-game').forEach((game,index)=>{game.setAttribute('aria-label',`Jogo ${index+1} da série`);});
}

function apply(){ensureStyles();applyRoot();markOperationalSurfaces();improveDenseTables();improveVodSemantics();improveSeriesSemantics();}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(schedule);
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();
window.FROMBOS_V24_2_FULL_LIGHT_AUDIT={apply,schedule};
