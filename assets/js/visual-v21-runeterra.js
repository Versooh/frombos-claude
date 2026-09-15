// FROMBOS V21 — Runeterra Competitive System visual controller.
// Presentation + local USER_PRIVATE champion profile controls only.
import { MODULES, ROLES, RECOVERED_COMPOSITIONS } from './data.js';
import { store } from './store.js';
import { championPoolLabHTML, bindChampionPoolLab } from './champion-pool-v21.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot',"'":'&#39;'}[c]));
const poolCount=()=>new Set(ROLES.flatMap(r=>store.state.team?.players?.[r.id]?.pool||[])).size;
const modules=[
  {id:'home',label:'Início',group:'CORE',icon:'✦'},
  {id:'comps',label:'Composições',group:'PREPARAÇÃO',icon:'⬡'},
  {id:'draft',label:'Draft Room',group:'COMPETIÇÃO',icon:'⚑'},
  {id:'pool',label:'Champion Pool',group:'INTELIGÊNCIA',icon:'◈'},
  {id:'champions',label:'Champions',group:'INTELIGÊNCIA',icon:'◇'},
  {id:'matchups',label:'Matchups',group:'INTELIGÊNCIA',icon:'⇄'},
  {id:'builds',label:'Builds',group:'INTELIGÊNCIA',icon:'▦'},
  {id:'scouting',label:'Scouting',group:'PREPARAÇÃO',icon:'⌖'},
  {id:'tactical',label:'Tactical Board',group:'ANÁLISE',icon:'◎'},
  {id:'vod',label:'VOD Review',group:'ANÁLISE',icon:'▶'},
  {id:'training',label:'Treinos',group:'EVOLUÇÃO',icon:'↗'},
  {id:'reports',label:'Relatórios',group:'EVOLUÇÃO',icon:'▥'},
  {id:'match-center',label:'Match Center',group:'COMPETIÇÃO',icon:'◫'},
  {id:'competitive',label:'Open Series',group:'COMPETIÇÃO',icon:'♜'},
  {id:'data',label:'Data Center',group:'SISTEMA',icon:'⌁'},
  {id:'team',label:'Equipe',group:'PREPARAÇÃO',icon:'◉'},
  {id:'settings',label:'Configurações',group:'SISTEMA',icon:'⚙'}
];
const routeExists=id=>MODULES.some(m=>m.id===id)||['pool','match-center'].includes(id);

function ensurePoolNav(){
  const existing=document.querySelector('[data-route="pool"]');
  if(existing){existing.classList.toggle('active',route()==='pool');return;}
  const champion=document.querySelector('[data-route="champions"]');
  if(!champion)return;
  const btn=document.createElement('button');
  btn.className=`nav-item ${route()==='pool'?'active':''}`;btn.dataset.route='pool';btn.innerHTML='<span>◈</span><span>Champion Pool</span>';
  btn.addEventListener('click',()=>location.hash='#/pool');champion.before(btn);
}

function ensureTopbar(){
  const bar=document.querySelector('.topbar'); if(!bar||bar.dataset.runeterra==='1')return; bar.dataset.runeterra='1';
  const actions=bar.querySelector('.top-actions');
  const search=document.createElement('button'); search.type='button';search.className='fb-global-search';search.id='fbGlobalSearch';
  search.innerHTML='<span>⌕</span><span style="flex:1;text-align:left">Buscar campeões, módulos e análises...</span><kbd>Ctrl K</kbd>';
  actions?.before(search);
  if(actions){
    const badge=actions.querySelector('.badge.green'); if(badge)badge.remove();
    const team=document.createElement('span');team.className='fb-team-pill';team.innerHTML=`Equipe <strong>${esc(store.state.team?.name||'Workspace')}</strong>`;
    const notify=document.createElement('button');notify.className='btn';notify.type='button';notify.title='Notificações locais';notify.textContent='◔';
    const avatar=document.createElement('span');avatar.className='fb-top-avatar';avatar.textContent=(store.state.team?.name||'F').slice(0,1).toUpperCase();
    actions.prepend(team,notify,avatar);
  }
  search.addEventListener('click',openPalette);
}

function paletteHTML(){return `<div class="fb-command-palette" id="fbCommandPalette" aria-hidden="true"><div class="fb-command-box"><input id="fbCommandInput" placeholder="Ir para módulo..." autocomplete="off"><div class="fb-command-results" id="fbCommandResults"></div></div></div>`;}
function ensurePalette(){if(document.querySelector('#fbCommandPalette'))return;document.body.insertAdjacentHTML('beforeend',paletteHTML());const root=document.querySelector('#fbCommandPalette');root.addEventListener('click',e=>{if(e.target===root)closePalette();});document.querySelector('#fbCommandInput')?.addEventListener('input',renderPaletteResults);}
function renderPaletteResults(){
  const input=document.querySelector('#fbCommandInput'),out=document.querySelector('#fbCommandResults');if(!out)return;const q=(input?.value||'').toLowerCase();
  const list=modules.filter(m=>routeExists(m.id)&&(!q||`${m.label} ${m.group}`.toLowerCase().includes(q))).slice(0,12);
  out.innerHTML=list.map(m=>`<button data-command-route="${m.id}"><span><b>${m.icon} ${m.label}</b><small style="display:block;color:#8996a6;margin-top:3px">${m.group}</small></span><span>↵</span></button>`).join('')||'<div style="padding:18px;color:#77879a">Nenhum módulo encontrado.</div>';
  out.querySelectorAll('[data-command-route]').forEach(btn=>btn.onclick=()=>{location.hash=`#/${btn.dataset.commandRoute}`;closePalette();});
}
function openPalette(){ensurePalette();const p=document.querySelector('#fbCommandPalette');p?.classList.add('is-open');p?.setAttribute('aria-hidden','false');renderPaletteResults();setTimeout(()=>document.querySelector('#fbCommandInput')?.focus(),0)}
function closePalette(){const p=document.querySelector('#fbCommandPalette');p?.classList.remove('is-open');p?.setAttribute('aria-hidden','true');}

function homeMetrics(){
  const matches=store.state.matches?.games?.length||0;
  const comps=RECOVERED_COMPOSITIONS.length+(store.state.customComps?.length||0);
  const drafts=Object.values(store.state.draft?.games||{}).filter(g=>(g?.actions?.length||0)>0).length;
  const vod=(store.state.vod?.reviews?.length||0)+(store.state.vod?.sessions?.length||0);
  const drills=store.state.training?.sessions?.length||0;
  return [
    ['Campeões no pool',poolCount(),'USER_PRIVATE'],['Partidas analisadas',matches,'workspace local'],['Composições registradas',comps,'materializadas + local'],['Drafts ativos',drafts,'estado persistido'],['VODs',vod,'workspace local'],['Drills',drills,'treino']
  ];
}
function metric([label,value,source]){return `<div class="fb-home-kpi"><small>${label}</small><b>${value||'—'}</b><span>${value?source:'sem dados'}</span></div>`;}
function homeModule(id,title,description,icon){return `<article class="fb-module-card" data-fb-go="${id}" tabindex="0"><div class="fb-module-icon">${icon}</div><h3>${title}</h3><p>${description}</p><span class="fb-module-arrow">→</span></article>`;}
function enhanceHome(){
  if(route()!=='home')return;const content=document.querySelector('.content');const hero=content?.querySelector(':scope > .hero');if(!content||!hero||content.dataset.runeterraHome==='1')return;content.dataset.runeterraHome='1';
  const lead=hero.firstElementChild; if(lead){lead.innerHTML=`<div class="eyebrow">INTELIGÊNCIA COMPETITIVA PARA WILD RIFT</div><h1>CONHECIMENTO<br>TRANSFORMA<br>POTENCIAL EM <span class="fb-gold-word">VITÓRIA</span></h1><p>Dados. Análise. Estratégia.<br>Do treino ao cenário competitivo.</p><div class="top-actions" style="margin-top:22px"><button class="btn primary" data-fb-go="champions">Explorar análises</button><button class="btn info" data-fb-go="draft">Preparar draft</button></div>`;}
  const panel=hero.querySelector('.hero-panel');if(panel){const configured=Object.values(store.state.team?.players||{}).filter(p=>p?.name||p?.pool?.length).length;panel.innerHTML=`<div class="eyebrow">WORKSPACE ATIVO</div><h2>${esc(store.state.team?.name||'FROMBOS')}</h2><p>${configured}/5 posições configuradas · G${Number(store.state.draft?.game||1)} · persistência local.</p><span class="badge gold">WILD RIFT ONLY</span>`;}
  content.querySelector('.kpis')?.remove();content.querySelector('.grid.cols-3')?.remove();
  hero.insertAdjacentHTML('afterend',`<div class="fb-home-kpis">${homeMetrics().map(metric).join('')}</div><div class="fb-module-section-head"><div><div class="eyebrow">WORKSPACE</div><h2>ACESSAR MÓDULOS</h2></div><span class="muted">Do preparo ao review</span></div><div class="fb-module-grid">${[
    homeModule('comps','Composições','Lineups, identidade tática e condição de vitória.','⬡'),homeModule('draft','Draft Room','Tournament Draft, Fearless e champion pools.','⚑'),homeModule('pool','Champion Pool','Conheça, domine e evolua o pool do time.','◈'),homeModule('scouting','Scouting','War Room para adversários e padrões observados.','⌖'),homeModule('training','Treinos','Drills, objetivos e fluxo VOD → treino.','↗'),homeModule('reports','Relatórios','Leitura editorial apenas com dados reais.','▥'),homeModule('tactical','Tactical Board','Mapa exato, visão, rotas e cenários.','◎')].join('')}</div>`);
  bindGo(content);
}
function bindGo(root=document){root.querySelectorAll?.('[data-fb-go]').forEach(el=>{const go=()=>location.hash=`#/${el.dataset.fbGo}`;el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go();});});}

function renderPoolRoute(){
  if(route()!=='pool')return;const content=document.querySelector('.content');if(!content)return;document.body.dataset.v21Page='pool';content.dataset.page='pool';
  if(content.dataset.poolRendered==='1')return;content.dataset.poolRendered='1';content.innerHTML=championPoolLabHTML();bindChampionPoolLab(()=>{content.dataset.poolRendered='';renderPoolRoute();});
}

function scopeOtherRoutes(){
  const p=route();const content=document.querySelector('.content');if(content)content.dataset.page=p;document.body.dataset.v21Page=p;
  if(p==='scouting')document.body.classList.add('fb-war-room');else document.body.classList.remove('fb-war-room');
}

function apply(){scopeOtherRoutes();ensurePoolNav();ensureTopbar();ensurePalette();enhanceHome();renderPoolRoute();bindGo();}

window.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openPalette();}if(event.key==='Escape')closePalette();});
window.addEventListener('hashchange',()=>queueMicrotask(()=>{document.querySelector('.content')?.removeAttribute('data-runeterra-home');document.querySelector('.content')?.removeAttribute('data-pool-rendered');apply();}));
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(apply);else window.addEventListener('load',apply);
queueMicrotask(apply);
window.FROMBOS_RUNETERRA_V21={apply,openPalette,closePalette};
