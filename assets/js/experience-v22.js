// FROMBOS V22 — Dynamic Intelligence Experience controller.
// Presentation/navigation only. Does not create or mutate competitive evidence.

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const championContextRoutes=new Set(['champions','matchups','builds','meta','competitive']);
const currentChampion=()=>new URLSearchParams(location.hash.split('?')[1]||'').get('champion');

const routeMap={
  home:{label:'Command Center',links:[['draft','Preparar Draft'],['pool','Champion Pool'],['meta','Meta Pulse'],['scouting','Scouting']]},
  comps:{label:'Composition Lab',links:[['draft','Levar ao Draft'],['pool','Pool do Time'],['matchups','Matchups'],['training','Treinos']]},
  draft:{label:'Draft Room',links:[['comps','Composições'],['pool','Champion Pool'],['matchups','Matchups'],['builds','Build Intelligence']]},
  pool:{label:'Champion Pool',links:[['champions','Champions'],['matchups','Matchups'],['builds','Builds'],['meta','Meta Pulse']]},
  champions:{label:'Champion Intelligence',links:[['pool','Meu Pool'],['matchups','Matchups'],['builds','Builds'],['meta','Meta']]},
  matchups:{label:'Matchup Lab',links:[['champions','Champions'],['builds','Builds'],['draft','Draft'],['meta','Meta']]},
  builds:{label:'Build Intelligence',links:[['champions','Champions'],['matchups','Counters'],['draft','Draft'],['meta','Meta']]},
  meta:{label:'Meta Intelligence',links:[['champions','Champions'],['pool','Champion Pool'],['draft','Draft'],['competitive','Open Series']]},
  scouting:{label:'Scouting War Room',links:[['tactical','Tactical Board'],['draft','Draft'],['vod','VOD Review'],['data','Data Center']]},
  tactical:{label:'Tactical Board',links:[['scouting','Scouting'],['vod','VOD Review'],['training','Treinos'],['draft','Draft']]},
  vod:{label:'VOD Review',links:[['training','Criar Drill'],['tactical','Tactical'],['scouting','Scouting'],['reports','Relatórios']]},
  training:{label:'Performance Center',links:[['vod','VOD Review'],['reports','Relatórios'],['team','Equipe'],['match-center','Match Center']]},
  reports:{label:'Reports',links:[['training','Treinos'],['match-center','Match Center'],['competitive','Open Series'],['data','Data Center']]}
};

function go(id){
  const champ=currentChampion();
  location.hash=champ&&championContextRoutes.has(id)?`#/${id}?champion=${encodeURIComponent(champ)}`:`#/${id}`;
}
function button(id,label,primary=false){return `<button class="v22-context-link${primary?' is-primary':''}" type="button" data-v22-go="${id}">${label}</button>`;}

function bindGo(root=document){
  root.querySelectorAll?.('[data-v22-go]').forEach(el=>{
    if(el.dataset.v22Bound==='1')return;el.dataset.v22Bound='1';
    el.addEventListener('click',()=>go(el.dataset.v22Go));
  });
}

function contextRibbon(){
  const p=route();if(p==='home')return;
  const content=document.querySelector('.content');if(!content||content.querySelector(':scope > .v22-context-ribbon'))return;
  const conf=routeMap[p];if(!conf)return;
  const anchor=content.querySelector(':scope > .page-head')||content.firstElementChild;
  if(!anchor)return;
  const wrap=document.createElement('div');wrap.className='v22-context-ribbon';
  wrap.innerHTML=`<div><small>${conf.label}</small>${conf.links.map((x,i)=>button(x[0],x[1],i===0)).join('')}</div><span class="v22-context-source">WILD RIFT · EVIDENCE FIRST</span>`;
  anchor.after(wrap);bindGo(wrap);
}

function decisionDeck(){
  if(route()!=='home')return;
  const content=document.querySelector('.content');if(!content||content.querySelector('.v22-decision-deck'))return;
  const hero=content.querySelector(':scope > .hero');
  const kpis=content.querySelector(':scope > .fb-home-kpis');
  const anchor=kpis||hero;if(!anchor)return;
  const deck=document.createElement('section');deck.className='v22-decision-deck v22-reveal';
  deck.innerHTML=`
    <div class="v22-decision-main">
      <div class="v22-decision-kicker">Decision Center</div>
      <h2>Da dúvida à próxima decisão em poucos cliques.</h2>
      <p>Entre por campeão, confronto, composição ou adversário. O FROMBOS conecta as ferramentas existentes sem esconder a origem dos dados.</p>
      <div class="v22-decision-actions">
        <button type="button" data-v22-go="draft">Abrir Draft Room</button>
        <button type="button" data-v22-go="champions">Explorar Campeão</button>
        <button type="button" data-v22-go="builds">Build Intelligence</button>
        <button type="button" data-v22-go="matchups">Matchup Lab</button>
      </div>
    </div>
    <div class="v22-decision-side">
      <article class="v22-pulse-card" data-v22-go="meta" tabindex="0"><div class="v22-pulse-icon">↗</div><div><b>Meta Pulse</b><span>Snapshots, camadas e mudanças com origem explícita.</span></div><i>→</i></article>
      <article class="v22-pulse-card" data-v22-go="pool" tabindex="0"><div class="v22-pulse-icon">◈</div><div><b>Champion Pool</b><span>Conforto, treino e cobertura por função.</span></div><i>→</i></article>
      <article class="v22-pulse-card" data-v22-go="scouting" tabindex="0"><div class="v22-pulse-icon">⌖</div><div><b>War Room</b><span>Adversário, padrões observados e rota para o mapa.</span></div><i>→</i></article>
    </div>`;
  anchor.after(deck);bindGo(deck);deck.querySelectorAll('[tabindex="0"]').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go(el.dataset.v22Go);}));
}

const heroCopy={
  meta:['META PULSE','Leia o patch por evidência, não por impressão.','Conecte snapshots, competitivo e Champion Pool sem misturar fontes.'],
  champions:['CHAMPION INTELLIGENCE','Um campeão, todas as decisões conectadas.','Perfil, Matchups, Builds e evidências no mesmo fluxo de análise.'],
  matchups:['MATCHUP LAB','Confronto é contexto.','Compare evidências existentes e leve a leitura direto para Draft e Build Intelligence.'],
  builds:['BUILD INTELLIGENCE','Build é resposta ao contexto.','Itens e caminhos curados/observados continuam separados por proveniência.']
};
function pageHero(){
  const p=route(),copy=heroCopy[p];if(!copy)return;
  const content=document.querySelector('.content');if(!content||content.querySelector(':scope > .v22-page-hero'))return;
  const head=content.querySelector(':scope > .page-head');if(!head)return;
  const hero=document.createElement('section');hero.className='v22-page-hero v22-reveal';
  const actions=p==='champions'?[['matchups','Abrir Matchups'],['builds','Abrir Builds']]:p==='meta'?[['pool','Meu Pool'],['draft','Preparar Draft']]:p==='matchups'?[['builds','Builds'],['draft','Draft']]:[['matchups','Matchups'],['draft','Draft']];
  hero.innerHTML=`<div class="eyebrow">${copy[0]}</div><h2>${copy[1]}</h2><p>${copy[2]}</p><div class="v22-page-actions">${actions.map(x=>`<button type="button" data-v22-go="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  head.after(hero);bindGo(hero);
}

function quickDock(){
  if(document.querySelector('.v22-quick-dock'))return;
  const dock=document.createElement('div');dock.className='v22-quick-dock';
  dock.innerHTML=`<button type="button" data-v22-action="search" title="Busca / Ctrl+K">⌕</button><button type="button" data-v22-go="draft" title="Draft Room">⚑</button><button type="button" data-v22-go="pool" title="Champion Pool">◈</button><button type="button" data-v22-go="tactical" title="Tactical Board">◎</button>`;
  document.body.appendChild(dock);bindGo(dock);
  dock.querySelector('[data-v22-action="search"]')?.addEventListener('click',()=>document.querySelector('#fbGlobalSearch')?.click());
}

function styleQuickDock(){
  if(document.querySelector('#v22-quick-dock-style'))return;
  const style=document.createElement('style');style.id='v22-quick-dock-style';style.textContent=`.v22-quick-dock{position:fixed;right:20px;bottom:20px;z-index:80;display:flex;gap:6px;padding:6px;border:1px solid rgba(201,216,232,.9);border-radius:13px;background:rgba(255,255,255,.9);box-shadow:0 18px 42px rgba(11,43,80,.15);backdrop-filter:blur(16px)}.v22-quick-dock button{width:38px;height:38px;border:0;border-radius:9px;background:#f4f8fc;color:#52677f;font-weight:900;cursor:pointer;transition:.18s cubic-bezier(.2,.8,.2,1)}.v22-quick-dock button:hover{background:#e9f3ff;color:#0d5fd3;transform:translateY(-2px)}@media(max-width:760px){.v22-quick-dock{left:50%;right:auto;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);box-shadow:0 12px 34px rgba(9,38,72,.18)}}`;
  document.head.appendChild(style);
}

function reveal(){
  const els=[...document.querySelectorAll('.v22-reveal:not([data-v22-reveal])')];if(!els.length)return;
  if(reduceMotion()||!('IntersectionObserver'in window)){els.forEach(el=>{el.dataset.v22Reveal='1';el.classList.add('is-visible')});return;}
  const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}})},{threshold:.12});
  els.forEach(el=>{el.dataset.v22Reveal='1';io.observe(el)});
}

function markInteractiveCards(){
  document.querySelectorAll('.fb-module-card,.fb-pool-card,.composition-card,.scout-team-card').forEach(el=>el.classList.add('v22-interactive-card'));
}

function heroParallax(){
  if(route()!=='home'||reduceMotion())return;const hero=document.querySelector('.content[data-page="home"] > .hero');if(!hero||hero.dataset.v22Parallax==='1')return;hero.dataset.v22Parallax='1';
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();const x=((e.clientX-r.left)/r.width*100).toFixed(1)+'%';const y=((e.clientY-r.top)/r.height*100).toFixed(1)+'%';hero.style.setProperty('--v22-x',x);hero.style.setProperty('--v22-y',y)});
  hero.addEventListener('pointerleave',()=>{hero.style.removeProperty('--v22-x');hero.style.removeProperty('--v22-y')});
}

function routeFlash(){const content=document.querySelector('.content');if(!content)return;content.classList.remove('v22-route-flash');requestAnimationFrame(()=>content.classList.add('v22-route-flash'));}

function apply(){
  document.body.classList.add('v22-ready');
  document.body.dataset.v22Page=route();
  contextRibbon();decisionDeck();pageHero();styleQuickDock();quickDock();markInteractiveCards();heroParallax();reveal();
}

const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(apply);else window.addEventListener('load',apply);
window.addEventListener('hashchange',()=>{queueMicrotask(()=>{apply();routeFlash();});});
queueMicrotask(apply);
window.FROMBOS_V22={apply,go};
