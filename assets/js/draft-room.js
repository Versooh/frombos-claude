import { CHAMPIONS, DRAFT_ORDER } from './data.js';
import { store } from './store.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tournamentOptions=['Scrim / Treino','FROMBOS Cup','Open Series','WRL','Custom'];

function ensureDraft(){
  store.update(s=>{
    const d=s.draft||(s.draft={});
    d.game=Number(d.game)||1; d.fearless=Boolean(d.fearless); d.tournament=d.tournament||'Scrim / Treino'; d.format=d.format||'MD5'; d.ruleset=d.ruleset||'ALTERNATING_5BAN_5PICK'; d.actions=Array.isArray(d.actions)?d.actions:[]; d.games=d.games&&typeof d.games==='object'?d.games:{}; d.branches=Array.isArray(d.branches)?d.branches:[];
    if(!d.games[d.game]) d.games[d.game]={actions:d.actions||[]};
    else d.actions=d.games[d.game].actions||[];
  });
}
function d(){return store.state.draft;}
function actions(){return [...(d().actions||[])].sort((a,b)=>a.step-b.step);}
function saveCurrent(){store.update(s=>{s.draft.games[s.draft.game]={...(s.draft.games[s.draft.game]||{}),actions:s.draft.actions.map(x=>({...x})),updatedAt:new Date().toISOString()};});}
function previousFearless(){
  const blocked=new Set();
  if(!d().fearless)return blocked;
  for(let g=1;g<d().game;g++) for(const a of d().games?.[g]?.actions||[]) if(a.type==='pick') blocked.add(a.champ);
  return blocked;
}
function nextStep(){const a=actions();const i=DRAFT_ORDER.findIndex((_,idx)=>!a.some(x=>x.step===idx));return i<0?null:i;}
function by(team,type){return actions().filter(a=>a.side===team&&a.type===type);}
function slotHTML(team,type,count){const list=by(team,type);return Array.from({length:count},(_,i)=>{const a=list[i];return `<div class="dr-slot ${type} ${a?'filled':''}"><small>${type==='ban'?'BAN':'PICK'} ${i+1}</small><b>${a?esc(a.champ):'—'}</b></div>`}).join('');}

export function draftRoomHTML(){
  ensureDraft(); const state=d(); const next=nextStep(); const step=next==null?null:DRAFT_ORDER[next]; const blocked=previousFearless();
  return `<div class="draft-pro">
    <div class="draft-command card">
      <div class="draft-context">
        <label>Campeonato<select class="select" id="drTournament">${tournamentOptions.map(x=>`<option ${x===state.tournament?'selected':''}>${x}</option>`).join('')}</select></label>
        <label>Formato<select class="select" id="drFormat"><option ${state.format==='MD3'?'selected':''}>MD3</option><option ${state.format==='MD5'?'selected':''}>MD5</option></select></label>
        <label>Fearless<select class="select" id="drFearless"><option value="off" ${!state.fearless?'selected':''}>Off</option><option value="on" ${state.fearless?'selected':''}>On · Global</option></select></label>
        <label>Ruleset<select class="select" id="drRuleset"><option value="ALTERNATING_5BAN_5PICK" selected>Alternado · 5 bans / 5 picks</option></select></label>
      </div>
      <div class="series-strip">${[1,2,3,4,5].map(g=>`<button class="series-game ${g===state.game?'active':''} ${state.games?.[g]?.actions?.length?'has-state':''}" data-game="${g}">G${g}</button>`).join('')}<button class="btn" id="drUndo">↶ Desfazer</button><button class="btn" id="drBranch">Salvar branch</button><button class="btn danger-outline" id="drReset">Novo draft</button></div>
    </div>
    <div class="draft-arena">
      <section class="draft-team-panel blue">
        <div class="draft-team-head"><div><span class="eyebrow">BLUE SIDE</span><h2>${esc(store.state.team.name)}</h2></div><span class="side-dot"></span></div>
        <div class="draft-section-label">BANS</div><div class="ban-grid">${slotHTML('blue','ban',5)}</div>
        <div class="draft-section-label">PICKS</div><div class="pick-stack">${slotHTML('blue','pick',5)}</div>
      </section>
      <section class="draft-center-panel card">
        <div class="draft-stage-head"><div class="eyebrow">G${state.game} · ${esc(state.tournament)}</div><h2>${step?`${step[0]==='blue'?'BLUE':'RED'} · ${step[1]==='ban'?'BAN':'PICK'}`:'DRAFT CONCLUÍDO'}</h2><p>${state.fearless?`${blocked.size} campeões bloqueados por Fearless de jogos anteriores.`:'Fearless desligado para esta série.'}</p></div>
        <div class="draft-sequence-pro">${DRAFT_ORDER.map((s,i)=>{const a=actions().find(x=>x.step===i);return `<div class="draft-seq-row ${i===next?'current':''} ${a?'done':''}"><span>${String(i+1).padStart(2,'0')}</span><b>${s[0]==='blue'?'BLUE':'RED'}</b><em>${s[1].toUpperCase()}</em><strong>${a?esc(a.champ):'—'}</strong></div>`}).join('')}</div>
        <div class="draft-branches"><div><span class="eyebrow">BRANCHES</span><p class="muted">Estados alternativos persistentes sem destruir a linha principal.</p></div><div class="branch-list">${state.branches.length?state.branches.slice(-4).map((b,i)=>`<button class="btn" data-branch="${b.id}">${esc(b.name||`Branch ${i+1}`)}</button>`).join(''):'<span class="muted">Nenhuma branch salva.</span>'}</div></div>
      </section>
      <section class="draft-team-panel red">
        <div class="draft-team-head"><div><span class="eyebrow">RED SIDE</span><h2>${esc(store.state.team.opponent)}</h2></div><span class="side-dot"></span></div>
        <div class="draft-section-label">BANS</div><div class="ban-grid">${slotHTML('red','ban',5)}</div>
        <div class="draft-section-label">PICKS</div><div class="pick-stack">${slotHTML('red','pick',5)}</div>
      </section>
    </div>
    <section class="champion-select card">
      <div class="champion-select-head"><div><span class="eyebrow">CHAMPION SELECT</span><h3>${step?'Escolha o próximo campeão':'Draft finalizado'}</h3></div><input class="input" id="drSearch" placeholder="Buscar campeão..." ${!step?'disabled':''}></div>
      <div class="draft-champ-grid" id="drChampGrid"></div>
      <div class="draft-evidence"><span><b>RULESET</b> alternado</span><span><b>PLAYER FIT</b> champion pool local</span><span><b>FEARLESS</b> série persistente</span><span><b>DADOS</b> sem win rate inventado</span></div>
    </section>
  </div>`;
}

export function bindDraftRoom(rerender){
  ensureDraft();
  const $=q=>document.querySelector(q); const state=d();
  function renderChampions(){const q=($('#drSearch')?.value||'').toLowerCase();const blocked=previousFearless();const used=new Set(actions().map(x=>x.champ));const next=nextStep();const step=next==null?null:DRAFT_ORDER[next];const pool=new Set(Object.values(store.state.team.players).flatMap(p=>p.pool||[]));$('#drChampGrid').innerHTML=CHAMPIONS.filter(c=>c.toLowerCase().includes(q)).map(c=>{const fearless=blocked.has(c), already=used.has(c), disabled=!step||fearless||already;return `<button class="draft-champ-card ${disabled?'disabled':''} ${pool.has(c)?'in-pool':''}" data-champ="${esc(c)}" ${disabled?'disabled':''}><span class="draft-champ-initial">${esc(c.split(/\s+/).map(x=>x[0]).slice(0,2).join(''))}</span><b>${esc(c)}</b>${fearless?'<small>FEARLESS · USED</small>':pool.has(c)?'<small>POOL DO TIME</small>':'<small>WILD RIFT</small>'}</button>`}).join('');document.querySelectorAll('[data-champ]').forEach(b=>b.onclick=()=>pick(b.dataset.champ));}
  function pick(champ){const next=nextStep();if(next==null)return;const step=DRAFT_ORDER[next];store.update(s=>{s.draft.actions.push({step:next,side:step[0],type:step[1],champ,createdAt:new Date().toISOString()});s.draft.games[s.draft.game]={...(s.draft.games[s.draft.game]||{}),actions:s.draft.actions.map(x=>({...x}))};});rerender();}
  $('#drSearch')?.addEventListener('input',renderChampions);
  document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{saveCurrent();const g=+b.dataset.game;store.update(s=>{s.draft.game=g;if(!s.draft.games[g])s.draft.games[g]={actions:[]};s.draft.actions=(s.draft.games[g].actions||[]).map(x=>({...x}));});rerender();});
  $('#drTournament').onchange=e=>store.update(s=>s.draft.tournament=e.target.value);$('#drFormat').onchange=e=>store.update(s=>{s.draft.format=e.target.value;s.team.format=e.target.value});$('#drFearless').onchange=e=>{store.update(s=>s.draft.fearless=e.target.value==='on');rerender();};
  $('#drUndo').onclick=()=>{store.update(s=>{s.draft.actions.pop();s.draft.games[s.draft.game]={...(s.draft.games[s.draft.game]||{}),actions:s.draft.actions.map(x=>({...x}))};});rerender();};
  $('#drReset').onclick=()=>{if(!confirm(`Limpar o draft da G${state.game}?`))return;store.update(s=>{s.draft.actions=[];s.draft.games[s.draft.game]={actions:[]};});rerender();};
  $('#drBranch').onclick=()=>{const name=prompt('Nome da branch:',`G${state.game} · Branch ${state.branches.length+1}`);if(!name)return;store.update(s=>s.draft.branches.push({id:crypto.randomUUID?.()||String(Date.now()),name,game:s.draft.game,actions:s.draft.actions.map(x=>({...x})),createdAt:new Date().toISOString()}));rerender();};
  document.querySelectorAll('[data-branch]').forEach(b=>b.onclick=()=>{const branch=d().branches.find(x=>x.id===b.dataset.branch);if(!branch)return;store.update(s=>{s.draft.game=branch.game;s.draft.actions=branch.actions.map(x=>({...x}));s.draft.games[s.draft.game]={actions:s.draft.actions.map(x=>({...x}))};});rerender();});
  renderChampions();
}
