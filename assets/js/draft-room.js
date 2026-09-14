import { CHAMPIONS, DRAFT_ORDER } from './data.js';
import { portraitHTML } from './champion-intelligence.js';
import { store } from './store.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tournamentOptions=['Scrim / Treino','FROMBOS Cup','Open Series','WRL','Custom'];
const maxGames=format=>format==='MD3'?3:5;

function ensureDraft(){
  store.update(s=>{
    const d=s.draft||(s.draft={});
    d.game=Number(d.game)||1;
    d.tournament=d.tournament||'Scrim / Treino';
    d.format=d.format||'MD5';
    d.ruleset=d.ruleset||'ALTERNATING_5BAN_5PICK';
    d.actions=Array.isArray(d.actions)?d.actions:[];
    d.games=d.games&&typeof d.games==='object'?d.games:{};
    d.branches=Array.isArray(d.branches)?d.branches:[];
    d.fearlessMode=['off','global','team'].includes(d.fearlessMode)?d.fearlessMode:(d.fearless?'global':'off');
    if(d.fearless===true&&d.fearlessMode==='off')d.fearlessMode='global';
    d.fearless=d.fearlessMode!=='off';
    d.activeBranchId=d.activeBranchId||null;
    d.branchOrigin=d.branchOrigin||null;
    const limit=maxGames(d.format);
    if(d.game>limit)d.game=limit;
    if(!d.games[d.game])d.games[d.game]={actions:d.actions||[]};
    if(!d.activeBranchId)d.actions=(d.games[d.game].actions||[]).map(x=>({...x}));
  });
}
function d(){return store.state.draft;}
function actions(){return [...(d().actions||[])].sort((a,b)=>a.step-b.step);}
function previousFearless(side=null){
  const blocked=new Set(),state=d();
  if(state.fearlessMode==='off')return blocked;
  for(let g=1;g<state.game;g++)for(const a of state.games?.[g]?.actions||[]){
    if(a.type!=='pick')continue;
    if(state.fearlessMode==='global'||!side||a.side===side)blocked.add(a.champ);
  }
  return blocked;
}
function nextStep(){const a=actions();const i=DRAFT_ORDER.findIndex((_,idx)=>!a.some(x=>x.step===idx));return i<0?null:i;}
function by(team,type){return actions().filter(a=>a.side===team&&a.type===type);}
function slotHTML(team,type,count){const list=by(team,type);return Array.from({length:count},(_,i)=>{const a=list[i];return `<div class="dr-slot ${type} ${a?'filled':''}">${a?`<div class="dr-slot-art">${portraitHTML(a.champ,'dr-slot-portrait')}</div>`:''}<div class="dr-slot-copy"><small>${type==='ban'?'BAN':'PICK'} ${i+1}</small><b>${a?esc(a.champ):'—'}</b></div></div>`}).join('');}
function persistActionState(sd){
  if(sd.activeBranchId){
    const b=sd.branches.find(x=>x.id===sd.activeBranchId);
    if(b){b.actions=sd.actions.map(x=>({...x}));b.updatedAt=new Date().toISOString();}
  }else{
    sd.games[sd.game]={...(sd.games[sd.game]||{}),actions:sd.actions.map(x=>({...x})),updatedAt:new Date().toISOString()};
  }
}
function leaveBranch(sd){
  if(!sd.activeBranchId)return;
  const origin=sd.branchOrigin;
  if(origin?.game){
    sd.games[origin.game]={...(sd.games[origin.game]||{}),actions:(origin.actions||[]).map(x=>({...x}))};
    if(sd.game===origin.game)sd.actions=(origin.actions||[]).map(x=>({...x}));
  }
  sd.activeBranchId=null;sd.branchOrigin=null;
}

export function draftRoomHTML(){
  ensureDraft();const state=d();const next=nextStep();const step=next==null?null:DRAFT_ORDER[next];
  const blocked=step?.[1]==='pick'?previousFearless(step[0]):new Set();
  const games=Array.from({length:maxGames(state.format)},(_,i)=>i+1);
  const gameBranches=state.branches.filter(b=>b.game===state.game);
  const fearlessLabel=state.fearlessMode==='global'?'Global':state.fearlessMode==='team'?'Por equipe':'Desligado';
  const fearlessText=state.fearlessMode==='off'?'Fearless desligado para esta série.':step?.[1]==='ban'?`Fearless ${fearlessLabel}: bans continuam disponíveis; a restrição é aplicada aos picks.`:`Fearless ${fearlessLabel}: ${blocked.size} campeão(ões) indisponíveis para este pick por jogos anteriores.`;
  return `<div class="draft-pro ${state.activeBranchId?'draft-branch-mode':''}">
    <div class="draft-command card">
      <div class="draft-context">
        <label>Campeonato<select class="select" id="drTournament">${tournamentOptions.map(x=>`<option ${x===state.tournament?'selected':''}>${x}</option>`).join('')}</select></label>
        <label>Formato<select class="select" id="drFormat"><option ${state.format==='MD3'?'selected':''}>MD3</option><option ${state.format==='MD5'?'selected':''}>MD5</option></select></label>
        <label>Fearless<select class="select" id="drFearless"><option value="off" ${state.fearlessMode==='off'?'selected':''}>Off</option><option value="global" ${state.fearlessMode==='global'?'selected':''}>Global</option><option value="team" ${state.fearlessMode==='team'?'selected':''}>Por equipe</option></select></label>
        <label>Regulamento<select class="select" id="drRuleset"><option value="ALTERNATING_5BAN_5PICK" selected>Alternado · 5 bans / 5 picks</option></select></label>
      </div>
      <div class="series-strip">${games.map(g=>`<button class="series-game ${g===state.game?'active':''} ${state.games?.[g]?.actions?.length?'has-state':''}" data-game="${g}">G${g}</button>`).join('')}<button class="btn" id="drUndo">↶ Desfazer</button><button class="btn" id="drBranch">Salvar plano alternativo</button>${state.activeBranchId?'<button class="btn info" id="drReturnMain">↩ Voltar à principal</button>':''}<button class="btn danger-outline" id="drReset">Novo draft</button></div>
      ${state.activeBranchId?`<div class="draft-branch-banner"><b>MODO PLANO ALTERNATIVO</b><span>A linha principal da G${state.branchOrigin?.game||state.game} está preservada. Mudanças feitas aqui ficam somente neste plano.</span></div>`:''}
    </div>
    <div class="draft-arena">
      <section class="draft-team-panel blue"><div class="draft-team-head"><div><span class="eyebrow">LADO AZUL</span><h2>${esc(store.state.team.name)}</h2></div><span class="side-dot"></span></div><div class="draft-section-label">BANIMENTOS</div><div class="ban-grid">${slotHTML('blue','ban',5)}</div><div class="draft-section-label">ESCOLHAS</div><div class="pick-stack">${slotHTML('blue','pick',5)}</div></section>
      <section class="draft-center-panel card">
        <div class="draft-stage-head"><div class="eyebrow">G${state.game} · ${esc(state.tournament)} · ${esc(state.format)}</div><h2>${step?`${step[0]==='blue'?'AZUL':'VERMELHO'} · ${step[1]==='ban'?'BANIMENTO':'ESCOLHA'}`:'DRAFT CONCLUÍDO'}</h2><p>${fearlessText}</p></div>
        <div class="draft-sequence-pro">${DRAFT_ORDER.map((s,i)=>{const a=actions().find(x=>x.step===i);return `<div class="draft-seq-row ${i===next?'current':''} ${a?'done':''}"><span>${String(i+1).padStart(2,'0')}</span><b>${s[0]==='blue'?'AZUL':'VERMELHO'}</b><em>${s[1]==='ban'?'BAN':'PICK'}</em><strong>${a?esc(a.champ):'—'}</strong></div>`}).join('')}</div>
        <div class="draft-branches"><div><span class="eyebrow">PLANOS ALTERNATIVOS</span><p class="muted">Explore respostas sem destruir a linha principal.</p></div><div class="branch-list">${gameBranches.length?gameBranches.slice(-6).map((b,i)=>`<button class="btn ${b.id===state.activeBranchId?'info':''}" data-branch="${b.id}">${esc(b.name||`Plano ${String.fromCharCode(65+i)}`)}</button>`).join(''):'<span class="muted">Nenhum plano alternativo salvo nesta partida.</span>'}</div></div>
      </section>
      <section class="draft-team-panel red"><div class="draft-team-head"><div><span class="eyebrow">LADO VERMELHO</span><h2>${esc(store.state.team.opponent)}</h2></div><span class="side-dot"></span></div><div class="draft-section-label">BANIMENTOS</div><div class="ban-grid">${slotHTML('red','ban',5)}</div><div class="draft-section-label">ESCOLHAS</div><div class="pick-stack">${slotHTML('red','pick',5)}</div></section>
    </div>
    <section class="champion-select card">
      <div class="champion-select-head"><div><span class="eyebrow">SELEÇÃO DE CAMPEÕES</span><h3>${step?'Escolha o próximo campeão':'Draft finalizado'}</h3><p class="muted">Retratos oficiais de Wild Rift, champion pool local e restrições Fearless aplicadas somente quando a ação é PICK.</p></div><input class="input" id="drSearch" placeholder="Buscar campeão..." ${!step?'disabled':''}></div>
      <div class="draft-champ-grid" id="drChampGrid"></div>
      <div class="draft-evidence"><span><b>ASSET</b> RIOT_OFFICIAL</span><span><b>PLAYER FIT</b> champion pool local</span><span><b>FEARLESS</b> série persistente</span><span><b>DADOS</b> sem win rate inventado</span></div>
    </section>
  </div>`;
}

export function bindDraftRoom(rerender){
  ensureDraft();const $=q=>document.querySelector(q);const state=d();
  function renderChampions(){
    const q=($('#drSearch')?.value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const used=new Set(actions().map(x=>x.champ));const next=nextStep();const step=next==null?null:DRAFT_ORDER[next];
    const blocked=step?.[1]==='pick'?previousFearless(step[0]):new Set();
    const pool=new Set(Object.values(store.state.team.players).flatMap(p=>p.pool||[]));const normalize=x=>x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    $('#drChampGrid').innerHTML=CHAMPIONS.filter(c=>normalize(c).includes(q)).map(c=>{const fearless=blocked.has(c),already=used.has(c),disabled=!step||fearless||already;return `<button class="draft-champ-card ${disabled?'disabled':''} ${pool.has(c)?'in-pool':''}" data-champ="${esc(c)}" ${disabled?'disabled':''}><div class="draft-champ-art">${portraitHTML(c,'draft-champ-portrait')}<span class="draft-champ-state">${fearless?'FEARLESS':pool.has(c)?'POOL':'WR'}</span></div><b>${esc(c)}</b>${fearless?'<small>INDISPONÍVEL · FEARLESS</small>':pool.has(c)?'<small>POOL DO TIME</small>':'<small>WILD RIFT</small>'}</button>`}).join('');
    document.querySelectorAll('[data-champ]').forEach(b=>b.onclick=()=>pick(b.dataset.champ));
  }
  function pick(champ){const next=nextStep();if(next==null)return;const step=DRAFT_ORDER[next];store.update(s=>{s.draft.actions.push({step:next,side:step[0],type:step[1],champ,createdAt:new Date().toISOString()});persistActionState(s.draft);});rerender();}
  $('#drSearch')?.addEventListener('input',renderChampions);
  document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{const g=+b.dataset.game;store.update(s=>{leaveBranch(s.draft);s.draft.game=g;if(!s.draft.games[g])s.draft.games[g]={actions:[]};s.draft.actions=(s.draft.games[g].actions||[]).map(x=>({...x}));});rerender();});
  $('#drTournament').onchange=e=>store.update(s=>s.draft.tournament=e.target.value);
  $('#drFormat').onchange=e=>{store.update(s=>{leaveBranch(s.draft);s.draft.format=e.target.value;s.team.format=e.target.value;const limit=maxGames(e.target.value);if(s.draft.game>limit)s.draft.game=limit;if(!s.draft.games[s.draft.game])s.draft.games[s.draft.game]={actions:[]};s.draft.actions=(s.draft.games[s.draft.game].actions||[]).map(x=>({...x}));});rerender();};
  $('#drFearless').onchange=e=>{store.update(s=>{s.draft.fearlessMode=e.target.value;s.draft.fearless=e.target.value!=='off';});rerender();};
  $('#drUndo').onclick=()=>{store.update(s=>{s.draft.actions.pop();persistActionState(s.draft);});rerender();};
  $('#drReset').onclick=()=>{if(!confirm(`Limpar o draft da G${state.game}?`))return;store.update(s=>{s.draft.actions=[];persistActionState(s.draft);});rerender();};
  $('#drBranch').onclick=()=>{const sameGame=state.branches.filter(x=>x.game===state.game).length;const letter=String.fromCharCode(65+Math.min(sameGame,25));const name=prompt('Nome do plano alternativo:',`G${state.game} · Plano ${letter}`);if(!name)return;store.update(s=>s.draft.branches.push({id:crypto.randomUUID?.()||String(Date.now()),name,game:s.draft.game,actions:s.draft.actions.map(x=>({...x})),createdAt:new Date().toISOString(),source:s.draft.activeBranchId?'BRANCH':'MAINLINE'}));rerender();};
  $('#drReturnMain')?.addEventListener('click',()=>{store.update(s=>leaveBranch(s.draft));rerender();});
  document.querySelectorAll('[data-branch]').forEach(b=>b.onclick=()=>{const branch=d().branches.find(x=>x.id===b.dataset.branch);if(!branch)return;store.update(s=>{if(!s.draft.activeBranchId)s.draft.branchOrigin={game:s.draft.game,actions:s.draft.actions.map(x=>({...x}))};s.draft.activeBranchId=branch.id;s.draft.game=branch.game;s.draft.actions=branch.actions.map(x=>({...x}));});rerender();});
  renderChampions();
}
