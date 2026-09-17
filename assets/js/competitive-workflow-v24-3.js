// FROMBOS V24.3 — Competitive Workflow Handoff
// Read-only workflow glue across Champion Pool → Scouting → Draft → VOD → Tactical → Training.
// No autopick/autoban, no evidence reclassification, no tactical geometry mutation and no automatic planner writes.
import { store } from './store.js';
import { OPEN_SERIES_PLAYERS } from './open-series-scouting.generated.js';

const FLOW=[
  {route:'champions',label:'Champion Pool',short:'Pool'},
  {route:'scouting',label:'Scouting',short:'Scout'},
  {route:'draft',label:'Draft',short:'Draft'},
  {route:'vod',label:'VOD Review',short:'VOD'},
  {route:'tactical',label:'Tactical Board',short:'Map'},
  {route:'training',label:'Training',short:'Train'}
];
const ROLE_LABEL={TEAM:'Equipe / Geral',BARON:'Barão',JUNGLE:'Selva',MID:'Meio',DUO:'Duo',SUPPORT:'Suporte'};
const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const query=()=>new URLSearchParams(location.hash.split('?')[1]||'');
const clean=v=>String(v??'').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
const same=(a,b)=>norm(a)===norm(b);
const genericOpponent=v=>!v||['adversario','adversário','opponent'].includes(norm(v));
const sessions=()=>Array.isArray(store.state.vod?.sessions)?store.state.vod.sessions:[];
const reviews=()=>Array.isArray(store.state.vod?.reviews)?store.state.vod.reviews:[];
const sessionById=id=>sessions().find(x=>x.id===id)||null;
const fmt=s=>`${String(Math.floor((Number(s)||0)/60)).padStart(2,'0')}:${String(Math.floor((Number(s)||0)%60)).padStart(2,'0')}`;

function championContext(){
  return clean(query().get('champion'))||clean(document.querySelector('#championDrawerV21')?.dataset.champion)||'';
}
function opponentContext(){
  const values=[query().get('opponent'),query().get('team'),store.state.scouting?.selectedTeam,store.state.team?.opponent];
  return clean(values.find(v=>!genericOpponent(v))||'');
}
function vodContext(){
  const q=query(),sessionId=clean(q.get('vodSession'));
  const noteIds=clean(q.get('vodNotes')).split(',').map(clean).filter(Boolean);
  return {sessionId,noteIds};
}
function pack(){
  const {sessionId,noteIds}=vodContext();
  const session=sessionById(sessionId);if(!session)return null;
  const wanted=new Set(noteIds);
  const notes=reviews().filter(n=>n.sessionId===sessionId&&wanted.has(n.id)).sort((a,b)=>(Number(a.time)||0)-(Number(b.time)||0));
  return notes.length?{session,notes}:null;
}
function observedFavorites(team){
  if(!team)return[];
  const seen=new Set();
  return OPEN_SERIES_PLAYERS.filter(p=>same(p.team,team)&&p.favorite).sort((a,b)=>(a.rank||999)-(b.rank||999)).filter(p=>{const key=norm(p.favorite);if(seen.has(key))return false;seen.add(key);return true;});
}
function buildHash(target,extra={}){
  const currentVod=vodContext(),champion=championContext(),opponent=opponentContext();
  const p=new URLSearchParams();
  if(['champions','draft'].includes(target)&&champion)p.set('champion',champion);
  if(['scouting','draft','vod','tactical','training'].includes(target)&&opponent)p.set('opponent',opponent);
  if(['vod','tactical','training'].includes(target)&&currentVod.sessionId)p.set('vodSession',currentVod.sessionId);
  if(['tactical','training'].includes(target)&&currentVod.noteIds.length)p.set('vodNotes',currentVod.noteIds.join(','));
  Object.entries(extra).forEach(([k,v])=>{if(v!==undefined&&v!==null&&String(v)!=='')p.set(k,String(v));});
  const suffix=p.toString();return `#/${target}${suffix?`?${suffix}`:''}`;
}
function go(target,extra={}){location.hash=buildHash(target,extra);}
function activeFlowRoute(){const r=route();return FLOW.some(x=>x.route===r)?r:null;}
function contextChips(){
  const champion=championContext(),opponent=opponentContext(),p=pack();const chips=[];
  if(champion)chips.push(`<span><small>CAMPEÃO</small><b>${esc(champion)}</b></span>`);
  if(opponent)chips.push(`<span><small>ADVERSÁRIO</small><b>${esc(opponent)}</b></span>`);
  if(p)chips.push(`<span><small>EVIDÊNCIAS</small><b>${p.notes.length} USER_PRIVATE</b></span>`);
  return chips.join('');
}
function flowHTML(){
  const current=activeFlowRoute();
  return `<nav class="v243-flowbar" data-v243-flowbar aria-label="Fluxo competitivo FROMBOS"><div class="v243-flow-title"><span>COMPETITIVE WORKFLOW · V24.3</span><b>Contexto acompanha o coach, a decisão continua manual.</b></div><div class="v243-flow-steps">${FLOW.map((x,i)=>`<button type="button" class="v243-flow-step ${x.route===current?'is-active':''}" data-v243-flow-go="${x.route}" ${x.route===current?'aria-current="step"':''}><i>${String(i+1).padStart(2,'0')}</i><span>${esc(x.short)}</span></button>`).join('')}</div><div class="v243-context-chips">${contextChips()||'<span><small>CONTEXTO</small><b>LOCAL / MATERIALIZADO</b></span>'}</div></nav>`;
}
function bindFlow(root){root.querySelectorAll('[data-v243-flow-go]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.v243FlowGo)));}
function ensureFlow(){
  const content=document.querySelector('.content');if(!content||!activeFlowRoute())return;
  const key=[route(),championContext(),opponentContext(),vodContext().sessionId,vodContext().noteIds.join(',')].join('|');
  const old=content.querySelector('[data-v243-flowbar]');if(old?.dataset.key===key)return;old?.remove();
  const anchor=content.querySelector('.page-head')||content.firstElementChild;if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',flowHTML());const root=content.querySelector('[data-v243-flowbar]');if(root){root.dataset.key=key;bindFlow(root);}
}

function decorateChampionPool(){
  if(route()!=='champions')return;
  document.querySelectorAll('[data-pool-card]').forEach(card=>{
    if(card.querySelector('[data-v243-card-draft]'))return;
    const name=clean(card.dataset.poolCard);const body=card.querySelector('.fb-pool-body');if(!name||!body)return;
    const btn=document.createElement('button');btn.type='button';btn.className='btn v243-card-draft';btn.dataset.v243CardDraft=name;btn.textContent='Draft';
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();go('draft',{champion:name});});body.appendChild(btn);
  });
  const drawer=document.querySelector('#championDrawerV21[aria-hidden="false"]');const actions=drawer?.querySelector('.fb-drawer-actions');
  if(!drawer||!actions||actions.querySelector('[data-v243-drawer-draft]'))return;
  const name=clean(drawer.dataset.champion);if(!name)return;
  actions.insertAdjacentHTML('beforeend',`<button type="button" class="btn primary" data-v243-drawer-draft="${esc(name)}">Levar ao Draft</button><button type="button" class="btn" data-v243-drawer-comps="${esc(name)}">Ver Composições</button>`);
  actions.querySelector('[data-v243-drawer-draft]')?.addEventListener('click',()=>go('draft',{champion:name}));
  actions.querySelector('[data-v243-drawer-comps]')?.addEventListener('click',()=>{location.hash=`#/comps?champion=${encodeURIComponent(name)}`;});
}

function scoutingHandoffHTML(team){
  const signals=observedFavorites(team);
  return `<section class="v243-handoff v243-scout-handoff" data-v243-scout-handoff data-team="${esc(team)}"><div><span>SCOUTING → DECISION HANDOFF</span><h3>Levar contexto observado para a próxima tela</h3><p><b>${esc(team)}</b>${signals.length?` · ${signals.length} favorito${signals.length===1?'':'s'} observado${signals.length===1?'':'s'}`:' · favoritos observados UNKNOWN'}. Favorito publicado continua sendo contexto, não prioridade automática.</p></div><div class="v243-handoff-actions"><button type="button" class="btn primary" data-v243-scout-target="draft">Abrir Draft com contexto</button><button type="button" class="btn" data-v243-scout-target="vod">Validar em VOD</button><button type="button" class="btn" data-v243-scout-target="tactical">Preparar Tactical</button></div></section>`;
}
function decorateScouting(){
  if(route()!=='scouting')return;
  const workspace=document.querySelector('[data-v22-scout-workspace]');if(!workspace)return;
  const team=clean(workspace.dataset.team)||opponentContext();if(!team)return;
  const old=workspace.querySelector('[data-v243-scout-handoff]');if(old?.dataset.team===team)return;old?.remove();
  const anchor=workspace.querySelector('.v22-scout-actions')||workspace.querySelector('.v22-scout-overview');if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',scoutingHandoffHTML(team));
  workspace.querySelectorAll('[data-v243-scout-target]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.v243ScoutTarget,{opponent:team})));
}

function focusChampion(name){
  const target=[...document.querySelectorAll('#drChampGrid [data-champ]')].find(x=>same(x.dataset.champ,name));if(!target)return;
  document.querySelectorAll('.v243-locate-focus').forEach(x=>x.classList.remove('v243-locate-focus'));target.classList.add('v243-locate-focus');target.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>target.classList.remove('v243-locate-focus'),1800);
}
function draftHandoffHTML(team,champion){
  const signals=observedFavorites(team).slice(0,5);
  return `<section class="v243-handoff v243-draft-handoff" data-v243-draft-handoff data-key="${esc(`${team}|${champion}`)}"><div class="v243-handoff-copy"><span>LIVE HANDOFF · NO AUTO-PICK</span><h3>${team?esc(team):'Contexto do Draft'}${champion?` · ${esc(champion)}`:''}</h3><p>${team?`${signals.length?signals.length:'Nenhum'} sinal${signals.length===1?'':'is'} favorito${signals.length===1?'':'s'} observado${signals.length===1?'':'s'} materializado${signals.length===1?'':'s'}. `:''}O FROMBOS apenas transporta contexto; pick e ban continuam manuais.</p>${signals.length?`<div class="v243-signal-chips">${signals.map(p=>`<span><b>${esc(p.favorite)}</b><small>${esc(p.name)} · OBSERVED</small></span>`).join('')}</div>`:''}</div><div class="v243-handoff-actions">${champion?`<button type="button" class="btn primary" data-v243-locate-champion="${esc(champion)}">Localizar ${esc(champion)}</button>`:''}${team?'<button type="button" class="btn" data-v243-draft-back-scout>Voltar ao Scouting</button>':''}<button type="button" class="btn" data-v243-draft-vod>Revisar em VOD</button></div></section>`;
}
function decorateDraft(){
  if(route()!=='draft')return;
  const root=document.querySelector('.v22-draft-decision');if(!root)return;
  const team=opponentContext(),champion=championContext();if(!team&&!champion)return;
  const key=`${team}|${champion}`;const old=root.querySelector('[data-v243-draft-handoff]');if(old?.dataset.key===key)return;old?.remove();
  const anchor=root.querySelector('.v22-draft-decision-head');if(!anchor)return;anchor.insertAdjacentHTML('afterend',draftHandoffHTML(team,champion));
  root.querySelector('[data-v243-locate-champion]')?.addEventListener('click',e=>focusChampion(e.currentTarget.dataset.v243LocateChampion));
  root.querySelector('[data-v243-draft-back-scout]')?.addEventListener('click',()=>go('scouting',{opponent:team}));
  root.querySelector('[data-v243-draft-vod]')?.addEventListener('click',()=>go('vod',{opponent:team}));
}

function decorateVod(){
  if(route()!=='vod')return;
  const root=document.querySelector('[data-v22-vod-intelligence]');if(!root||root.querySelector('[data-v243-vod-handoff]'))return;
  const id=clean(root.dataset.session)||vodContext().sessionId;const session=sessionById(id);const team=clean(session?.opponent)||opponentContext();
  const p=pack();
  root.insertAdjacentHTML('beforeend',`<section class="v243-handoff v243-vod-handoff" data-v243-vod-handoff><div><span>VOD → TACTICAL → TRAINING</span><h3>Transforme revisão em ação sem inventar evidência</h3><p>${session?`Sessão: <b>${esc(session.title||'VOD')}</b>. `:''}${p?`${p.notes.length} anotação${p.notes.length===1?'':'ões'} já viaja${p.notes.length===1?'':'m'} no pacote atual.`:'Selecione evidências no VOD Intelligence antes de montar um pacote tático.'}</p></div><div class="v243-handoff-actions">${team?'<button type="button" class="btn" data-v243-vod-scout>Scouting</button>':''}${p?'<button type="button" class="btn primary" data-v243-vod-training>Levar ao Training</button>':''}</div></section>`);
  root.querySelector('[data-v243-vod-scout]')?.addEventListener('click',()=>go('scouting',{opponent:team}));
  root.querySelector('[data-v243-vod-training]')?.addEventListener('click',()=>go('training'));
}

function decorateTactical(){
  if(route()!=='tactical')return;
  const dock=document.querySelector('[data-v22-tactical-evidence]');
  if(dock){
    const actions=dock.querySelector('footer div');if(actions&&!actions.querySelector('[data-v243-tactical-training]')){
      const btn=document.createElement('button');btn.type='button';btn.dataset.v243TacticalTraining='1';btn.className='v243-tactical-training';btn.textContent='Levar para Training';btn.addEventListener('click',()=>go('training'));actions.prepend(btn);
    }
    return;
  }
  const team=opponentContext();if(!team)return;
  const shell=document.querySelector('.tactical-shell');if(!shell||shell.querySelector('[data-v243-tactical-context]'))return;
  const anchor=shell.querySelector('.tactical-topline')||shell.firstElementChild;if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',`<section class="v243-handoff v243-tactical-context" data-v243-tactical-context><div><span>SCOUTING CONTEXT</span><h3>${esc(team)}</h3><p>Contexto de adversário carregado. O mapa permanece vazio até o coach marcar manualmente rotas, wards, zonas e objetivos.</p></div><div class="v243-handoff-actions"><button type="button" class="btn" data-v243-tactical-scout>Voltar ao Scouting</button></div></section>`);
  shell.querySelector('[data-v243-tactical-scout]')?.addEventListener('click',()=>go('scouting',{opponent:team}));
}

function noteOwner(notes){const owners=[...new Set(notes.map(n=>clean(n.player)||'TEAM'))];return owners.length===1&&ROLE_LABEL[owners[0]]?owners[0]:'TEAM';}
function plannerSummary(p){return p.notes.map(n=>`${fmt(n.time)} · ${clean(n.category)||'Nota'} · ${clean(n.note)||'Quadro tático'}`).join(' | ').slice(0,900);}
function trainingIntakeHTML(p){
  const team=clean(p.session.opponent)||opponentContext();
  return `<section class="v243-training-intake" data-v243-training-intake data-packet="${esc(`${p.session.id}:${p.notes.map(n=>n.id).join(',')}`)}"><header><div><span>EVIDENCE INTAKE · USER_PRIVATE</span><h3>${esc(p.session.title||'Pacote VOD/Tactical')}</h3><p>${team?`${esc(team)} · `:''}${p.notes.length} evidência${p.notes.length===1?'':'s'} selecionada${p.notes.length===1?'':'s'}. Preparar atividade apenas preenche o formulário; nada é salvo até você confirmar “Adicionar à semana”.</p></div><div class="v243-handoff-actions"><button type="button" class="btn primary" data-v243-prepare-training>Preparar atividade</button><button type="button" class="btn" data-v243-training-tactical>Voltar ao Tactical</button><button type="button" class="btn" data-v243-training-vod>Voltar ao VOD</button></div></header><div class="v243-intake-list">${p.notes.slice(0,6).map(n=>`<article><b>${fmt(n.time)}</b><span>${esc(n.category||'Nota')}</span><p>${esc(n.note||'Quadro tático sem comentário textual.')}</p><small>${esc(ROLE_LABEL[n.player]||n.player||ROLE_LABEL.TEAM)}</small></article>`).join('')}</div>${p.notes.length>6?`<footer>+ ${p.notes.length-6} evidência${p.notes.length-6===1?'':'s'} no pacote</footer>`:''}</section>`;
}
function prefillTraining(p){
  const type=document.querySelector('#tpType'),title=document.querySelector('#tpTitle'),notes=document.querySelector('#tpNotes'),owner=document.querySelector('#tpOwner');
  if(type)type.value='VOD';
  if(title)title.value=`Revisão VOD · ${clean(p.session.title)||'Pacote tático'}`;
  if(notes)notes.value=plannerSummary(p);
  if(owner)owner.value=noteOwner(p.notes);
  const target=title||document.querySelector('#trainingPlannerV16');target?.scrollIntoView({behavior:'smooth',block:'center'});target?.focus?.();
}
function decorateTraining(){
  if(route()!=='training')return;
  const p=pack();if(!p)return;
  const planner=document.querySelector('#trainingPlannerV16');if(!planner)return;
  const key=`${p.session.id}:${p.notes.map(n=>n.id).join(',')}`;const old=document.querySelector('[data-v243-training-intake]');if(old?.dataset.packet===key)return;old?.remove();
  planner.insertAdjacentHTML('beforebegin',trainingIntakeHTML(p));const root=document.querySelector('[data-v243-training-intake]');
  root?.querySelector('[data-v243-prepare-training]')?.addEventListener('click',()=>prefillTraining(p));
  root?.querySelector('[data-v243-training-tactical]')?.addEventListener('click',()=>go('tactical'));
  root?.querySelector('[data-v243-training-vod]')?.addEventListener('click',()=>go('vod',{vodSession:p.session.id}));
}

function apply(){ensureFlow();decorateChampionPool();decorateScouting();decorateDraft();decorateVod();decorateTactical();decorateTraining();}
let raf=0;
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(schedule);
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{subtree:true,childList:true});
schedule();
window.FROMBOS_V24_3_COMPETITIVE_WORKFLOW={apply,schedule,buildHash};
