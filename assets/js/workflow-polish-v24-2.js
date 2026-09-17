// FROMBOS V24.2 — Workflow Polish controller
// Presentation/interaction only. No competitive store writes, network fetches, evidence mutation or tactical geometry changes.

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const DENSE_ROUTES=new Set(['champions','comps','draft','scouting','tactical','vod','training','reports']);
const ROUTE_LABELS={home:'Home',team:'Equipe',comps:'Composições',draft:'Draft Room',series:'Series Command',champions:'Champion Intelligence',pool:'Champion Pool',matchups:'Matchup Lab',builds:'Build Intelligence',scouting:'Scouting War Room',tactical:'Tactical Board',vod:'VOD Review',training:'Treinos',reports:'Relatórios',data:'Data Center',settings:'Configurações'};
let focusMode=false;
let raf=0;

const clean=v=>String(v??'').trim();
const interactiveTarget=target=>Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));

function ensureStatus(){
  let live=document.querySelector('#v242Live');
  if(live)return live;
  live=document.createElement('div');
  live.id='v242Live';
  live.className='v242-sr-only';
  live.setAttribute('aria-live','polite');
  live.setAttribute('aria-atomic','true');
  document.body.appendChild(live);
  return live;
}

function announce(message){const live=ensureStatus();live.textContent='';requestAnimationFrame(()=>{live.textContent=message;});}

function applyRoot(){
  document.body.classList.add('v24-2-workflow');
  document.body.dataset.v242Route=route();
  document.body.classList.toggle('v242-focus',focusMode&&DENSE_ROUTES.has(route()));
}

function toolbarHost(){return document.querySelector('.content');}

function ensureWorkflowBar(){
  const host=toolbarHost();if(!host)return;
  let bar=host.querySelector('.v242-workflow-bar');
  if(!bar){
    bar=document.createElement('section');
    bar.className='v242-workflow-bar';
    bar.setAttribute('aria-label','Controles de visualização do workspace');
    bar.innerHTML='<div class="v242-workflow-context"><span class="v242-workflow-kicker">WORKSPACE</span><b data-v242-route-label></b><small data-v242-density-label></small></div><div class="v242-workflow-actions"><button type="button" class="v242-focus-btn" data-v242-focus aria-pressed="false">Modo foco</button><button type="button" class="v242-top-btn" data-v242-top>Topo</button></div>';
    const head=host.querySelector('.page-head');
    if(head?.nextSibling)host.insertBefore(bar,head.nextSibling);else if(head)head.after(bar);else host.prepend(bar);
    bar.querySelector('[data-v242-focus]')?.addEventListener('click',toggleFocus);
    bar.querySelector('[data-v242-top]')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  }
  const label=bar.querySelector('[data-v242-route-label]');if(label)label.textContent=ROUTE_LABELS[route()]||route();
  const density=bar.querySelector('[data-v242-density-label]');if(density)density.textContent=window.innerWidth<521?'PHONE':window.innerWidth<821?'COMPACT':window.innerWidth<1121?'TABLET':'DESKTOP';
  const focus=bar.querySelector('[data-v242-focus]');
  const allowed=DENSE_ROUTES.has(route());
  if(focus){focus.hidden=!allowed;focus.setAttribute('aria-pressed',String(focusMode&&allowed));focus.textContent=focusMode&&allowed?'Sair do foco':'Modo foco';focus.setAttribute('aria-keyshortcuts','Shift+F');}
}

function toggleFocus(){
  if(!DENSE_ROUTES.has(route()))return;
  focusMode=!focusMode;applyRoot();ensureWorkflowBar();
  announce(focusMode?'Modo foco ativado':'Modo foco desativado');
}

function resetFocusOnRoute(){focusMode=false;applyRoot();}

function markDenseActions(){
  document.querySelectorAll('.draft-command,.tactical-topline,.vod-command,.v22-scout-command,.performance-hero,.report-hero').forEach(el=>el.classList.add('v242-sticky-context'));
}

function improveFocusSemantics(){
  document.querySelectorAll('.ci-card[data-ci-champion],.draft-champ-card[data-champ],.v23-function-link,.tb-tool[data-tool]').forEach(el=>{
    if(!el.hasAttribute('tabindex')&&el.tagName!=='BUTTON'&&el.tagName!=='A')el.tabIndex=0;
    el.classList.add('v242-focusable');
  });
  document.querySelectorAll('.draft-champ-card[data-champ]').forEach(card=>{const name=clean(card.dataset.champ);if(name&&!card.getAttribute('aria-label'))card.setAttribute('aria-label',`Campeão ${name}`);});
  document.querySelectorAll('.ci-card[data-ci-champion]').forEach(card=>{const name=clean(card.dataset.ciChampion);if(name&&!card.getAttribute('aria-label'))card.setAttribute('aria-label',`Abrir inteligência de ${name}`);});
}

function markHorizontalScroll(){
  document.querySelectorAll('.series-strip,.draft-filter-tabs-v20,.comp-filter-tabs-v20,.ci-filter-tabs-v20,.tb-toolbar,.vod-tools').forEach(el=>{
    el.classList.add('v242-scroll-row');
    if(!el.hasAttribute('tabindex'))el.tabIndex=0;
    if(!el.getAttribute('aria-label'))el.setAttribute('aria-label','Controles com rolagem horizontal');
  });
}

function apply(){applyRoot();ensureWorkflowBar();markDenseActions();improveFocusSemantics();markHorizontalScroll();ensureStatus();}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}

window.addEventListener('hashchange',()=>{resetFocusOnRoute();schedule();});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('load',schedule);
window.addEventListener('keydown',event=>{
  if(interactiveTarget(event.target))return;
  if(event.key==='Escape'&&focusMode){focusMode=false;apply();announce('Modo foco desativado');return;}
  if(event.shiftKey&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&event.key.toLowerCase()==='f'&&DENSE_ROUTES.has(route())){event.preventDefault();toggleFocus();}
  if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey){const search=document.querySelector('.fb-global-search input,#globalSearch,[data-global-search] input');if(search){event.preventDefault();search.focus();}}
});
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(schedule);
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
schedule();

window.FROMBOS_V24_2_WORKFLOW_POLISH={apply,schedule,toggleFocus};
