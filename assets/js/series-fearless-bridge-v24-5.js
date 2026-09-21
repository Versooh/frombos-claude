// FROMBOS V24.5 — Series & Fearless State Bridge
// Shared Draft/Series state with explicit coach-controlled activation only.
// No automatic pick/ban, no competitive prediction and no Tactical map mutation.
import { store } from './store.js';
import { CHAMPIONS } from './data.js';
import { portraitHTML } from './champion-intelligence.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const maxGames=()=>store.state.draft?.format==='MD3'?3:5;
const gameList=()=>Array.from({length:maxGames()},(_,i)=>i+1);
const actionsFor=game=>store.state.draft?.games?.[game]?.actions||[];
const mode=()=>store.state.draft?.fearlessMode||(store.state.draft?.fearless?'global':'off');
const modeLabel=()=>mode()==='global'?'GLOBAL':mode()==='team'?'POR EQUIPE':'OFF';
const activeGame=()=>Math.min(Math.max(Number(store.state.draft?.game)||1,1),maxGames());

function gameState(game){
  const actions=actionsFor(game);
  const picks=actions.filter(a=>a.type==='pick');
  const bans=actions.filter(a=>a.type==='ban');
  return {game,actions:actions.length,picks:picks.length,bans:bans.length,complete:actions.length>=20};
}
function consumedBefore(game,side=null){
  const m=mode(),set=new Set();
  if(m==='off')return set;
  for(let g=1;g<game;g++){
    for(const action of actionsFor(g)){
      if(action.type!=='pick')continue;
      if(m==='global'||!side||action.side===side)set.add(action.champ);
    }
  }
  return set;
}
function consumedFor(game){
  if(mode()==='team')return {blue:consumedBefore(game,'blue'),red:consumedBefore(game,'red')};
  const global=consumedBefore(game);
  return {blue:global,red:global};
}
function nextGame(){
  const current=activeGame();
  if(!gameState(current).complete)return null;
  return current<maxGames()?current+1:null;
}
function cloneActions(list){return (list||[]).map(item=>({...item}));}

function activateGame(game){
  const target=Number(game);
  if(!Number.isInteger(target)||target<1||target>maxGames())return;
  if(store.state.draft?.activeBranchId){
    window.alert('Volte à linha principal do Draft antes de trocar o jogo da série.');
    return;
  }
  if(!window.confirm(`Ativar G${target} no Draft? Nenhum pick ou ban será executado automaticamente.`))return;
  store.update(state=>{
    const draft=state.draft||(state.draft={});
    draft.games=draft.games&&typeof draft.games==='object'?draft.games:{};
    if(!draft.games[target])draft.games[target]={actions:[]};
    draft.game=target;
    draft.actions=cloneActions(draft.games[target].actions);
  });
  location.hash='#/draft';
}

function championChips(set,tone){
  if(!set.size)return '<span class="v245-empty-chip">nenhum consumido</span>';
  return [...set].map(name=>`<span class="v245-champ-chip" data-tone="${tone}" title="${esc(name)}">${portraitHTML(name,'v245-chip-img')}<b>${esc(name)}</b></span>`).join('');
}
function fearlessSummary(game){
  const consumed=consumedFor(game);
  if(mode()==='off')return `<div class="v245-ledger-off"><b>FEARLESS OFF</b><span>Nenhum bloqueio entre jogos está ativo.</span></div>`;
  if(mode()==='global'){
    return `<div class="v245-ledger-block"><header><span>CONSUMIDOS ANTES DA G${game}</span><b>${consumed.blue.size}</b></header><div>${championChips(consumed.blue,'global')}</div><footer>${Math.max(0,CHAMPIONS.length-consumed.blue.size)} campeões do catálogo ainda não consumidos pela regra.</footer></div>`;
  }
  return `<div class="v245-ledger-split"><section><header><span>NOSSO LADO · AZUL</span><b>${consumed.blue.size}</b></header><div>${championChips(consumed.blue,'blue')}</div></section><section><header><span>ADVERSÁRIO · VERMELHO</span><b>${consumed.red.size}</b></header><div>${championChips(consumed.red,'red')}</div></section></div>`;
}
function referenceStatus(game){
  const ref=store.state.draft?.referenceComp;
  if(!ref?.lineup)return '<div class="v245-ref-empty">Nenhuma composição de referência enviada ao Draft.</div>';
  const blocked=consumedFor(game).blue;
  const rows=Object.entries(ref.lineup).filter(([,champ])=>champ).map(([role,champ])=>{
    const unavailable=blocked.has(champ);
    return `<article data-blocked="${unavailable?'1':'0'}"><small>${esc(role)}</small><div>${portraitHTML(champ,'v245-ref-img')}</div><b>${esc(champ)}</b><span>${unavailable?'INDISPONÍVEL PELO FEARLESS':'DISPONÍVEL PELO ESTADO DA SÉRIE'}</span></article>`;
  }).join('');
  return `<div class="v245-reference"><header><span>COMPOSIÇÃO DE REFERÊNCIA</span><b>${esc(ref.name||'USER_PRIVATE')}</b></header><div>${rows}</div></div>`;
}
function gameButtons(selected){
  return gameList().map(game=>{
    const s=gameState(game);
    return `<button type="button" class="v245-game-btn" data-v245-inspect="${game}" aria-pressed="${game===selected?'true':'false'}"><small>G${game}</small><b>${s.actions}/20</b><span>${s.complete?'COMPLETO':s.actions?'EM CURSO':'VAZIO'}</span></button>`;
  }).join('');
}

function draftBridgeHTML(){
  const current=activeGame(),state=gameState(current),next=nextGame();
  return `<section class="v245-draft-bridge" data-v245-draft-bridge>
    <div class="v245-bridge-copy"><span>SERIES & FEARLESS STATE BRIDGE · USER_PRIVATE</span><h3>G${current} · ${esc(store.state.draft?.format||'MD5')} · FEARLESS ${modeLabel()}</h3><p>O Draft e o Series Command leem o mesmo estado local. O histórico Fearless abaixo é descritivo e nunca escolhe campeão por você.</p></div>
    <div class="v245-bridge-kpis"><article><small>AÇÕES</small><b>${state.actions}/20</b></article><article><small>PICKS</small><b>${state.picks}</b></article><article><small>BANS</small><b>${state.bans}</b></article></div>
    <div class="v245-bridge-actions"><button type="button" class="btn" data-v245-go-series>Abrir Series Command</button>${next?`<button type="button" class="btn primary" data-v245-next-game="${next}">Preparar G${next}</button>`:''}</div>
    <div class="v245-bridge-ledger">${fearlessSummary(current)}</div>
    <footer><b>NO AUTO-PICK / AUTO-BAN.</b> Trocar de jogo apenas carrega o estado persistido daquela partida.</footer>
  </section>`;
}

let inspectedGame=null;
function seriesBridgeHTML(){
  const current=activeGame();
  const selected=Math.min(Math.max(Number(inspectedGame)||current,1),maxGames());
  const state=gameState(selected);
  return `<section class="v245-series-bridge" data-v245-series-bridge data-game="${selected}">
    <header><div><span>SERIES / FEARLESS SHARED STATE · V24.5</span><h3>Inspeção da G${selected}</h3><p>Escolha um jogo para revisar o estado Fearless. “Ativar no Draft” exige confirmação explícita e não executa nenhuma ação de draft.</p></div><div class="v245-status"><b>${esc(store.state.draft?.format||'MD5')}</b><span>FEARLESS ${modeLabel()}</span><span>${state.actions}/20 ações</span></div></header>
    <nav class="v245-game-strip" aria-label="Jogos da série">${gameButtons(selected)}</nav>
    <div class="v245-series-grid"><section><div class="v245-section-head"><span>FEARLESS LEDGER</span><b>ANTES DA G${selected}</b></div>${fearlessSummary(selected)}<p class="v245-boundary">Disponibilidade pela regra Fearless não representa força, prioridade, probabilidade de vitória ou recomendação automática.</p></section><section><div class="v245-section-head"><span>NEXT GAME REFERENCE</span><b>USER_PRIVATE</b></div>${referenceStatus(selected)}</section></div>
    <div class="v245-activate-row"><div><b>G${selected}</b><span>${state.complete?'Draft completo':state.actions?'Draft em construção':'Sem ações registradas'}</span></div><button type="button" class="btn primary" data-v245-activate="${selected}">Ativar G${selected} no Draft</button></div>
  </section>`;
}

function bindDraftBridge(root){
  root.querySelector('[data-v245-go-series]')?.addEventListener('click',()=>{location.hash='#/series';});
  root.querySelector('[data-v245-next-game]')?.addEventListener('click',event=>activateGame(event.currentTarget.dataset.v245NextGame));
}
function bindSeriesBridge(root){
  root.querySelectorAll('[data-v245-inspect]').forEach(button=>button.addEventListener('click',()=>{
    inspectedGame=Number(button.dataset.v245Inspect)||activeGame();
    renderSeries(true);
  }));
  root.querySelector('[data-v245-activate]')?.addEventListener('click',event=>activateGame(event.currentTarget.dataset.v245Activate));
}
function draftSignature(){
  const current=activeGame();
  return [store.state.draft?.format,mode(),current,store.state.draft?.activeBranchId||'',store.state.draft?.referenceComp?.id||'',...gameList().map(g=>actionsFor(g).map(a=>`${a.step}:${a.side}:${a.type}:${a.champ}`).join(','))].join('|');
}
function seriesSignature(){
  return [draftSignature(),inspectedGame||'',store.state.draft?.referenceComp?.name||''].join('|');
}
function renderDraft(force=false){
  if(route()!=='draft')return;
  const host=document.querySelector('.draft-pro'),anchor=host?.querySelector('.draft-command');
  if(!host||!anchor)return;
  const sig=draftSignature(),old=host.querySelector('[data-v245-draft-bridge]');
  if(old&&!force&&old.dataset.signature===sig)return;
  const wrap=document.createElement('div');wrap.innerHTML=draftBridgeHTML();const next=wrap.firstElementChild;next.dataset.signature=sig;
  old?old.replaceWith(next):anchor.insertAdjacentElement('afterend',next);
  bindDraftBridge(next);
}
function renderSeries(force=false){
  if(route()!=='series')return;
  const content=document.querySelector('.content[data-page="series"]')||document.querySelector('.content');
  const command=content?.querySelector('[data-v22-series-command]');
  if(!content||!command)return;
  const sig=seriesSignature(),old=content.querySelector('[data-v245-series-bridge]');
  if(old&&!force&&old.dataset.signature===sig)return;
  const wrap=document.createElement('div');wrap.innerHTML=seriesBridgeHTML();const next=wrap.firstElementChild;next.dataset.signature=sig;
  old?old.replaceWith(next):(command.querySelector('.v22-series-actions')||command.querySelector('.v22-series-kpis')||command.firstElementChild)?.insertAdjacentElement('afterend',next);
  bindSeriesBridge(next);
}
function apply(){
  document.body.classList.add('v245-series-fearless');
  document.body.dataset.v245Route=route();
  if(route()!=='series')inspectedGame=null;
  renderDraft();
  renderSeries();
}
let raf=0;
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;apply();});}
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
store.addEventListener?.('change',schedule);
const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe)runtime.subscribe(schedule);
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
schedule();

window.FROMBOS_V24_5_SERIES_FEARLESS_BRIDGE={apply,schedule,activateGame};
