// FROMBOS V22.7 — Series Command Center + Match Plan.
// Read-only layer over draft, Match Center, VOD, Tactical and materialized scouting evidence.
// No automatic pick/ban, no result inference and no competitive-state mutation.
import { store } from './store.js';
import { CHAMPIONS, ROLES } from './data.js';
import { portraitHTML } from './champion-intelligence.js';
import { OPEN_SERIES_PLAYERS } from './open-series-scouting.generated.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const same=(a,b)=>norm(a)===norm(b);
const maxGames=()=>store.state.draft?.format==='MD3'?3:5;
const games=()=>Array.from({length:maxGames()},(_,i)=>i+1);
const actionsFor=g=>store.state.draft?.games?.[g]?.actions||[];
const group=(g,side,type)=>actionsFor(g).filter(a=>a.side===side&&a.type===type).map(a=>a.champ);
const branchesFor=g=>(store.state.draft?.branches||[]).filter(b=>Number(b.game)===Number(g));
const fearlessLabel=mode=>mode==='global'?'GLOBAL':mode==='team'?'POR EQUIPE':'OFF';
const resultLabel=v=>v==='WIN'?'VITÓRIA':v==='LOSS'?'DERROTA':'NÃO INFORMADO';

function matchFor(game){
  const opponent=store.state.team?.opponent||'';
  return (store.state.matches?.games||[]).filter(m=>same(m.opponent,opponent)&&Number(m.gameNumber)===Number(game)).sort((a,b)=>`${b.date||''} ${b.time||''}`.localeCompare(`${a.date||''} ${a.time||''}`))[0]||null;
}
function state(game){
  const actions=actionsFor(game),picks=actions.filter(a=>a.type==='pick'),bans=actions.filter(a=>a.type==='ban');
  return {game,actions:actions.length,picks:picks.length,bans:bans.length,complete:actions.length>=20,blue:group(game,'blue','pick'),red:group(game,'red','pick'),match:matchFor(game),branches:branchesFor(game).length};
}
function targetGame(states){
  const active=Math.min(Math.max(Number(store.state.draft?.game)||1,1),maxGames());
  const activeState=states.find(s=>s.game===active);
  if(activeState&&!activeState.complete)return active;
  return states.find(s=>s.game>active&&!s.complete)?.game||states.find(s=>!s.complete)?.game||active;
}
function previousPicks(beforeGame,side=null){
  const mode=store.state.draft?.fearlessMode||'off',set=new Set();
  if(mode==='off')return set;
  for(let g=1;g<beforeGame;g++)for(const a of actionsFor(g)){
    if(a.type!=='pick')continue;
    if(mode==='global'||!side||a.side===side)set.add(a.champ);
  }
  return set;
}
function portraits(list,cls='v22-series-mini'){return list.length?list.map(c=>`<span title="${esc(c)}">${portraitHTML(c,cls)}</span>`).join(''):'<small>—</small>';}
function gameCard(s,target){
  const status=s.complete?'DRAFT COMPLETO':s.actions?'EM CONSTRUÇÃO':'SEM ESTADO';
  const match=s.match;
  return `<article class="v22-series-game" data-state="${s.complete?'complete':s.actions?'active':'empty'}" ${s.game===target?'data-target="1"':''}>
    <header><div><span>GAME ${s.game}</span><b>${status}</b></div><em>${s.actions}/20</em></header>
    <div class="v22-series-picks"><section><small>AZUL</small><div>${portraits(s.blue)}</div></section><section><small>VERMELHO</small><div>${portraits(s.red)}</div></section></div>
    <div class="v22-series-game-meta"><span>${s.picks} picks</span><span>${s.bans} bans</span><span>${s.branches} branch${s.branches===1?'':'es'}</span></div>
    <footer>${match?`<div><small>USER_PRIVATE · MATCH CENTER</small><b>${esc(resultLabel(match.result))}</b><span>${match.vodSessionId?'VOD vinculado':'sem VOD vinculado'}</span></div>`:'<div><small>MATCH CENTER</small><b>UNKNOWN</b><span>resultado não registrado</span></div>'}<button type="button" data-v22-series-focus="${s.game}">Ver card nativo</button></footer>
  </article>`;
}
function fearlessLedger(target){
  const mode=store.state.draft?.fearlessMode||'off';
  const blue=previousPicks(target,'blue'),red=previousPicks(target,'red'),global=previousPicks(target);
  const section=(label,set,tone)=>`<section data-tone="${tone}"><header><span>${label}</span><b>${set.size}</b></header><div>${set.size?[...set].map(c=>`<span title="${esc(c)}">${portraitHTML(c,'v22-series-ledger-img')}<small>${esc(c)}</small></span>`).join(''):'<em>Nenhum campeão consumido antes deste jogo.</em>'}</div><footer>${Math.max(0,CHAMPIONS.length-set.size)} do catálogo ainda não consumidos por esta regra.</footer></section>`;
  return `<section class="v22-series-panel"><div class="v22-series-panel-head"><div><span>FEARLESS DEPTH MAP</span><h3>Campeões consumidos antes da G${target}</h3></div><b>MODE · ${fearlessLabel(mode)}</b></div>${mode==='off'?'<div class="v22-series-empty">Fearless está desligado. Nenhum bloqueio entre jogos é aplicado pelo motor atual.</div>':`<div class="v22-series-ledger">${mode==='global'?section('GLOBAL · ambos os lados',global,'global'):section('NOSSO LADO · AZUL',blue,'blue')+section('ADVERSÁRIO · VERMELHO',red,'red')}</div>`}<p class="v22-series-note">Contagem descritiva do estado local da série. Não mede força, prioridade ou qualidade do pool.</p></section>`;
}
function referencePlan(target){
  const ref=store.state.draft?.referenceComp;const blocked=previousPicks(target,'blue');
  if(!ref?.lineup)return `<section class="v22-series-panel"><div class="v22-series-panel-head"><div><span>NEXT GAME PLAN</span><h3>Composição de referência</h3></div><b>USER_PRIVATE</b></div><div class="v22-series-empty">Nenhuma composição foi enviada ao Draft. Abra Composições para preparar uma referência.</div></section>`;
  const rows=ROLES.map(r=>({role:r,champ:ref.lineup[r.id]})).filter(x=>x.champ);
  return `<section class="v22-series-panel"><div class="v22-series-panel-head"><div><span>NEXT GAME PLAN · G${target}</span><h3>${esc(ref.name||'Composição de referência')}</h3></div><b>USER_PRIVATE</b></div><div class="v22-series-reference">${rows.map(({role,champ})=>{const isBlocked=blocked.has(champ);return `<article data-blocked="${isBlocked?'1':'0'}"><div>${portraitHTML(champ,'v22-series-reference-img')}</div><small>${esc(role.label)}</small><b>${esc(champ)}</b><em>${isBlocked?'FEARLESS BLOCKED':'AVAILABLE BY SERIES STATE'}</em></article>`;}).join('')}</div><p class="v22-series-note">Disponibilidade considera apenas o estado Fearless persistido. Bans e escolhas da G${target} ainda podem mudar a disponibilidade dentro do draft.</p></section>`;
}
function opponentSignals(){
  const opponent=store.state.team?.opponent||'',players=OPEN_SERIES_PLAYERS.filter(p=>same(p.team,opponent));
  return `<section class="v22-series-panel"><div class="v22-series-panel-head"><div><span>OPPONENT SIGNALS</span><h3>${esc(opponent||'Adversário')}</h3></div><b>${players.length?'OBSERVED_COMPETITIVE':'UNKNOWN'}</b></div>${players.length?`<div class="v22-series-signals">${players.map(p=>`<article><div>${p.favorite?portraitHTML(p.favorite,'v22-series-signal-img'):'<span>?</span>'}</div><small>OBSERVED FAVORITE</small><b>${esc(p.favorite||'UNKNOWN')}</b><span>${esc(p.name)}</span></article>`).join('')}</div><p class="v22-series-note">Favorito publicado não é tratado como ban priority, first pick ou champion pool completo.</p>`:'<div class="v22-series-empty">Sem favorito observado materializado para este adversário. O sinal permanece UNKNOWN.</div>'}</section>`;
}
function evidenceStack(target){
  const opponent=store.state.team?.opponent||'',vod=(store.state.vod?.sessions||[]).filter(s=>same(s.opponent,opponent)),tactical=store.state.tactical?.scenarios||[],match=matchFor(target),ref=store.state.draft?.referenceComp;
  const row=(label,state,detail)=>`<article data-evidence="${esc(state)}"><span>${esc(label)}</span><b>${esc(state)}</b><small>${esc(detail)}</small></article>`;
  return `<section class="v22-series-panel"><div class="v22-series-panel-head"><div><span>BETWEEN-GAME EVIDENCE STACK</span><h3>O que existe para preparar a G${target}</h3></div><b>EVIDENCE FIRST</b></div><div class="v22-series-evidence">${row('Draft da série',actionsFor(target).length?'USER_PRIVATE':'UNKNOWN',actionsFor(target).length?`${actionsFor(target).length}/20 ações na G${target}`:'sem estado para este jogo')}${row('Composição de referência',ref?'USER_PRIVATE':'UNKNOWN',ref?.name||'nenhuma composição selecionada')}${row('Match Center',match?'USER_PRIVATE':'UNKNOWN',match?`${resultLabel(match.result)} · ${match.vodSessionId?'VOD vinculado':'sem VOD'}`:'jogo ainda não registrado')}${row('VODs do adversário',vod.length?'USER_PRIVATE':'UNKNOWN',vod.length?`${vod.length} sessão(ões) local(is)`:'sem sessão compatível')}${row('Cenários táticos',tactical.length?'USER_PRIVATE':'UNKNOWN',tactical.length?`${tactical.length} cenário(s) local(is)`:'sem cenário salvo')}${row('Ban tendency adversária','UNKNOWN','exige drafts observados detalhados')}${row('Side draft bias','UNKNOWN','side competitivo não materializado')}${row('First-phase priority','UNKNOWN','não inferido a partir de favorito observado')}</div></section>`;
}
function commandActions(){return `<nav class="v22-series-actions"><button data-v22-series-go="draft">Abrir Draft ativo</button><button data-v22-series-go="comps">Composições</button><button data-v22-series-go="scouting">Scouting</button><button data-v22-series-go="vod">VOD Review</button><button data-v22-series-go="tactical">Tactical Board</button></nav>`;}
function html(){
  const draft=store.state.draft||{},states=games().map(state),target=targetGame(states),complete=states.filter(s=>s.complete).length,touched=states.filter(s=>s.actions).length;
  return `<section class="v22-series-command v22-reveal" data-v22-series-command>
    <header class="v22-series-hero"><div><span>SERIES COMMAND CENTER · V22.7</span><h2>${esc(draft.tournament||'Série')} · ${esc(draft.format||'MD5')}</h2><p>Prepare cada mapa com o estado real do Draft, Fearless, Match Center, VOD, Tactical e Scouting. Nada aqui escolhe campeão ou registra resultado automaticamente.</p></div><div><b>WILD RIFT ONLY</b><span>USER_PRIVATE</span><span>OBSERVED_COMPETITIVE</span><span>FROMBOS_STRUCTURAL</span><span>UNKNOWN STAYS UNKNOWN</span></div></header>
    <div class="v22-series-kpis"><article><small>JOGOS COM ESTADO</small><b>${touched}/${states.length}</b><span>draft persistido</span></article><article><small>DRAFTS COMPLETOS</small><b>${complete}</b><span>20 ações registradas</span></article><article><small>PREPARAÇÃO ATUAL</small><b>G${target}</b><span>próximo estado relevante</span></article><article><small>FEARLESS</small><b>${fearlessLabel(draft.fearlessMode||'off')}</b><span>regra persistida</span></article></div>
    ${commandActions()}
    <div class="v22-series-games">${states.map(s=>gameCard(s,target)).join('')}</div>
    <div class="v22-series-layout">${fearlessLedger(target)}${referencePlan(target)}${opponentSignals()}${evidenceStack(target)}</div>
    <footer><b>Boundary:</b> o Series Command Center é uma camada de leitura. Alterações de game ativo, picks, bans, resultados e evidências continuam sendo feitas nos módulos responsáveis.</footer>
  </section>`;
}
function signature(){
  const d=store.state.draft||{},matchCount=store.state.matches?.games?.length||0,vodCount=store.state.vod?.sessions?.length||0,tacticalCount=store.state.tactical?.scenarios?.length||0;
  return [d.format,d.fearlessMode,d.game,d.referenceComp?.id||'',matchCount,vodCount,tacticalCount,...games().map(g=>`${g}:${actionsFor(g).length}:${branchesFor(g).length}`)].join('|');
}
function bind(root){
  root.querySelectorAll('[data-v22-series-go]').forEach(b=>b.addEventListener('click',()=>{location.hash=`#/${b.dataset.v22SeriesGo}`;}));
  root.querySelectorAll('[data-v22-series-focus]').forEach(b=>b.addEventListener('click',()=>{document.querySelector(`[data-series-game="${b.dataset.v22SeriesFocus}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});}));
}
function apply(force=false){
  if(route()!=='series')return;
  const content=document.querySelector('.content');if(!content)return;
  const anchor=content.querySelector('.series-command-v20')||content.querySelector('.grid.cols-3');if(!anchor)return;
  const sig=signature(),old=content.querySelector('[data-v22-series-command]');if(old&&!force&&old.dataset.signature===sig)return;old?.remove();
  anchor.insertAdjacentHTML(anchor.classList.contains('series-command-v20')?'afterend':'beforebegin',html());const root=content.querySelector('[data-v22-series-command]');if(root){root.dataset.signature=sig;bind(root);}
}
const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(()=>apply());else{window.addEventListener('load',()=>apply());window.addEventListener('hashchange',()=>requestAnimationFrame(()=>apply(true)));}
queueMicrotask(()=>apply());
window.FROMBOS_V22_SERIES={apply};
